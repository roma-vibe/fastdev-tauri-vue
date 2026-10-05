/**
 * Turns .env into Tauri CLI arguments. src-tauri/tauri.conf.json keeps neutral placeholders
 * ("app", "com.example.app"); every CLI run gets the real values as a `--config` merge patch:
 *
 *   APP_NAME       → productName: window title, macOS menu bar and Dock, .app/.dmg name
 *                    (characters a bundle name cannot contain become spaces, see bundleName)
 *   APP_IDENTIFIER → identifier: bundle id, and the data folder of release builds
 *   WEB_PORT       → build.devUrl: the Vite dev server the dev window loads
 *   WEB_TOOLCHAIN  → "docker": the web UI is served and built by the `dev` compose service
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Env } from './env.ts';

export type WebToolchain = 'host' | 'docker';

export interface TauriSettings {
  /** APP_NAME as a valid bundle name. */
  appName: string;
  identifier: string;
  webPort: number;
  webToolchain: WebToolchain;
}

/** CLI commands that read the app configuration and accept `--config`. */
const CONFIG_COMMANDS = new Set(['dev', 'build', 'bundle']);

/** Validates the .env values Tauri needs; errors say which key to fix. */
export function settingsFromEnv(env: Env): TauriSettings {
  const appName = bundleName(env.APP_NAME ?? '');
  if (appName === '') {
    throw new Error('Set APP_NAME in .env.');
  }

  const identifier = env.APP_IDENTIFIER?.trim() ?? '';
  if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(identifier)) {
    throw new Error(
      'Set APP_IDENTIFIER in .env to a reverse domain such as com.example.my-app ' +
        '(letters, digits, "-", separated by ".").',
    );
  }

  const webPort = Number(env.WEB_PORT || 1420);
  if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535) {
    throw new Error(`WEB_PORT in .env must be a port number, got "${env.WEB_PORT ?? ''}".`);
  }

  const webToolchain = env.WEB_TOOLCHAIN || 'host';
  if (webToolchain !== 'host' && webToolchain !== 'docker') {
    throw new Error(`WEB_TOOLCHAIN in .env must be "host" or "docker", got "${webToolchain}".`);
  }

  return { appName, identifier, webPort, webToolchain };
}

/**
 * Tauri rejects / \ : * ? " < > | in productName (it names files); they become spaces, so any
 * project name works. The UI shows APP_NAME unchanged.
 */
export function bundleName(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The JSON merged into tauri.conf.json (RFC 7396 merge patch). */
export function tauriConfigPatch(settings: TauriSettings): Record<string, unknown> {
  const build: Record<string, string> = { devUrl: `http://localhost:${settings.webPort}` };
  if (settings.webToolchain === 'docker') {
    build.beforeDevCommand = 'docker compose up dev';
    build.beforeBuildCommand = 'docker compose run --rm dev npm run build:web';
  }
  return { productName: settings.appName, identifier: settings.identifier, build };
}

/** Inserts `--config <patch>` after the command when the command reads the configuration. */
export function withConfig(args: readonly string[], patch: Record<string, unknown>): string[] {
  const [command, ...rest] = args;
  if (command === undefined || !CONFIG_COMMANDS.has(command)) return [...args];
  return [command, '--config', JSON.stringify(patch), ...rest];
}

/**
 * The Tauri CLI to run: the project's own copy, or — when npm dependencies live in the dev
 * container — the same version from package-lock.json through npx (it runs on this Mac).
 */
export function tauriCli(
  rootDir: string,
  webToolchain: WebToolchain,
): { command: string; args: string[] } {
  if (webToolchain === 'host') {
    return { command: join(rootDir, 'node_modules', '.bin', 'tauri'), args: [] };
  }
  return { command: 'npx', args: ['--yes', `@tauri-apps/cli@${lockedVersion(rootDir)}`] };
}

function lockedVersion(rootDir: string): string {
  const lock = JSON.parse(readFileSync(join(rootDir, 'package-lock.json'), 'utf8')) as {
    packages?: Record<string, { version?: string }>;
  };
  const version = lock.packages?.['node_modules/@tauri-apps/cli']?.version;
  if (!version) {
    throw new Error('@tauri-apps/cli is missing from package-lock.json.');
  }
  return version;
}
