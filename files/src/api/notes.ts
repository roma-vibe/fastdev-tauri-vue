import { call } from './invoke.ts';

/** Mirrors src-tauri/src/notes/model.rs. Keep both in sync. */
export interface Note {
  id: number;
  title: string;
  body: string;
  /** ISO 8601 UTC timestamp. */
  createdAt: string;
}

export interface CreateNoteInput {
  title: string;
  body?: string;
}

export const notesApi = {
  list: () => call<Note[]>('list_notes'),
  create: (input: CreateNoteInput) => call<Note>('create_note', { input }),
  remove: (id: number) => call<null>('delete_note', { id }),
};
