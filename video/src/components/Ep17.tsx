import {interpolate} from 'remotion';
import type {ObjetScene} from '../types';

/**
 * ep17 (Chloé, laveuse de vitres indépendante) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Tablier à raclettes, objets tenus (raclette, perche, seau, pulverisateur, microfibre), objets de scène
 * (baie_vitree : vitre sale nettoyée en S ; gouttes : jets et gouttes d'eau stylisés ; immeuble_nacelle ; seau_sol),
 * décor `maison_jardin`. Aucune marque, aucun logo. Repère personnage : 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
type Pt = [number, number];
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EAU = '#4CC9F0';

/** Tablier de taille gris avec deux raclettes qui dépassent de la poche. */
export const TablierVitres: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <path d="M 226 640 Q 300 652 374 640" fill="none" stroke={OUT} strokeWidth={8} />
    <path d="M 232 640 L 368 640 L 380 760 Q 300 774 220 760 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {[262, 330].map((xx, k) => (
      <g key={k} transform={`rotate(${k ? 10 : -10} ${xx} 680)`}>
        <rect x={xx - 6} y={600} width={12} height={80} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
        <rect x={xx - 34} y={590} width={68} height={16} rx={4} fill="#E63946" stroke={OUT} strokeWidth={4} />
        <rect x={xx - 34} y={586} width={68} height={6} fill={OUT} />
      </g>
    ))}
    <rect x={240} y={668} width={120} height={66} rx={10} fill={couleur} stroke={OUT} strokeWidth={6} />
    <path d="M 248 680 H 352" stroke="#ADB5BD" strokeWidth={3} strokeDasharray="7 5" />
  </g>
);

export const OBJETS_EP17 = new Set(['raclette', 'perche', 'seau', 'pulverisateur', 'microfibre']);

const Raclette: React.FC<{x: number; y: number; manche: number}> = ({x, y, manche}) => (
  <g>
    <rect x={x - 9} y={y - manche} width={18} height={manche + 10} rx={8} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
    <rect x={x - 90} y={y - manche - 26} width={180} height={28} rx={6} fill="#E63946" stroke={OUT} strokeWidth={6} />
    <rect x={x - 92} y={y - manche - 34} width={184} height={10} rx={3} fill={OUT} />
  </g>
);

export const ObjetMainEp17: React.FC<{nom: string; main: Pt; peau: string; frame: number}> = ({nom, main, peau, frame}) => {
  const [x, y] = main;
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'raclette':
      return (
        <g transform={`rotate(${Math.sin(frame / 6) * 10} ${x} ${y})`}>
          <Raclette x={x} y={y} manche={90} />
          {mainDessus}
        </g>
      );
    case 'perche': {
      // perche télescopique qui se déploie un peu, raclette au bout
      const l = 280 + Math.sin(frame / 9) * 24;
      return (
        <g transform={`rotate(${-8 + Math.sin(frame / 5) * 7} ${x} ${y})`}>
          <rect x={x - 8} y={y - l * 0.5} width={16} height={l * 0.5 + 60} rx={6} fill="#6C757D" stroke={OUT} strokeWidth={5} />
          <rect x={x - 6} y={y - l} width={12} height={l * 0.5 + 4} rx={5} fill="#CED4DA" stroke={OUT} strokeWidth={5} />
          <rect x={x - 12} y={y - l * 0.5 - 8} width={24} height={16} rx={4} fill="#FFD60A" stroke={OUT} strokeWidth={4} />
          <Raclette x={x} y={y - l + 10} manche={20} />
          {mainDessus}
        </g>
      );
    }
    case 'seau': {
      const bal = Math.sin(frame / 5) * 5;
      return (
        <g transform={`rotate(${bal} ${x} ${y})`}>
          <path d={`M ${x - 56} ${y + 40} Q ${x} ${y - 30} ${x + 56} ${y + 40}`} fill="none" stroke={OUT} strokeWidth={8} />
          <path d={`M ${x - 70} ${y + 40} h 140 l -14 120 h -112 z`} fill="#4895EF" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={x} cy={y + 42} rx={66} ry={12} fill={EAU} stroke={OUT} strokeWidth={5} />
          <circle cx={x - 20} cy={y + 34} r={8} fill="white" opacity={0.8} />
          <circle cx={x + 18} cy={y + 30} r={6} fill="white" opacity={0.8} />
          {mainDessus}
        </g>
      );
    }
    case 'pulverisateur': {
      const pschitt = Math.sin(frame / 3) > 0.2;
      return (
        <g>
          <path d={`M ${x - 26} ${y - 30} h 52 l 6 110 q -32 14 -64 0 z`} fill="#90E0EF" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${x - 22} ${y - 30} v -26 h 54 l 22 10 v 12 h -30 v 4 z`} fill="#F8F9FA" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          {pschitt
            ? [0, 1, 2, 3, 4].map((k) => <circle key={k} cx={x + 66 + k * 16} cy={y - 50 + (k - 2) * 8 * (k / 3)} r={5 + (k % 2) * 2} fill={EAU} opacity={0.85} />)
            : null}
          {mainDessus}
        </g>
      );
    }
    case 'microfibre':
      return (
        <g transform={`rotate(${Math.sin(frame / 4) * 12} ${x} ${y})`}>
          <path d={`M ${x - 46} ${y - 40} q 46 -18 92 0 l -6 80 q -40 12 -80 0 z`} fill="#F72585" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${x - 30} ${y - 20} h 60 M ${x - 30} ${y} h 60`} stroke="#FFB3D9" strokeWidth={4} />
          {mainDessus}
        </g>
      );
    default:
      return null;
  }
};

/** Goutte stylisée (pointe en haut). */
const Goutte: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <path d={`M ${x} ${y - r * 1.8} Q ${x + r} ${y - r * 0.4} ${x + r} ${y} A ${r} ${r} 0 0 1 ${x - r} ${y} Q ${x - r} ${y - r * 0.4} ${x} ${y - r * 1.8} Z`} fill={EAU} stroke={OUT} strokeWidth={3} opacity={o} />
);

export const ObjetSceneEp17: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  const inst = o.instants ?? [];
  switch (o.type as string) {
    case 'baie_vitree': {
      // grande vitre (x = centre, y = bas) : sale au départ, nettoyée le long d'un tracé en S entre instants[0] et [1]
      const w = o.largeur ?? 520;
      const h = o.hauteur ?? 520;
      const l = x - w / 2;
      const top = y - h;
      const [d0, d1] = inst.length >= 2 ? inst : [0, 3];
      const p = interpolate(t, [d0, d1], [0, 1], cl);
      const m = 70;
      const rangs = 4;
      let d = `M ${l + m} ${top + m}`;
      for (let k = 0; k < rangs; k++) {
        const yy = top + m + (k * (h - 2 * m)) / (rangs - 1);
        const xFin = k % 2 === 0 ? l + w - m : l + m;
        d += ` L ${xFin} ${yy}`;
        if (k < rangs - 1) {
          const yn = top + m + ((k + 1) * (h - 2 * m)) / (rangs - 1);
          d += ` Q ${xFin + (k % 2 === 0 ? m : -m)} ${(yy + yn) / 2} ${xFin} ${yn}`;
        }
      }
      const id = `bv-${Math.round(x)}-${Math.round(y)}`;
      const propre = p >= 1;
      return (
        <g>
          <defs>
            <mask id={id}>
              <rect x={l} y={top} width={w} height={h} fill="white" />
              <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} fill="none" stroke="black" strokeWidth={(h - 2 * m) / (rangs - 1) + 30} strokeLinecap="round" strokeLinejoin="round" />
            </mask>
          </defs>
          <rect x={l - 16} y={top - 16} width={w + 32} height={h + 32} fill="#F8F9FA" stroke={OUT} strokeWidth={8} />
          <rect x={l} y={top} width={w} height={h} fill="#D7F0FF" stroke={OUT} strokeWidth={6} />
          {/* reflets de vitre propre */}
          <path d={`M ${l + 40} ${top + h - 60} L ${l + 160} ${top + 40} M ${l + 110} ${top + h - 40} L ${l + 200} ${top + 120}`} stroke="white" strokeWidth={propre ? 18 : 12} strokeLinecap="round" opacity={0.85} />
          {/* saleté (masquée le long du tracé de la raclette) */}
          {!propre ? (
            <g mask={`url(#${id})`}>
              <rect x={l} y={top} width={w} height={h} fill="#A68A64" opacity={0.42} />
              {Array.from({length: 14}).map((_, k) => (
                <circle key={k} cx={l + ((k * 137) % (w - 40)) + 20} cy={top + ((k * 89) % (h - 40)) + 20} r={10 + (k % 4) * 6} fill="#7F6A4D" opacity={0.35} />
              ))}
            </g>
          ) : null}
          {/* coulures d'eau pendant le nettoyage */}
          {t >= d0 && t <= d1 + 0.8
            ? [0, 1, 2, 3, 4].map((k) => {
                const u = ((t - d0) * 0.9 + k * 0.23) % 1;
                return <Goutte key={k} x={l + 60 + ((k * 211) % (w - 120))} y={top + 40 + u * (h - 60)} r={9} o={0.9} />;
              })
            : null}
          {/* étincelles quand c'est propre */}
          {propre && t < d1 + 1.6
            ? [0, 1, 2].map((k) => {
                const s = interpolate(t, [d1 + k * 0.15, d1 + 0.4 + k * 0.15, d1 + 1 + k * 0.15], [0, 1, 0], cl);
                const cx = l + w * (0.25 + k * 0.25);
                const cy = top + h * (0.3 + (k % 2) * 0.3);
                return <path key={k} d={`M ${cx} ${cy - 30 * s} L ${cx + 8 * s} ${cy} L ${cx} ${cy + 30 * s} L ${cx - 8 * s} ${cy} Z M ${cx - 30 * s} ${cy} L ${cx} ${cy - 8 * s} L ${cx + 30 * s} ${cy} L ${cx} ${cy + 8 * s} Z`} fill="white" stroke={OUT} strokeWidth={3} />;
              })
            : null}
          <path d={`M ${x} ${top} v ${h}`} stroke={OUT} strokeWidth={o.texte === 'simple' ? 0 : 6} />
        </g>
      );
    }
    case 'gouttes': {
      // jets d'eau stylisés : à chaque instant, une gerbe lancée vers la droite (largeur = portée, négative = gauche)
      const portee = o.largeur ?? 260;
      return (
        <g>
          {inst.map((ti, i) => {
            const u = (t - ti) / 0.9;
            if (u < 0 || u > 1) return null;
            return (
              <g key={i}>
                {Array.from({length: 9}).map((_, k) => {
                  const v = Math.min(1, u * (1 + k * 0.08));
                  const gx = x + portee * v * (0.7 + (k % 3) * 0.15);
                  const gy = y - 180 * v * (1 - v) * 2 + 60 * v * v - (k % 4) * 10;
                  return <Goutte key={k} x={gx} y={gy} r={8 + (k % 3) * 3} o={1 - u * 0.5} />;
                })}
                <path d={`M ${x} ${y} Q ${x + portee * 0.5 * u} ${y - 200 * u} ${x + portee * u} ${y - 40 * u}`} fill="none" stroke={EAU} strokeWidth={14 * (1 - u)} strokeLinecap="round" opacity={0.7} />
              </g>
            );
          })}
        </g>
      );
    }
    case 'seau_sol':
      return (
        <g>
          <path d={`M ${x - 70} ${y - 120} h 140 l -14 120 h -112 z`} fill="#4895EF" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={x} cy={y - 118} rx={66} ry={12} fill={EAU} stroke={OUT} strokeWidth={5} />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={x - 30 + k * 28} cy={y - 128 - Math.abs(Math.sin(frame / 8 + k)) * 18} r={9 - k * 2} fill="white" stroke={OUT} strokeWidth={2} />
          ))}
        </g>
      );
    case 'immeuble_nacelle': {
      // grand immeuble générique, repère « 12 m », nacelle qui monte (instants[0] → [1])
      const h = o.hauteur ?? 900;
      const w = o.largeur ?? 300;
      const l = x - w / 2;
      const [d0, d1] = inst.length >= 2 ? inst : [0, 3];
      const p = interpolate(t, [d0, d1], [0, 1], cl);
      const ny = y - 120 - p * (h - 320);
      return (
        <g>
          <rect x={l} y={y - h} width={w} height={h} fill="#ADB5BD" stroke={OUT} strokeWidth={8} />
          {Array.from({length: 9}).map((_, r) =>
            [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={l + 24 + c * 90} y={y - h + 30 + r * 92} width={70} height={60} fill="#CDE7F7" stroke={OUT} strokeWidth={4} />),
          )}
          {/* repère de hauteur */}
          <path d={`M ${l + w + 30} ${y} V ${y - h * 0.45} M ${l + w + 16} ${y - h * 0.45} h 28`} stroke="#E63946" strokeWidth={7} />
          <rect x={l + w + 40} y={y - h * 0.45 - 30} width={110} height={52} rx={10} fill="#E63946" stroke={OUT} strokeWidth={5} />
          <text x={l + w + 95} y={y - h * 0.45 + 8} fontSize={34} fontFamily="sans-serif" fontWeight={900} fill="white" textAnchor="middle">12 m</text>
          {/* nacelle */}
          <path d={`M ${l - 80} ${y} L ${l - 40} ${ny + 60}`} stroke="#FFB703" strokeWidth={18} />
          <path d={`M ${l - 80} ${y} L ${l - 40} ${ny + 60}`} stroke={OUT} strokeWidth={4} strokeDasharray="20 16" />
          <rect x={l - 120} y={y - 50} width={140} height={50} rx={8} fill="#FFB703" stroke={OUT} strokeWidth={6} />
          <rect x={l - 90} y={ny} width={110} height={64} rx={6} fill="#FB8500" stroke={OUT} strokeWidth={6} />
          <path d={`M ${l - 90} ${ny + 20} h 110`} stroke={OUT} strokeWidth={4} />
        </g>
      );
    }
    default:
      return null;
  }
};

/** Décor maison avec jardin : façade, grande baie vitrée, fenêtres, porte, pelouse, allée, portillon. */
export const DecorMaisonJardin: React.FC<{frame: number}> = ({frame}) => {
  const W = 1080;
  const H = 1920;
  const SOL = 1480;
  const nuage = (frame * 0.4) % 1400;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill="#BDE0FE" />
      <circle cx={900} cy={260} r={80} fill="#FFE066" />
      {[0, 1].map((k) => {
        const cx = ((nuage + k * 700) % 1400) - 200;
        return (
          <g key={k} fill="white" opacity={0.9}>
            <ellipse cx={cx} cy={300 + k * 120} rx={110} ry={40} />
            <ellipse cx={cx + 60} cy={280 + k * 120} rx={70} ry={44} />
          </g>
        );
      })}
      {/* arbres au fond */}
      {[60, 1020].map((tx, k) => (
        <g key={k}>
          <rect x={tx - 18} y={SOL - 520} width={36} height={300} fill="#8B5E34" stroke={OUT} strokeWidth={6} />
          <circle cx={tx} cy={SOL - 600} r={130} fill="#52B788" stroke={OUT} strokeWidth={7} />
        </g>
      ))}
      {/* maison */}
      <rect x={110} y={560} width={860} height={SOL - 560 - 40} fill="#FFF3E0" stroke={OUT} strokeWidth={9} />
      <path d="M 70 580 L 540 300 L 1010 580 Z" fill="#C8553D" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
      <rect x={760} y={330} width={70} height={160} fill="#9C3D2B" stroke={OUT} strokeWidth={7} />
      {/* fenêtres de l'étage */}
      {[200, 470, 740].map((fx) => (
        <g key={fx}>
          <rect x={fx} y={620} width={150} height={130} fill="#CDE7F7" stroke={OUT} strokeWidth={7} />
          <path d={`M ${fx + 75} 620 v 130 M ${fx} 685 h 150`} stroke={OUT} strokeWidth={5} />
          <rect x={fx - 12} y={748} width={174} height={16} fill="#F8F9FA" stroke={OUT} strokeWidth={5} />
        </g>
      ))}
      {/* grande baie vitrée au rez-de-chaussée */}
      <rect x={170} y={870} width={560} height={540} fill="#F8F9FA" stroke={OUT} strokeWidth={8} />
      <rect x={186} y={886} width={528} height={508} fill="#CDE7F7" stroke={OUT} strokeWidth={6} />
      <path d="M 450 886 v 508" stroke={OUT} strokeWidth={6} />
      <path d="M 220 1340 L 320 920 M 270 1380 L 350 1040" stroke="white" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
      {/* porte */}
      <rect x={790} y={1060} width={150} height={380} fill="#2A9D8F" stroke={OUT} strokeWidth={8} />
      <circle cx={914} cy={1260} r={9} fill="#E9C46A" stroke={OUT} strokeWidth={3} />
      <rect x={780} y={1430} width={170} height={20} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
      {/* pelouse */}
      <rect x={0} y={SOL - 40} width={W} height={H - SOL + 40} fill="#74C69D" />
      <path d={`M 0 ${SOL - 40} H ${W}`} stroke={OUT} strokeWidth={8} />
      {Array.from({length: 26}).map((_, k) => (
        <path key={k} d={`M ${(k * 97) % W} ${SOL + 40 + ((k * 53) % 380)} l 8 -22 l 8 22`} fill="none" stroke="#40916C" strokeWidth={5} strokeLinecap="round" />
      ))}
      {/* allée */}
      <path d={`M 800 ${SOL - 30} L 940 ${SOL - 30} L 1080 ${H} L 640 ${H} Z`} fill="#E9D8A6" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      {/* clôture et portillon */}
      {Array.from({length: 7}).map((_, k) => (
        <rect key={k} x={10 + k * 46} y={SOL + 260} width={26} height={150} rx={6} fill="white" stroke={OUT} strokeWidth={5} />
      ))}
      <rect x={0} y={SOL + 300} width={330} height={16} fill="white" stroke={OUT} strokeWidth={5} />
      <g>
        <rect x={340} y={SOL + 250} width={130} height={170} rx={8} fill="none" stroke={OUT} strokeWidth={12} />
        <rect x={340} y={SOL + 250} width={130} height={170} rx={8} fill="none" stroke="#F8F9FA" strokeWidth={6} />
        <path d={`M 405 ${SOL + 250} v 170 M 340 ${SOL + 335} h 130`} stroke="#F8F9FA" strokeWidth={6} />
      </g>
      {/* massif de fleurs */}
      {[150, 230, 620, 690].map((fx, k) => (
        <circle key={k} cx={fx} cy={SOL - 40} r={16} fill={k % 2 ? '#F72585' : '#FFD60A'} stroke={OUT} strokeWidth={4} />
      ))}
    </svg>
  );
};
