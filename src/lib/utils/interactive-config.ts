/**
 * Shared definitions for editing a learning_section's `interactive_config`.
 *
 * The admin scenarios page renders one key/value row per config field, where the key is a
 * fixed label (derived from the examples in the schema) and the value is an editable input.
 * Fields are submitted as `cfg:<key>:<kind>` so the server action can rebuild the JSON object
 * without needing a hidden serialized blob.
 */

export type InteractiveMode = 'CODE_EDITOR' | 'TERMINAL_CD' | 'TERMINAL_CMD';

export type ConfigFieldKind = 'text' | 'textarea' | 'lines' | 'json';

export interface ConfigField {
  key: string;
  kind: ConfigFieldKind;
  rows?: number;
  placeholder?: string;
}

/** Prefix that marks a form field as part of the interactive config. */
export const CONFIG_FIELD_PREFIX = 'cfg:';

/**
 * Config keys per interactive mode, in the order they should render.
 *
 * `text`     - single line string
 * `textarea` - multi line string (kept as one string)
 * `lines`    - array of strings, one entry per line
 * `json`     - arbitrary JSON (arrays of objects / records)
 */
export const INTERACTIVE_CONFIG_FIELDS: Record<InteractiveMode, ConfigField[]> = {
  TERMINAL_CD: [
    {
      key: 'instructions',
      kind: 'textarea',
      rows: 3,
      placeholder:
        'Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace.',
    },
    { key: 'initial_directory', kind: 'text', placeholder: '/workspace' },
    {
      key: 'expected_commands',
      kind: 'lines',
      rows: 3,
      placeholder: 'One command per line, e.g.\ncd client\ncd ../server\ncd ..',
    },
    {
      key: 'directory_tree',
      kind: 'json',
      rows: 5,
      placeholder:
        '{\n  "/workspace": ["client", "server", "tests", "README.md"],\n  "/workspace/client": ["src", "package.json"]\n}',
    },
  ],
  CODE_EDITOR: [
    {
      key: 'instructions',
      kind: 'textarea',
      rows: 3,
      placeholder:
        'Update the function to return "Welcome Back" instead of "Hello World".',
    },
    { key: 'language', kind: 'text', placeholder: 'tsx' },
    {
      key: 'starter_code',
      kind: 'textarea',
      rows: 5,
      placeholder: 'export function getUpdatedHeadingText() {\n  return "Hello World";\n}',
    },
    {
      key: 'editable_regions',
      kind: 'json',
      rows: 3,
      placeholder: '[\n  { "placeholder": "Hello World", "case_sensitive": true }\n]',
    },
    { key: 'entry_point', kind: 'text', placeholder: 'getUpdatedHeadingText' },
    {
      key: 'test_cases',
      kind: 'json',
      rows: 5,
      placeholder:
        '[\n  { "input": [], "expected": "Welcome Back", "label": "updated heading text" }\n]',
    },
    {
      key: 'hints',
      kind: 'lines',
      rows: 3,
      placeholder: 'One hint per line, e.g.\nSimple text replacement.',
    },
  ],
  TERMINAL_CMD: [
    {
      key: 'instructions',
      kind: 'textarea',
      rows: 3,
      placeholder:
        'Run the shadcn/ui CLI command to add the Select component. Type the exact command and click Check to verify.',
    },
    {
      key: 'expected_commands',
      kind: 'lines',
      rows: 2,
      placeholder: 'One command per line, e.g.\npnpm dlx shadcn@latest add select',
    },
  ],
};

/** `<input>`/`<textarea>` name for a config field, e.g. `cfg:expected_commands:lines`. */
export function configFieldName(key: string, kind: ConfigFieldKind): string {
  return `${CONFIG_FIELD_PREFIX}${key}:${kind}`;
}

/** Render a stored config value into the string shown in the corresponding form field. */
export function configValueToInput(value: unknown, kind: ConfigFieldKind): string {
  if (value === undefined || value === null) return '';

  if (kind === 'lines') {
    if (Array.isArray(value)) {
      return value.map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry))).join('\n');
    }
    return JSON.stringify(value, null, 2);
  }

  if (kind === 'json') {
    return JSON.stringify(value, null, 2);
  }

  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

export type ParseConfigResult =
  | { ok: true; config: Record<string, unknown> | null }
  | { ok: false; message: string };

/**
 * Rebuild an `interactive_config` object from the `cfg:<key>:<kind>` fields of a submitted form.
 * Empty values are omitted so an untouched field does not persist as `""` or `[]`.
 */
export function parseInteractiveConfig(formData: FormData): ParseConfigResult {
  const config: Record<string, unknown> = {};

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith(CONFIG_FIELD_PREFIX)) continue;

    const rest = name.slice(CONFIG_FIELD_PREFIX.length);
    const separator = rest.lastIndexOf(':');
    if (separator <= 0) continue;

    const key = rest.slice(0, separator);
    const kind = rest.slice(separator + 1) as ConfigFieldKind;
    const value = typeof raw === 'string' ? raw : '';
    if (value.trim() === '') continue;

    if (kind === 'lines') {
      const lines = value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (lines.length > 0) config[key] = lines;
    } else if (kind === 'json') {
      try {
        config[key] = JSON.parse(value) as unknown;
      } catch {
        return { ok: false, message: `Invalid JSON for "${key}"` };
      }
    } else {
      config[key] = value;
    }
  }

  return { ok: true, config: Object.keys(config).length > 0 ? config : null };
}
