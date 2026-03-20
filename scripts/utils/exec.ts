import { spawn } from 'node:child_process';

interface ExecOptions {
  capture?: boolean;
}

export const exec = (
  command: string,
  args: readonly string[],
  options?: ExecOptions
) => {
  const capture = options?.capture ?? false;

  return new Promise<string>((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    if (capture) {
      process.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      process.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    process.on('close', (code) => {
      if (code === 0) {
        resolve(capture ? stdout : '');
      } else {
        reject(
          new Error(capture ? stderr : `Command failed with code ${code}`)
        );
      }
    });

    process.on('error', reject);
  });
};
