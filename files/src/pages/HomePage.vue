<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ErrorBanner from '@/components/ErrorBanner.vue';
import { appName } from '@/config.ts';
import { useAppStore } from '@/stores/app.ts';

const app = useAppStore();
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">{{ appName }}</h1>
      <p class="text-muted">A native macOS app: Vue draws this window, Rust does the work.</p>
    </header>

    <ErrorBanner v-if="app.error" :message="app.error" />

    <div class="rounded-xl border border-line bg-panel">
      <h2 class="px-4 pt-3 pb-1 text-xs font-medium text-muted">This build</h2>
      <dl v-if="app.info" class="divide-y divide-line">
        <div class="flex justify-between gap-6 px-4 py-2">
          <dt class="text-muted">Version</dt>
          <dd>{{ app.info.version }}</dd>
        </div>
        <div class="flex justify-between gap-6 px-4 py-2">
          <dt class="text-muted">Build</dt>
          <dd>{{ app.info.debug ? 'Development (debug)' : 'Release' }}</dd>
        </div>
        <div class="flex justify-between gap-6 px-4 py-2">
          <dt class="text-muted">Bundle identifier</dt>
          <dd class="select-text">{{ app.info.identifier }}</dd>
        </div>
        <div class="flex justify-between gap-6 px-4 py-2">
          <dt class="shrink-0 text-muted">Data folder</dt>
          <dd class="min-w-0 text-right font-mono text-xs break-all select-text">
            {{ app.info.dataDir }}
          </dd>
        </div>
      </dl>
      <p v-else class="px-4 py-2 text-muted">Loading…</p>
    </div>

    <RouterLink
      :to="{ name: 'notes' }"
      class="block rounded-xl border border-line bg-panel px-4 py-3 transition-colors hover:border-accent"
    >
      <p class="font-medium">Notes <span aria-hidden="true">→</span></p>
      <p class="mt-1 text-muted">
        The example feature: a Vue page and a Pinia store call Rust commands, which keep the notes
        in SQLite.
      </p>
    </RouterLink>
  </section>
</template>
