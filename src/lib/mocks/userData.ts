import type { UserData } from "$types";
import { DEFAULT_AVATAR_PATHS } from "$lib/utils/avatar";

// Mock user data
export const userData: UserData = {
  level: 12,
  exp: 4250,
  nextLevelExp: 5000,
  coins: 2840,
  // avatar is resolved at runtime via getOrAssignInitialAvatar(); this is the fallback
  avatar: "/avatars/defaultcyan.svg",
  // all default avatars are always owned; premium ones would be added here when purchased
  ownedAvatars: [...DEFAULT_AVATAR_PATHS],
  name: "dev_rookie",
  completedStacks: ["mern", "pern", "next-supabase"],
  currentStacks: [
    { stackId: "vue-django", currentLevel: 4, completed: false },
    { stackId: "svelte-fastify-redis", currentLevel: 2, completed: false },
  ],
};
