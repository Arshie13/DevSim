import { docker } from "../client";

// Helper function to read a single file
export const readFile = async (filePath: string, containerId: string): Promise<{ path: string; content: string; error?: string }> => {
  const container = docker.getContainer(containerId);
  try {
    const exec = await container.exec({
      Cmd: ['cat', filePath],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const stream = await exec.start({ hijack: true });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      container.modem.demuxStream(
        stream,
        {
          write: (chunk: Buffer) => stdout.push(chunk),
          end: () => { }
        },
        {
          write: (chunk: Buffer) => stderr.push(chunk),
          end: () => { }
        }
      );

      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const content = Buffer.concat(stdout).toString('utf8');
    const errorOutput = Buffer.concat(stderr).toString('utf8');

    if (errorOutput && !content) {
      return { path: filePath, content, error: errorOutput.trim() };
    }

    return { path: filePath, content };
  } catch (error) {
    return { path: filePath, content: '', error: String(error) };
  }
};
