/**
 * `npm run dev`, `npm run build`, `npm run tauri -- <command>`: runs the Tauri CLI with the
 * settings from .env (see tauri-config.ts). Always go through it: calling `tauri` directly builds
 * the app with the placeholder name and identifier of src-tauri/tauri.conf.json.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readEnvFile } from './env.ts';
import { settingsFromEnv, tauriCli, tauriConfigPatch, withConfig } from './tauri-config.ts';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const BUNDLE_COMMANDS = new Set(['build', 'bundle']);

function fail(message: string): never {
  console.error(`tauri: ${message}`);
  process.exit(1);
}

let settings;
try {
  settings = settingsFromEnv(readEnvFile(rootDir));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const cli = tauriCli(rootDir, settings.webToolchain);
if (settings.webToolchain === 'host' && !existsSync(cli.command)) {
  fail('the Tauri CLI is not installed: run `npm install` first.');
}

const args = withConfig(process.argv.slice(2), tauriConfigPatch(settings));

const env = { ...process.env };
// The .dmg step styles its Finder window with AppleScript, which needs permission to control
// Finder and fails unattended (fastDev buttons, agents). Tauri skips it when CI is "true";
// `CI=false npm run build` gets the styled window.
if (BUNDLE_COMMANDS.has(args[0] ?? '') && env.CI !== 'false' && env.CI !== '0') {
  env.CI = 'true';
}

const child = spawn(cli.command, [...cli.args, ...args], { cwd: rootDir, stdio: 'inherit', env });

// Pass Ctrl+C and stop requests on to the CLI, then exit with its status.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => fail(`cannot start ${cli.command}: ${error.message}`));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
