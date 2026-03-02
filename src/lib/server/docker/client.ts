import Docker from 'dockerode';

// Configure Docker client based on platform
// Windows uses named pipe, Linux/Mac use Unix socket
const isWindows = process.platform === 'win32';

const dockerOptions: ConstructorParameters<typeof Docker>[0] = isWindows
  ? { socketPath: '//./pipe/docker_engine' }
  : { socketPath: '/var/run/docker.sock' };

export const docker = new Docker(dockerOptions);
