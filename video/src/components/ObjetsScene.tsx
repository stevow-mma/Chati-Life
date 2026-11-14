import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ObjetScene} from '../types';

/** Objets de décor animés (ep10), en coordonnées écran 1080 x 1920. Aucun logo. */

const OUT = '#1b1b2f';
const SOL = 1500;

const Bulles: React.FC<{x: number; y: number; w: number; frame: number}> = ({x, y, w, frame}) => {
  const n = 4;
  return (
    <g>
      {Array.from({length: n}).map((_, k) => {
        const decal = Math.floor(frame / 12);
        const droite = (k + decal) % 2 === 1;
        const lw = w * (0.35 + (((k + decal) * 37) % 30) / 100);
        return <rect key={k} x={droite ? x + w - lw - 8 : x + 8} y={y + 10 + k * 26} width={lw} height={16} rx={8} fill={droite ? '#FFD60A' : 'white'} />;
      })}
    </g>
  );
};

const Ordinateur: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  let ouverture = 1;
  if (o.ouvre !== undefined) ouverture = interpolate(t, [o.ouvre, o.ouvre + 0.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o.ferme !== undefined && t >= o.ferme) ouverture = Math.min(ouverture, interpolate(t, [o.ferme, o.ferme + 0.3], [1, 0], {extrapolateRight: 'clamp'}));
  const w = o.largeur ?? 220;
  const h = w * 0.62;
  const {x, y} = o;
  return (
    <g>
      {/* écran vu de face (dos de l'écran tourné vers le personnage assis derrière : l'écran est vu de face par la caméra) */}
      <g transform={`translate(0 ${y}) scale(1 ${Math.max(0.04, ouverture)}) translate(0 ${-y})`}>
        <rect x={x - w / 2} y={y - h} width={w} height={h} rx={14} fill="#343A40" stroke={OUT} strokeWidth={8} />
        <rect x={x - w / 2 + 12} y={y - h + 12} width={w - 24} height={h - 24} rx={6} fill="#CDE7F7" />
        {o.ecran === 'messages' ? (
          <Bulles x={x - w / 2 + 12} y={y - h + 12} w={w - 24} frame={frame} />
        ) : o.ecran === 'tableau' ? (
          <g>
            {[0, 1].map((k) => (
              <rect key={k} x={x - w / 2 + 24 + k * (w / 2 - 12)} y={y - h + 24} width={w / 2 - 36} height={h - 48} rx={6} fill="white" stroke="#ADB5BD" strokeWidth={3} />
            ))}
          </g>
        ) : (
          <g>
            {[0.4, 0.6, 0.5, 0.85, 0.7].map((v, k) => {
              const hb = (h - 50) * v * (0.85 + Math.sin(frame / 8 + k) * 0.15);
              return <rect key={k} x={x - w / 2 + 28 + k * ((w - 56) / 5)} y={y - 22 - hb} width={(w - 56) / 5 - 10} height={hb} rx={4} fill={k === 3 ? '#1F9D55' : '#4361EE'} />;
            })}
          </g>
        )}
      </g>
      <path d={`M ${x - w / 2 - 20} ${y} h ${w + 40} l -14 16 h ${-w - 12} z`} fill="#ADB5BD" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

export const ObjetSceneView: React.FC<{objet: ObjetScene}> = ({objet: o}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (o.t !== undefined && t < o.t) return null;
  if (o.fin !== undefined && t >= o.fin) return null;
  const pop = o.t !== undefined ? spring({frame: frame - Math.round(o.t * fps), fps, config: {damping: 11, stiffness: 200}}) : 1;
  let contenu: React.ReactNode = null;
  const {x, y} = o;
  switch (o.type) {
    case 'bureau': {
      const w = o.largeur ?? 420;
      contenu = (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={34} rx={8} fill="#E9D8C4" stroke={OUT} strokeWidth={9} />
          <rect x={x - w / 2 + 30} y={y + 34} width={22} height={SOL - y - 34} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
          <rect x={x + w / 2 - 52} y={y + 34} width={22} height={SOL - y - 34} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
        </g>
      );
      break;
    }
    case 'ordinateur':
      contenu = <Ordinateur o={o} frame={frame} fps={fps} />;
      break;
    case 'poste': {
      // poste de travail vu de face : bureau, écran de profil (bulles de messages génériques), clavier
      const w = o.largeur ?? 360;
      contenu = (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={30} rx={8} fill="#F1F3F5" stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2 + 10} y={y + 30} width={w - 20} height={SOL - y - 30} fill="#DEE2E6" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - w / 2 + 10} ${y + 90} h ${w - 20}`} stroke={OUT} strokeWidth={5} opacity={0.4} />
          {/* écran sur le côté droit du bureau (le visage de la personne assise reste visible) */}
          <rect x={x + 83} y={y - 36} width={24} height={36} fill="#495057" stroke={OUT} strokeWidth={5} />
          <rect x={x + 10} y={y - 160} width={170} height={124} rx={12} fill="#343A40" stroke={OUT} strokeWidth={8} />
          <rect x={x + 20} y={y - 150} width={150} height={104} rx={6} fill="#CDE7F7" />
          <Bulles x={x + 20} y={y - 150} w={150} frame={frame} />
          {/* clavier */}
          <rect x={x - 150} y={y - 14} width={130} height={18} rx={5} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
        </g>
      );
      break;
    }
    case 'tableau_blanc': {
      const [d0, d1] = o.trace ?? [0, 1];
      const p = interpolate(t, [d0, d1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const w = o.largeur ?? 440;
      const h = o.hauteur ?? 300;
      contenu = (
        <g>
          <path d={`M ${x - w / 2 + 40} ${y + h} L ${x - w / 2 + 10} ${SOL} M ${x + w / 2 - 40} ${y + h} L ${x + w / 2 - 10} ${SOL}`} stroke={OUT} strokeWidth={12} strokeLinecap="round" />
          <rect x={x - w / 2} y={y} width={w} height={h} rx={12} fill="white" stroke={OUT} strokeWidth={10} />
          <rect x={x - w / 2 + 14} y={y + h - 22} width={w - 28} height={12} rx={6} fill="#ADB5BD" />
          <text x={x - w / 2 + 30} y={y + 110} fontFamily={FONT_TITRE} fontSize={44} fill={OUT}>5 000</text>
          <text x={x + w / 2 - 150} y={y + 110} fontFamily={FONT_TITRE} fontSize={44} fill={OUT} opacity={p > 0.9 ? 1 : 0}>4 000</text>
          <path
            d={`M ${x - w / 2 + 70} ${y + 150} Q ${x} ${y + 240} ${x + w / 2 - 90} ${y + 150}`}
            fill="none"
            stroke="#E63946"
            strokeWidth={10}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={100 - p * 100}
          />
          {p > 0.95 ? <path d={`M ${x + w / 2 - 90} ${y + 150} l -30 2 l 14 26 z`} fill="#E63946" /> : null}
          <text x={x - 60} y={y + 250} fontFamily={FONT_TITRE} fontSize={36} fill="#E63946" opacity={p > 0.5 ? 1 : 0}>−20 %</text>
        </g>
      );
      break;
    }
    case 'calculatrice':
      contenu = (
        <g transform={`rotate(-8 ${x} ${y})`}>
          <rect x={x - 60} y={y - 150} width={120} height={150} rx={14} fill="#495057" stroke={OUT} strokeWidth={8} />
          <rect x={x - 46} y={y - 136} width={92} height={38} rx={5} fill="#B7E4C7" />
          <text x={x + 40} y={y - 106} textAnchor="end" fontFamily={FONT_TITRE} fontSize={28} fill={OUT}>{o.affiche ?? ''}</text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x - 46 + c * 32} y={y - 88 + r * 28} width={26} height={20} rx={4} fill="#DEE2E6" />),
          )}
        </g>
      );
      break;
    case 'pile_billets': {
      const n = Math.round(interpolate(t, [o.t ?? 0, o.fin ?? (o.t ?? 0) + 3], [0, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
      const nMax = Math.round(interpolate(t, [o.t ?? 0, (o.t ?? 0) + 3.2], [1, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
      contenu = (
        <g>
          {Array.from({length: Math.max(n, nMax)}).map((_, k) => (
            <g key={k} transform={`rotate(${((k * 7) % 9) - 4} ${x} ${y - k * 22})`}>
              <rect x={x - 70} y={y - 24 - k * 22} width={140} height={26} rx={5} fill={k % 2 ? '#95D5B2' : '#74C69D'} stroke={OUT} strokeWidth={5} />
              <circle cx={x} cy={y - 11 - k * 22} r={8} fill="none" stroke="#2D6A4F" strokeWidth={3} />
            </g>
          ))}
        </g>
      );
      break;
    }
    case 'escalier': {
      const marches = o.marches ?? [];
      const w = o.largeur ?? 210;
      const hm = o.hauteur ?? 100;
      const couleurs = ['#90E0EF', '#48CAE4', '#1F9D55'];
      contenu = (
        <g>
          {marches.map((m, k) => {
            const apparition = spring({frame: frame - 6 - k * 8, fps, config: {damping: 12, stiffness: 180}});
            const mx = x + k * w;
            const top = y - (k + 1) * hm;
            return (
              <g key={k} transform={`translate(0 ${(1 - apparition) * 300})`}>
                <rect x={mx} y={top} width={w + 4} height={SOL - top} fill={couleurs[k % 3]} stroke={OUT} strokeWidth={9} />
                <text x={mx + w / 2} y={top + 46} textAnchor="middle" fontFamily={FONT_TEXTE} fontSize={30} fill={OUT}>{m.label}</text>
                {m.petit ? <text x={mx + w / 2} y={top + 84} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={34} fill={k === 2 ? 'white' : OUT}>{m.petit}</text> : null}
              </g>
            );
          })}
        </g>
      );
      break;
    }
    case 'ecran_mural': {
      const w = o.largeur ?? 520;
      const h = o.hauteur ?? 300;
      const suspendu = o.variante === 'suspendu';
      const clign = suspendu && Math.floor(frame / 8) % 2 === 0;
      contenu = (
        <g>
          <rect x={x - w / 2} y={y} width={w} height={h} rx={16} fill="#212529" stroke={OUT} strokeWidth={10} />
          <rect x={x - w / 2 + 16} y={y + 16} width={w - 32} height={h - 32} rx={8} fill={suspendu ? (clign ? '#E63946' : '#C1121F') : '#E9F5FB'} />
          {suspendu ? (
            <g>
              <rect x={x - 40} y={y + 110} width={80} height={70} rx={10} fill="white" stroke={OUT} strokeWidth={6} />
              <path d={`M ${x - 24} ${y + 110} v -22 a 24 24 0 0 1 48 0 v 22`} fill="none" stroke="white" strokeWidth={12} />
              <text x={x} y={y + 240} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={48} fill="white">0 €</text>
            </g>
          ) : (
            <g>
              {/* document + balance de la justice, génériques */}
              <rect x={x - 180} y={y + 50} width={130} height={170} rx={8} fill="white" stroke={OUT} strokeWidth={6} />
              {[0, 1, 2, 3, 4].map((k) => (
                <rect key={k} x={x - 162} y={y + 76 + k * 26} width={k === 4 ? 50 : 94} height={10} rx={5} fill="#ADB5BD" />
              ))}
              <g transform={`rotate(${Math.sin(frame / 14) * 5} ${x + 110} ${y + 90})`}>
                <path d={`M ${x + 30} ${y + 90} H ${x + 190}`} stroke={OUT} strokeWidth={8} strokeLinecap="round" />
                {[x + 40, x + 180].map((px) => (
                  <g key={px}>
                    <path d={`M ${px} ${y + 90} L ${px - 26} ${y + 150} M ${px} ${y + 90} L ${px + 26} ${y + 150}`} stroke={OUT} strokeWidth={4} />
                    <path d={`M ${px - 34} ${y + 150} Q ${px} ${y + 180} ${px + 34} ${y + 150} Z`} fill="#FFD60A" stroke={OUT} strokeWidth={5} />
                  </g>
                ))}
              </g>
              <rect x={x + 102} y={y + 90} width={16} height={130} fill={OUT} />
              <rect x={x + 60} y={y + 216} width={100} height={16} rx={6} fill={OUT} />
            </g>
          )}
          <rect x={x - 30} y={y + h} width={60} height={30} fill="#495057" stroke={OUT} strokeWidth={6} />
        </g>
      );
      break;
    }
    case 'pastilles_bureau': {
      const couleurs = ['#4361EE', '#1F9D55', '#FF70A6'];
      contenu = (
        <g>
          {couleurs.map((c, k) => {
            const prise = o.prises?.[k];
            if (prise !== undefined && t >= prise) return null;
            return (
              <g key={k}>
                <ellipse cx={x + (k - 1) * 90} cy={y - 14} rx={38} ry={16} fill="rgba(0,0,0,0.2)" />
                <circle cx={x + (k - 1) * 90} cy={y - 34} r={32} fill={c} stroke={OUT} strokeWidth={6} />
                <circle cx={x + (k - 1) * 90 - 10} cy={y - 44} r={8} fill="white" opacity={0.6} />
              </g>
            );
          })}
        </g>
      );
      break;
    }
    default:
      contenu = null;
  }
  return (
    <svg
      viewBox="0 0 1080 1920"
      width={1080}
      height={1920}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `scale(${pop})`, transformOrigin: `${x}px ${y}px`}}
    >
      {contenu}
    </svg>
  );
};
