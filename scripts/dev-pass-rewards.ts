#!/usr/bin/env tsx

/**
 * DEV ONLY — make every Learner Pass reward *claimable* for one user.
 *
 *   apply   resets the pass so all 30 day tiles offer "Claim": nothing is claimed, no
 *           cooldown applies, no unlock choices are recorded and no coins / XP / AI helps
 *           have been handed out. Claiming then runs the real endpoints, so you exercise
 *           the actual flow. The prior state is snapshotted first.
 *   revert  restores that snapshot exactly (enrollment fields, every claim row including
 *           its unlock choice, and user totals).
 *   status  prints the target user's current pass state.
 *
 * Usage:
 *   pnpm exec tsx scripts/dev-pass-rewards.ts apply  [email|userId]
 *   pnpm exec tsx scripts/dev-pass-rewards.ts revert [email|userId]
 *   pnpm exec tsx scripts/dev-pass-rewards.ts status [email|userId]
 *
 * With no target the oldest user in the database is used.
 * Snapshots live in the OS temp dir, so `revert` must run on the same machine.
 *
 * Progress lives in `learner_pass_claim` rows, one per claimed allowance day. The old
 * `claimed_day_numbers` / `unlock_choices` / `streak` / `last_claimed_at` columns and the
 * whole `user_project_access` table are gone; streak, cooldown and access are all *derived*
 * from those rows. So this script only ever adds or removes claims.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import prisma from '../src/lib/server/client';
import {
  PASS_LENGTH,
  derivePassState,
  derivePendingUnlocks,
  toClaimRefs,
} from '../src/lib/server/learnerPass/schedule';
import { MS_PER_DAY } from '../src/lib/server/rewards/reset';

/** Marks an enrollment this script created, so `revert` knows it may delete it. */
const DEV_PAYMENT_PROVIDER = 'dev_script';

type ClaimSnapshot = {
  day_number: number;
  claimed_at: string;
  coins_awarded: number;
  xp_awarded: number;
  ai_helps_awarded: number;
  unlocked_scenario: string | null;
  unlocked_at: string | null;
};

type Snapshot = {
  userId: string;
  userEmail: string | null;
  takenAt: string;
  user: { coins: number; xp: number; ai_help_credits: number };
  enrollment: {
    id: string;
    createdByScript: boolean;
    payment_id: string;
    created_at: string;
    expires_at: string;
    claims: ClaimSnapshot[];
  } | null;
};

function snapshotPath(userId: string): string {
  return join(tmpdir(), `devsim-pass-unlock-${userId}.json`);
}

function readSnapshot(userId: string): Snapshot | null {
  const file = snapshotPath(userId);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as Snapshot;
}

function usage(): never {
  console.error(
    'Usage: tsx scripts/dev-pass-rewards.ts <apply|revert|status> [email|userId] [--force]',
  );
  process.exit(1);
}

/**
 * This script hands out coins/XP and scenario unlocks, so keep it off remote
 * databases. Local and bare container hostnames (no dot) are allowed; anything
 * that looks like a real domain needs --force.
 */
function assertLocalDatabase(force: boolean) {
  let host = '';
  try {
    host = new URL(process.env.DATABASE_URL ?? '').hostname;
  } catch {
    host = '';
  }
  if (!host || !host.includes('.')) return;
  if (force) return;
  console.error(
    `Refusing to run: DATABASE_URL points at "${host}", which is not a local database.\n` +
      'Pass --force if you really mean to modify it.',
  );
  process.exit(1);
}

async function resolveUser(target?: string) {
  if (!target) {
    return prisma.user.findFirst({ orderBy: { created_at: 'asc' } });
  }
  const byId = await prisma.user.findUnique({ where: { id: target } });
  if (byId) return byId;
  return prisma.user.findUnique({ where: { email: target.toLowerCase() } });
}

/** Flatten a claim row into the snapshot shape. */
function toClaimSnapshot(row: {
  day_number: number;
  claimed_at: Date;
  coins_awarded: number;
  xp_awarded: number;
  ai_helps_awarded: number;
  unlocked_scenario: string | null;
  unlocked_at: Date | null;
}): ClaimSnapshot {
  return {
    day_number: row.day_number,
    claimed_at: row.claimed_at.toISOString(),
    coins_awarded: row.coins_awarded,
    xp_awarded: row.xp_awarded,
    ai_helps_awarded: row.ai_helps_awarded,
    unlocked_scenario: row.unlocked_scenario,
    unlocked_at: row.unlocked_at?.toISOString() ?? null,
  };
}

async function apply(userId: string, email: string | null, force: boolean) {
  const existing = readSnapshot(userId);
  if (existing && !force) {
    console.error(
      `A snapshot already exists for ${email ?? userId}:\n  ${snapshotPath(userId)}\n` +
        'Run `revert` first, or pass --force to overwrite it.',
    );
    process.exit(1);
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { coins: true, xp: true, ai_help_credits: true },
  });

  let enrollment = await prisma.learner_pass_enrollment.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  let priorClaims: ClaimSnapshot[] = [];

  if (enrollment) {
    const rows = await prisma.learner_pass_claim.findMany({
      where: { enrollment_id: enrollment.id },
      orderBy: { day_number: 'asc' },
    });
    priorClaims = rows.map(toClaimSnapshot);
  } else {
    const now = new Date();
    // `payment_id` is required + unique because every real pass arrives via the Stripe
    // webhook. This one is synthetic, so tag it clearly instead of imitating a `pi_…` id.
    enrollment = await prisma.learner_pass_enrollment.create({
      data: {
        user_id: userId,
        payment_id: `devscript_${randomUUID()}`,
        payment_provider: DEV_PAYMENT_PROVIDER,
        created_at: now,
        expires_at: new Date(now.getTime() + PASS_LENGTH * MS_PER_DAY),
      },
    });
  }

  // Tagging the provider is what makes this idempotent: a second `apply` recognises the
  // enrollment it created earlier, so `revert` still knows it is safe to delete.
  const enrollmentCreatedByScript = enrollment.payment_provider === DEV_PAYMENT_PROVIDER;

  const snapshot: Snapshot = {
    userId,
    userEmail: email,
    takenAt: new Date().toISOString(),
    user: { ...dbUser },
    enrollment: {
      id: enrollment.id,
      createdByScript: enrollmentCreatedByScript,
      payment_id: enrollment.payment_id,
      created_at: enrollment.created_at.toISOString(),
      expires_at: enrollment.expires_at.toISOString(),
      claims: priorClaims,
    },
  };
  writeFileSync(snapshotPath(userId), JSON.stringify(snapshot, null, 2));

  const now = new Date();

  // Make every day reachable and unclaimed. Progress, cooldown and access are all derived
  // from claim rows, so clearing the claims is the whole job:
  //  - created_at 29 reward days back => currentDay = 30, so nothing reads as "locked"
  //  - no claims                      => every tile shows Claim, and `canClaimNow` is true
  //                                      (the cooldown is just "is there a claim today?")
  //  - expiry pushed out              => status stays ACTIVE instead of EXPIRED
  await prisma.$transaction([
    prisma.learner_pass_claim.deleteMany({ where: { enrollment_id: enrollment.id } }),
    prisma.learner_pass_enrollment.update({
      where: { id: enrollment.id },
      data: {
        created_at: new Date(now.getTime() - (PASS_LENGTH - 1) * MS_PER_DAY),
        expires_at: new Date(now.getTime() + PASS_LENGTH * MS_PER_DAY),
      },
    }),
  ]);

  console.log(`✅ All ${PASS_LENGTH} Learner Pass rewards are now claimable for ${email ?? userId}`);
  console.log(`   claimed           : 0/${PASS_LENGTH} (nothing granted yet)`);
  console.log(`   current day       : ${PASS_LENGTH} — every tile shows Claim`);
  console.log('   unlocks / coins   : none granted; claim through the UI/API as normal');
  if (enrollmentCreatedByScript) {
    console.log(
      `   (created a synthetic enrollment; payment_provider=${DEV_PAYMENT_PROVIDER})`,
    );
  }
  console.log(`   snapshot          : ${snapshotPath(userId)}`);
  console.log(
    `   undo with         : pnpm exec tsx scripts/dev-pass-rewards.ts revert ${email ?? userId}`,
  );
}

async function revert(userId: string, email: string | null) {
  const snapshot = readSnapshot(userId);
  if (!snapshot) {
    console.error(
      `No snapshot found for ${email ?? userId} at ${snapshotPath(userId)}.\n` +
        'Nothing to revert (apply must run first, on this machine).',
    );
    process.exit(1);
  }

  if (snapshot.enrollment) {
    const { id, createdByScript, claims } = snapshot.enrollment;

    if (createdByScript) {
      // Cascades to any claim rows it created.
      await prisma.learner_pass_enrollment.delete({ where: { id } });
    } else {
      await prisma.$transaction([
        // Drop whatever was claimed since `apply`, then restore the original enrollment
        // window. Claims go back separately, because only a claim can carry an unlock.
        prisma.learner_pass_claim.deleteMany({ where: { enrollment_id: id } }),
        prisma.learner_pass_enrollment.update({
          where: { id },
          data: {
            created_at: new Date(snapshot.enrollment.created_at),
            expires_at: new Date(snapshot.enrollment.expires_at),
          },
        }),
      ]);

      if (claims.length > 0) {
        // Recreated with fresh ids — nothing references a claim id from outside.
        await prisma.$transaction(
          claims.map((claim) =>
            prisma.learner_pass_claim.create({
              data: {
                enrollment_id: id,
                day_number: claim.day_number,
                claimed_at: new Date(claim.claimed_at),
                coins_awarded: claim.coins_awarded,
                xp_awarded: claim.xp_awarded,
                ai_helps_awarded: claim.ai_helps_awarded,
                unlocked_scenario: claim.unlocked_scenario,
                unlocked_at: claim.unlocked_at ? new Date(claim.unlocked_at) : null,
              },
            }),
          ),
        );
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      coins: snapshot.user.coins,
      xp: snapshot.user.xp,
      ai_help_credits: snapshot.user.ai_help_credits,
    },
  });

  rmSync(snapshotPath(userId), { force: true });

  const restoredClaims = snapshot.enrollment?.claims.length ?? 0;
  const restoredUnlocks =
    snapshot.enrollment?.claims.filter((c) => c.unlocked_scenario).length ?? 0;
  const enrollmentNote = snapshot.enrollment
    ? snapshot.enrollment.createdByScript
      ? 'deleted (apply created it)'
      : 'restored'
    : 'none';

  console.log(`↩️  Reverted Learner Pass rewards for ${email ?? userId}`);
  console.log(`   enrollment            : ${enrollmentNote}`);
  console.log(`   restored claims       : ${restoredClaims}`);
  console.log(`   restored unlock grants: ${restoredUnlocks}`);
  console.log(
    `   restored totals       : ${snapshot.user.coins} coins / ${snapshot.user.xp} XP / ${snapshot.user.ai_help_credits} AI helps`,
  );
  console.log(`   took snapshot         : ${snapshot.takenAt}`);
}

async function status(userId: string, email: string | null) {
  const [enrollment, user] = await Promise.all([
    prisma.learner_pass_enrollment.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { coins: true, xp: true, ai_help_credits: true },
    }),
  ]);

  const snapshot = readSnapshot(userId);

  console.log(`Learner Pass state for ${email ?? userId}`);
  console.log(
    `  totals     : ${user.coins} coins / ${user.xp} XP / ${user.ai_help_credits} AI helps`,
  );

  if (!enrollment) {
    console.log('  enrollment : none');
    console.log(`  snapshot   : ${snapshot ? snapshotPath(userId) : 'none (clean state)'}`);
    return;
  }

  const rows = await prisma.learner_pass_claim.findMany({
    where: { enrollment_id: enrollment.id },
    orderBy: { day_number: 'asc' },
  });

  // The same derivation the claim route and /pass use, so status can never disagree with
  // the UI about what is claimable.
  const state = derivePassState(enrollment, toClaimRefs(rows), new Date());
  const unlocked = rows
    .map((r) => r.unlocked_scenario)
    .filter((id): id is string => id !== null);
  const pending = derivePendingUnlocks(state.claimedDays, new Set(unlocked));

  // Only the current day is cooldown-gated; missed past days back-fill freely.
  let claimable = 0;
  for (let day = 1; day <= state.currentDay; day += 1) {
    if (state.claimedDays.includes(day)) continue;
    if (day >= state.currentDay && !state.canClaimNow) continue;
    claimable += 1;
  }

  console.log(`  enrollment : ${enrollment.id}`);
  console.log(`  payment    : ${enrollment.payment_id} (${enrollment.payment_provider})`);
  console.log(`  status     : ${state.status}`);
  console.log(`  expires    : ${enrollment.expires_at.toISOString()}`);
  console.log(`  current day: ${state.currentDay}/${PASS_LENGTH}`);
  console.log(`  claimed    : ${state.totalClaimedDays}/${PASS_LENGTH}`);
  console.log(`  claimable  : ${state.isActive ? claimable : 0}`);
  console.log(`  streak     : ${state.streak}`);
  console.log(
    `  claim now  : ${state.canClaimNow ? 'yes' : `no${state.nextAvailableAt ? ` (next ${state.nextAvailableAt.toISOString()})` : ''}`}`,
  );
  console.log(`  unlocks    : ${unlocked.length ? unlocked.join(', ') : 'none'}`);
  console.log(
    `  pending    : ${pending.length ? pending.map((p) => `day ${p.day} -> ${p.available.join('/')}`).join(', ') : 'none'}`,
  );
  console.log(`  snapshot   : ${snapshot ? snapshotPath(userId) : 'none (clean state)'}`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const [mode, target] = args.filter((a) => !a.startsWith('--'));
  if (!mode) usage();

  assertLocalDatabase(force);

  const user = await resolveUser(target);
  if (!user) {
    console.error(
      target ? `No user found for "${target}".` : 'No users in database.',
    );
    process.exit(1);
  }

  switch (mode) {
    case 'apply':
      await apply(user.id, user.email, force);
      break;
    case 'revert':
      await revert(user.id, user.email);
      break;
    case 'status':
      await status(user.id, user.email);
      break;
    default:
      usage();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
