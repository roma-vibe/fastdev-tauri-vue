<script setup lang="ts">
import type { Note } from '@/api/notes.ts';
import { formatDateTime } from '@/lib/format.ts';

defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  remove: [id: number];
}>();
</script>

<template>
  <article class="group rounded-xl border border-line bg-window px-4 py-3">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 select-text">
        <h3 class="font-medium break-words">{{ note.title }}</h3>
        <p v-if="note.body" class="mt-1 break-words whitespace-pre-line text-muted">
          {{ note.body }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-danger-soft hover:text-danger focus-visible:opacity-100"
        :aria-label="`Delete note ${note.title}`"
        @click="emit('remove', note.id)"
      >
        <svg viewBox="0 0 20 20" fill="none" class="size-4" aria-hidden="true">
          <path
            d="M5.5 5.5l9 9M14.5 5.5l-9 9"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
    <p class="mt-2 text-xs text-muted">
      <time :datetime="note.createdAt">{{ formatDateTime(note.createdAt) }}</time>
    </p>
  </article>
</template>
