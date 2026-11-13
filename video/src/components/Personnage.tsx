import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import type {Accessoire, Expression, ObjetMain, Pose as Posture} from '../types';

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
  cheveux: {style: 'meches' | 'chignon_boucle' | 'court' | 'carre_frange' | 'court_dessus'; couleur: string};
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
  };
  /** Accessoire de tête : casquette (avec initiale) ou grosses lunettes rondes. */
  tete:
    | {type: 'casquette'; couleur: string; couleurOmbre: string; initiale?: string}
    | {type: 'lunettes_rondes'; couleur: string}
    | {type: 'casque_velo'; couleur: string; couleurOmbre: string}
    /** Lunettes de protection relevées sur le front (couleur de la monture et de l'élastique). */
    | {type: 'lunettes_protection'; couleur: string; elastique: string}
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
};

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

const Arm: React.FC<{shoulder: Pt; elbow: Pt; hand: Pt; gant: boolean; manche: string; peau: string; bande?: string; doigt?: boolean; mancheCourte?: boolean}> = ({
  shoulder,
  elbow,
  hand,
  gant,
  manche,
  peau,
  bande,
  doigt = false,
  mancheCourte = false,
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
      stroke={mancheCourte ? peau : manche}
      strokeWidth={46}
      strokeLinecap="round"
    />
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
  </g>
);

/** Cheveux derrière la tête (masse bouclée + chignon haut). */
const CheveuxArriere: React.FC<{a: Apparence; frame: number}> = ({a, frame}) => {
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
}> = ({apparence: a, expression, talking, accessoire = null, entree = true, pose: posture = 'debout', objetMain = null, muet = false}) => {
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
  // repère du "?" et de la goutte : plus haut avec un chignon
  const hautTete = a.cheveux.style === 'chignon_boucle' ? -10 : a.tete?.type === 'casque_velo' ? -20 : 0;
  const carre = a.cheveux.style === 'carre_frange';
  const photo = posture === 'photo';

  return (
    <svg viewBox="0 0 600 900" style={{width: '100%', height: '100%', overflow: 'visible'}}>
      {/* ombre au sol */}
      <ellipse cx={300} cy={872} rx={200 - bob * 2} ry={22} fill="rgba(0,0,0,0.25)" />

      <g transform={`translate(${tremble} ${enterY + bob}) scale(1 ${squash})`} style={{transformOrigin: '300px 870px'}}>
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
        ) : assis ? null : (
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
            {/* Baskets */}
            <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
            <rect x={196} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
            <rect x={304} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
          </>
        )}

        <g transform={`translate(0 ${decalHaut - pedalBob})`}>
        {a.sac ? <SacDos couleur={a.sac.couleur} ombre={a.sac.ombre} /> : null}

        {/* Torse (sweat) */}
        <path
          d={
            t.oversize
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
        {t.bandes ? (
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

        {a.ceintureOutils && !assis && !velo ? <CeintureOutils couleur={a.ceintureOutils.couleur} ombre={a.ceintureOutils.ombre} /> : null}

        {/* Bras gauche */}
        {velo ? <Guidon couleur={a.velo ?? '#2D6A4F'} /> : null}
        <Arm shoulder={SHOULDER_L} elbow={left[0]} hand={left[1]} gant={gant} manche={t.haut} peau={peau} bande={t.bandes} mancheCourte={tshirt} />

        {/* Tête */}
        <g transform={`rotate(${tilt} 300 400)`}>
          <CheveuxArriere a={a} frame={frame} />
          <rect x={268} y={370} width={64} height={56} fill={peauOmbre} stroke={OUT} strokeWidth={SW} />
          {/* Oreilles (cachées par un carré) */}
          {carre ? null : (
            <>
              <circle cx={152} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
              <circle cx={448} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
            </>
          )}
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
          <g transform={lunettes ? 'translate(0 -14)' : undefined}>
            <Brows expression={expression} couleur={a.cheveux.couleur} fines={femme} />
          </g>
          {/* Nez */}
          <path d="M 300 296 q 14 16 -2 26" fill="none" stroke={peauOmbre} strokeWidth={8} strokeLinecap="round" />
          {a.barbe ? <Barbe couleur={a.barbe} /> : null}
          <Mouth expression={expression} open={open} />

          {protection ? <LunettesProtection couleur={protection.couleur} elastique={protection.elastique} /> : null}
          {casque ? <CasqueVelo couleur={casque.couleur} ombre={casque.couleurOmbre} /> : null}
          {casquette ? <Casquette couleur={casquette.couleur} ombre={casquette.couleurOmbre} initiale={casquette.initiale} /> : null}

          {/* Goutte de sueur quand il/elle est choqué(e) */}
          {expression === 'choque' ? (
            <path d={`M 460 ${170 + hautTete} q 22 34 0 46 q -22 -12 0 -46 z`} fill="#8ECAE6" stroke={OUT} strokeWidth={6} />
          ) : null}
          {expression === 'perplexe' ? (
            <text x={470} y={130 + hautTete} fontSize={90} fontFamily="Luckiest Guy" fill="#FFD60A" stroke={OUT} strokeWidth={6} paintOrder="stroke">
              ?
            </text>
          ) : null}
        </g>

        {/* Bras droit (devant la tête si levé) */}
        <Arm
          shoulder={SHOULDER_R}
          elbow={rightG[0]}
          hand={rightG[1]}
          gant={gant}
          manche={t.haut}
          peau={peau}
          bande={t.bandes}
          doigt={posture === 'pointe_bas'}
          mancheCourte={tshirt}
        />
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
        {objetMain === 'tote_jeans' ? <ToteJeans main={rightG[1]} /> : null}
        {objetMain === 'devis' ? <DevisMain main={rightG[1]} peau={peau} /> : null}
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
    </svg>
  );
};
