/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 *
 * One-time / on-demand fetch of YouTube thumbnails for click-to-load facades.
 * Run: pnpm run fetch:youtube-thumbnails
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const videoIds = [
  'ZwcT68ZRD0U',
  'WcE3O2x77lU',
  '8t4vh3ovldo',
  'hqxLovhkhrU',
  'uL3G3nvjGh4',
];

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'public', 'thumbnails');

await mkdir(outDir, { recursive: true });

for (const id of videoIds) {
  const res = await fetch(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
  if (!res.ok) {
    throw new Error(`Failed to fetch thumbnail for ${id}: ${res.status}`);
  }
  const outPath = path.join(outDir, `${id}.jpg`);
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
  console.log(`Saved ${outPath}`);
}

console.log(`Done — ${videoIds.length} thumbnails in public/thumbnails/`);
