use serde::{Deserialize, Serialize};

/// A stored note. Mirrored by `Note` in src/api/notes.ts: change both together.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: i64,
    pub title: String,
    pub body: String,
    /// ISO 8601 UTC timestamp, e.g. `2026-09-30T12:00:00.000Z`.
    pub created_at: String,
}

/// Input of `create_note`. Mirrored by `CreateNoteInput` in src/api/notes.ts.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateNoteInput {
    pub title: String,
    #[serde(default)]
    pub body: String,
}
