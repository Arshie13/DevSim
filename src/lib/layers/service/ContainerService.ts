import { docker } from '$lib/server/docker/client';
import { pickPreviewHostPortWithProbe } from '$lib/server/docker/preview-port';
import * as crypto from 'crypto';
import { Writable } from 'stream';

const STACK_CATEGORY: Record<string, 'frontend' | 'backend' | 'database'> = {
  react: 'frontend',
  nextjs: 'frontend',
  vue: 'frontend',
  svelte: 'frontend',
  angular: 'frontend',
  express: 'backend',
  fastify: 'backend',
  nestjs: 'backend',
  django: 'backend',
  flask: 'backend',
  postgresql: 'database',
  mongodb: 'database',
  mysql: 'database',
  sqlite: 'database',
  redis: 'database',
};

const STACK_DEFAULT_PORT: Record<string, number> = {
  react: 3000,
  nextjs: 3000,
  express: 5000,
  nestjs: 3000,
  postgresql: 5432,
  mongodb: 27017,
};

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
    frontend: string | undefined;
    backend: string | undefined;
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

    // The sidecar shares the workspace's namespace, so start it after the
    // workspace is running. Works for pre-existing containers too.
    if (this.isMongoWorkspace(info.Config?.Labels)) {
      await this.ensureMongoSidecar(containerId);
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

  // ───────────────────────────────────────────────────────────────────────────
  // MongoDB sidecar support
  //
  // The base workspace image runs PostgreSQL, but Mongo-based stacks (e.g.
  // react-express-mongodb) need a MongoDB server. Rather than baking Mongo into
  // the image, we run a stock `mongo:7` container that SHARES the workspace's
  // network namespace (`--network container:<workspaceId>`). That makes MongoDB
  // answer on `localhost:27017` *inside* the workspace, so the project's default
  // `mongodb://localhost:27017/...` URI works untouched — no env injection, and
  // it works for reused/pre-existing workspace containers too.
  //
  // Because the sidecar borrows the workspace's namespace, ordering matters:
  //   • start: workspace first, then sidecar
  //   • stop/remove: sidecar first, then workspace
  // Its lifecycle is tied to the workspace container so callers (WorkspaceService)
  // don't need to manage it.
  // ───────────────────────────────────────────────────────────────────────────

  private static readonly MONGO_IMAGE = 'mongo:7';

  private isMongoStack(stackName: string | undefined): boolean {
    return !!stackName && stackName.toLowerCase().includes('mongo');
  }

  private isMongoWorkspace(labels: Record<string, string> | undefined): boolean {
    return this.isMongoStack(labels?.['devsim.stack']);
  }

  private mongoSidecarName(workspaceId: string): string {
    return `devsim-mongo-${workspaceId.slice(0, 12)}`;
  }

  private async ensureImage(image: string) {
    try {
      await docker.getImage(image).inspect();
      return;
    } catch {
      // not present locally → pull below
    }

    await new Promise<void>((resolve, reject) => {
      docker.pull(image, (err: unknown, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (progressErr: unknown) =>
          progressErr ? reject(progressErr) : resolve()
        );
      });
    });
  }

  /**
   * Ensure a MongoDB sidecar is running for the given (already-running) workspace
   * container. The sidecar shares the workspace's network namespace, so mongod
   * is reachable at localhost:27017 from inside the workspace.
   */
  private async ensureMongoSidecar(workspaceId: string) {
    const name = this.mongoSidecarName(workspaceId);

    await this.ensureImage(ContainerService.MONGO_IMAGE);

    const existing = docker.getContainer(name);
    try {
      const info = await existing.inspect();
      if (!info.State.Running) {
        await existing.start();
      }
      return;
    } catch {
      // not created yet → create below
    }

    const mongo = await docker.createContainer({
      Image: ContainerService.MONGO_IMAGE,
      name,
      Labels: {
        'devsim.role': 'mongo-sidecar',
        'devsim.workspace': workspaceId
      },
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        NetworkMode: `container:${workspaceId}`,
        AutoRemove: false
      }
    });
    await mongo.start();
  }

  private async stopMongoSidecar(workspaceId: string) {
    try {
      const mongo = docker.getContainer(this.mongoSidecarName(workspaceId));
      const info = await mongo.inspect();
      if (info.State.Running) {
        await mongo.stop({ t: 5 });
      }
    } catch {
      // already stopped/removed
    }
  }

  private async removeMongoSidecar(workspaceId: string) {
    try {
      const mongo = docker.getContainer(this.mongoSidecarName(workspaceId));
      const info = await mongo.inspect();
      if (info.State.Running) {
        await mongo.stop({ t: 5 });
      }
      await mongo.remove();
    } catch {
      // already gone
    }
  }

  /**
   * Create a fresh workspace container with all necessary configuration.
   */
  async createContainer(params: CreateContainerParams): Promise<CreateContainerResult> {
    const { userId, stackName, level, stacks, scenarioId, projectFolder, mode } = params;

    const resolved = await this.resolveImageAndVolume(stackName, level, scenarioId, projectFolder, mode);

    // Mongo-based stacks get a MongoDB sidecar started after the workspace below.
    const isMongo = this.isMongoStack(stackName);

    const stacksArray: Array<{ stackName: string }> = [...stacks].filter(s => s && s.stackName);

    // Determine ports to expose based on selected stacks
    const portsToExpose: string[] = [];
    for (const stack of stacksArray) {
      const port = STACK_DEFAULT_PORT[stack.stackName];
      if (port) {
        const binding = `${port}/tcp`;
        if (!portsToExpose.includes(binding)) {
          portsToExpose.push(binding);
        }
      }
    }

    const exposedPorts: Record<string, {}> = {};
    const portBindings: Record<string, Array<{ HostPort: string }>> = {};
    for (const p of portsToExpose) {
      exposedPorts[p] = {};
      portBindings[p] = [{ HostPort: '' }];
    }

    const containerConfig: any = {
      Image: resolved.imageToUse,
      name: `devsim-${stackName}-${userId}-${level}`,
      Cmd: ['/bin/sh'],
      Tty: true,
      OpenStdin: true,
      WorkingDir: '/workspace',
      ExposedPorts: exposedPorts,
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
        PortBindings: portBindings
      },
      Labels: {
        'devsim.userId': userId,
        'devsim.stack': stackName,
        'devsim.level': level.toString(),
        'devsim.projectFolder': projectFolder ?? '',
        'devsim.mode': mode ?? 'workspace'
      }
    };

    if (resolved.volumeMount) {
      containerConfig.HostConfig.Binds = [resolved.volumeMount];
    }

    const container = await docker.createContainer(containerConfig);
    await docker.getContainer(container.id).start();

    // For Mongo stacks, start a MongoDB sidecar that shares this workspace's
    // network namespace so mongod answers on localhost:27017 inside it. Must run
    // after the workspace is started (the sidecar borrows its namespace).
    if (isMongo) {
      await this.ensureMongoSidecar(container.id);
    }

    const inspect = await docker.getContainer(container.id).inspect();

    const returnPorts: CreateContainerResult['ports'] = {
      frontend: undefined,
      backend: undefined,
      database: undefined,
    };

    for (const stack of stacksArray) {
      const category = STACK_CATEGORY[stack.stackName];
      const port = STACK_DEFAULT_PORT[stack.stackName];
      if (category && port) {
        const hostPort = inspect.NetworkSettings.Ports[`${port}/tcp`]?.[0]?.HostPort;
        if (hostPort) {
          (returnPorts as Record<string, string | undefined>)[category] = hostPort;
        }
      }
    }

    return {
      id: container.id,
      ports: returnPorts,
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

      // Remove the Mongo sidecar first — Docker won't remove a container whose
      // network namespace is still in use by the sidecar.
      if (this.isMongoWorkspace(info.Config?.Labels)) {
        await this.removeMongoSidecar(containerId);
      }

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

    // Sidecar shares the workspace's namespace → start it after the workspace.
    if (this.isMongoWorkspace(info.Config?.Labels)) {
      await this.ensureMongoSidecar(containerId);
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
      const container = docker.getContainer(containerId);

      let isMongo = false;
      try {
        const info = await container.inspect();
        isMongo = this.isMongoWorkspace(info.Config?.Labels);
      } catch {
        // container already gone — nothing to stop
      }

      // Stop (but keep) the Mongo sidecar first — it shares the workspace's
      // namespace — so it restarts with the workspace next time.
      if (isMongo) {
        await this.stopMongoSidecar(containerId);
      }

      await container.stop();

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
