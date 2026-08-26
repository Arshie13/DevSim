#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const NETWORK = 'devsim-network';
const VOLUME = 'devsim-mongo-data';
const CONTAINER = 'devsim-mongo';
const MONGO_IMAGE = 'mongo:7';
const MONGO_PORT = '27017';
const MONGO_ROOT_USER = 'devsim';
const MONGO_ROOT_PASS = 'devsim-root-password';

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
  console.log('=== DevSim Shared MongoDB Setup ===\n');

  if (await exists('network', NETWORK)) {
    console.log(`Network '${NETWORK}' already exists`);
  } else {
    console.log(`Creating network '${NETWORK}'...`);
    await run(`docker network create ${NETWORK}`);
  }

  if (await exists('volume', VOLUME)) {
    console.log(`Volume '${VOLUME}' already exists`);
  } else {
    console.log(`Creating volume '${VOLUME}'...`);
    await run(`docker volume create ${VOLUME}`);
  }

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
        `-v ${VOLUME}:/data/db ` +
        `-e MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER} ` +
        `-e MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS} ` +
        `${MONGO_IMAGE} --auth`
    );
    await run(`docker start ${CONTAINER}`);
  }

  console.log('Waiting for MongoDB to be ready...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  for (let i = 0; i < 15; i++) {
    try {
      await execAsync(
        `docker exec ${CONTAINER} mongosh -u ${MONGO_ROOT_USER} -p ${MONGO_ROOT_PASS} --authenticationDatabase admin --eval "db.runCommand({ ping: 1 })"`
      );
      break;
    } catch {
      if (i === 14) throw new Error('MongoDB did not become ready');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log('\n===== Setup complete =====');
  console.log(`Network:   ${NETWORK}`);
  console.log(`Volume:    ${VOLUME}`);
  console.log(`Container: ${CONTAINER}`);
  console.log(`URI:       mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASS}@${CONTAINER}:${MONGO_PORT}/admin?authSource=admin`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
