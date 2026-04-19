import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const BASE_DIR = path.join(process.cwd(), 'submodules/projects/tech-stacks');

export const GET = async ({ params }) => {
  const { path: imagePath } = params;
  
  if (!imagePath) {
    throw error(400, 'Missing image path');
  }

  const safePath = path.join(BASE_DIR, imagePath);
  
  if (!safePath.startsWith(BASE_DIR + path.sep)) {
    throw error(403, 'Invalid path');
  }

  try {
    const data = fs.readFileSync(safePath);
    const ext = path.extname(safePath).toLowerCase();
    const contentType: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    };
    
    return new Response(data, {
      headers: {
        'Content-Type': contentType[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    throw error(404, 'Image not found');
  }
};