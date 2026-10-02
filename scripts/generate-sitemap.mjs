/**
 * Regenerates `apps/web/public/sitemap.xml` from the live content API.
 *
 * Run at deploy time (or locally) when the API is reachable:
 *   node scripts/generate-sitemap.mjs https://api.example.com https://example.com
 *
 * Falls back to leaving the static baseline untouched if the API is down.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiUrl = (process.argv[2] ?? process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const siteUrl = (process.argv[3] ?? process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/$/, '');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects', priority: '0.9', changefreq: 'weekly' },
  { path: '/experience', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
];

async function fetchProjects() {
  try {
    const response = await fetch(`${apiUrl}/api/projects`);
    if (!response.ok) throw new Error(`API responded ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`! Could not fetch projects (${error.message}) — writing static routes only.`);
    return [];
  }
}

function urlEntry(loc, priority, changefreq, lastmod) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

const projects = await fetchProjects();
const today = new Date().toISOString().slice(0, 10);

const entries = [
  ...STATIC_ROUTES.map((route) => urlEntry(`${siteUrl}${route.path}`, route.priority, route.changefreq, today)),
  ...projects.map((project) => urlEntry(`${siteUrl}/projects/${project.slug}`, '0.7', 'monthly', today)),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

writeFileSync(resolve(root, 'apps/web/public/sitemap.xml'), xml, 'utf8');
console.log(`✓ sitemap.xml written (${entries.length} URLs)`);
