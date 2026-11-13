import {Composition} from 'remotion';
import {EPISODES} from './episodes';
import {Video} from './Video';
import {FPS} from './script';
import './fonts';

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
  </>
);
