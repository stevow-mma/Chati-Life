import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Decor} from './components/Decor';
import {ElementVisuelView} from './components/ElementVisuel';
import {Etiquette} from './components/Etiquette';
import {Max} from './components/Max';
import {Subtitle, revealFrames} from './components/Subtitle';
import type {Accessoire, Plan} from './types';

export const PlanScene: React.FC<{plan: Plan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Mot rotatif (hook) : {mot} change toutes les `intervalle` secondes, le dernier reste.
  const ev = plan.element_visuel;
  let mot: string | null = null;
  let motIndex = 0;
  let motStart = 0;
  let accessoire: Accessoire = null;
  if (ev?.type === 'mots_rotatifs' && ev.mots.length > 0) {
    const step = Math.round((ev.intervalle ?? 1) * fps);
    motIndex = Math.min(Math.floor(frame / step), ev.mots.length - 1);
    motStart = motIndex * step;
    mot = ev.mots[motIndex];
    accessoire = ev.accessoires?.[motIndex] ?? null;
  }
  const texte = mot ? plan.texte.replace('{mot}', mot) : plan.texte;
  const motJaune = plan.mot_jaune === '{mot}' ? mot : plan.mot_jaune;
  const isRotating = mot !== null;

  // "Punch" d'entrée à chaque coupe (et à chaque changement de mot du hook).
  const punchFrom = isRotating ? motStart : 0;
  const punch = spring({frame: frame - punchFrom, fps, config: {damping: 14, stiffness: 220}});
  const sceneScale = interpolate(punch, [0, 1], [1.1, 1]);
  const flash = interpolate(frame - punchFrom, [0, 4], [0.55, 0], {extrapolateRight: 'clamp'});

  const reveal = isRotating ? 1 : revealFrames(texte, fps, durationInFrames);
  const talking = isRotating ? frame - motStart < 18 : frame < reveal + 4;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${sceneScale})`}}>
        <Decor nom={plan.decor} variante={motIndex} />

        {/* Max : centre de l'écran */}
        <div
          style={{
            position: 'absolute',
            left: (1080 - 560) / 2,
            top: 690,
            width: 560,
            height: 840,
          }}
        >
          <Max expression={plan.expression} talking={talking} accessoire={accessoire} />
        </div>

        {/* Élément visuel : zone haute */}
        {ev && ev.type !== 'mots_rotatifs' ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 320, height: 440}}>
            <ElementVisuelView element={ev} />
          </div>
        ) : null}
      </AbsoluteFill>

      {plan.etiquette ? <Etiquette texte={plan.etiquette} /> : null}

      <Subtitle
        texte={texte}
        motJaune={motJaune}
        revealDuration={reveal}
        punchFrom={isRotating ? motStart : null}
      />

      <AbsoluteFill style={{backgroundColor: 'white', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
