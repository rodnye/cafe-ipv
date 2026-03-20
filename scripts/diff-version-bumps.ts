/**
 * Shows git diff between the last two "bump: version to" commits.
 * Used for release generation
 */
import { log } from 'console';
import { exec } from './utils/exec';

const diffVersionBumps = async () => {
  // Get the last two bump commits
  const commits = await exec(
    'git',
    ['log', '--format=%H', '--grep="^bump: version to"', '-n', '2'],
    { capture: true }
  );

  const [latest, previous] = commits.trim().split('\n');
  log(latest, previous);
  if (!latest || !previous) {
    throw new Error('Need at least two version bump commits');
  }

  await exec('git', ['diff', previous, latest]);
};

diffVersionBumps();
