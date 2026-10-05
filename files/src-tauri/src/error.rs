//! One error type for commands, services and repositories. The UI receives it as
//! `{ code, message }` (`ApiError` in src/api/invoke.ts).

use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    /// Invalid input; the message is shown to the user as is.
    #[error("{0}")]
    Validation(String),
    /// The requested item does not exist; the message is shown to the user as is.
    #[error("{0}")]
    NotFound(String),
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("file system error: {0}")]
    Io(#[from] std::io::Error),
}

/// Message sent to the UI instead of the details of internal errors.
const INTERNAL_MESSAGE: &str = "Something went wrong. The details are in the app log.";

impl AppError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::Validation(_) => "validation",
            Self::NotFound(_) => "not_found",
            Self::Database(_) | Self::Io(_) => "internal",
        }
    }
}

impl Serialize for AppError {
    /// Called when a command returns the error to the UI: internal errors are logged with their
    /// details and reach the UI only as a generic message.
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let message = match self {
            Self::Validation(message) | Self::NotFound(message) => message.as_str(),
            Self::Database(_) | Self::Io(_) => {
                log::error!("{self}");
                INTERNAL_MESSAGE
            }
        };
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("code", self.code())?;
        state.serialize_field("message", message)?;
        state.end()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn user_errors_keep_their_message() {
        let json =
            serde_json::to_value(AppError::Validation("Title must not be blank.".into())).unwrap();
        assert_eq!(
            json,
            serde_json::json!({ "code": "validation", "message": "Title must not be blank." })
        );
    }

    #[test]
    fn internal_errors_hide_details() {
        let error = AppError::Database(rusqlite::Error::InvalidQuery);
        let json = serde_json::to_value(error).unwrap();
        assert_eq!(
            json,
            serde_json::json!({ "code": "internal", "message": INTERNAL_MESSAGE })
        );
    }
}
