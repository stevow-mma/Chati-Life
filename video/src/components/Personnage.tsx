import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import type {Accessoire, Expression} from '../types';

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
  cheveux: {style: 'meches' | 'chignon_boucle'; couleur: string};
  tenue: {haut: string; hautOmbre: string; bas: string; chaussures: string; bandeChaussures: string};
  /** Accessoire de tête : casquette (avec initiale) ou grosses lunettes rondes. */
  tete:
    | {type: 'casquette'; couleur: string; couleurOmbre: string; initiale?: string}
    | {type: 'lunettes_rondes'; couleur: string}
    | null;
  /** Boucles d'oreilles (créoles). */
  boucles?: string | null;
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

const Arm: React.FC<{shoulder: Pt; elbow: Pt; hand: Pt; gant: boolean; manche: string; peau: string}> = ({
  shoulder,
  elbow,
  hand,
  gant,
  manche,
  peau,
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
      stroke={manche}
      strokeWidth={46}
      strokeLinecap="round"
    />
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

export const Personnage: React.FC<{
  apparence: Apparence;
  expression: Expression;
  talking: boolean;
  accessoire?: Accessoire;
  /** false : pas de saut d'entrée (première image d'un épisode). */
  entree?: boolean;
}> = ({apparence: a, expression, talking, accessoire = null, entree = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {peau, ombre: peauOmbre, joues} = a.teint;
  const t = a.tenue;
  const femme = a.genre === 'femme';

  // Entrée : petit saut depuis le bas à chaque plan
  const enter = entree ? spring({frame, fps, config: {damping: 12, stiffness: 180}}) : 1;
  const enterY = interpolate(enter, [0, 1], [120, 0]);

  // Respiration / rebond
  const bob = Math.sin(frame / 7) * (expression === 'choque' ? 3 : 8);
  const squash = 1 + Math.sin(frame / 7) * 0.012;
  const tremble = expression === 'choque' ? Math.sin(frame * 3.1) * 3 : 0;
  const tilt = expression === 'perplexe' ? -7 : expression === 'reveur' ? Math.sin(frame / 15) * 4 : 0;

  // Clignement toutes les ~2,7 s
  const cyc = frame % 80;
  const blink = cyc > 74 ? Math.abs(cyc - 77) / 3 : 1;

  // Bouche qui parle
  const open = talking ? Math.abs(Math.sin(frame * 0.9)) : 0;

  const pose = POSES[expression];
  const gant = accessoire === 'gants';
  // Pour le téléphone, la main droite tient le téléphone près du visage
  const right: [Pt, Pt] = accessoire === 'telephone' ? [[480, 520], [420, 330]] : pose.r;
  const left: [Pt, Pt] = gant ? [[140, 520], [230, 470]] : pose.l;
  const rightG: [Pt, Pt] = gant ? [[460, 520], [370, 470]] : right;
  const casquette = a.tete?.type === 'casquette' ? a.tete : null;
  const lunettes = a.tete?.type === 'lunettes_rondes' ? a.tete : null;
  // repère du "?" et de la goutte : plus haut avec un chignon
  const hautTete = a.cheveux.style === 'chignon_boucle' ? -10 : 0;

  return (
    <svg viewBox="0 0 600 900" style={{width: '100%', height: '100%', overflow: 'visible'}}>
      {/* ombre au sol */}
      <ellipse cx={300} cy={872} rx={200 - bob * 2} ry={22} fill="rgba(0,0,0,0.25)" />

      <g transform={`translate(${tremble} ${enterY + bob}) scale(1 ${squash})`} style={{transformOrigin: '300px 870px'}}>
        {/* Jambes */}
        <rect x={222} y={640} width={66} height={200} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
        <rect x={312} y={640} width={66} height={200} rx={26} fill={t.bas} stroke={OUT} strokeWidth={SW} />
        {/* Baskets */}
        <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill={t.chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={196} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />
        <rect x={304} y={828} width={100} height={14} rx={6} fill={t.bandeChaussures} stroke={OUT} strokeWidth={6} />

        {/* Torse (sweat) */}
        <path
          d={
            femme
              ? 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 404 680 Q 300 700 196 680 Z'
              : 'M 196 470 Q 196 418 250 412 L 350 412 Q 404 418 404 470 L 412 680 Q 300 700 188 680 Z'
          }
          fill={t.haut}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        <path d="M 236 600 Q 300 620 364 600 L 360 660 Q 300 672 240 660 Z" fill={t.hautOmbre} stroke={OUT} strokeWidth={6} />
        <path d="M 270 414 L 284 490 M 330 414 L 316 490" stroke="white" strokeWidth={7} strokeLinecap="round" />

        {accessoire === 'cravate' ? (
          <g>
            <path d="M 262 412 L 300 440 L 338 412 L 338 470 L 262 470 Z" fill="white" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 300 436 L 316 456 L 306 470 L 318 590 L 300 612 L 282 590 L 294 470 L 284 456 Z" fill="#1D3557" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ) : null}

        {/* Bras gauche */}
        <Arm shoulder={SHOULDER_L} elbow={left[0]} hand={left[1]} gant={gant} manche={t.haut} peau={peau} />

        {/* Tête */}
        <g transform={`rotate(${tilt} 300 400)`}>
          <CheveuxArriere a={a} frame={frame} />
          <rect x={268} y={370} width={64} height={56} fill={peauOmbre} stroke={OUT} strokeWidth={SW} />
          {/* Oreilles */}
          <circle cx={152} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
          <circle cx={448} cy={288} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
          {a.boucles ? (
            <>
              <circle cx={150} cy={336} r={18} fill="none" stroke={OUT} strokeWidth={12} />
              <circle cx={150} cy={336} r={18} fill="none" stroke={a.boucles} strokeWidth={6} />
              <circle cx={450} cy={336} r={18} fill="none" stroke={OUT} strokeWidth={12} />
              <circle cx={450} cy={336} r={18} fill="none" stroke={a.boucles} strokeWidth={6} />
            </>
          ) : null}
          <ellipse cx={300} cy={282} rx={150} ry={135} fill={peau} stroke={OUT} strokeWidth={SW} />
          <CheveuxAvant a={a} />
          {/* Joues */}
          <ellipse cx={200} cy={325} rx={26} ry={15} fill={joues} opacity={expression === 'reveur' ? 0.9 : 0.5} />
          <ellipse cx={400} cy={325} rx={26} ry={15} fill={joues} opacity={expression === 'reveur' ? 0.9 : 0.5} />

          <Eyes expression={expression} blink={blink} frame={frame} cils={femme} />
          {lunettes ? <Lunettes couleur={lunettes.couleur} /> : null}
          <g transform={lunettes ? 'translate(0 -14)' : undefined}>
            <Brows expression={expression} couleur={a.cheveux.couleur} fines={femme} />
          </g>
          {/* Nez */}
          <path d="M 300 296 q 14 16 -2 26" fill="none" stroke={peauOmbre} strokeWidth={8} strokeLinecap="round" />
          <Mouth expression={expression} open={open} />

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
        <Arm shoulder={SHOULDER_R} elbow={rightG[0]} hand={rightG[1]} gant={gant} manche={t.haut} peau={peau} />
        {accessoire === 'telephone' ? (
          <g transform="rotate(-12 420 300)">
            <rect x={388} y={250} width={66} height={116} rx={12} fill="#222" stroke={OUT} strokeWidth={SW} />
            <rect x={398} y={262} width={46} height={86} rx={6} fill="#8ECAE6" />
            <path d="M 414 290 l 20 15 l -20 15 z" fill="#E63946" />
            <circle cx={421} cy={330} r={32} fill={peau} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
