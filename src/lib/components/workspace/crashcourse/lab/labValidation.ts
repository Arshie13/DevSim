import type { ILearningSection } from "$lib/types";

type InteractiveConfig = NonNullable<ILearningSection["interactiveConfig"]>;

type FunctionTestCase = NonNullable<InteractiveConfig["testCases"]>[number];
type EditableRegion = NonNullable<InteractiveConfig["editableRegions"]>[number];

export function normalizeCommand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function resolvePath(currentPath: string, targetPath: string): string {
  const base = targetPath.startsWith("/") ? [] : currentPath.split("/").filter(Boolean);
  const incoming = targetPath.split("/").filter(Boolean);

  for (const segment of incoming) {
    if (segment === ".") continue;
    if (segment === "..") {
      base.pop();
    } else {
      base.push(segment);
    }
  }

  return `/${base.join("/")}` || "/";
}

export function simulateTerminalNavigation(commands: string[], config: InteractiveConfig) {
  const tree = config.directoryTree ?? { "/workspace": ["client", "server", "README.md"] };
  const visited = new Set<string>();
  let pointer = config.initialDirectory ?? "/workspace";
  visited.add(pointer);

  for (const rawCommand of commands) {
    const normalized = normalizeCommand(rawCommand);
    if (!normalized) continue;

    const parts = normalized.split(" ");
    const command = parts[0];
    const argument = parts.slice(1).join(" ");

    if (command !== "cd") continue;

    const target = argument || "/";
    const resolved = resolvePath(pointer, target);
    if (!tree[resolved]) continue;
    pointer = resolved;
    visited.add(pointer);
  }

  return {
    visited,
    finalPath: pointer,
  };
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    const bKeys = Object.keys(bRecord);

    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aRecord[key], bRecord[key]));
  }

  return false;
}

function toDisplay(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeCodeForRunner(code: string): string {
  // Keep the transform intentionally lightweight for browser execution.
  return code
    .replace(/^\s*import\s+[^\n]*\n/gm, "")
    .replace(/\bexport\s+/g, "")
    .replace(/\b(private|public|protected|readonly)\s+/g, "")
    .replace(/\)\s*:\s*[A-Za-z_$][\w<>,\s\[\]\|&?.]*\s*(?=\{)/g, ")")
    .replace(/([A-Za-z_$][\w$]*)\s*:\s*[A-Za-z_$][\w<>,\s\[\]\|&?.]*/g, "$1");
}

export async function evaluateFunctionLab(
  interactiveCode: string,
  entryPoint: string,
  testCases: FunctionTestCase[],
): Promise<{ passed: boolean; feedback: string }> {
  const executableCode = sanitizeCodeForRunner(interactiveCode);

  try {
    const exported = new Function(
      `${executableCode}\nreturn typeof ${entryPoint} !== "undefined" ? ${entryPoint} : undefined;`,
    )() as unknown;

    if (typeof exported !== "function") {
      return {
        passed: false,
        feedback: `Could not find a callable ${entryPoint} function. Keep the function name unchanged.`,
      };
    }

    const runnable = exported as (...args: unknown[]) => unknown;
    const failedCases: string[] = [];

    for (const testCase of testCases) {
      try {
        const maybePromise = runnable(...testCase.input);
        const result =
          maybePromise instanceof Promise ? await maybePromise : maybePromise;
        if (!deepEqual(result, testCase.expected)) {
          failedCases.push(
            `${testCase.label} (expected: ${toDisplay(testCase.expected)}, received: ${toDisplay(result)})`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown runtime error";
        failedCases.push(`${testCase.label} (runtime error: ${message})`);
      }
    }

    if (failedCases.length > 0) {
      return {
        passed: false,
        feedback: `Test cases failed: ${failedCases.join("; ")}`,
      };
    }

    return {
      passed: true,
      feedback: `Great job. ${testCases.length}/${testCases.length} hidden checks passed.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to execute code";
    return {
      passed: false,
      feedback: `Could not execute this code snippet yet: ${message}`,
    };
  }
}

export function evaluateEditableRegionsLab(
  interactiveCode: string,
  starterCode: string,
  editableRegions: EditableRegion[],
): { passed: boolean; feedback: string } {
  let template = starterCode;
  const regionTokens: string[] = [];

  for (let index = 0; index < editableRegions.length; index += 1) {
    const region = editableRegions[index];
    const token = `__EDITABLE_REGION_${index}__`;
    const replacement = template.replace(region.placeholder, token);

    if (replacement === template) {
      return {
        passed: false,
        feedback: "Lab configuration error: editable placeholder not found in starter code.",
      };
    }

    template = replacement;
    regionTokens.push(token);
  }

  let templatePattern = escapeRegExp(template);
  for (const token of regionTokens) {
    templatePattern = templatePattern.replace(escapeRegExp(token), "([\\s\\S]*?)");
  }

  const match = new RegExp(`^\\s*${templatePattern}\\s*$`).exec(interactiveCode);
  if (!match) {
    return {
      passed: false,
      feedback: "Keep the provided structure and only edit the intended text region(s).",
    };
  }

  let hasMeaningfulEdit = false;
  for (let index = 0; index < editableRegions.length; index += 1) {
    const region = editableRegions[index];
    const actual = (match[index + 1] ?? "").trim();
    const caseSensitive = region.caseSensitive ?? true;
    const placeholder = region.placeholder.trim();
    const edited = caseSensitive
      ? actual !== placeholder
      : actual.toLowerCase() !== placeholder.toLowerCase();

    if (edited) {
      hasMeaningfulEdit = true;
    }
  }

  if (!hasMeaningfulEdit) {
    return {
      passed: false,
      feedback: "Update at least one editable region before checking your answer.",
    };
  }

  return {
    passed: true,
    feedback: "Great job. You updated the required text while preserving structure.",
  };
}
