#!/usr/bin/env node
/**
 * Vérifie la règle MOUVEMENT (depuis ep10) sur un épisode :
 *  - chaque scène contient au moins 2 actions visibles (déplacement, geste, objet manipulé) ;
 *  - aucun personnage visible ne reste sans action plus de 1,5 s.
 * Durées des scènes : episodes/<ep>/voix.json (piste unique).
 *   node scripts/verifie-mouvement.mjs ep10
 */
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ep = process.argv[2] ?? 'ep10';
const script = JSON.parse(readFileSync(join(root, 'episodes', ep, 'script.json'), 'utf8'));
const voix = JSON.parse(readFileSync(join(root, 'episodes', ep, 'voix.json'), 'utf8'));
const SEUIL = 1.5;
const NON_ACTIONS = new Set(['objet', 'expression', 'miroir', 'cape', 'pose']);
let erreurs = 0;

script.forEach((plan, i) => {
  const debut = voix.scenes[i].debut;
  const fin = i + 1 < voix.scenes.length ? voix.scenes[i + 1].debut : voix.fin;
  const duree = fin - debut;
  const acteurs = plan.acteurs ?? [];
  let nbActions = 0;
  const lignes = [];
  for (const ac of acteurs) {
    const actions = (ac.actions ?? []).filter((a) => !NON_ACTIONS.has(a.type)).sort((a, b) => a.t - b.t);
    nbActions += actions.filter((a) => a.t < duree).length;
    const entree = actions.find((a) => a.type === 'walkIn');
    const sortie = actions.find((a) => a.type === 'walkOut');
    const vis0 = ac.apparition ?? (entree ? entree.t : 0);
    const vis1 = sortie ? (sortie.fin ?? sortie.t + 0.6) : duree;
    const iv = actions.map((a) => [a.t, Math.min(a.fin ?? a.t + 0.6, duree)]);
    let cur = vis0;
    const trous = [];
    for (const [a, b] of iv) {
      if (a - cur > SEUIL) trous.push([cur, a]);
      cur = Math.max(cur, b);
    }
    if (Math.min(vis1, duree) - cur > SEUIL) trous.push([cur, Math.min(vis1, duree)]);
    if (trous.length) {
      erreurs++;
      lignes.push(`   ✗ ${ac.id} immobile : ${trous.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)} s`).join(', ')}`);
    }
  }
  const ok = acteurs.length > 0 && nbActions >= 2;
  if (!ok) erreurs++;
  console.log(`scène ${String(i + 1).padStart(2)} (${duree.toFixed(2)} s) : ${acteurs.length} personnage(s), ${nbActions} actions ${ok ? '✓' : '✗ (au moins 2)'}`);
  lignes.forEach((l) => console.log(l));
});
console.log(erreurs ? `${erreurs} problème(s)` : 'Règle MOUVEMENT respectée.');
process.exit(erreurs ? 1 : 0);
