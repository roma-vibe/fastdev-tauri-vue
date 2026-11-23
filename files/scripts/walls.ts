/**
 * `npm run walls`: runs `walls check` (the quality gate, see "Quality walls" in AGENTS.md) on this
 * project and passes its exit code through; extra arguments go to walls (`npm run walls --
 * --strict`). walls is installed once per machine: `npm link` in ~/Documents/walls.
 *
 * Without walls the step fails with the install hint, CI included, so an unchecked project never
 * looks green. Only `WALLS_OPTIONAL=1`, set where walls cannot be installed (the Docker
 * containers, GitHub workflows), turns that into a pass with a loud notice: run the step elsewhere.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

// No shell: the arguments are an array and reach walls as they are.
const result = spawnSync('walls', ['check', ...process.argv.slice(2)], {
  cwd: rootDir,
  stdio: 'inherit',
});

if (result.error && 'code' in result.error && result.error.code === 'ENOENT') {
  if (process.env.WALLS_OPTIONAL === '1') {
    // In GitHub Actions the notice becomes a warning annotation on the run's summary page.
    const prefix = process.env.GITHUB_ACTIONS === 'true' ? '::warning::' : '';
    console.warn(
      `${prefix}walls skipped: not installed; run \`npm run walls\` on a machine with walls`,
    );
    process.exit(0);
  }
  console.error('walls is not installed: run "npm link" in ~/Documents/walls');
  process.exit(1);
}
if (result.error) {
  console.error(`walls: cannot run walls: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
