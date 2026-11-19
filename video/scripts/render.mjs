#!/usr/bin/env node
/**
 * Rend un épisode : voix (cache) puis vidéo.
 *   npm run render -- ep02   → out/ep02.mp4
 *   npm run render           → ep01
 */
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ep = process.argv[2] ?? 'ep01';
if (!existsSync(join(root, 'episodes', ep, 'episode.json'))) {
  console.error(`Épisode inconnu : ${ep} (dossier episodes/${ep} introuvable)`);
  process.exit(1);
}
const run = (cmd, args) => execFileSync(cmd, args, {cwd: root, stdio: 'inherit'});
run('node', ['scripts/voix.mjs', ep]);
run('npx', ['remotion', 'render', ep, `out/${ep}.mp4`, ...process.argv.slice(3)]);
