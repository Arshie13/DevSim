import type { IAcceptanceCriteria, IHints, ITask } from "$lib/types";
import type { TutorialStep } from "$components/tutorial/tutorialTypes";
export type { TutorialStep as InteractiveStep };

export interface TutorialWorkspaceData {
  stackKey: string;
  stackLabel: string;
  scenarioTitle: string;
  scenarioDescription: string;
  level: number;
  tasks: ITask[];
}

function buildNextjsPostgresTaskOne(): ITask {
  const taskId = "tutorial-nextjs-pg-level1-task1";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        "Read README.md first — it lists the exact setup sequence including environment configuration before running migrations.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Generate the Prisma client before running migrations so the typed query API is available.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "Run `pnpm exec prisma migrate dev` from the project root after generating the Prisma client to apply the schema to the database.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: "Dependencies installed without errors",
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Prisma client generated successfully",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Prisma migration runs successfully and tables are created",
    },
    {
      id: `${taskId}-ac-4`,
      taskId,
      order: 4,
      isRequired: true,
      description: "Seed data inserted — sample todos visible in the database",
    },
    {
      id: `${taskId}-ac-5`,
      taskId,
      order: 5,
      isRequired: true,
      description: "Next.js dev server starts and the terminal shows 'Ready'",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-nextjs-pg-level1",
    taskName: "Prepare Development Environment",
    order: 1,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "both",
    userStory:
      "As a developer, I need to set up the Next.js + Postgres + Prisma development environment so that I can start building and testing the To-Do List app.",
  };
}

function buildNextjsPostgresTaskTwo(): ITask {
  const taskId = "tutorial-nextjs-pg-level1-task2";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        'In src/components/TodoApp.tsx, find the <h1> tag and change the text from "To-Do List Tutorial" to "Task Tracker".',
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Save the file with Ctrl+S. Next.js will hot-reload the preview within a second — no restart needed.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "Confirm the heading updated in Preview before running the Task 2 tests.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: 'Header in src/components/TodoApp.tsx updated from "To-Do List Tutorial" to "Task Tracker"',
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Preview reflects the new heading after save",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-nextjs-pg-level1",
    taskName: "Update the Page Header",
    order: 2,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory:
      "As a developer, I need to update the app header in src/components/TodoApp.tsx so I can practice making a targeted UI change and verifying it live through Next.js hot-reload.",
  };
}

const NEXTJS_POSTGRES_PRISMA_TUTORIAL_DATA: TutorialWorkspaceData = {
  stackKey: "nextjs-postgres-prisma",
  stackLabel: "Next.js + Postgres + Prisma",
  scenarioTitle: "Next.js + Postgres + Prisma Tutorial",
  scenarioDescription:
    "Set up the Next.js + Postgres + Prisma tutorial workspace by reading docs, installing dependencies, running Prisma migrations, seeding the database, and verifying the app.",
  level: 1,
  tasks: [buildNextjsPostgresTaskOne(), buildNextjsPostgresTaskTwo()],
};

const DEFAULT_TUTORIAL_DATA: TutorialWorkspaceData = {
  ...NEXTJS_POSTGRES_PRISMA_TUTORIAL_DATA,
  stackKey: "default",
  stackLabel: "Full Stack",
  scenarioTitle: "Stack Tutorial",
};

function normalizeStackName(raw: string): string {
  return raw.toLowerCase().trim().replace(/[\s_+]+/g, "-");
}

export function getTutorialWorkspaceData(stackName: string): TutorialWorkspaceData {
  const normalized = normalizeStackName(stackName);

  if (
    normalized.includes("nextjs-postgres-prisma") ||
    (normalized.includes("next") && normalized.includes("postgres") && normalized.includes("prisma"))
  ) {
    return NEXTJS_POSTGRES_PRISMA_TUTORIAL_DATA;
  }

  return {
    ...DEFAULT_TUTORIAL_DATA,
    stackLabel: stackName || DEFAULT_TUTORIAL_DATA.stackLabel,
  };
}

export const STEPS: TutorialStep[] = [
  {
    id: "board-kanban",
    title: "Open Kanban View",
    instruction: "Go to the Board tab, then click Kanban so you can see your sprint task cards.",
    hint: "Click the highlighted Kanban toggle in the board panel.",
    target: "board-subtab-kanban",
    switchTab: "board",
    boardSubTab: "scenario",
    preferSide: "left",
  },
  {
    id: "task-one-open",
    title: "Open Task 1 Ticket",
    instruction: "Click Task 1 to read its user story and acceptance criteria.",
    hint: "The first highlighted task card opens the task details modal.",
    target: "board-task-ticket",
    boardSubTab: "board",
    preferSide: "left",
  },
  {
    id: "task-one-close-modal",
    title: "Close Task Details",
    instruction: "After reviewing Task 1 requirements, close the task modal to continue.",
    hint: "The whole task modal is highlighted. Click Close inside the modal.",
    target: "board-task-modal",
    preferSide: "left",
  },
  {
    id: "introduce-sidebar",
    title: "Explore The Dev Sidebar",
    instruction:
      "The Dev Sidebar has useful tools like the file explorer and Search. Click around to get familiar with it.",
    hint: "Explore the sidebar briefly, then click Done to continue.",
    target: "tutorial-dev-sidebar",
    switchTab: "editor",
    confirmLabel: "Done Exploring Sidebar",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "readme-open",
    title: "Open README.md",
    instruction: "Click README.md in the explorer so you can follow setup instructions.",
    hint: "Open the highlighted README file item.",
    target: "tutorial-readme-file",
    targets: ["tutorial-readme-file"],
    requiredFileContains: "readme",
    switchTab: "editor",
    preferSide: "right",
  },
  {
    id: "read-readme",
    title: "Read README Instructions",
    instruction: "Review the README in the workspace editor and confirm when done.",
    hint: "Use the Done button after reading the setup guide.",
    target: "editor-workspace",
    confirmLabel: "Done Reading README",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "click-terminal",
    title: "Open the Terminal Tab",
    instruction: "Click the Terminal Tab Button to open it.",
    hint: "",
    target: "workspace-tab-terminal",
    targets: ["workspace-tab-terminal"],
    preferSide: "right",
  },
  {
    id: "terminal-install",
    title: "Install Dependencies",
    instruction: "Install all project dependencies from the root folder.",
    hint: "Run: pnpm install",
    switchTab: "terminal",
    command: "pnpm install",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-prisma-generate",
    title: "Generate Prisma Client",
    instruction: "Generate the Prisma client artifacts based on your schema.",
    hint: "Run: pnpm exec prisma generate",
    switchTab: "terminal",
    command: "pnpm exec prisma generate",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-prisma-migrate",
    title: "Run Prisma Migration",
    instruction: "Apply schema migrations to create the database tables.",
    hint: "Run: pnpm exec prisma migrate dev",
    switchTab: "terminal",
    command: "pnpm exec prisma migrate dev",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-prisma-seed",
    title: "Seed the Database",
    instruction: "Populate the database with initial sample todo records.",
    hint: "Run: pnpm exec prisma db seed",
    switchTab: "terminal",
    command: "pnpm exec prisma db seed",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-dev-start",
    title: "Start Development Server",
    instruction:
      "Start the Next.js app in development mode. The step advances automatically once the server is ready.",
    hint: "Run: pnpm run dev",
    command: "pnpm run dev",
    requireCommand: true,
    waitForTerminalOutput: ["localhost:3000", "Ready in"],
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "preview-button",
    title: "Open Preview",
    instruction: "Click the Preview tab to open the live application preview.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-check",
    title: "Verify Running App",
    instruction:
      "Confirm the Next.js app is running in Preview. You should see the To-Do List app with mock todos.",
    hint: "Once you can see the app in the preview iframe, continue to the testing step.",
    target: "tutorial-preview-panel",
    switchTab: "preview",
    confirmLabel: "Preview Looks Good",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "test-task-one-open-modal",
    title: "Open Test Modal",
    instruction: "Click the Test button in the header to open the test modal.",
    hint: "Use the highlighted Test button.",
    target: "run-tests-button",
    preferSide: "bottom",
  },
  {
    id: "test-task-one-select",
    title: "Run Task 1 Test",
    instruction: "Inside the test modal, click the Task 1 run-test button.",
    hint: "The full test modal is highlighted. Click the Task 1 play button.",
    target: "test-task-one-run-button",
    spotlightTarget: "test-selection-modal",
    preferSide: "left",
  },
  {
    id: "test-task-one-result-continue",
    title: "Review Result And Continue",
    instruction: "Review the test results. When done, click the close button on the modal.",
    hint: "Wait for the test run to complete, then click the close button.",
    spotlightTarget: "test-result-modal",
    target: "test-result-continue-button",
    requireTargetClick: true,
    preferSide: "left",
  },
  {
    id: "task-two-kanban",
    title: "Back To Kanban",
    instruction: "Return to the board and open Kanban for Task 2.",
    hint: "Click the highlighted Kanban toggle to continue.",
    target: "board-subtab-kanban",
    switchTab: "board",
    boardSubTab: "scenario",
    preferSide: "left",
  },
  {
    id: "task-two-open",
    title: "Open Task 2 Ticket",
    instruction: "Open Task 2 and review its requirements — you'll update the page header.",
    hint: "Click on the second task card in the Kanban board.",
    target: "board-task-ticket-2",
    boardSubTab: "board",
    preferSide: "left",
  },
  {
    id: "task-two-close-modal",
    title: "Close Task 2 Details",
    instruction: "After reviewing Task 2 requirements, close the task modal.",
    hint: "The whole task modal is highlighted. Click Close to continue.",
    target: "board-task-modal",
    preferSide: "left",
  },
  {
    id: "task-two-open-page-file",
    title: "Open the Header Component",
    instruction:
      'Open src/components/TodoApp.tsx — this component renders the "To-Do List Tutorial" header you need to change. We\'ve opened it in the editor and jumped to the heading for you.',
    hint: "Find TodoApp.tsx under src/components in the Explorer. The editor already has it open at the header line.",
    target: "editor-workspace",
    switchTab: "editor",
    confirmLabel: "Next",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "task-two-header-edit",
    title: "Update the Page Header",
    instruction:
      'In src/components/TodoApp.tsx, change the <h1> text from "To-Do List Tutorial" to "Task Tracker". Save the file (Ctrl+S) — Next.js will hot-reload the preview automatically.',
    hint: "Find the <h1> tag in TodoApp.tsx and update its text content. Save with Ctrl+S.",
    switchTab: "editor",
    target: "editor-workspace",
    confirmLabel: "Header Updated",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "preview-task-two-button",
    title: "Open Preview",
    instruction: "Click the Preview tab to verify the heading change.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-task-two-check",
    title: "Verify Updated Heading",
    instruction:
      'Confirm the app header now reads "Task Tracker" in Preview. Next.js hot-reloads on save — if it hasn\'t updated yet, wait a moment.',
    hint: 'Look for "Task Tracker" in the top-left of the preview.',
    target: "tutorial-preview-panel",
    switchTab: "preview",
    confirmLabel: "Heading Looks Good",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "test-task-two-open-modal",
    title: "Open Test Modal",
    instruction: "Click the Test button in the header to open the test modal.",
    hint: "Use the highlighted Test button.",
    target: "run-tests-button",
    preferSide: "bottom",
  },
  {
    id: "test-task-two-select",
    title: "Run Task 2 Test",
    instruction: "Inside the test modal, click the Task 2 run-test button.",
    hint: "The full test modal is highlighted. Click the Task 2 play button.",
    target: "test-task-two-run-button",
    spotlightTarget: "test-selection-modal",
    preferSide: "bottom",
  },
  {
    id: "test-task-two-result-continue",
    title: "Review Result And Continue",
    instruction: 'Review the test results. When done, click "close" button on the modal.',
    hint: "Wait for the test run to complete, then click the close button.",
    spotlightTarget: "test-result-modal",
    target: "test-result-continue-button",
    requireTargetClick: true,
    preferSide: "left",
  },
  {
    id: "submit-sprint-click",
    title: "Submit Sprint",
    instruction:
      "Click the Submit Sprint button to submit your completed work and receive rewards.",
    hint: "Use the highlighted Submit Sprint button in the header.",
    target: "submit-sprint-button",
    preferSide: "bottom",
  },
  {
    id: "submit-sprint-modal-open",
    title: "Open Submit Sprint Modal",
    instruction:
      "A modal will open asking for your mastery reflection. Enter a response describing what you learned and how you approached the tasks.",
    hint: "Type in the mastery reflection textarea inside the highlighted modal.",
    target: "submit-sprint-modal",
    confirmLabel: "Next",
    requireTargetClick: false,
    spotlightTarget: "submit-sprint-modal",
    preferSide: "bottom",
  },
  {
    id: "submit-sprint-reflection",
    title: "Enter Mastery Reflection",
    instruction:
      "Type a short reflection on what you learned. Use the Copy button below to paste the example into the field.",
    hint: 'Example: "I set up the Next.js + Postgres + Prisma stack by following the README — installing dependencies, running Prisma generate, migrate, and seed, then starting the dev server. For Task 2 I opened src/components/TodoApp.tsx from the Explorer and updated the header, verifying the change instantly through Next.js hot-reload."',
    copyText:
      "I set up the Next.js + Postgres + Prisma stack by following the README — installing dependencies, running Prisma generate, migrate, and seed, then starting the dev server. For Task 2 I opened src/components/TodoApp.tsx from the Explorer and updated the header, verifying the change instantly through Next.js hot-reload.",
    target: "mastery-reflection-input",
    confirmLabel: "Next",
    requireTargetClick: false,
    spotlightTarget: "submit-sprint-modal",
    preferSide: "bottom",
  },
  {
    id: "submit-sprint-layers",
    title: "Select Impacted Layers (Tutorial Mode)",
    instruction:
      "Click Frontend + Database checkboxes.\nNote: In real workspace, this will be checked strictly. Click Next.",
    hint: "",
    targets: ["impacted-layer-frontend", "impacted-layer-database"],
    confirmLabel: "Next",
    requireTargetClick: false,
    spotlightTarget: "submit-sprint-modal",
    preferSide: "bottom",
  },
  {
    id: "submit-sprint-confirm",
    title: "Confirm and Submit",
    instruction: "Click Submit & Continue to submit your sprint and proceed.",
    hint: "The Submit & Continue button becomes active once all requirements are met.",
    target: "submit-sprint-confirm-button",
    spotlightTarget: "submit-sprint-modal",
    preferSide: "bottom",
  },
  {
    id: "finish-tutorial-open-modal",
    title: "Sprint Submitted!",
    instruction:
      "Your sprint is being recorded. The tutorial completion summary will appear shortly.",
    hint: "Hang tight — the finish modal is loading.",
    preferSide: "bottom",
  },
];
