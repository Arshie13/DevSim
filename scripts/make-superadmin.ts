/**
 * Promote a user to SUPERADMIN by email.
 *
 * Usage:
 *   pnpm exec tsx scripts/make-superadmin.ts user@example.com
 *
 * The SUPERADMIN role is the only one allowed to open the admin panel's
 * "Admins" tab and grant/revoke the ADMIN role.
 */
// @ts-ignore - Prisma client path
import prisma from '$lib/server/client';

async function makeSuperAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: pnpm exec tsx scripts/make-superadmin.ts <email>');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exitCode = 1;
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'SUPERADMIN' },
  });

  console.log(`✅ ${updated.email} is now SUPERADMIN`);
}

makeSuperAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
