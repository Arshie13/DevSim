import prisma from "$lib/server/client";

interface User {
  email: string;
  name: string;
  username: string;
}

interface PrismaCreateUserResponse {
  ok: boolean;
  data: User & { created_at: Date, updated_at: Date } | null
  error: Error | null
}

export async function createUser(userDetails: User): Promise<PrismaCreateUserResponse> {
  try {
    const user = await prisma.user.create({
      data: userDetails
    });
    return { ok: true, data: user, error: null }
  } catch (e) {
    return { ok: false, data: null, error: e as Error}
  }
}
