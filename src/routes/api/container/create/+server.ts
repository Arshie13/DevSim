// src/routes/api/container/create/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Docker from 'dockerode';

const docker = new Docker();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { stackId, levelId } = await request.json();

    // Create container
    const container = await docker.createContainer({
      Image: 'node:20-alpine',
      Cmd: ['/bin/sh'],
      Tty: true,
      OpenStdin: true,
      WorkingDir: '/workspace',
      ExposedPorts: {
        '3000/tcp': {},
        '5173/tcp': {} // For Vite if needed
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }], // Auto-assign port
          '5173/tcp': [{ HostPort: '0' }]
        },
        Memory: 512 * 1024 * 1024, // 512MB limit
        AutoRemove: false // We'll remove manually
      },
      Labels: {
        'devsim.stack': stackId,
        'devsim.level': levelId.toString()
      }
    });

    await container.start();

    // Get assigned ports
    const info = await container.inspect();
    const port3000 = info.NetworkSettings.Ports['3000/tcp']?.[0]?.HostPort || '3000';
    const port5173 = info.NetworkSettings.Ports['5173/tcp']?.[0]?.HostPort || '5173';

    // Create initial project files in container
    await setupProjectFiles(container, stackId, levelId);

    return json({
      success: true,
      containerId: container.id,
      previewPorts: {
        nextjs: parseInt(port3000),
        vite: parseInt(port5173)
      },
      previewUrl: `http://localhost:${port3000}`
    });
  } catch (error) {
    console.error('Error creating container:', error);
    return json({ success: false, error: String(error) }, { status: 500 });
  }
};

async function setupProjectFiles(container: Docker.Container, stackId: string, levelId: number) {
  // Get starter files based on stack/level
  const files = getStarterFiles(stackId, levelId);

  for (const [path, content] of Object.entries(files)) {
    const exec = await container.exec({
      Cmd: ['sh', '-c', `mkdir -p $(dirname ${path}) && cat > ${path}`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    stream.write(content);
    stream.end();
  }
}

function getStarterFiles(stackId: string, levelId: number): Record<string, string> {
  // Next.js + Prisma starter files
  if (stackId === 'next-prisma' && levelId === 1) {
    return {
      '/workspace/package.json': JSON.stringify({
        name: 'studenthub-api',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        },
        dependencies: {
          next: '14.2.5',
          react: '^18.3.0',
          'react-dom': '^18.3.0',
          '@prisma/client': '^5.0.0'
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.3.0',
          typescript: '^5.0.0',
          prisma: '^5.0.0'
        }
      }, null, 2),
      '/workspace/app/page.tsx': `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">StudentHub API</h1>
      <p className="mt-4 text-lg">Your Next.js + Prisma backend is ready!</p>
    </main>
  );
}
`,
      '/workspace/app/layout.tsx': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
      '/workspace/tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2017',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          paths: {
            '@/*': ['./*']
          }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules']
      }, null, 2),
      '/workspace/next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
`
    };
  }

  return {};
}
