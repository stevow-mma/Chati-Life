import {interpolate, spring} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';

/**
 * Objets de décor animés ajoutés en ep11 (coordonnées écran 1080 x 1920). Aucun logo, aucune marque :
 * flacons et produits génériques, voiture sans logo ni plaque lisible.
 */

const OUT = '#1b1b2f';
const SOL = 1500;
const VERT = '#1F9D55';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Coche: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <g>
    <circle cx={x} cy={y} r={22} fill={VERT} stroke={OUT} strokeWidth={5} opacity={p > 0 ? 1 : 0} transform={`translate(${x} ${y}) scale(${0.4 + 0.6 * p}) translate(${-x} ${-y})`} />
    <path d={`M ${x - 10} ${y + 1} l 7 8 l 14 -16`} fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - p * 100} />
  </g>
);

export const ObjetSceneEp11: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  switch (o.type) {
    case 'porte': {
      const w = o.largeur ?? 210;
      const h = o.hauteur ?? 440;
      const p = o.ouvre !== undefined ? interpolate(t, [o.ouvre, o.ouvre + 0.5], [0, 1], cl) : 0;
      const sx = 1 - p * 0.82;
      return (
        <g>
          <rect x={x - w / 2 - 16} y={y - h - 16} width={w + 32} height={h + 16} fill="#F8F9FA" stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#3D3D55" />
          <g transform={`translate(${x - w / 2} 0) scale(${sx} 1) translate(${-(x - w / 2)} 0)`}>
            <rect x={x - w / 2} y={y - h} width={w} height={h} fill={o.couleur ?? '#BC8A5F'} stroke={OUT} strokeWidth={7} />
            <rect x={x - w / 2 + 26} y={y - h + 30} width={w - 52} height={h * 0.36} rx={6} fill="none" stroke={OUT} strokeWidth={4} opacity={0.5} />
            <rect x={x - w / 2 + 26} y={y - h * 0.52} width={w - 52} height={h * 0.4} rx={6} fill="none" stroke={OUT} strokeWidth={4} opacity={0.5} />
            <circle cx={x + w / 2 - 28} cy={y - h * 0.5} r={11} fill="#E9C46A" stroke={OUT} strokeWidth={4} />
          </g>
        </g>
      );
    }
    case 'meches': {
      // mèches coupées qui tombent sous les ciseaux
      const c = o.couleur ?? '#7B4A2D';
      return (
        <g>
          {Array.from({length: 7}).map((_, k) => {
            const per = 1.1;
            const ph = ((t + k * 0.37) % per) / per;
            const mx = x + Math.sin(k * 2.3) * 50 + Math.sin(ph * 6 + k) * 14;
            const my = y + ph * 260;
            return <path key={k} d={`M ${mx} ${my} q 8 10 0 22`} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" opacity={1 - ph * 0.6} transform={`rotate(${ph * 160 + k * 40} ${mx} ${my + 11})`} />;
          })}
          {/* petit tas au sol qui grossit */}
          <ellipse cx={x} cy={SOL - 4} rx={20 + Math.min(40, t * 6)} ry={8} fill={c} opacity={0.75} />
        </g>
      );
    }
    case 'voiture': {
      // citadine générique de profil (vers la droite), sans logo ni plaque lisible ; coffre à gauche, portière passager
      const w = o.largeur ?? 560;
      const c = o.couleur ?? '#8ECAE6';
      const l = x - w / 2;
      const coffre = o.ouvre !== undefined ? interpolate(t, [o.ouvre, o.ouvre + 0.5], [0, 1], cl) : 0;
      const porte = o.ouvre_porte !== undefined ? interpolate(t, [o.ouvre_porte, o.ouvre_porte + 0.5], [0, 1], cl) : 0;
      const by = y - 70; // bas de caisse
      return (
        <g>
          <path d={`M ${l} ${by} L ${l} ${by - 150} Q ${l + 10} ${by - 170} ${l + 60} ${by - 175} L ${l + 140} ${by - 300} Q ${l + 160} ${by - 316} ${l + 200} ${by - 316} L ${l + 380} ${by - 316} Q ${l + 420} ${by - 312} ${l + 450} ${by - 270} L ${l + 500} ${by - 190} Q ${l + w} ${by - 170} ${l + w} ${by - 120} L ${l + w} ${by} Z`} fill={c} stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
          {/* vitres */}
          <path d={`M ${l + 160} ${by - 186} L ${l + 196} ${by - 290} L ${l + 286} ${by - 290} L ${l + 286} ${by - 186} Z`} fill="#CDE7F7" stroke={OUT} strokeWidth={6} />
          <path d={`M ${l + 304} ${by - 186} L ${l + 304} ${by - 290} L ${l + 380} ${by - 290} Q ${l + 410} ${by - 286} ${l + 430} ${by - 250} L ${l + 470} ${by - 186} Z`} fill="#CDE7F7" stroke={OUT} strokeWidth={6} />
          {/* portière passager (avant), qui s'ouvre vers la caméra */}
          <g transform={`translate(${l + 480} 0) scale(${1 - porte * 0.55} 1) translate(${-(l + 480)} 0)`}>
            <path d={`M ${l + 296} ${by - 4} L ${l + 296} ${by - 190} L ${l + 480} ${by - 190} L ${l + 480} ${by - 4} Z`} fill={porte > 0 ? c : 'none'} stroke={OUT} strokeWidth={6} />
            <rect x={l + 310} y={by - 150} width={40} height={12} rx={5} fill={OUT} opacity={0.6} />
          </g>
          {porte > 0 ? <path d={`M ${l + 296} ${by - 4} L ${l + 296} ${by - 186} L ${l + 296 + (184 * (1 - porte * 0.55)) * 0} ${by - 186}`} stroke={OUT} strokeWidth={4} /> : null}
          {/* coffre (hayon) qui se lève */}
          <g transform={`rotate(${coffre * 62} ${l + 80} ${by - 175})`}>
            <path d={`M ${l - 4} ${by - 40} L ${l - 4} ${by - 150} Q ${l + 10} ${by - 172} ${l + 80} ${by - 175} L ${l + 80} ${by - 40} Z`} fill={c} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
            <rect x={l + 8} y={by - 120} width={30} height={14} rx={4} fill="#E63946" stroke={OUT} strokeWidth={3} />
          </g>
          {coffre > 0.3 ? <rect x={l + 4} y={by - 150} width={70} height={110} fill="#3D3D55" opacity={Math.min(1, (coffre - 0.3) * 3)} /> : null}
          {/* plaque vierge, phare */}
          <rect x={l + w - 30} y={by - 120} width={26} height={30} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={4} />
          {/* roues */}
          {[l + 110, l + w - 110].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={by} r={62} fill="#2B2D42" stroke={OUT} strokeWidth={8} />
              <circle cx={cx} cy={by} r={28} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
            </g>
          ))}
        </g>
      );
    }
    case 'agenda_mural': {
      const w = o.largeur ?? 520;
      const h = o.hauteur ?? 380;
      const cols = 5;
      const rows = 4;
      const cw = (w - 40) / cols;
      const ch = (h - 90) / rows;
      const ordre = [6, 12, 2, 17, 9, 0, 14, 4, 19, 11, 7, 15, 1, 18, 5, 10, 13, 3, 16, 8];
      const deja = o.deja ?? 0;
      const instants = o.instants ?? [];
      const remplies = new Map<number, number>();
      ordre.slice(0, deja).forEach((c) => remplies.set(c, -1));
      instants.forEach((ti, k) => {
        const c = ordre[deja + k];
        if (c !== undefined && t >= ti) remplies.set(c, ti);
      });
      const couleurs = ['#FFD60A', '#FF8FAB', '#90E0EF', '#B7E4C7'];
      return (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={h} rx={14} fill="white" stroke={OUT} strokeWidth={9} />
          <rect x={x - w / 2} y={y} width={w} height={64} rx={14} fill="#E63946" stroke={OUT} strokeWidth={9} />
          <text x={x} y={y + 46} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={36} fill="white">{o.texte ?? 'RENDEZ-VOUS'}</text>
          {Array.from({length: cols * rows}).map((_, c) => {
            const cx = x - w / 2 + 20 + (c % cols) * cw;
            const cy = y + 76 + Math.floor(c / cols) * ch;
            const ti = remplies.get(c);
            const s = ti === undefined ? 0 : ti < 0 ? 1 : spring({frame: frame - Math.round(ti * fps), fps, config: {damping: 9, stiffness: 220}});
            return (
              <g key={c}>
                <rect x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6} rx={6} fill="#F1F3F5" stroke="#ADB5BD" strokeWidth={3} />
                {ti !== undefined ? (
                  <g transform={`translate(${cx + cw / 2} ${cy + ch / 2}) scale(${s}) rotate(${((c * 13) % 9) - 4})`}>
                    <rect x={-cw / 2 + 8} y={-ch / 2 + 8} width={cw - 16} height={ch - 16} rx={4} fill={couleurs[c % 4]} stroke={OUT} strokeWidth={4} />
                    <path d={`M ${-cw / 2 + 18} -4 h ${cw - 40} M ${-cw / 2 + 18} 10 h ${cw - 56}`} stroke={OUT} strokeWidth={3} opacity={0.4} />
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      );
    }
    case 'chrono': {
      // horloge murale qui fait un tour entre instants[0] et instants[1], libellé dessous
      const [d0, d1] = o.instants ?? [0, 2];
      const p = interpolate(t, [d0, d1], [0, 1], cl);
      const r = o.largeur ?? 70;
      const actif = t >= d0 && t <= d1 + 0.3;
      const ang = p * 360 * (o.hauteur ?? 1);
      return (
        <g>
          <circle cx={x} cy={y} r={r + 10} fill={actif ? '#FFD60A' : '#DEE2E6'} stroke={OUT} strokeWidth={8} />
          <circle cx={x} cy={y} r={r - 4} fill="white" stroke={OUT} strokeWidth={4} />
          <path d={`M ${x} ${y} L ${x} ${y - r + 6} A ${r - 6} ${r - 6} 0 ${p > 0.5 ? 1 : 0} 1 ${x + Math.sin((p * 360 * Math.PI) / 180) * (r - 6)} ${y - Math.cos((p * 360 * Math.PI) / 180) * (r - 6)} Z`} fill="#FFE5A0" opacity={p > 0 && p < 1 ? 1 : p >= 1 ? 1 : 0} />
          {Array.from({length: 12}).map((_, k) => (
            <path key={k} d={`M ${x + Math.sin((k * Math.PI) / 6) * (r - 14)} ${y - Math.cos((k * Math.PI) / 6) * (r - 14)} L ${x + Math.sin((k * Math.PI) / 6) * (r - 4)} ${y - Math.cos((k * Math.PI) / 6) * (r - 4)}`} stroke={OUT} strokeWidth={4} />
          ))}
          <path d={`M ${x} ${y} L ${x + Math.sin((ang * Math.PI) / 180) * (r - 14)} ${y - Math.cos((ang * Math.PI) / 180) * (r - 14)}`} stroke="#E63946" strokeWidth={7} strokeLinecap="round" />
          <circle cx={x} cy={y} r={7} fill={OUT} />
          <rect x={x - 80} y={y + r + 18} width={160} height={50} rx={14} fill={OUT} />
          <text x={x} y={y + r + 54} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={34} fill="white">{o.texte ?? ''}</text>
        </g>
      );
    }
    case 'recus': {
      // reçus qui s'envolent d'une pile et se rangent en ligne, puis sont cochés
      const labels = o.labels ?? [];
      const n = labels.length;
      const ecart = o.largeur ?? 150;
      return (
        <g>
          {/* pile restante */}
          {Array.from({length: Math.max(0, n - (o.instants ?? []).filter((ti) => t >= ti).length) + 1}).map((_, k) => (
            <rect key={k} x={x - 60} y={y - 16 - k * 9} width={120} height={14} rx={3} fill={k % 2 ? '#FFFDF2' : '#F1F3F5'} stroke={OUT} strokeWidth={4} transform={`rotate(${((k * 5) % 7) - 3} ${x} ${y - k * 9})`} />
          ))}
          {labels.map((lab, k) => {
            const ti = o.instants?.[k];
            if (ti === undefined || t < ti) return null;
            const p = interpolate(t, [ti, ti + 0.45], [0, 1], cl);
            // rangés en grille de deux colonnes, à partir de (hauteur, y − 70)
            const tx = (o.hauteur ?? x + 170) + (k % 2) * ecart;
            const ty = y - 70 - Math.floor(k / 2) * 104;
            const px = x + (tx - x) * p;
            const py = y - 30 + (ty - (y - 30)) * p - Math.sin(p * Math.PI) * 160;
            const rot = (1 - p) * 300 + ((k % 2) * 2 - 1) * 4;
            const coche = o.coches?.[k];
            const pc = coche !== undefined ? interpolate(t, [coche, coche + 0.25], [0, 1], cl) : 0;
            return (
              <g key={k}>
                <g transform={`rotate(${rot} ${px} ${py})`}>
                  <rect x={px - 66} y={py - 44} width={132} height={88} rx={6} fill="#FFFDF2" stroke={OUT} strokeWidth={5} />
                  <path d={`M ${px - 66} ${py + 44} l 11 -8 l 11 8 l 11 -8 l 11 8 l 11 -8 l 11 8 l 11 -8 l 11 8 l 11 -8 l 11 8 l 11 -8 l 11 8`} fill="none" stroke={OUT} strokeWidth={3} />
                  <text x={px} y={py - 8} textAnchor="middle" fontFamily={FONT_TEXTE} fontSize={lab.length > 10 ? 20 : 23} fill={OUT}>{lab}</text>
                  <path d={`M ${px - 44} ${py + 14} h 88 M ${px - 44} ${py + 28} h 60`} stroke="#ADB5BD" strokeWidth={4} />
                </g>
                {pc > 0 ? <Coche x={px + 58} y={py - 40} p={pc} /> : null}
              </g>
            );
          })}
        </g>
      );
    }
    case 'etagere_flacons': {
      const w = o.largeur ?? 420;
      const h = o.hauteur ?? 560;
      const couleurs = ['#8ECAE6', '#FFB4A2', '#B7E4C7', '#CDB4DB', '#FFE066'];
      return (
        <g>
          <rect x={x - w / 2} y={y - h} width={w} height={h} rx={8} fill="#E9D8C4" stroke={OUT} strokeWidth={9} />
          {[0, 1, 2].map((r) => {
            const sy = y - h + 40 + (r + 1) * ((h - 60) / 3);
            return (
              <g key={r}>
                {Array.from({length: 5}).map((_, k) => {
                  const bx = x - w / 2 + 50 + k * ((w - 100) / 4);
                  const bh = 70 + ((k + r) % 3) * 16;
                  const c = couleurs[(k + r * 2) % 5];
                  return (
                    <g key={k}>
                      <rect x={bx - 8} y={sy - bh - 18} width={16} height={18} rx={3} fill="#495057" stroke={OUT} strokeWidth={3} />
                      <rect x={bx - 24} y={sy - bh} width={48} height={bh} rx={12} fill={c} stroke={OUT} strokeWidth={5} />
                      <rect x={bx - 16} y={sy - bh * 0.7} width={32} height={bh * 0.35} rx={4} fill="white" />
                    </g>
                  );
                })}
                <rect x={x - w / 2} y={sy} width={w} height={16} fill="#BC8A5F" stroke={OUT} strokeWidth={6} />
              </g>
            );
          })}
        </g>
      );
    }
    case 'comptoir': {
      const w = o.largeur ?? 460;
      const bip = (o.instants ?? []).some((ti) => t >= ti && t < ti + 0.25);
      return (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={SOL - y + 10} fill="#2E9E6A" stroke={OUT} strokeWidth={9} />
          <rect x={x - w / 2 - 14} y={y - 20} width={w + 28} height={30} rx={8} fill="#F1F3F5" stroke={OUT} strokeWidth={8} />
          <path d={`M ${x - w / 2 + 30} ${y + 70} h ${w - 60}`} stroke="#237A52" strokeWidth={8} />
          {/* scanner à plat + écran du total */}
          <rect x={x - 70} y={y - 34} width={140} height={18} rx={6} fill={bip ? '#E63946' : '#343A40'} stroke={OUT} strokeWidth={5} />
          {bip ? <rect x={x - 60} y={y - 60} width={120} height={28} fill="#FF4D6D" opacity={0.45} /> : null}
          <rect x={x + w / 2 - 120} y={y - 120} width={96} height={70} rx={8} fill="#343A40" stroke={OUT} strokeWidth={6} />
          <rect x={x + w / 2 - 110} y={y - 110} width={76} height={36} rx={4} fill="#B7E4C7" />
          <rect x={x + w / 2 - 78} y={y - 50} width={12} height={32} fill="#495057" />
        </g>
      );
    }
    case 'facade': {
      // façade de maison : mur, porte (s'ouvre à `ouvre`), sonnette qui s'allume à `instants[0]`
      const w = o.largeur ?? 300;
      const top = o.hauteur ?? 900;
      const p = o.ouvre !== undefined ? interpolate(t, [o.ouvre, o.ouvre + 0.5], [0, 1], cl) : 0;
      const sonne = o.instants?.some((ti) => t >= ti && t < ti + 0.6);
      return (
        <g>
          <rect x={x - w / 2} y={top} width={w} height={SOL - top} fill={o.couleur ?? '#F4D6B5'} stroke={OUT} strokeWidth={8} />
          <path d={`M ${x - w / 2 - 20} ${top} L ${x} ${top - 110} L ${x + w / 2 + 20} ${top} Z`} fill="#C1666B" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
          <rect x={x - 80} y={SOL - 330} width={160} height={330} fill="#3D3D55" stroke={OUT} strokeWidth={7} />
          <g transform={`translate(${x - 80} 0) scale(${1 - p * 0.8} 1) translate(${-(x - 80)} 0)`}>
            <rect x={x - 80} y={SOL - 330} width={160} height={330} fill="#457B9D" stroke={OUT} strokeWidth={7} />
            <circle cx={x + 56} cy={SOL - 170} r={9} fill="#E9C46A" stroke={OUT} strokeWidth={3} />
          </g>
          <rect x={x + 96} y={SOL - 200} width={22} height={30} rx={5} fill="white" stroke={OUT} strokeWidth={4} />
          <circle cx={x + 107} cy={SOL - 185} r={6} fill={sonne ? '#FFD60A' : '#ADB5BD'} />
          {sonne ? <path d={`M ${x + 128} ${SOL - 200} q 12 15 0 30 M ${x + 140} ${SOL - 206} q 18 21 0 42`} fill="none" stroke="#FFD60A" strokeWidth={5} strokeLinecap="round" /> : null}
          <rect x={x - 60} y={top + 60} width={120} height={100} fill="#CDE7F7" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x} ${top + 60} v 100 M ${x - 60} ${top + 110} h 120`} stroke={OUT} strokeWidth={4} />
        </g>
      );
    }
    case 'fenetre': {
      // pan de mur avec une fenêtre ouverte (à dessiner devant le personnage qui s'y penche)
      const w = o.largeur ?? 360;
      const top = o.hauteur ?? 900;
      const hx = x - 120;
      const hy = top + 70;
      const hw = 240;
      const hh = 250;
      const mur = `M ${x - w / 2} ${top} H ${x + w / 2} V ${SOL} H ${x - w / 2} Z M ${hx} ${hy} V ${hy + hh} H ${hx + hw} V ${hy} Z`;
      return (
        <g>
          <path d={`M ${x - w / 2 - 20} ${top} L ${x} ${top - 100} L ${x + w / 2 + 20} ${top} Z`} fill="#6D9DC5" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
          <path d={mur} fill={o.couleur ?? '#F7E1A1'} fillRule="evenodd" stroke={OUT} strokeWidth={8} />
          {/* volets ouverts */}
          <rect x={hx - 70} y={hy} width={62} height={hh} fill="#2A9D8F" stroke={OUT} strokeWidth={6} />
          <rect x={hx + hw + 8} y={hy} width={62} height={hh} fill="#2A9D8F" stroke={OUT} strokeWidth={6} />
          <rect x={hx - 16} y={hy + hh} width={hw + 32} height={20} rx={4} fill="#E9ECEF" stroke={OUT} strokeWidth={6} />
          {/* jardinière */}
          <rect x={hx + 20} y={hy + hh + 20} width={hw - 40} height={40} rx={8} fill="#BC6C25" stroke={OUT} strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={hx + 50 + k * 46} cy={hy + hh + 14} r={14} fill={k % 2 ? '#FF70A6' : '#FFD60A'} stroke={OUT} strokeWidth={4} />
          ))}
          <rect x={x - 70} y={SOL - 300} width={140} height={300} fill="#8D6E63" stroke={OUT} strokeWidth={7} />
        </g>
      );
    }
    case 'panneau_tarifs': {
      // panneau de tarifs accroché au mur (descend et se balance à son apparition)
      const w = o.largeur ?? 300;
      const h = o.hauteur ?? 260;
      const t0 = o.t ?? 0;
      const s = spring({frame: frame - Math.round(t0 * fps), fps, config: {damping: 6, stiffness: 120}});
      const rot = (1 - s) * 14 * Math.cos((frame - t0 * fps) / 3);
      const lignes = o.labels ?? ['Coupe 35 €', 'Coupe + brushing 45 €', 'Couleur 90 €'];
      return (
        <g transform={`rotate(${rot} ${x} ${y - 40})`}>
          <path d={`M ${x} ${y - 40} L ${x - w / 3} ${y} M ${x} ${y - 40} L ${x + w / 3} ${y}`} stroke={OUT} strokeWidth={4} />
          <circle cx={x} cy={y - 40} r={7} fill={OUT} />
          <rect x={x - w / 2} y={y} width={w} height={h} rx={12} fill="#2B2D42" stroke="#BC8A5F" strokeWidth={12} />
          <text x={x} y={y + 54} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={40} fill="#FFD60A">{o.texte ?? 'TARIFS'}</text>
          {lignes.map((l, k) => (
            <text key={k} x={x} y={y + 108 + k * 46} textAnchor="middle" fontFamily={FONT_TEXTE} fontSize={30} fill="white">{l}</text>
          ))}
        </g>
      );
    }
    case 'balance': {
      // balance à plateau : pastilles posées une à une (instants), affichage qui monte, pastille « Prix » qui s'allume
      const labels = o.labels ?? ['Cotisations', 'Produits', 'Trajet'];
      const couleurs = ['#4361EE', '#FF70A6', '#1F9D55'];
      const posees = (o.instants ?? []).filter((ti) => t >= ti).length;
      const enfonce = posees * 6;
      const allume = o.allume !== undefined && t >= o.allume;
      const pa = o.allume !== undefined ? spring({frame: frame - Math.round(o.allume * fps), fps, config: {damping: 8, stiffness: 200}}) : 0;
      return (
        <g>
          <rect x={x - 110} y={y - 120} width={220} height={120} rx={18} fill="#ADB5BD" stroke={OUT} strokeWidth={8} />
          <rect x={x - 70} y={y - 96} width={140} height={46} rx={6} fill="#B7E4C7" stroke={OUT} strokeWidth={4} />
          <text x={x} y={y - 60} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={32} fill={OUT}>{'+'.repeat(posees) || '0'}</text>
          <rect x={x - 16} y={y - 150 + enfonce} width={32} height={34} fill="#6C757D" stroke={OUT} strokeWidth={5} />
          <ellipse cx={x} cy={y - 150 + enfonce} rx={150} ry={22} fill="#DEE2E6" stroke={OUT} strokeWidth={7} />
          {labels.map((lab, k) => {
            const ti = o.instants?.[k];
            if (ti === undefined || t < ti) return null;
            const s = spring({frame: frame - Math.round(ti * fps), fps, config: {damping: 9, stiffness: 220}});
            const py = y - 150 + enfonce - 28 - k * 44;
            return (
              <g key={k} transform={`translate(0 ${(1 - s) * -120})`}>
                <rect x={x - 112} y={py - 22} width={224} height={44} rx={22} fill={couleurs[k % 3]} stroke={OUT} strokeWidth={5} />
                <text x={x} y={py + 11} textAnchor="middle" fontFamily={FONT_TEXTE} fontSize={28} fill="white">{lab}</text>
              </g>
            );
          })}
          {o.allume !== undefined ? (
            <g transform={`translate(${x + 230} ${y - 200}) scale(${allume ? 0.9 + pa * 0.1 : 0.9})`}>
              {allume ? <circle cx={0} cy={0} r={96 + Math.sin(frame / 4) * 6} fill="#FFD60A" opacity={0.35} /> : null}
              <circle cx={0} cy={0} r={74} fill={allume ? VERT : '#CED4DA'} stroke={OUT} strokeWidth={8} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={40} fill="white">PRIX</text>
            </g>
          ) : null}
        </g>
      );
    }
    case 'meuble_tiroir': {
      const w = o.largeur ?? 240;
      const p = o.ouvre !== undefined ? interpolate(t, [o.ouvre, o.ouvre + 0.35], [0, 1], cl) : 0;
      return (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={SOL - y} fill="#D4A373" stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2 + 16} y={y + 130} width={w - 32} height={90} rx={6} fill="#C08552" stroke={OUT} strokeWidth={6} />
          <g transform={`translate(0 ${p * 26}) scale(1 1)`}>
            <rect x={x - w / 2 + 16 - p * 14} y={y + 24} width={w - 32 + p * 28} height={90 + p * 16} rx={6} fill="#C08552" stroke={OUT} strokeWidth={6} />
            <rect x={x - 30} y={y + 58 + p * 8} width={60} height={14} rx={6} fill="#6C584C" stroke={OUT} strokeWidth={4} />
          </g>
        </g>
      );
    }
    case 'papier_tampon': {
      const ti = o.instants?.[0];
      const p = ti !== undefined ? spring({frame: frame - Math.round(ti * fps), fps, config: {damping: 10, stiffness: 260}}) : 0;
      return (
        <g transform={`rotate(-4 ${x} ${y})`}>
          <rect x={x - 80} y={y - 100} width={160} height={110} rx={4} fill="white" stroke={OUT} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M ${x - 62} ${y - 80 + k * 18} h ${k === 3 ? 60 : 124}`} stroke="#ADB5BD" strokeWidth={4} />
          ))}
          {ti !== undefined && t >= ti ? (
            <g transform={`translate(${x + 20} ${y - 40}) scale(${2 - p}) rotate(-14)`} opacity={Math.min(1, p * 1.5)}>
              <rect x={-58} y={-26} width={116} height={52} rx={8} fill="none" stroke="#E63946" strokeWidth={6} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={36} fill="#E63946">{o.texte ?? 'OK'}</text>
            </g>
          ) : null}
        </g>
      );
    }
    case 'trousse_sol':
      // trousse de matériel posée au sol (même trousse que l'objet tenu `trousse`)
      return (
        <g>
          <ellipse cx={x} cy={y + 4} rx={92} ry={14} fill="rgba(0,0,0,0.2)" />
          <path d={`M ${x - 30} ${y - 104} Q ${x} ${y - 146} ${x + 30} ${y - 104}`} fill="none" stroke={OUT} strokeWidth={10} />
          <rect x={x - 86} y={y - 106} width={172} height={106} rx={20} fill="#2A9D8F" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - 70} ${y - 80} H ${x + 70}`} stroke="#E9ECEF" strokeWidth={4} strokeDasharray="6 4" />
          <rect x={x - 60} y={y - 56} width={120} height={40} rx={8} fill="#21867A" stroke={OUT} strokeWidth={4} />
        </g>
      );
    case 'chaise_simple': {
      // chaise de cuisine en bois (chez une cliente), derrière une personne assise
      const c = o.couleur ?? '#BC8A5F';
      return (
        <g>
          <rect x={x - 112} y={y - 430} width={26} height={430} rx={8} fill={c} stroke={OUT} strokeWidth={7} />
          <rect x={x + 86} y={y - 430} width={26} height={430} rx={8} fill={c} stroke={OUT} strokeWidth={7} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={x - 100} y={y - 410 + k * 70} width={200} height={34} rx={8} fill={c} stroke={OUT} strokeWidth={6} />
          ))}
          <rect x={x - 140} y={y - 130} width={280} height={34} rx={10} fill={c} stroke={OUT} strokeWidth={8} />
          <rect x={x - 130} y={y - 96} width={22} height={96} rx={6} fill={c} stroke={OUT} strokeWidth={6} />
          <rect x={x + 108} y={y - 96} width={22} height={96} rx={6} fill={c} stroke={OUT} strokeWidth={6} />
        </g>
      );
    }
    case 'chaise_coiffure': {
      // fauteuil de coiffure (pied hydraulique), derrière une cliente assise
      const c = o.couleur ?? '#2B2D42';
      return (
        <g>
          <rect x={x - 120} y={y - 440} width={240} height={330} rx={46} fill={c} stroke={OUT} strokeWidth={9} />
          <rect x={x - 150} y={y - 132} width={300} height={44} rx={18} fill={c} stroke={OUT} strokeWidth={9} />
          <rect x={x - 170} y={y - 230} width={40} height={110} rx={14} fill={c} stroke={OUT} strokeWidth={7} />
          <rect x={x + 130} y={y - 230} width={40} height={110} rx={14} fill={c} stroke={OUT} strokeWidth={7} />
          <rect x={x - 18} y={y - 88} width={36} height={70} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
          <ellipse cx={x} cy={y - 12} rx={110} ry={20} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
        </g>
      );
    }
    default:
      return null;
  }
};
