// @ts-ignore - Prisma client path
import prisma from '$lib/server/client';

async function makeFirstUserAdmin() {
  // Find first user and set them as admin
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No users found in database.');
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });

  console.log(`✅ User ${updated.email} is now ADMIN`);
}

makeFirstUserAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
