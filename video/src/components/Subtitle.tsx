import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE} from '../fonts';

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9'’]/g, '');

/** Nombre de frames pour faire apparaître tout le texte mot à mot. */
export const revealFrames = (texte: string, fps: number, duration: number) => {
  const words = texte.split(/\s+/).length;
  return Math.min(Math.round(words * 0.22 * fps), Math.round(duration * 0.6));
};

export const Subtitle: React.FC<{
  texte: string;
  motJaune: string | null;
  /** Durée (frames) de l'apparition mot à mot. 1 = tout d'un coup. */
  revealDuration: number;
  /** Si défini : le mot jaune fait un "punch" à partir de cette frame (hook). */
  punchFrom: number | null;
  /** Frame d'apparition de chaque mot (calée sur la voix). Prioritaire sur revealDuration. */
  starts?: number[] | null;
  /** ep07 : seule la n-ième occurrence (1 = la première) du mot jaune est en jaune. Défaut : toutes. */
  rangJaune?: number | null;
}> = ({texte, motJaune, revealDuration, punchFrom, starts, rangJaune = null}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const words = texte.split(/\s+/).filter(Boolean);
  const yellow = new Set((motJaune ?? '').split(/\s+/).map(normalize).filter(Boolean));
  // indices des mots jaunes (toutes les occurrences, ou seulement la n-ième si rangJaune)
  const indicesJaunes = words.map((w, i) => (yellow.has(normalize(w)) ? i : -1)).filter((i) => i >= 0);
  const jaunes = new Set(rangJaune ? indicesJaunes.slice(rangJaune - 1, rangJaune) : indicesJaunes);
  const perWord = revealDuration / Math.max(words.length, 1);
  const fontSize = words.length > 10 ? 78 : 92;

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1555,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        columnGap: '0.28em',
        rowGap: 4,
        fontFamily: FONT_TEXTE,
        fontSize,
        lineHeight: 1.12,
        letterSpacing: 1.5,
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => {
        const start = starts?.[i] ?? (revealDuration <= 1 ? 0 : Math.round(i * perWord));
        const isYellow = jaunes.has(i);
        const pop = spring({
          frame: frame - (isYellow && punchFrom !== null ? punchFrom : start),
          fps,
          config: {damping: 11, stiffness: 260},
        });
        const visible = frame >= start;
        const scale = interpolate(pop, [0, 1], [isYellow ? 1.8 : 0.6, 1]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: visible ? 1 : 0,
              transform: `scale(${scale}) rotate(${isYellow ? -3 : 0}deg)`,
              color: isYellow ? '#FFD60A' : 'white',
              WebkitTextStroke: '13px black',
              paintOrder: 'stroke fill',
              textShadow: '0 8px 0 rgba(0,0,0,0.35)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
