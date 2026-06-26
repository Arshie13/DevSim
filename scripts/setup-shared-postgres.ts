#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const NETWORK = 'devsim-network';
const VOLUME = 'devsim-postgres-data';
const CONTAINER = 'devsim-postgres';
const PG_IMAGE = 'postgres:16-alpine';
const PG_PORT = '5432';
const PG_USER = 'devsim';
const PG_PASS = 'devsim';
const PG_DB = 'devsim';

async function run(cmd: string) {
  console.log(`  $ ${cmd}`);
  const { stdout, stderr } = await execAsync(cmd);
  if (stdout.trim()) console.log(stdout.trim());
  if (stderr.trim()) console.error(stderr.trim());
}

async function exists(what: string, name: string): Promise<boolean> {
  try {
    await execAsync(`docker ${what} inspect ${name}`);
    return true;
  } catch {
    return false;
  }
}

async function isRunning(name: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `docker inspect -f '{{.State.Running}}' ${name}`
    );
    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}

async function main() {
  console.log('=== DevSim Shared PostgreSQL Setup ===\n');

  // Network
  if (await exists('network', NETWORK)) {
    console.log(`Network '${NETWORK}' already exists`);
  } else {
    console.log(`Creating network '${NETWORK}'...`);
    await run(`docker network create ${NETWORK}`);
  }

  // Volume
  if (await exists('volume', VOLUME)) {
    console.log(`Volume '${VOLUME}' already exists`);
  } else {
    console.log(`Creating volume '${VOLUME}'...`);
    await run(`docker volume create ${VOLUME}`);
  }

  // Container
  if (await exists('container', CONTAINER)) {
    if (await isRunning(CONTAINER)) {
      console.log(`Container '${CONTAINER}' already running`);
    } else {
      console.log(`Starting existing container '${CONTAINER}'...`);
      await run(`docker start ${CONTAINER}`);
    }
  } else {
    console.log(`Creating container '${CONTAINER}'...`);
    await run(
      `docker create ` +
        `--name ${CONTAINER} ` +
        `--network ${NETWORK} ` +
        `-v ${VOLUME}:/var/lib/postgresql/data ` +
        `-e POSTGRES_USER=${PG_USER} ` +
        `-e POSTGRES_PASSWORD=${PG_PASS} ` +
        `-e POSTGRES_DB=${PG_DB} ` +
        `--health-cmd "pg_isready -U ${PG_USER} -d ${PG_DB}" ` +
        `--health-interval 5s --health-timeout 5s --health-retries 5 ` +
        `${PG_IMAGE}`
    );
    await run(`docker start ${CONTAINER}`);
  }

  // Wait for healthy
  console.log('Waiting for PostgreSQL to be ready...');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  for (let i = 0; i < 10; i++) {
    try {
      await execAsync(
        `docker exec ${CONTAINER} pg_isready -U ${PG_USER} -d ${PG_DB}`
      );
      break;
    } catch {
      if (i === 9) throw new Error('PostgreSQL did not become ready');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Grant CREATEDB to devsim user for Prisma shadow database support
  console.log('Granting CREATEDB to devsim role...');
  await execAsync(
    `docker exec ${CONTAINER} psql -U ${PG_USER} -d ${PG_DB} -c "ALTER ROLE ${PG_USER} CREATEDB;"`
  ).catch(() => {
    console.log('(role already has CREATEDB or grant unnecessary)');
  });

  console.log('\n===== Setup complete =====');
  console.log(`Network:   ${NETWORK}`);
  console.log(`Volume:    ${VOLUME}`);
  console.log(`Container: ${CONTAINER}`);
  console.log(`URL:       postgresql://${PG_USER}:${PG_PASS}@${CONTAINER}:${PG_PORT}/${PG_DB}`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
