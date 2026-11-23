/**
 * `npm run security`: runs `secbase check` (the security gate, see "Security" in AGENTS.md) on this
 * project and passes its exit code through; extra arguments go to secbase (`npm run security --
 * --strict`). secbase is installed once per machine: `npm link` in ~/Documents/secbase.
 *
 * Without secbase the step fails with the install hint, CI included, so an unchecked project never
 * looks green. Only `SECBASE_OPTIONAL=1`, set where secbase cannot be installed (the Docker
 * containers, GitHub workflows), turns that into a pass with a loud notice: run the step elsewhere.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

// No shell: the arguments are an array and reach secbase as they are.
const result = spawnSync('secbase', ['check', ...process.argv.slice(2)], {
  cwd: rootDir,
  stdio: 'inherit',
});

if (result.error && 'code' in result.error && result.error.code === 'ENOENT') {
  if (process.env.SECBASE_OPTIONAL === '1') {
    // In GitHub Actions the notice becomes a warning annotation on the run's summary page.
    const prefix = process.env.GITHUB_ACTIONS === 'true' ? '::warning::' : '';
    console.warn(
      `${prefix}secbase skipped: not installed; run \`npm run security\` on a machine with secbase`,
    );
    process.exit(0);
  }
  console.error('secbase is not installed: run "npm link" in ~/Documents/secbase');
  process.exit(1);
}
if (result.error) {
  console.error(`security: cannot run secbase: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
