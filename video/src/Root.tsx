import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS, loadScript, planFrames} from './script';
import './fonts';

const plans = loadScript();
const total = plans.reduce((acc, p) => acc + planFrames(p), 0);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Prototype"
    component={Video}
    durationInFrames={total}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{plans}}
  />
);
