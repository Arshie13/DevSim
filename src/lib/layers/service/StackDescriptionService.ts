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
      'auto/coding',
      'nvidia/nemotron-3-nano-30b-a3b:free',
      'google/gemma-3n-e2b-it:free',
      'qwen/qwen3.6-plus:free'
    ];

    const omnirouteKey = process.env.OMNIROUTE_KEY;
    if (!omnirouteKey) {
      return { success: false, error: 'OMNIROUTE_KEY is not configured. Please add it to your .env file.' };
    }

    let lastError = null;

    for (const modelName of models) {
      try {
        const result = await this.tryOmniroute(prompt, omnirouteKey);
        if (result.success) {
          return { success: true, description: result.description };
        }
        lastError = result.error;
      } catch (error) {
        console.log(`Model ${modelName} failed:`, error);
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

  private async tryOmniroute(
    prompt: string,
    apiKey: string
  ): Promise<{ success: boolean; description?: string; error?: any; status?: number }> {
    try {
      const modelResponse = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'auto/best-free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (modelResponse.ok) {
        const text = await modelResponse.text();
        const lines = text.split('\n').filter((line) => line.startsWith('data: '));
        let description = '';
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            description += delta;
          } catch {}
        }
        if (!description) {
          return { success: false, error: 'No description generated' };
        }
        return { success: true, description: description.trim() };
      } else {
        const errorData = await modelResponse.json();
        return { success: false, error: errorData, status: modelResponse.status };
      }
    } catch (error) {
      return { success: false, error };
    }
  }
}
