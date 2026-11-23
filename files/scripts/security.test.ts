// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const script = fileURLToPath(new URL('./security.ts', import.meta.url));

describe('scripts/security.ts', () => {
  const dirs: string[] = [];
  /** A folder to use as PATH: empty, or holding a fake `secbase` shell script. */
  const pathWith = (secbase?: string) => {
    const dir = mkdtempSync(join(tmpdir(), 'security-test-'));
    dirs.push(dir);
    if (secbase !== undefined) writeFileSync(join(dir, 'secbase'), secbase, { mode: 0o755 });
    return dir;
  };
  const run = (env: Record<string, string>, ...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], { env, encoding: 'utf8' });

  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('fails with the install hint when secbase is missing', () => {
    const result = run({ PATH: pathWith() });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'secbase is not installed: run "npm link" in ~/Documents/secbase',
    );
  });

  it('still fails in CI: CI alone never skips the gate', () => {
    expect(run({ PATH: pathWith(), CI: 'true' }).status).toBe(1);
  });

  it('skips with a loud notice only when SECBASE_OPTIONAL=1', () => {
    const result = run({ PATH: pathWith(), SECBASE_OPTIONAL: '1' });

    expect(result.status).toBe(0);
    expect(result.stderr.trim()).toBe(
      'secbase skipped: not installed; run `npm run security` on a machine with secbase',
    );
  });

  it('does not treat other SECBASE_OPTIONAL values as optional', () => {
    expect(run({ PATH: pathWith(), SECBASE_OPTIONAL: 'true' }).status).toBe(1);
    expect(run({ PATH: pathWith(), SECBASE_OPTIONAL: '0' }).status).toBe(1);
  });

  it('turns the notice into a warning annotation in GitHub Actions', () => {
    const result = run({ PATH: pathWith(), SECBASE_OPTIONAL: '1', GITHUB_ACTIONS: 'true' });

    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/^::warning::secbase skipped: not installed/);
  });

  it('runs `secbase check` with the extra arguments and passes its exit code through', () => {
    const fake = pathWith('#!/bin/sh\necho "secbase $*"\nexit 3\n');
    const result = run({ PATH: fake, SECBASE_OPTIONAL: '1' }, '--strict');

    expect(result.status).toBe(3);
    expect(result.stdout).toContain('secbase check --strict');
  });
});
