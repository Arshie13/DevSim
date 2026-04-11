import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { StackSelection } from "$types";
import {
  FRONTEND_OPTIONS,
  BACKEND_OPTIONS,
  DATABASE_OPTIONS,
  SERVICES_OPTIONS,
} from "$mocks";

interface StackDescriptionRequest {
  selection: StackSelection;
}

function getTechName(options: any[], id: string | null): string | null {
  if (!id) return null;
  const option = options.find((o) => o.id === id);
  return option ? option.name : null;
}

function buildStackDescriptionPrompt(selection: StackSelection): string {
  const frontend = getTechName(FRONTEND_OPTIONS, selection.frontend);
  const backend = getTechName(BACKEND_OPTIONS, selection.backend);
  const database = getTechName(DATABASE_OPTIONS, selection.database);
  const services = getTechName(SERVICES_OPTIONS, selection.services);

  const selectedTechs = [
    frontend && `Frontend: ${frontend}`,
    backend && `Backend: ${backend}`,
    database && `Database: ${database}`,
    services && `Services: ${services}`,
  ].filter(Boolean);

  return `You are an expert software architect. A user has selected this technology stack:

${selectedTechs.join('\n')}

Provide a concise but informative description (3-5 sentences, under 150 words) explaining what this stack excels at, its key advantages, common use cases, and why it's valuable for developers to learn.

Be educational and encouraging while staying focused and brief.`;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: StackDescriptionRequest = await request.json();
    const { selection } = body;

    if (!selection || typeof selection !== 'object') {
      return json({ success: false, error: "Invalid selection provided" }, { status: 400 });
    }

    // Check if at least 2 technologies are selected
    const selectedCount = Object.values(selection).filter(Boolean).length;
    if (selectedCount < 2) {
      return json({ success: false, error: "At least 2 technologies must be selected" }, { status: 400 });
    }

    const prompt = buildStackDescriptionPrompt(selection);

    // Try models in order of preference
    const models = [
      { name: "google/gemini-2.5-flash:direct", type: "gemini" },
      { name: "nvidia/nemotron-3-nano-30b-a3b:free", type: "openrouter" },
      { name: "google/gemma-3n-e2b-it:free", type: "openrouter" },
      { name: "qwen/qwen3.6-plus:free", type: "openrouter" }
    ];

    let lastError = null;

    for (const model of models) {
      try {
        if (model.type === "gemini") {
          const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
          if (!geminiApiKey) continue;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 0.8,
                topK: 10
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Gemini response:", JSON.stringify(data, null, 2));
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              const fullText = data.candidates[0].content.parts[0].text.trim();
              console.log("Full Gemini text length:", fullText.length);
              console.log("Full Gemini text:", fullText);
              return json({
                success: true,
                description: fullText,
              });
            }
          }
        } else {
          // OpenRouter fallback
          const openRouterKey = process.env.OPENROUTER_API_KEY;
          if (!openRouterKey) continue;

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openRouterKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://devsim.app",
              "X-Title": "DevSim"
            },
            body: JSON.stringify({
              model: model.name,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 300,
              temperature: 0.7
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`OpenRouter ${model.name} response:`, JSON.stringify(data, null, 2));
            if (data.choices?.[0]?.message?.content) {
              const fullText = data.choices[0].message.content.trim();
              console.log(`Full ${model.name} text length:`, fullText.length);
              console.log(`Full ${model.name} text:`, fullText);
              return json({
                success: true,
                description: fullText,
              });
            }
          }
        }
      } catch (error) {
        console.log(`Model ${model.name} failed:`, error);
        lastError = error;
      }
    }

    // If all models failed
    console.error("All AI models failed:", lastError);
    return json({
      success: false,
      error: "AI service temporarily unavailable. Please try again later."
    }, { status: 503 });

  } catch (error) {
    console.error("Stack description generation error:", error);
    return json({
      success: false,
      error: "An unexpected error occurred while generating the stack description"
    }, { status: 500 });
  }
};