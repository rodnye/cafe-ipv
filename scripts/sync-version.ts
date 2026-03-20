/**
 * Version sync script.
 * Updates version numbers across README.md, android/variables.gradle, and package.json
 *
 * Usage: pnpm sync-version <version>
 * Example: pnpm sync-version 1.3.0
 */

import { readFile, writeFile } from 'node:fs/promises';
import { log, error as elog } from 'node:console';
import { exec } from './utils/exec';

const FILES: { filePath: string; regex: RegExp }[] = [
  { filePath: 'README.md', regex: /version[:\-]\s*([0-9]+\.[0-9]+\.[0-9]+)/ },
  {
    filePath: 'android/variables.gradle',
    regex: /versionName\s*=\s*'([0-9]+\.[0-9]+\.[0-9]+)'/,
  },
  {
    filePath: 'package.json',
    regex: /"version":\s*"([0-9]+\.[0-9]+\.[0-9]+)"/,
  },
];

//
const updateVersionInFile = async (
  filePath: string,
  regex: RegExp,
  newVersion: string
) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    const match = content.match(regex);

    if (!match) {
      log(`Version pattern not found in ${filePath}`);
      return false;
    }

    const updatedContent = content.replace(
      regex,
      match[0].replace(match[1], newVersion)
    );

    await writeFile(filePath, updatedContent, 'utf-8');
    log(`Updated ${filePath}: ${match[1]} -> ${newVersion}`);
    return true;
  } catch (error) {
    elog(`Failed to update ${filePath}:`, error);
    return false;
  }
};

const syncVersion = async () => {
  const args = process.argv.slice(2);
  const newVersion = args[0];

  if (!newVersion) {
    log('Please provide a version number');
    log('Usage: pnpm sync-version <version>');
    log('Example: pnpm sync-version 1.3.0');
    process.exit(1);
  }

  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    elog('Invalid version format. Use semantic versioning (e.g., 1.3.0)');
    process.exit(1);
  }

  log(`Syncing version ${newVersion} across all files...\n`);

  for (const { filePath, regex } of FILES)
    await updateVersionInFile(filePath, regex, newVersion);

  log('\nVersion sync completed!');

  // Git commit
  log('\nCreating git commit...');
  try {
    await exec('git', ['add', ...FILES.map(({ filePath }) => filePath)]);
    await exec('git', ['commit', '-m', `"bump: version to ${newVersion}"`]);
    log(`Committed version bump to ${newVersion}`);
  } catch (error) {
    log('Failed to create git commit. Make sure you have changes to commit.');
  }
};

syncVersion();
