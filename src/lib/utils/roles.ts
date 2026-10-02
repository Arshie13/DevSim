/**
 * Role constants and helpers.
 *
 * `user.role` is a free-form `String` column (Prisma), not a DB enum, so the
 * canonical values live here and must be used instead of inline string literals.
 *
 * - `USER`       — normal learner.
 * - `ADMIN`      — can access the `/admin/*` panel.
 * - `SUPERADMIN` — admin plus the ability to grant/revoke the `ADMIN` role.
 */
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ADMIN_ROLES: readonly string[] = [ROLES.ADMIN, ROLES.SUPERADMIN];

/** Roles that may access the `/admin/*` panel. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role != null && ADMIN_ROLES.includes(role);
}

/** The highest privilege role — may manage who is an admin. */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === ROLES.SUPERADMIN;
}
