import {Composition} from 'remotion';
import {EPISODES} from './episodes';
import {Video} from './Video';
import {FPS} from './script';
import './fonts';
import {Ep20, EP20_DUREE} from '../episodes/ep20/Ep20';

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map((ep) => (
      <Composition
        key={ep.id}
        id={ep.id}
        component={Video}
        durationInFrames={ep.durationInFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{episode: ep}}
      />
    ))}
    <Composition id="ep20" component={Ep20} durationInFrames={EP20_DUREE} fps={FPS} width={1080} height={1920} />
  </>
);
