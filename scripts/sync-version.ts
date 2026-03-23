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

const createVersionReplacement =
  (regex: RegExp) => (content: string, newVersion: string) => {
    const match = content.match(regex);

    if (!match) {
      throw new Error(`Version pattern not found`);
    }

    return content.replace(regex, match[0].replace(match[1], newVersion));
  };

const FILES: {
  filePath: string;
  modifier: (content: string, newVersion: string) => string;
}[] = [
  {
    filePath: 'README.md',
    modifier: createVersionReplacement(
      /version[:\-]\s*([0-9]+\.[0-9]+\.[0-9]+)/
    ),
  },
  {
    filePath: 'android/variables.gradle',
    modifier: (content, newVersion) => {
      content = createVersionReplacement(
        /versionName\s*=\s*'([0-9]+\.[0-9]+\.[0-9]+)'/
      )(content, newVersion);

      // bump version code + 1
      const regex = /versionCode\s*=\s*([0-9]+)/;
      const match = content.match(regex);
      if (!match || !match[1]) {
        throw new Error(`Version code pattern not found`);
      }
      content = content.replace(
        regex,
        match[0].replace(
          match[1],
          // the version code + 1
          (parseInt(match[1]) + 1).toString()
        )
      );

      return content;
    },
  },
  {
    filePath: 'package.json',
    modifier: createVersionReplacement(
      /"version":\s*"([0-9]+\.[0-9]+\.[0-9]+)"/
    ),
  },
];

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

  for (const { filePath, modifier } of FILES) {
    try {
      const content = await readFile(filePath, 'utf-8');
      await writeFile(filePath, modifier(content, newVersion), 'utf-8');

      log(`Updated ${filePath} -> ${newVersion}`);
    } catch (error) {
      elog(`Failed to update ${filePath}:`, error);
    }
  }

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
