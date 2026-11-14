import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ElementVisuel} from '../types';
import {Glisse} from './ElementsEp10';

/** Éléments visuels ajoutés en ep11 (glissent depuis le côté et rebondissent, comme ceux d'ep10). */

const OUT = '#1b1b2f';
const VERT = '#1F9D55';

type MotFrame = (mot: string) => number | undefined;
const frameDe = (motFrame: MotFrame | undefined, mot: string | undefined, defaut: number) => (mot && motFrame ? (motFrame(mot) ?? defaut) : defaut);

const Mention: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'inline-block', marginTop: 10, background: '#FFF3B0', border: `4px solid ${OUT}`, borderRadius: 14, padding: '4px 14px 0', fontSize: 26}}>{children}</div>
);
const Source: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontSize: 24, color: '#6C757D', marginTop: 8, lineHeight: 1.15}}>{children}</div>;

const BarresComparees: React.FC<{el: Extract<ElementVisuel, {type: 'barres_comparees'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...el.barres.map((b) => b.valeur));
  const debuts = el.barres.map((b, i) => frameDe(motFrame, b.au_mot, 10 + i * 40));
  const tous = frame >= Math.max(...debuts) + 20;
  return (
    <Glisse>
      <div style={{width: 940, background: 'white', border: `10px solid ${OUT}`, borderRadius: 38, boxShadow: '0 16px 0 rgba(0,0,0,0.3)', padding: '22px 34px 16px', transform: 'rotate(-1.5deg)', fontFamily: FONT_TEXTE, color: OUT, textAlign: 'center'}}>
        {el.titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 46, paddingTop: 6, marginBottom: 8}}>{el.titre}</div> : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {el.barres.map((b, i) => {
            const p = spring({frame: frame - debuts[i], fps, config: {damping: 12, stiffness: 90}});
            const meilleure = b.valeur === max && tous;
            return (
              <div key={i} style={{textAlign: 'left', opacity: frame >= debuts[i] ? 1 : 0.25}}>
                <div style={{fontSize: 32, marginBottom: 4}}>{b.label}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{flex: 1, height: 64, background: '#E9ECEF', border: `6px solid ${OUT}`, borderRadius: 18, overflow: 'hidden'}}>
                    <div style={{width: `${(b.valeur / max) * 100 * Math.max(0, p)}%`, height: '100%', background: meilleure ? VERT : '#4CC9F0', borderRight: p > 0.02 ? `5px solid ${OUT}` : undefined}} />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_TITRE,
                      fontSize: 52,
                      minWidth: 210,
                      textAlign: 'right',
                      color: meilleure ? VERT : OUT,
                      transform: meilleure ? `scale(${1 + Math.max(0, Math.sin((frame - debuts[i]) / 5)) * 0.04})` : undefined,
                      whiteSpace: 'nowrap',
                      paddingTop: 8,
                    }}
                  >
                    {b.texte}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {el.mention ? <Mention>{el.mention}</Mention> : null}
        {el.source ? <Source>{el.source}</Source> : null}
      </div>
    </Glisse>
  );
};

const AdditionPastilles: React.FC<{el: Extract<ElementVisuel, {type: 'addition_pastilles'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const couleurs = ['#4361EE', '#FF70A6', '#F77F00'];
  const debuts = el.pastilles.map((p, i) => frameDe(motFrame, p.au_mot, 10 + i * 25));
  const dRes = frameDe(motFrame, el.resultat.au_mot, Math.max(...debuts) + 25);
  const allume = frame >= dRes;
  const sRes = spring({frame: frame - dRes, fps, config: {damping: 7, stiffness: 200}});
  return (
    <Glisse sens={-1}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT_TEXTE}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: `10px solid ${OUT}`, borderRadius: 40, padding: '22px 26px', boxShadow: '0 16px 0 rgba(0,0,0,0.3)'}}>
          {el.pastilles.map((p, i) => {
            const s = spring({frame: frame - debuts[i], fps, config: {damping: 9, stiffness: 220}});
            const visible = frame >= debuts[i];
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                {i > 0 ? <div style={{fontFamily: FONT_TITRE, fontSize: 56, opacity: visible ? 1 : 0.2, paddingTop: 10}}>+</div> : null}
                <div style={{transform: `translateY(${(1 - s) * -90}px) scale(${visible ? 1 : 0.8})`, opacity: visible ? 1 : 0.2, background: couleurs[i % 3], color: 'white', border: `6px solid ${OUT}`, borderRadius: 40, padding: '14px 20px 6px', fontSize: 34, whiteSpace: 'nowrap'}}>{p.texte}</div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 18}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 70, color: 'white', WebkitTextStroke: `4px ${OUT}`, paintOrder: 'stroke fill', paddingTop: 10, opacity: allume ? 1 : 0.4}}>=</div>
          <div
            style={{
              transform: `scale(${allume ? interpolate(sRes, [0, 1], [0.7, 1]) : 0.7})`,
              background: allume ? VERT : '#CED4DA',
              color: 'white',
              border: `8px solid ${OUT}`,
              borderRadius: 60,
              padding: '18px 48px 8px',
              fontFamily: FONT_TITRE,
              fontSize: 64,
              boxShadow: allume ? `0 0 ${30 + Math.sin(frame / 4) * 12}px 14px rgba(255,214,10,0.8)` : '0 10px 0 rgba(0,0,0,0.3)',
            }}
          >
            {el.resultat.texte}
          </div>
        </div>
        {el.mention ? <Mention>{el.mention}</Mention> : null}
      </div>
    </Glisse>
  );
};

export const ElementEp11: React.FC<{element: ElementVisuel; motFrame?: MotFrame}> = ({element, motFrame}) => {
  switch (element.type) {
    case 'barres_comparees':
      return <BarresComparees el={element} motFrame={motFrame} />;
    case 'addition_pastilles':
      return <AdditionPastilles el={element} motFrame={motFrame} />;
    default:
      return null;
  }
};
