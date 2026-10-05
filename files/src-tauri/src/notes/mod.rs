//! Notes, the example feature: create, list and delete short notes stored in SQLite.
//! `commands` (UI boundary) → `service` (rules) → `repository` (SQL), types in `model`.

pub mod commands;
mod model;
mod repository;
mod service;

pub use model::{CreateNoteInput, Note};
pub use repository::NotesRepository;
pub use service::NotesService;
