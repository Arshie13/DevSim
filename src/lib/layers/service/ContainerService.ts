import { docker } from '$lib/server/docker/client';
import { pickPreviewHostPortWithProbe } from '$lib/server/docker/preview-port';
import * as crypto from 'crypto';
import { Writable } from 'stream';

export interface CreateContainerParams {
  userId: string;
  stackName: string;
  level: number;
  stacks: Array<{ stackName: string }>;
  scenarioId?: string;
  projectFolder?: string;
  mode?: string;
}

export interface CreateContainerResult {
  id: string;
  ports: {
    backend: string | undefined;
    frontend: string | undefined;
    database: string | undefined;
  };
}

interface InspectResult {
  info: {
    Config: { Labels: Record<string, string> };
    State: { Running: boolean };
    NetworkSettings: { Ports: Record<string, Array<{ HostIp: string; HostPort: string }> | null> | undefined };
  };
}

export class ContainerService {
  async findByLabels(userId: string, stackName: string, level: number) {
    const containers = await docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: [
          `devsim.userId=${userId}`,
          `devsim.stack=${stackName}`,
          `devsim.level=${level}`
        ]
      })
    });

    return containers.length > 0 ? containers[0] : null;
  }

  async ensureRunning(containerId: string) {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    if (!info.State.Running) {
      await container.start();
    }

    return info;
  }

  /**
   * Resolve which image/volume to use for a container.
   * Returns: { imageToUse, volumeMount, scenarioFolder }
   */
  async resolveImageAndVolume(stackName: string, level: number, scenarioId?: string, projectFolder?: string, mode?: string) {
    const scenarioFolder = scenarioId ?? `scenario-${level}`;
    const volumeName = `${stackName.toLowerCase().replace(/[_ ]+/g, '-')}-${scenarioFolder}`;

    let imageToUse = 'devsim-workspace:latest';
    let useVolume = false;
    let volumeMount: string | null = null;

    const imageBase = stackName.toLowerCase().replace(/[_ ]+/g, '-');
    const customImageName = mode === 'tutorial'
      ? `devsim-project-tutorial:${imageBase}-tutorial`
      : projectFolder
        ? `devsim-project:${imageBase}-${scenarioFolder}-${projectFolder.toLowerCase().replace(/[_ ]+/g, '-')}`
        : `devsim-project:${imageBase}-${scenarioFolder}`;

    try {
      await docker.getImage(customImageName).inspect();
      imageToUse = customImageName;
      useVolume = false;
    } catch {
      try {
        await docker.getVolume(volumeName).inspect();
        useVolume = true;
        volumeMount = `${volumeName}:/workspace`;
      } catch {
        useVolume = false;
        const bindPath = `${process.cwd()}/submodules/projects/tech-stacks/${stackName}/${scenarioFolder}:/workspace`;
        volumeMount = bindPath.replace(/\\/g, '/');
      }
    }

    return {
      imageToUse,
      volumeMount: useVolume ? volumeMount : null,
      bindMount: !useVolume ? volumeMount : null,
      scenarioFolder,
      volumeName
    };
  }

  /**
   * Create a fresh workspace container with all necessary configuration.
   */
  async createContainer(params: CreateContainerParams): Promise<CreateContainerResult> {
    const { userId, stackName, level, stacks, scenarioId, projectFolder, mode } = params;

    const resolved = await this.resolveImageAndVolume(stackName, level, scenarioId, projectFolder, mode);

    const stacksArray: Array<{ stackName: string }> = [...stacks].filter(s => s && s.stackName);

    const containerConfig: any = {
      Image: resolved.imageToUse,
      name: `devsim-${stackName}-${userId}-${level}`,
      Cmd: ['/bin/sh'],
      Tty: true,
      OpenStdin: true,
      WorkingDir: '/workspace',
      ExposedPorts: {
        '5000/tcp': {},
        '3000/tcp': {},
        '5173/tcp': {},
        '5432/tcp': {}
      },
      Env: [
        'POSTGRES_USER=devsim',
        'POSTGRES_PASSWORD=devsim',
        'POSTGRES_DB=devsim',
        'DATABASE_HOST=localhost',
        'DATABASE_PORT=5432',
        'DATABASE_USER=devsim',
        'DATABASE_PASSWORD=devsim',
        'DATABASE_URL=postgresql://devsim:devsim@localhost:5432/devsim'
      ],
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        AutoRemove: false,
        PortBindings: {
          '5000/tcp': [{ HostPort: '' }],
          '3000/tcp': [{ HostPort: '' }],
          '5173/tcp': [{ HostPort: '' }],
          '5432/tcp': [{ HostPort: '' }]
        }
      },
      Labels: {
        'devsim.userId': userId,
        'devsim.stack': stackName,
        'devsim.level': level.toString(),
        'devsim.projectFolder': projectFolder ?? ''
      }
    };

    if (resolved.volumeMount) {
      containerConfig.HostConfig.Binds = [resolved.volumeMount];
    }

    const container = await docker.createContainer(containerConfig);
    await docker.getContainer(container.id).start();

    const inspect = await docker.getContainer(container.id).inspect();

    return {
      id: container.id,
      ports: {
        backend: inspect.NetworkSettings.Ports['5000/tcp']?.[0]?.HostPort,
        frontend: inspect.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort,
        database: inspect.NetworkSettings.Ports['5432/tcp']?.[0]?.HostPort
      }
    };
  }

  async createVolume(name: string) {
    return docker.createVolume({ Name: name });
  }

  async removeVolume(name: string) {
    const vol = docker.getVolume(name);
    await vol.remove();
  }

  async copyToVolume(containerId: string, volumeName: string) {
    let helper: Awaited<ReturnType<typeof docker.createContainer>> | null = null;

    try {
      const source = docker.getContainer(containerId);
      const archiveStream = await source.getArchive({ path: '/workspace/.' });

      const helperSuffix = crypto.randomBytes(4).toString('hex');

      helper = await docker.createContainer({
        Image: 'node:20-alpine',
        Cmd: ['sleep', '3600'],
        name: `devsim-archive-helper-${helperSuffix}`,
        Labels: { 'devsim.internal': 'archive-helper' },
        HostConfig: {
          Binds: [`${volumeName}:/data`],
          AutoRemove: false
        }
      });

      await helper.start();
      await helper.putArchive(archiveStream as NodeJS.ReadableStream, {
        path: '/data'
      });
    } finally {
      if (helper) {
        try { await helper.stop({ t: 2 }); } catch { }
        try { await helper.remove(); } catch { }
      }
    }
  }

  async stopAndRemove(containerId: string) {
    try {
      const container = docker.getContainer(containerId);
      const info = await container.inspect();

      if (info.State.Running) {
        await container.stop({ t: 5 });
      }

      await container.remove();
    } catch {
      // ignore (already gone)
    }
  }

  async inspectContainer(containerId: string): Promise<InspectResult['info']> {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      Config: { Labels: info.Config.Labels || {} },
      State: { Running: info.State.Running },
      NetworkSettings: { Ports: info.NetworkSettings.Ports }
    };
  }

  async startContainer(containerId: string): Promise<InspectResult['info']> {
    const container = docker.getContainer(containerId);
    let info = await container.inspect();

    if (!info.State.Running) {
      await container.start();
      info = await container.inspect();
    }

    return {
      Config: { Labels: info.Config.Labels || {} },
      State: { Running: info.State.Running },
      NetworkSettings: { Ports: info.NetworkSettings.Ports }
    };
  }

  extractPreviewPorts(ports: Record<string, Array<{ HostIp: string; HostPort: string }> | null> | undefined): Record<string, number> {
    const previewPorts: Record<string, number> = {};

    for (const [containerPort, hostBindings] of Object.entries(ports || {})) {
      if (hostBindings && hostBindings.length > 0) {
        const hostPort = hostBindings[0]?.HostPort;
        if (hostPort) {
          const portKey = containerPort.split('/')[0];
          previewPorts[portKey] = parseInt(hostPort);
        }
      }
    }

    return previewPorts;
  }

  async pickPreviewHostPort(previewPorts: Record<string, number>): Promise<number | null> {
    return pickPreviewHostPortWithProbe(previewPorts, { timeoutMs: 1000 });
  }

  async stopWorkspace(containerId: string) {
    try {
      await docker.getContainer(containerId).stop();
      return { success: true };
    } catch (err) {
      console.error('Background container stop failed:', err);
    }
  }

  async listFiles(containerId: string, path: string = '/workspace') {
    const excludedPathExpr =
      '! -path "*/node_modules" ! -path "*/node_modules/*" ' +
      '! -path "*/.next" ! -path "*/.next/*" ' +
      '! -path "*/.git" ! -path "*/.git/*" ' +
      '! -path "*/tests" ! -path "*/tests/*" ' +
      '! -path "*/__tests__" ! -path "*/__tests__/*" ' +
      '! -path "*/levels" ! -path "*/levels/*" ' +
      '! -name ".dockerignore"';

    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    if (!info.State.Running) {
      throw new Error('Container is not running');
    }

    // List files
    const fileExec = await container.exec({
      Cmd: ['sh', '-c', `find "${path}" -type f ${excludedPathExpr} 2>/dev/null || echo ""`],
      AttachStdout: true,
      AttachStderr: true
    });

    const fileStream = await fileExec.start({});

    let output = '';
    const stdout = new Writable({
      write(chunk: any, encoding: any, callback: any) {
        output += chunk.toString();
        callback();
      }
    });

    container.modem.demuxStream(fileStream, stdout, stdout);

    await new Promise((resolve, reject) => {
      fileStream.on('end', resolve);
      fileStream.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 10000);
    });

    // List directories
    const dirExec = await container.exec({
      Cmd: ['sh', '-c', `find "${path}" -type d ! -path "${path}" ${excludedPathExpr} 2>/dev/null || echo ""`],
      AttachStdout: true,
      AttachStderr: true
    });

    const dirStream = await dirExec.start({});

    let dirOutput = '';
    const dirStdout = new Writable({
      write(chunk: any, encoding: any, callback: any) {
        dirOutput += chunk.toString();
        callback();
      }
    });

    container.modem.demuxStream(dirStream, dirStdout, dirStdout);

    await new Promise((resolve, reject) => {
      dirStream.on('end', resolve);
      dirStream.on('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 10000);
    });

    const files = output
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.startsWith('/workspace') && line !== '/workspace')
      .map((f: string) => f.replace('/workspace/', ''));

    const directories = dirOutput
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.startsWith('/workspace') && line !== '/workspace')
      .map((f: string) => f.replace('/workspace/', ''));

    return { files, directories };
  }

  async readFile(containerId: string, path: string) {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['cat', path],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });

    const stream = await exec.start({ hijack: true });

    const chunks: Uint8Array[] = [];
    const errorChunks: Uint8Array[] = [];

    await new Promise<void>((resolve, reject) => {
      container.modem.demuxStream(
        stream,
        {
          write: (chunk: Uint8Array) => chunks.push(chunk)
        },
        {
          write: (chunk: Uint8Array) => errorChunks.push(chunk)
        }
      );

      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const content = Buffer.concat(chunks).toString('utf8');
    const errorOutput = Buffer.concat(errorChunks).toString('utf8');

    if (errorOutput && !content) {
      throw new Error(errorOutput.trim());
    }

    return { content };
  }

  async writeFile(containerId: string, path: string, content: string) {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['sh', '-c', `cat > "${path}"`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    stream.write(content);
    stream.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const inspect = await exec.inspect();
    if (inspect.ExitCode !== 0) {
      throw new Error(`Write failed with exit code ${inspect.ExitCode}`);
    }
  }

  async createFile(containerId: string, path: string) {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['touch', path],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true });
    await new Promise<void>((resolve) => {
      stream.on('end', resolve);
    });

    const inspect = await exec.inspect();
    if (inspect.ExitCode !== 0) {
      throw new Error(`Create failed with exit code ${inspect.ExitCode}`);
    }
  }

  async createDirectory(containerId: string, path: string) {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['mkdir', '-p', path],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true });
    await new Promise<void>((resolve) => {
      stream.on('end', resolve);
    });

    const inspect = await exec.inspect();
    if (inspect.ExitCode !== 0) {
      throw new Error(`Directory creation failed with exit code ${inspect.ExitCode}`);
    }
  }
}
