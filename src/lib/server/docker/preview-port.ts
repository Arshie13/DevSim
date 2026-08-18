/**
 * Maps Docker container port keys (e.g. "5173/tcp" → "5173") to host-published ports.
 * Prefer Vite (5173), then typical web (3000), then API (5000), then any remaining.
 */

const PREFERRED_CONTAINER_PORTS = ["5173", "3000", "5000"] as const;
const PREFERRED_KEYS = new Set<string>(PREFERRED_CONTAINER_PORTS);
const DATABASE_PORTS = new Set(["5432", "27017", "3306", "6379"]);

export function orderedHostPorts(previewPorts: Record<string, number>): number[] {
  const seen = new Set<number>();
  const out: number[] = [];

  for (const key of PREFERRED_CONTAINER_PORTS) {
    const hp = previewPorts[key];
    if (hp != null && !DATABASE_PORTS.has(key) && !seen.has(hp)) {
      seen.add(hp);
      out.push(hp);
    }
  }

  const restKeys = Object.keys(previewPorts)
    .filter((k) => !PREFERRED_KEYS.has(k) && !DATABASE_PORTS.has(k))
    .sort((a, b) => Number(a) - Number(b));

  for (const k of restKeys) {
    const hp = previewPorts[k];
    if (hp != null && !seen.has(hp)) {
      seen.add(hp);
      out.push(hp);
    }
  }

  return out;
}

/** Deterministic pick when probe is skipped or nothing responds yet. */
export function pickPreviewHostPort(previewPorts: Record<string, number>): number | null {
  const ordered = orderedHostPorts(previewPorts);
  return ordered[0] ?? null;
}

async function portRespondsHttp(hostPort: number, timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`http://127.0.0.1:${hostPort}/`, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(id);
    return true;
  } catch {
    clearTimeout(id);
    return false;
  }
}

/**
 * Try each candidate host port in preference order; return the first that accepts HTTP.
 * If none respond (e.g. dev server not started), returns deterministic fallback (first preferred).
 */
export async function pickPreviewHostPortWithProbe(
  previewPorts: Record<string, number>,
  options?: { timeoutMs?: number },
): Promise<number | null> {
  const timeoutMs = options?.timeoutMs ?? 900;
  const ordered = orderedHostPorts(previewPorts);
  if (ordered.length === 0) return null;

  for (const hp of ordered) {
    if (await portRespondsHttp(hp, timeoutMs)) {
      return hp;
    }
  }

  return ordered[0];
}
