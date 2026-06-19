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

function buildPernTaskOne(): ITask {
  const taskId = "tutorial-pern-level1-task1";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content:
        "The project has separate package.json files in root, client, and server. Install dependencies in each relevant location.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content:
        "Read README.md first for environment configuration and setup sequence before running commands.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content:
        "Run Prisma migration from the server workspace so database tables are created before development run.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: "Dependencies installed for root, client, and server without errors",
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Prisma migration command runs successfully",
    },
    {
      id: `${taskId}-ac-3`,
      taskId,
      order: 3,
      isRequired: true,
      description: "Development server and preview load successfully",
    },
  ];

  return {
    levelId: "tutorial-pern-level1",
    id: taskId,
    taskName: "Prepare Development Environment",
    order: 1,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "both",
    userStory: "As a developer, I need to set up the development environment so that I can start working on the project.",
  };
}

function buildPernTaskTwo(): ITask {
  const taskId = "tutorial-pern-level1-task2";

  const hints: IHints[] = [
    {
      id: `${taskId}-hint-1`,
      order: 1,
      taskId,
      content: "Open client/src/pages/TodoPage.tsx. This is the file for Task 2.",
    },
    {
      id: `${taskId}-hint-2`,
      order: 2,
      taskId,
      content: "Update the main page heading text from To-Do List Tutorial to Task Tracker Tutorial.",
    },
    {
      id: `${taskId}-hint-3`,
      order: 3,
      taskId,
      content: "Save the file, then confirm the new title appears in Preview.",
    },
  ];

  const acceptanceCriteria: IAcceptanceCriteria[] = [
    {
      id: `${taskId}-ac-1`,
      taskId,
      order: 1,
      isRequired: true,
      description: "Updated client/src/pages/TodoPage.tsx heading from 'To-Do List Tutorial' to 'Task Tracker Tutorial'",
    },
    {
      id: `${taskId}-ac-2`,
      taskId,
      order: 2,
      isRequired: true,
      description: "Preview shows the new Task Tracker Tutorial heading",
    },
  ];

  return {
    id: taskId,
    levelId: "tutorial-pern-level1",
    taskName: "Make a Simple UI Change",
    order: 2,
    hints,
    acceptanceCriteria,
    learningSections: [],
    isCompleted: false,
    testType: "client",
    userStory: "As a developer, I need to update the Todo page title in client/src/pages/TodoPage.tsx so I can practice making and validating a targeted UI change.",
  };
}

const PERN_TUTORIAL_DATA: TutorialWorkspaceData = {
  stackKey: "react-express-postgres-prisma",
  stackLabel: "PERN",
  scenarioTitle: "PERN Stack Tutorial",
  scenarioDescription:
    "Set up the PERN tutorial workspace by reading docs, preparing dependencies, running migration, and verifying preview.",
  level: 1,
  tasks: [buildPernTaskOne(), buildPernTaskTwo()],
};

const DEFAULT_TUTORIAL_DATA: TutorialWorkspaceData = {
  ...PERN_TUTORIAL_DATA,
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
    normalized.includes("react") ||
    normalized.includes("express") ||
    normalized.includes("postgres") ||
    normalized.includes("prisma") ||
    normalized.includes("pern")
  ) {
    return PERN_TUTORIAL_DATA;
  }

  return {
    ...DEFAULT_TUTORIAL_DATA,
    stackLabel: stackName || DEFAULT_TUTORIAL_DATA.stackLabel,
  };
}

 export const STEPS: TutorialStep[] = [
    {
      id: 'board-kanban',
      title: 'Open Kanban View',
      instruction: 'Go to the Board tab, then click Kanban so you can see your sprint task cards.',
      hint: 'Click the highlighted Kanban toggle in the board panel.',
      target: 'board-subtab-kanban',
      switchTab: 'board',
      boardSubTab: 'scenario',
      preferSide: 'left',
    },
    {
      id: 'task-one-open',
      title: 'Open Task 1 Ticket',
      instruction: 'Click Task 1 to read its user story and acceptance criteria.',
      hint: 'The first highlighted task card opens the task details modal.',
      target: 'board-task-ticket',
      boardSubTab: 'board',
      preferSide: 'left',
    },
    {
      id: 'task-one-close-modal',
      title: 'Close Task Details',
      instruction: 'After reviewing Task 1 requirements, close the task modal to continue.',
      hint: 'The whole task modal is highlighted. Click Close inside the modal.',
      target: 'board-task-modal',
      preferSide: 'left',
    },
    {
      id: 'introduce-sidebar',
      title: 'Explore The Dev Sidebar',
      instruction: 'The Dev Sidebar has useful tools like the file explorer and Search. Click around to get familiar with it.',
      hint: 'Explore the sidebar briefly, then click Done to continue.',
      target: 'tutorial-dev-sidebar',
      switchTab: 'editor',
      confirmLabel: 'Done Exploring Sidebar',
      requireTargetClick: false,
      preferSide: 'left',
    },
    {
      id: 'readme-open',
      title: 'Open README.md',
      instruction: 'Click README.md in the explorer so you can follow setup instructions.',
      hint: 'Open the highlighted README file item.',
      target: 'tutorial-readme-file',
      targets: ['tutorial-readme-file'],
      requiredFileContains: 'readme',
      switchTab: 'editor',
      preferSide: 'right',
    },
    {
      id: 'read-readme',
      title: 'Read README Instructions',
      instruction: 'Review the README in the workspace editor and confirm when done.',
      hint: 'Use the Done button after reading the setup guide.',
      target: 'editor-workspace',
      confirmLabel: 'Done Reading README',
      requireTargetClick: false,
      preferSide: 'left',
    },
    {
      id: 'click-terminal',
      title: 'Open the Terminal Tab',
      instruction: 'Click the Terminal Tab Button to open it',
      hint: '',
      target: 'workspace-tab-terminal',
      targets: ['workspace-tab-terminal'],
      requiredFileContains: 'readme',
      preferSide: 'right',
    },
    {
      id: 'terminal-install-root',
      title: 'Install Root Dependencies',
      instruction: 'Install dependencies in the root project folder (terminal starts at /workspace by default).',
      hint: 'Run: pnpm install',
      switchTab: 'terminal',
      command: 'pnpm install',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-cd-client',
      title: 'Open Client Folder',
      instruction: 'Move to the client folder for frontend package setup.',
      hint: 'Run: cd client',
      switchTab: 'terminal',
      command: 'cd client',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-install-client',
      title: 'Install Client Dependencies',
      instruction: 'Install frontend dependencies.',
      hint: 'Run: pnpm install',
      switchTab: 'terminal',
      command: 'pnpm install',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-cd-server',
      title: 'Open Server Folder',
      instruction: 'Move to the server folder to set up backend and Prisma.',
      hint: 'Run: cd ../server',
      switchTab: 'terminal',
      command: 'cd ../server',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-install-server',
      title: 'Install Server Dependencies',
      instruction: 'Install server dependencies.',
      hint: 'Run: pnpm install',
      switchTab: 'terminal',
      command: 'pnpm install',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-prisma-generate',
      title: 'Generate Prisma Client',
      instruction: 'Generate Prisma client artifacts before running migrations.',
      hint: 'Run: pnpm exec prisma generate',
      switchTab: 'terminal',
      command: 'pnpm exec prisma generate',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-prisma-migrate',
      title: 'Run Prisma Migration',
      instruction: 'Apply schema migrations to the development database.',
      hint: 'Run: pnpm exec prisma migrate dev',
      switchTab: 'terminal',
      command: 'pnpm exec prisma migrate dev',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-prisma-seed',
      title: 'Seed Database',
      instruction: 'Seed the database with initial records.',
      hint: 'Run: pnpm exec prisma db seed',
      switchTab: 'terminal',
      command: 'pnpm exec prisma db seed',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-back-root',
      title: 'Return to Root Folder',
      instruction: 'Go back to the root folder before starting the app.',
      hint: 'Run: cd ..',
      switchTab: 'terminal',
      command: 'cd ..',
      requireCommand: true,
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'terminal-dev-start',
      title: 'Start Development Server',
      instruction: 'Start the app in development mode. The step will advance automatically once both the client and server are ready.',
      hint: 'Run: pnpm run dev',
      command: 'pnpm run dev',
      requireCommand: true,
      waitForTerminalOutput: ['VITE', 'Local:'],
      target: 'terminal-panel',
      preferSide: 'left',
    },
    {
      id: 'preview-button',
      title: 'Open Preview',
      instruction: 'Click the Preview tab to open the live application preview.',
      hint: 'Click the highlighted Preview tab in the workspace tabs.',
      target: 'workspace-tab-preview',
      preferSide: 'bottom',
    },
    {
      id: 'preview-check',
      title: 'Verify Running App',
      instruction: 'Confirm the website is running in the Preview panel.',
      hint: 'Once you can see the app in the preview iframe, continue to the testing step.',
      target: 'tutorial-preview-panel',
      switchTab: 'preview',
      confirmLabel: 'Preview Looks Good',
      requireTargetClick: false,
      preferSide: 'left',
    },
    {
      id: 'test-task-one-open-modal',
      title: 'Open Test Modal',
      instruction: 'Click the Test button in the header to open the test modal.',
      hint: 'Use the highlighted Test button.',
      target: 'run-tests-button',
      preferSide: 'bottom',
    },
    {
      id: 'test-task-one-select',
      title: 'Run Task 1 Test',
      instruction: 'Inside the test modal, click the Task 1 run-test button.',
      hint: 'The full test modal is highlighted. Click the Task 1 play button.',
      target: 'test-task-one-run-button',
      spotlightTarget: 'test-selection-modal',
      preferSide: 'left',
    },
    {
      id: 'test-task-one-result-continue',
      title: 'Review Result And Continue',
      instruction: 'Review the test results. When done, click "close" button on the modal.',
      hint: 'Wait for the test run to complete, then click the close button.',
      spotlightTarget: 'test-result-modal',
      target: 'test-result-continue-button',
      requireTargetClick: true,
      preferSide: 'left',
    },
    {
      id: 'task-two-kanban',
      title: 'Back To Kanban',
      instruction: 'Return to the board and open Kanban for Task 2.',
      hint: 'Click the highlighted Kanban toggle to continue.',
      target: 'board-subtab-kanban',
      switchTab: 'board',
      boardSubTab: 'scenario',
      preferSide: 'left',
    },
    {
      id: 'task-two-open',
      title: 'Open Task 2 Ticket',
      instruction: 'Open Task 2 and review its requirements.',
      hint: 'Click on the second task card in the Kanban board.',
      target: 'board-task-ticket-2',
      boardSubTab: 'board',
      preferSide: 'left',
    },
    {
      id: 'task-two-close-modal',
      title: 'Close Task 2 Details',
      instruction: 'After reviewing Task 2 requirements, close the task modal.',
      hint: 'The whole task modal is highlighted. Click Close to continue.',
      target: 'board-task-modal',
      preferSide: 'left',
    },
    {
      id: 'search-open-panel',
      title: 'Open Search Tool',
      instruction: 'Click the Search icon in the Dev Sidebar to open file search.',
      hint: 'Use the highlighted Search icon in the sidebar activity bar.',
      target: 'tutorial-search-button',
      switchTab: 'editor',
      preferSide: 'left',
    },
    {
      id: 'search-type-query',
      title: 'Search Files',
      instruction: 'Search for "To-Do List Tutorial" to find the file containing the old subtitle text.',
      hint: 'Type "To-Do List Tutorial" in the search box and click the highlighted result snippet. There should be two results there, click the one with the <h1> tag.',
      target: 'tutorial-search-result-item',
      spotlightTarget: 'tutorial-search-panel',
      switchTab: 'editor',
      requireTargetClick: true,
      preferSide: 'left',
    },
    {
      id: 'search-works-confirm',
      title: 'Search Works',
      instruction: 'Great. Search opened a file in the editor and helps you find code faster.',
      hint: 'Click Next',
      target: 'editor-workspace',
      confirmLabel: 'Next',
      requireTargetClick: false,
      preferSide: 'left',
    },
    {
      id: 'task-two-ui-edit',
      title: 'Implement Task 2 UI Change',
      instruction: 'Edit client/src/pages/TodoPage.tsx and change the main heading text from "To-Do List Tutorial" to "Task Tracker Tutorial".',
      hint: 'Update the h1 title and save the file.',
      switchTab: 'editor',
      target: 'editor-workspace',
      confirmLabel: 'Task 2 UI Change Done',
      requireTargetClick: false,
      preferSide: 'left',
    },
    {
      id: 'task-two-open-preview',
      title: 'Open Preview Again',
      instruction: 'Click the Preview tab to verify Task 2 changes.',
      hint: 'Click the highlighted Preview tab in the workspace tabs.',
      target: 'workspace-tab-preview',
      preferSide: 'bottom',
    },
    {
      id: 'task-two-preview',
      title: 'Verify UI Changes',
      instruction: 'Check Preview and confirm your Task 2 changes are visible. If the preview is loading, wait a moment and it will refresh automatically.',
      hint: 'Look for "Task Tracker Tutorial" in the preview iframe.',
      target: 'tutorial-preview-panel',
      switchTab: 'preview',
      confirmLabel: 'Changes Verified',
      requireTargetClick: false,
      preferSide: 'left',
    },
        {
      id: 'test-task-two-open-modal',
      title: 'Open Test Modal',
      instruction: 'Click the Test button in the header to open the test modal.',
      hint: 'Use the highlighted Test button.',
      target: 'run-tests-button',
      preferSide: 'bottom',
    },
    {
      id: 'test-task-two-select',
      title: 'Run Task 2 Test',
      instruction: 'Inside the test modal, click the Task 2 run-test button.',
      hint: 'The full test modal is highlighted. Click the Task 2 play button.',
      target: 'test-task-two-run-button',
      spotlightTarget: 'test-selection-modal',
      preferSide: 'bottom',
    },
    {
      id: 'test-task-two-result-continue',
      title: 'Review Result And Continue',
      instruction: 'Review the test results. When done, click "Close Results" below to continue.',
      hint: 'Wait for the test run to complete, then use the button below.',
      spotlightTarget: 'test-result-modal',
      target: 'test-result-continue-button',
      requireTargetClick: true,
      preferSide: 'left',
    },
    {
      id: 'submit-sprint-click',
      title: 'Submit Sprint',
      instruction: 'Click the Submit Sprint button to submit your completed work and receive rewards.',
      hint: 'Use the highlighted Submit Sprint button in the header.',
      target: 'submit-sprint-button',
      preferSide: 'bottom',
    },
    {
      id: 'submit-sprint-modal-open',
      title: 'Open Submit Sprint Modal',
      instruction: 'A modal will open asking for your mastery reflection. Enter a response describing what you learned and how you approached the tasks.',
      hint: 'Type in the mastery reflection textarea inside the highlighted modal.',
      target: 'submit-sprint-modal',
      confirmLabel: 'Next',
      requireTargetClick: false,
      spotlightTarget: 'submit-sprint-modal',
      preferSide: 'bottom',
    },
    {
      id: 'submit-sprint-reflection',
      title: 'Enter Mastery Reflection',
      instruction: 'Type a short reflection on what you learned. Use the Copy button below to paste the example into the field.',
      hint: 'Example: "I set up the PERN stack by following the README sequence — first installing root dependencies, then client and server packages. For Task 2, I used the search to quickly locate TodoPage.tsx and made the UI change. This tutorial helped me understand the project structure and practice using the terminal and search features."',
      copyText: 'I set up the PERN stack by following the README sequence — first installing root dependencies, then client and server packages. For Task 2, I used the search to quickly locate TodoPage.tsx and made the UI change. This tutorial helped me understand the project structure and practice using the terminal and search features.',
      target: 'mastery-reflection-input',
      confirmLabel: 'Next',
      requireTargetClick: false,
      spotlightTarget: 'submit-sprint-modal',
      preferSide: 'bottom',
    },
    {
      id: 'submit-sprint-layers',
      title: 'Select Impacted Layers (Tutorial Mode)',
      instruction: 'Click Frontend + Database checkboxes.\nNote: In real workspace, this will be checked strictly. Click Next.',
      hint: '',
      targets: ['impacted-layer-frontend', 'impacted-layer-database'],
      confirmLabel: 'Next',
      requireTargetClick: false,
      spotlightTarget: 'submit-sprint-modal',
      preferSide: 'bottom',
    },
    {
      id: 'submit-sprint-confirm',
      title: 'Confirm and Submit',
      instruction: 'Click Submit & Continue to submit your sprint and proceed.',
      hint: 'The Submit & Continue button becomes active once all requirements are met.',
      target: 'submit-sprint-confirm-button',
      spotlightTarget: 'submit-sprint-modal',
      preferSide: 'bottom',
    },
    {
      id: 'finish-tutorial-open-modal',
      title: 'Sprint Submitted!',
      instruction: 'Your sprint is being recorded. The tutorial completion summary will appear shortly.',
      hint: 'Hang tight — the finish modal is loading.',
      preferSide: 'bottom',
    },
  ];
