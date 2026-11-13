import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ElementVisuel} from '../types';

const OUT = '#1b1b2f';

const formatFr = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const usePop = (delay = 4) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 200}});
};

const Card: React.FC<{children: React.ReactNode; rotate?: number}> = ({children, rotate = -2}) => {
  const pop = usePop();
  return (
    <div
      style={{
        transform: `scale(${pop}) rotate(${rotate}deg)`,
        background: 'white',
        border: `10px solid ${OUT}`,
        borderRadius: 40,
        boxShadow: '0 18px 0 rgba(0,0,0,0.3)',
        padding: '36px 56px',
        textAlign: 'center',
        minWidth: 640,
      }}
    >
      {children}
    </div>
  );
};

const CompteurVues: React.FC<{valeur: number; legende?: string}> = ({valeur, legende}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [6, 6 + fps * 1.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const eased = 1 - Math.pow(1 - t, 3);
  const done = t >= 1;
  const bump = done ? spring({frame: frame - 6 - fps * 1.6, fps, config: {damping: 8}}) : 0;
  return (
    <Card>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, justifyContent: 'center'}}>
        <svg width={120} height={86} viewBox="0 0 120 86">
          <rect x={4} y={4} width={112} height={78} rx={22} fill="#E63946" stroke={OUT} strokeWidth={7} />
          <path d="M 48 24 L 80 43 L 48 62 Z" fill="white" />
        </svg>
        <div
          style={{
            fontFamily: FONT_TITRE,
            fontSize: 110,
            color: OUT,
            lineHeight: 1,
            paddingTop: 16,
            transform: `scale(${1 + bump * 0.08 * (done ? Math.max(0, 1 - (frame - 54) / 20) : 0)})`,
          }}
        >
          {formatFr(valeur * eased)}
        </div>
      </div>
      {legende ? (
        <div style={{fontFamily: FONT_TEXTE, fontSize: 56, color: '#6C757D', marginTop: 4}}>{legende}</div>
      ) : null}
    </Card>
  );
};

/** Taille du chiffre selon sa longueur, pour que la carte tienne dans l'écran. */
const tailleChiffre = (valeur: string) => {
  const n = valeur.length;
  if (n <= 8) return 170;
  if (n <= 11) return 140;
  if (n <= 15) return 112;
  return 92;
};

const CarteChiffre: React.FC<{valeur: string; legende?: string; source?: string}> = ({valeur, legende, source}) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 5) * 2;
  // "0,50 – 1,50 $ / 1 000 vues" : le chiffre en gros, l'unité "/ …" en dessous
  const [chiffre, ...unite] = valeur.split(' / ');
  return (
    <Card rotate={2}>
      <div style={{maxWidth: 860}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: tailleChiffre(chiffre), color: '#2D6A4F', lineHeight: 1.05, paddingTop: 20, transform: `rotate(${wobble}deg)`}}>
          {chiffre}
        </div>
        {unite.length ? (
          <div style={{fontFamily: FONT_TITRE, fontSize: 70, color: '#2D6A4F', lineHeight: 1, marginTop: 6}}>/ {unite.join(' / ')}</div>
        ) : null}
        {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 60, color: OUT, marginTop: 8}}>{legende}</div> : null}
        {source ? (
          <div
            style={{
              fontFamily: FONT_TEXTE,
              fontSize: 34,
              color: '#6C757D',
              marginTop: 22,
              borderTop: '4px dashed #CED4DA',
              paddingTop: 14,
            }}
          >
            {source}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

/** Écran de téléphone vertical, interface stylisée (pas de logo officiel). */
const EcranTelephone: React.FC<{plateforme?: string}> = ({plateforme}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const yt = plateforme === 'youtube';
  const nom = yt ? 'YouTube Shorts' : plateforme === 'tiktok' ? 'TikTok' : plateforme ?? '';
  const accent = yt ? '#FF0033' : '#25F4EE';
  const accent2 = yt ? '#FFFFFF' : '#FE2C55';
  const scroll = (frame * 3) % 120;
  const like = 1 + Math.max(0, Math.sin(frame / 5)) * 0.15;
  return (
    <div style={{transform: `scale(${pop}) rotate(${Math.sin(frame / 10) * 3}deg)`}}>
      <svg width={230} height={337} viewBox="0 0 300 440">
        <rect x={8} y={8} width={284} height={424} rx={44} fill="#222" stroke={OUT} strokeWidth={10} />
        <clipPath id="ecran"><rect x={26} y={30} width={248} height={380} rx={26} /></clipPath>
        <g clipPath="url(#ecran)">
          <rect x={26} y={30} width={248} height={380} fill="#111" />
          {/* vidéos qui défilent */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={26} y={30 + i * 120 - scroll} width={248} height={112} fill={i % 2 ? '#3A0CA3' : '#4361EE'} opacity={0.55} />
          ))}
          <path d="M 130 190 l 50 30 l -50 30 z" fill="white" opacity={0.9} />
          {/* colonne d'icônes */}
          <g transform={`translate(240 230) scale(${like})`}>
            <path d="M 0 8 C -14 -8 -26 6 0 24 C 26 6 14 -8 0 8 Z" fill={accent2} stroke={OUT} strokeWidth={3} />
          </g>
          <circle cx={240} cy={290} r={14} fill="white" opacity={0.85} />
          <circle cx={240} cy={340} r={14} fill="white" opacity={0.85} />
          {/* barre du bas */}
          <rect x={26} y={370} width={248} height={40} fill="#000" />
          <rect x={130} y={378} width={40} height={24} rx={8} fill={accent} />
          <rect x={136} y={378} width={28} height={24} rx={6} fill={accent2} />
        </g>
        <rect x={120} y={16} width={60} height={10} rx={5} fill="#444" />
      </svg>
      <div
        style={{
          fontFamily: FONT_TITRE,
          fontSize: 58,
          color: 'white',
          textAlign: 'center',
          marginTop: -6,
          WebkitTextStroke: '10px black',
          paintOrder: 'stroke fill',
        }}
      >
        {nom}
      </div>
    </div>
  );
};

/** Chronomètre : les secondes défilent jusqu'à la valeur, puis l'aiguille clignote. */
const Chrono: React.FC<{valeur: string}> = ({valeur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [m, sec] = valeur.split(':').map((x) => parseInt(x, 10) || 0);
  const cible = m * 60 + sec;
  const t = interpolate(frame, [6, 6 + fps * 1.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const now = Math.round(cible * (1 - Math.pow(1 - t, 2)));
  const txt = `${Math.floor(now / 60)}:${String(now % 60).padStart(2, '0')}`;
  const done = t >= 1;
  const angle = (now / Math.max(cible, 1)) * 360;
  return (
    <Card rotate={-3}>
      <div style={{display: 'flex', alignItems: 'center', gap: 36, justifyContent: 'center'}}>
        <svg width={200} height={230} viewBox="0 0 200 230">
          <rect x={80} y={4} width={40} height={30} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
          <circle cx={100} cy={130} r={90} fill={done && Math.floor(frame / 6) % 2 ? '#FFD60A' : 'white'} stroke={OUT} strokeWidth={10} />
          <path d={`M 100 130 L 100 54 A 76 76 0 ${angle > 180 ? 1 : 0} 1 ${100 + Math.sin((angle * Math.PI) / 180) * 76} ${130 - Math.cos((angle * Math.PI) / 180) * 76} Z`} fill="#E63946" opacity={0.85} />
          <line x1={100} y1={130} x2={100 + Math.sin((angle * Math.PI) / 180) * 70} y2={130 - Math.cos((angle * Math.PI) / 180) * 70} stroke={OUT} strokeWidth={9} strokeLinecap="round" />
          <circle cx={100} cy={130} r={12} fill={OUT} />
        </svg>
        <div style={{fontFamily: FONT_TITRE, fontSize: 170, color: OUT, lineHeight: 1, paddingTop: 24}}>{txt}</div>
      </div>
    </Card>
  );
};

/** Jauge horizontale qui se remplit jusqu'à `valeur` %. */
const Jauge: React.FC<{valeur: number; legende?: string}> = ({valeur, legende}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [8, 8 + fps * 1.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = valeur * (1 - Math.pow(1 - t, 3));
  const W = 700;
  return (
    <Card rotate={-2}>
      <div style={{fontFamily: FONT_TITRE, fontSize: 150, color: '#E63946', lineHeight: 1, paddingTop: 18}}>{Math.round(v)} %</div>
      <div style={{position: 'relative', width: W, height: 90, margin: '18px auto 0', borderRadius: 45, border: `9px solid ${OUT}`, background: '#E9ECEF', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: 'repeating-linear-gradient(-45deg, #FFD60A 0 26px, #F4A261 26px 52px)', borderRight: `9px solid ${OUT}`}} />
        <div style={{position: 'absolute', left: '50%', top: -10, bottom: -10, borderLeft: `6px dashed ${OUT}`, opacity: 0.4}} />
      </div>
      {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 56, color: '#6C757D', marginTop: 10}}>{legende}</div> : null}
    </Card>
  );
};

/** Pile de billets qui fond comme une glace au soleil. */
const BilletsFondent: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = usePop();
  const melt = interpolate(frame, [fps * 0.6, durationInFrames - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pile = 6;
  return (
    <div style={{transform: `scale(${pop})`}}>
      <svg width={520} height={420} viewBox="0 0 520 420">
        {/* flaque verte qui s'étale */}
        <ellipse cx={260} cy={380} rx={120 + melt * 130} ry={22 + melt * 18} fill="#52B788" stroke={OUT} strokeWidth={8} />
        {Array.from({length: pile}).map((_, i) => {
          const gone = melt * pile > pile - 1 - i + 0.5; // le haut fond en premier
          const h = 46 * (1 - Math.min(1, Math.max(0, melt * pile - (pile - 1 - i))));
          const y = 360 - (i + 1) * 46 + (46 - h);
          if (gone && h < 4) return null;
          return (
            <g key={i}>
              <rect x={120 + (i % 2) * 10} y={y} width={260} height={Math.max(h, 4)} rx={8} fill="#95D5B2" stroke={OUT} strokeWidth={7} />
              {h > 24 ? <circle cx={250 + (i % 2) * 10} cy={y + h / 2} r={14} fill="#52B788" stroke={OUT} strokeWidth={5} /> : null}
            </g>
          );
        })}
        {/* gouttes */}
        {[0, 1, 2, 3].map((k) => {
          const dy = ((frame * 4 + k * 30) % 90);
          return melt > 0.05 ? (
            <path key={k} d={`M ${150 + k * 70} ${300 + dy} q 10 16 0 24 q -10 -8 0 -24 z`} fill="#52B788" stroke={OUT} strokeWidth={4} opacity={1 - dy / 90} />
          ) : null;
        })}
        {/* soleil */}
        <g transform={`rotate(${frame * 2} 450 70)`}>
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={446} y={10} width={8} height={24} rx={4} fill="#FFB703" transform={`rotate(${i * 45} 450 70)`} />
          ))}
        </g>
        <circle cx={450} cy={70} r={34} fill="#FFD60A" stroke={OUT} strokeWidth={6} />
      </svg>
    </div>
  );
};

const Icone: React.FC<{nom: string}> = ({nom}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const bounce = Math.abs(Math.sin(frame / 6)) * -30;
  if (nom === 'billets_fondent') return <BilletsFondent />;
  if (nom === 'question') {
    return (
      <div style={{transform: `scale(${pop}) translateY(${bounce}px)`}}>
        <svg width={460} height={420} viewBox="0 0 460 420">
          <path d="M 40 40 h 380 a 30 30 0 0 1 30 30 v 220 a 30 30 0 0 1 -30 30 h -200 l -80 80 v -80 h -100 a 30 30 0 0 1 -30 -30 v -220 a 30 30 0 0 1 30 -30 z"
            fill="white" stroke={OUT} strokeWidth={12} strokeLinejoin="round" />
          <text x={230} y={275} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={240} fill="#FFD60A" stroke={OUT} strokeWidth={10} paintOrder="stroke">
            ?
          </text>
        </svg>
      </div>
    );
  }
  // icône générique : billet
  return (
    <div style={{transform: `scale(${pop}) translateY(${bounce}px)`}}>
      <svg width={420} height={240} viewBox="0 0 420 240">
        <rect x={10} y={10} width={400} height={220} rx={24} fill="#95D5B2" stroke={OUT} strokeWidth={12} />
        <circle cx={210} cy={120} r={60} fill="#52B788" stroke={OUT} strokeWidth={8} />
        <text x={210} y={150} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={90} fill="white">€</text>
      </svg>
    </div>
  );
};

export const ElementVisuelView: React.FC<{element: ElementVisuel}> = ({element}) => {
  let inner: React.ReactNode = null;
  switch (element.type) {
    case 'compteur_vues':
      inner = <CompteurVues valeur={element.valeur} legende={element.legende} />;
      break;
    case 'carte_chiffre':
      inner = <CarteChiffre valeur={element.valeur} legende={element.legende} source={element.source} />;
      break;
    case 'icone':
      inner = <Icone nom={element.nom} />;
      break;
    case 'ecran_telephone':
      inner = <EcranTelephone plateforme={element.plateforme} />;
      break;
    case 'chrono':
      inner = <Chrono valeur={element.valeur} />;
      break;
    case 'jauge':
      inner = <Jauge valeur={element.valeur} legende={element.legende} />;
      break;
    default:
      inner = null;
  }
  return (
    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {inner}
    </div>
  );
};
