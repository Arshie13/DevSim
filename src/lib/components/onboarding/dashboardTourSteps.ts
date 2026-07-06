export interface DashboardTourStep {
  id: string;
  title: string;
  description: string;
  /** Matches the value of the data-tour attribute on the target DOM element. */
  target: string;
  /**
   * Which side the callout should appear on relative to the target.
   * 'right'  → callout to LEFT of target, arrow points right
   * 'left'   → callout to RIGHT of target, arrow points left
   * 'top'    → callout BELOW target, arrow points up
   * 'bottom' → callout ABOVE target, arrow points down
   * Defaults to 'auto' (pick side with most space).
   */
  preferSide?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** If true, applies an extra pulse glow to the target element during this step. */
  highlightTarget?: boolean;
  /** If true, the tour will request the stats drawer to open before measuring. */
  openDrawer?: boolean;
  /** If true, the tour will request the stats drawer to close before measuring. */
  closeDrawer?: boolean;
}

export const DASHBOARD_TOUR_STEPS: DashboardTourStep[] = [
  {
    id: 'dashboard-header',
    title: 'Navigation Bar',
    description:
      'Your command center. Claim daily rewards, check your coins, and manage your profile from here.',
    target: 'dashboard-header',
    preferSide: 'bottom',
  },
  {
    id: 'dashboard-stats-drawer',
    title: 'Stats & Activity',
    description:
      'View your performance overview, weekly activity, leaderboard position, and recent achievements.',
    target: 'dashboard-stats-drawer',
    preferSide: 'left',
    openDrawer: true,
  },
  {
    id: 'dashboard-kpis',
    title: 'Your Stats',
    description:
      'KPIs show completed stacks, total XP, day streaks, and achievements at a glance.',
    target: 'dashboard-kpis',
    preferSide: 'bottom',
    closeDrawer: true,
  },
  {
    id: 'dashboard-current-stacks',
    title: 'Active Sprints',
    description:
      'Any simulation you start will appear here. Resume progress anytime.',
    target: 'dashboard-current-stacks',
    preferSide: 'right',
  },
  {
    id: 'dashboard-finished-stacks',
    title: 'Completed Work',
    description:
      'Finished stacks live here. You can restore archived workspaces later.',
    target: 'dashboard-finished-stacks',
    preferSide: 'left',
  },
  {
    id: 'dashboard-start-stack-btn',
    title: 'Start Building',
    description:
      'Click here to choose your first tech stack and begin coding.',
    target: 'dashboard-start-stack-btn',
    preferSide: 'bottom',
    highlightTarget: true,
  },
];
