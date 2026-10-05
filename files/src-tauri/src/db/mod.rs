//! SQLite: opening the database, connection settings and migrations.

use std::path::Path;
use std::sync::{Mutex, PoisonError};
use std::time::Duration;

use rusqlite::Connection;

use crate::error::AppResult;

/// Migrations in order; `PRAGMA user_version` stores how many have been applied.
/// Append new files; never edit, reorder or remove one that may have run somewhere.
const MIGRATIONS: &[&str] = &[include_str!("migrations/001_create_notes.sql")];

/// The app's SQLite connection, shared by the repositories. One call runs at a time.
pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    /// Opens (or creates) the database file and applies pending migrations.
    pub fn open(path: &Path) -> AppResult<Self> {
        if let Some(dir) = path.parent() {
            std::fs::create_dir_all(dir)?;
        }
        let conn = Connection::open(path)?;
        conn.pragma_update_and_check(None, "journal_mode", "WAL", |_| Ok(()))?;
        Self::init(conn)
    }

    /// A fresh, migrated in-memory database for tests.
    #[cfg(test)]
    pub fn in_memory() -> AppResult<Self> {
        Self::init(Connection::open_in_memory()?)
    }

    fn init(mut conn: Connection) -> AppResult<Self> {
        conn.pragma_update(None, "foreign_keys", true)?;
        conn.busy_timeout(Duration::from_secs(5))?;
        migrate(&mut conn)?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Runs `f` with the connection; repositories put all their SQL in such calls.
    pub fn with<T>(&self, f: impl FnOnce(&mut Connection) -> rusqlite::Result<T>) -> AppResult<T> {
        let mut conn = self.conn.lock().unwrap_or_else(PoisonError::into_inner);
        Ok(f(&mut conn)?)
    }
}

/// Applies the migrations that have not run yet, each in its own transaction.
fn migrate(conn: &mut Connection) -> rusqlite::Result<()> {
    let applied: i64 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
    for (index, sql) in MIGRATIONS.iter().enumerate() {
        let version = index as i64 + 1;
        if version <= applied {
            continue;
        }
        let tx = conn.transaction()?;
        tx.execute_batch(sql)?;
        tx.pragma_update(None, "user_version", version)?;
        tx.commit()?;
        log::info!("applied database migration {version}");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user_version(conn: &Connection) -> i64 {
        conn.pragma_query_value(None, "user_version", |row| row.get(0))
            .unwrap()
    }

    #[test]
    fn applies_every_migration_once() {
        let mut conn = Connection::open_in_memory().unwrap();
        migrate(&mut conn).unwrap();
        assert_eq!(user_version(&conn), MIGRATIONS.len() as i64);

        // Running again changes nothing.
        migrate(&mut conn).unwrap();
        assert_eq!(user_version(&conn), MIGRATIONS.len() as i64);
    }

    #[test]
    fn creates_the_notes_table() {
        let db = Database::in_memory().unwrap();
        let count: i64 = db
            .with(|conn| conn.query_row("SELECT count(*) FROM notes", [], |row| row.get(0)))
            .unwrap();
        assert_eq!(count, 0);
    }
}
