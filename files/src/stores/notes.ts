import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { errorMessage } from '@/api/invoke.ts';
import { type CreateNoteInput, type Note, notesApi } from '@/api/notes.ts';

/**
 * Notes state for the UI. Pages call these actions; the store calls the API client.
 * Actions never throw: they return a success flag and expose the failure in `error`.
 */
export const useNotesStore = defineStore('notes', () => {
  const items = ref<Note[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  const count = computed(() => items.value.length);

  async function load(): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      items.value = await notesApi.list();
      loaded.value = true;
      return true;
    } catch (e) {
      error.value = errorMessage(e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function create(input: CreateNoteInput): Promise<boolean> {
    saving.value = true;
    error.value = null;
    try {
      const note = await notesApi.create(input);
      items.value = [note, ...items.value];
      return true;
    } catch (e) {
      error.value = errorMessage(e);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function remove(id: number): Promise<boolean> {
    error.value = null;
    try {
      await notesApi.remove(id);
      items.value = items.value.filter((note) => note.id !== id);
      return true;
    } catch (e) {
      error.value = errorMessage(e);
      return false;
    }
  }

  return { items, loading, saving, loaded, error, count, load, create, remove };
});
