/**
 * Avatar utility — manages default and premium avatar definitions,
 * random first-time assignment via localStorage, and ownership logic.
 */

export interface AvatarDefinition {
  /** Unique key, matches the filename without extension */
  id: string;
  /** Display name shown in ChangeAvatar */
  name: string;
  /** Public path (e.g. /avatars/defaultred.svg) */
  path: string;
  /** Accent colour used for the card glow */
  color: string;
  isPremium: false;
}

export interface PremiumAvatarDefinition {
  id: string;
  name: string;
  path: string;
  color: string;
  isPremium: true;
  /** Coin price to unlock */
  price: number;
}

export interface PassAvatarDefinition {
  id: string;
  name: string;
  path: string;
  color: string;
  /** Identifies this as a Learner Pass reward avatar */
  source: "pass";
  /** Pass day on which this avatar is unlocked */
  passDay: number;
}

export type AnyAvatar = AvatarDefinition | PremiumAvatarDefinition | PassAvatarDefinition;

// ─── Free default avatars (always owned) ─────────────────────────────────────

export const DEFAULT_AVATARS: AvatarDefinition[] = [
  { id: "defaultred",    name: "Crimson",  path: "/avatars/defaultred.svg",    color: "#ef4444", isPremium: false },
  { id: "defaultcyan",   name: "Cyan",     path: "/avatars/defaultcyan.svg",   color: "#07a5c9", isPremium: false },
  { id: "defaultgreen",  name: "Verdant",  path: "/avatars/defaultgreen.svg",  color: "#22c55e", isPremium: false },
  { id: "defaultpurple", name: "Phantom",  path: "/avatars/defaultpurple.svg", color: "#a855f7", isPremium: false },
  { id: "defaultyellow", name: "Solar",    path: "/avatars/defaultyellow.svg", color: "#eab308", isPremium: false },
];

// ─── Premium avatars (must be purchased) ─────────────────────────────────────

export const PREMIUM_AVATARS: PremiumAvatarDefinition[] = [
  { id: "premium_coral",    name: "Coral Dreamer",    path: "/avatars/premiumcoraldreamer.svg",    color: "#00e5a0", isPremium: true, price: 5000 },
  { id: "premium_chrome", name: "Chrome Punk",       path: "/avatars/premiumchromepunk.svg", color: "#ff6b00", isPremium: true, price: 3500 },
  { id: "premium_void",    name: "Void Samurai",   path: "/avatars/premiumvoidsamurai.svg",    color: "#6366f1", isPremium: true, price: 3200 },
  { id: "premium_ember",  name: "Ember Sage",        path: "/avatars/premiumembersage.svg",  color: "#ec4899", isPremium: true, price: 3000 },
  { id: "premium_glitch",  name: "Glitch Idol",        path: "/avatars/premiumglitchidol.svg",  color: "#94a3b8", isPremium: true, price: 2000 },
];

// ─── Learner Pass avatars (unlocked & equippable only via the pass) ───────────
// These are NOT purchasable in the profile; they are claimed on the pass and
// equipped from the pass page. Listed here so the avatar API recognises their
// paths as valid for equipping.

export const PASS_AVATARS: PassAvatarDefinition[] = [
  { id: "pass_blue_neon",    name: "Blue Neon Avatar",    path: "/images/pass/avatar-blue-neon.svg",    color: "#38bdf8", source: "pass", passDay: 3 },
  { id: "pass_cyber",        name: "Cyber Avatar",        path: "/images/pass/avatar-cyber.svg",        color: "#34d399", source: "pass", passDay: 6 },
  { id: "pass_shadow",       name: "Shadow Avatar",       path: "/images/pass/avatar-shadow.svg",       color: "#7c3aed", source: "pass", passDay: 10 },
  { id: "pass_legend",       name: "Legend Avatar",       path: "/images/pass/avatar-legend.svg",       color: "#fbbf24", source: "pass", passDay: 15 },
  { id: "pass_galaxy",       name: "Galaxy Avatar",       path: "/images/pass/avatar-galaxy.svg",       color: "#a855f7", source: "pass", passDay: 18 },
  { id: "pass_nova",         name: "Nova Avatar",         path: "/images/pass/avatar-nova.svg",         color: "#f97316", source: "pass", passDay: 21 },
  { id: "pass_royal",        name: "Royal Avatar",        path: "/images/pass/avatar-royal.svg",        color: "#9333ea", source: "pass", passDay: 25 },
  { id: "pass_neon_warrior", name: "Neon Warrior Avatar", path: "/images/pass/avatar-neon-warrior.svg", color: "#ec4899", source: "pass", passDay: 28 },
  { id: "pass_mythic",       name: "Mythic Avatar",       path: "/images/pass/avatar-mythic.svg",       color: "#c084fc", source: "pass", passDay: 30 },
];

export const ALL_AVATARS: AnyAvatar[] = [...DEFAULT_AVATARS, ...PREMIUM_AVATARS, ...PASS_AVATARS];

/** Returns the pass avatar unlocked on a given pass day, if any. */
export function getPassAvatarByDay(day: number): PassAvatarDefinition | undefined {
  return PASS_AVATARS.find((a) => a.passDay === day);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_STORAGE_KEY = "devsim:assigned_avatar";

/**
 * Returns the path of a randomly chosen default avatar.
 */
export function getRandomDefaultAvatarPath(): string {
  const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[idx].path;
}

/**
 * Returns the user's assigned avatar path from localStorage, creating and
 * persisting a random one if this is the first time (onboarding).
 */
export function getOrAssignInitialAvatar(): string {
  if (typeof localStorage === "undefined") {
    // SSR fallback – return first default
    return DEFAULT_AVATARS[0].path;
  }

  const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
  if (stored) return stored;

  const assigned = getRandomDefaultAvatarPath();
  localStorage.setItem(AVATAR_STORAGE_KEY, assigned);
  return assigned;
}

/**
 * Persist a new avatar selection to localStorage.
 */
export function persistSelectedAvatar(path: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(AVATAR_STORAGE_KEY, path);
  }
}

/**
 * Returns the AvatarDefinition for the given path, or undefined.
 */
export function getAvatarByPath(path: string): AnyAvatar | undefined {
  return ALL_AVATARS.find((a) => a.path === path);
}

/**
 * Returns the paths of all default avatars (always owned).
 */
export const DEFAULT_AVATAR_PATHS: string[] = DEFAULT_AVATARS.map((a) => a.path);
