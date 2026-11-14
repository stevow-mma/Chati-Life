import {interpolate} from 'remotion';
import {FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';

/**
 * ep18 (Nolan, jeune streamer) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Casque audio porté sur les oreilles (`tete: casque_audio`), objet tenu `manette`, objets de scène
 * (ecran_jeu : jeu de conduite FICTIF low-poly en ville néon + chat live + compteur ; tirelire ; timeline ;
 * globe ; video_retiree ; pile_clips ; graphique ; compteur_abos), décor `setup_gaming`.
 * Aucune marque, aucun logo, aucun élément de jeu réel. Repère personnage : 600 x 900.
 */

const OUT = '#1b1b2f';
type Pt = [number, number];
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Casque audio sur les oreilles (repère de la tête). */
export const CasqueAudio: React.FC<{couleur: string; coussins: string}> = ({couleur, coussins}) => (
  <g>
    <path d="M 140 300 Q 130 40 300 36 Q 470 40 460 300" fill="none" stroke={OUT} strokeWidth={34} strokeLinecap="round" />
    <path d="M 140 300 Q 130 40 300 36 Q 470 40 460 300" fill="none" stroke={couleur} strokeWidth={20} strokeLinecap="round" />
    {[138, 462].map((x) => (
      <g key={x}>
        <rect x={x - 34} y={236} width={68} height={110} rx={30} fill={coussins} stroke={OUT} strokeWidth={8} />
        <rect x={x - 22} y={252} width={44} height={78} rx={18} fill={couleur} stroke={OUT} strokeWidth={5} />
      </g>
    ))}
  </g>
);

export const OBJETS_EP18 = new Set(['manette']);

export const ObjetMainEp18: React.FC<{nom: string; main: Pt; frame: number}> = ({nom, main, frame}) => {
  const [x, y] = main;
  if (nom !== 'manette') return null;
  const v = Math.sin(frame * 0.9) * 3;
  // manette générique tenue à deux mains : s'étend vers l'autre main (vers la gauche du repère)
  return (
    <g transform={`translate(${x - 70} ${y + v}) rotate(${Math.sin(frame * 0.35) * 6})`}>
      <path d="M -90 -30 Q -60 -48 0 -44 Q 60 -48 90 -30 Q 120 30 96 52 Q 70 66 46 30 L -46 30 Q -70 66 -96 52 Q -120 30 -90 -30 Z" fill="#2B2D42" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -68 -8 h 30 M -53 -23 v 30" stroke="#ADB5BD" strokeWidth={9} strokeLinecap="round" />
      {[[50, -20, '#F72585'], [70, -2, '#4CC9F0'], [30, -2, '#FFD60A'], [50, 16, '#80ED99']].map(([bx, by, c], k) => (
        <circle key={k} cx={bx as number} cy={by as number} r={8} fill={c as string} stroke={OUT} strokeWidth={3} />
      ))}
      <circle cx={-20} cy={14} r={11} fill="#495057" stroke={OUT} strokeWidth={3} />
      <circle cx={18} cy={14} r={11} fill="#495057" stroke={OUT} strokeWidth={3} />
    </g>
  );
};

/** Écran de jeu FICTIF : voiture low-poly dans une ville au néon (aucun élément reconnaissable). */
const JeuConduite: React.FC<{w: number; h: number; t: number}> = ({w, h, t}) => {
  const horizon = h * 0.55;
  const defil = (t * 260) % 200;
  const virage = Math.sin(t * 1.3) * w * 0.08;
  return (
    <g>
      <defs>
        <linearGradient id="ciel18" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#240046" />
          <stop offset="1" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#ciel18)" />
      <circle cx={w * 0.5} cy={horizon - 10} r={h * 0.18} fill="#FF6D00" opacity={0.85} />
      {Array.from({length: 9}).map((_, k) => {
        const bw = w / 9;
        const bh = h * (0.18 + ((k * 37) % 23) / 60);
        return (
          <g key={k}>
            <rect x={k * bw + 2} y={horizon - bh} width={bw - 6} height={bh} fill="#10002B" />
            {Array.from({length: 4}).map((__, j) => (
              <rect key={j} x={k * bw + 8 + (j % 2) * (bw / 2 - 6)} y={horizon - bh + 10 + Math.floor(j / 2) * 22} width={bw / 4} height={8}
                fill={(k + j) % 3 ? '#F72585' : '#4CC9F0'} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 3 + k + j))} />
            ))}
          </g>
        );
      })}
      <path d={`M 0 ${horizon} H ${w} V ${h} H 0 Z`} fill="#3C096C" />
      <path d={`M ${w * 0.47 + virage * 0.2} ${horizon} L ${w * 0.53 + virage * 0.2} ${horizon} L ${w * 0.95 + virage} ${h} L ${w * 0.05 + virage} ${h} Z`} fill="#22223B" />
      {Array.from({length: 5}).map((_, k) => {
        const p = ((k * 200 + defil) % 1000) / 1000;
        const yy = horizon + (h - horizon) * p * p;
        const ww = 4 + 14 * p;
        return <rect key={k} x={w * 0.5 + virage * p - ww / 2} y={yy} width={ww} height={6 + 20 * p} fill="#FFD60A" />;
      })}
      {/* voiture low-poly générique vue de dos */}
      <g transform={`translate(${w * 0.5 + virage * 0.6} ${h * 0.86}) rotate(${Math.sin(t * 1.3) * 4})`}>
        <path d={`M ${-w * 0.14} 0 L ${-w * 0.11} ${-h * 0.12} L ${w * 0.11} ${-h * 0.12} L ${w * 0.14} 0 Z`} fill="#4CC9F0" stroke={OUT} strokeWidth={4} />
        <path d={`M ${-w * 0.08} ${-h * 0.12} L ${-w * 0.06} ${-h * 0.2} L ${w * 0.06} ${-h * 0.2} L ${w * 0.08} ${-h * 0.12} Z`} fill="#0096C7" stroke={OUT} strokeWidth={4} />
        <rect x={-w * 0.12} y={-h * 0.07} width={w * 0.05} height={h * 0.025} fill="#F72585" />
        <rect x={w * 0.07} y={-h * 0.07} width={w * 0.05} height={h * 0.025} fill="#F72585" />
        <rect x={-w * 0.15} y={-h * 0.01} width={w * 0.06} height={h * 0.05} rx={3} fill={OUT} />
        <rect x={w * 0.09} y={-h * 0.01} width={w * 0.06} height={h * 0.05} rx={3} fill={OUT} />
      </g>
    </g>
  );
};

const Bulle: React.FC<{x: number; y: number; w: number; c: string}> = ({x, y, w, c}) => (
  <g>
    <rect x={x} y={y} width={w} height={26} rx={13} fill="white" stroke={OUT} strokeWidth={3} />
    <circle cx={x + 14} cy={y + 13} r={7} fill={c} />
    <rect x={x + 28} y={y + 10} width={w - 44} height={6} rx={3} fill="#ADB5BD" />
  </g>
);

const fmt = (v: number) => Math.round(v).toLocaleString('fr-FR').replace(/ /g, ' ');

export const ObjetSceneEp18: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  const inst = o.instants ?? [];
  switch (o.type as string) {
    case 'ecran_jeu': {
      // écran (x = centre, y = bas) : jeu fictif + colonne de chat « live » + compteur de spectateurs (labels [de, à] entre t et fin)
      const w = o.largeur ?? 620;
      const h = o.hauteur ?? 360;
      const l = x - w / 2;
      const top = y - h;
      const [a, b] = (o.labels ?? ['120', '480']).map(Number);
      const vue = interpolate(t, [o.t ?? 0, o.fin ?? 4], [a, b], cl);
      const chatW = w * 0.28;
      return (
        <g>
          <rect x={l - 14} y={top - 14} width={w + 28} height={h + 28} rx={16} fill="#111" stroke={OUT} strokeWidth={8} />
          <svg x={l} y={top} width={w - chatW} height={h} viewBox={`0 0 ${w - chatW} ${h}`}>
            <JeuConduite w={w - chatW} h={h} t={t} />
          </svg>
          <rect x={l + w - chatW} y={top} width={chatW} height={h} fill="#2B2D42" />
          <svg x={l + w - chatW} y={top} width={chatW} height={h}>
            {Array.from({length: 12}).map((_, k) => {
              const yy = h - (((t * 60 + k * 40) % 480));
              return <Bulle key={k} x={6} y={yy} w={chatW - 12} c={['#F72585', '#4CC9F0', '#80ED99', '#FFD60A'][k % 4]} />;
            })}
          </svg>
          <g transform={`translate(${l + 12} ${top + 12})`}>
            <rect width={92} height={36} rx={8} fill="#E63946" stroke={OUT} strokeWidth={4} />
            <circle cx={18} cy={18} r={7} fill="white" opacity={0.5 + 0.5 * Math.sin(t * 6)} />
            <text x={56} y={27} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={24} fill="white">LIVE</text>
            <rect x={100} width={150} height={36} rx={8} fill="rgba(0,0,0,0.65)" stroke={OUT} strokeWidth={4} />
            <circle cx={120} cy={18} r={9} fill="none" stroke="white" strokeWidth={4} />
            <circle cx={120} cy={18} r={3} fill="white" />
            <text x={186} y={28} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={26} fill="white">{fmt(vue)}</text>
          </g>
          <rect x={x - 30} y={y + 14} width={60} height={60} fill="#343A40" stroke={OUT} strokeWidth={6} />
          <rect x={x - 110} y={y + 70} width={220} height={20} rx={8} fill="#343A40" stroke={OUT} strokeWidth={6} />
        </g>
      );
    }
    case 'tirelire': {
      // tirelire : trois icônes génériques (téléphone vertical, écran horizontal lecture, bulle live) tombent aux instants
      const icones = ['tel', 'ecran', 'live'];
      return (
        <g>
          {icones.map((ic, k) => {
            const t0 = inst[k] ?? k;
            const p = interpolate(t, [t0, t0 + 0.7], [0, 1], cl);
            if (t < t0 || p >= 1) return null;
            const yy = y - 420 + p * 330;
            const xx = x + (k - 1) * 40 * (1 - p);
            return (
              <g key={ic} transform={`translate(${xx} ${yy}) scale(${1 - p * 0.4})`}>
                {ic === 'tel' ? (
                  <g><rect x={-28} y={-48} width={56} height={96} rx={10} fill="#343A40" stroke={OUT} strokeWidth={5} /><rect x={-20} y={-38} width={40} height={72} fill="#4CC9F0" /></g>
                ) : ic === 'ecran' ? (
                  <g><rect x={-56} y={-34} width={112} height={68} rx={8} fill="#343A40" stroke={OUT} strokeWidth={5} /><rect x={-46} y={-26} width={92} height={52} fill="#E9ECEF" /><path d="M -10 -14 L 16 0 L -10 14 Z" fill="#E63946" /></g>
                ) : (
                  <g><path d="M -50 -30 h 100 v 50 h -60 l -20 18 v -18 h -20 Z" fill="#9D4EDD" stroke={OUT} strokeWidth={5} strokeLinejoin="round" /><text y={6} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={22} fill="white">live</text></g>
                )}
              </g>
            );
          })}
          <g transform={`translate(${x} ${y})`}>
            <ellipse cx={0} cy={-80} rx={120} ry={90} fill="#FFAFCC" stroke={OUT} strokeWidth={8} />
            <circle cx={-118} cy={-90} r={26} fill="#FFAFCC" stroke={OUT} strokeWidth={7} />
            <circle cx={-126} cy={-92} r={5} fill={OUT} />
            <circle cx={-110} cy={-92} r={5} fill={OUT} />
            <circle cx={-60} cy={-120} r={9} fill={OUT} />
            <path d="M -20 -168 L 0 -200 L 20 -168" fill="#FFAFCC" stroke={OUT} strokeWidth={6} />
            <rect x={-40} y={-176} width={80} height={14} rx={7} fill={OUT} />
            {[-70, 50].map((lx) => <rect key={lx} x={lx} y={-10} width={26} height={30} rx={6} fill="#FFAFCC" stroke={OUT} strokeWidth={6} />)}
          </g>
        </g>
      );
    }
    case 'timeline': {
      // timeline de montage (x = centre, y = bas) : blocs qui glissent en place entre t et fin ; sous-titres (texte) aux instants
      const w = o.largeur ?? 560;
      const l = x - w / 2;
      const top = y - 170;
      const p = interpolate(t, [o.t ?? 0, o.fin ?? 3], [0, 1], cl);
      const blocs = [0, 1, 2, 3, 4];
      const curseur = l + 20 + ((t * 120) % (w - 40));
      return (
        <g>
          <rect x={l} y={top} width={w} height={170} rx={14} fill="#212529" stroke={OUT} strokeWidth={7} />
          {[0, 1, 2].map((r) => <rect key={r} x={l + 14} y={top + 16 + r * 48} width={w - 28} height={38} rx={6} fill="#343A40" />)}
          {blocs.map((k) => {
            const cible = l + 18 + k * ((w - 36) / 5);
            const depart = cible + (k % 2 ? 1 : -1) * 220;
            const prog = interpolate(p, [k * 0.15, k * 0.15 + 0.35], [0, 1], cl);
            const xx = depart + (cible - depart) * prog;
            return <rect key={k} x={xx} y={top + 18 + (k % 2) * 48} width={(w - 36) / 5 - 8} height={34} rx={5} fill={['#F72585', '#4CC9F0', '#80ED99', '#FFD60A', '#9D4EDD'][k]} stroke={OUT} strokeWidth={3} opacity={prog > 0 ? 1 : 0.35} />;
          })}
          {o.texte
            ? inst.map((ti, k) => (t >= ti ? (
              <g key={k}>
                <rect x={l + 18 + k * 110} y={top + 114} width={96} height={34} rx={5} fill="white" stroke={OUT} strokeWidth={3} />
                <text x={l + 66 + k * 110} y={top + 139} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={22} fill={OUT}>{o.texte}</text>
              </g>
            ) : null))
            : null}
          <rect x={curseur} y={top + 8} width={5} height={154} fill="#E63946" />
        </g>
      );
    }
    case 'globe': {
      // globe qui tourne ; points qui s'allument (États-Unis) à `allume`
      const r = o.largeur ?? 150;
      const rot = (t * 60) % 360;
      const on = o.allume !== undefined && t >= o.allume;
      return (
        <g>
          <rect x={x - 12} y={y + r - 4} width={24} height={60} fill="#8D6E63" stroke={OUT} strokeWidth={5} />
          <rect x={x - 70} y={y + r + 50} width={140} height={20} rx={8} fill="#8D6E63" stroke={OUT} strokeWidth={5} />
          <circle cx={x} cy={y} r={r} fill="#48CAE4" stroke={OUT} strokeWidth={8} />
          <clipPath id="globe18"><circle cx={x} cy={y} r={r - 4} /></clipPath>
          <g clipPath="url(#globe18)">
            {[0, 1].map((k) => {
              const dx = ((rot / 360) * 4 * r + k * 2 * r) % (4 * r) - 2 * r;
              return (
                <g key={k} transform={`translate(${x + dx} ${y})`}>
                  <path d={`M ${-r * 0.7} ${-r * 0.5} q ${r * 0.3} -${r * 0.25} ${r * 0.55} 0 q ${r * 0.05} ${r * 0.35} -${r * 0.2} ${r * 0.45} q -${r * 0.25} ${r * 0.05} -${r * 0.35} -${r * 0.45} Z`} fill="#80ED99" stroke={OUT} strokeWidth={4} />
                  <path d={`M ${r * 0.2} ${-r * 0.55} q ${r * 0.4} -${r * 0.1} ${r * 0.55} ${r * 0.2} q -${r * 0.1} ${r * 0.7} -${r * 0.3} ${r * 0.9} q -${r * 0.25} -${r * 0.5} -${r * 0.25} -${r * 1.1} Z`} fill="#80ED99" stroke={OUT} strokeWidth={4} />
                  {on ? [[-0.5, -0.35], [-0.35, -0.3], [-0.42, -0.2], [-0.25, -0.38]].map(([px, py], j) => (
                    <circle key={j} cx={r * px} cy={r * py} r={9 + 3 * Math.sin(t * 8 + j)} fill="#FFD60A" stroke={OUT} strokeWidth={3} />
                  )) : null}
                </g>
              );
            })}
          </g>
          <path d={`M ${x - r} ${y} Q ${x} ${y + r * 0.35} ${x + r} ${y}`} fill="none" stroke="white" strokeWidth={3} opacity={0.6} />
        </g>
      );
    }
    case 'video_retiree': {
      // vidéo générique (écran horizontal + bouton lecture), tampon « RETIRÉ » abattu à instants[0]
      const t0 = inst[0] ?? 1;
      const p = interpolate(t, [t0, t0 + 0.25], [0, 1], cl);
      return (
        <g>
          <rect x={x - 170} y={y - 110} width={340} height={220} rx={16} fill="#343A40" stroke={OUT} strokeWidth={8} />
          <rect x={x - 150} y={y - 92} width={300} height={184} fill={p > 0 ? '#6C757D' : '#7B2CBF'} />
          <circle cx={x} cy={y} r={44} fill="white" stroke={OUT} strokeWidth={5} />
          <path d={`M ${x - 14} ${y - 22} L ${x + 24} ${y} L ${x - 14} ${y + 22} Z`} fill="#E63946" />
          {p > 0 ? (
            <g transform={`translate(${x} ${y}) rotate(-14) scale(${1.8 - p * 0.8})`} opacity={p}>
              <rect x={-150} y={-46} width={300} height={92} rx={10} fill="rgba(255,255,255,0.85)" stroke="#E63946" strokeWidth={9} />
              <text y={22} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={60} fill="#E63946">RETIRÉ</text>
            </g>
          ) : null}
        </g>
      );
    }
    case 'pile_clips': {
      // pile de clips-icônes (petites vignettes verticales) qui monte entre t et fin
      const n = Math.round(interpolate(t, [o.t ?? 0, o.fin ?? 4], [1, o.hauteur ?? 8], cl));
      return (
        <g>
          {Array.from({length: n}).map((_, k) => (
            <g key={k} transform={`translate(${x + ((k * 23) % 30) - 15} ${y - k * 30}) rotate(${((k * 17) % 14) - 7})`}>
              <rect x={-60} y={-14} width={120} height={28} rx={6} fill={['#F72585', '#4CC9F0', '#80ED99', '#FFD60A'][k % 4]} stroke={OUT} strokeWidth={4} />
              <path d="M -8 -8 L 8 0 L -8 8 Z" fill="white" />
            </g>
          ))}
        </g>
      );
    }
    case 'graphique': {
      // graphique à barres qui montent entre t et fin
      const p = interpolate(t, [o.t ?? 0, o.fin ?? 3], [0, 1], cl);
      const hs = [0.3, 0.45, 0.55, 0.75, 1];
      return (
        <g>
          <rect x={x - 180} y={y - 300} width={360} height={300} rx={14} fill="white" stroke={OUT} strokeWidth={7} />
          {hs.map((hh, k) => {
            const bh = 240 * hh * interpolate(p, [k * 0.12, k * 0.12 + 0.5], [0, 1], cl);
            return <rect key={k} x={x - 150 + k * 62} y={y - 24 - bh} width={44} height={bh} rx={5} fill={k === 4 ? '#2DC653' : '#4CC9F0'} stroke={OUT} strokeWidth={4} />;
          })}
        </g>
      );
    }
    case 'compteur_abos': {
      // compteur d'abonnés : labels [de, à] entre t et fin
      const [a, b] = (o.labels ?? ['20', '50']).map(Number);
      const v = interpolate(t, [o.t ?? 0, o.fin ?? 3], [a, b], cl);
      const pop = 1 + 0.08 * Math.max(0, Math.sin((v % 1) * Math.PI));
      return (
        <g transform={`translate(${x} ${y}) scale(${pop})`}>
          <rect x={-150} y={-70} width={300} height={140} rx={24} fill="#9D4EDD" stroke={OUT} strokeWidth={7} />
          <circle cx={-90} cy={-14} r={22} fill="white" stroke={OUT} strokeWidth={5} />
          <path d="M -125 40 q 35 -50 70 0" fill="white" stroke={OUT} strokeWidth={5} />
          <text x={40} y={24} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={76} fill="white" stroke={OUT} strokeWidth={3}>{Math.round(v)}</text>
          <text x={0} y={112} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={34} fill="white" stroke={OUT} strokeWidth={2}>{o.texte ?? 'abonnés'}</text>
        </g>
      );
    }
    case 'bouton_abo': {
      // bouton « s'abonner » générique, cliqué à instants[0]
      const t0 = inst[0] ?? 1;
      const on = t >= t0;
      const s = on ? 1 + 0.15 * Math.max(0, 1 - (t - t0) * 4) : 1;
      return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x={-150} y={-40} width={300} height={80} rx={40} fill={on ? '#ADB5BD' : '#E63946'} stroke={OUT} strokeWidth={6} />
          <text y={14} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={36} fill="white">{on ? 'abonné ✓' : "s'abonner"}</text>
        </g>
      );
    }
    default:
      return null;
  }
};

/** Décor setup gaming : chambre de gamer, deux écrans, micro sur bras articulé, LED, console, caméra sur trépied. */
export const DecorSetupGaming: React.FC<{frame: number}> = ({frame}) => {
  const W = 1080;
  const H = 1920;
  const t = frame / 30;
  const hue = (t * 40) % 360;
  const led = `hsl(${hue} 90% 60%)`;
  const led2 = `hsl(${(hue + 120) % 360} 90% 60%)`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill="#1E1B3A" />
      <rect x={0} y={0} width={W} height={1500} fill="#2A2550" />
      {/* panneaux acoustiques */}
      {Array.from({length: 12}).map((_, k) => (
        <rect key={k} x={60 + (k % 6) * 165} y={180 + Math.floor(k / 6) * 150} width={130} height={120} rx={10} fill={k % 2 ? '#3A3270' : '#332C63'} stroke={OUT} strokeWidth={5} />
      ))}
      {/* bande LED */}
      <rect x={0} y={130} width={W} height={14} fill={led} />
      <rect x={0} y={128} width={W} height={40} fill={led} opacity={0.25} />
      <rect x={0} y={1180} width={W} height={10} fill={led2} />
      {/* étagère + console générique */}
      <rect x={760} y={520} width={280} height={20} fill="#4A4E69" stroke={OUT} strokeWidth={5} />
      <rect x={800} y={450} width={150} height={70} rx={12} fill="#F8F9FA" stroke={OUT} strokeWidth={6} />
      <rect x={815} y={470} width={60} height={8} rx={4} fill={led} />
      {/* deux écrans au fond */}
      {[[90, 620], [560, 620]].map(([sx, sy], k) => (
        <g key={k}>
          <rect x={sx} y={sy} width={420} height={250} rx={12} fill="#111" stroke={OUT} strokeWidth={8} />
          <rect x={sx + 12} y={sy + 12} width={396} height={226} fill={k ? '#2B2D42' : '#3C096C'} />
          {k === 0 ? (
            <g>
              <rect x={sx + 12} y={sy + 150} width={396} height={88} fill="#22223B" />
              <path d={`M ${sx + 190} ${sy + 150} L ${sx + 230} ${sy + 150} L ${sx + 330} ${sy + 238} L ${sx + 90} ${sy + 238} Z`} fill="#4A4E69" />
              <path d={`M ${sx + 180} ${sy + 232} l 15 -26 h 30 l 15 26 Z`} fill="#4CC9F0" stroke={OUT} strokeWidth={3} />
              {Array.from({length: 6}).map((_, j) => <rect key={j} x={sx + 20 + j * 66} y={sy + 70 + (j % 3) * 18} width={50} height={80 - (j % 3) * 18} fill="#10002B" />)}
            </g>
          ) : (
            Array.from({length: 6}).map((_, j) => {
              const yy = sy + 220 - (((t * 40 + j * 36) % 216));
              return <rect key={j} x={sx + 24} y={yy} width={200 + (j % 3) * 50} height={22} rx={11} fill={['#F72585', '#4CC9F0', '#80ED99'][j % 3]} opacity={0.85} />;
            })
          )}
          <rect x={sx + 190} y={sy + 250} width={40} height={60} fill="#343A40" stroke={OUT} strokeWidth={5} />
        </g>
      ))}
      {/* bureau */}
      <rect x={40} y={920} width={1000} height={40} rx={8} fill="#343A40" stroke={OUT} strokeWidth={7} />
      <rect x={40} y={958} width={1000} height={8} fill={led} opacity={0.8} />
      <rect x={300} y={900} width={340} height={24} rx={6} fill="#212529" stroke={OUT} strokeWidth={5} />
      {/* micro sur bras articulé */}
      <path d="M 1000 930 L 960 760 L 860 690" fill="none" stroke={OUT} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 1000 930 L 960 760 L 860 690" fill="none" stroke="#6C757D" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={810} y={640} width={56} height={110} rx={26} fill="#212529" stroke={OUT} strokeWidth={6} transform="rotate(-30 838 695)" />
      {/* caméra sur trépied */}
      <path d="M 120 1500 L 170 1100 L 220 1500 M 170 1100 L 170 1500" stroke={OUT} strokeWidth={10} fill="none" />
      <rect x={120} y={1040} width={110} height={70} rx={10} fill="#343A40" stroke={OUT} strokeWidth={6} />
      <circle cx={232} cy={1075} r={24} fill="#212529" stroke={OUT} strokeWidth={6} />
      <circle cx={140} cy={1056} r={7} fill="#E63946" opacity={0.5 + 0.5 * Math.sin(t * 5)} />
      {/* sol */}
      <rect x={0} y={1500} width={W} height={H - 1500} fill="#3D3466" />
      <ellipse cx={540} cy={1640} rx={480} ry={90} fill="#4B3F80" />
      <path d={`M 0 1500 H ${W}`} stroke={OUT} strokeWidth={8} />
    </svg>
  );
};

/** Bonnet en maille avec pompon (repère de la tête). */
export const Bonnet: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <path d="M 128 214 Q 140 40 300 34 Q 460 40 472 214 Z" fill={couleur} stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
    {[190, 245, 300, 355, 410].map((x) => <path key={x} d={`M ${x} 70 Q ${x + (x - 300) * 0.1} 140 ${x} 200`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={6} />)}
    <rect x={116} y={186} width={368} height={50} rx={22} fill={couleur} stroke={OUT} strokeWidth={9} />
    <circle cx={300} cy={26} r={34} fill="white" stroke={OUT} strokeWidth={8} />
  </g>
);

/** Écharpe enroulée au cou (repère du corps). */
export const Echarpe: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <path d="M 216 410 Q 300 470 384 410 L 390 446 Q 300 506 210 446 Z" fill={couleur} stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 330 450 L 344 580 L 300 580 L 300 460 Z" fill={couleur} stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 304 560 h 38 M 304 570 h 38" stroke="#DEE2E6" strokeWidth={4} />
  </g>
);
