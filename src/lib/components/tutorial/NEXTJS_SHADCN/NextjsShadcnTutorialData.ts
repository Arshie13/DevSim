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
        "This project is frontend-only — no database or .env is needed. Just install dependencies and start the dev server.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Read README.md first. It explains the project structure and the two-step setup: npm install, then npm run dev.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "The app runs on http://localhost:3000 by default. Look for the 'Ready in' message in the terminal to confirm the server started.",
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
      description: "Next.js dev server starts and the terminal shows 'Ready'",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Preview shows the To-Do List app with mock todos loaded",
    },
  ];

  return {
    id: taskId,
    taskName: "Prepare Development Environment",
    order: 1,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory:
      "As a developer, I need to set up the Next.js + shadcn UI development environment so that I can start working on the To-Do List app.",
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
        'In src/app/page.tsx, find the <h1> tag inside the <header> and change the text from "My To-Do List" to "Task Tracker". Save the file — Next.js hot-reloads instantly.',
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "To add a new shadcn component, run `npx shadcn@latest add separator` in the terminal. shadcn generates the component file at src/components/ui/separator.tsx automatically.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        'Import the Separator at the top of page.tsx: `import { Separator } from "@/components/ui/separator"`. Then place `<Separator className="my-4" />` between the stats cards and the Add Task card.',
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
      description:
        "Separator component added via `npx shadcn@latest add separator` — file exists at src/components/ui/separator.tsx",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Separator imported and placed in src/app/page.tsx between sections",
    },
    {
      id: `${taskId}-ac-4`,
      taskId,
      order: 4,
      isRequired: true,
      description: "Preview shows the updated heading and a visible separator line between sections",
    },
  ];

  return {
    id: taskId,
    taskName: "Update UI & Add a shadcn Component",
    order: 2,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory:
      "As a developer, I need to update the app header and add a new shadcn Separator component so I can practice editing real UI and using the shadcn CLI to extend the component library.",
  };
}

export const NEXTJS_SHADCN_TUTORIAL_DATA: TutorialWorkspaceData = {
  stackKey: "nextjs-shadcn",
  stackLabel: "Next.js + shadcn/ui",
  scenarioTitle: "Next.js + shadcn/ui Tutorial",
  scenarioDescription:
    "Set up the Next.js tutorial workspace by reading docs, installing dependencies, starting the dev server, and verifying the app in preview.",
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

  // ── Phase 2: Terminal setup ───────────────────────────────────────────────
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
    hint: "Run: npm install",
    switchTab: "terminal",
    command: "npm install",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-dev-start",
    title: "Start Development Server",
    instruction:
      "Start the Next.js app in development mode. The step advances automatically once the server is ready.",
    hint: "Run: npm run dev",
    command: "npm run dev",
    requireCommand: true,
    waitForTerminalOutput: ["localhost:3000", "Ready in"],
    target: "terminal-panel",
    preferSide: "left",
  },

  // ── Phase 3: Preview & Task 1 tests ──────────────────────────────────────
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

  // ── Phase 4: Task 2 board review ─────────────────────────────────────────
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
    instruction: "Open Task 2 and review its requirements.",
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

  // ── Phase 5: Update the header ────────────────────────────────────────────
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
    hint: 'Find the <h1> tag inside the <header> element and update its text content. Save with Ctrl+S.',
    switchTab: "editor",
    target: "editor-workspace",
    confirmLabel: "Header Updated",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "preview-header-button",
    title: "Open Preview",
    instruction: "Click the Preview tab to verify the heading change.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-header-check",
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

  // ── Phase 6: Add shadcn Separator component ───────────────────────────────
  {
    id: "task-two-shadcn-intro",
    title: "Adding a shadcn Component",
    instruction:
      "The project already has some shadcn components (Button, Card, Badge…). Now you'll add a new one using the shadcn CLI — this is how you extend a shadcn project with any component from the library.",
    hint: "Click Next to open the terminal and run the add command.",
    target: "editor-workspace",
    confirmLabel: "Next",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "task-two-shadcn-terminal",
    title: "Switch to Terminal",
    instruction: "Open the Terminal tab to run the shadcn add command.",
    hint: "Click the highlighted Terminal tab.",
    target: "workspace-tab-terminal",
    preferSide: "bottom",
  },
  {
    id: "task-two-shadcn-add",
    title: "Add the Separator Component",
    instruction:
      "Run the shadcn CLI to generate the Separator component. It will create src/components/ui/separator.tsx automatically — no manual file creation needed.",
    hint: "Run: npx shadcn@latest add separator",
    switchTab: "terminal",
    command: "npx shadcn@latest add separator",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "task-two-shadcn-view",
    title: "View the Generated Component",
    instruction:
      "Open src/components/ui/separator.tsx in the editor to see the component shadcn just generated. Notice how it wraps a Radix UI primitive with Tailwind classes — this is the shadcn pattern.",
    hint: "Find separator.tsx in the file explorer under src/components/ui/ and click it to open.",
    switchTab: "editor",
    target: "editor-workspace",
    confirmLabel: "Got It",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "task-two-shadcn-use",
    title: "Use the Separator in the Page",
    instruction:
      'Open src/app/page.tsx and add the Separator between the stats section and the "Add a new task" card.\n\n1. Import: `import { Separator } from "@/components/ui/separator"`\n2. Place `<Separator className="my-2" />` between the stats grid and the next Card.',
    hint: "Add the import at the top of the file, then place <Separator className=\"my-2\" /> between the stats cards and the Add Task card. Save the file.",
    switchTab: "editor",
    target: "editor-workspace",
    confirmLabel: "Separator Added",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "preview-task-two-button",
    title: "Open Preview Again",
    instruction: "Click the Preview tab to verify all Task 2 changes.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-task-two-check",
    title: "Verify Task 2 Changes",
    instruction:
      'Check that Preview shows "Task Tracker" as the heading and a horizontal separator line between the stats and the task form.',
    hint: 'Look for the updated "Task Tracker" heading and the thin divider line below the stats cards.',
    target: "tutorial-preview-panel",
    switchTab: "preview",
    confirmLabel: "Changes Verified",
    requireTargetClick: false,
    preferSide: "left",
  },

  // ── Phase 7: Tests ────────────────────────────────────────────────────────
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

  // ── Phase 8: Submit sprint ────────────────────────────────────────────────
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
    hint: 'Example: "I set up the Next.js + shadcn/ui stack with npm install and npm run dev. For Task 2, I updated the page header in page.tsx and used the shadcn CLI to add a Separator component with npx shadcn@latest add separator. I then imported and placed it between sections in the layout. This showed me how shadcn generates ready-to-use components and how hot-reload makes UI changes instant."',
    copyText:
      "I set up the Next.js + shadcn/ui stack with npm install and npm run dev. For Task 2, I updated the page header in page.tsx and used the shadcn CLI to add a Separator component with npx shadcn@latest add separator. I then imported and placed it between sections in the layout. This showed me how shadcn generates ready-to-use components and how hot-reload makes UI changes instant.",
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
