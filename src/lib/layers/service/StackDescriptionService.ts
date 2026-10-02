import { StackDataAccess } from '../data-access/StackDataAccess';
import { extractChatContent } from './parseChatCompletion';
import type { StackSelection } from '$types';

interface StackDescriptionRequest {
  selection: StackSelection;
}

interface StackDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
}

export class StackDescriptionService {
  constructor(private readonly stackData = new StackDataAccess()) {}

  async generateDescription(request: StackDescriptionRequest): Promise<StackDescriptionResult> {
    const { selection } = request;

    // Validate selection
    const validation = this.stackData.validateSelection(selection);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Build prompt
    const prompt = this.stackData.buildStackDescriptionPrompt(selection);

    // Keep stack analysis aligned with the AI helper model fallback order.
    const models = [
      'oc/muse-spark-1.3-contributor-free',
      'oc/muse-spark-1.2-contributor-free',
      'ollama/gpt-oss:120b',
    ];

    const omnirouteKey = process.env.OMNIROUTE_KEY;
    if (!omnirouteKey) {
      return { success: false, error: 'OMNIROUTE_KEY is not configured. Please add it to your .env file.' };
    }

    let lastError: unknown = null;

    for (const modelName of models) {
      console.log(`Trying model: ${modelName}`);

      // These model slugs are served by the 9Router gateway, not OpenRouter.
      // Use the same provider path as HintService so both stay in sync.
      const result = await this.tryOmniroute(prompt, omnirouteKey, modelName);
      if (result.success && result.description) {
        return { success: true, description: result.description };
      }
      lastError = result.error;

      // Bad credentials won't be fixed by trying another model — fail fast
      // with the real reason so it doesn't masquerade as "all models failed".
      if (result.status === 401 || result.status === 403) {
        return {
          success: false,
          error: `AI gateway rejected the request (model: ${modelName}): ${this.getErrorMessage(lastError)}`
        };
      }
    }

    const errorMessage = this.getErrorMessage(lastError);
    console.error('All AI models failed:', errorMessage);
    return {
      success: false,
      error: `AI gateway unavailable: ${errorMessage}`
    };
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object') {
      const value = error as { error?: { message?: string } | string; message?: string };
      if (typeof value.message === 'string') return value.message;
      if (typeof value.error === 'string') return value.error;
      if (value.error && typeof value.error === 'object' && typeof value.error.message === 'string') {
        return value.error.message;
      }
      return JSON.stringify(error);
    }
    return 'No response from the gateway';
  }

  private async tryOmniroute(
    prompt: string,
    apiKey: string,
    modelName: string
  ): Promise<{ success: boolean; description?: string; error?: any; status?: number }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      const modelResponse = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (modelResponse.ok) {
        const description = extractChatContent(await modelResponse.text());

        if (!description) {
          return { success: false, error: 'No description generated' };
        }
        return { success: true, description };
      } else {
        const errorText = await modelResponse.text();
        let errorData: unknown = errorText || `HTTP ${modelResponse.status}`;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        return { success: false, error: errorData, status: modelResponse.status };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
