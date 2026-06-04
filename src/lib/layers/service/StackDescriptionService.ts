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

    // Try models in order of preference
    const models = [
      { name: 'google/gemini-2.5-flash:direct', type: 'gemini' as const },
      { name: 'nvidia/nemotron-3-nano-30b-a3b:free', type: 'openrouter' as const },
      { name: 'google/gemma-3n-e2b-it:free', type: 'openrouter' as const },
      { name: 'qwen/qwen3.6-plus:free', type: 'openrouter' as const }
    ];

    let lastError = null;

    for (const model of models) {
      try {
        if (model.type === 'gemini') {
          const result = await this.tryGeminiModel(prompt);
          if (result.success) {
            return { success: true, description: result.description };
          }
          lastError = result.error;
          continue;
        } else {
          const result = await this.tryOpenRouterModel(prompt, model.name);
          if (result.success) {
            return { success: true, description: result.description };
          }
          lastError = result.error;
        }
      } catch (error) {
        console.log(`Model ${model.name} failed:`, error);
        lastError = error;
      }
    }

    console.error('All AI models failed:', lastError);
    return {
      success: false,
      error: 'AI service temporarily unavailable. Please try again later.'
    };
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
