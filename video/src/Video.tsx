import {AbsoluteFill, Series} from 'remotion';
import {PlanScene} from './PlanScene';
import {planFrames} from './script';
import type {Plan} from './types';

export const Video: React.FC<{plans: Plan[]}> = ({plans}) => (
  <AbsoluteFill style={{backgroundColor: '#111'}}>
    <Series>
      {plans.map((plan, i) => (
        <Series.Sequence key={i} durationInFrames={planFrames(plan)} name={`Plan ${i + 1} · ${plan.decor}`}>
          <PlanScene plan={plan} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
