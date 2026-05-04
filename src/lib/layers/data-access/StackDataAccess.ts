import type { StackSelection } from '$types';
import {
  FRONTEND_OPTIONS,
  BACKEND_OPTIONS,
  DATABASE_OPTIONS,
  SERVICES_OPTIONS
} from '$mocks';

export class StackDataAccess {
  getTechName(options: any[], id: string | null): string | null {
    if (!id) return null;
    const option = options.find((o) => o.id === id);
    return option ? option.name : null;
  }

  buildStackDescriptionPrompt(selection: StackSelection): string {
    const frontend = this.getTechName(FRONTEND_OPTIONS, selection.frontend);
    const backend = this.getTechName(BACKEND_OPTIONS, selection.backend);
    const database = this.getTechName(DATABASE_OPTIONS, selection.database);
    const services = this.getTechName(SERVICES_OPTIONS, selection.services);

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

  validateSelection(selection: StackSelection): { valid: boolean; error?: string } {
    if (!selection || typeof selection !== 'object') {
      return { valid: false, error: 'Invalid selection provided' };
    }

    const selectedCount = Object.values(selection).filter(Boolean).length;
    if (selectedCount < 2) {
      return { valid: false, error: 'At least 2 technologies must be selected' };
    }

    return { valid: true };
  }
}
