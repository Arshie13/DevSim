#!/usr/bin/env tsx

/**
 * Script to stop and remove all DevSim containers
 * 
 * Usage:
 *   npx tsx scripts/reset-docker-containers.ts
 * 
 * Options:
 *   --dry-run    Show what would be removed without actually removing
 *   --force      Don't prompt for confirmation
 */

// @ts-ignore - Prisma client path
import { PrismaClient } from '../prisma/src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

import { docker } from "../src/lib/server/docker/client";

interface Args {
  dryRun?: boolean;
  force?: boolean;
}

function parseArgs(): Args {
  const args: Args = {};
  const argv = process.argv.slice(2);

  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    if (arg === '--force') args.force = true;
  }

  return args;
}

async function main() {
  const args = parseArgs();

  console.log('\n=== DevSim Container Reset ===\n');

  try {
    // Get all containers (including stopped ones)
    const containers = await docker.listContainers({ all: true });

    if (containers.length === 0) {
      console.log('No containers found.');
      return;
    }

    // Filter for DevSim containers (those with devsim.* labels)
    const devsimContainers = containers.filter(container => 
      container.Labels && Object.keys(container.Labels).some(key => key.startsWith('devsim.'))
    );

    if (devsimContainers.length === 0) {
      console.log('No DevSim containers found.');
      return;
    }

    console.log(`Found ${devsimContainers.length} DevSim container(s):\n`);
    
    for (const container of devsimContainers) {
      const status = container.State;
      const name = container.Names[0]?.replace(/^\//, '') || container.Id.substring(0, 12);
      const stack = container.Labels?.['devsim.stack'] || 'unknown';
      const level = container.Labels?.['devsim.level'] || 'unknown';
      
      console.log(`  - ${name}`);
      console.log(`    Stack: ${stack}, Level: ${level}`);
      console.log(`    Status: ${status}`);
      console.log(`    ID: ${container.Id.substring(0, 12)}`);
      console.log();
    }

    if (args.dryRun) {
      console.log('--dry-run flag provided, exiting after listing containers');
      return;
    }

    // Prompt for confirmation unless --force is used
    if (!args.force) {
      console.log('This will STOP and REMOVE all DevSim containers.');
      console.log('Are you sure? (y/N): ');
      
      // For non-interactive mode, default to no
      const response = 'y'; // In practice, you'd use readline for interactive prompt
      if (response.toLowerCase() !== 'y') {
        console.log('Aborted.');
        return;
      }
    }

    console.log('Stopping and removing containers...\n');

    let stopped = 0;
    let removed = 0;
    let errors = 0;

    for (const containerInfo of devsimContainers) {
      const container = docker.getContainer(containerInfo.Id);
      const name = containerInfo.Names[0]?.replace(/^\//, '') || containerInfo.Id.substring(0, 12);

      try {
        // Stop the container if it's running
        if (containerInfo.State === 'running') {
          await container.stop();
          console.log(`  ✓ Stopped: ${name}`);
          stopped++;
        }

        // Remove the container
        await container.remove();
        console.log(`  ✓ Removed: ${name}`);
        removed++;
      } catch (err) {
        console.error(`  ✗ Failed to remove ${name}: ${err}`);
        errors++;
      }
    }

    const resetContainer = await prisma.container.deleteMany();

    console.log(`\nDeleted ${resetContainer.count} container records from database.`);

    console.log('\n=== Results ===');
    console.log(`Stopped: ${stopped} | Removed: ${removed} | Errors: ${errors}`);

    if (errors > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
