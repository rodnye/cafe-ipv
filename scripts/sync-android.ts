/**
 * Android build script.
 * Runs `pnpm build` then removes the /dist/icons folder, which is not needed
 * for Android since icons are already in the native project.
 */
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { exec } from './utils/exec';
import { log } from 'node:console';

const syncAndroid = async () => {
  await exec('pnpm', ['build']);

  const iconsPath = join(process.cwd(), 'dist', 'icons');
  log('-> Removing unnesesary ' + iconsPath + '...');
  await rm(iconsPath, { recursive: true, force: true });

  log('-> Build completed and icons folder removed successfully');

  await exec('pnpm', ['capacitor', 'copy']);
  await exec('pnpm', ['capacitor', 'sync', 'android']);
};

syncAndroid();
