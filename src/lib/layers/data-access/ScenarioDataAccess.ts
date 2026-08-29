import prisma from "$lib/server/client";

export class ScenarioDataAccess {
  async findScenarioById(scenarioId: string) {
    return prisma.scenario.findFirst({
      where: { id: scenarioId },
      select: { id: true }
    });
  }

  async findScenarioTitleById(scenarioId: string) {
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      select: { name: true },
    });
    return scenario?.name ?? null;
  }
}