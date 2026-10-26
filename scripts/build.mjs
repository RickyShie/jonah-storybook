import {cp, mkdir, mkdtemp, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// An explicit list keeps development files and original PNGs out of the website.
const files = [
  'index.html',
  'engine/core/monogatari.js',
  'engine/core/monogatari.css',
  'engine/LICENSE',
  'js/options.js',
  'js/chapters.js',
  'js/script.js',
  'js/main.js',
  'js/scene-motion.js',
  'style/main.css',
  'assets/favicon.svg',
  ...Array.from({length: 6}, (_, i) => `assets/videos/scene-${i + 1}.mp4`),
  ...Array.from({length: 6}, (_, i) => `assets/scenes/scene-${i + 1}.webp`),
  'jonah_lesson_modern_japanese.pdf'
];

export async function buildSite() {
  const output = path.join(root, 'dist');
  const staging = await mkdtemp(path.join(root, '.pages-build-'));
  try {
    for (const file of files) {
      const destination = path.join(staging, file);
      await mkdir(path.dirname(destination), {recursive: true});
      await cp(path.join(root, file), destination);
    }
    await writeFile(path.join(staging, '.nojekyll'), '');
    // Replace the last build only after every required file has been copied.
    await rm(output, {recursive: true, force: true});
    await rename(staging, output);
    return output;
  } finally {
    await rm(staging, {recursive: true, force: true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
  console.log(`Built ${files.length} game files into dist/ (plus .nojekyll).`);
}
