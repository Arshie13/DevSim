import { docker } from '$lib/server/docker/client';
import { pickPreviewHostPortWithProbe } from '$lib/server/docker/preview-port';
import * as crypto from 'crypto';
import { Writable } from 'stream';
import Dockerode from 'dockerode';

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
  svelte: 5173,
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

export function buildMongoUserUpsertScript(dbName: string, password: string): string {
  const safeDbName = dbName.replace(/'/g, "\\'");
  const safePassword = password.replace(/'/g, "\\'");

  return [
    `const db = db.getSiblingDB('${safeDbName}')`,
    `const user = '${safeDbName}'`,
    `const roles = [{ role: 'readWrite', db: '${safeDbName}' }]`,
    `const existing = db.getUsers().users.some((u) => u.user === user)`,
    `if (existing) { db.updateUser(user, { pwd: '${safePassword}', roles }) } else { db.createUser({ user, pwd: '${safePassword}', roles }) }`
  ].join('; ');
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

  private isMongoStack(stackName: string | undefined): boolean {
    return !!stackName && stackName.toLowerCase().includes('mongo');
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

  private generateDbName(userId: string, stackName: string, level: number): string {
    const safeStack = stackName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const safeUser = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    return `devsim_${safeStack}_${level}_${safeUser}`;
  }

  private generateDbPassword(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private static readonly SHARED_NETWORK = 'devsim-network';
  private static readonly SHARED_POSTGRES = 'devsim-postgres';
  private static readonly SHARED_MONGO = 'devsim-mongo';
  private static readonly MONGO_IMAGE = 'mongo:7';
  private static readonly MONGO_ROOT_USER = 'devsim';
  private static readonly MONGO_ROOT_PASSWORD = 'devsim-root-password';
  private static readonly MONGO_VOLUME = 'devsim-mongo-data';

  private async ensureDevsimNetwork() {
    try {
      await docker.getNetwork(ContainerService.SHARED_NETWORK).inspect();
    } catch {
      await docker.createNetwork({ Name: ContainerService.SHARED_NETWORK });
    }
  }

  private async ensureSharedPostgresRunning(): Promise<void> {
    const containerName = ContainerService.SHARED_POSTGRES;
    try {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();
      if (info.State.Running) return;
      await container.start();
      await new Promise(r => setTimeout(r, 3000));
      return;
    } catch {
      // Container doesn't exist or can't be inspected; create it.
    }

    const network = docker.getNetwork(ContainerService.SHARED_NETWORK);
    try { await network.inspect(); } catch { await docker.createNetwork({ Name: ContainerService.SHARED_NETWORK }); }

    const volumeName = 'devsim-postgres-data';
    let volume;
    try { volume = await docker.getVolume(volumeName); } catch { volume = await docker.createVolume({ Name: volumeName }); }

    const pgPassword = 'devsim';
    const containerConfig: Dockerode.ContainerCreateOptions = {
      Image: 'postgres:16-alpine',
      name: containerName,
      Env: ['POSTGRES_USER=devsim', `POSTGRES_PASSWORD=${pgPassword}`, 'POSTGRES_DB=devsim'],
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        AutoRemove: false,
        NetworkMode: ContainerService.SHARED_NETWORK,
        Binds: [`${volumeName}:/var/lib/postgresql/data`],
      },
      Labels: { 'devsim.role': 'shared-postgres' },
    };

    const created = await docker.createContainer(containerConfig);
    await created.start();
    await new Promise(r => setTimeout(r, 3000));

    for (let i = 0; i < 10; i++) {
      try {
        const check = docker.getContainer(containerName);
        const exec = await check.exec({
          Cmd: ['pg_isready', '-U', 'devsim', '-d', 'devsim'],
          AttachStdout: true, AttachStderr: true,
        });
        const stream = await exec.start({});
        await new Promise<void>((resolve) => {
          check.modem.demuxStream(stream, { write: () => {} } as any, { write: () => {} } as any);
          stream.on('end', resolve);
        });
        const inspect = await exec.inspect();
        if (inspect.ExitCode === 0) break;
      } catch {
        // not ready yet
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  private async ensureSharedMongoRunning(): Promise<void> {
    const containerName = ContainerService.SHARED_MONGO;
    try {
      const container = docker.getContainer(containerName);
      const info = await container.inspect();
      if (info.State.Running) return;
      await container.start();
      await new Promise(r => setTimeout(r, 3000));
      return;
    } catch {
      // Container doesn't exist or can't be inspected; create it.
    }

    const network = docker.getNetwork(ContainerService.SHARED_NETWORK);
    try { await network.inspect(); } catch { await docker.createNetwork({ Name: ContainerService.SHARED_NETWORK }); }

    const volumeName = ContainerService.MONGO_VOLUME;
    let volume: Dockerode.Volume | Dockerode.VolumeCreateResponse;
    try { volume = await docker.getVolume(volumeName); } catch { volume = await docker.createVolume({ Name: volumeName }); }

    const containerConfig: Dockerode.ContainerCreateOptions = {
      Image: ContainerService.MONGO_IMAGE,
      name: containerName,
      Cmd: ['mongod', '--auth'],
      Env: [
        `MONGO_INITDB_ROOT_USERNAME=${ContainerService.MONGO_ROOT_USER}`,
        `MONGO_INITDB_ROOT_PASSWORD=${ContainerService.MONGO_ROOT_PASSWORD}`
      ],
      HostConfig: {
        Memory: 256 * 1024 * 1024,
        AutoRemove: false,
        NetworkMode: ContainerService.SHARED_NETWORK,
        Binds: [`${volumeName}:/data/db`],
      },
      Labels: { 'devsim.role': 'shared-mongo' },
    };

    const created = await docker.createContainer(containerConfig);
    await created.start();
    await new Promise(r => setTimeout(r, 3000));

    for (let i = 0; i < 10; i++) {
      try {
        const check = docker.getContainer(containerName);
        const exec = await check.exec({
          Cmd: ['mongosh', '--eval', 'db.runCommand({ping:1})', '-u', ContainerService.MONGO_ROOT_USER, '-p', ContainerService.MONGO_ROOT_PASSWORD, '--authenticationDatabase', 'admin'],
          AttachStdout: true, AttachStderr: true,
        });
        const stream = await exec.start({});
        await new Promise<void>((resolve) => {
          check.modem.demuxStream(stream, { write: () => {} } as any, { write: () => {} } as any);
          stream.on('end', resolve);
        });
        const inspect = await exec.inspect();
        if (inspect.ExitCode === 0) break;
      } catch {
        // not ready yet
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  private async ensureSharedPostgresDatabase(dbName: string): Promise<string> {
    const container = docker.getContainer(ContainerService.SHARED_POSTGRES);
    const dbPassword = this.generateDbPassword();

    // Ensure the per-database role exists (idempotent)
    await this.runPgSql(container, [
      `DO $$ BEGIN`,
      `  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${dbName}') THEN`,
      `    CREATE ROLE "${dbName}" WITH LOGIN PASSWORD '${dbPassword}' CREATEDB;`,
      `  ELSE`,
      `    ALTER ROLE "${dbName}" WITH LOGIN PASSWORD '${dbPassword}';`,
      `  END IF;`,
      `END $$;`
    ].join(' ')).catch(() => {});

    // Create the database (must run outside a transaction block)
    try {
      await this.runPgSql(container, `CREATE DATABASE "${dbName}" OWNER "${dbName}";`);
      await this.fixupPermissions(container, dbName);
    } catch (err: any) {
      if (!String(err.message ?? '').toLowerCase().includes('already exists')) throw err;
      await this.runPgSql(container, `ALTER DATABASE "${dbName}" OWNER TO "${dbName}";`).catch(() => {});
      await this.fixupPermissions(container, dbName).catch(() => {});
    }

    return dbPassword;
  }

  private async ensureSharedMongoDatabase(dbName: string): Promise<{ user: string; password: string }> {
    const container = docker.getContainer(ContainerService.SHARED_MONGO);
    const password = this.generateDbPassword();

    const script = buildMongoUserUpsertScript(dbName, password);
    await this.runMongosh(container, script);

    return { user: dbName, password };
  }

  private async runMongosh(container: any, script: string): Promise<void> {
    const exec = await container.exec({
      Cmd: ['mongosh', '-u', ContainerService.MONGO_ROOT_USER, '-p', ContainerService.MONGO_ROOT_PASSWORD, '--authenticationDatabase', 'admin', '--eval', script],
      AttachStdout: true, AttachStderr: true,
    });
    const stream = await exec.start({});
    let errOutput = '';

    await new Promise<void>((resolve) => {
      container.modem.demuxStream(
        stream,
        { write: () => {} } as any,
        { write: (chunk: Buffer) => { errOutput += chunk.toString(); } }
      );
      stream.on('end', resolve);
    });

    const inspect = await exec.inspect();
    if (inspect.ExitCode !== 0) {
      throw new Error(errOutput.trim() || `mongosh exit code ${inspect.ExitCode}`);
    }
  }

  private async runPgSql(container: any, sql: string, database: string = 'devsim'): Promise<void> {
    const exec = await container.exec({
      Cmd: ['psql', '-U', 'devsim', '-d', database, '-c', sql],
      AttachStdout: true, AttachStderr: true,
    });
    const stream = await exec.start({});
    let errOutput = '';

    await new Promise<void>((resolve) => {
      container.modem.demuxStream(
        stream,
        { write: () => {} } as any,
        { write: (chunk: Buffer) => { errOutput += chunk.toString(); } }
      );
      stream.on('end', resolve);
    });

    const inspect = await exec.inspect();
    if (inspect.ExitCode !== 0) {
      throw new Error(errOutput.trim() || `psql exit code ${inspect.ExitCode}`);
    }
  }

  private async fixupPermissions(container: any, dbName: string) {
    await this.runPgSql(container, [
      `ALTER SCHEMA public OWNER TO "${dbName}";`,
      `GRANT ALL ON SCHEMA public TO "${dbName}";`,
      `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbName}";`
    ].join(' '), dbName);

    // ponytail: reassign any pre-existing objects (e.g. _prisma_migrations from prior sessions)
    await this.runPgSql(container, [
      `DO $$ DECLARE r RECORD; BEGIN`,
      `  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP`,
      `    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO "${dbName}"';`,
      `  END LOOP;`,
      `  FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP`,
      `    EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequencename) || ' OWNER TO "${dbName}"';`,
      `  END LOOP;`,
      `END $$;`
    ].join(' '), dbName).catch(() => {});
  }

  /**
   * Create a fresh workspace container with all necessary configuration.
   */
  async createContainer(params: CreateContainerParams): Promise<CreateContainerResult> {
    const { userId, stackName, level, stacks, scenarioId, projectFolder, mode } = params;

    const resolved = await this.resolveImageAndVolume(stackName, level, scenarioId, projectFolder, mode);

    // Mongo-based stacks get a MongoDB sidecar started after the workspace below.
    const isMongo = this.isMongoStack(stackName);

    const dbName = this.generateDbName(userId, stackName, level);
    await this.ensureDevsimNetwork();
    await this.ensureSharedPostgresRunning();
    const dbPassword = await this.ensureSharedPostgresDatabase(dbName);

    let mongoUser: string | undefined;
    let mongoPassword: string | undefined;
    if (isMongo) {
      await this.ensureSharedMongoRunning();
      const mongoCreds = await this.ensureSharedMongoDatabase(dbName);
      mongoUser = mongoCreds.user;
      mongoPassword = mongoCreds.password;
    }

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

    const mongoJwtSecret = crypto.randomBytes(32).toString('hex');

    const containerConfig: any = {
      Image: resolved.imageToUse,
      name: `devsim-${stackName}-${userId}-${level}-${crypto.randomBytes(4).toString('hex')}`,
      Cmd: ['/bin/sh'],
      Tty: true,
      OpenStdin: true,
      WorkingDir: '/workspace',
      ExposedPorts: exposedPorts,
      Env: [
        `DATABASE_NAME=${dbName}`,
        'DATABASE_HOST=devsim-postgres',
        'DATABASE_PORT=5432',
        `DATABASE_USER=${dbName}`,
        `DATABASE_PASSWORD=${dbPassword}`,
        `DATABASE_URL=postgresql://${dbName}:${dbPassword}@devsim-postgres:5432/${dbName}`,
        'SKIP_POSTGRES=true',
        ...isMongo && mongoUser && mongoPassword ? [
          `MONGO_URI=mongodb://${mongoUser}:${mongoPassword}@devsim-mongo:27017/${dbName}?authSource=${dbName}`,
          `MONGO_USER=${mongoUser}`,
          `MONGO_PASSWORD=${mongoPassword}`,
          `JWT_SECRET=${mongoJwtSecret}`,
        ] : [],
      ],
      HostConfig: {
        Memory: 1024 * 1024 * 1024,
        AutoRemove: false,
        PortBindings: portBindings,
        NetworkMode: ContainerService.SHARED_NETWORK
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
    const container = docker.getContainer(containerId);

    const waitForRemoval = async () => {
      // Docker rejects concurrent remove calls with 409 while the first
      // removal is still running. Wait until inspect returns 404.
      for (let attempt = 0; attempt < 150; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        try {
          await container.inspect();
        } catch (inspectError: any) {
          if (inspectError?.statusCode === 404) return;
        }
      }

      throw new Error(`Timed out waiting for Docker container ${containerId} to be removed`);
    };

    let info;
    try {
      info = await container.inspect();
    } catch (error: any) {
      if (error?.statusCode === 404) return;
      throw error;
    }

    if (info.State.Running) {
      try {
        await container.stop({ t: 5 });
      } catch (error: any) {
        const message = error?.json?.message || error?.message || "";
        if (error?.statusCode === 404) return;
        if (error?.statusCode === 409 && /removal .* already in progress/i.test(message)) {
          await waitForRemoval();
          return;
        }
        if (error?.statusCode !== 304) throw error;
      }
    }

    try {
      await container.remove();
    } catch (error: any) {
      const message = error?.json?.message || error?.message || "";
      if (error?.statusCode === 404) return;
      if (error?.statusCode === 409 && /removal .* already in progress/i.test(message)) {
        await waitForRemoval();
        return;
      }
      throw error;
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
      const container = docker.getContainer(containerId);

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
