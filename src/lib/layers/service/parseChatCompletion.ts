/**
 * Extracts the assistant text from an OpenAI-compatible chat completion
 * response.
 *
 * 9Router (the local AI gateway) answers in three different framings:
 *
 *  1. Pure JSON — the default:
 *       {"choices":[{"message":{"content":"..."}}]}
 *
 *  2. Pure SSE stream:
 *       data: {"choices":[{"delta":{"content":"..."}}]}
 *       data: [DONE]
 *
 *  3. Hybrid — a JSON body immediately followed by an SSE terminator with no
 *     separating newline:
 *       {"choices":[{"message":{"content":"..."}}]}data: [DONE]
 *
 * Only handling shapes 1 or 2 silently yields an empty string for the others,
 * which then surfaces as "No hint generated" / "All models unavailable".
 */
export function extractChatContent(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  // 1) Pure JSON body.
  const direct = contentFromJson(trimmed);
  if (direct !== null) return direct.trim();

  // 2) Hybrid: JSON body followed by an SSE terminator without a newline.
  //    Use the *last* "data:" so a "data:" appearing inside the JSON content
  //    (common in coding hints) doesn't truncate the body.
  const cut = trimmed.lastIndexOf('data:');
  if (cut > 0) {
    const prefix = contentFromJson(trimmed.slice(0, cut).trim());
    if (prefix !== null) return prefix.trim();
  }

  // 3) Pure SSE stream: concatenate the content deltas from each `data:` line.
  let acc = '';
  for (const rawLine of trimmed.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') continue;
    const chunk = contentFromJson(data);
    if (chunk !== null) acc += chunk;
  }
  return acc.trim();
}

/**
 * Returns the message/delta content from a JSON chat-completion string, or
 * `null` when the string isn't JSON (or has no content field at all).
 */
function contentFromJson(json: string): string | null {
  try {
    const parsed = JSON.parse(json);
    const content =
      parsed?.choices?.[0]?.message?.content ??
      parsed?.choices?.[0]?.delta?.content;
    return typeof content === 'string' ? content : null;
  } catch {
    return null;
  }
}
