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

export type AnyAvatar = AvatarDefinition | PremiumAvatarDefinition;

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
  { id: "premium_coral",    name: "Coral Dreamer",    path: "/avatars/premiumcoraldreamer.svg",    color: "#00e5a0", isPremium: true, price: 500  },
  { id: "premium_chrome", name: "Chrome Punk",       path: "/avatars/premiumchromepunk.svg", color: "#ff6b00", isPremium: true, price: 750  },
  { id: "premium_void",    name: "Void Samurai",   path: "/avatars/premiumvoidsamurai.svg",    color: "#6366f1", isPremium: true, price: 1000 },
  { id: "premium_ember",  name: "Ember Sage",        path: "/avatars/premiumembersage.svg",  color: "#ec4899", isPremium: true, price: 1200 },
  { id: "premium_glitch",  name: "Glitch Idol",        path: "/avatars/premiumglitchidol.svg",  color: "#94a3b8", isPremium: true, price: 1500 },
];

export const ALL_AVATARS: AnyAvatar[] = [...DEFAULT_AVATARS, ...PREMIUM_AVATARS];

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
