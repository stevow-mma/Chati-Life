#!/usr/bin/env node
/**
 * Voix off d'un épisode avec l'API REST ElevenLabs (pas de SDK, pas de clé :
 * l'authentification est ajoutée par le proxy réseau).
 *
 *   node scripts/voix.mjs ep01         → toutes les scènes de l'épisode 1
 *   node scripts/voix.mjs ep01 1 3     → seulement les scènes 1 et 3 (mode par_scene)
 *   node scripts/voix.mjs ep02         → piste unique de l'épisode 2
 *
 * Voix « Guillaume - Narrator », modèle eleven_multilingual_v2, mp3_44100_128.
 * Endpoint /with-timestamps : l'alignement caractère par caractère sert à caler
 * les sous-titres, le mot jaune, la bouche du personnage et (piste unique) les coupes.
 *
 * episodes/<ep>/episode.json → voix.mode :
 *  - "par_scene"    : un mp3 par scène dans public/<ep>/voix/sceneNN.mp3 (+ .json)
 *  - "piste_unique" : un seul appel pour tout l'épisode (textes séparés par un espace),
 *                     silences de début/fin supprimés, `silence_avant` s ajoutées devant,
 *                     piste dans public/<ep>/voix.mp3. Les scènes commencent à leur premier mot.
 * Cache : hash (texte + voix + modèle + format + réglages). Rien n'est régénéré s'il est inchangé.
 * Sortie lue par Remotion : episodes/<ep>/voix.json
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const VOICE_ID = 'ohItIVrXTBI80RrUECOD'; // Guillaume - Narrator — ne jamais changer
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';
const MAX_ESSAIS = 2;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [ep, ...rest] = process.argv.slice(2);
if (!ep || !existsSync(join(root, 'episodes', ep, 'episode.json'))) {
  console.error('Usage : node scripts/voix.mjs <episode> [scènes…]   (ex. ep02)');
  process.exit(1);
}
const epDir = join(root, 'episodes', ep);
const episode = JSON.parse(readFileSync(join(epDir, 'episode.json'), 'utf8'));
const script = JSON.parse(readFileSync(join(epDir, 'script.json'), 'utf8'));
const conf = episode.voix ?? {mode: 'par_scene'};

/** Texte réellement lu : champ `texte`, avec {mot} remplacé par les mots rotatifs. */
const texteLu = (plan) => {
  const ev = plan.element_visuel;
  if (ev?.type === 'mots_rotatifs' && plan.texte.includes('{mot}')) {
    return plan.texte.replace('{mot}', ev.mots.map((m) => m.toLowerCase()).join('... '));
  }
  return plan.texte;
};

const ffprobeDuree = (f) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], {encoding: 'utf8'}).trim());

/** Appel REST /with-timestamps → {audio_base64, alignment}. */
const tts = (texte, voiceSettings, tmpDir) => {
  const body = {text: texte, model_id: MODEL_ID};
  if (voiceSettings) body.voice_settings = voiceSettings;
  const tmp = join(tmpDir, '.tts-response.json');
  let derniere = '';
  for (let essai = 1; essai <= MAX_ESSAIS; essai++) {
    let status = '';
    try {
      status = execFileSync(
        'curl',
        [
          '-sS', '-o', tmp, '-w', '%{http_code}', '-X', 'POST',
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=${OUTPUT_FORMAT}`,
          '-H', 'Content-Type: application/json',
          '-H', 'Accept: application/json',
          '--data-binary', '@-',
        ],
        {input: JSON.stringify(body), encoding: 'utf8'},
      ).trim();
    } catch (e) {
      derniere = `curl : ${e.message}`;
      console.error(`Essai ${essai}/${MAX_ESSAIS} échoué — ${derniere}`);
      continue;
    }
    const raw = existsSync(tmp) ? readFileSync(tmp, 'utf8') : '';
    if (existsSync(tmp)) unlinkSync(tmp);
    if (status === '200') return JSON.parse(raw);
    derniere = `HTTP ${status} — ${raw.slice(0, 800)}`;
    console.error(`Essai ${essai}/${MAX_ESSAIS} échoué — ${derniere}`);
  }
  throw new Error(`ElevenLabs : échec après ${MAX_ESSAIS} essais. Dernière erreur : ${derniere}`);
};

/** Découpe une plage de l'alignement en mots (séparés par des espaces). */
const motsDe = (al, from, to, decalage = 0) => {
  const {characters: c, character_start_times_seconds: s, character_end_times_seconds: e} = al;
  const mots = [];
  let cur = null;
  for (let k = from; k < to; k++) {
    if (/\s/.test(c[k])) {
      if (cur) mots.push(cur);
      cur = null;
    } else if (!cur) cur = {texte: c[k], debut: s[k] - decalage, fin: e[k] - decalage};
    else {
      cur.texte += c[k];
      cur.fin = e[k] - decalage;
    }
  }
  if (cur) mots.push(cur);
  return mots;
};

const arrondi = (x) => Math.round(x * 1000) / 1000;
const arrondirMots = (mots) => mots.map((m) => ({texte: m.texte, debut: arrondi(m.debut), fin: arrondi(m.fin)}));

// ---------------------------------------------------------------------------
if (conf.mode === 'par_scene') {
  const outDir = join(root, 'public', ep, 'voix');
  mkdirSync(outDir, {recursive: true});
  const nom = (i) => `scene${String(i + 1).padStart(2, '0')}`;
  const wanted = rest.map(Number).filter((n) => n >= 1);
  const indices = wanted.length ? wanted.map((n) => n - 1) : script.map((_, i) => i);

  for (const i of indices) {
    const plan = script[i];
    if (!plan) throw new Error(`Scène ${i + 1} absente du script`);
    const texte = texteLu(plan);
    const hash = createHash('sha256').update([VOICE_ID, MODEL_ID, OUTPUT_FORMAT, texte].join('|')).digest('hex');
    const mp3 = join(outDir, `${nom(i)}.mp3`);
    const meta = join(outDir, `${nom(i)}.json`);
    if (existsSync(mp3) && existsSync(meta) && JSON.parse(readFileSync(meta, 'utf8')).hash === hash) {
      console.log(`${nom(i)} : en cache, texte inchangé`);
      continue;
    }
    console.log(`${nom(i)} : génération « ${texte} »`);
    const res = tts(texte, null, outDir);
    writeFileSync(mp3, Buffer.from(res.audio_base64, 'base64'));
    const duree = ffprobeDuree(mp3);
    writeFileSync(meta, JSON.stringify({texte_lu: texte, hash, duree_audio: duree, alignment: res.alignment}, null, 1) + '\n');
    console.log(`${nom(i)} : ${duree.toFixed(2)} s`);
  }

  const index = script.map((plan, i) => {
    const meta = join(outDir, `${nom(i)}.json`);
    if (!existsSync(meta)) return null;
    const m = JSON.parse(readFileSync(meta, 'utf8'));
    if (m.texte_lu !== texteLu(plan)) {
      console.warn(`${nom(i)} : le texte a changé depuis la génération, relancer ce script`);
      return null;
    }
    const mots = motsDe(m.alignment, 0, m.alignment.characters.length);
    return {fichier: `${ep}/voix/${nom(i)}.mp3`, texte_lu: m.texte_lu, duree_audio: m.duree_audio, mots};
  });
  writeFileSync(join(epDir, 'voix.json'), JSON.stringify({mode: 'par_scene', scenes: index}, null, 1) + '\n');
  console.log(`episodes/${ep}/voix.json mis à jour`);
}

// ---------------------------------------------------------------------------
else if (conf.mode === 'piste_unique') {
  const textes = script.map(texteLu);
  const texteComplet = textes.join(' ');
  const settings = conf.voice_settings ?? null;
  const hash = createHash('sha256')
    .update(JSON.stringify([VOICE_ID, MODEL_ID, OUTPUT_FORMAT, settings, texteComplet]))
    .digest('hex');
  const bruteMp3 = join(epDir, 'voix-brute.mp3');
  const bruteJson = join(epDir, 'voix-brute.json');

  if (existsSync(bruteMp3) && existsSync(bruteJson) && JSON.parse(readFileSync(bruteJson, 'utf8')).hash === hash) {
    console.log(`${ep} : piste en cache (texte et réglages inchangés)`);
  } else {
    console.log(`${ep} : génération de la piste unique (${texteComplet.length} caractères, 1 appel)`);
    const res = tts(texteComplet, settings, epDir);
    writeFileSync(bruteMp3, Buffer.from(res.audio_base64, 'base64'));
    writeFileSync(bruteJson, JSON.stringify({hash, texte: texteComplet, voice_settings: settings, alignment: res.alignment}, null, 1) + '\n');
  }

  const brute = JSON.parse(readFileSync(bruteJson, 'utf8'));
  const al = brute.alignment;
  const chars = al.characters.join('');
  if (chars !== texteComplet) {
    throw new Error("L'alignement ne correspond pas caractère pour caractère au texte envoyé.");
  }

  // Position (en caractères) du début de chaque scène dans le texte complet
  const offsets = [];
  let pos = 0;
  for (const t of textes) {
    offsets.push(pos);
    pos += t.length + 1;
  }
  const premierCar = (from, to) => {
    for (let k = from; k < to; k++) if (!/\s/.test(al.characters[k])) return k;
    return from;
  };
  const debutParole = al.character_start_times_seconds[premierCar(0, chars.length)];
  let dernierCar = chars.length - 1;
  while (dernierCar > 0 && /\s/.test(al.characters[dernierCar])) dernierCar--;
  const finParole = al.character_end_times_seconds[dernierCar];

  // Coupe les silences de début/fin, puis ajoute `silence_avant` s devant la première parole.
  const avance = conf.silence_avant ?? 0.4;
  const piste = join(root, 'public', ep, 'voix.mp3');
  mkdirSync(dirname(piste), {recursive: true});
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', bruteMp3,
    '-af', `atrim=start=${debutParole}:end=${finParole},asetpts=PTS-STARTPTS,adelay=${Math.round(avance * 1000)}:all=1`,
    '-ar', '44100', '-b:a', '128k', piste,
  ]);
  const decalage = debutParole - avance; // temps brut → temps de la piste
  const dureePiste = ffprobeDuree(piste);

  const scenes = textes.map((t, i) => {
    const from = offsets[i];
    const to = from + t.length;
    const debut = al.character_start_times_seconds[premierCar(from, to)] - decalage;
    return {texte_lu: t, debut: arrondi(debut), mots: arrondirMots(motsDe(al, from, to, decalage))};
  });
  // Première scène : commence à l'image 0 (la voix démarre après `avance` s)
  scenes[0].debut = 0;
  const derniereParole = arrondi(finParole - decalage);
  const fin = arrondi(derniereParole + (conf.fin_apres_derniere_parole ?? 0));

  writeFileSync(
    join(epDir, 'voix.json'),
    JSON.stringify({mode: 'piste_unique', fichier: `${ep}/voix.mp3`, hash, duree_piste: dureePiste, derniere_parole: derniereParole, fin, scenes}, null, 1) + '\n',
  );
  console.log(`${ep} : piste ${dureePiste.toFixed(2)} s, dernière parole à ${derniereParole.toFixed(2)} s, fin vidéo à ${fin.toFixed(2)} s`);
  scenes.forEach((s, i) => console.log(`  scène ${String(i + 1).padStart(2)} : ${s.debut.toFixed(2)} s`));
} else {
  throw new Error(`Mode de voix inconnu : ${conf.mode}`);
}
