import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const entries = await readdir(dist, { recursive: true });
const htmlFiles = entries.filter((file) => file.endsWith('.html'));
const missing = [];

for (const htmlFile of htmlFiles) {
  const html = await readFile(join(dist, htmlFile), 'utf8');
  for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
    const link = match[1];
    if (!link || /^(?:https?:|mailto:|tel:|data:)/.test(link)) continue;
    const relative = link.startsWith('/') ? link.slice(1) : join(dirname(htmlFile), link);
    const path = normalize(join(dist, relative));
    try {
      await access(path);
    } catch {
      try {
        await access(join(path, 'index.html'));
      } catch {
        missing.push(`${htmlFile}: ${link}`);
      }
    }
  }
}

if (missing.length > 0) throw new Error(`Broken local links:\n${missing.join('\n')}`);
console.log(`Checked local links in ${htmlFiles.length} HTML file(s).`);
