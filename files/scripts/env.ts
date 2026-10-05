/**
 * Reads the project's .env, the single source of configuration, with Node's built-in dotenv
 * parser (the one behind `node --env-file`). Used by vite.config.ts and scripts/tauri.ts, so both
 * sides see exactly the same values; it needs no npm package, so scripts/tauri.ts also runs when
 * node_modules lives in Docker.
 *
 * Values with spaces or quotes are single-quoted and taken literally: APP_NAME='My "Shop"'.
 * Values are never expanded ($VAR stays as is).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

export type Env = NodeJS.Dict<string>;

/** Reads `<rootDir>/.env`; fails with a hint when it does not exist. */
export function readEnvFile(rootDir: string): Env {
  const file = join(rootDir, '.env');
  if (!existsSync(file)) {
    throw new Error(`${file} is missing: copy .env.example to .env and set APP_NAME.`);
  }
  return parseEnv(readFileSync(file, 'utf8'));
}
