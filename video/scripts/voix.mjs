#!/usr/bin/env node
/**
 * Génère la voix off de chaque scène avec l'API REST ElevenLabs.
 *
 *   node scripts/voix.mjs        → toutes les scènes
 *   node scripts/voix.mjs 1 3    → seulement les scènes 1 et 3
 *
 * - Voix « Guillaume - Narrator », modèle eleven_multilingual_v2, mp3_44100_128.
 * - Endpoint /with-timestamps : on garde l'alignement caractère par caractère
 *   pour caler les sous-titres mot à mot sur la voix.
 * - Aucune clé ici : l'authentification est ajoutée par le proxy réseau.
 * - Cache : un mp3 n'est régénéré que si le texte lu (ou la voix/le modèle) change.
 *
 * Sorties : public/voix/sceneNN.mp3 + public/voix/sceneNN.json
 *   {texte_lu, hash, duree_audio, alignment}
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const VOICE_ID = 'ohItIVrXTBI80RrUECOD'; // Guillaume - Narrator — ne jamais changer
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'voix');
mkdirSync(outDir, {recursive: true});

const script = JSON.parse(readFileSync(join(root, 'script.json'), 'utf8'));

/** Texte réellement lu : champ `texte`, avec {mot} remplacé par les mots rotatifs. */
export const texteLu = (plan) => {
  const ev = plan.element_visuel;
  if (ev?.type === 'mots_rotatifs' && plan.texte.includes('{mot}')) {
    return plan.texte.replace('{mot}', ev.mots.map((m) => m.toLowerCase()).join('... '));
  }
  return plan.texte;
};

const nom = (i) => `scene${String(i + 1).padStart(2, '0')}`;

const wanted = process.argv.slice(2).map(Number).filter((n) => n >= 1);
const indices = wanted.length ? wanted.map((n) => n - 1) : script.map((_, i) => i);

for (const i of indices) {
  const plan = script[i];
  if (!plan) throw new Error(`Scène ${i + 1} absente de script.json`);
  const texte = texteLu(plan);
  const hash = createHash('sha256').update([VOICE_ID, MODEL_ID, OUTPUT_FORMAT, texte].join('|')).digest('hex');
  const mp3 = join(outDir, `${nom(i)}.mp3`);
  const meta = join(outDir, `${nom(i)}.json`);

  if (existsSync(mp3) && existsSync(meta) && JSON.parse(readFileSync(meta, 'utf8')).hash === hash) {
    console.log(`${nom(i)} : en cache, texte inchangé`);
    continue;
  }

  console.log(`${nom(i)} : génération « ${texte} »`);
  const body = JSON.stringify({text: texte, model_id: MODEL_ID});
  const tmp = join(outDir, `.${nom(i)}.response.json`);
  const status = execFileSync(
    'curl',
    [
      '-sS', '-o', tmp, '-w', '%{http_code}',
      '-X', 'POST',
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=${OUTPUT_FORMAT}`,
      '-H', 'Content-Type: application/json',
      '-H', 'Accept: application/json',
      '--data-binary', '@-',
    ],
    {input: body, encoding: 'utf8'},
  ).trim();
  const raw = readFileSync(tmp, 'utf8');
  unlinkSync(tmp);
  if (status !== '200') {
    throw new Error(`${nom(i)} : HTTP ${status} — ${raw.slice(0, 500)}`);
  }
  const res = JSON.parse(raw);
  writeFileSync(mp3, Buffer.from(res.audio_base64, 'base64'));
  const duree = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], {encoding: 'utf8'}).trim(),
  );
  writeFileSync(
    meta,
    JSON.stringify({texte_lu: texte, hash, duree_audio: duree, alignment: res.alignment}, null, 1) + '\n',
  );
  console.log(`${nom(i)} : ${duree.toFixed(2)} s`);
}

// Index lu par Remotion : pour chaque scène, le mp3, sa durée et l'instant de chaque mot.
const index = script.map((plan, i) => {
  const meta = join(outDir, `${nom(i)}.json`);
  if (!existsSync(meta)) return null;
  const m = JSON.parse(readFileSync(meta, 'utf8'));
  if (m.texte_lu !== texteLu(plan)) {
    console.warn(`${nom(i)} : le texte a changé depuis la génération, relancer ce script`);
    return null;
  }
  const {characters: c, character_start_times_seconds: s, character_end_times_seconds: e} = m.alignment;
  const mots = [];
  let cur = null;
  c.forEach((ch, k) => {
    if (/\s/.test(ch)) {
      if (cur) mots.push(cur);
      cur = null;
    } else if (!cur) cur = {texte: ch, debut: s[k], fin: e[k]};
    else {
      cur.texte += ch;
      cur.fin = e[k];
    }
  });
  if (cur) mots.push(cur);
  return {fichier: `voix/${nom(i)}.mp3`, texte_lu: m.texte_lu, duree_audio: m.duree_audio, mots};
});
writeFileSync(join(root, 'src', 'voix.json'), JSON.stringify(index, null, 1) + '\n');
console.log('src/voix.json mis à jour');
