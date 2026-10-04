import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const base = process.env.GITHUB_PAGES === 'true' ? '/portofolio/' : '/';
const entries = await readdir(dist, { recursive: true });
const htmlFiles = entries.filter((file) => file.endsWith('.html'));
const scripts = new Set();

for (const htmlFile of htmlFiles) {
  const html = await readFile(join(dist, htmlFile), 'utf8');
  for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) {
    const source = match[1];
    if (source?.startsWith(base)) scripts.add(source.slice(base.length));
  }
}

let bytes = 0;
for (const script of scripts) bytes += gzipSync(await readFile(join(dist, script))).byteLength;

if (bytes >= 100_000) {
  throw new Error(`First-load JavaScript is ${bytes} gzipped bytes; limit is below 100000.`);
}
console.log(`First-load JavaScript: ${bytes} gzipped bytes.`);
