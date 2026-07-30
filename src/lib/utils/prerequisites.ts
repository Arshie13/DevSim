/**
 * Prerequisites mapping derived from actual submodule project contents.
 *
 * Only tech options that have corresponding submodule projects
 * have prerequisites defined. Others return null.
 */

export interface PrereqItem {
  category: string;
  techName: string;
  techIcon: string;
  prerequisites: string[];
}

/**
 * Maps a stack selection to its prerequisites based on submodule content.
 * Returns an array of prerequisite items grouped by technology category.
 */
export function getPrerequisitesForSelection(selection: {
  frontend: string | null;
  backend: string | null;
  database: string | null;
  services: string | null;
}): PrereqItem[] {
  const items: PrereqItem[] = [];

  if (selection.frontend) {
    const prereqs = getFrontendPrerequisites(selection.frontend);
    if (prereqs) items.push(prereqs);
  }

  if (selection.backend) {
    const prereqs = getBackendPrerequisites(selection.backend);
    if (prereqs) items.push(prereqs);
  }

  if (selection.database) {
    const prereqs = getDatabasePrerequisites(selection.database);
    if (prereqs) items.push(prereqs);
  }

  if (selection.services) {
    const prereqs = getServicesPrerequisites(selection.services);
    if (prereqs) items.push(prereqs);
  }

  return items;
}

function getFrontendPrerequisites(techId: string): PrereqItem | null {
  // React, Next.js, and shadcn/ui have submodule projects
  const map: Record<string, PrereqItem> = {
    react: {
      category: "FRONTEND",
      techName: "React",
      techIcon: "⚛️",
      prerequisites: ["React", "JavaScript", "HTML/CSS"],
    },
    nextjs: {
      category: "FRONTEND",
      techName: "Next.js",
      techIcon: "▲",
      prerequisites: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    "shadcn-ui": {
      category: "FRONTEND",
      techName: "shadcn/ui",
      techIcon: "🎨",
      prerequisites: ["shadcn/ui", "Next.js", "React", "Tailwind CSS"],
    },
  };

  return map[techId] || null;
}

function getBackendPrerequisites(techId: string): PrereqItem | null {
  // Only Express and NestJS have submodule projects
  const map: Record<string, PrereqItem> = {
    express: {
      category: "BACKEND",
      techName: "Express.js",
      techIcon: "🚂",
      prerequisites: ["Express", "Node.js", "JavaScript", "MongoDB", "Mongoose"],
    },
    nestjs: {
      category: "BACKEND",
      techName: "NestJS",
      techIcon: "🐈",
      prerequisites: ["NestJS", "Node.js", "TypeScript", "PostgreSQL", "Prisma"],
    },
  };

  return map[techId] || null;
}

function getDatabasePrerequisites(techId: string): PrereqItem | null {
  // Only PostgreSQL and MongoDB have submodule projects
  const map: Record<string, PrereqItem> = {
    postgresql: {
      category: "DATABASE",
      techName: "PostgreSQL",
      techIcon: "🐘",
      prerequisites: ["PostgreSQL", "Prisma", "SQL"],
    },
    mongodb: {
      category: "DATABASE",
      techName: "MongoDB",
      techIcon: "🍃",
      prerequisites: ["MongoDB", "Mongoose", "Express"],
    },
  };

  return map[techId] || null;
}

function getServicesPrerequisites(techId: string): PrereqItem | null {
  // Only Prisma has a submodule project
  const map: Record<string, PrereqItem> = {
    prisma: {
      category: "SERVICE",
      techName: "Prisma",
      techIcon: "◮",
      prerequisites: ["Prisma", "TypeScript", "PostgreSQL"],
    },
  };

  return map[techId] || null;
}
