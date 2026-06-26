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

function buildNestjsTaskOne(): ITask {
  const taskId = "tutorial-nestjs-level1-task1";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        "Read README.md first — it lists the exact setup sequence including the .env copy step before running migrations.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Copy .env.example to .env before running any Prisma commands. The DATABASE_URL must be set or migrations will fail.",
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
      description: ".env file configured with valid DATABASE_URL",
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
      description: "NestJS dev server starts and responds at /api/todos",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-nestjs-level1",
    taskName: "Prepare Development Environment",
    order: 1,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "server",
    userStory:
      "As a developer, I need to set up the NestJS development environment so that I can start building and testing the To-Do List API.",
  };
}

function buildNestjsTaskTwo(): ITask {
  const taskId = "tutorial-nestjs-level1-task2";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        "Open prisma/schema.prisma. Add `priority Int @default(0)` as a new field inside the Todo model.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "After editing the schema, stop the dev server (Ctrl+C), then run `pnpm exec prisma migrate dev --name add-priority-to-todo`.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "Restart the server with `pnpm run dev` and verify the API still responds at /api/todos.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: "Added `priority Int @default(0)` field to the Todo model in prisma/schema.prisma",
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Migration runs successfully — new `priority` column created in the todos table",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Dev server restarts without errors after schema change",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-nestjs-level1",
    taskName: "Add Priority Field to Todo",
    order: 2,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "server",
    userStory:
      "As a developer, I need to add a priority field to the Todo model in prisma/schema.prisma so I can practice making and migrating a targeted schema change.",
  };
}

export const NESTJS_POSTGRES_PRISMA_TUTORIAL_DATA: TutorialWorkspaceData = {
  stackKey: "nestjs-postgres-prisma",
  stackLabel: "NestJS + Postgres + Prisma",
  scenarioTitle: "NestJS + Postgres + Prisma Tutorial",
  scenarioDescription:
    "Set up the NestJS tutorial workspace by reading docs, installing dependencies, configuring the environment, running Prisma migrations, seeding the database, and verifying the API.",
  level: 1,
  tasks: [buildNestjsTaskOne(), buildNestjsTaskTwo()],
};

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
      "Start the NestJS app in development mode. The step will advance automatically once the server is ready.",
    hint: "Run: pnpm run dev",
    command: "pnpm run dev",
    requireCommand: true,
    waitForTerminalOutput: ["is running on", "Nest application successfully"],
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "preview-button",
    title: "Open Preview",
    instruction: "Click the Preview tab to open the live API preview.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-check",
    title: "Verify API Is Running",
    instruction:
      "Confirm the NestJS API is responding in the Preview panel. You should see a JSON response from /api/todos.",
    hint: "Once you see the API response in the preview iframe, continue to the testing step.",
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
    title: "Search Files",
    instruction:
      'Search for "completed Boolean" to find the Prisma schema file you need to edit for Task 2.',
    hint: 'Type "completed Boolean" in the search box and click the highlighted result snippet.',
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
      "Great. Search opened the Prisma schema in the editor and shows exactly where the Todo fields are.",
    hint: "Click Next",
    target: "editor-workspace",
    confirmLabel: "Next",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "task-two-schema-edit",
    title: "Add Priority Field to Schema",
    instruction:
      'Edit prisma/schema.prisma and add `priority Int @default(0)` as a new field inside the Todo model, below the `completed` field.',
    hint: "Add the field, then save the file (Ctrl+S).",
    switchTab: "editor",
    target: "editor-workspace",
    confirmLabel: "Schema Change Done",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "terminal-stop-server",
    title: "Stop Dev Server",
    instruction:
      "Before running the migration, press Ctrl+C in the terminal to stop the running development server.",
    hint: "Press Ctrl+C in the terminal panel, then click Server Stopped below.",
    switchTab: "terminal",
    target: "terminal-panel",
    confirmLabel: "Server Stopped",
    requireTargetClick: false,
    preferSide: "left",
  },
  {
    id: "terminal-migrate-priority",
    title: "Run Migration for New Field",
    instruction: "Apply the schema change to the database with a named migration.",
    hint: "Run: pnpm exec prisma migrate dev --name add-priority-to-todo",
    switchTab: "terminal",
    command: "pnpm exec prisma migrate dev --name add-priority-to-todo",
    requireCommand: true,
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "terminal-dev-restart",
    title: "Restart Dev Server",
    instruction: "Start the development server again to verify the schema change works.",
    hint: "Run: pnpm run dev",
    switchTab: "terminal",
    command: "pnpm run dev",
    requireCommand: true,
    waitForTerminalOutput: ["is running on", "Nest application successfully"],
    target: "terminal-panel",
    preferSide: "left",
  },
  {
    id: "preview-task-two-button",
    title: "Open Preview Again",
    instruction: "Click the Preview tab to verify the API still works after the schema change.",
    hint: "Click the highlighted Preview tab in the workspace tabs.",
    target: "workspace-tab-preview",
    preferSide: "bottom",
  },
  {
    id: "preview-task-two-check",
    title: "Verify API Still Works",
    instruction:
      "Confirm the API responds correctly in Preview. The todos should load and include the new priority field.",
    hint: "Look for a JSON response at /api/todos — each todo should now have a priority property.",
    target: "tutorial-preview-panel",
    switchTab: "preview",
    confirmLabel: "Changes Verified",
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
    hint: 'Example: "I set up the NestJS + Postgres + Prisma stack by following the README — installing dependencies, copying the .env file, running Prisma migrations, seeding the database, and starting the dev server. For Task 2, I used search to locate the Prisma schema and added a priority field to the Todo model, then ran a migration and restarted the server. This tutorial showed me how the NestJS backend, Prisma ORM, and workspace tools work together."',
    copyText:
      "I set up the NestJS + Postgres + Prisma stack by following the README — installing dependencies, copying the .env file, running Prisma migrations, seeding the database, and starting the dev server. For Task 2, I used search to locate the Prisma schema and added a priority field to the Todo model, then ran a migration and restarted the server. This tutorial showed me how the NestJS backend, Prisma ORM, and workspace tools work together.",
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
      "Click Backend + Database checkboxes.\nNote: In real workspace, this will be checked strictly. Click Next.",
    hint: "",
    targets: ["impacted-layer-backend", "impacted-layer-database"],
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
    instruction: "Your sprint is being recorded. The tutorial completion summary will appear shortly.",
    hint: "Hang tight — the finish modal is loading.",
    preferSide: "bottom",
  },
];
