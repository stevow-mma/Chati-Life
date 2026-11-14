import {interpolate} from 'remotion';
import {FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';
import {ObjetSceneEp16} from './Ep16';

/**
 * ep15 (Léa, coach sportive à domicile) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Décor `parc`, chronomètre autour du cou, veste zippée, objets tenus (chronometre, bouteille, haltere, elastique,
 * tapis_roule) et objets de scène (tapis_sol, halteres_sol, canape, tablette_livres, compteur, plan_mural).
 * Aucune marque, aucun logo. Repère du personnage : viewBox 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
type Pt = [number, number];

/** Veste de survêtement zippée ouverte sur un débardeur (bande centrale + fermeture éclair). */
export const VesteZip: React.FC<{dessous: string; zip: string}> = ({dessous, zip}) => (
  <g>
    <path d="M 270 418 L 300 520 L 330 418 Z" fill={dessous} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 300 520 V 700" stroke={zip} strokeWidth={8} strokeLinecap="round" />
    <path d="M 300 520 V 700" stroke={OUT} strokeWidth={3} strokeDasharray="6 6" />
    <rect x={292} y={520} width={16} height={22} rx={4} fill="#DEE2E6" stroke={OUT} strokeWidth={4} />
  </g>
);

/** Chronomètre générique au bout d'un cordon autour du cou. */
export const ChronoCou: React.FC<{cordon: string}> = ({cordon}) => (
  <g>
    <path d="M 252 418 Q 300 560 348 418" fill="none" stroke={OUT} strokeWidth={12} strokeLinecap="round" />
    <path d="M 252 418 Q 300 560 348 418" fill="none" stroke={cordon} strokeWidth={6} strokeLinecap="round" />
    <circle cx={300} cy={562} r={30} fill="#E9ECEF" stroke={OUT} strokeWidth={7} />
    <rect x={292} y={522} width={16} height={12} rx={3} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
    <circle cx={300} cy={562} r={19} fill="white" stroke={OUT} strokeWidth={3} />
    <path d="M 300 562 L 300 548 M 300 562 L 310 568" stroke="#E63946" strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** Objets tenus en main ajoutés en ep15. */
export const ObjetMainEp15: React.FC<{nom: string; main: Pt; peau: string; frame: number}> = ({nom, main, peau, frame}) => {
  const [x, y] = main;
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'chronometre': {
      const a = (frame / 30) * Math.PI * 2;
      return (
        <g>
          <circle cx={x} cy={y - 66} r={42} fill="#E9ECEF" stroke={OUT} strokeWidth={7} />
          <rect x={x - 10} y={y - 122} width={20} height={16} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
          <circle cx={x} cy={y - 66} r={30} fill="white" stroke={OUT} strokeWidth={3} />
          <path d={`M ${x} ${y - 66} L ${x + Math.sin(a) * 24} ${y - 66 - Math.cos(a) * 24}`} stroke="#E63946" strokeWidth={5} strokeLinecap="round" />
          {mainDessus}
        </g>
      );
    }
    case 'bouteille':
      return (
        <g>
          <rect x={x - 22} y={y - 120} width={44} height={130} rx={14} fill="#A9DEF9" stroke={OUT} strokeWidth={6} />
          <rect x={x - 22} y={y - 70} width={44} height={70} rx={10} fill="#4CC9F0" opacity={0.7} />
          <rect x={x - 12} y={y - 138} width={24} height={22} rx={6} fill="#2EC4B6" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    case 'haltere':
      return (
        <g>
          <rect x={x - 56} y={y - 8} width={112} height={16} rx={6} fill="#6C757D" stroke={OUT} strokeWidth={5} />
          <rect x={x - 74} y={y - 30} width={26} height={60} rx={8} fill="#7209B7" stroke={OUT} strokeWidth={6} />
          <rect x={x + 48} y={y - 30} width={26} height={60} rx={8} fill="#7209B7" stroke={OUT} strokeWidth={6} />
          {mainDessus}
        </g>
      );
    case 'elastique': {
      const tend = Math.sin(frame / 6) * 20;
      return (
        <g>
          <path d={`M ${x} ${y} Q ${x - 60} ${y + 80 + tend} ${x - 10} ${y + 170 + tend}`} fill="none" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
          <path d={`M ${x} ${y} Q ${x - 60} ${y + 80 + tend} ${x - 10} ${y + 170 + tend}`} fill="none" stroke="#F72585" strokeWidth={10} strokeLinecap="round" />
          {mainDessus}
        </g>
      );
    }
    case 'tapis_roule':
      return (
        <g transform={`rotate(-20 ${x} ${y})`}>
          <rect x={x - 110} y={y - 30} width={220} height={60} rx={30} fill="#2EC4B6" stroke={OUT} strokeWidth={7} />
          <ellipse cx={x + 110} cy={y} rx={18} ry={30} fill="#1A9E92" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x - 60} ${y - 30} V ${y + 30} M ${x + 40} ${y - 30} V ${y + 30}`} stroke="#343A40" strokeWidth={6} />
          {mainDessus}
        </g>
      );
    default:
      return null;
  }
};

/** Objets de scène ep15. */
export const ObjetSceneEp15: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  switch (o.type as string) {
    case 'tapis_sol': {
      const w = o.largeur ?? 380;
      const ouv = o.ouvre === undefined ? 1 : interpolate(t, [o.ouvre, o.ouvre + 0.6], [0.15, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return (
        <g>
          <path d={`M ${x - (w / 2) * ouv} ${y} L ${x + (w / 2) * ouv} ${y} L ${x + (w / 2) * ouv - 40} ${y - 60} L ${x - (w / 2) * ouv + 40} ${y - 60} Z`} fill={o.couleur ?? '#2EC4B6'} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          <path d={`M ${x - (w / 2) * ouv + 30} ${y - 30} H ${x + (w / 2) * ouv - 30}`} stroke="rgba(0,0,0,0.15)" strokeWidth={6} />
        </g>
      );
    }
    case 'halteres_sol':
      return (
        <g>
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${x + k * 110} ${y - 24})`}>
              <rect x={-40} y={-6} width={80} height={12} rx={5} fill="#6C757D" stroke={OUT} strokeWidth={4} />
              <rect x={-54} y={-22} width={20} height={44} rx={6} fill="#7209B7" stroke={OUT} strokeWidth={5} />
              <rect x={34} y={-22} width={20} height={44} rx={6} fill="#7209B7" stroke={OUT} strokeWidth={5} />
            </g>
          ))}
          <path d={`M ${x + 220} ${y - 10} q 40 -40 80 0 q -40 30 -80 0`} fill="none" stroke="#F72585" strokeWidth={10} strokeLinecap="round" />
        </g>
      );
    case 'canape': {
      const w = o.largeur ?? 620;
      return (
        <g>
          <rect x={x - w / 2} y={y - 300} width={w} height={170} rx={40} fill={o.couleur ?? '#6D597A'} stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2 + 30} y={y - 160} width={w - 60} height={90} rx={24} fill="#8E7DA0" stroke={OUT} strokeWidth={7} />
          <rect x={x - w / 2 - 20} y={y - 220} width={70} height={170} rx={30} fill={o.couleur ?? '#6D597A'} stroke={OUT} strokeWidth={8} />
          <rect x={x + w / 2 - 50} y={y - 220} width={70} height={170} rx={30} fill={o.couleur ?? '#6D597A'} stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2 + 10} y={y - 60} width={20} height={60} fill="#3D2C1E" />
          <rect x={x + w / 2 - 30} y={y - 60} width={20} height={60} fill="#3D2C1E" />
        </g>
      );
    }
    case 'tablette_livres': {
      // pile de livres sans titre + tablette générique en mode caméra (point rouge qui clignote)
      const rec = Math.floor(frame / 12) % 2 === 0;
      return (
        <g>
          {['#E76F51', '#2A9D8F', '#E9C46A', '#457B9D'].map((c, k) => (
            <rect key={k} x={x - 90 + (k % 2) * 8} y={y - 40 - k * 40} width={180} height={40} rx={6} fill={c} stroke={OUT} strokeWidth={6} />
          ))}
          <rect x={x - 70} y={y - 330} width={140} height={170} rx={16} fill="#212529" stroke={OUT} strokeWidth={7} />
          <rect x={x - 58} y={y - 318} width={116} height={146} rx={8} fill="#CDE7F7" />
          <circle cx={x} cy={y - 250} r={26} fill="none" stroke="#ADB5BD" strokeWidth={6} />
          {rec ? <circle cx={x + 40} cy={y - 300} r={9} fill="#E63946" /> : null}
        </g>
      );
    }
    case 'compteur': {
      // compteur générique (ex. abonnés) : la valeur monte entre t et fin
      const debut = o.t ?? 0;
      const fin = o.fin ?? debut + 2;
      const max = Number(o.affiche ?? 20);
      const v = Math.round(interpolate(t, [debut, fin], [0, max], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
      return (
        <g>
          <rect x={x - 130} y={y - 70} width={260} height={140} rx={24} fill="white" stroke={OUT} strokeWidth={7} />
          <circle cx={x - 70} cy={y - 10} r={22} fill="#2EC4B6" stroke={OUT} strokeWidth={5} />
          <path d={`M ${x - 105} ${y + 40} q 35 -50 70 0`} fill="#2EC4B6" stroke={OUT} strokeWidth={5} />
          <text x={x + 40} y={y + 22} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={70} fill={OUT}>
            {v}
          </text>
          <text x={x} y={y + 110} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={34} fill="white" stroke={OUT} strokeWidth={2}>
            {o.texte ?? 'abonnés'}
          </text>
        </g>
      );
    }
    case 'plan_mural': {
      // plan de quartier générique : punaises qui apparaissent aux instants
      const w = o.largeur ?? 360;
      const h = o.hauteur ?? 280;
      const pts: Pt[] = [
        [0.3, 0.35],
        [0.45, 0.42],
        [0.38, 0.6],
        [0.55, 0.55],
      ];
      return (
        <g>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#F1FAEE" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - w / 2} ${y} H ${x + w / 2} M ${x - w / 6} ${y - h / 2} V ${y + h / 2} M ${x + w / 4} ${y - h / 2} V ${y + h / 2}`} stroke="#ADB5BD" strokeWidth={10} />
          <circle cx={x - w * 0.05} cy={y + h * 0.02} r={Math.min(w, h) * 0.26} fill="rgba(46,196,182,0.18)" stroke="#2EC4B6" strokeWidth={4} strokeDasharray="10 8" />
          {pts.map(([px, py], k) => {
            const ti = o.instants?.[k] ?? 0;
            if (t < ti) return null;
            const pop = Math.min(1, (t - ti) / 0.2);
            const cx = x - w / 2 + px * w;
            const cy = y - h / 2 + py * h;
            return <circle key={k} cx={cx} cy={cy - (1 - pop) * 20} r={14} fill="#E63946" stroke={OUT} strokeWidth={4} />;
          })}
        </g>
      );
    }
    default:
      return <ObjetSceneEp16 o={o} frame={frame} fps={fps} />;
  }
};

/** Décor `parc` : pelouse, arbres, banc, allée, ciel clair. */
export const DecorParc: React.FC<{frame: number}> = ({frame}) => {
  const W = 1080;
  const H = 1920;
  const SOL = 1480;
  const arbre = (x: number, h: number, c: string, k: number) => {
    const sway = Math.sin(frame / 40 + k) * 4;
    return (
      <g key={k}>
        <rect x={x - 22} y={SOL - 160 - h * 0.4} width={44} height={h * 0.4 + 40} rx={10} fill="#8D5524" stroke={OUT} strokeWidth={8} />
        <g transform={`rotate(${sway} ${x} ${SOL - 160 - h * 0.4})`}>
          <circle cx={x} cy={SOL - 220 - h * 0.6} r={h * 0.32} fill={c} stroke={OUT} strokeWidth={8} />
          <circle cx={x - h * 0.22} cy={SOL - 170 - h * 0.45} r={h * 0.22} fill={c} stroke={OUT} strokeWidth={8} />
          <circle cx={x + h * 0.22} cy={SOL - 170 - h * 0.45} r={h * 0.22} fill={c} stroke={OUT} strokeWidth={8} />
        </g>
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <linearGradient id="cielParc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ECAE6" />
          <stop offset="1" stopColor="#D8F3DC" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cielParc)" />
      <circle cx={860} cy={300} r={110} fill="#FFE066" />
      {[0, 1].map((i) => {
        const x = ((i * 600 + frame * 1.2) % 1400) - 200;
        return (
          <g key={i} fill="white" opacity={0.9}>
            <ellipse cx={x} cy={220 + i * 180} rx={120} ry={40} />
            <ellipse cx={x + 60} cy={195 + i * 180} rx={70} ry={45} />
          </g>
        );
      })}
      {/* collines au fond */}
      <path d={`M 0 ${SOL - 380} Q 270 ${SOL - 520} 540 ${SOL - 400} T 1080 ${SOL - 420} V ${SOL} H 0 Z`} fill="#95D5B2" stroke={OUT} strokeWidth={8} />
      {arbre(110, 520, '#52B788', 1)}
      {arbre(960, 600, '#40916C', 2)}
      {arbre(700, 380, '#74C69D', 3)}
      {/* banc */}
      <g>
        <rect x={360} y={SOL - 190} width={300} height={22} rx={8} fill="#BC6C25" stroke={OUT} strokeWidth={6} />
        <rect x={360} y={SOL - 230} width={300} height={22} rx={8} fill="#BC6C25" stroke={OUT} strokeWidth={6} />
        <rect x={350} y={SOL - 150} width={320} height={24} rx={8} fill="#DDA15E" stroke={OUT} strokeWidth={6} />
        <rect x={375} y={SOL - 130} width={16} height={70} fill="#343A40" />
        <rect x={630} y={SOL - 130} width={16} height={70} fill="#343A40" />
      </g>
      {/* pelouse et allée */}
      <rect y={SOL - 60} width={W} height={H - SOL + 60} fill="#74C69D" />
      <path d={`M 380 ${SOL - 60} L 700 ${SOL - 60} L 1000 ${H} L 80 ${H} Z`} fill="#E9D8A6" stroke={OUT} strokeWidth={6} />
      {Array.from({length: 14}).map((_, k) => (
        <path key={k} d={`M ${(k * 83) % W} ${SOL + 40 + ((k * 137) % 360)} l 8 -20 l 8 20`} fill="none" stroke="#40916C" strokeWidth={5} />
      ))}
    </svg>
  );
};
