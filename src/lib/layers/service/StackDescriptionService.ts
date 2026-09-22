import { StackDataAccess } from '../data-access/StackDataAccess';
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
      'auto/coding',
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'google/gemma-3n-e2b-it:free',
      'qwen/qwen3.6-plus:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'google/gemini-2.5-flash:direct'
    ];

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return { success: false, error: 'OPENROUTER_API_KEY is not configured. Please add it to your .env file.' };
    }

    let lastError = null;

    for (const modelName of models) {
      try {
        const result = await this.tryOpenRouterModel(prompt, modelName);
        if (result.success) {
          return { success: true, description: result.description };
        }
        lastError = result.error;
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error);
        lastError = error;
      }
    }

    const errorMessage = this.getErrorMessage(lastError);
    console.error('All AI models failed:', errorMessage);
    return {
      success: false,
      error: `OpenRouter unavailable: ${errorMessage}`
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

  private async tryGeminiModel(prompt: string): Promise<{ success: boolean; description?: string; error?: any }> {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return { success: false, error: 'Google Gemini API key not configured' };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
              topP: 0.8,
              topK: 10
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (description) {
          return { success: true, description };
        }
      }
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async tryOpenRouterModel(
    prompt: string,
    modelName: string
  ): Promise<{ success: boolean; description?: string; error?: any }> {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return { success: false, error: 'OpenRouter API key not configured' };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://devsim.app',
          'X-Title': 'DevSim'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const description = data.choices?.[0]?.message?.content?.trim();
        if (description) {
          return { success: true, description };
        }
      }
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData };
    } catch (error) {
      return { success: false, error };
    }
  }
}
