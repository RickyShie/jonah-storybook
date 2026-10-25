import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import {buildSite} from '../scripts/build.mjs';

const output = await buildSite();
const html = await readFile(path.join(output, 'index.html'), 'utf8');
const references = new Set([...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]));
// Include resources that Monogatari loads dynamically, not just the HTML tags.
let assetsPath;
const scenes = {};
const context = vm.createContext({
  window: {},
  monogatari: {
    settings(value) { assetsPath = value.AssetsPath; },
    preferences() {}, storage() {}, translation() {}, characters() {}, script() {},
    assets(type, value) { if (type === 'scenes') Object.assign(scenes, value); }
  }
});
for (const file of ['options.js', 'chapters.js', 'script.js']) {
  vm.runInContext(await readFile(path.join(output, 'js', file), 'utf8'), context);
}
for (const file of Object.values(scenes)) references.add(`${assetsPath.root}/${assetsPath.scenes}/${file}`);
for (const chapter of context.window.JONAH_CHAPTERS) references.add(chapter.image);
const main = await readFile(path.join(output, 'js/main.js'), 'utf8');
for (const [, href] of main.matchAll(/href="([^"]+)"/g)) references.add(href);

for (const unwanted of ['server.mjs', 'Start.command', 'package.json', '.git', '.github', 'tests', 'docs']) {
  assert.equal(await stat(path.join(output, unwanted)).then(() => true, () => false), false, `${unwanted} must not be published`);
}
assert.ok((await stat(path.join(output, '.nojekyll'))).isFile());
assert.ok((await stat(path.join(output, 'engine/LICENSE'))).isFile());
assert.equal(await stat(path.join(output, 'assets', 'Scene 1 - Reluctant Prophet Overlooking Nineveh.png')).then(() => true, () => false), false);

// Serve the exact build under root and repository prefixes, like GitHub Pages.
for (const basePath of ['/', '/jonah-game/', '/%E5%B9%BC%E5%B9%B4%E7%8F%AD2-3-5/']) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestPath = new URL(req.url, 'http://localhost').pathname;
      if (!requestPath.startsWith(basePath)) { res.writeHead(404); res.end(); return; }
      const file = decodeURIComponent(requestPath.slice(basePath.length)) || 'index.html';
      const body = await readFile(path.join(output, file));
      res.writeHead(200); res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const site = new URL(basePath, `http://127.0.0.1:${server.address().port}`);
    for (const reference of references) {
      if (/^(https?:|data:|#)/.test(reference)) continue;
      const url = new URL(reference, site);
      assert.ok(url.pathname.startsWith(basePath), `${reference} escapes the repository prefix`);
      const response = await fetch(url);
      assert.equal(response.status, 200, `Missing published resource: ${url.pathname}`);
      assert.ok((await response.arrayBuffer()).byteLength > 0, `Empty resource: ${reference}`);
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}
console.log('PASS: Pages build serves every HTML and dynamic game resource at root, repository, and Japanese repository paths.');
