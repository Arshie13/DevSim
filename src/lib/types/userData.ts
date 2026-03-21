export interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;

  // Leveling System
  xp: number;
  coins: number;
  level: number;
  ownedAvatars: string[];

  // Onboarding
  hasCompletedOnboarding: boolean;
}