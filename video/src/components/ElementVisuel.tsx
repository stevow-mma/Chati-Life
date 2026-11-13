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

const CarteChiffre: React.FC<{valeur: string; legende?: string; source: string}> = ({valeur, legende, source}) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 5) * 2;
  return (
    <Card rotate={2}>
      <div style={{fontFamily: FONT_TITRE, fontSize: 170, color: '#2D6A4F', lineHeight: 1, paddingTop: 20, transform: `rotate(${wobble}deg)`}}>
        {valeur}
      </div>
      {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 60, color: OUT, marginTop: 8}}>{legende}</div> : null}
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
    </Card>
  );
};

const Icone: React.FC<{nom: string}> = ({nom}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const bounce = Math.abs(Math.sin(frame / 6)) * -30;
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
    default:
      inner = null;
  }
  return (
    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {inner}
    </div>
  );
};
