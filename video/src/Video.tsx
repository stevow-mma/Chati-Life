import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import type {EpisodeData} from './episodes';
import {PlanScene} from './PlanScene';

export const Video: React.FC<{episode: EpisodeData}> = ({episode}) => (
  <AbsoluteFill style={{backgroundColor: '#111'}}>
    {episode.piste ? <Audio src={staticFile(episode.piste)} /> : null}
    <Series>
      {episode.plans.map((plan, i) => (
        <Series.Sequence key={i} durationInFrames={episode.frames[i]} name={`Plan ${i + 1} · ${plan.decor}`}>
          <PlanScene plan={plan} personnage={episode.personnage} premier={i === 0 && episode.piste !== null} muet={episode.muet} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
