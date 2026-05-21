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
}

export const DASHBOARD_TOUR_STEPS: DashboardTourStep[] = [
  {
    id: 'dashboard-welcome',
    title: 'Welcome to Your Hub',
    description:
      'This is your command center. Track progress, manage sprints, and level up your developer skills.',
    target: 'dashboard-welcome',
    preferSide: 'bottom',
  },
  {
    id: 'dashboard-kpis',
    title: 'Your Stats',
    description:
      'KPIs show completed stacks, total XP, day streaks, and achievements at a glance.',
    target: 'dashboard-kpis',
    preferSide: 'bottom',
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
