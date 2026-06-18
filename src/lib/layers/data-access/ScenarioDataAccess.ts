import prisma from "$lib/server/client";

export class ScenarioDataAccess {
  async findScenarioById(scenarioId: string) {
    return prisma.scenario.findFirst({
      where: { id: scenarioId },
      select: { id: true }
    });
  }
}