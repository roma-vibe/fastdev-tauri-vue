import { call } from './invoke.ts';

/** Mirrors `AppInfo` in src-tauri/src/app_info.rs. Keep both in sync. */
export interface AppInfo {
  name: string;
  version: string;
  identifier: string;
  /** True for `npm run dev` (debug) builds, false for release builds. */
  debug: boolean;
  /** Folder with the SQLite database and other app data. */
  dataDir: string;
}

export const appApi = {
  info: () => call<AppInfo>('get_app_info'),
};
