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

function buildShadcnTaskOne(): ITask {
  const taskId = "tutorial-shadcn-level1-task1";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        "Start by initializing shadcn: `pnpm exec shadcn@latest init`. Accept all default prompts — this creates components.json and wires up the CLI for the project.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Once init completes, add the Separator component with `pnpm exec shadcn@latest add separator`. shadcn copies the source file directly into src/components/ui/separator.tsx — no pnpm package needed.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "After shadcn setup, run `pnpm install` to install remaining project dependencies, then `pnpm run dev` to start the dev server. Look for 'Ready in' in the terminal to confirm startup.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: "Ran `pnpm exec shadcn@latest init` — components.json present in the project root",
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Ran `pnpm exec shadcn@latest add separator` — src/components/ui/separator.tsx exists",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Dependencies installed without errors (pnpm install)",
    },
    {
      id: `${taskId}-ac-4`,
      taskId,
      order: 4,
      isRequired: true,
      description: "Next.js dev server starts and the terminal shows 'Ready'",
    },
    {
      id: `${taskId}-ac-5`,
      taskId,
      order: 5,
      isRequired: true,
      description: "Preview shows the To-Do List app with mock todos loaded",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-shadcn-level1",
    taskName: "Setup Development Environment",
    order: 1,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory:
      "As a developer, I need to initialize shadcn, add the Separator component via the shadcn CLI, install all project dependencies, and start the dev server so the app is fully running and I understand the complete shadcn setup workflow.",
  };
}

function buildShadcnTaskTwo(): ITask {
  const taskId = "tutorial-shadcn-level1-task2";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        'In src/app/page.tsx, find the <h1> tag inside the <header> and change the text from "My To-Do List" to "Task Tracker".',
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
      description: 'Header in src/app/page.tsx updated from "My To-Do List" to "Task Tracker"',
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
    levelId: "tutorial-shadcn-level1",
    taskName: "Update the Page Header",
    order: 2,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory:
      "As a developer, I need to update the app header in src/app/page.tsx so I can practice making a targeted UI change and verifying it live through Next.js hot-reload.",
  };
}

export const NEXTJS_SHADCN_TUTORIAL_DATA: TutorialWorkspaceData = {
  stackKey: "nextjs-shadcn",
  stackLabel: "Next.js + shadcn/ui",
  scenarioTitle: "Next.js + shadcn/ui Tutorial",
  scenarioDescription:
    "Initialize shadcn, add your first component via the CLI, spin up the dev server, then make a live UI change and verify it through hot-reload.",
  level: 1,
  tasks: [buildShadcnTaskOne(), buildShadcnTaskTwo()],
};

export const STEPS: TutorialStep[] = [
  // ── Phase 1: Board orientation ────────────────────────────────────────────
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

  // ── Phase 2: shadcn setup (init + add separator) ──────────────────────────
  {
    id: "shadcn-terminal",
    title: "Switch to Terminal",
    instruction: "Open the Terminal tab to run the shadcn CLI commands.",
    hint: "Click the highlighted Terminal tab.",
    target: "workspace-tab-terminal",
    preferSide: "bottom",
  },
  {
    id: "shadcn-init",
    title: "Initialize shadcn",
    instruction:
      "Run `pnpm exec shadcn@latest init` to initialize shadcn in the project. This creates components.json and configures the CLI for this codebase. When prompted, accept the defaults.",
    hint: "Run: pnpm exec shadcn@latest init",
    switchTab: "terminal",
    command: "pnpm exec shadcn@latest init",
    requireCommand: true,
    waitForCompletion: false,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "shadcn-init-wait",
    title: "Answer the Init Prompts",
    instruction:
      "shadcn@4.x will ask you a few questions:\n\n1. **Select a component library** — choose Radix (default, press Enter)\n2. **Which preset would you like to use?** — pick any you like (Nova is a good default)\n\nFor any remaining prompts just press Enter to accept the defaults. Click Done once the terminal shows a success or completion message.",
    hint: 'Use arrow keys to navigate each prompt, Enter to confirm. Click Done once init finishes.',
    switchTab: "terminal",
    target: "terminal-panel",
    confirmLabel: "Init Complete",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "shadcn-add",
    title: "Add the Separator Component",
    instruction:
      "Now add a specific component with the shadcn CLI. This creates src/components/ui/separator.tsx — shadcn copies the source directly into your project so you can customize it freely.",
    hint: "Run: pnpm exec shadcn@latest add separator",
    switchTab: "terminal",
    command: "pnpm exec shadcn@latest add separator",
    requireCommand: true,
    waitForCompletion: false,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "shadcn-add-wait",
    title: "Wait for the Component to Install",
    instruction:
      "shadcn will fetch the Separator source and install any needed Radix dependencies (`@radix-ui/react-separator`). When the terminal shows the component was created, click Done.",
    hint: 'Look for the "Created" line in the terminal output.',
    switchTab: "terminal",
    target: "terminal-panel",
    confirmLabel: "Component Installed",
    requireTargetClick: false,
    preferSide: "left",
  },

  // ── Phase 3: pnpm install + dev server ─────────────────────────────────────
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

  // ── Phase 4: Preview & Task 1 tests ──────────────────────────────────────
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
      "Confirm the To-Do List app is running in Preview. You should see the task list with mock todos.",
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

  // ── Phase 5: Task 2 — Update the page header ─────────────────────────────
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
    id: "search-open-panel",
    title: "Open Search Tool",
    instruction: "Click the Search icon in the Dev Sidebar to open file search.",
    hint: "Use the highlighted Search icon in the sidebar activity bar.",
    target: "tutorial-search-button",
    switchTab: "editor",
    preferSide: "left",
  },
  {
    id: "search-type-query",
    title: "Search for the Header Text",
    instruction:
      'Search for "My To-Do List" to find the heading you need to update in the page component.',
    hint: 'Type "My To-Do List" in the search box and click the highlighted result snippet.',
    target: "tutorial-search-result-item",
    spotlightTarget: "tutorial-search-panel",
    switchTab: "editor",
    requireTargetClick: true,
    preferSide: "left",
  },
  {
    id: "search-works-confirm",
    title: "Search Works",
    instruction:
      "Great. Search opened page.tsx right at the header — this is the element you'll update.",
    hint: "Click Next",
    target: "editor-workspace",
    confirmLabel: "Next",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "task-two-header-edit",
    title: "Update the Page Header",
    instruction:
      'In src/app/page.tsx, change the <h1> text from "My To-Do List" to "Task Tracker". Save the file (Ctrl+S) — Next.js will hot-reload the preview automatically.',
    hint: "Find the <h1> tag inside the <header> element and update its text content. Save with Ctrl+S.",
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

  // ── Phase 6: Submit Sprint ────────────────────────────────────────────────
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
    hint: 'Example: "I initialized shadcn with `pnpm exec shadcn@latest init`, added the Separator component via `pnpm exec shadcn@latest add separator`, then ran pnpm install and pnpm run dev to spin up the app. For Task 2 I found the header with the Search tool and updated it in src/app/page.tsx, verifying the change instantly through Next.js hot-reload."',
    copyText:
      "I initialized shadcn with `pnpm exec shadcn@latest init`, added the Separator component via `pnpm exec shadcn@latest add separator`, then ran pnpm install and pnpm run dev to spin up the app. For Task 2 I found the header with the Search tool and updated it in src/app/page.tsx, verifying the change instantly through Next.js hot-reload.",
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
      "Click the Frontend checkbox — this project is frontend-only.\nNote: In real workspace, this will be checked strictly. Click Next.",
    hint: "",
    targets: ["impacted-layer-frontend"],
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
