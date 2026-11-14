import {ObjetSceneEp15} from './Ep15';
import {interpolate} from 'remotion';
import {FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';

/**
 * ep13 (Inès, photographe de mariage) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Coiffure `tresses`, veste en jean, appareil photo en bandoulière, robe longue, objets tenus (appareil, bouquet,
 * album, sac photo, objectif), objet de scène `miniatures`, décor `salle_mariage`. Aucune marque, aucun logo.
 * Repère du personnage : viewBox 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type Pt = [number, number];

/** Longues tresses attachées : faisceau de tresses qui tombe sur l'épaule (à droite de l'écran). */
export const TressesArriere: React.FC<{c: string; frame: number}> = ({c, frame}) => {
  const sway = Math.sin(frame / 14) * 4;
  const maillons = Array.from({length: 11});
  return (
    <g>
      <path d="M 300 96 Q 132 104 130 262 Q 132 330 160 360 L 440 360 Q 468 330 470 262 Q 468 104 300 96 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {[-26, 0, 26].map((dx, j) => (
        <g key={j}>
          {maillons.map((_, k) => {
            const yy = 250 + k * 36;
            const xx = 430 + dx * 0.6 + (k / 10) * (20 + sway) + dx * 0.15;
            return <ellipse key={k} cx={xx + dx * 0.4} cy={yy} rx={17} ry={22} fill={c} stroke={OUT} strokeWidth={5} transform={`rotate(${k % 2 ? 18 : -18} ${xx + dx * 0.4} ${yy})`} />;
          })}
        </g>
      ))}
      {/* élastique doré */}
      <rect x={410} y={236} width={58} height={20} rx={8} fill="#E0B341" stroke={OUT} strokeWidth={5} />
    </g>
  );
};

export const TressesAvant: React.FC<{c: string}> = ({c}) => (
  <g>
    <path d="M 154 280 Q 140 126 300 106 Q 460 126 446 280 Q 430 214 384 178 Q 334 150 300 152 Q 266 150 216 178 Q 170 214 154 280 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* rangs de tresses vers l'arrière */}
    {[-90, -45, 0, 45, 90].map((dx) => (
      <path key={dx} d={`M ${300 + dx * 0.9} 156 Q ${300 + dx * 1.1} 130 ${300 + dx * 1.2} 112`} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={6} strokeLinecap="round" />
    ))}
  </g>
);

const TORSE_F = 'M 202 470 Q 202 418 252 412 L 348 412 Q 398 418 398 470 L 404 680 Q 300 700 196 680 Z';

/** Veste en jean ouverte sur un t-shirt (couleur `dessous`) : surpiqûres, poches poitrine, col. */
export const VesteJean: React.FC<{couleur: string; ombre: string; dessous: string}> = ({couleur, ombre, dessous}) => (
  <g strokeLinejoin="round">
    <path d={TORSE_F} fill={couleur} stroke={OUT} strokeWidth={SW} />
    <path d="M 262 412 Q 300 440 338 412 L 326 694 Q 300 698 274 694 Z" fill={dessous} stroke={OUT} strokeWidth={6} />
    <path d="M 262 412 Q 300 446 338 412" fill="none" stroke={OUT} strokeWidth={5} />
    {[
      [214, 500],
      [318, 500],
    ].map(([x, y]) => (
      <g key={x}>
        <rect x={x} y={y} width={68} height={56} rx={6} fill={ombre} stroke={OUT} strokeWidth={5} />
        <path d={`M ${x} ${y + 18} H ${x + 68}`} stroke="#F2C14E" strokeWidth={3} strokeDasharray="6 5" />
        <circle cx={x + 34} cy={y + 30} r={5} fill="#C9A227" />
      </g>
    ))}
    <path d="M 274 420 L 274 692 M 326 420 L 326 692" stroke="#F2C14E" strokeWidth={3} strokeDasharray="7 6" />
    <path d="M 198 640 Q 300 660 402 640" fill="none" stroke="#F2C14E" strokeWidth={3} strokeDasharray="7 6" />
    {/* col */}
    <path d="M 240 410 L 262 404 L 286 470 Z M 360 410 L 338 404 L 314 470 Z" fill={ombre} stroke={OUT} strokeWidth={6} />
  </g>
);

/** Sangle d'appareil photo en bandoulière ; boîtier noir générique à la hanche (masqué si l'appareil est en main). */
export const Bandouliere: React.FC<{enMain: boolean}> = ({enMain}) => (
  <g>
    <path d="M 236 414 L 384 650" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
    <path d="M 236 414 L 384 650" stroke="#3A3B45" strokeWidth={10} strokeLinecap="round" />
    {enMain ? null : (
      <g>
        <rect x={350} y={630} width={96} height={66} rx={10} fill="#1E1F26" stroke={OUT} strokeWidth={6} />
        <rect x={362} y={620} width={28} height={14} rx={3} fill="#2B2C34" stroke={OUT} strokeWidth={4} />
        <circle cx={398} cy={666} r={22} fill="#3A3B45" stroke={OUT} strokeWidth={5} />
        <circle cx={398} cy={666} r={10} fill="#5E7C99" />
      </g>
    )}
  </g>
);

/** Robe longue (mariée) : jupe évasée jusqu'au sol, taille marquée. */
export const RobeLongue: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g strokeLinejoin="round">
    <path d="M 204 660 L 396 660 L 452 856 Q 300 878 148 856 Z" fill={couleur} stroke={OUT} strokeWidth={SW} />
    <path d="M 260 690 Q 250 780 236 860 M 340 690 Q 350 780 364 860 M 300 690 V 866" fill="none" stroke={ombre} strokeWidth={6} strokeLinecap="round" />
    <rect x={200} y={644} width={200} height={22} rx={10} fill={ombre} stroke={OUT} strokeWidth={6} />
  </g>
);

const flashPeriodique = (frame: number) => frame % 36 < 3;

/** Objets tenus en main ajoutés en ep13. */
export const ObjetMainEp13: React.FC<{nom: string; main: Pt; peau: string; miroir: boolean; texte?: string; frame: number}> = ({nom, main, peau, frame}) => {
  const [x, y] = main;
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'appareil': {
      // boîtier noir générique, sans marque : tenu devant l'œil, objectif vers l'avant ; flash au déclenchement
      const bx = x - 150;
      const by = y - 70;
      return (
        <g>
          <rect x={bx} y={by} width={180} height={110} rx={16} fill="#1E1F26" stroke={OUT} strokeWidth={7} />
          <rect x={bx + 24} y={by - 22} width={56} height={26} rx={6} fill="#2B2C34" stroke={OUT} strokeWidth={5} />
          <circle cx={bx + 90} cy={by + 56} r={44} fill="#3A3B45" stroke={OUT} strokeWidth={6} />
          <circle cx={bx + 90} cy={by + 56} r={26} fill="#5E7C99" stroke={OUT} strokeWidth={4} />
          <circle cx={bx + 80} cy={by + 46} r={8} fill="white" opacity={0.7} />
          <rect x={bx + 140} y={by + 12} width={22} height={14} rx={3} fill="#ADB5BD" />
          {flashPeriodique(frame) ? (
            <g>
              <circle cx={bx + 150} cy={by + 18} r={60} fill="white" opacity={0.85} />
              <path d={`M ${bx + 150} ${by - 60} V ${by - 20} M ${bx + 210} ${by + 18} H ${bx + 250} M ${bx + 196} ${by - 30} l 26 -26`} stroke="#FFD60A" strokeWidth={8} strokeLinecap="round" />
            </g>
          ) : null}
          {mainDessus}
        </g>
      );
    }
    case 'objectif':
      return (
        <g>
          <rect x={x - 34} y={y - 110} width={68} height={96} rx={10} fill="#2B2C34" stroke={OUT} strokeWidth={6} />
          <rect x={x - 34} y={y - 80} width={68} height={14} fill="#495057" />
          <ellipse cx={x} cy={y - 110} rx={34} ry={12} fill="#5E7C99" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    case 'bouquet': {
      const fleurs: [number, number, string][] = [
        [-30, -96, '#FFAFCC'],
        [0, -118, '#FFFFFF'],
        [30, -96, '#FFC8DD'],
        [-14, -70, '#FFFFFF'],
        [18, -72, '#F7B267'],
      ];
      return (
        <g>
          <path d={`M ${x - 10} ${y + 10} L ${x - 20} ${y - 70} M ${x} ${y + 14} V ${y - 80} M ${x + 10} ${y + 10} L ${x + 20} ${y - 70}`} stroke="#2D6A4F" strokeWidth={7} strokeLinecap="round" />
          <ellipse cx={x - 44} cy={y - 76} rx={18} ry={10} fill="#52B788" stroke={OUT} strokeWidth={4} />
          <ellipse cx={x + 44} cy={y - 76} rx={18} ry={10} fill="#52B788" stroke={OUT} strokeWidth={4} />
          {fleurs.map(([dx, dy, col], k) => (
            <g key={k}>
              <circle cx={x + dx} cy={y + dy} r={22} fill={col} stroke={OUT} strokeWidth={5} />
              <circle cx={x + dx} cy={y + dy} r={7} fill="#F2C14E" />
            </g>
          ))}
          <path d={`M ${x - 18} ${y - 10} Q ${x} ${y + 4} ${x + 18} ${y - 10}`} stroke="#F2F2F2" strokeWidth={12} fill="none" />
          {mainDessus}
        </g>
      );
    }
    case 'album': {
      // album photo ivoire à liseré doré ; une page se soulève régulièrement
      const p = (Math.sin(frame / 9) + 1) / 2;
      return (
        <g>
          <rect x={x - 70} y={y - 150} width={140} height={150} rx={10} fill="#FFF8E7" stroke={OUT} strokeWidth={7} />
          <rect x={x - 54} y={y - 134} width={108} height={118} rx={6} fill="none" stroke="#D4A017" strokeWidth={5} />
          <path d={`M ${x} ${y - 96} c -16 -18 -34 2 0 22 c 34 -20 16 -40 0 -22 Z`} fill="#F28482" stroke={OUT} strokeWidth={3} />
          <path d={`M ${x + 70} ${y - 150} L ${x + 70 - 60 * p} ${y - 160 * (0.9 + p * 0.1)} L ${x + 70 - 60 * p} ${y - 10} L ${x + 70} ${y} Z`} fill="white" stroke={OUT} strokeWidth={4} opacity={0.9} />
          {mainDessus}
        </g>
      );
    }
    case 'sac_photo':
      return (
        <g>
          <path d={`M ${x - 24} ${y} Q ${x} ${y - 30} ${x + 24} ${y}`} fill="none" stroke={OUT} strokeWidth={10} />
          <rect x={x - 90} y={y + 4} width={180} height={140} rx={22} fill="#495057" stroke={OUT} strokeWidth={7} />
          <rect x={x - 70} y={y + 60} width={140} height={60} rx={12} fill="#343A40" stroke={OUT} strokeWidth={5} />
          <path d={`M ${x - 90} ${y + 40} H ${x + 90}`} stroke="#ADB5BD" strokeWidth={4} strokeDasharray="8 6" />
          {mainDessus}
        </g>
      );
    default:
      return null;
  }
};

/** Objets de scène ep13. */
export const ObjetSceneEp13: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  const ins = o.instants ?? [];
  switch (o.type) {
    case 'miniatures': {
      // écran générique : grille de miniatures de photos ; à chaque instant, une rangée est sélectionnée et part
      // dans un dossier (tri par lots)
      const w = o.largeur ?? 420;
      const h = w * 0.62;
      const l = x - w / 2;
      const parties = ins.filter((s) => t >= s + 0.6).length;
      const couleurs = ['#FFAFCC', '#A9DEF9', '#E4C1F9', '#FCF6BD', '#D0F4DE', '#FFD6A5'];
      return (
        <g>
          <rect x={l} y={y - h} width={w} height={h} rx={14} fill="#1E1F26" stroke={OUT} strokeWidth={8} />
          <rect x={l + 14} y={y - h + 14} width={w - 28} height={h - 28} rx={6} fill="#F8F9FA" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const actif = ins.findIndex((s) => t >= s && t < s + 0.6);
              const partie = r < parties;
              if (partie) return null;
              const sel = actif === r;
              const dep = sel ? interpolate(t, [ins[r], ins[r] + 0.6], [0, 1], cl) : 0;
              const cw = (w - 60) / 4;
              const ch = (h - 60) / 3;
              const cx = l + 22 + c * (cw + 5);
              const cy = y - h + 22 + r * (ch + 5);
              return (
                <g key={`${r}${c}`} transform={`translate(${dep * (x + w / 2 - cx)} ${dep * (y + 40 - cy)}) scale(${1 - dep * 0.3})`} transform-origin={`${cx} ${cy}`}>
                  <rect x={cx} y={cy} width={cw} height={ch} rx={4} fill={couleurs[(r * 4 + c) % 6]} stroke={sel ? '#1F9D55' : OUT} strokeWidth={sel ? 6 : 3} />
                  <path d={`M ${cx + 6} ${cy + ch - 6} l ${cw * 0.3} ${-ch * 0.45} l ${cw * 0.25} ${ch * 0.3} l ${cw * 0.15} ${-ch * 0.15} l ${cw * 0.2} ${ch * 0.3} Z`} fill="rgba(0,0,0,0.25)" />
                </g>
              );
            }),
          )}
          {/* dossier */}
          <g>
            <path d={`M ${x + w / 2 - 60} ${y + 10} h 40 l 12 14 h 60 v 70 h -112 Z`} fill="#F2C14E" stroke={OUT} strokeWidth={6} />
            <text x={x + w / 2 - 4} y={y + 76} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={30} fill={OUT}>
              {parties > 0 ? `${parties * 120}` : ''}
            </text>
          </g>
          <rect x={l - 30} y={y} width={w + 60} height={24} rx={10} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
        </g>
      );
    }
    default:
      return <ObjetSceneEp15 o={o} frame={frame} fps={fps} />;
  }
};

/** Décor `salle_mariage` : arche fleurie, chaises blanches en rangs, guirlandes lumineuses, parquet clair. */
export const DecorSalleMariage: React.FC<{frame: number}> = ({frame}) => {
  const SOL = 1480;
  const fleurs = Array.from({length: 22});
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill="#FBEFF3" />
      {/* grandes fenêtres cintrées */}
      {[60, 800].map((x) => (
        <g key={x}>
          <path d={`M ${x} 1100 V 520 Q ${x + 110} 380 ${x + 220} 520 V 1100 Z`} fill="#D7ECFA" stroke={OUT} strokeWidth={8} />
          <path d={`M ${x + 110} 430 V 1100 M ${x} 780 H ${x + 220}`} stroke="white" strokeWidth={10} />
        </g>
      ))}
      {/* guirlandes lumineuses */}
      {[0, 1].map((r) => (
        <g key={r}>
          <path d={`M 0 ${200 + r * 120} Q 270 ${300 + r * 120} 540 ${200 + r * 120} Q 810 ${300 + r * 120} 1080 ${200 + r * 120}`} fill="none" stroke="#6C757D" strokeWidth={4} />
          {Array.from({length: 12}).map((_, k) => {
            const xx = 45 + k * 90;
            const u = (xx % 540) / 540;
            const yy = 200 + r * 120 + Math.sin(u * Math.PI) * 75;
            const on = (Math.floor(frame / 8) + k + r) % 3 !== 0;
            return <circle key={k} cx={xx} cy={yy + 12} r={11} fill={on ? '#FFE66D' : '#F5D6A0'} stroke={OUT} strokeWidth={3} />;
          })}
        </g>
      ))}
      {/* parquet */}
      <rect x={0} y={1100} width={1080} height={820} fill="#E9C9A0" />
      {Array.from({length: 10}).map((_, k) => (
        <path key={k} d={`M 0 ${1140 + k * 80} H 1080`} stroke="#D4AF85" strokeWidth={4} />
      ))}
      <path d="M 0 1100 H 1080" stroke={OUT} strokeWidth={8} />
      {/* allée centrale (tapis) */}
      <path d="M 470 1100 L 610 1100 L 760 1920 L 320 1920 Z" fill="#F7F7F7" stroke="#E0C9D1" strokeWidth={6} />
      {/* arche fleurie */}
      <path d="M 330 1110 V 640 Q 540 420 750 640 V 1110" fill="none" stroke="#B08968" strokeWidth={26} />
      {fleurs.map((_, k) => {
        const a = Math.PI * (k / (fleurs.length - 1));
        const xx = 540 - Math.cos(a) * 214;
        const yy = 660 - Math.sin(a) * 200;
        const col = ['#FFAFCC', '#FFFFFF', '#FFC8DD', '#CDB4DB'][k % 4];
        return (
          <g key={k}>
            <ellipse cx={xx + 18} cy={yy + 10} rx={20} ry={10} fill="#74C69D" stroke={OUT} strokeWidth={3} />
            <circle cx={xx} cy={yy} r={24} fill={col} stroke={OUT} strokeWidth={4} />
            <circle cx={xx} cy={yy} r={7} fill="#F2C14E" />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((k) => (
        <g key={k}>
          <circle cx={330} cy={760 + k * 90} r={20} fill={k % 2 ? '#FFFFFF' : '#FFAFCC'} stroke={OUT} strokeWidth={4} />
          <circle cx={750} cy={760 + k * 90} r={20} fill={k % 2 ? '#FFAFCC' : '#FFFFFF'} stroke={OUT} strokeWidth={4} />
        </g>
      ))}
      {/* chaises blanches en rangs, de part et d'autre de l'allée */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) =>
          [-1, 1].map((s) => {
            const sc = 0.7 + r * 0.15;
            const cx = 540 + s * (170 + c * 120 * sc + r * 30);
            const cy = 1210 + r * 120;
            return (
              <g key={`${r}${c}${s}`} transform={`translate(${cx} ${cy}) scale(${sc})`}>
                <rect x={-40} y={-120} width={80} height={70} rx={10} fill="white" stroke={OUT} strokeWidth={6} />
                <rect x={-46} y={-50} width={92} height={18} rx={6} fill="white" stroke={OUT} strokeWidth={6} />
                <path d="M -38 -32 V 40 M 38 -32 V 40" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
                <path d="M -38 -32 V 40 M 38 -32 V 40" stroke="white" strokeWidth={7} strokeLinecap="round" />
                <path d="M 30 -110 q 18 10 10 30" stroke="#FFAFCC" strokeWidth={8} fill="none" strokeLinecap="round" />
              </g>
            );
          }),
        ),
      )}
      <rect x={0} y={SOL + 60} width={1080} height={10} fill="rgba(0,0,0,0.04)" />
    </svg>
  );
};
