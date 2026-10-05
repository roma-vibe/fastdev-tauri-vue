<script setup lang="ts">
/** Presentational form: owns no data. The parent binds v-model:title / v-model:body and handles submit. */
defineProps<{
  busy?: boolean;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const title = defineModel<string>('title', { required: true });
const body = defineModel<string>('body', { required: true });
</script>

<template>
  <form
    class="space-y-2 rounded-xl border border-line bg-panel p-3"
    @submit.prevent="emit('submit')"
    @keydown.meta.enter.prevent="emit('submit')"
  >
    <label class="block">
      <span class="sr-only">Title</span>
      <input
        v-model="title"
        type="text"
        required
        maxlength="200"
        placeholder="Title"
        class="w-full rounded-md border border-line bg-window px-2.5 py-1.5 font-medium outline-none placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/25"
      />
    </label>
    <label class="block">
      <span class="sr-only">Body</span>
      <textarea
        v-model="body"
        rows="3"
        maxlength="10000"
        placeholder="Write something…"
        class="w-full resize-y rounded-md border border-line bg-window px-2.5 py-1.5 outline-none placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/25"
      />
    </label>
    <div class="flex items-center justify-end gap-3">
      <span class="text-xs text-muted">⌘↩ to add</span>
      <button
        type="submit"
        :disabled="busy || !title.trim()"
        class="rounded-md bg-accent px-3 py-1 text-[13px] font-medium text-white shadow-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
      >
        {{ busy ? 'Saving…' : 'Add Note' }}
      </button>
    </div>
  </form>
</template>
