// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { bundleName, settingsFromEnv, tauriConfigPatch, withConfig } from './tauri-config.ts';

const env = { APP_NAME: 'My App', APP_IDENTIFIER: 'com.example.my-app', WEB_PORT: '1455' };

describe('settingsFromEnv', () => {
  it('reads the Tauri settings from .env', () => {
    expect(settingsFromEnv(env)).toEqual({
      appName: 'My App',
      identifier: 'com.example.my-app',
      webPort: 1455,
      webToolchain: 'host',
    });
  });

  it('names the key to fix', () => {
    expect(() => settingsFromEnv({ ...env, APP_NAME: ' ' })).toThrow('APP_NAME');
    expect(() => settingsFromEnv({ ...env, APP_NAME: ' / ' })).toThrow('APP_NAME');
    expect(() => settingsFromEnv({ ...env, APP_IDENTIFIER: 'my_app' })).toThrow('APP_IDENTIFIER');
    expect(() => settingsFromEnv({ ...env, WEB_PORT: 'abc' })).toThrow('WEB_PORT');
    expect(() => settingsFromEnv({ ...env, WEB_TOOLCHAIN: 'vm' })).toThrow('WEB_TOOLCHAIN');
  });
});

describe('bundleName', () => {
  it('replaces characters a bundle name cannot contain', () => {
    expect(bundleName('Мой "магазин": A/B')).toBe('Мой магазин A B');
    expect(bundleName('  My App ')).toBe('My App');
  });
});

describe('tauriConfigPatch', () => {
  it('sets the name, identifier and dev server URL', () => {
    expect(tauriConfigPatch(settingsFromEnv(env))).toEqual({
      productName: 'My App',
      identifier: 'com.example.my-app',
      build: { devUrl: 'http://localhost:1455' },
    });
  });

  it('serves and builds the web UI in the dev container with WEB_TOOLCHAIN=docker', () => {
    const patch = tauriConfigPatch(settingsFromEnv({ ...env, WEB_TOOLCHAIN: 'docker' }));

    expect(patch.build).toEqual({
      devUrl: 'http://localhost:1455',
      beforeDevCommand: 'docker compose up dev',
      beforeBuildCommand: 'docker compose run --rm dev npm run build:web',
    });
  });
});

describe('withConfig', () => {
  const patch = { productName: 'X' };

  it('adds --config to commands that read the configuration', () => {
    expect(withConfig(['build', '--debug'], patch)).toEqual([
      'build',
      '--config',
      '{"productName":"X"}',
      '--debug',
    ]);
  });

  it('leaves other commands alone', () => {
    expect(withConfig(['icon', 'app-icon.svg'], patch)).toEqual(['icon', 'app-icon.svg']);
    expect(withConfig([], patch)).toEqual([]);
  });
});
