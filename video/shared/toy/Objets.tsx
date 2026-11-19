import React from 'react';
import {Grad, Reflet, Yeux, OmbreSol, plast, clair, fonce, flotte, rebond, respire, prog, ease, easeOut, lerp, clamp, useGid, FONT, INK, STICKER, pop} from './base';

export type ActS = {nom: string; debut: number; fin: number};
export type ObjProps = {t: number; acts: ActS[]};
export const pa = (acts: ActS[], nom: string, t: number) => {
  const a = acts.find((x) => x.nom === nom);
  if (!a) return 0;
  return prog(t, a.debut, a.fin);
};
export const ta = (acts: ActS[], nom: string, def = 999) => acts.find((x) => x.nom === nom)?.debut ?? def;

/** Conteneur de sujet : flotte (±12 px), respire, ombre au sol floue. */
export const Sujet: React.FC<{x: number; y: number; w: number; h: number; t: number; phase?: number; sq?: [number, number]; rot?: number; k?: number; flottant?: boolean; ombre?: boolean; sol?: number; children: React.ReactNode}> = ({
  x, y, w, h, t, phase = 0, sq = [1, 1], rot = 0, k = 1, flottant = true, ombre = true, sol, children,
}) => {
  const f = flottant ? flotte(t, phase) : 0;
  const [rx, ry] = respire(t, phase);
  return (
    <>
      {ombre && <OmbreSol x={x} y={sol ?? y + (h * k) / 2 + 28} w={w * 0.7 * k} k={1 - f / 120} />}
      <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2 + f, width: w, height: h, transform: `rotate(${rot}deg) scale(${k * sq[0] * rx}, ${k * sq[1] * ry})`, transformOrigin: '50% 100%'}}>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{overflow: 'visible'}}>{children}</svg>
      </div>
    </>
  );
};

const Txt: React.FC<{x: number; y: number; s: number; c?: string; children: React.ReactNode; a?: 'middle' | 'start'}> = ({x, y, s, c = INK, children, a = 'middle'}) => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={800} fontSize={s} fill={c} textAnchor={a} dominantBaseline="middle">{children}</text>
);

// ---------------- maison ----------------
export const Maison: React.FC<{t: number; villa?: number; seed?: number}> = ({t, villa = 0, seed = 1}) => {
  const g = useGid('m');
  const ail = villa * 120;
  return (
    <g>
      <defs><Grad id={g + 'a'} c="#FBEBD0" /><Grad id={g + 'b'} c="#D9573B" /><Grad id={g + 'c'} c="#6FB7E8" /><Grad id={g + 'd'} c="#9A5B3A" /></defs>
      {villa > 0 && (
        <g>
          <rect x={20 - ail * 0.2} y={250} width={110 + ail * 0.3} height={170} rx={20} {...plast(g + 'a', '#FBEBD0')} />
          <rect x={330 - ail * 0.1} y={250} width={110 + ail * 0.3} height={170} rx={20} {...plast(g + 'a', '#FBEBD0')} />
          <rect x={360} y={290} width={50} height={50} rx={10} {...plast(g + 'c', '#6FB7E8')} opacity={villa} />
          <rect x={45} y={290} width={50} height={50} rx={10} {...plast(g + 'c', '#6FB7E8')} opacity={villa} />
        </g>
      )}
      <rect x={300} y={60} width={44} height={90} rx={8} {...plast(g + 'b', '#C24A33')} />
      <rect x={90} y={190} width={280} height={235} rx={28} {...plast(g + 'a', '#FBEBD0')} />
      <path d="M60 205 Q55 190 70 180 L215 70 Q230 58 245 70 L390 180 Q405 190 400 205 Q398 218 380 216 L80 216 Q62 218 60 205 Z" {...plast(g + 'b', '#D9573B')} />
      <Reflet cx={170} cy={130} rx={50} ry={14} rot={-35} o={0.45} />
      <rect x={196} y={318} width={68} height={107} rx={30} {...plast(g + 'd', '#9A5B3A')} />
      <circle cx={250} cy={372} r={5} fill="#F4C24A" />
      <Yeux x={230} y={262} ecart={110} r={30} t={t} seed={seed} />
      <circle cx={150} cy={300} r={12} fill="#F28FA8" opacity={0.4} /><circle cx={310} cy={300} r={12} fill="#F28FA8" opacity={0.4} />
      <Reflet cx={130} cy={225} rx={26} ry={8} o={0.45} />
    </g>
  );
};

export const PanneauVendre: React.FC<{t: number}> = ({t}) => {
  const g = useGid('pv');
  return (
    <g>
      <defs><Grad id={g} c="#E8509A" /><Grad id={g + 'p'} c="#B8875A" /></defs>
      <rect x={110} y={90} width={22} height={240} rx={10} {...plast(g + 'p', '#B8875A')} />
      <rect x={10} y={20} width={222} height={110} rx={22} {...plast(g, '#E8509A')} />
      <Reflet cx={60} cy={40} rx={34} ry={8} o={0.45} rot={-8} />
      <Txt x={121} y={78} s={46} c="#fff">À VENDRE</Txt>
    </g>
  );
};

// ---------------- billet ----------------
export const Billet: React.FC<{t: number; seed?: number; c?: string}> = ({t, seed = 2, c = '#5DBB72'}) => {
  const g = useGid('b');
  return (
    <g>
      <defs><Grad id={g} c={c} /></defs>
      <rect x={10} y={10} width={500} height={260} rx={46} {...plast(g, c)} />
      <rect x={34} y={34} width={452} height={212} rx={32} fill="none" stroke={clair(c, 0.5)} strokeWidth={6} />
      <circle cx={100} cy={140} r={44} fill={clair(c, 0.35)} stroke={fonce(c, 0.2)} strokeWidth={3} />
      <Txt x={100} y={145} s={60} c={fonce(c, 0.35)}>€</Txt>
      <circle cx={420} cy={140} r={44} fill={clair(c, 0.35)} stroke={fonce(c, 0.2)} strokeWidth={3} />
      <Txt x={420} y={145} s={60} c={fonce(c, 0.35)}>€</Txt>
      <Yeux x={260} y={130} ecart={100} r={34} t={t} seed={seed} />
      <path d="M248 188 Q260 196 272 188" fill="none" stroke={fonce(c, 0.5)} strokeWidth={5} strokeLinecap="round" />
      <Reflet cx={110} cy={48} rx={80} ry={14} rot={-6} o={0.5} />
    </g>
  );
};

// ---------------- gâteau ----------------
export const Gateau: React.FC<{t: number; part: number; partVisible: boolean}> = ({t, part, partVisible}) => {
  const g = useGid('g');
  const pc = (x: number, w: number, lab: string, dx: number, dy: number, rot: number) => (
    <g transform={`translate(${dx} ${dy}) rotate(${rot} ${x + w / 2} 300)`}>
      <rect x={x} y={150} width={w} height={190} rx={18} {...plast(g + 'r', '#F3A6C4')} />
      <rect x={x} y={232} width={w} height={22} fill="#FFF3E2" opacity={0.9} />
      <path d={`M${x} 160 Q${x} 120 ${x + 20} 118 L${x + w - 20} 118 Q${x + w} 120 ${x + w} 160 Z`} fill="#FFF3E2" stroke="#E6CFAE" strokeWidth={3} />
      {[0.25, 0.5, 0.75].filter((k) => w * k > 30).map((k) => <path key={k} d={`M${x + w * k - 14} 156 Q${x + w * k} 190 ${x + w * k + 14} 156`} fill="#FFF3E2" />)}
      <Txt x={x + w / 2} y={296} s={w > 200 ? 58 : 40} c="#fff">{lab}</Txt>
      <Reflet cx={x + 34} cy={180} rx={14} ry={30} rot={0} o={0.35} />
    </g>
  );
  return (
    <g>
      <defs><Grad id={g + 'r'} c="#F3A6C4" /></defs>
      {pc(20, 345, '75 %', -part * 20, 0, 0)}
      <Yeux x={190} y={190} ecart={92} r={28} t={t} seed={4} />
      {partVisible && pc(372, 128, '25 %', part * 120, -Math.sin(part * Math.PI) * 60, part * 14)}
      <circle cx={120} cy={110} r={22} fill="#D6262F" stroke="#8E1018" strokeWidth={3} /><Reflet cx={113} cy={102} rx={6} ry={4} o={0.7} />
      <circle cx={260} cy={110} r={22} fill="#D6262F" stroke="#8E1018" strokeWidth={3} /><Reflet cx={253} cy={102} rx={6} ry={4} o={0.7} />
    </g>
  );
};

// ---------------- calculatrice ----------------
export const Calculatrice: React.FC<{t: number; ecran: string; allume: number}> = ({t, ecran, allume}) => {
  const g = useGid('c');
  const pressed = Math.floor(t * 7) % 16;
  return (
    <g>
      <defs><Grad id={g} c="#F07B2B" /><Grad id={g + 'k'} c="#FFF6EA" /></defs>
      <rect x={10} y={10} width={340} height={460} rx={50} {...plast(g, '#F07B2B')} />
      <Reflet cx={80} cy={40} rx={60} ry={12} rot={-10} o={0.5} />
      <Yeux x={180} y={66} ecart={90} r={26} t={t} seed={5} />
      <rect x={42} y={110} width={276} height={88} rx={20} fill={allume > 0.5 ? '#C8F7B0' : '#3F5A44'} stroke="#2D3F30" strokeWidth={4} />
      {allume > 0.5 && <Txt x={300} y={156} s={56} c="#2D3F30" a="start"><tspan textAnchor="end">{ecran}</tspan></Txt>}
      {Array.from({length: 16}).map((_, i) => {
        const cx = 70 + (i % 4) * 73, cy = 250 + Math.floor(i / 4) * 54;
        const p = i === pressed ? 5 : 0;
        return (
          <g key={i}>
            <rect x={cx - 28} y={cy - 18 + 6} width={56} height={40} rx={12} fill={fonce('#F07B2B', 0.35)} />
            <rect x={cx - 28} y={cy - 18 + p} width={56} height={40} rx={12} {...plast(g + 'k', i % 4 === 3 ? '#FFD9A8' : '#FFF6EA', 2)} />
          </g>
        );
      })}
    </g>
  );
};

export const Sac: React.FC<{}> = () => {
  const g = useGid('s');
  return (
    <g>
      <defs><Grad id={g} c="#D9B56A" /></defs>
      <path d="M20 60 Q0 120 30 140 L110 140 Q140 120 120 60 Q100 40 70 40 Q40 40 20 60 Z" {...plast(g, '#D9B56A')} />
      <path d="M48 40 L40 12 L70 26 L100 12 L92 40 Z" {...plast(g, '#D9B56A')} />
      <rect x={44} y={34} width={52} height={10} rx={5} fill="#8A5A3C" />
      <Txt x={70} y={98} s={46} c={fonce('#D9B56A', 0.45)}>€</Txt>
      <Reflet cx={40} cy={76} rx={10} ry={18} rot={10} o={0.45} />
    </g>
  );
};

// ---------------- stylo plume + acte + calendrier ----------------
export const Acte: React.FC<{}> = () => (
  <g>
    <rect x={10} y={10} width={380} height={250} rx={22} fill="#fff" stroke="#C9C3E6" strokeWidth={4} />
    <Txt x={200} y={52} s={34} c={INK}>ACTE DE VENTE</Txt>
    {[96, 128, 160].map((y) => <rect key={y} x={50} y={y} width={300} height={10} rx={5} fill="#DCD6F2" />)}
    <path d="M220 222 L350 222" stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
  </g>
);
export const Plume: React.FC<{t: number}> = ({t}) => {
  const g = useGid('pl');
  return (
    <g transform="rotate(35 90 160)">
      <defs><Grad id={g} c="#3E78E8" /></defs>
      <rect x={50} y={10} width={80} height={230} rx={40} {...plast(g, '#3E78E8')} />
      <path d="M58 230 L122 230 L90 320 Z" fill="#F4C24A" stroke="#A9790E" strokeWidth={3} />
      <path d="M90 250 L90 300" stroke="#A9790E" strokeWidth={4} />
      <Yeux x={90} y={80} ecart={44} r={17} t={t} seed={6} />
      <Reflet cx={70} cy={60} rx={8} ry={40} rot={0} o={0.5} />
    </g>
  );
};
export const Calendrier: React.FC<{t: number; vole: boolean}> = ({t, vole}) => {
  const g = useGid('cal');
  const pages = [0, 1, 2].map((i) => {
    const c = ((t * 1.6 + i / 3) % 1);
    if (!vole) return null;
    return (
      <g key={i} transform={`translate(${c * 220} ${-c * 260}) rotate(${c * 160} 100 120)`} opacity={1 - c}>
        <rect x={30} y={50} width={140} height={130} rx={14} fill="#fff" stroke="#C9C3E6" strokeWidth={3} />
      </g>
    );
  });
  return (
    <g>
      <defs><Grad id={g} c="#D6262F" /></defs>
      <rect x={20} y={40} width={160} height={160} rx={22} fill="#fff" stroke="#C9C3E6" strokeWidth={4} />
      <rect x={20} y={40} width={160} height={50} rx={20} {...plast(g, '#D6262F')} />
      <Txt x={100} y={150} s={64} c={INK}>{(Math.floor(t * 1.6) % 28) + 1}</Txt>
      {pages}
    </g>
  );
};

// ---------------- enveloppe ----------------
export const Enveloppe: React.FC<{t: number; bouche: number}> = ({t, bouche}) => {
  const g = useGid('e');
  return (
    <g>
      <defs><Grad id={g} c="#FFF4DE" /><Grad id={g + 'f'} c="#F1A7C8" /></defs>
      <rect x={10} y={60} width={400} height={240} rx={34} {...plast(g, '#F3DDB3')} />
      <path d={`M14 80 L210 ${210 - bouche * 140} L406 80`} {...plast(g + 'f', '#F1A7C8')} />
      <Yeux x={210} y={226} ecart={110} r={30} t={t} seed={7} />
      <Reflet cx={80} cy={100} rx={40} ry={10} o={0.5} rot={-8} />
    </g>
  );
};

// ---------------- voiture, panneau, jauge, téléphone ----------------
export const Voiture: React.FC<{t: number}> = ({t}) => {
  const g = useGid('v');
  const r = t * 600;
  return (
    <g>
      <defs><Grad id={g} c="#3DB86B" /><Grad id={g + 'w'} c="#CDE6F8" /></defs>
      <path d="M30 120 Q30 80 80 76 L110 30 Q120 16 140 16 L250 16 Q270 16 282 32 L320 76 Q370 80 370 120 L370 150 Q370 168 350 168 L50 168 Q30 168 30 150 Z" {...plast(g, '#3DB86B')} />
      <path d="M124 36 L180 36 L180 76 L104 76 Z" {...plast(g + 'w', '#CDE6F8', 2)} />
      <path d="M196 36 L262 36 L296 76 L196 76 Z" {...plast(g + 'w', '#CDE6F8', 2)} />
      <Yeux x={330} y={110} ecart={36} r={13} t={t} seed={8} />
      {[100, 290].map((x) => (
        <g key={x} transform={`rotate(${r} ${x} 168)`}>
          <circle cx={x} cy={168} r={36} fill="#2E2A40" /><circle cx={x} cy={168} r={15} fill="#CFCFE0" /><rect x={x - 3} y={140} width={6} height={20} fill="#CFCFE0" />
        </g>
      ))}
      <Reflet cx={160} cy={24} rx={40} ry={6} o={0.6} rot={0} />
    </g>
  );
};
export const Jauge: React.FC<{niveau: number}> = ({niveau}) => (
  <g>
    <rect x={0} y={0} width={180} height={120} rx={26} fill="#fff" stroke="#C9C3E6" strokeWidth={4} />
    <path d="M30 96 A60 60 0 0 1 150 96" fill="none" stroke="#E6E1F5" strokeWidth={14} strokeLinecap="round" />
    <path d="M30 96 A60 60 0 0 1 60 44" fill="none" stroke={STICKER.rouge} strokeWidth={14} strokeLinecap="round" />
    <g transform={`rotate(${lerp(80, -80, 1 - niveau)} 90 96)`}><rect x={86} y={44} width={8} height={56} rx={4} fill={INK} /></g>
    <circle cx={90} cy={96} r={10} fill={INK} />
  </g>
);
export const PanneauAnnonce: React.FC<{colle: number}> = ({colle}) => {
  const g = useGid('pa');
  return (
    <g>
      <defs><Grad id={g} c="#B8875A" /><Grad id={g + 'b'} c="#3E78E8" /></defs>
      <rect x={150} y={220} width={26} height={150} rx={10} {...plast(g, '#B8875A')} />
      <rect x={10} y={10} width={306} height={230} rx={26} {...plast(g + 'b', '#3E78E8')} />
      <Reflet cx={70} cy={30} rx={40} ry={8} o={0.5} rot={-6} />
      {colle > 0 && (
        <g transform={`translate(${lerp(-60, 0, easeOut(colle))} 0) rotate(${lerp(-12, -3, easeOut(colle))} 163 125)`}>
          <rect x={48} y={36} width={230} height={178} rx={12} fill="#fff" stroke="#C9C3E6" strokeWidth={3} />
          <path d="M92 130 L163 76 L234 130 Z" fill="#D9573B" /><rect x={112} y={128} width={102} height={58} fill="#FBEBD0" />
          <Txt x={163} y={58} s={22} c={INK}>À VENDRE</Txt>
        </g>
      )}
    </g>
  );
};
export const Telephone: React.FC<{t: number}> = ({t}) => {
  const g = useGid('tel');
  return (
    <g transform={`rotate(${Math.sin(t * 30) * 6} 60 100)`}>
      <defs><Grad id={g} c="#5C5A7A" /></defs>
      <rect x={10} y={10} width={100} height={180} rx={24} {...plast(g, '#5C5A7A')} />
      <rect x={22} y={30} width={76} height={130} rx={12} fill="#9CCBF0" />
      <Reflet cx={36} cy={44} rx={8} ry={20} o={0.5} rot={0} />
    </g>
  );
};

// ---------------- pile de billets / pièces ----------------
export const PileBillets: React.FC<{n: number; t: number}> = ({n, t}) => {
  const g = useGid('pb');
  return (
    <g>
      <defs><Grad id={g} c="#5DBB72" /></defs>
      {Array.from({length: Math.ceil(n)}).map((_, i) => (
        <g key={i} transform={`translate(${Math.sin(i * 1.7) * 10} ${360 - i * 34})`}>
          <rect x={20} y={0} width={300} height={44} rx={14} {...plast(g, '#5DBB72')} opacity={i === Math.ceil(n) - 1 ? clamp(n - i) : 1} />
          <circle cx={170} cy={22} r={14} fill={clair('#5DBB72', 0.4)} />
        </g>
      ))}
      <g transform={`translate(0 ${360 - Math.ceil(n) * 34 - 30})`}><Yeux x={170} y={0} ecart={70} r={22} t={t} seed={9} /></g>
    </g>
  );
};
export const Piece: React.FC<{r?: number}> = ({r = 60}) => {
  const g = useGid('pi');
  return (
    <g>
      <defs><Grad id={g} c="#F4C24A" /></defs>
      <circle cx={0} cy={0} r={r} {...plast(g, '#F4C24A', 4)} />
      <circle cx={0} cy={0} r={r * 0.72} fill="none" stroke={fonce('#F4C24A', 0.25)} strokeWidth={4} />
      <Txt x={0} y={4} s={r} c={fonce('#F4C24A', 0.4)}>€</Txt>
      <Reflet cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.25} ry={r * 0.12} o={0.7} />
    </g>
  );
};
export const PilePieces: React.FC<{n: number}> = ({n}) => {
  const g = useGid('pp');
  return (
    <g>
      <defs><Grad id={g} c="#F4C24A" /></defs>
      {Array.from({length: Math.ceil(n)}).map((_, i) => (
        <g key={i} transform={`translate(${Math.sin(i * 2.1) * 6} ${380 - i * 26})`} opacity={i === Math.ceil(n) - 1 ? clamp(n - i) : 1}>
          <ellipse cx={150} cy={14} rx={110} ry={26} fill={fonce('#F4C24A', 0.2)} stroke={fonce('#F4C24A', 0.35)} strokeWidth={3} />
          <ellipse cx={150} cy={4} rx={110} ry={26} {...plast(g, '#F4C24A')} />
        </g>
      ))}
    </g>
  );
};

// ---------------- réveil + bureau ----------------
export const Reveil: React.FC<{t: number; vitesse: number; sonne: boolean}> = ({t, vitesse, sonne}) => {
  const g = useGid('r');
  const sh = sonne ? Math.sin(t * 60) * 8 : 0;
  return (
    <g transform={`translate(${sh} 0) rotate(${sh * 0.6} 190 240)`}>
      <defs><Grad id={g} c="#E8509A" /><Grad id={g + 'b'} c="#F4B63B" /></defs>
      <circle cx={95} cy={70} r={50} {...plast(g + 'b', '#F4B63B')} /><circle cx={285} cy={70} r={50} {...plast(g + 'b', '#F4B63B')} />
      <rect x={70} y={330} width={30} height={60} rx={12} fill={fonce('#E8509A', 0.3)} transform="rotate(20 85 330)" />
      <rect x={280} y={330} width={30} height={60} rx={12} fill={fonce('#E8509A', 0.3)} transform="rotate(-20 295 330)" />
      <circle cx={190} cy={220} r={160} {...plast(g, '#E8509A')} />
      <circle cx={190} cy={225} r={118} fill="#fff" stroke="#E6CFE0" strokeWidth={4} />
      {Array.from({length: 12}).map((_, i) => <circle key={i} cx={190 + Math.sin((i * Math.PI) / 6) * 98} cy={225 - Math.cos((i * Math.PI) / 6) * 98} r={6} fill={INK} />)}
      <g transform={`rotate(${t * 360 * vitesse} 190 225)`}><rect x={186} y={140} width={8} height={90} rx={4} fill={INK} /></g>
      <g transform={`rotate(${t * 30 * vitesse} 190 225)`}><rect x={185} y={170} width={10} height={60} rx={5} fill={STICKER.orange} /></g>
      <Yeux x={190} y={265} ecart={70} r={20} t={t} seed={10} />
      <Reflet cx={110} cy={110} rx={30} ry={12} o={0.5} />
    </g>
  );
};
export const Bureau: React.FC<{}> = () => {
  const g = useGid('bu');
  return (
    <g>
      <defs><Grad id={g} c="#C08A5C" /></defs>
      <rect x={40} y={60} width={30} height={170} rx={10} fill={fonce('#C08A5C', 0.25)} /><rect x={330} y={60} width={30} height={170} rx={10} fill={fonce('#C08A5C', 0.25)} />
      <rect x={10} y={20} width={380} height={56} rx={20} {...plast(g, '#C08A5C')} />
      <Reflet cx={80} cy={34} rx={50} ry={7} o={0.45} rot={0} />
    </g>
  );
};

// ---------------- calendrier 12 cases ----------------
export const Calendrier12: React.FC<{t: number; zeros: number[]}> = ({t, zeros}) => {
  const g = useGid('c12');
  const pleins = [0, 3, 5, 9];
  let iz = 0;
  return (
    <g>
      <defs><Grad id={g} c="#B9A4EC" /><Grad id={g + 'h'} c="#D6262F" /></defs>
      <rect x={10} y={10} width={580} height={470} rx={40} {...plast(g, '#9C86D6')} />
      <rect x={10} y={10} width={580} height={70} rx={34} {...plast(g + 'h', '#D6262F')} />
      <Txt x={300} y={48} s={40} c="#fff">12 MOIS</Txt>
      {Array.from({length: 12}).map((_, i) => {
        const x = 40 + (i % 4) * 134, y = 100 + Math.floor(i / 4) * 124;
        const plein = pleins.includes(i);
        const zt = plein ? 0 : zeros[iz++] ?? 99;
        const kz = pop(t, zt);
        return (
          <g key={i}>
            <rect x={x} y={y} width={118} height={108} rx={18} fill="#fff" stroke="#D8D0F0" strokeWidth={3} />
            {plein && [0, 1, 2].map((j) => {
              const c = (t * 1.4 + j / 3 + i * 0.13) % 1;
              return <g key={j} transform={`translate(${x + 30 + j * 30} ${y + 8 + c * 80})`} opacity={1 - c * 0.3}><Piece r={14} /></g>;
            })}
            {plein && <g transform={`translate(${x + 59} ${y + 92})`}><ellipse rx={44} ry={10} fill="#F4C24A" stroke="#A9790E" strokeWidth={2} /></g>}
            {!plein && kz > 0 && (
              <g transform={`translate(${x + 59} ${y + 54}) rotate(-12) scale(${kz})`}>
                <rect x={-46} y={-26} width={92} height={52} rx={10} fill="#fff" stroke={STICKER.rouge} strokeWidth={6} />
                <Txt x={0} y={3} s={36} c={STICKER.rouge}>0 €</Txt>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ---------------- clés, serrure, chrono ----------------
export const Cle: React.FC<{t: number; c: string; yeux?: boolean; tourne?: number}> = ({t, c, yeux, tourne = 0}) => {
  const g = useGid('k');
  return (
    <g transform={`translate(210 100) scale(1 ${Math.cos(tourne * Math.PI * 2) * 0.35 + 0.65}) translate(-210 -100)`}>
      <defs><Grad id={g} c={c} /></defs>
      <rect x={150} y={78} width={250} height={44} rx={18} {...plast(g, c)} />
      <rect x={330} y={110} width={26} height={50} rx={8} {...plast(g, c)} /><rect x={370} y={110} width={22} height={38} rx={8} {...plast(g, c)} />
      <circle cx={100} cy={100} r={90} {...plast(g, c)} />
      <circle cx={100} cy={100} r={26} fill="rgba(255,255,255,.35)" stroke={fonce(c, 0.3)} strokeWidth={3} />
      {yeux && <Yeux x={100} y={70} ecart={70} r={22} t={t} seed={11} />}
      <Reflet cx={60} cy={44} rx={26} ry={10} o={0.55} />
    </g>
  );
};
export const Chrono: React.FC<{t: number; v: number}> = ({t, v}) => (
  <g>
    <rect x={52} y={0} width={36} height={22} rx={6} fill="#5C5A7A" />
    <circle cx={70} cy={92} r={66} fill="#fff" stroke="#5C5A7A" strokeWidth={10} />
    <g transform={`rotate(${t * 360 * v} 70 92)`}><rect x={66} y={40} width={8} height={56} rx={4} fill={STICKER.rouge} /></g>
    <circle cx={70} cy={92} r={8} fill={INK} />
  </g>
);

// ---------------- chiffre géant ----------------
export const Chiffre: React.FC<{texte: string; c: string}> = ({texte, c}) => {
  const g = useGid('ch');
  return (
    <g>
      <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={clair(c, 0.4)} /><stop offset="1" stopColor={fonce(c, 0.15)} /></linearGradient></defs>
      <text x={200} y={340} fontFamily={FONT} fontWeight={800} fontSize={440} textAnchor="middle" fill={fonce(c, 0.4)} transform="translate(0 16)">{texte}</text>
      <text x={200} y={340} fontFamily={FONT} fontWeight={800} fontSize={440} textAnchor="middle" fill={`url(#${g})`} stroke="#fff" strokeWidth={10} paintOrder="stroke" >{texte}</text>
      <Reflet cx={160} cy={110} rx={30} ry={12} o={0.5} />
    </g>
  );
};

// ---------------- curseur ----------------
export const Curseur: React.FC<{t: number; val: number; claque: number}> = ({t, val, claque}) => {
  const g = useGid('cu');
  const pos = (v: number) => 60 + ((v - 50) / 35) * 560;
  const [sx, sy] = rebond(t, claque, 0.5, 0.3);
  return (
    <g>
      <defs><Grad id={g} c="#E8509A" /><Grad id={g + 'k'} c="#FFFFFF" /></defs>
      <rect x={20} y={70} width={640} height={70} rx={35} {...plast(g, '#E8509A')} />
      <rect x={60} y={95} width={pos(val) - 60} height={20} rx={10} fill="#fff" opacity={0.7} />
      {[50, 60, 70, 75, 80, 85].map((v) => <Txt key={v} x={pos(v)} y={190} s={v === 75 || v === 80 ? 38 : 30} c={v === 75 || v === 80 ? INK : fonce('#E8509A', 0.2)}>{v}</Txt>)}
      <g transform={`translate(${pos(val)} 105) scale(${sx} ${sy})`}>
        <circle r={58} {...plast(g + 'k', '#FFF2F8', 4)} />
        <Yeux x={0} y={-6} ecart={40} r={14} t={t} seed={12} />
        <Reflet cx={-20} cy={-30} rx={16} ry={8} o={0.8} />
      </g>
    </g>
  );
};

// ---------------- escabeau, ticket, ciseaux ----------------
export const Escabeau: React.FC<{}> = () => (
  <g fill="none" strokeLinecap="round">
    <path d="M40 300 L100 10 L160 300" stroke="#9AA2B4" strokeWidth={16} />
    {[80, 150, 220].map((y) => <path key={y} d={`M${40 + (300 - y) * 0.2 + 6} ${y} L${160 - (300 - y) * 0.2 - 6} ${y}`} stroke="#C7CDDA" strokeWidth={12} />)}
  </g>
);
export const Ticket: React.FC<{t: number; coupe: number}> = ({t, coupe}) => {
  const zig = (y: number) => Array.from({length: 11}).map((_, i) => `L${10 + i * 28} ${y + (i % 2 ? 14 : 0)}`).join(' ');
  const haut = `M10 10 L290 10 L290 250 ${zig(250).split('L').reverse().join('L').replace(/L$/, '')} Z`;
  return (
    <g>
      <g transform={`translate(${-coupe * 30} ${-coupe * 30}) rotate(${-coupe * 8} 150 250)`}>
        <path d={`M10 10 L290 10 L290 254 L10 254 Z`} fill="#fff" stroke="#C9C3E6" strokeWidth={4} />
        <Txt x={150} y={52} s={36} c={INK}>FRAIS</Txt>
        {[96, 132, 168, 204].map((y) => <rect key={y} x={40} y={y} width={220} height={12} rx={6} fill="#DCD6F2" />)}
        <Yeux x={150} y={150} ecart={80} r={24} t={t} seed={13} />
      </g>
      <g transform={`translate(${coupe * 30} ${coupe * 40}) rotate(${coupe * 8} 150 250)`}>
        <path d={`M10 256 L290 256 L290 500 ${Array.from({length: 11}).map((_, i) => `L${290 - i * 28} ${500 + (i % 2 ? 0 : 14)}`).join(' ')} L10 256 Z`} fill="#fff" stroke="#C9C3E6" strokeWidth={4} />
        {[290, 326, 362].map((y) => <rect key={y} x={40} y={y} width={220} height={12} rx={6} fill="#DCD6F2" />)}
        <Txt x={150} y={430} s={44} c={STICKER.rouge}>300 €</Txt>
      </g>
      {coupe <= 0 && <path d="M0 255 L300 255" stroke={STICKER.rouge} strokeWidth={4} strokeDasharray="12 10" />}
    </g>
  );
};
export const Ciseaux: React.FC<{t: number; ouvre: number}> = ({ouvre}) => {
  const g = useGid('ci');
  const a = 8 + ouvre * 22;
  return (
    <g>
      <defs><Grad id={g} c="#F07B2B" /></defs>
      {[-1, 1].map((s) => (
        <g key={s} transform={`rotate(${s * a} 120 60)`}>
          <path d="M120 60 L260 56 Q270 60 260 64 Z" fill="#E6EAF2" stroke="#9AA2B4" strokeWidth={3} />
          <circle cx={60} cy={60 + s * 26} r={30} fill="none" stroke={fonce('#F07B2B', 0.2)} strokeWidth={16} />
        </g>
      ))}
      <circle cx={120} cy={60} r={8} fill={INK} />
    </g>
  );
};

// ---------------- contrat ----------------
export const Contrat: React.FC<{t: number; coches: number[]}> = ({t, coches}) => {
  const labels = ['Rétrocession', 'Frais fixes', 'Paliers'];
  return (
    <g>
      <rect x={10} y={10} width={460} height={540} rx={30} fill="#fff" stroke="#C9C3E6" strokeWidth={5} />
      <Txt x={240} y={66} s={44} c={INK}>CONTRAT</Txt>
      <Yeux x={240} y={130} ecart={90} r={24} t={t} seed={14} />
      {labels.map((l, i) => {
        const y = 230 + i * 100;
        const k = pop(t, coches[i] ?? 99);
        return (
          <g key={i}>
            <rect x={50} y={y - 32} width={64} height={64} rx={14} fill="#F3F0FB" stroke="#B9A4EC" strokeWidth={4} />
            {k > 0 && <path d={`M62 ${y} L78 ${y + 18} L108 ${y - 22}`} fill="none" stroke={STICKER.vert} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" transform={`translate(82 ${y}) scale(${k}) translate(-82 ${-y})`} />}
            <Txt x={136} y={y + 4} s={40} c={INK} a="start">{l}</Txt>
          </g>
        );
      })}
      <path d="M280 500 L430 500" stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
    </g>
  );
};

// ---------------- tampon TVA ----------------
export const TamponTVA: React.FC<{t: number}> = ({t}) => {
  const g = useGid('tv');
  return (
    <g>
      <defs><Grad id={g} c="#9A6B44" /><Grad id={g + 'r'} c="#D6262F" /></defs>
      <circle cx={190} cy={80} r={70} {...plast(g, '#9A6B44')} />
      <rect x={150} y={120} width={80} height={120} rx={24} {...plast(g, '#9A6B44')} />
      <Yeux x={190} y={70} ecart={60} r={20} t={t} seed={15} />
      <rect x={30} y={230} width={320} height={110} rx={26} {...plast(g + 'r', '#D6262F')} />
      <Txt x={190} y={290} s={64} c="#fff">TVA 20 %</Txt>
      <Reflet cx={140} cy={40} rx={22} ry={10} o={0.5} />
    </g>
  );
};

// ---------------- icônes finales ----------------
export const Coeur: React.FC<{}> = () => {
  const g = useGid('co');
  return (<g><defs><Grad id={g} c="#E8509A" /></defs><path d="M80 140 C10 90 0 40 40 20 C62 10 78 24 80 40 C82 24 98 10 120 20 C160 40 150 90 80 140 Z" {...plast(g, '#E8509A', 4)} /><Reflet cx={46} cy={44} rx={14} ry={8} o={0.7} /></g>);
};
export const BulleIcone: React.FC<{}> = () => {
  const g = useGid('bi');
  return (<g><defs><Grad id={g} c="#3E78E8" /></defs><path d="M20 30 Q20 10 40 10 L120 10 Q140 10 140 30 L140 90 Q140 110 120 110 L70 110 L40 140 L44 110 L40 110 Q20 110 20 90 Z" {...plast(g, '#3E78E8', 4)} />{[55, 80, 105].map((x) => <circle key={x} cx={x} cy={60} r={9} fill="#fff" />)}<Reflet cx={46} cy={26} rx={16} ry={6} o={0.6} rot={-5} /></g>);
};
export const Plus: React.FC<{}> = () => {
  const g = useGid('pl');
  return (<g><defs><Grad id={g} c="#3DB86B" /></defs><circle cx={80} cy={75} r={66} {...plast(g, '#3DB86B', 4)} /><rect x={70} y={40} width={20} height={70} rx={8} fill="#fff" /><rect x={45} y={65} width={70} height={20} rx={8} fill="#fff" /><Reflet cx={50} cy={40} rx={16} ry={8} o={0.6} /></g>);
};
