import { WorkspaceDataAccess } from "../data-access/WorkspaceDataAccess";
import { ContainerService } from "./ContainerService";
import { UserDataAccess } from "../data-access/UserDataAccess";
import { LevelDataAccess } from "../data-access/LevelDataAccess";
import { TasksDataAccess } from "../data-access/TasksDataAccess";
import { FileChangesDataAccess } from "../data-access/FileChangesDataAccess";
import { ScenarioDataAccess } from "../data-access/ScenarioDataAccess";
import { saveUserContainer } from "$lib/server/docker/user/save-user-container";
import type { CreateWorkspaceRequest } from "$lib/contracts/request/CreateWorkspaceRequest";
import { CloudflaredWrapper } from "$lib/wrapper/cloudflared";
import * as crypto from "crypto";
import prisma from "$lib/server/client";
import { detectNewlyUnlockedAchievements } from "$lib/server/achievements/unlocks";
import { resolveScenarioId } from "$lib/utils/scenario-mapping";

interface StartContainerForPreviewParams {
  containerId: string;
  isProduction: boolean;
  username: string;
}

interface StartContainerForPreviewResult {
  id: string;
  previewPorts: Record<string, number>;
  previewUrl: string;
}

interface SubmitWorkParams {
  taskName: string;
  containerId: string;
  userId: string;
  advanceLevel?: boolean; // If true, will advance level when all tasks complete
}

export class WorkspaceLaunchConflict extends Error {
  constructor(public readonly workspace: { id: string; stackName: string | null; level: number; status: string; currentScenarioId: string | null; scenarioTitle: string | null }) {
    super('Complete your current workspace before starting a new scenario.');
    this.name = 'WorkspaceLaunchConflict';
  }
}

export class WorkspaceService {
  constructor(
    private readonly workspace = new WorkspaceDataAccess(),
    private readonly container = new ContainerService(),
    private readonly user = new UserDataAccess(),
    private readonly level = new LevelDataAccess(),
    private readonly tasks = new TasksDataAccess(),
    private readonly fileChanges = new FileChangesDataAccess(),
    private readonly scenario = new ScenarioDataAccess(),
  ) {}

  async createOrReuseWorkspace(params: CreateWorkspaceRequest) {
    const {
      userId,
      stackName,
      level,
      stacks,
      scenarioId = undefined,
      projectFolder,
      mode,
    } = params;

    const currentScenarioId = await this.getScenarioId(scenarioId, stackName);
    const workspaceStatus = mode === "tutorial" ? "tutorial" : "created";

    // Validate user exists before creating any container
    const user = await this.user.findUserById(userId);
    if (!user) {
      throw new Error(
        `User '${userId}' not found in database. Your session may be stale — please sign out and sign in again.`,
      );
    }

    // Validate scenario exists before creating any container
    if (scenarioId && !currentScenarioId) {
      throw new Error(
        `Scenario '${scenarioId}' not found in database. The database may have been reseeded — please refresh the page and try again.`,
      );
    }

    // Convert stacks (frontend/backend/database/services) to array format
    const stacksArray: Array<{ stackName: string }> = [
      stacks.frontend ? { stackName: stacks.frontend } : null,
      stacks.backend ? { stackName: stacks.backend } : null,
      stacks.database ? { stackName: stacks.database } : null,
      stacks.services ? { stackName: stacks.services } : null,
    ].filter((s): s is { stackName: string } => s !== null) as Array<{
      stackName: string;
    }>;

    const existing = await this.workspace.findActiveWorkspaceByStacks(userId, level, stacksArray);
    if (existing && existing.currentScenarioId !== currentScenarioId) {
      const scenarioTitle = existing.currentScenarioId
        ? await this.scenario.findScenarioTitleById(existing.currentScenarioId)
        : null;
      throw new WorkspaceLaunchConflict({
        id: existing.id,
        stackName: existing.stackName,
        level: existing.level,
        status: existing.status,
        currentScenarioId: existing.currentScenarioId,
        scenarioTitle,
      });
    }

    // check if workspace already exists in DB (must match stacks)
    // Tutorial workspaces are asynchronously destroyed (bgCleanup removes the
    // Docker container in the background). Never reuse a tutorial container for
    // a regular workspace; create the replacement first and clean up the old
    // tutorial asynchronously after the replacement is persisted.
    const existingIsReusable =
      existing &&
      !(mode === "workspace" && existing.status === "tutorial");
    const tutorialCleanup = new Map<string, { id: string; containerId: string }>();

    const queueTutorialCleanup = (workspace: { id: string; containerId: string; status: string }) => {
      if (mode === "workspace" && workspace.status === "tutorial") {
        tutorialCleanup.set(workspace.id, {
          id: workspace.id,
          containerId: workspace.containerId,
        });
      }
    };

    if (existing) queueTutorialCleanup(existing);

    if (existingIsReusable) {
      try {
        await this.container.ensureRunning(existing.containerId);

        if (mode === "tutorial") {
          await this.workspace.updateWorkspaceStatus(
            existing.id,
            "tutorial",
            false,
          );
        }

        return {
          alreadyExists: true,
          containerId: existing.containerId,
          dbContainerId: existing.id,
        };
      } catch {
        // fall through → recreate
      }
    }

    // 2. Docker fallback
    const dockerMatch = await this.container.findByLabels(
      userId,
      stackName,
      level,
    );

    if (dockerMatch) {
      const dbRecord = await this.workspace.findWorkspaceByContainerId(
        userId,
        dockerMatch.Id,
      );

      // Same guard as above: never reuse a tutorial container for a workspace.
      if (dbRecord && !(mode === "workspace" && dbRecord.status === "tutorial")) {
        await this.container.ensureRunning(dockerMatch.Id);

        const { dbContainerId } = await saveUserContainer({
          userId,
          containerId: dockerMatch.Id,
          currentScenarioId: currentScenarioId || "",
          stacks,
          level,
          status: workspaceStatus,
        });

        return {
          alreadyExists: true,
          containerId: dockerMatch.Id,
          dbContainerId,
        };
      }

      if (dbRecord && mode === "workspace" && dbRecord.status === "tutorial") {
        queueTutorialCleanup(dbRecord);
      }
    }

    // 3. Create fresh
    const created = await this.container.createContainer({
      userId,
      stackName,
      level,
      stacks: stacksArray,
      scenarioId,
      projectFolder,
      mode,
    });

    const { dbContainerId } = await saveUserContainer({
      userId,
      containerId: created.id,
      currentScenarioId: currentScenarioId || "",
      stacks,
      level,
      status: workspaceStatus,
    });

    // Give the create response and subsequent page navigation time to finish
    // before Docker changes the local network. The new workspace uses a unique
    // container name, so the tutorial can remain alive briefly.
    if (tutorialCleanup.size > 0) {
      setTimeout(() => {
        void Promise.all(
          [...tutorialCleanup.values()].map(async ({ id, containerId }) => {
            await this.container.stopAndRemove(containerId);
            await this.workspace.deleteWorkspace(id);
          }),
        ).catch((error) => {
          console.error("Tutorial workspace cleanup failed:", error);
        });
      }, 30_000);
    }

    return {
      containerId: created.id,
      dbContainerId,
      ports: created.ports,
    };
  }

  async getScenarioId(scenarioId?: string, stackName?: string) {
    if (!scenarioId) return null;

    // 1. Try the id exactly as provided (handles already-correct DB ids).
    const exact = await this.scenario.findScenarioById(scenarioId);
    if (exact) return exact.id;

    // 2. Fallback: map legacy folder-name ids (e.g. "scenario-1") to the
    //    current seed’s real scenario ids.
    const mapped = stackName
      ? resolveScenarioId(stackName, scenarioId)
      : scenarioId;
    if (mapped !== scenarioId) {
      const scenario = await this.scenario.findScenarioById(mapped);
      return scenario?.id ?? null;
    }

    return null;
  }

  async archiveWorkspace(params: { dbContainerId: string; userId: string }) {
    const { dbContainerId, userId } = params;

    const record = await this.workspace.findWorkspaceById(dbContainerId);

    if (!record) {
      throw new Error("Container record not found.");
    }

    if (record.user_id !== userId) {
      throw new Error("You do not own this container.");
    }

    if (record.status !== "completed") {
      throw new Error("Only completed containers can be archived.");
    }

    if (record.is_archived) {
      throw new Error("Container is already archived.");
    }

    // Build volume name
    const stacks = await this.workspace.findWorkspaceStacks(record.id);
    const stackRow = stacks[0];
    const stackSlug = (stackRow?.stack_name ?? 'unknown')
      .toLowerCase()
      .replace(/\s+/g, "-");

    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const volumeName = `devsim-${record.user_id}-${stackSlug}-${randomSuffix}`;

    // 1. Create volume
    await this.container.createVolume(volumeName);

    // 2. Copy data
    try {
      await this.container.copyToVolume(record.container_id, volumeName);
    } catch (err) {
      await this.container.removeVolume(volumeName);
      throw new Error(`Failed to copy workspace: ${String(err)}`);
    }

    // 3. Remove original container
    await this.container.stopAndRemove(record.container_id);

    // Clean up tunnel ingress rule (fire-and-forget)
    const user = await this.user.findUserById(record.user_id);
    if (user) {
      const hostname = `${user.name.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.devsim.dev`;
      const cloudflared = new CloudflaredWrapper();
      cloudflared.removeRoute(hostname).catch(() => {});
    }

    // 4. Update DB
    await this.workspace.archiveWorkspace(record.id, volumeName);

    return {
      volumeName,
      dbContainerId: record.id,
    };
  }

  async clearUserFileChanges(params: {
    workspaceId: string;
    dbContainerId: string;
  }) {
    const { workspaceId, dbContainerId } = params;

    const record = await this.workspace.findWorkspaceById(dbContainerId);

    if (!record) {
      throw new Error("Container record not found.");
    }

    if (record.id !== workspaceId) {
      throw new Error("Invalid workspace ID.");
    }

    return this.fileChanges.clearUserFileChanges(workspaceId);
  }

  async startContainerForPreview(
    params: StartContainerForPreviewParams,
  ): Promise<StartContainerForPreviewResult> {
    const { containerId, userId, isProduction, username } = params;

    const info = await this.container.startContainer(containerId);

    if (info.Config.Labels["devsim.userId"] !== userId) {
      throw new Error("Container does not belong to user");
    }

    const previewPorts = this.container.extractPreviewPorts(
      info.NetworkSettings.Ports,
    );
    const hostPort = await this.container.pickPreviewHostPort(previewPorts);

    if (hostPort == null) {
      throw new Error(
        "No published preview ports found for this container. Ensure the workspace image exposes 5173, 3000, or 5000.",
      );
    }

    const previewUrl = isProduction
      ? await this.createProductionUrl(username, hostPort)
      : this.createDevUrl(hostPort);

    return {
      id: containerId,
      previewPorts,
      previewUrl,
    };
  }

  async stopWorkspace(containerId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        container_id: containerId,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace not found",
      };
    }

    await Promise.all([
      this.container.stopWorkspace(containerId),
      this.workspace.stopWorkspace(workspace.id),
    ]);

    return { success: true };
  }

  private async createProductionUrl(
    username: string,
    hostPort: number,
  ): Promise<string> {
    const cloudflared = new CloudflaredWrapper();
    const hostname = `${username.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.devsim.dev`;
    return cloudflared.createRoute(hostname, hostPort);
  }

  private createDevUrl(hostPort: number): string {
    return `http://127.0.0.1:${hostPort}`;
  }

  async submitWork(params: SubmitWorkParams) {
    try {
      const { containerId, taskName, userId, advanceLevel } = params;
      const workspaceRecord = await this.workspace.findWorkspaceByContainerId(
        userId,
        containerId,
      );

      if (!workspaceRecord) {
        return {
          success: false,
          status: 404,
          error: "Workspace not found",
        };
      }

      const currentLevel = workspaceRecord.level;
      const scenarioId = workspaceRecord.currentScenarioId;

      const levelInfo = await this.level.getLevelByOrder(
        currentLevel,
        workspaceRecord.currentScenarioId,
      );

      if (!levelInfo || levelInfo.error) {
        return {
          success: false,
          status: levelInfo.status,
          error: "Level not found",
        };
      }

      const currentCompletedTasks = await this.tasks.getCurrentCompletedTasks(
        workspaceRecord.id,
      );

      if (!currentCompletedTasks.success) {
        return {
          success: false,
          status: currentCompletedTasks.status,
          error: currentCompletedTasks.error,
        };
      }

      const completedTaskNames =
        currentCompletedTasks.completedTasks?.map((t) => t.taskName) ?? [];

      if (!completedTaskNames!.includes(taskName)) {
        const recorded = await this.tasks.createCompletedTask(workspaceRecord.id, taskName, userId, currentLevel);
        // Don't fail the whole submission over the activity log, but surface it —
        // a silent failure here is why a completed task can stop showing up in
        // the dashboard "Weekly Activity" chart with no error anywhere.
        if (!recorded.success) {
          console.error(`[Service] Failed to record completion for task "${taskName}":`, recorded.error);
        }
        completedTaskNames.push(taskName);
      }

      const xpReward = levelInfo.xpReward;
      const coinReward = levelInfo.coinReward;
      const levelTasks = levelInfo.tasks?.map((t) => t.taskName);

      const allTasksCompleted = levelTasks?.every((task) =>
        completedTaskNames.includes(task),
      );

      const shouldAdvanceLevel = advanceLevel === true && allTasksCompleted;
      let levelComplete = false;
      let nextLevel = currentLevel;

      if (shouldAdvanceLevel) {
        levelComplete = true;
        nextLevel = currentLevel + 1;

        const highestLevelOrder = await this.level.getHighestLevelOrder(
          workspaceRecord.currentScenarioId,
        );
        const isLastLevel = currentLevel >= highestLevelOrder;

        if (isLastLevel) {
          await Promise.allSettled([
            this.workspace.updateWorkspaceStatus(
              workspaceRecord.id,
              "completed",
              false,
            ),
            this.user.updateUserXpAndCoins(
              userId,
              xpReward! * 2,
              coinReward! * 2,
              false,
            ),
          ]);
          return {
            success: true,
            status: 200,
            rewards: { xp: xpReward! * 2, coins: coinReward! * 2 },
            levelComplete,
            allLevelsComplete: true,
            nextLevel: null,
            newlyUnlocked: await detectNewlyUnlockedAchievements(userId),
          };
        } else {
          await Promise.allSettled([
            this.workspace.updateWorkspaceStatus(
              workspaceRecord.id,
              "in-progress",
              true,
            ),
            this.tasks.deleteCompletedTasks(workspaceRecord.id),
            this.user.updateUserXpAndCoins(
              userId,
              xpReward!,
              coinReward!,
              true,
            ),
          ]);
        }
      } else {
        await this.user.updateUserXpAndCoins(
          userId,
          Math.floor(xpReward! / levelTasks!.length),
          Math.floor(coinReward! / levelTasks!.length),
          false,
        );
      }

      return {
        success: true,
        status: 200,
        rewards: {
          xp: allTasksCompleted
            ? xpReward
            : Math.floor(xpReward! / levelTasks!.length),
          coins: allTasksCompleted
            ? coinReward
            : Math.floor(coinReward! / levelTasks!.length),
        },
        levelComplete,
        allLevelsComplete: false,
        nextLevel: levelComplete ? nextLevel : null,
        progress: {
          completed: completedTaskNames.length,
          total: levelTasks!.length,
        },
        newlyUnlocked: await detectNewlyUnlockedAchievements(userId),
      };
    } catch (error) {
      console.log("[Service] Error submitting work: ", error);
      return {
        success: false,
        status: 500,
        error,
      };
    }
  }

  // Records a single task completion the moment its test passes on the board,
  // so the dashboard "Weekly Activity" reflects it immediately instead of only
  // on a full Submit Sprint. Idempotent per (workspace, task): re-running a
  // passing test won't double-count, and a later Submit Sprint reuses the same
  // guard so it won't record the task a second time.
  async recordTaskCompletion(params: {
    containerId: string;
    userId: string;
    taskName: string;
  }) {
    try {
      const { containerId, userId, taskName } = params;
      const workspaceRecord = await this.workspace.findWorkspaceByContainerId(
        userId,
        containerId,
      );

      if (!workspaceRecord) {
        return { success: false, status: 404, error: "Workspace not found" };
      }

      const current = await this.tasks.getCurrentCompletedTasks(
        workspaceRecord.id,
      );
      if (
        current.success &&
        current.completedTasks?.some((t) => t.taskName === taskName)
      ) {
        return { success: true, status: 200, alreadyRecorded: true };
      }

      const recorded = await this.tasks.createCompletedTask(
        workspaceRecord.id,
        taskName,
        userId,
        workspaceRecord.level,
      );

      if (!recorded.success) {
        return { success: false, status: 500, error: recorded.error };
      }

      return { success: true, status: 200, alreadyRecorded: false };
    } catch (error) {
      console.error("[Service] Error recording task completion:", error);
      return { success: false, status: 500, error };
    }
  }

  async getFileLogs(userId: string, containerId: string) {
    const workspaceContainer = await this.workspace.findWorkspaceByContainerId(
      userId,
      containerId,
    );

    if (!workspaceContainer) {
      return {
        success: false,
        status: 404,
        error: "Workspace not found",
      };
    }

    return await this.fileChanges.getFileLogs(workspaceContainer.id);
  }

  async findWorkspaceByContainerId(userId: string, containerId: string) {
    return await this.workspace.findWorkspaceByContainerId(userId, containerId);
  }

  async createFileChanges(workspaceId: string, filePath: string) {
    try {
      const workspace = await this.workspace.findWorkspaceById(workspaceId);

      if (!workspace) {
        return {
          success: false,
          status: 404,
          error: "Workspace not found",
        };
      }

      const fileChanges = await this.fileChanges.createFileChange(
        workspaceId,
        filePath,
      );

      return {
        success: true,
        status: 200,
        data: fileChanges,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        error,
      };
    }
  }
}
