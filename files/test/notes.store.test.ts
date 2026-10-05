import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/invoke.ts';
import { type Note, notesApi } from '@/api/notes.ts';
import { useNotesStore } from '@/stores/notes.ts';

vi.mock('@/api/notes.ts', () => ({
  notesApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

function note(id: number, title: string): Note {
  return { id, title, body: '', createdAt: new Date().toISOString() };
}

describe('notes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it('loads notes', async () => {
    vi.mocked(notesApi.list).mockResolvedValue([note(1, 'One'), note(2, 'Two')]);
    const store = useNotesStore();

    expect(await store.load()).toBe(true);
    expect(store.count).toBe(2);
    expect(store.loaded).toBe(true);
    expect(store.loading).toBe(false);
  });

  it('adds a created note to the top of the list', async () => {
    vi.mocked(notesApi.list).mockResolvedValue([note(1, 'Old')]);
    vi.mocked(notesApi.create).mockResolvedValue(note(2, 'New'));
    const store = useNotesStore();
    await store.load();

    expect(await store.create({ title: 'New' })).toBe(true);
    expect(notesApi.create).toHaveBeenCalledWith({ title: 'New' });
    expect(store.items.map((item) => item.title)).toEqual(['New', 'Old']);
  });

  it('removes a deleted note', async () => {
    vi.mocked(notesApi.list).mockResolvedValue([note(1, 'One'), note(2, 'Two')]);
    vi.mocked(notesApi.remove).mockResolvedValue(null);
    const store = useNotesStore();
    await store.load();

    expect(await store.remove(1)).toBe(true);
    expect(store.items.map((item) => item.id)).toEqual([2]);
  });

  it('exposes errors instead of throwing', async () => {
    vi.mocked(notesApi.create).mockRejectedValue(
      new ApiError('validation', 'Title must not be blank.'),
    );
    const store = useNotesStore();

    expect(await store.create({ title: ' ' })).toBe(false);
    expect(store.error).toBe('Title must not be blank.');
    expect(store.saving).toBe(false);
  });
});
