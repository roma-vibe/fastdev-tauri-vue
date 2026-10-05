//! Tauri commands of notes: the boundary between the UI (`src/api/notes.ts`) and the service.
//! Keep them thin: take arguments and state, call the service, return its result.
//! They are `async` so they run on a worker thread, never blocking the window.

use tauri::State;

use super::{CreateNoteInput, Note, NotesService};
use crate::error::AppResult;

#[tauri::command]
pub async fn list_notes(notes: State<'_, NotesService>) -> AppResult<Vec<Note>> {
    notes.list()
}

#[tauri::command]
pub async fn create_note(
    notes: State<'_, NotesService>,
    input: CreateNoteInput,
) -> AppResult<Note> {
    notes.create(input)
}

#[tauri::command]
pub async fn delete_note(notes: State<'_, NotesService>, id: i64) -> AppResult<()> {
    notes.delete(id)
}
