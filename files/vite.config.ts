import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { type Env, readEnvFile } from './scripts/env.ts';

/** The project root holds the single .env (scripts/tauri.ts reads it the same way). */
const rootDir = fileURLToPath(new URL('.', import.meta.url));

/**
 * The ONLY .env keys exposed to the web UI, as import.meta.env.<KEY> (typed in src/env.d.ts).
 * The bundle ships inside the app and can be read by anyone: never add secrets here.
 */
const PUBLIC_ENV_KEYS = ['APP_NAME'] as const;

export default defineConfig(() => {
  // Every key is available to this config; only PUBLIC_ENV_KEYS reach the bundle.
  const env = readEnvFile(rootDir);
  const missing = PUBLIC_ENV_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Set ${missing.join(', ')} in ${rootDir}.env`);
  }

  // The dev window loads http://localhost:WEB_PORT (scripts/tauri.ts sets Tauri's devUrl).
  const port = Number(env.WEB_PORT || 1420);
  // WEB_HOST is set to 0.0.0.0 by the dev container (docker-compose.yml) so its published port works.
  const host = process.env.WEB_HOST || 'localhost';
  // Set by the Tauri CLI for `npm run build -- --debug`.
  const debugBuild = Boolean(process.env.TAURI_ENV_DEBUG);

  return {
    plugins: [vue(), tailwindcss(), htmlEnv(env)],
    define: Object.fromEntries(
      PUBLIC_ENV_KEYS.map((key) => [`import.meta.env.${key}`, JSON.stringify(env[key])]),
    ),
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    // Keep the Rust compiler output visible: `npm run dev` shares the terminal with Vite.
    clearScreen: false,
    server: {
      host,
      port,
      strictPort: true,
      // Rust sources are watched by the Tauri CLI. data/ holds the dev database: without this,
      // every write to it would reload the window.
      watch: { ignored: ['**/src-tauri/**', '**/data/**', '**/dist/**'] },
    },
    build: {
      // The macOS WebView is Safari's engine; the app requires macOS 14 (Safari 17).
      target: 'safari17',
      outDir: 'dist',
      emptyOutDir: true,
      minify: !debugBuild,
      sourcemap: debugBuild,
    },
    test: {
      environment: 'happy-dom',
      include: ['test/**/*.test.ts', 'scripts/**/*.test.ts'],
    },
  };
});

/** Replaces %KEY% placeholders of public env keys in index.html (HTML-escaped). */
function htmlEnv(env: Env): Plugin {
  const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  return {
    name: 'html-public-env',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        PUBLIC_ENV_KEYS.reduce(
          // A replacer function: `$&`, `$$`… in a name are inserted as written, not as patterns.
          (result, key) => result.replaceAll(`%${key}%`, () => escape(env[key] ?? '')),
          html,
        ),
    },
  };
}
