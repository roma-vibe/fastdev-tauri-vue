<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import { appName } from '@/config.ts';
import { useAppStore } from '@/stores/app.ts';

const app = useAppStore();

onMounted(() => {
  void app.load();
});
</script>

<template>
  <div class="flex h-full">
    <AppSidebar :app-name="appName" :version="app.info?.version" />
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- The title bar is transparent (tauri.conf.json): this strip moves the window. -->
      <div data-tauri-drag-region class="h-13 shrink-0" />
      <main class="min-h-0 flex-1 overflow-y-auto px-10 pb-10">
        <div class="mx-auto max-w-2xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
