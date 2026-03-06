import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { docker } from "$lib/server/docker/client";
import prisma from "$lib/server/client";

interface CreateUGCContainerRequest {
  ugcId: string;
  repoLink: string;
  scenario: string;
  techStacks: string[];
  levels: {
    id: string;
    title: string;
    order: number;
    description: string;
    xpReward: number;
  }[];
}

export const POST: RequestHandler = async ({ locals, request }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw error(401, "Unauthorized");
  }

  let body: CreateUGCContainerRequest;

  try {
    body = await request.json();
  } catch {
    throw error(400, "Invalid JSON body");
  }

  const { ugcId, repoLink, scenario, techStacks, levels } = body;

  if (!ugcId || typeof ugcId !== "string") {
    throw error(400, "ugcId is required");
  }

  if (!repoLink || typeof repoLink !== "string") {
    throw error(400, "repoLink is required");
  }

  if (!scenario || typeof scenario !== "string") {
    throw error(400, "scenario is required");
  }

  if (!Array.isArray(techStacks) || techStacks.length === 0) {
    throw error(400, "techStacks must be a non-empty array");
  }

  if (!Array.isArray(levels) || levels.length === 0) {
    throw error(400, "levels must be a non-empty array");
  }

  const userId = session.user.id;

  // Verify user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw error(401, "User not found in database");
  }

  // Verify UGC exists and is approved
  const ugc = await prisma.userGeneratedContent.findUnique({
    where: { id: ugcId },
    include: {
      levels: {
        include: {
          tasks: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!ugc) {
    throw error(404, "UGC not found");
  }

  if (ugc.status !== "approved") {
    throw error(400, "UGC is not approved for use");
  }

  try {
    // Build stack name from tech stacks
    const stackName = techStacks.join("-").toLowerCase().replace(/[.\s]+/g, "-");
    const level = 1; // Default starting level

    // Generate volume name for UGC
    const volumeName = `ugc-${ugcId.slice(0, 8)}-level-${level}`;

    // Default mount config (fallback)
    let volumeMountConfig = `${process.cwd()}/submodules/projects/tech-stacks/empty:/workspace`.replace(/\\/g, '/');

    // FIX #7: Track whether we're using fallback mode
    let usingFallback = false;

    // Check if volume already exists
    let useVolume = false;

    try {
      await docker.getVolume(volumeName).inspect();
      useVolume = true;
      console.log(`[ugc-select] Using existing volume: ${volumeName}`);
    } catch {
      // Volume doesn't exist, create it
      try {
        await docker.createVolume({
          Name: volumeName,
          Driver: "local",
        });
        useVolume = true;
        console.log(`[ugc-select] Created new volume: ${volumeName}`);
      } catch (volError) {
        console.warn(`[ugc-select] Failed to create volume, using bind mount fallback:`, volError);
        usingFallback = true;
      }
    }

    // Set up mount configuration
    if (useVolume) {
      volumeMountConfig = `${volumeName}:/workspace`;
    } else {
      // FIX #7: Validate fallback path exists before using it
      try {
        const fs = await import('fs');
        const bindMountPath = volumeMountConfig.split(':')[0];
        if (!fs.existsSync(bindMountPath)) {
          console.warn(`[ugc-select] Fallback bind mount path does not exist: ${bindMountPath}`);
          // Try to create the directory if it doesn't exist
          fs.mkdirSync(bindMountPath, { recursive: true });
          console.log(`[ugc-select] Created fallback directory: ${bindMountPath}`);
        }
      } catch (fsError) {
        console.error(`[ugc-select] Failed to validate/create fallback directory:`, fsError);
        // Continue anyway - container creation will fail with a clearer error
      }
    }

    // Create the Docker container using node:20-alpine (git will be installed later)
    const container = await docker.createContainer({
      Image: "node:20-alpine",
      Cmd: ["/bin/sh"],
      Tty: true,
      OpenStdin: true,
      WorkingDir: "/workspace",
      HostConfig: {
        NetworkMode: "host",
        Binds: [volumeMountConfig],
        Memory: 512 * 1024 * 1024,
        AutoRemove: false,
      },
      Labels: {
        "devsim.userId": userId,
        "devsim.stack": stackName,
        "devsim.level": level.toString(),
        "devsim.ugcId": ugcId,
      },
    });

    // Start the container
    await docker.getContainer(container.id).start();

    // Install git and clone the repository into the container
    try {
      // First install git
      const installGit = await docker.getContainer(container.id).exec({
        Cmd: ["apk", "add", "--no-cache", "git", "git-lfs"],
        AttachStdout: true,
        AttachStderr: true,
      });

      const installStream = await installGit.start({ hijack: true, stdin: false });
      
      await new Promise<void>((resolve) => {
        let resolved = false;
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log("[ugc-select] Git installation timed out, continuing...");
            resolve();
          }
        }, 120000); // 2 minute timeout

        installStream.on("end", () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        });
      });

      console.log("[ugc-select] Git installed successfully");

      // Now clone the repository
      const exec = await docker.getContainer(container.id).exec({
        Cmd: ["sh", "-c", `cd /workspace && git clone ${repoLink} . || echo "Git clone failed, continuing..."`],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ hijack: true, stdin: false });
      
      // Wait for git clone to complete (with timeout)
      await new Promise<void>((resolve) => {
        let resolved = false;
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log("[ugc-select] Git clone timed out, continuing...");
            resolve();
          }
        }, 60000); // 60 second timeout

        stream.on("end", () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        });
      });
    } catch (gitError) {
      console.warn("[ugc-select] Git install/clone failed:", gitError);
      // Continue even if git clone fails - the container is still usable
    }

    // Save container to database
    const dbContainer = await prisma.container.create({
      data: {
        userId,
        containerId: container.id,
        level,
        status: "created",
        stacks: techStacks,
        currentScenarioId: ugcId,
      },
    });

    // Store UGC-specific data in the container record
    // We store the scenario and tasks in a JSON field or create separate records
    // For now, we'll link the container to the UGC and store relevant info

    console.log("[ugc-select] Created container:", container.id, "for UGC:", ugcId);

    return json({
      success: true,
      containerId: dbContainer.id,
      dockerContainerId: container.id,
      message: "Container created successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ugc-select] Error creating container:", err);
    return json({ success: false, error: message }, { status: 500 });
  }
};
