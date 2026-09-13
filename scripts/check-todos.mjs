import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const contentDirectory = new URL('../src/content/', import.meta.url);

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
}

try {
  const contentFiles = await files(contentDirectory);
  const failures = [];
  for (const file of contentFiles.filter((path) => ['.json', '.ts'].includes(extname(path)))) {
    const source = await readFile(file, 'utf8');
    if (source.includes('TODO:')) failures.push(file);
  }
  if (failures.length > 0) {
    console.error(`Unresolved content values:\n${failures.join('\n')}`);
    process.exitCode = 1;
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
