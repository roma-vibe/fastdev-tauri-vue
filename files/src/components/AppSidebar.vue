<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  appName: string;
  version?: string;
}>();

// 20×20 outline icons (SVG path data).
const links = [
  {
    name: 'home',
    label: 'Home',
    icon: 'M3.5 9 10 3.75 16.5 9v7a.75.75 0 0 1-.75.75H12.5V12h-5v4.75H4.25A.75.75 0 0 1 3.5 16z',
  },
  {
    name: 'notes',
    label: 'Notes',
    icon: 'M5.5 3.25h9a1 1 0 0 1 1 1v11.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4.25a1 1 0 0 1 1-1zM7.5 7h5M7.5 10h5M7.5 13h3',
  },
] as const;
</script>

<template>
  <aside class="flex w-52 shrink-0 flex-col border-r border-line bg-sidebar select-none">
    <!-- Room for the window buttons (traffic lights); dragging it moves the window. -->
    <div data-tauri-drag-region class="h-13 shrink-0" />
    <p class="truncate px-4 pb-3 text-[13px] font-semibold" :title="appName">{{ appName }}</p>

    <nav class="flex flex-col gap-0.5 px-2" aria-label="Main">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-ink/5"
        exact-active-class="bg-accent-soft text-accent hover:bg-accent-soft"
      >
        <svg viewBox="0 0 20 20" fill="none" class="size-4 shrink-0" aria-hidden="true">
          <path
            :d="link.icon"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ link.label }}
      </RouterLink>
    </nav>

    <p v-if="version" class="mt-auto px-4 py-3 text-xs text-muted">Version {{ version }}</p>
  </aside>
</template>
