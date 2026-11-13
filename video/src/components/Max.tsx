import {useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import type {Accessoire, Expression} from '../types';

/**
 * Max — 20 ans, casquette rouge, très naïf. Personnage plat 2D original en SVG.
 * viewBox 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
const SKIN = '#F5C29A';
const SKIN_SHADE = '#E7A97C';
const CAP = '#E63946';
const CAP_DARK = '#B5202D';
const HAIR = '#6B3E26';
const HOODIE = '#2EC4B6';
const HOODIE_DARK = '#22A094';
const JEANS = '#3A5A8C';

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

const Eyes: React.FC<{expression: Expression; blink: number; frame: number}> = ({
  expression,
  blink,
  frame,
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

const Brows: React.FC<{expression: Expression}> = ({expression}) => {
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
    <g stroke={HAIR} strokeWidth={14} strokeLinecap="round" fill="none">
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

const Arm: React.FC<{shoulder: Pt; elbow: Pt; hand: Pt; gant: boolean}> = ({shoulder, elbow, hand, gant}) => (
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
      stroke={HOODIE}
      strokeWidth={46}
      strokeLinecap="round"
    />
    {gant ? (
      <g>
        <circle cx={hand[0]} cy={hand[1]} r={44} fill="#D62828" stroke={OUT} strokeWidth={SW} />
        <ellipse cx={hand[0] - 12} cy={hand[1] - 14} rx={14} ry={9} fill="#F07167" />
      </g>
    ) : (
      <circle cx={hand[0]} cy={hand[1]} r={30} fill={SKIN} stroke={OUT} strokeWidth={SW} />
    )}
  </g>
);

export const Max: React.FC<{
  expression: Expression;
  talking: boolean;
  accessoire?: Accessoire;
}> = ({expression, talking, accessoire = null}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Entrée : petit saut depuis le bas à chaque plan
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 180}});
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

  return (
    <svg viewBox="0 0 600 900" style={{width: '100%', height: '100%', overflow: 'visible'}}>
      {/* ombre au sol */}
      <ellipse cx={300} cy={872} rx={200 - bob * 2} ry={22} fill="rgba(0,0,0,0.25)" />

      <g transform={`translate(${tremble} ${enterY + bob}) scale(1 ${squash})`} style={{transformOrigin: '300px 870px'}}>
        {/* Jambes */}
        <rect x={222} y={640} width={66} height={200} rx={26} fill={JEANS} stroke={OUT} strokeWidth={SW} />
        <rect x={312} y={640} width={66} height={200} rx={26} fill={JEANS} stroke={OUT} strokeWidth={SW} />
        {/* Baskets */}
        <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill="white" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill="white" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={196} y={828} width={100} height={14} rx={6} fill={CAP} stroke={OUT} strokeWidth={6} />
        <rect x={304} y={828} width={100} height={14} rx={6} fill={CAP} stroke={OUT} strokeWidth={6} />

        {/* Torse (sweat) */}
        <path
          d="M 196 470 Q 196 418 250 412 L 350 412 Q 404 418 404 470 L 412 680 Q 300 700 188 680 Z"
          fill={HOODIE}
          stroke={OUT}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        <path d="M 236 600 Q 300 620 364 600 L 360 660 Q 300 672 240 660 Z" fill={HOODIE_DARK} stroke={OUT} strokeWidth={6} />
        <path d="M 270 414 L 284 490 M 330 414 L 316 490" stroke="white" strokeWidth={7} strokeLinecap="round" />

        {accessoire === 'cravate' ? (
          <g>
            <path d="M 262 412 L 300 440 L 338 412 L 338 470 L 262 470 Z" fill="white" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 300 436 L 316 456 L 306 470 L 318 590 L 300 612 L 282 590 L 294 470 L 284 456 Z" fill="#1D3557" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ) : null}

        {/* Bras gauche */}
        <Arm shoulder={SHOULDER_L} elbow={left[0]} hand={left[1]} gant={gant} />

        {/* Tête */}
        <g transform={`rotate(${tilt} 300 400)`}>
          <rect x={268} y={370} width={64} height={56} fill={SKIN_SHADE} stroke={OUT} strokeWidth={SW} />
          {/* Oreilles */}
          <circle cx={152} cy={288} r={30} fill={SKIN} stroke={OUT} strokeWidth={SW} />
          <circle cx={448} cy={288} r={30} fill={SKIN} stroke={OUT} strokeWidth={SW} />
          <ellipse cx={300} cy={282} rx={150} ry={135} fill={SKIN} stroke={OUT} strokeWidth={SW} />
          {/* Mèches sous la casquette */}
          <path d="M 160 214 q 10 40 34 30 q -2 30 26 24 q -6 -40 -20 -60 z" fill={HAIR} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 440 214 q -10 40 -34 30 q 2 30 -26 24 q 6 -40 20 -60 z" fill={HAIR} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          {/* Joues */}
          <ellipse cx={200} cy={325} rx={26} ry={15} fill="#F28482" opacity={expression === 'reveur' ? 0.9 : 0.5} />
          <ellipse cx={400} cy={325} rx={26} ry={15} fill="#F28482" opacity={expression === 'reveur' ? 0.9 : 0.5} />

          <Eyes expression={expression} blink={blink} frame={frame} />
          <Brows expression={expression} />
          {/* Nez */}
          <path d="M 300 296 q 14 16 -2 26" fill="none" stroke={SKIN_SHADE} strokeWidth={8} strokeLinecap="round" />
          <Mouth expression={expression} open={open} />

          {/* Casquette rouge */}
          <path d="M 150 222 Q 150 90 300 88 Q 450 90 450 222 Z" fill={CAP} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M 300 90 Q 286 150 290 222 M 300 90 Q 370 130 392 222" fill="none" stroke={CAP_DARK} strokeWidth={6} />
          <path d="M 128 226 Q 300 186 472 226 Q 480 250 456 256 Q 300 222 144 256 Q 120 250 128 226 Z" fill={CAP_DARK} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <circle cx={300} cy={90} r={12} fill={CAP_DARK} stroke={OUT} strokeWidth={6} />
          <circle cx={232} cy={160} r={30} fill="white" stroke={OUT} strokeWidth={6} />
          <text x={232} y={174} textAnchor="middle" fontSize={40} fontFamily="Luckiest Guy" fill={CAP}>
            M
          </text>

          {/* Goutte de sueur quand il est choqué */}
          {expression === 'choque' ? (
            <path d="M 460 170 q 22 34 0 46 q -22 -12 0 -46 z" fill="#8ECAE6" stroke={OUT} strokeWidth={6} />
          ) : null}
          {expression === 'perplexe' ? (
            <text x={470} y={130} fontSize={90} fontFamily="Luckiest Guy" fill="#FFD60A" stroke={OUT} strokeWidth={6} paintOrder="stroke">
              ?
            </text>
          ) : null}
        </g>

        {/* Bras droit (devant la tête si levé) */}
        <Arm shoulder={SHOULDER_R} elbow={rightG[0]} hand={rightG[1]} gant={gant} />
        {accessoire === 'telephone' ? (
          <g transform="rotate(-12 420 300)">
            <rect x={388} y={250} width={66} height={116} rx={12} fill="#222" stroke={OUT} strokeWidth={SW} />
            <rect x={398} y={262} width={46} height={86} rx={6} fill="#8ECAE6" />
            <path d="M 414 290 l 20 15 l -20 15 z" fill="#E63946" />
            <circle cx={421} cy={330} r={32} fill={SKIN} stroke={OUT} strokeWidth={SW} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
