// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readEnvFile } from './env.ts';

describe('readEnvFile', () => {
  const dirs: string[] = [];
  const folderWith = (env?: string) => {
    const dir = mkdtempSync(join(tmpdir(), 'env-test-'));
    dirs.push(dir);
    if (env !== undefined) writeFileSync(join(dir, '.env'), env);
    return dir;
  };

  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('reads .env the way it is written: quoted values literally, comments skipped', () => {
    const dir = folderWith(
      [
        '# App',
        `APP_NAME='Test "Shop" Магазин'`,
        `LITERAL='a $b #c'`,
        'WEB_PORT=1420',
        '',
        'EMPTY=',
      ].join('\n'),
    );

    expect(readEnvFile(dir)).toEqual({
      APP_NAME: 'Test "Shop" Магазин',
      LITERAL: 'a $b #c',
      WEB_PORT: '1420',
      EMPTY: '',
    });
  });

  it('fails with a hint when .env is missing', () => {
    expect(() => readEnvFile(folderWith())).toThrow('copy .env.example to .env');
  });
});
