import prisma from "$lib/server/client";

export async function hasProjectAccess(
  userId: string,
  projectId: string,
  projectIsFree: boolean = false,
): Promise<boolean> {
  if (projectIsFree) {
    return true;
  }

  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: {
      user_id: userId,
      status: "ACTIVE",
    },
  });

  if (enrollment && enrollment.expires_at && new Date() <= enrollment.expires_at) {
    const access = await prisma.user_project_access.findFirst({
      where: {
        user_id: userId,
        project_id: projectId,
      },
    });
    return !!access;
  }

  const access = await prisma.user_project_access.findFirst({
    where: {
      user_id: userId,
      project_id: projectId,
    },
  });

  return !!access;
}

export async function hasActiveLearnerPass(userId: string): Promise<boolean> {
  const enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: {
      user_id: userId,
      status: "ACTIVE",
    },
  });

  if (!enrollment) return false;

  if (enrollment.expires_at && new Date() > enrollment.expires_at) {
    return false;
  }

  return true;
}