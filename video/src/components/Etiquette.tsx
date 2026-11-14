import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TITRE} from '../fonts';

const COULEURS: Record<string, {bg: string; fg: string}> = {
  MAIS: {bg: '#E63946', fg: 'white'},
  ATTENTION: {bg: '#FFD60A', fg: '#111'},
  'RÈGLE N°1': {bg: '#0077B6', fg: 'white'},
  'EN CLAIR': {bg: '#06D6A0', fg: '#111'},
  'PLAN B': {bg: '#FF70A6', fg: 'white'},
  POURQUOI: {bg: '#F77F00', fg: 'white'},
  SUITE: {bg: '#7B2CBF', fg: 'white'},
  'TON AVIS': {bg: '#4361EE', fg: 'white'},
  // ep07 : leviers, fond vert à bandes noires (même style que PIÈGE)
  'LEVIER N°1': {bg: '#1F9D55', fg: 'white'},
  'LEVIER N°2': {bg: '#1F9D55', fg: 'white'},
  'LEVIER N°3': {bg: '#1F9D55', fg: 'white'},
  // ep08 : leviers 4 et 5
  'LEVIER N°4': {bg: '#1F9D55', fg: 'white'},
  'LEVIER N°5': {bg: '#1F9D55', fg: 'white'},
};

/** Étiquettes jaunes à bandes noires (même style que ATTENTION). */
const RAYEES = new Set(['ATTENTION', 'PIÈGE N°1', 'PIÈGE N°2', 'PIÈGE N°3', 'CONSEIL', 'LEVIER N°1', 'LEVIER N°2', 'LEVIER N°3', 'LEVIER N°4', 'LEVIER N°5']);

/** Étiquette de pivot qui "claque" en haut de l'écran. */
export const Etiquette: React.FC<{texte: string}> = ({texte}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const label = texte.toUpperCase();
  const stripes = RAYEES.has(label);
  const c = COULEURS[label] ?? (stripes ? COULEURS.ATTENTION : {bg: '#7B2CBF', fg: 'white'});

  const slam = spring({frame: frame - 3, fps, config: {damping: 9, stiffness: 300}});
  const scale = interpolate(slam, [0, 1], [3, 1]);
  const shake = frame > 3 && frame < 14 ? Math.sin(frame * 2.2) * 8 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 90,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: frame >= 3 ? 1 : 0,
      }}
    >
      <div
        style={{
          transform: `translateX(${shake}px) scale(${scale}) rotate(-5deg)`,
          background: stripes
            ? `repeating-linear-gradient(-45deg, ${c.bg} 0 34px, #111 34px 52px)`
            : c.bg,
          padding: stripes ? 14 : 0,
          borderRadius: 24,
          border: '10px solid #111',
          boxShadow: '0 14px 0 rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            background: c.bg,
            color: c.fg,
            fontFamily: FONT_TITRE,
            fontSize: 104,
            lineHeight: 1,
            padding: '30px 54px 14px',
            borderRadius: 12,
            letterSpacing: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
