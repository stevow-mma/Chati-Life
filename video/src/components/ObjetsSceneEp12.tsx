import {interpolate} from 'remotion';
import {FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';

/**
 * ep12 : objets de décor animés (volant, borne de recharge, téléphones de bord, jauge, pile de billets qui diminue,
 * façade d'hôtel) et décor `voiture` (habitacle de berline vu de côté, ville qui défile). Aucun logo, aucune marque.
 */

const OUT = '#1b1b2f';
const VERT = '#1F9D55';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Décor `voiture` : habitacle de berline noire vu de côté (vers la droite), ville qui défile derrière les vitres. */
export const DecorVoiture: React.FC<{frame: number}> = ({frame}) => {
  const defil = (frame * 9) % 1400;
  const immeubles = Array.from({length: 12}).map((_, k) => ({
    x: k * 130,
    h: 240 + ((k * 137) % 5) * 70,
    c: ['#8ECAE6', '#F4A261', '#90BE6D', '#E9C46A', '#B8C0FF', '#F28482'][k % 6],
  }));
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill="#BDE0FE" />
      {/* ville qui défile (deux copies) */}
      <g transform={`translate(${-defil} 0)`}>
        {[0, 1560].map((dx) => (
          <g key={dx}>
            {immeubles.map((b, k) => (
              <g key={k}>
                <rect x={dx + b.x} y={1000 - b.h} width={120} height={b.h + 200} fill={b.c} stroke={OUT} strokeWidth={6} />
                {Array.from({length: Math.floor(b.h / 70)}).map((_, j) => (
                  <g key={j}>
                    <rect x={dx + b.x + 18} y={1030 - b.h + j * 70} width={30} height={34} fill="#FFF3B0" stroke={OUT} strokeWidth={3} />
                    <rect x={dx + b.x + 70} y={1030 - b.h + j * 70} width={30} height={34} fill="#FFF3B0" stroke={OUT} strokeWidth={3} />
                  </g>
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* lampadaires rapides */}
      <g transform={`translate(${-((frame * 22) % 700)} 0)`}>
        {[200, 900, 1600].map((x) => (
          <g key={x}>
            <rect x={x} y={640} width={16} height={560} fill="#495057" />
            <rect x={x - 30} y={630} width={70} height={20} rx={8} fill="#495057" />
          </g>
        ))}
      </g>
      {/* carrosserie intérieure : toit, montants, portières */}
      <path d="M 0 0 H 1080 V 380 Q 900 330 560 330 Q 200 330 0 400 Z" fill="#1E1F26" />
      <rect x={0} y={1080} width={1080} height={840} fill="#24252D" />
      <path d="M 0 1080 H 1080" stroke={OUT} strokeWidth={10} />
      {/* montants de vitres */}
      <path d="M 470 340 L 500 1080" stroke="#1E1F26" strokeWidth={46} />
      <path d="M 1020 360 L 960 1080" stroke="#1E1F26" strokeWidth={60} />
      <path d="M 40 400 L 60 1080" stroke="#1E1F26" strokeWidth={56} />
      {/* contours des vitres */}
      <path d="M 70 410 Q 250 350 460 345 L 485 1075 L 80 1075 Z" fill="none" stroke={OUT} strokeWidth={8} />
      <path d="M 520 345 Q 800 345 1000 375 L 945 1075 L 520 1075 Z" fill="none" stroke={OUT} strokeWidth={8} />
      {/* poignées et vide-poches */}
      <rect x={120} y={1180} width={260} height={30} rx={14} fill="#3A3B45" stroke={OUT} strokeWidth={5} />
      <rect x={600} y={1180} width={260} height={30} rx={14} fill="#3A3B45" stroke={OUT} strokeWidth={5} />
      {/* banquette arrière et siège conducteur (dossiers) */}
      <path d="M 70 1500 L 90 940 Q 100 880 170 880 L 390 880 Q 450 880 450 950 L 440 1500 Z" fill="#33343E" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 520 1500 L 530 930 Q 540 860 610 860 L 760 860 Q 820 860 820 930 L 800 1500 Z" fill="#33343E" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
      <rect x={590} y={740} width={170} height={120} rx={40} fill="#33343E" stroke={OUT} strokeWidth={8} />
      <rect x={160} y={770} width={170} height={110} rx={40} fill="#33343E" stroke={OUT} strokeWidth={8} />
      <path d="M 0 1500 H 1080 V 1920 H 0 Z" fill="#17181D" />
    </svg>
  );
};

export const ObjetSceneEp12: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  const ins = o.instants ?? [];
  switch (o.type) {
    case 'volant': {
      // tableau de bord à droite, volant tenu par le conducteur, rétroviseur intérieur en haut
      const rot = Math.sin(t * 1.7) * 6;
      return (
        <g>
          <path d={`M ${x + 40} ${y - 120} Q ${x + 200} ${y - 200} 1080 ${y - 210} V ${y + 140} H ${x + 60} Z`} fill="#2B2C34" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
          <rect x={x + 160} y={y - 150} width={120} height={70} rx={10} fill="#0F1A2A" stroke={OUT} strokeWidth={5} />
          <path d={`M ${x + 175} ${y - 100} l 25 -20 l 25 10 l 25 -25 l 20 12`} fill="none" stroke="#4CC9F0" strokeWidth={5} />
          <rect x={x - 6} y={y - 30} width={140} height={22} rx={10} fill="#3A3B45" stroke={OUT} strokeWidth={5} transform={`rotate(-25 ${x} ${y})`} />
          <g transform={`rotate(${rot} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx={34} ry={120} fill="none" stroke={OUT} strokeWidth={26} />
            <ellipse cx={x} cy={y} rx={34} ry={120} fill="none" stroke="#3A3B45" strokeWidth={14} />
            <circle cx={x} cy={y} r={18} fill="#3A3B45" stroke={OUT} strokeWidth={5} />
          </g>
          {/* rétroviseur intérieur */}
          <rect x={x + 70} y={330} width={14} height={60} fill="#1E1F26" />
          <rect x={x + 20} y={386} width={130} height={46} rx={14} fill="#3A3B45" stroke={OUT} strokeWidth={6} />
          <rect x={x + 32} y={396} width={106} height={26} rx={9} fill="#A9D6F5" />
        </g>
      );
    }
    case 'telephones_bord': {
      // deux téléphones génériques posés sur le tableau de bord ; `labels` = pourcentages ; instants : [balaye 1, balaye 2, choix]
      const labels = o.labels ?? ['25 %', '15 %'];
      return (
        <g>
          {labels.map((lb, k) => {
            const cx = x + (k - 0.5) * 150;
            const actif = ins[k] !== undefined && t >= ins[k] && t < ins[k] + 0.9;
            const clign = actif ? (Math.floor(t * 8) % 2 ? 1 : 0.4) : 1;
            const choisi = ins[2] !== undefined && t >= ins[2] && k === labels.length - 1;
            const decal = ins[k] !== undefined ? interpolate(t, [ins[k], ins[k] + 0.4], [30, 0], cl) : 0;
            return (
              <g key={k}>
                <rect x={cx - 60} y={y - 220} width={120} height={220} rx={18} fill="#1E1F26" stroke={choisi ? VERT : OUT} strokeWidth={choisi ? 10 : 7} />
                <rect x={cx - 48} y={y - 200} width={96} height={170} rx={8} fill="#EDF2F4" />
                <rect x={cx - 34 + decal} y={y - 186} width={68} height={16} rx={6} fill="#ADB5BD" />
                <text x={cx} y={y - 100} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={40} fill={choisi ? VERT : '#E63946'} opacity={clign}>
                  {lb}
                </text>
                <rect x={cx - 30} y={y - 74} width={60} height={14} rx={6} fill="#ADB5BD" />
                {choisi ? (
                  <g>
                    <circle cx={cx + 50} cy={y - 210} r={26} fill={VERT} stroke={OUT} strokeWidth={5} />
                    <path d={`M ${cx + 38} ${y - 210} l 8 9 l 16 -18`} fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" />
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      );
    }
    case 'borne': {
      // borne de recharge générique ; câble vers la voiture ; niveau de batterie qui monte entre instants[0] et instants[1]
      const p = ins.length >= 2 ? interpolate(t, ins as [number, number], [0.2, 0.9], cl) : 0.5;
      const branche = ins[0] === undefined || t >= ins[0];
      const cible = o.largeur ?? x + 300;
      return (
        <g>
          <rect x={x - 60} y={y - 440} width={120} height={440} rx={20} fill="#F8F9FA" stroke={OUT} strokeWidth={9} />
          <rect x={x - 40} y={y - 400} width={80} height={60} rx={8} fill="#0F1A2A" stroke={OUT} strokeWidth={4} />
          <path d={`M ${x - 8} ${y - 392} l -10 24 h 16 l -8 20`} fill="none" stroke="#4CC9F0" strokeWidth={5} />
          {branche ? (
            <path d={`M ${x + 40} ${y - 260} C ${x + 160} ${y - 40} ${cible - 120} ${y - 60} ${cible} ${y - 230}`} fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
          ) : null}
          {/* batterie */}
          <g transform={`translate(${x - 70} ${y - 640})`}>
            <rect x={0} y={0} width={140} height={70} rx={12} fill="white" stroke={OUT} strokeWidth={7} />
            <rect x={140} y={22} width={14} height={26} rx={4} fill={OUT} />
            <rect x={8} y={8} width={124 * p} height={54} rx={6} fill={VERT} />
            <text x={70} y={50} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={34} fill={OUT}>
              {Math.round(p * 100)} %
            </text>
          </g>
        </g>
      );
    }
    case 'jauge_courses': {
      // jauge verticale « courses » qui se remplit entre instants[0] et instants[1]
      const p = ins.length >= 2 ? interpolate(t, ins as [number, number], [0.15, 1], cl) : 0.5;
      const h = o.hauteur ?? 360;
      return (
        <g>
          <rect x={x - 40} y={y - h} width={80} height={h} rx={20} fill="white" stroke={OUT} strokeWidth={7} />
          <rect x={x - 30} y={y - 10 - (h - 20) * p} width={60} height={(h - 20) * p} rx={14} fill={VERT} />
          <text x={x} y={y + 50} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={40} fill="white" stroke={OUT} strokeWidth={6} paintOrder="stroke">
            {o.texte ?? 'Courses'}
          </text>
        </g>
      );
    }
    case 'pile_descend': {
      // pile de billets génériques qui diminue d'un cran à chaque instant
      const n = 9 - ins.filter((s) => t >= s).length * 2;
      return (
        <g>
          {Array.from({length: Math.max(1, n)}).map((_, k) => (
            <g key={k} transform={`rotate(${((k * 7) % 9) - 4} ${x} ${y - k * 22})`}>
              <rect x={x - 70} y={y - 24 - k * 22} width={140} height={26} rx={5} fill={k % 2 ? '#95D5B2' : '#74C69D'} stroke={OUT} strokeWidth={5} />
              <circle cx={x} cy={y - 11 - k * 22} r={8} fill="none" stroke="#2D6A4F" strokeWidth={3} />
            </g>
          ))}
          {ins.map((s, k) =>
            t >= s && t < s + 0.7 ? (
              <rect key={k} x={x - 70 + (t - s) * 300} y={y - 24 - n * 22 - (t - s) * 200} width={140} height={26} rx={5} fill="#74C69D" stroke={OUT} strokeWidth={5} opacity={1 - (t - s) / 0.7} />
            ) : null,
          )}
        </g>
      );
    }
    case 'hotel': {
      // façade d'hôtel générique : enseigne « HÔTEL », porte vitrée, auvent ; porte qui s'ouvre aux instants
      const w = o.largeur ?? 520;
      const l = x - w / 2;
      const ouvert = ins.some((s) => t >= s && t < s + 0.8);
      return (
        <g>
          <rect x={l} y={y - 900} width={w} height={900} fill="#E9D8A6" stroke={OUT} strokeWidth={9} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={l + 50 + c * (w - 100) / 3} y={y - 860 + r * 130} width={(w - 100) / 3 - 30} height={90} fill="#A9D6F5" stroke={OUT} strokeWidth={5} />
            )),
          )}
          <rect x={l + 60} y={y - 470} width={w - 120} height={80} rx={12} fill="#7B1E3A" stroke={OUT} strokeWidth={7} />
          <text x={x} y={y - 412} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={58} fill="#F2C14E">
            HÔTEL
          </text>
          <path d={`M ${l + 70} ${y - 370} H ${l + w - 70} L ${l + w - 40} ${y - 320} H ${l + 40} Z`} fill="#7B1E3A" stroke={OUT} strokeWidth={6} />
          <rect x={x - 110} y={y - 320} width={220} height={320} fill="#3A3B45" stroke={OUT} strokeWidth={7} />
          <rect x={x - 100} y={y - 310} width={ouvert ? 30 : 95} height={300} fill="#CDE7F7" stroke={OUT} strokeWidth={4} />
          <rect x={ouvert ? x + 70 : x + 5} y={y - 310} width={ouvert ? 30 : 95} height={300} fill="#CDE7F7" stroke={OUT} strokeWidth={4} />
        </g>
      );
    }
    default:
      return null;
  }
};
