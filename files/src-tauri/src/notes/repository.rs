//! All SQL of the notes feature. Parameters are always bound (`?1`), never formatted into SQL.

use std::sync::Arc;

use rusqlite::{Row, params};

use super::Note;
use crate::db::Database;
use crate::error::AppResult;

const COLUMNS: &str = "id, title, body, created_at";

pub struct NotesRepository {
    db: Arc<Database>,
}

impl NotesRepository {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// All notes, newest first.
    pub fn list(&self) -> AppResult<Vec<Note>> {
        self.db.with(|conn| {
            let mut statement = conn.prepare_cached(&format!(
                "SELECT {COLUMNS} FROM notes ORDER BY created_at DESC, id DESC"
            ))?;
            statement.query_map([], note_from_row)?.collect()
        })
    }

    pub fn insert(&self, title: &str, body: &str) -> AppResult<Note> {
        self.db.with(|conn| {
            conn.query_row(
                &format!("INSERT INTO notes (title, body) VALUES (?1, ?2) RETURNING {COLUMNS}"),
                params![title, body],
                note_from_row,
            )
        })
    }

    /// Returns false when there is no note with this id.
    pub fn delete(&self, id: i64) -> AppResult<bool> {
        self.db
            .with(|conn| Ok(conn.execute("DELETE FROM notes WHERE id = ?1", [id])? > 0))
    }
}

fn note_from_row(row: &Row<'_>) -> rusqlite::Result<Note> {
    Ok(Note {
        id: row.get("id")?,
        title: row.get("title")?,
        body: row.get("body")?,
        created_at: row.get("created_at")?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn repository() -> NotesRepository {
        NotesRepository::new(Arc::new(Database::in_memory().unwrap()))
    }

    #[test]
    fn inserts_and_lists_newest_first() {
        let repo = repository();
        let first = repo.insert("First", "").unwrap();
        let second = repo.insert("Second", "Body").unwrap();

        assert_eq!(second.body, "Body");
        assert!(
            second.created_at.ends_with('Z'),
            "UTC timestamp: {}",
            second.created_at
        );
        assert_eq!(repo.list().unwrap(), vec![second, first]);
    }

    #[test]
    fn deletes_by_id() {
        let repo = repository();
        let note = repo.insert("Note", "").unwrap();

        assert!(repo.delete(note.id).unwrap());
        assert!(!repo.delete(note.id).unwrap());
        assert!(repo.list().unwrap().is_empty());
    }
}
