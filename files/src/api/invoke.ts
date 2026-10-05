/**
 * Calls Rust commands (#[tauri::command] in src-tauri/src). The ONLY module of the UI that
 * talks to Tauri; feature clients in this folder wrap it with types.
 */
import { type InvokeArgs, invoke, isTauri } from '@tauri-apps/api/core';

/** Error codes sent by the Rust side (src-tauri/src/error.rs), plus `unavailable` outside the app. */
export type ErrorCode = 'validation' | 'not_found' | 'internal' | 'unavailable';

export class ApiError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export async function call<T>(command: string, args?: InvokeArgs): Promise<T> {
  if (!isTauri()) {
    throw new ApiError(
      'unavailable',
      'Not running in the desktop app: start it with `npm run dev`, not in a browser.',
    );
  }
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw toApiError(error);
  }
}

/** Rust commands reject with { code, message } (AppError); anything else is internal. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const { code, message } = error as { code: unknown; message: unknown };
    if (isErrorCode(code) && typeof message === 'string') return new ApiError(code, message);
  }
  const message = error instanceof Error ? error.message : String(error);
  return new ApiError('internal', message);
}

function isErrorCode(value: unknown): value is ErrorCode {
  return (
    value === 'validation' ||
    value === 'not_found' ||
    value === 'internal' ||
    value === 'unavailable'
  );
}

/** A readable message for any thrown value (for stores and UI). */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
