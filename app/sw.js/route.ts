import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TECHNIQUES } from '@/lib/breathing-techniques';

export const dynamic = 'force-static';

const ROUTES = [
  '/',
  '/session/breathing',
  '/session/grounding',
  '/session/gratitude',
  '/complete',
  '/history',
  '/settings',
  '/techniques',
  ...Object.keys(TECHNIQUES).map((id) => `/techniques/${id}`),
];

const STATIC_FILES = ['/manifest.json', '/icon.svg', '/icon-512.svg'];

// Версия меняется с каждой сборкой, поэтому браузер видит новый sw.js
// и перекачивает приложение в свежий кэш.
export function GET() {
  const worker = readFileSync(
    join(process.cwd(), 'lib/service-worker.js'),
    'utf8',
  );
  const config = [
    `const VERSION = ${JSON.stringify(Date.now().toString(36))};`,
    `const ROUTES = ${JSON.stringify(ROUTES)};`,
    `const STATIC_FILES = ${JSON.stringify(STATIC_FILES)};`,
  ].join('\n');

  return new Response(`${config}\n${worker}`, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
}
