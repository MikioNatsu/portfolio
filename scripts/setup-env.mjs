#!/usr/bin/env node
/**
 * Copies `.env.example` into the places the tooling expects:
 *   - `.env`             → the NestJS API (and the Vite dev server)
 *   - `apps/api/.env`    → the Prisma CLI, which only reads the schema/package dir
 *
 * Never overwrites an existing file, so it is safe to re-run.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = resolve(root, '.env.example');

const targets = [resolve(root, '.env'), resolve(root, 'apps/api/.env')];

if (!existsSync(template)) {
  console.error('✗ .env.example is missing — cannot bootstrap environment files.');
  process.exit(1);
}

let created = 0;

for (const target of targets) {
  const relative = target.replace(`${root}\\`, '').replace(`${root}/`, '');
  if (existsSync(target)) {
    console.log(`· ${relative} already exists — left untouched`);
    continue;
  }
  copyFileSync(template, target);
  console.log(`✓ created ${relative}`);
  created += 1;
}

console.log(
  created > 0
    ? '\nNext: open .env and set DATABASE_URL + JWT_SECRET, then run `npm run db:migrate && npm run db:seed`.'
    : '\nEnvironment files were already in place.',
);
