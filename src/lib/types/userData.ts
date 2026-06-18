export interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;
  fullName?: string;
  username?: string;
  givenName?: string;
  avatar: string;

  // Leveling System
  xp: number;
  coins: number;
  level: number;
  ownedAvatars: string[];

  // Tutorial
  hasCompletedTutorial: boolean;

  // Dashboard onboarding
  hasSeenDashboardOnboarding?: boolean;
}