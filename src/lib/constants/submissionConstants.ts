import type { SubmitStep, AIScoring } from "$lib/types/Submission";

export const SUBMIT_STEPS: SubmitStep[] = [
  {
    icon: '🧪',
    label: 'Running tests…',
    detail: 'Validating your work against level requirements',
  },
  {
    icon: '🏁',
    label: 'Recording completion…',
    detail: 'Recording your progress & awarding rewards',
  },
  {
    icon: '📦',
    label: 'Advancing level…',
    detail: 'Preparing the next challenge',
  },
];

export const MIN_SUBMIT_STEP_VISIBLE_MS = 800;

export const DEFAULT_AI_SCORING: AIScoring = {
  stars: 1,
  score: 50,
  feedback: '',
  improvements: '',
  nextTime: '',
  loading: false,
  done: false,
};

export const FALLBACK_AI_SCORING: AIScoring = {
  stars: 1,
  score: 35,
  feedback: 'Your code passes the tests but there is room for improvement.',
  improvements: '',
  nextTime: '',
  loading: false,
  done: true,
};

// File filtering patterns
export const SKIP_PATHS = [
  'node_modules',
  '/.git/',
  '/.next/',
  '/dist/',
] as const;

export const SKIP_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.mp4', '.zip', '.tar', '.gz',
  '.lock', '.log',
] as const;
