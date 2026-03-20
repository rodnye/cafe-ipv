import { spawn } from 'node:child_process';

// spaw inherit
export const exec = (command: string, args: readonly string[]) => {
  const buildProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  return new Promise<void>((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });

    buildProcess.on('error', (err) => {
      reject(err);
    });
  });
};
