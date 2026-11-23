// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const script = fileURLToPath(new URL('./walls.ts', import.meta.url));

describe('scripts/walls.ts', () => {
  const dirs: string[] = [];
  /** A folder to use as PATH: empty, or holding a fake `walls` shell script. */
  const pathWith = (walls?: string) => {
    const dir = mkdtempSync(join(tmpdir(), 'walls-test-'));
    dirs.push(dir);
    if (walls !== undefined) writeFileSync(join(dir, 'walls'), walls, { mode: 0o755 });
    return dir;
  };
  const run = (env: Record<string, string>, ...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], { env, encoding: 'utf8' });

  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('fails with the install hint when walls is missing', () => {
    const result = run({ PATH: pathWith() });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('walls is not installed: run "npm link" in ~/Documents/walls');
  });

  it('still fails in CI: CI alone never skips the gate', () => {
    expect(run({ PATH: pathWith(), CI: 'true' }).status).toBe(1);
  });

  it('skips with a loud notice only when WALLS_OPTIONAL=1', () => {
    const result = run({ PATH: pathWith(), WALLS_OPTIONAL: '1' });

    expect(result.status).toBe(0);
    expect(result.stderr.trim()).toBe(
      'walls skipped: not installed; run `npm run walls` on a machine with walls',
    );
  });

  it('does not treat other WALLS_OPTIONAL values as optional', () => {
    expect(run({ PATH: pathWith(), WALLS_OPTIONAL: 'true' }).status).toBe(1);
    expect(run({ PATH: pathWith(), WALLS_OPTIONAL: '0' }).status).toBe(1);
  });

  it('turns the notice into a warning annotation in GitHub Actions', () => {
    const result = run({ PATH: pathWith(), WALLS_OPTIONAL: '1', GITHUB_ACTIONS: 'true' });

    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/^::warning::walls skipped: not installed/);
  });

  it('runs `walls check` with the extra arguments and passes its exit code through', () => {
    const fake = pathWith('#!/bin/sh\necho "walls $*"\nexit 3\n');
    const result = run({ PATH: fake, WALLS_OPTIONAL: '1' }, '--strict');

    expect(result.status).toBe(3);
    expect(result.stdout).toContain('walls check --strict');
  });
});
