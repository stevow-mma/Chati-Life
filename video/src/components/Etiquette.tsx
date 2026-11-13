import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TITRE} from '../fonts';

const COULEURS: Record<string, {bg: string; fg: string}> = {
  MAIS: {bg: '#E63946', fg: 'white'},
  ATTENTION: {bg: '#FFD60A', fg: '#111'},
};

/** Étiquette de pivot qui "claque" en haut de l'écran. */
export const Etiquette: React.FC<{texte: string}> = ({texte}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const label = texte.toUpperCase();
  const c = COULEURS[label] ?? {bg: '#7B2CBF', fg: 'white'};

  const slam = spring({frame: frame - 3, fps, config: {damping: 9, stiffness: 300}});
  const scale = interpolate(slam, [0, 1], [3, 1]);
  const shake = frame > 3 && frame < 14 ? Math.sin(frame * 2.2) * 8 : 0;
  const stripes = label === 'ATTENTION';

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
