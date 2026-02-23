import Dockerode from 'dockerode';
import { Writable } from 'stream';

export async function streamContainer(exec: Dockerode.Exec, container: Dockerode.Container): Promise<{ output: string; errorOutput: string }> {
  const stream = await exec.start({});

  let output = '';
  let errorOutput = '';

  const stdout = new Writable({
    write(chunk, encoding, callback) {
      output += chunk.toString();
      callback();
    }
  });

  const stderr = new Writable({
    write(chunk, encoding, callback) {
      errorOutput += chunk.toString();
      callback();
    }
  });

  container.modem.demuxStream(stream, stdout, stderr);

  await new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
    setTimeout(() => reject(new Error('Timeout')), 10000); // 10s timeout
  });

  return { output, errorOutput };
}
