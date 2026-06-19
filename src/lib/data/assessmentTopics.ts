// src/lib/data/assessmentTopics.ts
//
// Single source of truth for the skill self-assessment shared by BOTH the
// pre-assessment (/pretest) and the post-assessment (/postassessment).
//
// Each topic is asked once before the user plays ("preQuestion") and once after
// ("postQuestion" — same skill, "now" framing). Crucially, a topic's score is
// stored under the SAME key both times (see `toTopicKey`), so a user's pre and
// post scores line up on identical keys and can be compared directly.
//
// The post-assessment used to ship a different question set per stack combo,
// keyed by generic buckets (frontend/backend/…) that never matched the pretest
// keys — so improvement could not be computed. Standardizing on these topics is
// what makes the comparison work.

export interface AssessmentTopic {
  /** Human-readable label shown in summaries. */
  label: string;
  /** Question asked in the pre-assessment. */
  preQuestion: string;
  /** Question asked in the post-assessment (same skill, "now" framing). */
  postQuestion: string;
}

/**
 * Derive the stable storage key for a topic (the `topic` column in
 * assessment_topic_score). Pre and post must derive the key the same way for
 * scores to compare; keep this the single place that transform lives.
 *
 * NOTE: existing pretest rows were saved with `label.toLowerCase().replace(/\s+/g, '_')`,
 * so this transform must stay identical to avoid orphaning historical data.
 */
export function toTopicKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "_");
}

export const assessmentTopics: AssessmentTopic[] = [
  {
    label: "HTML/CSS Layout",
    preQuestion: "How familiar are you with HTML and CSS for creating web page layouts?",
    postQuestion: "How familiar are you now with HTML and CSS for creating web page layouts?",
  },
  {
    label: "JavaScript Interactivity",
    preQuestion: "What's your experience level with JavaScript for web interactivity?",
    postQuestion: "What's your experience level now with JavaScript for web interactivity?",
  },
  {
    label: "Backend Development",
    preQuestion: "How comfortable are you with backend development concepts such as servers, routing, and middleware?",
    postQuestion: "How comfortable are you now with backend development concepts such as servers, routing, and middleware?",
  },
  {
    label: "Database Management",
    preQuestion: "What's your familiarity with databases and data management?",
    postQuestion: "What's your familiarity now with databases and data management?",
  },
  {
    label: "Frontend-Backend Integration",
    preQuestion: "How much do you know about integrating frontend and backend systems?",
    postQuestion: "How much do you know now about integrating frontend and backend systems?",
  },
  {
    label: "API Development",
    preQuestion: "How familiar are you with building and consuming APIs?",
    postQuestion: "How familiar are you now with building and consuming APIs?",
  },
  {
    label: "Command Line Operations",
    preQuestion: "How comfortable are you with terminal/command line operations?",
    postQuestion: "How comfortable are you now with terminal/command line operations?",
  },
  {
    label: "Coding Best Practices",
    preQuestion: "What's your understanding of coding best practices?",
    postQuestion: "What's your understanding now of coding best practices?",
  },
];

/** Shared 1–5 self-rating scale used by both the pre- and post-assessment. */
export const assessmentScaleOptions = [
  { value: 1, label: "No Experience" },
  { value: 2, label: "Beginner" },
  { value: 3, label: "Some Experience" },
  { value: 4, label: "Intermediate" },
  { value: 5, label: "Advanced" },
];
