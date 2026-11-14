import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE} from '../fonts';
import {PERSONNAGES} from '../personnages';
import type {ActionActeur, Acteur, Expression, ObjetScene} from '../types';
import {Personnage, type Apparence} from './Personnage';
import {ChaiseBureau, type BrasAngles, type Mouvement, type ObjetTenu} from './PersonnageExtras';
import {ObjetSceneView} from './ObjetsScene';

/**
 * Calque « acteurs » (ep10) : plusieurs personnages à l'écran, chacun animé par une liste d'actions datées
 * (secondes relatives au début de la scène). Utilisé seulement quand un plan déclare `acteurs`.
 */

const OUT = '#1b1b2f';
const PIEDS = 1502;
const ECHELLE = 0.78;
const W_BOX = 560;
const H_BOX = 840;
/** Pas de marche par seconde. */
const CADENCE = 1.9;
const REPOS: BrasAngles = {epaule: 12, coude: -8};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lisse = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, w: number) => a + (b - a) * w;
const lerpBras = (a: BrasAngles, b: BrasAngles, w: number): BrasAngles => ({
  epaule: lerp(a.epaule, b.epaule, w),
  coude: lerp(a.coude, b.coude, w),
  doigts: w > 0.5 ? b.doigts : a.doigts,
  ouverte: w > 0.5 ? b.ouverte : a.ouverte,
  index: w > 0.5 ? b.index : a.index,
  pouce: w > 0.5 ? b.pouce : a.pouce,
});

const GESTES_BRAS = new Set([
  'pointer', 'taper', 'compter', 'tendre', 'saisir', 'serrerMain', 'saluer', 'croiser', 'teteMains', 'boire', 'montre',
  'tapeMain', 'pouce', 'ballants', 'sousBras', 'tenir', 'ecrire', 'tracer', 'nuque', 'poing', 'tapeEpaule', 'montrer', 'lever',
  // ep11
  'couper', 'peigner', 'appliquer', 'coller', 'gratter', 'tamponner', 'ouvrir',
]);
/** Gestes à deux bras par défaut. */
const DEUX_BRAS = new Set(['croiser', 'teteMains', 'ballants', 'taper']);

const finDe = (a: ActionActeur, dureeScene: number) => a.fin ?? (a.type === 'objet' ? dureeScene + 1 : a.t + 0.6);

/** Angles visés par un geste, à l'instant u (s depuis le début du geste), pour le bras de côté `s`. */
const cibleGeste = (a: ActionActeur, u: number, duree: number, frame: number, s: -1 | 1): BrasAngles => {
  const osc = (v: number, k = 1) => Math.sin(frame * v + (s > 0 ? 1.7 : 0)) * k;
  switch (a.type) {
    case 'pointer': {
      const jab = Math.sin(u * 7) * 3;
      if (a.cible === 'haut') return {epaule: 132 + jab, coude: 8, index: true};
      if (a.cible === 'bas') return {epaule: 38 + jab, coude: -24, index: true};
      if (a.cible === 'avant') return {epaule: 64 + jab, coude: -48, index: true};
      return {epaule: 94 + jab, coude: -4, index: true};
    }
    case 'taper':
      return {epaule: 22 + osc(0.7, 2), coude: -92 + osc(0.95, 9)};
    case 'compter': {
      const seq = a.doigts && a.doigts.length ? a.doigts : [1, 2];
      const k = Math.min(seq.length - 1, Math.floor((u / Math.max(duree, 0.01)) * seq.length));
      const rebond = Math.max(0, 1 - ((u / Math.max(duree, 0.01)) * seq.length - k) * 5) * 8;
      return {epaule: 30 + rebond, coude: 122, doigts: seq[k]};
    }
    case 'tendre':
      return {epaule: 82, coude: -12};
    case 'saisir': {
      // tend la main puis la ramène contre soi
      const p = clamp01(u / Math.max(duree, 0.01));
      return p < 0.5 ? {epaule: 82, coude: -12} : {epaule: lerp(82, 26, lisse((p - 0.5) * 2.5)), coude: lerp(-12, -95, lisse((p - 0.5) * 2.5))};
    }
    case 'serrerMain':
      return {epaule: 70 + osc(0.6, 3), coude: 10 + osc(0.6, 9)};
    case 'saluer':
      return {epaule: 148, coude: 22 + osc(0.5, 22), ouverte: true};
    case 'croiser':
      return {epaule: -6, coude: s < 0 ? -104 : -110};
    case 'teteMains':
      return {epaule: 150 + osc(0.35, 3), coude: 40, ouverte: true};
    case 'boire': {
      const gorgee = Math.max(0, Math.sin(u * 2.4)) * 10;
      return {epaule: -20 + gorgee * 0.4, coude: -150 - gorgee};
    }
    case 'montre':
      return {epaule: 22, coude: -100};
    case 'tapeMain':
      return {epaule: 150, coude: 4, ouverte: true};
    case 'pouce':
      return {epaule: 30, coude: 118 + osc(0.3, 4), pouce: true};
    case 'ballants':
      return {epaule: 3 + osc(0.22, 5), coude: -2};
    case 'sousBras':
      return {epaule: 10, coude: -26};
    case 'tenir':
      return {epaule: 28 + osc(0.2, 2), coude: -86};
    case 'ecrire':
      return {epaule: 26 + osc(0.7, 4), coude: -96 + osc(1.3, 6)};
    case 'tracer': {
      const p = lisse(u / Math.max(duree, 0.01));
      return {epaule: 100 + p * 34, coude: -16 + Math.sin(u * 9) * 4};
    }
    case 'nuque':
      return {epaule: 152, coude: 58 + osc(0.5, 10)};
    case 'poing':
      return {epaule: 165, coude: -8 + osc(0.4, 4)};
    case 'tapeEpaule':
      return {epaule: 96, coude: -14 - Math.abs(Math.sin(u * 8)) * 18, ouverte: true};
    case 'montrer':
      return {epaule: 72, coude: -30};
    case 'lever':
      return {epaule: 150 + osc(0.25, 3), coude: 12};
    // --- ep11 ---
    case 'couper':
      // bras tendu vers la tête de la cliente, petits coups de ciseaux
      return {epaule: 100 + osc(0.5, 4), coude: -26 + osc(0.8, 6)};
    case 'peigner':
      // passe le peigne de haut en bas, à hauteur de tête
      return {epaule: 112 + Math.sin(u * 6) * 12, coude: -18 + Math.sin(u * 6) * 8};
    case 'appliquer':
      // pinceau de couleur : larges va-et-vient
      return {epaule: 104 + Math.sin(u * 5) * 10, coude: -40 + Math.sin(u * 5 + 1) * 16};
    case 'coller': {
      // colle un post-it en hauteur, sur le côté : bras levé, petite pression
      const presse = Math.max(0, Math.sin(u * 8)) * 6;
      return {epaule: 122 + presse, coude: -14};
    }
    case 'gratter':
      // se gratte la tempe
      return {epaule: 140 + osc(0.3, 2), coude: 70 + osc(1.1, 9), index: true};
    case 'tamponner': {
      // lève le tampon et l'abat sur la table
      const coup = Math.max(0, Math.sin(u * 7));
      return {epaule: 40 + coup * 34, coude: -56 + coup * 20};
    }
    case 'ouvrir': {
      // tend la main puis lève (coffre, porte)
      const p = clamp01(u / Math.max(duree, 0.01));
      return p < 0.4 ? {epaule: 84, coude: -14} : {epaule: lerp(84, 156, lisse((p - 0.4) * 2.5)), coude: lerp(-14, 4, lisse((p - 0.4) * 2.5))};
    }
    default:
      return REPOS;
  }
};

type EtatActeur = {
  x: number;
  e: number;
  y: number;
  visible: boolean;
  mv: Mouvement;
  expression: Expression;
  saut: number;
  penche: number;
  /** Date (s) de la première apparition à l'écran. */
  arrivee: number;
  /** ep11 : pose courante (action `pose`). */
  pose?: import('../types').Pose;
};

const evaluer = (acteur: Acteur, t: number, frame: number, dureeScene: number, expressionPlan: Expression, seed: number): EtatActeur => {
  const actions = [...(acteur.actions ?? [])].sort((a, b) => a.t - b.t);
  const e = acteur.echelle ?? ECHELLE;
  const hors = (cote: 'left' | 'right') => (cote === 'left' ? -W_BOX * e * 0.6 : 1080 + W_BOX * e * 0.6);
  let x = acteur.x;
  let y = acteur.y ?? PIEDS;
  let ech = e;
  let marche: number | null = null;
  let penche = 0;
  let saut = 0;
  let miroir = !!acteur.miroir;
  let expression = acteur.expression ?? expressionPlan;
  const premierDeplacement = actions.find((a) => ['walkIn', 'walkTo', 'glisse', 'walkOut'].includes(a.type));
  let arrivee = 0;
  if (premierDeplacement?.type === 'walkIn') {
    x = hors(premierDeplacement.from ?? 'left');
    arrivee = premierDeplacement.t;
  }
  let tete = {rot: Math.sin(frame / 27 + seed) * 2.5, dy: 0};
  let epaules = 0;
  // ep11 : cape de coupe (cliente assise), clin d'œil
  let cape: string | null = null;
  let clin = false;
  let pose = acteur.pose;

  for (const a of actions) {
    const fin = finDe(a, dureeScene);
    const d = Math.max(0.01, fin - a.t);
    const p = clamp01((t - a.t) / d);
    if (t < a.t) continue;
    switch (a.type) {
      case 'walkIn':
      case 'walkTo':
      case 'walkOut':
      case 'glisse': {
        const x0 = x;
        const y0 = y;
        const e0 = ech;
        const x1 = a.type === 'walkIn' ? (a.x ?? acteur.x) : a.type === 'walkOut' ? hors(a.to ?? 'right') : (a.x ?? x);
        const y1 = a.y ?? y;
        const pp = a.type === 'glisse' ? lisse(p) : p < 1 ? interpolate(p, [0, 0.1, 0.9, 1], [0, 0.06, 0.94, 1]) : 1;
        x = lerp(x0, x1, pp);
        y = lerp(y0, y1, pp);
        ech = lerp(e0, a.echelle ?? e0, pp);
        if (p < 1 && a.type !== 'glisse') marche = (t - a.t) * Math.PI * CADENCE;
        if (a.type === 'glisse' && p < 1) penche = Math.sin(p * Math.PI) * (x1 > x0 ? 5 : -5);
        break;
      }
      case 'recul': {
        const dx = a.dx ?? -80;
        const pr = lisse((t - a.t) / 0.35);
        x += dx * pr;
        const choc = Math.max(0, 1 - (t - a.t) / 0.9);
        penche += (dx < 0 ? -1 : 1) * 9 * choc * Math.sin(Math.min(1, (t - a.t) / 0.15) * Math.PI * 0.5);
        break;
      }
      case 'saut':
        if (t <= fin) saut = Math.abs(Math.sin(((t - a.t) / 0.42) * Math.PI)) * 70;
        break;
      case 'miroir':
        miroir = a.valeur ?? !miroir;
        break;
      case 'expression':
        if (a.expression) expression = a.expression;
        break;
      case 'hoche':
        if (t <= fin) tete = {...tete, dy: Math.max(0, Math.sin((t - a.t) * Math.PI * 4.4)) * 14};
        break;
      case 'incline': {
        const w = Math.min(lisse((t - a.t) / 0.3), 1 - lisse((t - fin) / 0.3));
        tete = {...tete, rot: tete.rot + (a.angle ?? 10) * w};
        break;
      }
      case 'hausse': {
        const w = Math.min(lisse((t - a.t) / 0.25), 1 - lisse((t - fin) / 0.25));
        epaules = Math.max(epaules, 24 * w);
        break;
      }
      case 'cape':
        if (t < fin) cape = a.couleur ?? '#5E60CE';
        break;
      case 'clin':
        if (t < fin) clin = true;
        break;
      case 'pose':
        if (a.pose) pose = a.pose;
        break;
      default:
        break;
    }
  }

  // Bras : repos (avec balancement de marche ou micro-mouvement), puis gestes mélangés dans l'ordre.
  const brasCote = (s: -1 | 1): BrasAngles => {
    let b: BrasAngles =
      marche !== null
        ? {epaule: 14 + Math.sin(marche + (s > 0 ? Math.PI : 0)) * 16, coude: -10 - Math.abs(Math.sin(marche)) * 12}
        : {epaule: REPOS.epaule + Math.sin(frame / 23 + seed + s) * 4, coude: REPOS.coude + Math.sin(frame / 31 + seed) * 4};
    const cle = s < 0 ? 'l' : 'r';
    for (const a of actions) {
      if (a.type === 'hausse') {
        const fin = finDe(a, dureeScene);
        const w = Math.min(lisse((t - a.t) / 0.25), 1 - lisse((t - fin) / 0.25));
        if (w > 0) b = lerpBras(b, {epaule: 40, coude: 72, ouverte: true}, w);
        continue;
      }
      if (!GESTES_BRAS.has(a.type)) continue;
      const cote = a.cote ?? (DEUX_BRAS.has(a.type) ? 'deux' : 'r');
      if (cote !== 'deux' && cote !== cle) continue;
      const fin = finDe(a, dureeScene);
      const w = Math.min(lisse((t - a.t + 0.05) / 0.3), 1 - lisse((t - fin) / 0.3));
      if (w <= 0) continue;
      b = lerpBras(b, cibleGeste(a, Math.max(0, t - a.t), fin - a.t, frame, s), w);
    }
    return b;
  };

  // Objets en main : actions `objet` (intervalle) puis objets portés par un geste en cours.
  const objets: {l?: ObjetTenu | null; r?: ObjetTenu | null} = {};
  const texteObjet: {l?: string; r?: string} = {};
  for (const a of actions) {
    const fin = finDe(a, dureeScene);
    if (a.objet === undefined) continue;
    const enCours = a.type === 'objet' ? t >= a.t && t < fin : t >= a.t + 0.1 && t < fin + 0.15;
    if (!enCours) continue;
    const cote = a.cote ?? 'r';
    const cles: ('l' | 'r')[] = cote === 'deux' ? ['l', 'r'] : [cote];
    for (const c of cles) {
      objets[c] = a.objet as ObjetTenu | null;
      if (a.texte) texteObjet[c] = a.texte;
    }
  }

  const visible = x > -W_BOX * e * 0.55 && x < 1080 + W_BOX * e * 0.55 && (acteur.apparition === undefined || t >= acteur.apparition);
  return {
    x,
    e: ech,
    y,
    visible,
    saut,
    penche,
    expression,
    arrivee: acteur.apparition ?? arrivee,
    pose,
    mv: {marche, bras: {l: brasCote(-1), r: brasCote(1)}, objets, texteObjet, tete, epaules, miroir, ...(cape ? {cape} : {}), ...(clin ? {clin} : {})},
  };
};

const EtiquetteNom: React.FC<{texte: string; depuis: number}> = ({texte, depuis}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - depuis, fps, config: {damping: 10, stiffness: 220}});
  if (frame < depuis) return null;
  return (
    <div
      style={{
        transform: `scale(${pop}) rotate(-3deg)`,
        background: 'white',
        border: `6px solid ${OUT}`,
        borderRadius: 18,
        padding: '6px 18px 2px',
        fontFamily: FONT_TEXTE,
        fontSize: 40,
        color: OUT,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
      }}
    >
      {texte}
    </div>
  );
};

export const Acteurs: React.FC<{
  acteurs: Acteur[];
  objets?: ObjetScene[];
  expressionPlan: Expression;
  /** Expression du personnage principal après la bascule `puis` (frame), si définie. */
  principal: Apparence;
  muet: boolean;
}> = ({acteurs, objets = [], expressionPlan, principal, muet}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const dureeScene = durationInFrames / fps;
  const derriere = objets.filter((o) => !o.devant);
  const devant = objets.filter((o) => o.devant);

  return (
    <>
      {derriere.map((o, i) => (
        <ObjetSceneView key={`d${i}`} objet={o} />
      ))}
      {acteurs.map((ac, i) => {
        const apparence = PERSONNAGES[ac.id] ?? principal;
        const st = evaluer(ac, t, frame, dureeScene, expressionPlan, i * 1.9 + 0.7);
        const e = st.e;
        if (!st.visible) return null;
        const w = W_BOX * e;
        const h = H_BOX * e;
        const top = st.y - (870 / 900) * h - st.saut;
        return (
          <div key={i}>
            <div
              style={{
                position: 'absolute',
                left: st.x - w / 2,
                top,
                width: w,
                height: h,
                transform: `rotate(${st.penche}deg)`,
                transformOrigin: '50% 97%',
              }}
            >
              {ac.chaise ? (
                <svg viewBox="0 0 600 900" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
                  <ChaiseBureau couleur={ac.chaise} tourne={st.x / 200} />
                </svg>
              ) : null}
              <div style={{position: 'absolute', inset: 0}}>
                <Personnage
                  apparence={apparence}
                  expression={st.expression}
                  talking={false}
                  muet={muet}
                  entree={false}
                  pose={st.pose ?? 'debout'}
                  accessoire={ac.accessoire ?? null}
                  mouvement={st.mv}
                />
              </div>
            </div>
            {ac.nom ? (
              <div style={{position: 'absolute', left: st.x - 300, width: 600, top: top + (st.pose === 'assis' ? 150 * e : 0) + 24 * e - 30, display: 'flex', justifyContent: 'center'}}>
                <EtiquetteNom texte={ac.nom} depuis={Math.round((st.arrivee + 0.5) * fps)} />
              </div>
            ) : null}
          </div>
        );
      })}
      {devant.map((o, i) => (
        <ObjetSceneView key={`v${i}`} objet={o} />
      ))}
    </>
  );
};

/** Liste des intervalles d'immobilité > `seuil` s d'un acteur (vérification de la règle MOUVEMENT). */
export const trousImmobilite = (acteur: Acteur, dureeScene: number, seuil = 1.5) => {
  const iv = (acteur.actions ?? [])
    .filter((a) => a.type !== 'objet' && a.type !== 'expression' && a.type !== 'miroir' && a.type !== 'cape' && a.type !== 'pose')
    .map((a) => [a.t, Math.min(finDe(a, dureeScene), dureeScene)] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  const trous: [number, number][] = [];
  let cur = 0;
  for (const [a, b] of iv) {
    if (a - cur > seuil) trous.push([cur, a]);
    cur = Math.max(cur, b);
  }
  if (dureeScene - cur > seuil) trous.push([cur, dureeScene]);
  return trous;
};
