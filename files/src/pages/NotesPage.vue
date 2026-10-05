<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import ErrorBanner from '@/components/ErrorBanner.vue';
import NoteCard from '@/components/NoteCard.vue';
import NoteForm from '@/components/NoteForm.vue';
import { plural } from '@/lib/format.ts';
import { useNotesStore } from '@/stores/notes.ts';

const notes = useNotesStore();
const draft = reactive({ title: '', body: '' });

onMounted(() => {
  void notes.load();
});

async function createNote(): Promise<void> {
  if (!draft.title.trim() || notes.saving) return;
  if (await notes.create({ title: draft.title, body: draft.body })) {
    draft.title = '';
    draft.body = '';
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Notes</h1>
      <p class="text-muted">{{ plural(notes.count, 'note', 'notes') }}, saved on this Mac</p>
    </header>

    <ErrorBanner v-if="notes.error" :message="notes.error" />

    <NoteForm
      v-model:title="draft.title"
      v-model:body="draft.body"
      :busy="notes.saving"
      @submit="createNote"
    />

    <div v-if="notes.loading && !notes.loaded" class="space-y-2" aria-busy="true">
      <div v-for="n in 3" :key="n" class="h-16 animate-pulse rounded-xl bg-panel" />
    </div>
    <p
      v-else-if="notes.loaded && notes.count === 0"
      class="rounded-xl border border-dashed border-line px-4 py-10 text-center text-muted"
    >
      No notes yet. Add the first one above.
    </p>
    <ul v-else class="space-y-2">
      <li v-for="note in notes.items" :key="note.id">
        <NoteCard :note="note" @remove="notes.remove" />
      </li>
    </ul>
  </section>
</template>
