import Docker from 'dockerode';

export const docker = new Docker({
    socketPath: process.env.SOCKET_PATH
});
