//! Business rules of notes. No SQL and no Tauri types here: the service is plain Rust, easy to
//! test and to call from any command.

use super::{CreateNoteInput, Note, NotesRepository};
use crate::error::{AppError, AppResult};

pub const TITLE_MAX_CHARS: usize = 200;
pub const BODY_MAX_CHARS: usize = 10_000;

pub struct NotesService {
    repository: NotesRepository,
}

impl NotesService {
    pub fn new(repository: NotesRepository) -> Self {
        Self { repository }
    }

    pub fn list(&self) -> AppResult<Vec<Note>> {
        self.repository.list()
    }

    /// Creates a note from trimmed input; the title is required.
    pub fn create(&self, input: CreateNoteInput) -> AppResult<Note> {
        let title = input.title.trim();
        if title.is_empty() {
            return Err(AppError::Validation("Title must not be blank.".into()));
        }
        if title.chars().count() > TITLE_MAX_CHARS {
            return Err(AppError::Validation(format!(
                "Title must be at most {TITLE_MAX_CHARS} characters."
            )));
        }
        let body = input.body.trim();
        if body.chars().count() > BODY_MAX_CHARS {
            return Err(AppError::Validation(format!(
                "Text must be at most {BODY_MAX_CHARS} characters."
            )));
        }
        self.repository.insert(title, body)
    }

    pub fn delete(&self, id: i64) -> AppResult<()> {
        if self.repository.delete(id)? {
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Note {id} does not exist.")))
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use super::*;
    use crate::db::Database;

    fn service() -> NotesService {
        NotesService::new(NotesRepository::new(Arc::new(
            Database::in_memory().unwrap(),
        )))
    }

    fn input(title: &str, body: &str) -> CreateNoteInput {
        CreateNoteInput {
            title: title.into(),
            body: body.into(),
        }
    }

    #[test]
    fn creates_trimmed_notes() {
        let service = service();
        let note = service.create(input("  Groceries ", " Milk\n")).unwrap();

        assert_eq!(
            (note.title.as_str(), note.body.as_str()),
            ("Groceries", "Milk")
        );
        assert_eq!(service.list().unwrap(), vec![note]);
    }

    #[test]
    fn rejects_blank_and_too_long_titles() {
        let service = service();

        assert!(matches!(
            service.create(input("   ", "")),
            Err(AppError::Validation(_))
        ));
        let long = "x".repeat(TITLE_MAX_CHARS + 1);
        assert!(matches!(
            service.create(input(&long, "")),
            Err(AppError::Validation(_))
        ));
        // Limits count characters, not bytes.
        assert!(
            service
                .create(input(&"ж".repeat(TITLE_MAX_CHARS), ""))
                .is_ok()
        );
    }

    #[test]
    fn deleting_a_missing_note_is_not_found() {
        let service = service();
        let note = service.create(input("Note", "")).unwrap();

        service.delete(note.id).unwrap();
        assert!(matches!(
            service.delete(note.id),
            Err(AppError::NotFound(_))
        ));
    }
}
