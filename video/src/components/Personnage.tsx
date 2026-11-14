import {Bandouliere, RobeLongue, TressesArriere, TressesAvant, VesteJean} from './Ep13';
import {GrosseBarbe} from './Ep14';
import {ChronoCou, VesteZip} from './Ep15';
import {Salopette} from './Ep16';
import {TablierVitres} from './Ep17';
import {Bonnet, CasqueAudio, Echarpe} from './Ep18';
import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import type {Accessoire, Expression, ObjetMain, Pose as Posture} from '../types';
import {
  AviateurReleve,
  bras as brasFK,
  BrasArticule,
  BretellesSac,
  Chemise,
  Doudoune,
  EcouteursCou,
  GomineArriere,
  GomineAvant,
  Jambes,
  LongBoucleArriere,
  LongBoucleAvant,
  ObjetMain as ObjetMainAnime,
  PixieArriere,
  PixieAvant,
  MiLongArriere,
  MiLongAvant,
  LongLisseArriere,
  LongLisseAvant,
  CourtOnduleArriere,
  CourtOnduleAvant,
  RayuresTorse,
  TablierCoiffure,
  PeigneOreille,
  Piercing,
  Cardigan,
  RobeChambre,
  ReversCostume,
  GiletPoches,
  CapeCoupe,
  ClinOeil,
  SweatColRond,
  type BrasAngles,
  type Mouvement,
} from './PersonnageExtras';

/**
 * Personnage plat 2D en SVG, paramétrable (teint, cheveux, tenue, accessoire de tête, genre).
 * Mêmes animations pour tous : entrée, respiration, clignement, bouche synchronisée, 6 expressions.
 * Ajouter un personnage = ajouter une entrée dans src/personnages.ts.
 * viewBox 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;

export type Apparence = {
  nom: string;
  genre: 'homme' | 'femme';
  teint: {peau: string; ombre: string; joues: string};
  cheveux: {style: 'meches' | 'chignon_boucle' | 'court' | 'carre_frange' | 'court_dessus' | 'afro_puff' | 'ondule_meche' | 'queue_frange' | 'degrade' | 'gomine' | 'long_boucle' | 'pixie' | 'mi_long' | 'long_lisse' | 'court_ondule' | 'rase' | 'tresses'; couleur: string; /** ep10 : mèches (couleur) des cheveux longs bouclés. */ meches?: string; /** ep11 : racines plus foncées (pixie décolorée). */ racines?: string};
  tenue: {
    haut: string;
    hautOmbre: string;
    bas: string;
    chaussures: string;
    bandeChaussures: string;
    /** Veste zippée à bandes réfléchissantes (couleur des bandes). */
    bandes?: string;
    /** Sweat à capuche : capuche roulée autour du cou, cordons, poche kangourou. */
    capuche?: boolean;
    /** Haut plus large (oversize). */
    oversize?: boolean;
    /** T-shirt : col rond, manches courtes (avant-bras nus). */
    tshirt?: boolean;
    /** Pantalon de travail : couleur des poches cargo sur les cuisses. */
    poches?: string;
    /** Tunique de travail (ep06) : col en V, boutons-pression, manches courtes, bas évasé sous la ceinture. */
    tunique?: boolean;
    /** T-shirt chiné (ep07) : couleur des petites mouchetures. */
    chine?: string;
    /** Pull en maille (ep08) : col rond côtelé, bas côtelé, côtes verticales légères. */
    pull?: boolean;
    /** Jean (ep08) : couleur des surpiqûres et des reflets délavés. */
    jean?: string;
    /** Combinaison de travail (ep09) : haut et bas d'une pièce, col, fermeture éclair, poche poitrine, taille élastique. */
    combinaison?: boolean;
    /** Manches longues retroussées sous le coude (ep09) : avant-bras nus, revers roulé. */
    retroussees?: boolean;
    /** Traces de mousse sur la tenue (ep09, couleur). */
    mousse?: string;
    /** Chemise (ep10) : col pointu, patte de boutonnage. */
    chemise?: boolean;
    /** Sweat à col rond sans capuche (ep10). */
    sweat?: boolean;
    /** Marinière (ep11) : couleur des rayures horizontales (torse et manches). */
    mariniere?: string;
  };
  /** Accessoire de tête : casquette (avec initiale) ou grosses lunettes rondes. */
  tete:
    | {type: 'casquette'; couleur: string; couleurOmbre: string; initiale?: string; /** ep09 : portée à l'envers (visière derrière, fermeture réglable devant), sans logo. */ envers?: boolean}
    | {type: 'lunettes_rondes'; couleur: string}
    | {type: 'casque_velo'; couleur: string; couleurOmbre: string}
    /** Lunettes de protection relevées sur le front (couleur de la monture et de l'élastique). */
    | {type: 'lunettes_protection'; couleur: string; elastique: string}
    /** ep10 : lunettes de soleil aviateur relevées dans les cheveux. */
    | {type: 'aviateur'; monture: string; verre: string}
    /** ep12 : lunettes carrées à fine monture. */
    | {type: 'lunettes_carrees'; couleur: string}
    /** ep18 : casque audio porté sur les oreilles. */
    | {type: 'casque_audio'; couleur: string; coussins: string}
    /** ep18 : bonnet en maille à pompon. */
    | {type: 'bonnet'; couleur: string}
    | null;
  /** Barbe de trois jours (couleur). */
  barbe?: string | null;
  /** Sac de livraison carré porté sur le dos (couleur, sans logo). */
  sac?: {couleur: string; ombre: string} | null;
  /** Vélo de ville (couleur du cadre), utilisé par la pose « velo ». */
  velo?: string | null;
  /** Boucles d'oreilles (créoles). */
  boucles?: string | null;
  /** Smartphone toujours en main gauche (couleur de la coque, sans logo). */
  telephone?: string | null;
  /** Taches de rousseur (couleur). */
  rousseur?: string | null;
  /** Ceinture porte-outils (cuir) avec pochette sur la hanche. */
  ceintureOutils?: {couleur: string; ombre: string} | null;
  /** Tournevis testeur dans la poche poitrine (couleur du manche). */
  testeur?: string | null;
  /** Bandeau (couleur) qui maintient les cheveux, posé sur la ligne du front (ep06). */
  bandeau?: string | null;
  /** Petits clous d'oreilles (couleur) (ep06). */
  clous?: string | null;
  /** Badge prénom sur la poitrine, sans logo (ep06). */
  badge?: {texte: string; couleur?: string} | null;
  /** Ceinture avec petite pochette zippée devant (ep06). */
  ceinturePochette?: {couleur: string; ombre: string} | null;
  /** Gilet de sécurité sans manches, ouvert devant, à bandes réfléchissantes (ep07). */
  gilet?: {couleur: string; ombre: string; bandes: string} | null;
  /** Badge vierge (sans logo) porté sur un cordon autour du cou (ep07). */
  cordonBadge?: {cordon: string} | null;
  /** Petite douchette de scan générique accrochée à la ceinture (ep07). */
  douchette?: {couleur: string; ombre: string} | null;
  /** Petites boucles d'oreilles en perles (couleur nacrée) (ep08). */
  perles?: string | null;
  /** Casque audio générique, sans logo, posé autour du cou (ep08). */
  casqueCou?: {couleur: string; coussins: string} | null;
  /** Couleur des sourcils si différente des cheveux (ep08 : blond cendré trop pâle sur peau claire). */
  sourcils?: string | null;
  /** Gants en nitrile accrochés à la ceinture, côté droit (ep09, couleur). */
  gantsCeinture?: string | null;
  /** Doudoune sans manches ouverte devant (ep10). */
  doudoune?: {couleur: string; ombre: string} | null;
  /** Montre au poignet (ep10, couleur du boîtier) : visible avec les bras articulés (prop `mouvement`). */
  montre?: string | null;
  /** Écouteurs tour de cou (ep10), sans logo. */
  ecouteursCou?: {couleur: string; embouts: string} | null;
  /** Petit sac à dos : bretelles visibles (ep10). */
  petitSac?: {couleur: string; ombre: string} | null;
  /** ep11 : petit piercing (clou) à l'oreille gauche de l'écran (couleur). */
  piercing?: string | null;
  /** ep11 : peigne glissé derrière l'oreille (couleur). */
  peigneOreille?: string | null;
  /** ep11 : tablier de coiffure (couleur, poche) avec ciseaux et peigne dans la poche. */
  tablier?: {couleur: string; poche: string} | null;
  /** ep11 : gilet en maille ouvert (couleur des côtes, haut visible dessous). */
  cardigan?: {ombre: string; dessous: string} | null;
  /** ep11 : robe de chambre légère (couleur, ombre). */
  robeChambre?: {couleur: string; ombre: string} | null;
  /** ep11 : revers de veste de costume (couleur des revers). */
  costume?: {revers: string} | null;
  /** ep11 : gilet à poches (couleur, ombre). */
  giletPoches?: {couleur: string; ombre: string} | null;
  /** ep12 : oreillette (couleur) à l'oreille droite de l'écran. */
  oreillette?: string | null;
  /** ep12 : chemise blanche col ouvert sous la veste (couleur de la chemise). */
  chemiseOuverte?: string | null;
  /** ep13 : veste en jean ouverte (couleur, ombre) sur un t-shirt (dessous). */
  vesteJean?: {couleur: string; ombre: string; dessous: string} | null;
  /** ep13 : appareil photo en bandoulière (boîtier générique à la hanche). */
  bandouliere?: boolean;
  /** ep13 : robe longue jusqu'au sol (couleur, ombre). */
  robe?: {couleur: string; ombre: string} | null;
  /** ep14 : gants (couleur des mains, bras articulés). */
  gants?: string | null;
  /** ep14 : motifs géométriques génériques sur les avant-bras nus (couleur). */
  tatouagesBras?: string | null;
  /** ep14 : grosse barbe fournie (couleur). */
  grosseBarbe?: string | null;
  /** ep15 : veste zippée ouverte (couleur du débardeur dessous, couleur de la fermeture). */
  vesteZip?: {dessous: string; zip: string} | null;
  /** ep15 : chronomètre au cou (couleur du cordon). */
  chronoCou?: string | null;
  /** ep16 : salopette (bavette + bretelles) sur le haut. */
  salopette?: {couleur: string; ombre: string} | null;
  /** ep17 : tablier de taille avec raclettes dans la poche (couleur). */
  tablierVitres?: string | null;
  /** ep18 : écharpe enroulée au cou (couleur). */
  echarpe?: string | null;
  /** ep16 : genouillères (couleur, jambes animées). */
  genouilleres?: string | null;
};

/** Durée (frames) d'un passage d'article au scanner (pose « scanne ») ; le bip du décor « caisse_tapis » suit le même cycle. */
export const CYCLE_SCAN = 36;
/** Fraction du cycle où l'article passe sur la vitre du scanner (bip). */
export const BIP_SCAN: [number, number] = [0.3, 0.44];

type Pt = [number, number];
type Pose = {l: [Pt, Pt]; r: [Pt, Pt]}; // [coude, main] pour chaque bras

const SHOULDER_L: Pt = [212, 450];
const SHOULDER_R: Pt = [388, 450];

const POSES: Record<Expression, Pose> = {
  neutre: {l: [[170, 560], [168, 660]], r: [[430, 560], [432, 660]]},
  content: {l: [[160, 560], [150, 650]], r: [[470, 480], [500, 370]]},
  fier: {l: [[110, 540], [205, 625]], r: [[490, 540], [395, 625]]},
  reveur: {l: [[165, 580], [282, 485]], r: [[435, 580], [318, 485]]},
  perplexe: {l: [[170, 560], [168, 660]], r: [[520, 360], [440, 190]]},
  choque: {l: [[100, 390], [80, 250]], r: [[500, 390], [520, 250]]},
};

const Eyes: React.FC<{expression: Expression; blink: number; frame: number; cils: boolean}> = ({
  expression,
  blink,
  frame,
  cils,
}) => {
  const big = expression === 'choque';
  const rx = big ? 46 : 38;
  const ry = (big ? 54 : 46) * blink;
  const pupilR = big ? 10 : 19;
  let dx = 0;
  let dy = 0;
  if (expression === 'reveur') dy = -16;
  if (expression === 'perplexe') {
    dx = 12;
    dy = -10;
  }
  if (expression === 'fier') dx = Math.sin(frame / 20) * 4;
  return (
    <g>
      {[245, 355].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={272} rx={rx} ry={Math.max(ry, 3)} fill="white" stroke={OUT} strokeWidth={SW - 2} />
          {cils && blink > 0.35 ? (
            // cils côté extérieur
            <g stroke={OUT} strokeWidth={6} strokeLinecap="round">
              {[0, 1, 2].map((k) => {
                const side = cx < 300 ? -1 : 1;
                const ang = (-100 + side * (35 + k * 22)) * (Math.PI / 180);
                const x0 = cx + Math.cos(ang) * rx;
                const y0 = 272 + Math.sin(ang) * ry;
                return <path key={k} d={`M ${x0} ${y0} l ${Math.cos(ang) * 16} ${Math.sin(ang) * 16}`} />;
              })}
            </g>
          ) : null}
          {blink > 0.35 ? (
            <>
              <circle cx={cx + dx} cy={278 + dy} r={pupilR} fill={OUT} />
              <circle cx={cx + dx + pupilR * 0.35} cy={272 + dy} r={pupilR * 0.35} fill="white" />
            </>
          ) : null}
          {expression === 'reveur' && blink > 0.35 ? (
            // petites étoiles dans les yeux
            <path
              d={`M ${cx + dx} ${263 + dy} l 5 11 l 12 1 l -9 8 l 3 12 l -11 -6 l -11 6 l 3 -12 l -9 -8 l 12 -1 z`}
              fill="#FFD60A"
              transform={`translate(0 6) scale(1)`}
            />
          ) : null}
        </g>
      ))}
    </g>
  );
};

const Brows: React.FC<{expression: Expression; couleur: string; fines: boolean}> = ({expression, couleur, fines}) => {
  // [gauche, droite] : décalage y intérieur / extérieur
  const shapes: Record<Expression, [number, number, number, number]> = {
    neutre: [0, 0, 0, 0],
    content: [-6, 4, -6, 4],
    fier: [6, -8, 6, -8],
    reveur: [-12, 0, -12, 0],
    perplexe: [10, 4, -22, -4],
    choque: [-22, -12, -22, -12],
  };
  const [li, lo, ri, ro] = shapes[expression];
  return (
    <g stroke={couleur} strokeWidth={fines ? 11 : 14} strokeLinecap="round" fill="none">
      <path d={`M ${210} ${212 + lo} Q 245 ${200 + (lo + li) / 2} ${278} ${212 + li}`} />
      <path d={`M ${322} ${212 + ri} Q 355 ${200 + (ri + ro) / 2} ${390} ${212 + ro}`} />
    </g>
  );
};

const Mouth: React.FC<{expression: Expression; open: number}> = ({expression, open}) => {
  const cy = 350;
  switch (expression) {
    case 'choque':
      return (
        <g>
          <ellipse cx={300} cy={cy + 12} rx={30} ry={40 + open * 8} fill="#7A1F2B" stroke={OUT} strokeWidth={SW - 2} />
          <ellipse cx={300} cy={cy + 36 + open * 4} rx={18} ry={10} fill="#F28482" />
        </g>
      );
    case 'perplexe':
      return (
        <path
          d={`M 262 ${cy + 8} q 14 ${-12 - open * 6} 28 0 t 28 0 t 22 -6`}
          fill="none"
          stroke={OUT}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      );
    case 'reveur':
      return (
        <path
          d={`M 262 ${cy} Q 300 ${cy + 38 + open * 18} 338 ${cy} Q 300 ${cy + 14 + open * 8} 262 ${cy} Z`}
          fill="#7A1F2B"
          stroke={OUT}
          strokeWidth={SW - 2}
          strokeLinejoin="round"
        />
      );
    case 'neutre':
      return (
        <path
          d={`M 268 ${cy} Q 300 ${cy + 20 + open * 22} 332 ${cy}`}
          fill={open > 0.2 ? '#7A1F2B' : 'none'}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      );
    default: {
      // grand sourire (fier / content)
      const h = 52 + open * 16;
      return (
        <g>
          <path
            d={`M 240 ${cy - 6} Q 300 ${cy + h * 1.5} 360 ${cy - 6} Z`}
            fill="#7A1F2B"
            stroke={OUT}
            strokeWidth={SW - 2}
            strokeLinejoin="round"
          />
          <path d={`M 250 ${cy - 2} L 350 ${cy - 2} L 344 ${cy + 14} Q 300 ${cy + 20} 256 ${cy + 14} Z`} fill="white" />
          <ellipse cx={300} cy={cy + h * 0.55} rx={24} ry={10} fill="#F28482" />
        </g>
      );
    }
  }
};

/** Début (de 0 à t) d'une courbe quadratique S → (contrôle E) → H. */
const demiCourbe = (S: Pt, E: Pt, H: Pt, t: number) => {
  const c: Pt = [S[0] + (E[0] - S[0]) * t, S[1] + (E[1] - S[1]) * t];
  const u = 1 - t;
  const fin: Pt = [u * u * S[0] + 2 * u * t * E[0] + t * t * H[0], u * u * S[1] + 2 * u * t * E[1] + t * t * H[1]];
  return `M ${S[0]} ${S[1]} Q ${c[0]} ${c[1]} ${fin[0]} ${fin[1]}`;
};

const Arm: React.FC<{shoulder: Pt; elbow: Pt; hand: Pt; gant: boolean; manche: string; peau: string; bande?: string; doigt?: boolean; mancheCourte?: boolean; /** ep07 : pouce levé */ pouce?: boolean; /** ep07 : poing serré */ poing?: boolean; /** ep09 : manche longue retroussée (couleur du revers) */ revers?: string}> = ({
  shoulder,
  elbow,
  hand,
  gant,
  manche,
  peau,
  bande,
  doigt = false,
  mancheCourte = false,
  pouce = false,
  poing = false,
  revers,
}) => (
  <g>
    <path
      d={`M ${shoulder[0]} ${shoulder[1]} Q ${elbow[0]} ${elbow[1]} ${hand[0]} ${hand[1]}`}
      fill="none"
      stroke={OUT}
      strokeWidth={62}
      strokeLinecap="round"
    />
    <path
      d={`M ${shoulder[0]} ${shoulder[1]} Q ${elbow[0]} ${elbow[1]} ${hand[0]} ${hand[1]}`}
      fill="none"
      stroke={mancheCourte || revers ? peau : manche}
      strokeWidth={46}
      strokeLinecap="round"
    />
    {revers ? (
      // ep09 : manche retroussée jusqu'au coude, revers roulé plus foncé
      <g>
        <path d={demiCourbe(shoulder, elbow, hand, 0.6)} fill="none" stroke={OUT} strokeWidth={66} strokeLinecap="round" />
        <path d={demiCourbe(shoulder, elbow, hand, 0.6)} fill="none" stroke={revers} strokeWidth={52} strokeLinecap="round" />
        <path d={demiCourbe(shoulder, elbow, hand, 0.47)} fill="none" stroke={manche} strokeWidth={46} strokeLinecap="round" />
      </g>
    ) : null}
    {mancheCourte ? (
      // manche courte de T-shirt : un peu plus large que le bras, s'arrête avant le coude
      <g>
        <path d={demiCourbe(shoulder, elbow, hand, 0.42)} fill="none" stroke={OUT} strokeWidth={74} strokeLinecap="round" />
        <path d={demiCourbe(shoulder, elbow, hand, 0.42)} fill="none" stroke={manche} strokeWidth={58} strokeLinecap="round" />
      </g>
    ) : null}
    {bande ? (
      <path
        d={`M ${shoulder[0]} ${shoulder[1]} Q ${elbow[0]} ${elbow[1]} ${hand[0]} ${hand[1]}`}
        pathLength={100}
        fill="none"
        stroke={bande}
        strokeWidth={46}
        strokeDasharray="10 200"
        strokeDashoffset={-62}
      />
    ) : null}
    {doigt ? (
      // index tendu vers le bas
      <g>
        <rect x={hand[0] - 16} y={hand[1] + 6} width={32} height={96} rx={16} fill={peau} stroke={OUT} strokeWidth={SW - 2} />
      </g>
    ) : null}
    {gant ? (
      <g>
        <circle cx={hand[0]} cy={hand[1]} r={44} fill="#D62828" stroke={OUT} strokeWidth={SW} />
        <ellipse cx={hand[0] - 12} cy={hand[1] - 14} rx={14} ry={9} fill="#F07167" />
      </g>
    ) : (
      <circle cx={hand[0]} cy={hand[1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
    )}
    {pouce ? (
      // pouce levé au-dessus du poing
      <rect x={hand[0] - 12} y={hand[1] - 72} width={26} height={56} rx={13} fill={peau} stroke={OUT} strokeWidth={SW - 2} />
    ) : null}
    {pouce || poing ? (
      // plis des doigts repliés
      <path d={`M ${hand[0] - 18} ${hand[1] - 6} h 34 M ${hand[0] - 18} ${hand[1] + 8} h 34`} stroke={OUT} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
    ) : null}
  </g>
);

/** Cheveux derrière la tête (masse bouclée + chignon haut). */
const CheveuxArriere: React.FC<{a: Apparence; frame: number}> = ({a, frame}) => {
  if (a.cheveux.style === 'gomine') return <GomineArriere c={a.cheveux.couleur} />;
  if (a.cheveux.style === 'long_boucle') return <LongBoucleArriere c={a.cheveux.couleur} meches={a.cheveux.meches ?? a.cheveux.couleur} frame={frame} />;
  if (a.cheveux.style === 'pixie') return <PixieArriere c={a.cheveux.couleur} />;
  if (a.cheveux.style === 'mi_long') return <MiLongArriere c={a.cheveux.couleur} frame={frame} />;
  if (a.cheveux.style === 'long_lisse') return <LongLisseArriere c={a.cheveux.couleur} frame={frame} />;
  if (a.cheveux.style === 'court_ondule') return <CourtOnduleArriere c={a.cheveux.couleur} />;
  if (a.cheveux.style === 'tresses') return <TressesArriere c={a.cheveux.couleur} frame={frame} />;
  if (a.tete?.type === 'casquette' && a.tete.envers) {
    // ep09 : visière de la casquette portée à l'envers, qui dépasse derrière la tête
    return (
      <g>
        <path d="M 112 176 Q 300 112 488 176 Q 496 196 470 200 Q 300 150 130 200 Q 104 196 112 176 Z" fill={a.tete.couleurOmbre} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      </g>
    );
  }
  if (a.cheveux.style === 'carre_frange') {
    // carré lisse : masse arrière jusqu'à la mâchoire, coupe droite
    const sway = Math.sin(frame / 10) * 1.5;
    return (
      <path
        d={`M ${126 + sway} 384 L 130 250 Q 138 108 300 102 Q 462 108 470 250 L ${474 + sway} 384 Z`}
        fill={a.cheveux.couleur}
        stroke={OUT}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    );
  }
  if (a.cheveux.style === 'afro_puff') {
    // afro puff haut : grosse boule de cheveux crépus au sommet du crâne
    const c = a.cheveux.couleur;
    const sway = Math.sin(frame / 14) * 1.5;
    const bosses = Array.from({length: 14}).map((_, i) => {
      const ang = (i / 14) * Math.PI * 2;
      return [300 + Math.cos(ang) * 104, 58 + Math.sin(ang) * 88] as Pt;
    });
    return (
      <g transform={`rotate(${sway} 300 160)`}>
        {bosses.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={34} fill={c} stroke={OUT} strokeWidth={SW} />
        ))}
        <ellipse cx={300} cy={58} rx={110} ry={94} fill={c} />
        {/* texture crépue : petites boucles plus claires */}
        {[
          [250, 30], [300, 12], [350, 32], [228, 76], [282, 60], [334, 74], [372, 96], [262, 108], [316, 114],
        ].map(([x, y], i) => (
          <path key={i} d={`M ${x - 9} ${y} q 9 -12 18 0`} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={5} strokeLinecap="round" />
        ))}
      </g>
    );
  }
  if (a.cheveux.style === 'queue_frange') {
    // ep08 : queue-de-cheval haute qui part du sommet et retombe derrière la tête (à droite), balancement léger
    const c = a.cheveux.couleur;
    const sway = Math.sin(frame / 11) * 4;
    return (
      <g>
        <path d="M 150 262 Q 140 112 300 104 Q 460 112 450 262 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <g transform={`rotate(${sway} 330 96)`}>
          <path
            d="M 318 96 Q 430 34 486 126 Q 524 214 492 330 Q 480 374 452 400 Q 470 320 452 236 Q 432 156 344 124 Z"
            fill={c}
            stroke={OUT}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path d="M 372 84 Q 452 90 474 170 M 404 120 Q 470 170 466 300" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={7} strokeLinecap="round" />
          <path d="M 420 200 Q 444 260 440 330" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={6} strokeLinecap="round" />
          {/* chouchou */}
          <ellipse cx={330} cy={100} rx={30} ry={22} fill={a.tenue.hautOmbre} stroke={OUT} strokeWidth={7} transform="rotate(-30 330 100)" />
        </g>
      </g>
    );
  }
  if (a.cheveux.style !== 'chignon_boucle') return null;
  const c = a.cheveux.couleur;
  // boucles autour du crâne, des tempes jusqu'au dessus de la tête
  const boucles = Array.from({length: 15}).map((_, i) => {
    const ang = Math.PI * (0.92 + (i / 14) * 1.16);
    return [300 + Math.cos(ang) * 158, 270 + Math.sin(ang) * 146] as Pt;
  });
  const sway = Math.sin(frame / 12) * 2;
  return (
    <g>
      {/* chignon : grappe de boucles au sommet */}
      <g transform={`translate(0 20) rotate(${sway} 300 150)`}>
        {[
          [300, 62, 58],
          [252, 84, 38],
          [348, 84, 38],
          [270, 40, 32],
          [332, 40, 32],
          [300, 18, 30],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={c} stroke={OUT} strokeWidth={SW} />
        ))}
        {[
          [282, 54],
          [322, 70],
          [300, 30],
        ].map(([x, y], i) => (
          <path key={i} d={`M ${x - 12} ${y} q 12 -16 24 0`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* chouchou */}
        <rect x={252} y={112} width={96} height={28} rx={14} fill={a.tenue.haut} stroke={OUT} strokeWidth={7} />
      </g>
      {boucles.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={34} fill={c} stroke={OUT} strokeWidth={SW} />
      ))}
      <ellipse cx={300} cy={262} rx={160} ry={146} fill={c} />
    </g>
  );
};

/** Cheveux devant (sur le front). */
const CheveuxAvant: React.FC<{a: Apparence}> = ({a}) => {
  const c = a.cheveux.couleur;
  if (a.cheveux.style === 'gomine') return <GomineAvant c={c} />;
  if (a.cheveux.style === 'long_boucle') return <LongBoucleAvant c={c} meches={a.cheveux.meches ?? c} />;
  if (a.cheveux.style === 'pixie') return <PixieAvant c={c} racines={a.cheveux.racines ?? c} />;
  if (a.cheveux.style === 'mi_long') return <MiLongAvant c={c} />;
  if (a.cheveux.style === 'long_lisse') return <LongLisseAvant c={c} />;
  if (a.cheveux.style === 'court_ondule') return <CourtOnduleAvant c={c} />;
  if (a.cheveux.style === 'tresses') return <TressesAvant c={c} />;
  if (a.cheveux.style === 'rase') {
    // ep12 : crâne rasé (léger reflet et ombre de repousse)
    return (
      <g>
        <path d="M 160 240 Q 170 150 300 146 Q 430 150 440 240 Q 380 196 300 194 Q 220 196 160 240 Z" fill={c} opacity={0.18} />
        <path d="M 236 176 Q 270 160 310 162" fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" opacity={0.35} />
      </g>
    );
  }
  if (a.cheveux.style === 'court') {
    // cheveux courts : pattes sur les tempes et petite frange (le dessus est sous le casque)
    return (
      <g fill={c} stroke={OUT} strokeWidth={6} strokeLinejoin="round">
        <path d="M 156 226 Q 152 180 196 160 L 206 214 Q 186 236 182 290 Q 162 280 156 226 Z" />
        <path d="M 444 226 Q 448 180 404 160 L 394 214 Q 414 236 418 290 Q 438 280 444 226 Z" />
        <path d="M 190 214 Q 300 150 410 214 L 396 236 L 370 222 L 350 240 L 322 224 L 300 242 L 278 224 L 250 240 L 230 222 L 204 236 Z" />
      </g>
    );
  }
  if (a.cheveux.style === 'degrade') {
    // ep09 : cheveux noirs courts, ligne nette sur le front, côtés en dégradé (s'estompent vers l'oreille)
    return (
      <g>
        <defs>
          <linearGradient id="degrade-cotes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity={1} />
            <stop offset="1" stopColor={c} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <path d="M 154 252 Q 148 196 204 184 Q 300 166 396 184 Q 452 196 446 252 Q 432 230 402 226 Q 300 212 198 226 Q 168 230 154 252 Z" fill={c} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 152 236 Q 150 272 162 304 L 178 300 Q 170 268 176 232 Z" fill="url(#degrade-cotes)" />
        <path d="M 448 236 Q 450 272 438 304 L 422 300 Q 430 268 424 232 Z" fill="url(#degrade-cotes)" />
      </g>
    );
  }
  if (a.cheveux.style === 'court_dessus') {
    // cheveux courts visibles sur tout le dessus : calotte, petites mèches en épi, pattes courtes
    return (
      <g>
        <path
          d="M 152 262 Q 136 120 300 104 Q 464 120 448 262 Q 440 214 410 200 L 392 214 L 372 196 L 348 212 L 324 194 L 300 210 L 276 194 L 252 212 L 228 196 L 208 214 L 190 200 Q 160 214 152 262 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {/* épis sur le dessus */}
        <path d="M 250 116 L 262 84 L 280 110 L 300 76 L 318 108 L 338 86 L 350 118" fill={c} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 200 150 Q 250 120 320 118" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={9} strokeLinecap="round" />
        {/* pattes */}
        <path d="M 156 238 Q 154 270 166 292 L 176 292 Q 170 262 176 236 Z" fill={c} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 444 238 Q 446 270 434 292 L 424 292 Q 430 262 424 236 Z" fill={c} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      </g>
    );
  }
  if (a.cheveux.style === 'ondule_meche') {
    // ep07 : dessus ondulé assez court, mèche relevée vers l'avant ; côtés en dégradé (très courts, s'estompent vers l'oreille)
    return (
      <g>
        <defs>
          <linearGradient id="fondu-cotes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity={0.95} />
            <stop offset="1" stopColor={c} stopOpacity={0.12} />
          </linearGradient>
        </defs>
        <path d="M 152 276 Q 146 200 190 164 L 204 206 Q 180 232 178 276 Z" fill="url(#fondu-cotes)" />
        <path d="M 448 276 Q 454 200 410 164 L 396 206 Q 420 232 422 276 Z" fill="url(#fondu-cotes)" />
        {/* dessus */}
        <path
          d="M 180 214 Q 164 152 212 124 Q 254 104 302 104 Q 352 104 392 122 Q 438 148 422 214 Q 408 192 388 198 Q 370 180 348 192 Q 326 176 302 190 Q 280 176 258 192 Q 236 180 216 200 Q 196 200 180 214 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {/* mèche relevée vers l'avant */}
        <path
          d="M 226 140 Q 232 86 300 72 Q 360 62 388 92 Q 396 104 384 114 Q 368 98 340 104 Q 344 120 326 128 Q 318 108 290 112 Q 262 118 256 146 Q 236 154 226 140 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path d="M 252 116 q 30 -30 76 -30 M 300 150 q 20 -14 44 -6 M 360 150 q 16 -10 32 0" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  }
  if (a.cheveux.style === 'queue_frange') {
    // ep08 : cheveux tirés vers la queue-de-cheval, frange effilée sur le front, oreilles dégagées
    return (
      <g>
        <path
          d="M 152 272 Q 140 116 300 108 Q 460 116 448 272 Q 440 230 420 210 L 404 198 L 384 186 L 364 196 L 344 182 L 322 194 L 300 180 L 278 194 L 256 182 L 236 196 L 214 188 L 196 204 Q 164 228 152 272 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {/* mèches de la frange et reflets */}
        <path d="M 236 190 L 244 156 M 300 176 L 302 140 M 364 190 L 356 154 M 270 186 L 276 160 M 334 186 L 330 158" stroke="rgba(0,0,0,0.13)" strokeWidth={5} strokeLinecap="round" />
        <path d="M 196 150 Q 250 122 330 122" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={10} strokeLinecap="round" />
        <path d="M 168 232 Q 160 252 160 276" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  }
  if (a.cheveux.style === 'afro_puff') {
    // cheveux tirés vers le haut, ligne du front arrondie ; bandeau large sur la ligne du front
    return (
      <g>
        <path
          d="M 152 262 Q 140 138 300 130 Q 460 138 448 262 Q 438 218 404 204 Q 300 184 196 204 Q 162 218 152 262 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {/* stries des cheveux tirés vers le puff */}
        <path d="M 220 196 Q 236 160 268 140 M 300 188 L 300 136 M 380 196 Q 364 160 332 140" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={5} strokeLinecap="round" />
        {a.bandeau ? (
          <g>
            <path d="M 156 246 Q 162 168 300 160 Q 438 168 444 246" fill="none" stroke={OUT} strokeWidth={50} strokeLinecap="round" />
            <path d="M 156 246 Q 162 168 300 160 Q 438 168 444 246" fill="none" stroke={a.bandeau} strokeWidth={34} strokeLinecap="round" />
            <path d="M 196 190 Q 250 164 312 162" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={7} strokeLinecap="round" />
            {/* petit nœud sur le côté */}
            <path d="M 392 176 q 28 -34 46 -10 q -12 22 -46 10 z M 392 176 q 34 -6 38 22 q -26 6 -38 -22 z" fill={a.bandeau} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={392} cy={176} r={9} fill={a.bandeau} stroke={OUT} strokeWidth={5} />
          </g>
        ) : null}
      </g>
    );
  }
  if (a.cheveux.style === 'carre_frange') {
    // carré noir lisse avec frange droite ; les pans encadrent le visage
    return (
      <g>
        <path
          d="M 134 384 L 136 250 Q 140 112 300 108 Q 460 112 464 250 L 466 384 L 420 384 Q 432 300 418 232 L 408 198 L 192 198 L 182 232 Q 168 300 180 384 Z"
          fill={c}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {/* reflets lisses */}
        <path d="M 190 150 Q 250 124 320 124" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={10} strokeLinecap="round" />
        <path d="M 156 250 Q 152 300 156 350" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={8} strokeLinecap="round" />
        {/* mèches de la frange */}
        <path d="M 240 198 L 246 168 M 300 198 L 300 164 M 360 198 L 354 168" stroke="rgba(255,255,255,0.15)" strokeWidth={5} strokeLinecap="round" />
        {/* ep17 : bandeau optionnel posé au-dessus de la frange */}
        {a.bandeau ? (
          <g>
            <path d="M 142 236 Q 150 150 300 146 Q 450 150 458 236" fill="none" stroke={OUT} strokeWidth={44} strokeLinecap="round" />
            <path d="M 142 236 Q 150 150 300 146 Q 450 150 458 236" fill="none" stroke={a.bandeau} strokeWidth={28} strokeLinecap="round" />
            <path d="M 196 172 Q 250 152 312 150" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={6} strokeLinecap="round" />
          </g>
        ) : null}
      </g>
    );
  }
  if (a.cheveux.style === 'meches') {
    return (
      <>
        <path d="M 160 214 q 10 40 34 30 q -2 30 26 24 q -6 -40 -20 -60 z" fill={c} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 440 214 q -10 40 -34 30 q 2 30 -26 24 q 6 -40 20 -60 z" fill={c} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      </>
    );
  }
  // chignon_boucle : cheveux tirés vers le haut, frange de petites boucles + mèches sur les tempes
  return (
    <g>
      <path d="M 152 250 Q 150 140 300 134 Q 450 140 448 250 Q 420 196 300 190 Q 180 196 152 250 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 220 170 Q 300 150 380 170 M 200 200 Q 250 168 300 166" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={6} strokeLinecap="round" />
      {[
        [196, 200, 20],
        [228, 186, 18],
        [372, 186, 18],
        [404, 200, 20],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} stroke={OUT} strokeWidth={6} />
      ))}
      {/* mèches bouclées sur les tempes */}
      <path d="M 158 236 q -14 30 4 48 q -16 22 6 40" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" />
      <path d="M 442 236 q 14 30 -4 48 q 16 22 -6 40" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

/** ep12 : lunettes carrées noires à fine monture. */
const LunettesCarrees: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    {[242, 358].map((cx) => (
      <g key={cx}>
        <rect x={cx - 50} y={236} width={100} height={72} rx={10} fill="rgba(255,255,255,0.14)" stroke={couleur} strokeWidth={8} />
        <path d={`M ${cx - 34} 252 l 20 -6`} stroke="white" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
    <path d="M 292 262 Q 300 254 308 262" fill="none" stroke={couleur} strokeWidth={7} strokeLinecap="round" />
    <path d="M 192 258 L 158 266 M 408 258 L 442 266" stroke={couleur} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Lunettes: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    {[245, 355].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={272} r={60} fill="rgba(255,255,255,0.12)" stroke={OUT} strokeWidth={22} />
        <circle cx={cx} cy={272} r={60} fill="none" stroke={couleur} strokeWidth={12} />
        <path d={`M ${cx - 30} ${236} q 14 -10 30 -8`} fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
    <path d="M 287 262 Q 300 250 313 262" fill="none" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
    <path d="M 287 262 Q 300 250 313 262" fill="none" stroke={couleur} strokeWidth={9} strokeLinecap="round" />
    <path d="M 185 262 L 158 270 M 415 262 L 442 270" stroke={OUT} strokeWidth={10} strokeLinecap="round" />
  </g>
);

const Casquette: React.FC<{couleur: string; ombre: string; initiale?: string}> = ({couleur, ombre, initiale}) => (
  <>
    <path d="M 150 222 Q 150 90 300 88 Q 450 90 450 222 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 300 90 Q 286 150 290 222 M 300 90 Q 370 130 392 222" fill="none" stroke={ombre} strokeWidth={6} />
    <path d="M 128 226 Q 300 186 472 226 Q 480 250 456 256 Q 300 222 144 256 Q 120 250 128 226 Z" fill={ombre} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx={300} cy={90} r={12} fill={ombre} stroke={OUT} strokeWidth={6} />
    {initiale ? (
      <>
        <circle cx={232} cy={160} r={30} fill="white" stroke={OUT} strokeWidth={6} />
        <text x={232} y={174} textAnchor="middle" fontSize={40} fontFamily="Luckiest Guy" fill={couleur}>
          {initiale}
        </text>
      </>
    ) : null}
  </>
);

/** Casquette portée à l'envers (ep09) : calotte unie sans logo, fermeture réglable devant (on voit les cheveux dans l'ouverture). */
const CasquetteEnvers: React.FC<{couleur: string; ombre: string; cheveux: string}> = ({couleur, ombre, cheveux}) => (
  <g>
    <path d="M 158 214 Q 152 84 300 80 Q 448 84 442 214 Q 300 190 158 214 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 300 82 Q 286 140 290 196 M 300 82 Q 236 120 216 204 M 300 82 Q 364 120 384 204" fill="none" stroke={ombre} strokeWidth={5} />
    <path d="M 200 120 Q 240 96 290 92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={9} strokeLinecap="round" />
    <circle cx={300} cy={82} r={11} fill={ombre} stroke={OUT} strokeWidth={6} />
    {/* ouverture de la fermeture réglable, cheveux visibles dessous */}
    <path d="M 258 204 Q 262 160 300 156 Q 338 160 342 204 Z" fill={cheveux} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <rect x={262} y={186} width={76} height={14} rx={5} fill={ombre} stroke={OUT} strokeWidth={4} />
    {[278, 294, 310, 326].map((x) => (
      <circle key={x} cx={x} cy={193} r={2.5} fill={OUT} />
    ))}
  </g>
);

/** Combinaison de travail (ep09) : col, fermeture éclair, poche poitrine à rabat, taille élastique. */
const Combinaison: React.FC<{ombre: string}> = ({ombre}) => (
  <g>
    <path d="M 300 420 V 690" stroke={ombre} strokeWidth={10} />
    <path d="M 300 430 V 690" stroke="#DEE2E6" strokeWidth={3} strokeDasharray="6 6" />
    <rect x={292} y={446} width={16} height={24} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
    {/* col */}
    <path d="M 246 410 L 300 444 L 270 466 Z M 354 410 L 300 444 L 330 466 Z" fill={ombre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    {/* poche poitrine */}
    <rect x={222} y={488} width={58} height={62} rx={8} fill={ombre} stroke={OUT} strokeWidth={6} />
    <path d="M 220 488 H 282 V 506 Q 251 516 220 506 Z" fill={ombre} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    {/* taille élastique */}
    <path d="M 192 612 Q 300 632 408 612 L 409 640 Q 300 660 191 640 Z" fill={ombre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    {[210, 240, 270, 330, 360, 390].map((x) => (
      <path key={x} d={`M ${x} ${620 + Math.abs(x - 300) * -0.08 + 4} v 18`} stroke={OUT} strokeWidth={3} opacity={0.35} />
    ))}
  </g>
);

/** Gants en nitrile (ep09) accrochés par un mousqueton à la taille, côté droit. */
const GantsCeinture: React.FC<{couleur: string}> = ({couleur}) => {
  const gant = (dx: number, rot: number) => (
    <g transform={`rotate(${rot} ${384 + dx} 640)`}>
      <path
        d={`M ${370 + dx} 640 h 30 l 4 50 q 2 14 -6 16 l -2 26 q -4 8 -8 0 l -1 -22 l -3 26 q -4 8 -8 0 l -1 -26 l -4 22 q -4 8 -8 0 l 0 -30 q -6 -6 -3 -18 Z`}
        fill={couleur}
        stroke={OUT}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d={`M ${376 + dx} 652 v 30`} stroke="white" strokeWidth={4} opacity={0.5} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      {gant(-6, 8)}
      {gant(10, -6)}
      <path d="M 384 618 q 14 2 12 16 q -2 12 -14 10 q -10 -2 -10 -14" fill="none" stroke="#868E96" strokeWidth={6} />
    </g>
  );
};

/** Traces de mousse (petits amas de bulles) sur la tenue (ep09). */
const Mousse: React.FC<{couleur: string; amas: Pt[]}> = ({couleur, amas}) => (
  <g>
    {amas.map(([x, y], i) => (
      <g key={i} fill={couleur} stroke="#BFD7E0" strokeWidth={2}>
        <circle cx={x} cy={y} r={9} />
        <circle cx={x + 11} cy={y + 4} r={7} />
        <circle cx={x - 9} cy={y + 6} r={6} />
        <circle cx={x + 3} cy={y - 9} r={5} />
      </g>
    ))}
  </g>
);

/** Casque de vélo : coque arrondie, aérations, visière courte, jugulaire. */
const CasqueVelo: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <path d="M 168 244 Q 190 384 300 418 Q 410 384 432 244" fill="none" stroke="#495057" strokeWidth={7} strokeLinecap="round" />
    <path d="M 140 232 Q 136 84 300 78 Q 464 84 460 232 Q 300 196 140 232 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 140 232 Q 300 196 460 232 L 456 214 Q 300 178 144 214 Z" fill={ombre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    {[
      'M 236 108 Q 220 150 222 190',
      'M 300 92 L 300 182',
      'M 364 108 Q 380 150 378 190',
    ].map((d, i) => (
      <path key={i} d={d} fill="none" stroke={OUT} strokeWidth={22} strokeLinecap="round" />
    ))}
    {[
      'M 236 108 Q 220 150 222 190',
      'M 300 92 L 300 182',
      'M 364 108 Q 380 150 378 190',
    ].map((d, i) => (
      <path key={i} d={d} fill="none" stroke="#6C757D" strokeWidth={10} strokeLinecap="round" />
    ))}
    <path d="M 190 120 Q 230 96 270 92" fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
  </g>
);

/** Barbe de trois jours : ombre pointillée sur la mâchoire et la moustache. */
const Barbe: React.FC<{couleur: string}> = ({couleur}) => {
  const points: Pt[] = [];
  for (let k = 0; k < 220; k++) {
    const x = 170 + ((k * 53) % 260);
    const y = 330 + ((k * 37) % 86);
    const dx = (x - 300) / 150;
    const dy = (y - 282) / 135;
    if (dx * dx + dy * dy < 0.9 && !(Math.abs(x - 300) < 52 && y > 336 && y < 404)) points.push([x, y]);
  }
  return (
    <g>
      <clipPath id="barbe-visage">
        <ellipse cx={300} cy={282} rx={146} ry={131} />
      </clipPath>
      <g clipPath="url(#barbe-visage)">
        <path
          d="M 150 292 Q 168 330 214 336 Q 250 322 300 326 Q 350 322 386 336 Q 432 330 450 292 L 460 440 L 140 440 Z"
          fill={couleur}
          opacity={0.2}
        />
        <path d="M 252 334 Q 300 318 348 334 L 344 346 Q 300 334 256 346 Z" fill={couleur} opacity={0.32} />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill={couleur} opacity={0.35} />
        ))}
      </g>
    </g>
  );
};

/** Sac de livraison carré porté sur le dos (sans logo). */
const SacDos: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <rect x={116} y={372} width={368} height={300} rx={22} fill={couleur} stroke={OUT} strokeWidth={SW} />
    <path d="M 116 430 H 484" stroke={ombre} strokeWidth={10} />
    <rect x={116} y={372} width={368} height={58} rx={22} fill={ombre} stroke={OUT} strokeWidth={6} />
    <path d="M 140 392 H 200" stroke="rgba(255,255,255,0.35)" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Avant d'un vélo de ville vu de face : roue, garde-boue, fourche, phare, guidon. */
const VeloFace: React.FC<{couleur: string; frame: number}> = ({couleur, frame}) => (
  <g>
    <ellipse cx={300} cy={808} rx={30} ry={112} fill="#212529" stroke={OUT} strokeWidth={SW} />
    <ellipse cx={300} cy={808} rx={12} ry={96} fill="#495057" />
    <path d="M 270 700 Q 300 676 330 700" fill="none" stroke={couleur} strokeWidth={20} strokeLinecap="round" />
    <path d="M 282 600 L 282 800 M 318 600 L 318 800" stroke={OUT} strokeWidth={22} strokeLinecap="round" />
    <path d="M 282 600 L 282 800 M 318 600 L 318 800" stroke={couleur} strokeWidth={10} strokeLinecap="round" />
    <circle cx={300} cy={640} r={30} fill="#FFF3B0" stroke={OUT} strokeWidth={SW - 2} />
    <circle cx={300} cy={640} r={50 + Math.sin(frame / 3) * 4} fill="#FFF3B0" opacity={0.25} />
  </g>
);

const Guidon: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <path d="M 150 592 Q 220 560 300 572 Q 380 560 450 592" fill="none" stroke={OUT} strokeWidth={24} strokeLinecap="round" />
    <path d="M 150 592 Q 220 560 300 572 Q 380 560 450 592" fill="none" stroke="#ADB5BD" strokeWidth={10} strokeLinecap="round" />
    <rect x={280} y={560} width={40} height={40} rx={8} fill={couleur} stroke={OUT} strokeWidth={6} />
  </g>
);

/** Lunettes de protection relevées sur le front : élastique autour de la tête, deux verres teintés. */
const LunettesProtection: React.FC<{couleur: string; elastique: string}> = ({couleur, elastique}) => (
  <g>
    <path d="M 144 196 Q 300 150 456 196" fill="none" stroke={OUT} strokeWidth={26} strokeLinecap="round" />
    <path d="M 144 196 Q 300 150 456 196" fill="none" stroke={elastique} strokeWidth={14} strokeLinecap="round" />
    <path d="M 196 136 Q 300 116 404 136 Q 420 168 404 200 Q 352 212 316 196 Q 300 186 284 196 Q 248 212 196 200 Q 180 168 196 136 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 212 148 Q 250 138 284 146 Q 292 168 282 186 Q 246 198 214 188 Q 204 168 212 148 Z" fill="#9FD3E6" stroke={OUT} strokeWidth={5} />
    <path d="M 388 148 Q 350 138 316 146 Q 308 168 318 186 Q 354 198 386 188 Q 396 168 388 148 Z" fill="#9FD3E6" stroke={OUT} strokeWidth={5} />
    <path d="M 224 160 q 16 -8 34 -6 M 330 158 q 16 -8 34 -6" fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
  </g>
);

/** Taches de rousseur sur le nez et les pommettes. */
const Rousseur: React.FC<{couleur: string}> = ({couleur}) => (
  <g fill={couleur} opacity={0.75}>
    {[
      [196, 300], [214, 312], [232, 300], [188, 318], [222, 326], [206, 290],
      [404, 300], [386, 312], [368, 300], [412, 318], [378, 326], [394, 290],
      [284, 300], [316, 300], [276, 314], [324, 314],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4.5 : 3.5} />
    ))}
  </g>
);

/** Ceinture porte-outils : ceinture de cuir, boucle, pochette sur la hanche avec pince et tournevis. */
const CeintureOutils: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <path d="M 186 650 Q 300 672 414 650 L 416 684 Q 300 706 184 684 Z" fill={couleur} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
    <rect x={278} y={656} width={44} height={36} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
    <rect x={290} y={666} width={20} height={16} rx={3} fill={couleur} />
    {/* outils qui dépassent de la pochette */}
    <path d="M 392 690 L 380 640 M 408 690 L 414 636" stroke={OUT} strokeWidth={16} strokeLinecap="round" />
    <path d="M 392 690 L 380 640" stroke="#E63946" strokeWidth={8} strokeLinecap="round" />
    <path d="M 408 690 L 414 636" stroke="#F4A261" strokeWidth={8} strokeLinecap="round" />
    <path d="M 432 690 L 440 646" stroke={OUT} strokeWidth={10} strokeLinecap="round" />
    <path d="M 432 690 L 440 646" stroke="#CED4DA" strokeWidth={4} strokeLinecap="round" />
    {/* pochette */}
    <path d="M 370 680 H 454 L 448 772 Q 412 784 376 772 Z" fill={couleur} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 370 680 H 454 L 452 708 H 372 Z" fill={ombre} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 384 730 H 440" stroke={ombre} strokeWidth={4} strokeDasharray="6 6" />
  </g>
);

/** Poche poitrine du T-shirt avec le tournevis testeur qui dépasse. */
const PocheTesteur: React.FC<{couleur: string; tissu: string}> = ({couleur, tissu}) => (
  <g>
    {/* tournevis testeur : tige, manche translucide, clip */}
    <path d="M 352 470 L 356 430" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
    <path d="M 352 470 L 356 430" stroke={couleur} strokeWidth={10} strokeLinecap="round" />
    <circle cx={356} cy={440} r={4} fill="#FFD60A" />
    <path d="M 362 446 L 364 474" stroke="#CED4DA" strokeWidth={4} strokeLinecap="round" />
    <path d="M 326 462 H 390 L 388 518 Q 358 526 328 518 Z" fill={tissu} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 326 474 H 390" stroke={OUT} strokeWidth={3} opacity={0.4} />
  </g>
);

/** Tunique de travail : col en V doublé, boutons-pression, badge prénom (sans logo). */
const Tunique: React.FC<{ombre: string; badge?: {texte: string; couleur?: string} | null}> = ({ombre, badge}) => (
  <g>
    <path d="M 252 414 L 300 492 L 348 414 Z" fill="#F1E3E7" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 240 412 L 300 500 L 360 412" fill="none" stroke={ombre} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M 240 412 L 300 500 L 360 412" fill="none" stroke={OUT} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
    {[530, 580, 630].map((y) => (
      <circle key={y} cx={300} cy={y} r={7} fill="#E9ECEF" stroke={OUT} strokeWidth={4} />
    ))}
    {/* poche basse */}
    <path d="M 214 600 H 270 V 636 Q 242 644 214 636 Z" fill={ombre} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
    {badge ? (
      <g transform="rotate(-4 272 478)">
        <rect x={222} y={456} width={100} height={46} rx={9} fill="white" stroke={OUT} strokeWidth={6} />
        <rect x={222} y={456} width={100} height={12} rx={6} fill={badge.couleur ?? '#ADB5BD'} />
        <text x={272} y={496} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={28} fill={OUT}>
          {badge.texte}
        </text>
      </g>
    ) : null}
  </g>
);

/** Ceinture fine avec pochette zippée devant (porte-monnaie de caisse). */
const CeinturePochette: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <path d="M 194 652 Q 300 672 406 652 L 408 674 Q 300 694 192 674 Z" fill={couleur} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <rect x={226} y={654} width={30} height={26} rx={5} fill="#C9A227" stroke={OUT} strokeWidth={5} />
    <path d="M 316 668 H 398 Q 408 668 406 680 L 400 728 Q 398 738 388 738 H 326 Q 316 738 314 728 L 308 680 Q 306 668 316 668 Z" fill={couleur} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 316 686 H 398" stroke={ombre} strokeWidth={7} />
    <path d="M 316 686 H 398" stroke="#ADB5BD" strokeWidth={2} strokeDasharray="4 4" />
    <path d="M 388 686 l 4 16" stroke="#C9A227" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** Article générique scanné (boîte, bouteille, pomme), sans marque. */
const ArticleScan: React.FC<{main: Pt; type: number}> = ({main, type}) => {
  const [x, y] = main;
  if (type === 1)
    return (
      <g>
        <rect x={x - 22} y={y - 104} width={44} height={96} rx={14} fill="#52B788" stroke={OUT} strokeWidth={6} />
        <rect x={x - 10} y={y - 124} width={20} height={24} rx={5} fill="#2D6A4F" stroke={OUT} strokeWidth={5} />
        <rect x={x - 22} y={y - 72} width={44} height={26} fill="#F1FAEE" stroke={OUT} strokeWidth={4} />
      </g>
    );
  if (type === 2)
    return (
      <g>
        <circle cx={x} cy={y - 50} r={34} fill="#E63946" stroke={OUT} strokeWidth={6} />
        <path d={`M ${x} ${y - 84} q 4 -14 12 -18`} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={x + 16} cy={y - 96} rx={12} ry={6} fill="#52B788" stroke={OUT} strokeWidth={4} />
        <ellipse cx={x - 12} cy={y - 62} rx={8} ry={5} fill="white" opacity={0.5} />
      </g>
    );
  return (
    <g>
      <rect x={x - 46} y={y - 96} width={92} height={78} rx={8} fill="#F4A261" stroke={OUT} strokeWidth={6} />
      <rect x={x - 46} y={y - 96} width={92} height={20} rx={6} fill="#E76F51" stroke={OUT} strokeWidth={5} />
      {/* code-barres générique */}
      <rect x={x - 26} y={y - 64} width={52} height={30} fill="white" stroke={OUT} strokeWidth={3} />
      {[0, 6, 10, 16, 22, 28, 32, 38, 44].map((dx) => (
        <rect key={dx} x={x - 22 + dx} y={y - 60} width={dx % 3 ? 2 : 4} height={22} fill={OUT} />
      ))}
    </g>
  );
};

/** Téléphone tenu devant le visage, écran d'appli bancaire générique (sans logo). */
const TelephoneRegarde: React.FC<{main: Pt; peau: string; frame: number}> = ({main, peau, frame}) => {
  const [x, y] = main;
  return (
    <g transform={`rotate(-12 ${x} ${y})`}>
      <rect x={x - 36} y={y - 76} width={72} height={124} rx={12} fill="#2B2D42" stroke={OUT} strokeWidth={SW} />
      <rect x={x - 26} y={y - 64} width={52} height={96} rx={6} fill="#F1FAEE" />
      <rect x={x - 20} y={y - 56} width={40} height={14} rx={4} fill="#06D6A0" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x - 20} y={y - 34 + k * 16} width={18 + ((k * 13 + Math.floor(frame / 8)) % 22)} height={8} rx={4} fill="#ADB5BD" />
      ))}
      <circle cx={x} cy={y + 30} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
    </g>
  );
};

/** Devis papier tenu en main (feuille avec lignes, total souligné). */
const DevisMain: React.FC<{main: Pt; peau: string}> = ({main, peau}) => {
  const [x, y] = main;
  return (
    <g transform={`rotate(8 ${x} ${y})`}>
      <rect x={x - 70} y={y - 150} width={140} height={180} rx={6} fill="white" stroke={OUT} strokeWidth={7} />
      <rect x={x - 54} y={y - 132} width={70} height={14} rx={4} fill="#2B2D42" />
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={`M ${x - 54} ${y - 100 + k * 22} H ${x + 50}`} stroke="#ADB5BD" strokeWidth={6} strokeLinecap="round" />
      ))}
      <rect x={x + 6} y={y - 18} width={48} height={18} rx={4} fill="#FFD60A" stroke={OUT} strokeWidth={3} />
      <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
    </g>
  );
};

/** Tote bag en toile, rempli de jeans pliés, suspendu à la main (sans logo). */
const ToteJeans: React.FC<{main: Pt}> = ({main}) => {
  const [x, y] = main;
  const bx = x - 70;
  const by = y + 52;
  return (
    <g>
      <path d={`M ${bx + 26} ${by + 4} Q ${x} ${y - 70} ${bx + 114} ${by + 4}`} fill="none" stroke={OUT} strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${bx + 26} ${by + 4} Q ${x} ${y - 70} ${bx + 114} ${by + 4}`} fill="none" stroke="#E9DCC0" strokeWidth={8} strokeLinecap="round" />
      {/* jeans qui dépassent */}
      <rect x={bx + 14} y={by - 30} width={50} height={60} rx={8} fill="#3D5A80" stroke={OUT} strokeWidth={6} transform={`rotate(-10 ${bx + 40} ${by})`} />
      <rect x={bx + 56} y={by - 38} width={50} height={60} rx={8} fill="#5C7DA8" stroke={OUT} strokeWidth={6} transform={`rotate(8 ${bx + 80} ${by})`} />
      <rect x={bx + 86} y={by - 24} width={40} height={50} rx={8} fill="#26415E" stroke={OUT} strokeWidth={6} transform={`rotate(16 ${bx + 106} ${by})`} />
      <path d={`M ${bx + 62} ${by - 30} v 40 M ${bx + 74} ${by - 20} h 16`} stroke="#F4A261" strokeWidth={3} />
      {/* sac */}
      <path d={`M ${bx} ${by} H ${bx + 140} L ${bx + 150} ${by + 150} H ${bx - 10} Z`} fill="#E9DCC0" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${bx + 8} ${by + 20} H ${bx + 132}`} stroke="#CDBE9C" strokeWidth={6} />
    </g>
  );
};

/** Gilet de sécurité (ep07) : deux pans ouverts devant, bandes réfléchissantes grises (épaules + taille). */
const Gilet: React.FC<{couleur: string; ombre: string; bandes: string}> = ({couleur, ombre, bandes}) => {
  const gauche = 'M 194 470 Q 194 418 250 412 L 266 412 Q 286 500 284 600 L 284 694 Q 236 692 186 682 Z';
  const droite = 'M 406 470 Q 406 418 350 412 L 334 412 Q 314 500 316 600 L 316 694 Q 364 692 414 682 Z';
  return (
    <g>
      <clipPath id="gilet-pans">
        <path d={gauche} />
        <path d={droite} />
      </clipPath>
      {[gauche, droite].map((d, i) => (
        <path key={i} d={d} fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      ))}
      <g clipPath="url(#gilet-pans)">
        {/* bandes horizontales à la taille */}
        {[566, 622].map((y) => (
          <g key={y}>
            <rect x={180} y={y} width={240} height={30} fill={bandes} />
            <rect x={180} y={y + 12} width={240} height={6} fill="white" opacity={0.75} />
          </g>
        ))}
        {/* bandes verticales sur les épaules */}
        {[226, 374].map((x) => (
          <g key={x}>
            <rect x={x - 14} y={405} width={28} height={161} fill={bandes} />
            <rect x={x - 3} y={405} width={6} height={161} fill="white" opacity={0.75} />
          </g>
        ))}
        {/* ombre sous les bras */}
        <path d="M 186 470 Q 200 560 196 690 L 186 690 Z M 414 470 Q 400 560 404 690 L 414 690 Z" fill={ombre} />
      </g>
      {[gauche, droite].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      ))}
      {/* fermeture : petits scratchs */}
      <rect x={270} y={640} width={16} height={26} rx={4} fill={ombre} stroke={OUT} strokeWidth={4} />
      <rect x={314} y={640} width={16} height={26} rx={4} fill={ombre} stroke={OUT} strokeWidth={4} />
    </g>
  );
};

/** Badge vierge sur cordon (ep07), sans logo. */
const CordonBadge: React.FC<{cordon: string}> = ({cordon}) => (
  <g>
    <path d="M 270 416 Q 276 480 296 540 M 330 416 Q 324 480 304 540" fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
    <path d="M 270 416 Q 276 480 296 540 M 330 416 Q 324 480 304 540" fill="none" stroke={cordon} strokeWidth={7} strokeLinecap="round" />
    <rect x={292} y={532} width={16} height={18} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
    <g transform="rotate(3 300 590)">
      <rect x={266} y={546} width={68} height={88} rx={9} fill="white" stroke={OUT} strokeWidth={6} />
      <rect x={278} y={562} width={44} height={34} rx={5} fill="#DEE2E6" />
      <rect x={278} y={606} width={44} height={7} rx={3} fill="#CED4DA" />
      <rect x={278} y={618} width={30} height={7} rx={3} fill="#CED4DA" />
    </g>
  </g>
);

/** Douchette de scan générique accrochée à la ceinture, côté droit (ep07). */
const Douchette: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g transform="rotate(-12 420 720)">
    <rect x={394} y={688} width={40} height={20} rx={5} fill="#2B2B33" stroke={OUT} strokeWidth={5} />
    <path d="M 398 700 H 466 Q 478 700 478 712 V 724 Q 478 734 466 734 H 436 L 430 776 Q 428 786 418 786 H 410 Q 400 786 402 776 L 408 734 H 398 Z" fill={couleur} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <rect x={470} y={704} width={10} height={26} rx={3} fill="#E63946" stroke={OUT} strokeWidth={3} />
    <path d="M 412 740 L 408 770" stroke={ombre} strokeWidth={8} strokeLinecap="round" />
    <path d="M 410 742 h 16 v 10 h -16 z" fill={ombre} />
  </g>
);

/** Casque audio générique (sans logo) posé autour du cou (ep08) : arceau derrière la nuque, écouteurs sur les clavicules. */
const CasqueCou: React.FC<{couleur: string; coussins: string}> = ({couleur, coussins}) => (
  <g>
    <path d="M 226 420 Q 300 470 374 420" fill="none" stroke={OUT} strokeWidth={22} strokeLinecap="round" />
    <path d="M 226 420 Q 300 470 374 420" fill="none" stroke={couleur} strokeWidth={11} strokeLinecap="round" />
    {[
      [230, 452, -18],
      [370, 452, 18],
    ].map(([x, y, r]) => (
      <g key={x} transform={`rotate(${r} ${x} ${y})`}>
        <rect x={x - 32} y={y - 38} width={64} height={76} rx={28} fill={coussins} stroke={OUT} strokeWidth={7} />
        <rect x={x - 22} y={y - 28} width={44} height={56} rx={20} fill={couleur} stroke={OUT} strokeWidth={5} />
        <path d={`M ${x - 10} ${y - 16} q -6 16 0 30`} fill="none" stroke="white" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

export const Personnage: React.FC<{
  apparence: Apparence;
  expression: Expression;
  talking: boolean;
  accessoire?: Accessoire;
  /** false : pas de saut d'entrée (première image d'un épisode). */
  entree?: boolean;
  pose?: Posture;
  /** Objet porté à la main droite. */
  objetMain?: ObjetMain | null;
  /** Personnage muet (à partir de l'épisode 5) : la bouche garde la pose fixe de l'expression,
   *  jamais synchronisée sur la voix off. Défaut false : comportement des épisodes 1 à 4. */
  muet?: boolean;
  /** ep10 : mouvement image par image (marche, bras articulés, objets en main, tête, épaules, miroir).
   *  Absent (épisodes 1 à 9) : rendu inchangé. */
  mouvement?: Mouvement | null;
}> = ({apparence: a, expression, talking, accessoire = null, entree = true, pose: posture = 'debout', objetMain = null, muet = false, mouvement: mv = null}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {peau, ombre: peauOmbre, joues} = a.teint;
  const t = a.tenue;
  const femme = a.genre === 'femme';

  // Entrée : petit saut depuis le bas à chaque plan
  const enter = entree ? spring({frame, fps, config: {damping: 12, stiffness: 180}}) : 1;
  const enterY = interpolate(enter, [0, 1], [120, 0]);

  // Respiration / rebond
  const bob = posture === 'velo' ? 0 : Math.sin(frame / 7) * (expression === 'choque' ? 3 : posture === 'assis' ? 4 : 8);
  const squash = 1 + Math.sin(frame / 7) * 0.012;
  const tremble = expression === 'choque' ? Math.sin(frame * 3.1) * 3 : 0;
  const tilt = expression === 'perplexe' ? -7 : expression === 'reveur' ? Math.sin(frame / 15) * 4 : 0;

  // Clignement toutes les ~2,7 s
  const cyc = frame % 80;
  const blink = cyc > 74 ? Math.abs(cyc - 77) / 3 : 1;

  // Bouche qui parle
  const open = talking && !muet ? Math.abs(Math.sin(frame * 0.9)) : 0;

  const pose = POSES[expression];
  const velo = posture === 'velo';
  const assis = posture === 'assis';
  const gant = accessoire === 'gants';
  // Pour le téléphone, la main droite tient le téléphone près du visage
  let right: [Pt, Pt] = accessoire === 'telephone' ? [[480, 520], [420, 330]] : pose.r;
  let left: [Pt, Pt] = gant ? [[140, 520], [230, 470]] : pose.l;
  if (velo) {
    // mains sur le guidon
    left = [[150, 520], [168, 586]];
    right = [[450, 520], [432, 586]];
  } else if (assis) {
    // coudes posés, mains sur les genoux (repère du haut du corps, décalé de HAUT_ASSIS)
    left = [[168, 540], [238, 596]];
    right = [[432, 540], [362, 596]];
  } else if (posture === 'pointe_bas') {
    right = [[520, 540], [530, 680]];
  } else if (posture === 'tire_cable') {
    // tire un câble sorti du mur, à sa gauche : deux mains sur le câble, à-coups réguliers
    const tir = Math.max(0, Math.sin(frame / 6)) * 22;
    left = [[150, 470], [70 + tir, 420]];
    right = [[300, 560], [170 + tir, 470]];
  } else if (posture === 'photo') {
    // bras tendu vers la droite, téléphone levé pour photographier
    right = [[470, 470], [540, 380]];
  } else if (posture === 'scanne') {
    // caisse : la main droite fait glisser un article de gauche à droite au-dessus du scanner, la gauche reste au comptoir
    const u = (frame % CYCLE_SCAN) / CYCLE_SCAN;
    const aller = u < 0.7 ? u / 0.7 : 1 - (u - 0.7) / 0.3;
    const lisse = (1 - Math.cos(aller * Math.PI)) / 2;
    const hx = 150 + lisse * 300;
    right = [[hx + 90, 560], [hx, 600 - Math.sin(lisse * Math.PI) * 14]];
    left = [[150, 560], [196, 622]];
  } else if (posture === 'regarde_telephone') {
    right = [[480, 520], [410, 340]];
  } else if (posture === 'pousse') {
    // ep07 : pousse un chariot (poignée à sa gauche à l'écran, côté droit) avec les deux mains, petit va-et-vient
    const va = Math.sin(frame / 8) * 6;
    left = [[250, 590], [470 + va, 612]];
    right = [[480, 560], [548 + va, 598]];
  } else if (posture === 'pouce') {
    // ep07 : pouce levé, bras droit plié devant
    right = [[500, 560], [478, 448]];
  } else if (posture === 'poing') {
    // ep07 : poing serré levé près de l'épaule
    right = [[520, 540], [452, 420]];
  } else if (posture === 'deballe') {
    // ep09 : sort une microfibre pliée du kit, la soulève devant lui (petit mouvement de haut en bas)
    const lv = Math.sin(frame / 9) * 10;
    left = [[160, 580], [250, 560 + lv]];
    right = [[440, 580], [350, 560 + lv]];
  } else if (posture === 'retrousse') {
    // ep09 : retrousse sa manche : avant-bras gauche plié devant, la main droite remonte le long
    const gl = (Math.sin(frame / 7) + 1) / 2;
    left = [[150, 600], [300, 590]];
    right = [[450, 620], [200 + gl * 70, 596]];
  } else if (posture === 'tape') {
    // ep09 : remplit un formulaire sur l'ordinateur portable (devant, à droite) : mains sur le clavier
    const tap = (k: number) => Math.max(0, Math.sin(frame / 2.2 + k)) * 8;
    left = [[250, 620], [510, 600 - tap(0)]];
    right = [[480, 580], [600, 604 - tap(1.7)]];
  } else if (posture === 'extracteur') {
    // ep09 : passe le suceur de l'extracteur sur un siège (à droite), va-et-vient
    const va = Math.sin(frame / 8) * 34;
    left = [[260, 600], [440 + va * 0.6, 560]];
    right = [[480, 520], [520 + va * 0.8, 500]];
  } else if (posture === 'serre_main') {
    // ep09 : serre la main d'une silhouette à droite, petites secousses
    const sec = Math.sin(frame / 3) * 9;
    right = [[500, 500], [626, 470 + sec]];
  } else if (posture === 'pulverise') {
    // ep09 : pulvérisateur « sans eau » levé vers la voiture (à droite), microfibre dans la main gauche
    right = [[490, 520], [560, 450]];
  }
  // Pédalage : manivelle qui tourne (2 tours / s environ)
  const ang = (frame / fps) * Math.PI * 3.4;
  const pedalBob = velo ? Math.abs(Math.sin(ang)) * 6 : 0;
  const HAUT_ASSIS = 150;
  const decalHaut = assis ? HAUT_ASSIS : 0;
  const rightG: [Pt, Pt] = gant ? [[460, 520], [370, 470]] : right;
  const casquette = a.tete?.type === 'casquette' ? a.tete : null;
  const lunettes = a.tete?.type === 'lunettes_rondes' ? a.tete : null;
  const casque = a.tete?.type === 'casque_velo' ? a.tete : null;
  const protection = a.tete?.type === 'lunettes_protection' ? a.tete : null;
  const tshirt = !!t.tshirt;
  const mancheCourte = tshirt || !!t.tunique;
  // repère du "?" et de la goutte : plus haut avec un chignon
  const hautTete = a.cheveux.style === 'chignon_boucle' ? -10 : a.tete?.type === 'casque_velo' ? -20 : 0;
  const carre = a.cheveux.style === 'carre_frange';
  const photo = posture === 'photo';

  // ep10 : bras articulés (épaule + coude), haussement d'épaules, marche
  const REPOS: BrasAngles = {epaule: 12, coude: -8};
  const hausse = mv?.epaules ?? 0;
  const epL: [number, number] = [SHOULDER_L[0], SHOULDER_L[1] - hausse];
  const epR: [number, number] = [SHOULDER_R[0], SHOULDER_R[1] - hausse];
  const angL = mv ? (mv.bras?.l ?? REPOS) : null;
  const angR = mv ? (mv.bras?.r ?? REPOS) : null;
  const brasL = angL ? brasFK(epL, -1, angL) : null;
  const brasR = angR ? brasFK(epR, 1, angR) : null;
  // une main gauche levée au niveau du visage passe devant la tête
  const lDevantTete = !!brasL && brasL[1][1] < 400;
  const bobMarche = mv?.marche != null ? -Math.abs(Math.sin(mv.marche)) * 12 : 0;
  const miroir = !!mv?.miroir;
  const brasArticuleL = brasL && angL ? (
    <BrasArticule epaule={epL} coude={brasL[0]} main={brasL[1]} cote={-1} a={angL} manche={t.haut} peau={peau} revers={t.retroussees ? t.hautOmbre : undefined} poignet={t.sweat ? t.hautOmbre : undefined} rayures={t.mariniere} gant={a.gants ?? undefined} tatouage={a.tatouagesBras ?? undefined} />
  ) : null;

  return (
    <svg viewBox="0 0 600 900" style={{width: '100%', height: '100%', overflow: 'visible'}}>
      {/* ombre au sol */}
      <ellipse cx={300} cy={872} rx={200 - bob * 2} ry={22} fill="rgba(0,0,0,0.25)" />

      <g transform={miroir ? 'translate(600 0) scale(-1 1)' : undefined}>
      <g transform={`translate(${tremble} ${enterY + bob + bobMarche}) scale(1 ${squash})`} style={{transformOrigin: '300px 870px'}}>
        {velo ? (
          <>
            {/* traits de vitesse */}
            {Array.from({length: 6}).map((_, k) => {
              const side = k % 2 ? 1 : -1;
              const p = ((frame * 0.08 + k * 0.37) % 1);
              const x0 = 300 + side * (230 + p * 160);
              const y0 = 560 + k * 50 + p * 120;
              return (
                <path key={k} d={`M ${x0} ${y0} l ${side * 70} ${30}`} stroke="white" strokeWidth={10} strokeLinecap="round" opacity={0.8 * (1 - p)} />
              );
            })}
            {/* Jambes qui pédalent */}
            {[-1, 1].map((side) => {
              const lift = Math.sin(ang + (side > 0 ? Math.PI : 0)); // -1 haut … 1 bas
              const hip: Pt = [300 + side * 48, 650];
              const foot: Pt = [300 + side * 92, 812 + lift * 38];
              const knee: Pt = [300 + side * 96, 736 + lift * 26];
              const d = `M ${hip[0]} ${hip[1]} L ${knee[0]} ${knee[1]} L ${foot[0]} ${foot[1]}`;
              return (
                <g key={side}>
                  <path d={d} fill="none" stroke={OUT} strokeWidth={80} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={d} fill="none" stroke={t.bas} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
                  <rect x={foot[0] - 40} y={foot[1] + 14} width={80} height={14} rx={5} fill="#495057" stroke={OUT} strokeWidth={5} />
                  <ellipse cx={foot[0]} cy={foot[1] + 10} rx={44} ry={26} fill={t.chaussures} stroke={OUT} strokeWidth={SW - 1} />
                  <rect x={foot[0] - 40} y={foot[1] + 16} width={80} height={10} rx={5} fill={t.bandeChaussures} />
                </g>
              );
            })}
            <VeloFace couleur={a.velo ?? '#2D6A4F'} frame={frame} />
          </>
        ) : assis ? null : mv ? (
          <Jambes phase={mv.marche ?? null} bas={t.bas} jean={t.jean} chaussures={t.chaussures} bande={t.bandeChaussures} genou={a.genouilleres} />
        ) : (
          <>
            {/* Jambes */}
            <rect x={222} y={640} width={66} height={200} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            <rect x={312} y={640} width={66} height={200} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            {t.poches ? (
              // poches cargo sur les cuisses
              <g>
                {[226, 316].map((x) => (
                  <g key={x}>
                    <rect x={x} y={716} width={58} height={64} rx={8} fill={t.poches} stroke={OUT} strokeWidth={6} />
                    <rect x={x} y={716} width={58} height={20} rx={6} fill={t.poches} stroke={OUT} strokeWidth={5} />
                  </g>
                ))}
              </g>
            ) : null}
            {t.jean ? (
              // ep08 : jean droit délavé : surpiqûres latérales, reflets plus clairs sur les cuisses, ourlet
              <g>
                {[226, 374].map((x) => (
                  <path key={x} d={`M ${x} 700 V 828`} stroke={t.jean} strokeWidth={4} strokeDasharray="10 7" />
                ))}
                {[240, 330].map((x) => (
                  <rect key={x} x={x} y={704} width={30} height={90} rx={15} fill="white" opacity={0.18} />
                ))}
                {[222, 312].map((x) => (
                  <path key={x} d={`M ${x + 4} 812 H ${x + 62}`} stroke={t.jean} strokeWidth={4} strokeDasharray="8 6" />
                ))}
              </g>
            ) : null}
            {t.mousse ? <Mousse couleur={t.mousse} amas={[[252, 770], [352, 712], [338, 806]]} /> : null}
            {/* Baskets */}
            <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <rect x={196} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
            <rect x={304} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
          </>
        )}

        <g transform={`translate(0 ${decalHaut - pedalBob})`}>
        {a.sac ? <SacDos couleur={a.sac.couleur} ombre={a.sac.ombre} /> : null}
        {a.petitSac ? <BretellesSac couleur={a.petitSac.couleur} ombre={a.petitSac.ombre} /> : null}

        {/* Torse (sweat) */}
        <path
          d={
            t.tunique
              ? 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 414 712 Q 300 734 186 712 Z'
              : t.oversize
              ? 'M 182 474 Q 182 414 246 408 L 354 408 Q 418 414 418 474 L 428 694 Q 300 716 172 694 Z'
              : femme
              ? 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 404 680 Q 300 700 196 680 Z'
              : 'M 196 470 Q 196 418 250 412 L 350 412 Q 404 418 404 470 L 412 680 Q 300 700 188 680 Z'
          }
          fill={t.haut}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {t.mariniere ? (
          // ep11 : rayures de marinière, découpées à la forme du torse
          <g>
            <clipPath id={`torse-${a.nom}`}>
              <path d={femme ? 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 404 680 Q 300 700 196 680 Z' : 'M 196 470 Q 196 418 250 412 L 350 412 Q 404 418 404 470 L 412 680 Q 300 700 188 680 Z'} />
            </clipPath>
            <g clipPath={`url(#torse-${a.nom})`}>
              <RayuresTorse couleur={t.mariniere} />
            </g>
            <path d={femme ? 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 404 680 Q 300 700 196 680 Z' : 'M 196 470 Q 196 418 250 412 L 350 412 Q 404 418 404 470 L 412 680 Q 300 700 188 680 Z'} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          </g>
        ) : null}
        {t.combinaison ? (
          <Combinaison ombre={t.hautOmbre} />
        ) : t.bandes ? (
          <g>
            {/* veste zippée : col, fermeture éclair, bandes réfléchissantes */}
            <path d="M 300 414 V 688" stroke={t.hautOmbre} strokeWidth={10} />
            <path d="M 300 414 V 688" stroke="#ADB5BD" strokeWidth={3} strokeDasharray="6 6" />
            <path d="M 192 548 L 408 548 L 409 578 L 191 578 Z" fill={t.bandes} stroke={OUT} strokeWidth={6} />
            <path d="M 192 563 H 408" stroke="white" strokeWidth={4} opacity={0.8} />
            <path d="M 244 414 Q 300 446 356 414 L 350 400 Q 300 424 250 400 Z" fill={t.hautOmbre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            {a.sac ? (
              // bretelles du sac
              <path d="M 226 420 Q 232 520 236 640 M 374 420 Q 368 520 364 640" fill="none" stroke="#343A40" strokeWidth={20} strokeLinecap="round" />
            ) : null}
          </g>
        ) : t.capuche ? (
          <g>
            {/* capuche roulée autour du cou */}
            <path d="M 206 446 Q 210 388 300 384 Q 390 388 394 446 Q 300 492 206 446 Z" fill={t.hautOmbre} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <path d="M 232 438 Q 300 470 368 438" fill="none" stroke={OUT} strokeWidth={5} opacity={0.5} />
            {/* cordons */}
            <path d="M 282 456 L 276 548 M 318 456 L 324 548" stroke="#F1F3F5" strokeWidth={8} strokeLinecap="round" />
            <rect x={270} y={546} width={12} height={20} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={3} />
            <rect x={318} y={546} width={12} height={20} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={3} />
            {/* poche kangourou */}
            <path d="M 236 592 L 364 592 L 384 664 Q 300 678 216 664 Z" fill={t.hautOmbre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            {/* bord-côte en bas */}
            <path d="M 176 680 Q 300 702 424 680" fill="none" stroke={t.hautOmbre} strokeWidth={12} />
          </g>
        ) : t.pull ? (
          <g>
            {/* ep08 : pull en maille oversize : côtes verticales, col rond côtelé, bas côtelé */}
            <g stroke={t.hautOmbre} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
              {[232, 266, 300, 334, 368].map((x) => (
                <path key={x} d={`M ${x} 470 Q ${x + (x - 300) * 0.06} 580 ${x + (x - 300) * 0.1} 670`} fill="none" />
              ))}
            </g>
            <path d="M 176 688 Q 300 712 424 688 L 428 694 Q 300 716 172 694 Z" fill={t.hautOmbre} />
            <path d="M 178 676 Q 300 700 422 676" fill="none" stroke={OUT} strokeWidth={5} opacity={0.6} />
            <path d="M 244 412 Q 300 462 356 412" fill="none" stroke={OUT} strokeWidth={30} strokeLinecap="round" />
            <path d="M 244 412 Q 300 462 356 412" fill="none" stroke={t.hautOmbre} strokeWidth={18} strokeLinecap="round" />
            <path d="M 260 424 L 262 436 M 280 434 L 281 446 M 300 438 L 300 450 M 320 434 L 319 446 M 340 424 L 338 436" stroke={t.haut} strokeWidth={3} strokeLinecap="round" />
          </g>
        ) : t.tunique ? (
          <Tunique ombre={t.hautOmbre} badge={a.badge} />
        ) : t.chemise ? (
          <Chemise ombre={t.hautOmbre} />
        ) : t.sweat ? (
          <SweatColRond ombre={t.hautOmbre} />
        ) : tshirt ? (
          <g>
            {/* T-shirt : col rond, pli léger, poche poitrine (tournevis testeur) */}
            <path d="M 250 414 Q 300 452 350 414" fill="none" stroke={t.hautOmbre} strokeWidth={16} strokeLinecap="round" />
            <path d="M 250 414 Q 300 452 350 414" fill="none" stroke={OUT} strokeWidth={5} strokeLinecap="round" />
            <path d="M 236 560 Q 250 600 244 640" fill="none" stroke={t.hautOmbre} strokeWidth={8} strokeLinecap="round" />
            {a.testeur ? <PocheTesteur couleur={a.testeur} tissu={t.hautOmbre} /> : null}
          </g>
        ) : (
          <>
            <path d="M 236 600 Q 300 620 364 600 L 360 660 Q 300 672 240 660 Z" fill={t.hautOmbre} stroke={OUT} strokeWidth={6} />
            <path d="M 270 414 L 284 490 M 330 414 L 316 490" stroke="white" strokeWidth={7} strokeLinecap="round" />
          </>
        )}
        {t.chine ? (
          // T-shirt chiné : petites mouchetures (visibles entre les pans du gilet)
          <g fill={t.chine} opacity={0.8}>
            {Array.from({length: 22}).map((_, k) => (
              <rect key={k} x={262 + ((k * 37) % 76)} y={430 + ((k * 53) % 250)} width={7} height={3} rx={1.5} />
            ))}
          </g>
        ) : null}
        {a.gilet ? <Gilet couleur={a.gilet.couleur} ombre={a.gilet.ombre} bandes={a.gilet.bandes} /> : null}
        {a.cordonBadge ? <CordonBadge cordon={a.cordonBadge.cordon} /> : null}
        {a.vesteZip ? <VesteZip dessous={a.vesteZip.dessous} zip={a.vesteZip.zip} /> : null}
        {a.chronoCou ? <ChronoCou cordon={a.chronoCou} /> : null}
        {a.salopette ? <Salopette couleur={a.salopette.couleur} ombre={a.salopette.ombre} /> : null}
        {a.tablierVitres && !assis ? <TablierVitres couleur={a.tablierVitres} /> : null}
        {a.echarpe ? <Echarpe couleur={a.echarpe} /> : null}
        {a.casqueCou ? <CasqueCou couleur={a.casqueCou.couleur} coussins={a.casqueCou.coussins} /> : null}
        {a.doudoune ? <Doudoune couleur={a.doudoune.couleur} ombre={a.doudoune.ombre} /> : null}
        {a.vesteJean ? <VesteJean couleur={a.vesteJean.couleur} ombre={a.vesteJean.ombre} dessous={a.vesteJean.dessous} /> : null}
        {a.bandouliere ? <Bandouliere enMain={mv?.objets?.l === 'appareil' || mv?.objets?.r === 'appareil'} /> : null}
        {a.robe && !assis ? <RobeLongue couleur={a.robe.couleur} ombre={a.robe.ombre} /> : null}
        {a.petitSac ? (
          <path d="M 226 414 Q 234 520 230 610 M 374 414 Q 366 520 370 610" fill="none" stroke={a.petitSac.couleur} strokeWidth={13} strokeLinecap="round" />
        ) : null}
        {a.ecouteursCou ? <EcouteursCou couleur={a.ecouteursCou.couleur} embouts={a.ecouteursCou.embouts} /> : null}
        {a.cardigan ? <Cardigan ombre={a.cardigan.ombre} dessous={a.cardigan.dessous} /> : null}
        {a.giletPoches ? <GiletPoches couleur={a.giletPoches.couleur} ombre={a.giletPoches.ombre} /> : null}
        {a.robeChambre && !assis ? <RobeChambre couleur={a.robeChambre.couleur} ombre={a.robeChambre.ombre} /> : null}
        {a.tablier && !assis ? <TablierCoiffure couleur={a.tablier.couleur} poche={a.tablier.poche} /> : null}
        {assis ? (
          <g transform={`translate(0 ${-HAUT_ASSIS})`}>
            {/* Assis sur le trottoir : genoux relevés, tibias et baskets devant */}
            <rect x={218} y={760} width={70} height={80} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            <rect x={312} y={760} width={70} height={80} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            <circle cx={250} cy={752} r={50} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            <circle cx={350} cy={752} r={50} fill={t.bas} stroke={OUT} strokeWidth={SW} />
            <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <rect x={196} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
            <rect x={304} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
          </g>
        ) : null}

        {accessoire === 'cravate' ? (
          <g>
            <path d="M 262 412 L 300 440 L 338 412 L 338 470 L 262 470 Z" fill="white" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 300 436 L 316 456 L 306 470 L 318 590 L 300 612 L 282 590 L 294 470 L 284 456 Z" fill="#1D3557" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ) : null}
        {a.chemiseOuverte ? (
          <g strokeLinejoin="round">
            <path d="M 252 408 L 300 520 L 348 408 Z" fill={a.chemiseOuverte} stroke={OUT} strokeWidth={6} />
            <path d="M 278 408 L 300 456 L 322 408 Z" fill={a.teint.peau} />
            <path d="M 262 408 L 282 446 L 300 456 M 338 408 L 318 446 L 300 456" fill="none" stroke={OUT} strokeWidth={5} />
          </g>
        ) : null}
        {a.costume ? <ReversCostume ombre={a.costume.revers} /> : null}

        {a.ceintureOutils && !assis && !velo ? <CeintureOutils couleur={a.ceintureOutils.couleur} ombre={a.ceintureOutils.ombre} /> : null}
        {a.ceinturePochette && !assis && !velo ? <CeinturePochette couleur={a.ceinturePochette.couleur} ombre={a.ceinturePochette.ombre} /> : null}
        {a.douchette && !assis && !velo ? <Douchette couleur={a.douchette.couleur} ombre={a.douchette.ombre} /> : null}
        {t.mousse ? <Mousse couleur={t.mousse} amas={[[352, 520], [236, 590]]} /> : null}
        {a.gantsCeinture && !assis && !velo ? <GantsCeinture couleur={a.gantsCeinture} /> : null}

        {/* Bras gauche */}
        {velo ? <Guidon couleur={a.velo ?? '#2D6A4F'} /> : null}
        {mv ? (lDevantTete ? null : brasArticuleL) : (
        <Arm shoulder={SHOULDER_L} elbow={left[0]} hand={left[1]} gant={gant} manche={t.haut} peau={peau} bande={t.bandes} mancheCourte={mancheCourte} revers={t.retroussees ? t.hautOmbre : undefined} />
        )}

        {/* Tête */}
        <g transform={`${mv ? `translate(0 ${(mv.tete?.dy ?? 0) + hausse * 0.5}) ` : ''}rotate(${tilt + (mv?.tete?.rot ?? 0)} 300 400)`}>
          <CheveuxArriere a={a} frame={frame} />
          <rect x={268} y={370} width={64} height={56} fill={peauOmbre} stroke={OUT} strokeWidth={SW} />
          {/* Oreilles (cachées par un carré, ou par des cheveux longs ep11) */}
          {carre || a.cheveux.style === 'mi_long' || a.cheveux.style === 'long_lisse' ? null : (
            <>
              <circle cx={152} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
              <circle cx={448} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            </>
          )}
          {a.clous && !carre ? (
            <>
              {[150, 450].map((x) => (
                <g key={x}>
                  <circle cx={x} cy={312} r={9} fill={a.clous!} stroke={OUT} strokeWidth={4} />
                  <circle cx={x - 3} cy={309} r={3} fill="white" opacity={0.8} />
                </g>
              ))}
            </>
          ) : null}
          {a.perles && !carre ? (
            <>
              {[150, 450].map((x) => (
                <g key={x}>
                  <path d={`M ${x} 312 V 320`} stroke={OUT} strokeWidth={4} />
                  <circle cx={x} cy={330} r={11} fill={a.perles!} stroke={OUT} strokeWidth={4} />
                  <circle cx={x - 4} cy={326} r={3.5} fill="white" />
                </g>
              ))}
            </>
          ) : null}
          {a.boucles && !carre ? (
            <>
              <circle cx={150} cy={336} r={18} fill="none" stroke={OUT} strokeWidth={12} />
              <circle cx={150} cy={336} r={18} fill="none" stroke={a.boucles} strokeWidth={6} />
              <circle cx={450} cy={336} r={18} fill="none" stroke={OUT} strokeWidth={12} />
              <circle cx={450} cy={336} r={18} fill="none" stroke={a.boucles} strokeWidth={6} />
            </>
          ) : null}
          <ellipse cx={300} cy={282} rx={150} ry={135} fill={peau} stroke={OUT} strokeWidth={SW} />
          <CheveuxAvant a={a} />
          {a.piercing ? <Piercing couleur={a.piercing} /> : null}
          {a.oreillette ? (
            <g>
              <ellipse cx={452} cy={292} rx={13} ry={16} fill={a.oreillette} stroke={OUT} strokeWidth={5} />
              <path d="M 456 306 Q 462 340 450 360" fill="none" stroke={a.oreillette} strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null}
          {a.peigneOreille ? <PeigneOreille couleur={a.peigneOreille} /> : null}
          {a.boucles && carre ? (
            // petites créoles qui dépassent sous le carré
            <>
              {[164, 436].map((x) => (
                <g key={x}>
                  <circle cx={x} cy={398} r={15} fill="none" stroke={OUT} strokeWidth={11} />
                  <circle cx={x} cy={398} r={15} fill="none" stroke={a.boucles!} strokeWidth={5} />
                </g>
              ))}
            </>
          ) : null}
          {/* Joues */}
          <ellipse cx={200} cy={325} rx={26} ry={15} fill={joues} opacity={expression === 'reveur' ? 0.9 : 0.5} />
          <ellipse cx={400} cy={325} rx={26} ry={15} fill={joues} opacity={expression === 'reveur' ? 0.9 : 0.5} />

          {a.rousseur ? <Rousseur couleur={a.rousseur} /> : null}
          <Eyes expression={expression} blink={blink} frame={frame} cils={femme} />
          {lunettes ? <Lunettes couleur={lunettes.couleur} /> : null}
          {a.tete?.type === 'lunettes_carrees' ? <LunettesCarrees couleur={a.tete.couleur} /> : null}
          <g transform={lunettes || a.tete?.type === 'lunettes_carrees' ? 'translate(0 -14)' : undefined}>
            <Brows expression={expression} couleur={a.sourcils ?? a.cheveux.couleur} fines={femme} />
          </g>
          {/* Nez */}
          <path d="M 300 296 q 14 16 -2 26" fill="none" stroke={peauOmbre} strokeWidth={8} strokeLinecap="round" />
          {a.barbe ? <Barbe couleur={a.barbe} /> : null}
          {a.grosseBarbe ? <GrosseBarbe couleur={a.grosseBarbe} /> : null}
          <Mouth expression={expression} open={open} />
          {mv?.clin ? <ClinOeil peau={peau} /> : null}

          {protection ? <LunettesProtection couleur={protection.couleur} elastique={protection.elastique} /> : null}
          {casque ? <CasqueVelo couleur={casque.couleur} ombre={casque.couleurOmbre} /> : null}
          {casquette && casquette.envers ? <CasquetteEnvers couleur={casquette.couleur} ombre={casquette.couleurOmbre} cheveux={a.cheveux.couleur} /> : null}
          {casquette && !casquette.envers ? <Casquette couleur={casquette.couleur} ombre={casquette.couleurOmbre} initiale={casquette.initiale} /> : null}
          {a.tete?.type === 'bonnet' ? <Bonnet couleur={a.tete.couleur} /> : null}
          {a.tete?.type === 'casque_audio' ? <CasqueAudio couleur={a.tete.couleur} coussins={a.tete.coussins} /> : null}
          {a.tete?.type === 'aviateur' ? <AviateurReleve monture={a.tete.monture} verre={a.tete.verre} /> : null}

          {/* Goutte de sueur quand il/elle est choqué(e) */}
          {expression === 'choque' ? (
            <path d={`M 460 ${170 + hautTete} q 22 34 0 46 q -22 -12 0 -46 z`} fill="#8ECAE6" stroke={OUT} strokeWidth={6} />
          ) : null}
          {expression === 'perplexe' ? (
            <text x={470} y={130 + hautTete} fontSize={90} fontFamily="Luckiest Guy" fill="#FFD60A" stroke={OUT} strokeWidth={6} paintOrder="stroke" transform={miroir ? 'translate(990 0) scale(-1 1)' : undefined}>
              ?
            </text>
          ) : null}
        </g>

        {/* Bras droit (devant la tête si levé) */}
        {mv && lDevantTete ? brasArticuleL : null}
        {mv && brasR && angR ? (
          <BrasArticule epaule={epR} coude={brasR[0]} main={brasR[1]} cote={1} a={angR} manche={t.haut} peau={peau} revers={t.retroussees ? t.hautOmbre : undefined} poignet={t.sweat ? t.hautOmbre : undefined} montre={a.montre ?? undefined} rayures={t.mariniere} gant={a.gants ?? undefined} tatouage={a.tatouagesBras ?? undefined} />
        ) : null}
        {mv && brasL && mv.objets?.l ? <ObjetMainAnime nom={mv.objets.l} main={brasL[1]} peau={a.gants ?? peau} miroir={miroir} texte={mv.texteObjet?.l} frame={frame} /> : null}
        {mv && brasR && mv.objets?.r ? <ObjetMainAnime nom={mv.objets.r} main={brasR[1]} peau={a.gants ?? peau} miroir={miroir} texte={mv.texteObjet?.r} frame={frame} /> : null}
        {mv ? null : (
        <Arm
          shoulder={SHOULDER_R}
          elbow={rightG[0]}
          hand={rightG[1]}
          gant={gant}
          manche={t.haut}
          peau={peau}
          bande={t.bandes}
          doigt={posture === 'pointe_bas'}
          mancheCourte={mancheCourte}
          pouce={posture === 'pouce'}
          poing={posture === 'poing'}
          revers={t.retroussees ? t.hautOmbre : undefined}
        />
        )}
        {posture === 'tire_cable' ? (
          // câble électrique sous gaine grise : sort du mur (à gauche), passe dans les deux mains, retombe en boucle au sol
          <g fill="none" strokeLinecap="round">
            {(() => {
              const d = `M -260 300 Q ${left[1][0] - 120} ${left[1][1] - 40} ${left[1][0]} ${left[1][1]} Q ${(left[1][0] + rightG[1][0]) / 2} ${left[1][1] + 30} ${rightG[1][0]} ${rightG[1][1]} Q ${rightG[1][0] + 120} 640 300 860 Q 420 900 520 850`;
              return (
                <>
                  <path d={d} stroke={OUT} strokeWidth={24} />
                  <path d={d} stroke="#9AA5B1" strokeWidth={13} />
                  <path d={d} stroke="#F1F3F5" strokeWidth={3} strokeDasharray="18 30" />
                </>
              );
            })()}
            {[left[1], rightG[1]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            ))}
          </g>
        ) : null}
        {posture === 'deballe' ? (
          // microfibre pliée (bleue) tenue à deux mains
          <g transform={`translate(0 ${Math.sin(frame / 9) * 10})`}>
            <rect x={232} y={520} width={136} height={70} rx={10} fill="#4EA8DE" stroke={OUT} strokeWidth={7} />
            <path d="M 232 546 H 368 M 232 566 H 368" stroke="#3A86C8" strokeWidth={5} />
            {[left[1], rightG[1]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y - Math.sin(frame / 9) * 10} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            ))}
          </g>
        ) : null}
        {posture === 'extracteur' ? (
          // extracteur : tuyau souple vers le sol, canne, suceur large posé sur l'assise ; humidité sous le suceur
          (() => {
            const va = Math.sin(frame / 8) * 34;
            const bout: Pt = [660 + va, 700];
            const d = `M ${rightG[1][0]} ${rightG[1][1]} L ${bout[0]} ${bout[1]}`;
            return (
              <g>
                <path d={`M ${rightG[1][0]} ${rightG[1][1]} Q ${rightG[1][0] - 160} ${rightG[1][1] + 60} 160 870`} fill="none" stroke={OUT} strokeWidth={26} strokeLinecap="round" />
                <path d={`M ${rightG[1][0]} ${rightG[1][1]} Q ${rightG[1][0] - 160} ${rightG[1][1] + 60} 160 870`} fill="none" stroke="#5C677D" strokeWidth={14} strokeLinecap="round" strokeDasharray="14 6" />
                <path d={d} stroke={OUT} strokeWidth={20} strokeLinecap="round" />
                <path d={d} stroke="#CED4DA" strokeWidth={10} strokeLinecap="round" />
                <rect x={bout[0] - 46} y={bout[1] - 6} width={92} height={24} rx={8} fill="#495057" stroke={OUT} strokeWidth={6} />
                {[0, 1, 2].map((k) => (
                  <circle key={k} cx={bout[0] - 30 + k * 30} cy={bout[1] + 34 + ((frame + k * 5) % 15)} r={5} fill="#8ECAE6" opacity={1 - ((frame + k * 5) % 15) / 15} />
                ))}
                {[left[1], rightG[1]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
                ))}
              </g>
            );
          })()
        ) : null}
        {posture === 'serre_main' ? (
          // main de la silhouette (même couleur que la silhouette du responsable) qui serre celle de Théo
          <g>
            <path d={`M 760 ${rightG[1][1] + 30} Q 700 ${rightG[1][1] + 20} ${rightG[1][0] + 30} ${rightG[1][1] + 6}`} fill="none" stroke={OUT} strokeWidth={44} strokeLinecap="round" />
            <path d={`M 760 ${rightG[1][1] + 30} Q 700 ${rightG[1][1] + 20} ${rightG[1][0] + 30} ${rightG[1][1] + 6}`} fill="none" stroke="#3D4A5C" strokeWidth={30} strokeLinecap="round" />
            <circle cx={rightG[1][0]} cy={rightG[1][1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            <ellipse cx={rightG[1][0] + 22} cy={rightG[1][1] + 4} rx={26} ry={22} fill="#3D4A5C" stroke={OUT} strokeWidth={7} />
          </g>
        ) : null}
        {posture === 'pulverise' ? (
          // pulvérisateur « SANS EAU » (gâchette, buse) + bruine régulière ; microfibre pendante dans la main gauche
          <g>
            <g transform={`rotate(-18 ${rightG[1][0]} ${rightG[1][1]})`}>
              <rect x={rightG[1][0] - 26} y={rightG[1][1] - 20} width={52} height={92} rx={12} fill="#E9F5FB" stroke={OUT} strokeWidth={6} />
              <rect x={rightG[1][0] - 24} y={rightG[1][1] + 16} width={48} height={30} fill="#06D6A0" />
              <text x={rightG[1][0]} y={rightG[1][1] + 30} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={12} fill={OUT}>SANS</text>
              <text x={rightG[1][0]} y={rightG[1][1] + 43} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={12} fill={OUT}>EAU</text>
              <path d={`M ${rightG[1][0] - 16} ${rightG[1][1] - 20} v -26 h 54 l 6 12 h -24 v 14 Z`} fill="#343A40" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
            </g>
            {(() => {
              const p = (frame % 24) / 24;
              return frame % 24 < 14 ? (
                <g opacity={1 - p * 1.4} fill="#BDE0FE">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <circle key={k} cx={rightG[1][0] + 60 + p * 120 + k * 6} cy={rightG[1][1] - 66 + (k - 2) * (10 + p * 26)} r={6 + p * 4} />
                  ))}
                </g>
              ) : null;
            })()}
            <circle cx={rightG[1][0]} cy={rightG[1][1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            <path d={`M ${left[1][0] - 26} ${left[1][1] + 6} h 52 l 6 86 q -32 10 -64 0 Z`} fill="#4EA8DE" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={left[1][0]} cy={left[1][1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
        {a.telephone && !photo && accessoire !== 'telephone' && !velo ? (
          // smartphone tenu en main gauche (dos visible, sans logo)
          <g transform={`rotate(-10 ${left[1][0]} ${left[1][1]})`}>
            <rect x={left[1][0] - 26} y={left[1][1] - 74} width={52} height={92} rx={10} fill={a.telephone} stroke={OUT} strokeWidth={7} />
            <circle cx={left[1][0] - 10} cy={left[1][1] - 58} r={7} fill="#343A40" stroke={OUT} strokeWidth={3} />
            <circle cx={left[1][0]} cy={left[1][1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
        {photo && a.telephone ? (
          // téléphone tenu à l'horizontale, écran vers elle ; flash régulier
          <g>
            <g transform={`rotate(-8 ${rightG[1][0]} ${rightG[1][1]})`}>
              <rect x={rightG[1][0] - 50} y={rightG[1][1] - 34} width={100} height={60} rx={10} fill={a.telephone} stroke={OUT} strokeWidth={7} />
              <circle cx={rightG[1][0] + 32} cy={rightG[1][1] - 18} r={8} fill="#343A40" stroke={OUT} strokeWidth={3} />
              <circle cx={rightG[1][0] - 14} cy={rightG[1][1] + 14} r={28} fill={peau} stroke={OUT} strokeWidth={SW} />
            </g>
            {frame % 45 < 6 ? (
              <path
                d={`M ${rightG[1][0] + 38} ${rightG[1][1] - 70} l 10 30 l 30 6 l -26 14 l 8 32 l -22 -22 l -26 18 l 10 -30 l -26 -18 l 32 0 z`}
                fill="white"
                stroke="#FFD60A"
                strokeWidth={4}
                opacity={1 - (frame % 45) / 6}
              />
            ) : null}
          </g>
        ) : null}
        {posture === 'scanne' && (frame % CYCLE_SCAN) / CYCLE_SCAN < 0.7 ? (
          <g>
            <ArticleScan main={[rightG[1][0], rightG[1][1] + 40]} type={Math.floor(frame / CYCLE_SCAN) % 3} />
            <circle cx={rightG[1][0]} cy={rightG[1][1]} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
        {posture === 'regarde_telephone' ? <TelephoneRegarde main={rightG[1]} peau={peau} frame={frame} /> : null}
        {objetMain === 'tote_jeans' ? <ToteJeans main={rightG[1]} /> : null}
        {objetMain === 'devis' ? <DevisMain main={rightG[1]} peau={peau} /> : null}
        {mv?.cape ? <CapeCoupe couleur={mv.cape} /> : null}
        {accessoire === 'telephone' ? (
          <g transform="rotate(-12 420 300)">
            <rect x={388} y={250} width={66} height={116} rx={12} fill="#222" stroke={OUT} strokeWidth={SW} />
            <rect x={398} y={262} width={46} height={86} rx={6} fill="#8ECAE6" />
            <path d="M 414 290 l 20 15 l -20 15 z" fill="#E63946" />
            <circle cx={421} cy={330} r={32} fill={peau} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
        </g>
      </g>
      </g>
    </svg>
  );
};
