import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type AppInfo, appApi } from '@/api/app.ts';
import { errorMessage } from '@/api/invoke.ts';

/** Facts about the running app (version, build, data folder), loaded once at start. */
export const useAppStore = defineStore('app', () => {
  const info = ref<AppInfo | null>(null);
  const error = ref<string | null>(null);

  async function load(): Promise<boolean> {
    error.value = null;
    try {
      info.value = await appApi.info();
      return true;
    } catch (e) {
      error.value = errorMessage(e);
      return false;
    }
  }

  return { info, error, load };
});
