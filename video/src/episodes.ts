import type {Apparence} from './components/Personnage';
import {PERSONNAGES} from './personnages';
import {FPS, loadScript, planFrames, texteLu} from './script';
import type {MotVoix, Plan, Voix} from './types';

import ep01Episode from '../episodes/ep01/episode.json';
import ep01Script from '../episodes/ep01/script.json';
import ep01Voix from '../episodes/ep01/voix.json';
import ep02Episode from '../episodes/ep02/episode.json';
import ep02Script from '../episodes/ep02/script.json';
import ep02Voix from '../episodes/ep02/voix.json';
import ep03Episode from '../episodes/ep03/episode.json';
import ep03Script from '../episodes/ep03/script.json';
import ep03Voix from '../episodes/ep03/voix.json';
import ep04Episode from '../episodes/ep04/episode.json';
import ep04Script from '../episodes/ep04/script.json';
import ep04Voix from '../episodes/ep04/voix.json';
import ep05Episode from '../episodes/ep05/episode.json';
import ep05Script from '../episodes/ep05/script.json';
import ep05Voix from '../episodes/ep05/voix.json';
import ep06Episode from '../episodes/ep06/episode.json';
import ep06Script from '../episodes/ep06/script.json';
import ep06Voix from '../episodes/ep06/voix.json';
import ep07Episode from '../episodes/ep07/episode.json';
import ep07Script from '../episodes/ep07/script.json';
import ep07Voix from '../episodes/ep07/voix.json';
import ep08Episode from '../episodes/ep08/episode.json';
import ep08Script from '../episodes/ep08/script.json';
import ep08Voix from '../episodes/ep08/voix.json';
import ep09Episode from '../episodes/ep09/episode.json';
import ep09Script from '../episodes/ep09/script.json';
import ep09Voix from '../episodes/ep09/voix.json';
import ep10Episode from '../episodes/ep10/episode.json';
import ep10Script from '../episodes/ep10/script.json';
import ep10Voix from '../episodes/ep10/voix.json';
import ep11Episode from '../episodes/ep11/episode.json';
import ep11Script from '../episodes/ep11/script.json';
import ep11Voix from '../episodes/ep11/voix.json';
import ep12Episode from '../episodes/ep12/episode.json';
import ep12Script from '../episodes/ep12/script.json';
import ep12Voix from '../episodes/ep12/voix.json';

/**
 * Registre des épisodes. Nouvel épisode : créer episodes/epNN/{episode,script}.json,
 * lancer `node scripts/voix.mjs epNN`, puis ajouter ses imports ci-dessous.
 */
const SOURCES = [
  {id: 'ep01', episode: ep01Episode, script: ep01Script, voix: ep01Voix},
  {id: 'ep02', episode: ep02Episode, script: ep02Script, voix: ep02Voix},
  {id: 'ep03', episode: ep03Episode, script: ep03Script, voix: ep03Voix},
  {id: 'ep04', episode: ep04Episode, script: ep04Script, voix: ep04Voix},
  {id: 'ep05', episode: ep05Episode, script: ep05Script, voix: ep05Voix},
  {id: 'ep06', episode: ep06Episode, script: ep06Script, voix: ep06Voix},
  {id: 'ep07', episode: ep07Episode, script: ep07Script, voix: ep07Voix},
  {id: 'ep08', episode: ep08Episode, script: ep08Script, voix: ep08Voix},
  {id: 'ep09', episode: ep09Episode, script: ep09Script, voix: ep09Voix},
  {id: 'ep10', episode: ep10Episode, script: ep10Script, voix: ep10Voix},
  {id: 'ep11', episode: ep11Episode, script: ep11Script, voix: ep11Voix},
  {id: 'ep12', episode: ep12Episode, script: ep12Script, voix: ep12Voix},
];

type VoixParScene = {mode: 'par_scene'; scenes: (Voix | null)[]};
type VoixPisteUnique = {
  mode: 'piste_unique';
  fichier: string;
  fin: number;
  scenes: {texte_lu: string; debut: number; mots: MotVoix[]}[];
};

export type EpisodeData = {
  id: string;
  titre: string;
  personnage: Apparence;
  plans: Plan[];
  /** Durée (frames) de chaque plan. */
  frames: number[];
  /** Piste voix unique jouée en continu (sinon un mp3 par plan). */
  piste: string | null;
  durationInFrames: number;
  /** Personnage muet (à partir de l'épisode 5) : voix off indépendante, aucune synchro de la bouche. */
  muet: boolean;
};

const construire = (src: (typeof SOURCES)[number]): EpisodeData => {
  const plans = loadScript(src.script, `episodes/${src.id}/script.json`);
  const ep = src.episode as {titre: string; personnage: string; muet?: boolean};
  const personnage = PERSONNAGES[ep.personnage];
  if (!personnage) throw new Error(`episodes/${src.id}/episode.json : personnage "${ep.personnage}" inconnu.`);
  const voix = src.voix as unknown as VoixParScene | VoixPisteUnique;
  let frames: number[];
  let piste: string | null = null;

  const pisteOk =
    voix.mode === 'piste_unique' &&
    voix.scenes.length === plans.length &&
    voix.scenes.every((s, i) => s.texte_lu === texteLu(plans[i]));

  if (voix.mode === 'piste_unique' && pisteOk) {
    // Les coupes suivent la voix : un plan va de son premier mot au premier mot du suivant.
    piste = voix.fichier;
    const bornes = voix.scenes.map((s) => Math.round(s.debut * FPS));
    bornes.push(Math.round(voix.fin * FPS));
    frames = plans.map((_, i) => bornes[i + 1] - bornes[i]);
    voix.scenes.forEach((s, i) => {
      const t0 = bornes[i] / FPS;
      const mots = s.mots.map((m) => ({texte: m.texte, debut: m.debut - t0, fin: m.fin - t0}));
      const dernier = mots[mots.length - 1];
      plans[i].voix = {fichier: null, texte_lu: s.texte_lu, duree_audio: dernier ? dernier.fin : 0, mots};
    });
  } else {
    if (voix.mode === 'piste_unique') {
      console.warn(`${src.id} : la voix ne correspond plus au script, relancer node scripts/voix.mjs ${src.id}`);
    } else {
      voix.scenes.forEach((v, i) => {
        if (plans[i] && v && v.texte_lu === texteLu(plans[i])) plans[i].voix = v;
      });
    }
    frames = plans.map(planFrames);
  }
  return {
    id: src.id,
    titre: ep.titre,
    personnage,
    plans,
    frames,
    piste,
    durationInFrames: frames.reduce((a, b) => a + b, 0),
    muet: ep.muet === true,
  };
};

export const EPISODES: EpisodeData[] = SOURCES.map(construire);
