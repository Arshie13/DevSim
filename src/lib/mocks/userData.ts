import type { UserData } from "$types";

// Mock user data
export const userData: UserData = {
  username: "dev_rookie",
  level: 12,
  exp: 4250,
  nextLevelExp: 5000,
  coins: 2840,
  avatar: "🥷",
  completedStacks: ["mern", "pern", "next-supabase"],
  currentStacks: [
    { stackId: "vue-django", currentLevel: 4, completed: false },
    { stackId: "svelte-fastify-redis", currentLevel: 2, completed: false },
  ],
};
