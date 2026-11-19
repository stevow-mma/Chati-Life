import React from 'react';
import {Grad, Reflet, clair, fonce, clamp, ease, lerp, prog, clignement, useGid, OmbreSol, Oeil, INK} from './base';

/** Personnages jouet. Règle de série : ils ne parlent pas (option `muet`, toujours vraie). */
export type Apparence = {
  peau: string; cheveux: string; coiffure: 'epis' | 'boucles' | 'chignon' | 'degarni';
  barbe?: boolean; lunettes?: boolean; haut: string; dessous: string; type: 'blazer' | 'cardigan' | 'costume';
  pantalon: string; chaussures: string; noeud?: string;
};
export const APPARENCES: Record<string, Apparence> = {
  julien: {peau: '#F2C29B', cheveux: '#7A4E2D', coiffure: 'epis', barbe: true, haut: '#1F6170', dessous: '#F6EBD0', type: 'blazer', pantalon: '#D9C29A', chaussures: '#5A3B28'},
  proprietaire: {peau: '#EDBB95', cheveux: '#C9C7D3', coiffure: 'boucles', haut: '#8556C4', dessous: '#F4E8F6', type: 'cardigan', pantalon: '#55546F', chaussures: '#3B3550'},
  notaire: {peau: '#E6B28C', cheveux: '#D9D9DF', coiffure: 'degarni', lunettes: true, haut: '#7E8392', dessous: '#FFFFFF', type: 'costume', pantalon: '#6D7180', chaussures: '#2B2B35', noeud: '#B3283C'},
  responsable: {peau: '#C98E64', cheveux: '#4A2C22', coiffure: 'chignon', haut: '#F0735A', dessous: '#FBEBD5', type: 'blazer', pantalon: '#3E3A5A', chaussures: '#2E2A40'},
};
export type Expr = 'neutre' | 'content' | 'surpris' | 'inquiet' | 'fatigue' | 'fier';
export type Action = {
  type: string; debut: number; fin: number;
  de?: number; a?: number; dy?: number; marche?: boolean; sautille?: boolean;
  d?: string; g?: string; lx?: number; ly?: number;
};
export type Acteur = {
  qui: string; x: number; y?: number; echelle?: number; flip?: boolean; expr: Expr; muet?: boolean;
  main_d?: string | null; main_g?: string | null; joues?: boolean; derriere?: boolean; actions?: Action[];
};

// ---- poses de bras [épaule, coude] en degrés (0 = vers le bas, + = vers l'extérieur/le haut) ----
type Pose = {a: number; b: number; main?: 'ouverte' | 'poing' | 'pouce' | 'index'};
const pose = (nom: string, t: number, lt: number, dur: number): Pose => {
  switch (nom) {
    case 'leve': return {a: 160, b: 10};
    case 'joie': return {a: 150 + Math.sin(t * 14) * 12, b: 15};
    case 'tete': return {a: 148, b: 78};
    case 'gratte': return {a: 150, b: 78 + Math.sin(t * 22) * 9};
    case 'pointe': return {a: 92, b: 0, main: 'index'};
    case 'pointe_bas': return {a: 35, b: 25 + Math.sin(t * 8) * 6, main: 'index'};
    case 'stop': return {a: 115, b: 55};
    case 'compte': return {a: 32, b: 118 + Math.sin(t * 9) * 8, main: Math.floor(t * 3) % 2 ? 'index' : 'ouverte'};
    case 'secoue': return {a: 72 + Math.sin(t * 20) * 8, b: 35 + Math.sin(t * 20) * 22};
    case 'salue': return {a: 150, b: 20 + Math.sin(t * 11) * 22};
    case 'pouce': return {a: 55, b: 85, main: 'pouce'};
    case 'poings': return {a: 14 + Math.sin(t * 30) * 2, b: 4, main: 'poing'};
    case 'ecarte': return {a: 58, b: 18};
    case 'tend': return {a: 78, b: -4};
    case 'tient': return {a: 40, b: 50};
    case 'coupe': return {a: 100 + Math.sin(t * 10) * 22, b: 25, main: 'poing'};
    case 'plante': return {a: 40 + Math.sin(lt * 12) * 10, b: 15, main: 'poing'};
    case 'pousse': return {a: 85, b: 4 + Math.sin(t * 6) * 4, main: 'index'};
    case 'barre': return {a: lerp(165, 45, ease(lt / Math.max(0.3, dur))), b: 5};
    case 'poche': return {a: 18, b: -55};
    case 'loupe': return {a: 50, b: 105 + Math.sin(t * 3) * 6};
    case 'affale': return {a: 95, b: 60};
    case 'tamponne': return {a: 70 + Math.max(0, Math.sin(t * 6)) * 40, b: 30, main: 'poing'};
    default: return {a: 12, b: -6};
  }
};

const SH = {d: [212, 300], g: [88, 300]};
const L1 = 72, L2 = 66;

const Main: React.FC<{c: string; type?: string}> = ({c, type = 'ouverte'}) => {
  const st = {fill: c, stroke: fonce(c, 0.3), strokeWidth: 2.5};
  if (type === 'poing') return <g><circle cx={0} cy={12} r={16} {...st} /><Reflet cx={-5} cy={6} rx={5} ry={3} o={0.5} /></g>;
  if (type === 'pouce')
    return <g><circle cx={0} cy={12} r={16} {...st} /><ellipse cx={-4} cy={-6} rx={6} ry={12} {...st} transform="rotate(160 0 12)" /><Reflet cx={-5} cy={6} rx={5} ry={3} o={0.5} /></g>;
  return (
    <g>
      {[-10.5, -3.5, 3.5, 10.5].map((x, i) => (
        <ellipse key={i} cx={x} cy={type === 'index' && i !== 1 ? 20 : i === 1 && type === 'index' ? 34 : 25} rx={5.2} ry={type === 'index' && i === 1 ? 13 : 8.5} {...st} />
      ))}
      <ellipse cx={0} cy={11} rx={17} ry={17} {...st} />
      <ellipse cx={15} cy={6} rx={5.5} ry={9} {...st} transform="rotate(-35 15 6)" />
      <Reflet cx={-5} cy={5} rx={6} ry={3.5} o={0.5} />
    </g>
  );
};

/** Accessoires tenus en main (dessinés à l'endroit). */
export const Accessoire: React.FC<{nom: string; t: number}> = ({nom, t}) => {
  const sw = Math.sin(t * 5) * 8;
  switch (nom) {
    case 'cles':
      return (
        <g transform={`rotate(${sw} 0 10)`}>
          <circle cx={0} cy={18} r={11} fill="none" stroke="#C99A1E" strokeWidth={5} />
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 7} 28) rotate(${s * 18})`}>
              <rect x={-4} y={0} width={8} height={30} rx={3} fill="#F4C24A" stroke="#A9790E" strokeWidth={2} />
              <circle cx={0} cy={0} r={9} fill="#F4C24A" stroke="#A9790E" strokeWidth={2} />
              <rect x={2} y={20} width={8} height={5} fill="#F4C24A" stroke="#A9790E" strokeWidth={1.5} />
            </g>
          ))}
        </g>
      );
    case 'couteau':
      return <g transform="rotate(-20)"><rect x={-7} y={-6} width={14} height={34} rx={5} fill="#8A5A3C" stroke="#5C3A24" strokeWidth={2} /><path d="M-7 -6 L7 -6 L5 -78 Q0 -86 -7 -70 Z" fill="#E6EAF2" stroke="#9AA2B4" strokeWidth={2} /></g>;
    case 'loupe':
      return <g><rect x={-6} y={-4} width={12} height={46} rx={5} fill="#3E3A5A" transform="rotate(30)" /><circle cx={-22} cy={-26} r={30} fill="rgba(200,230,255,.45)" stroke="#3E3A5A" strokeWidth={8} /><Reflet cx={-32} cy={-36} rx={9} ry={5} o={0.8} /></g>;
    case 'stylo':
      return <g transform="rotate(25)"><rect x={-5} y={-40} width={10} height={60} rx={4} fill="#3E78E8" stroke="#244C9C" strokeWidth={2} /><path d="M-5 20 L5 20 L0 34 Z" fill="#F4C24A" /></g>;
    case 'tampon':
      return <g><rect x={-9} y={-34} width={18} height={30} rx={8} fill="#9A6B44" stroke="#6A4626" strokeWidth={2} /><rect x={-26} y={-6} width={52} height={18} rx={5} fill="#D6262F" stroke="#8E1018" strokeWidth={2} /></g>;
    case 'dossier':
      return <g transform="rotate(-8)"><rect x={-40} y={-10} width={80} height={60} rx={7} fill="#F4B63B" stroke="#B5801A" strokeWidth={2.5} /><rect x={-28} y={4} width={44} height={6} rx={3} fill="#fff" opacity={0.8} /><circle cx={18} cy={30} r={12} fill="none" stroke="#D6262F" strokeWidth={4} /></g>;
    case 'mandat':
      return <g transform="rotate(-6)"><rect x={-36} y={-8} width={72} height={90} rx={6} fill="#fff" stroke="#B9A4EC" strokeWidth={3} />{[8, 22, 36, 50].map((y) => <rect key={y} x={-24} y={y} width={48} height={5} rx={2.5} fill="#C9C3E6" />)}</g>;
    case 'monnaie':
      return <g>{[0, 1, 2].map((i) => <ellipse key={i} cx={0} cy={14 - i * 7} rx={18} ry={7} fill="#F4C24A" stroke="#A9790E" strokeWidth={2} />)}</g>;
    case 'metre':
      return <g><rect x={-20} y={-6} width={40} height={36} rx={9} fill="#F4C24A" stroke="#A9790E" strokeWidth={2.5} /><circle cx={0} cy={12} r={8} fill="#A9790E" /></g>;
    case 'part':
      return <g><path d="M-30 0 L30 0 L0 -40 Z" fill="#F7D7A8" stroke="#C7955A" strokeWidth={3} /><path d="M-30 0 L30 0 L0 -40 Z" fill="none" /><rect x={-30} y={0} width={60} height={22} rx={3} fill="#E8A3C0" stroke="#B66A8A" strokeWidth={2.5} /></g>;
    default:
      return null;
  }
};

export const Personnage: React.FC<{acteur: Acteur; t: number; dureeScene?: number}> = ({acteur, t}) => {
  const ap = APPARENCES[acteur.qui] ?? APPARENCES.julien;
  const gid = useGid('p' + acteur.qui);
  const acts = acteur.actions ?? [];
  const ech = acteur.echelle ?? 1;

  // --- déplacement ---
  let x = acteur.x, dy = 0, marche = false, sautY = 0;
  const deps = acts.filter((a) => a.type === 'deplace');
  if (deps.length && t < deps[0].debut && deps[0].de !== undefined) x = deps[0].de;
  for (const d of deps) {
    if (t >= d.debut) {
      const p = prog(t, d.debut, d.fin);
      x = lerp(d.de ?? x, d.a ?? x, ease(p));
      if (d.dy) dy = lerp(0, d.dy, ease(p));
      if (p > 0 && p < 1) {
        if (d.marche !== false) marche = true;
        if (d.sautille) sautY -= Math.abs(Math.sin(p * Math.PI * 4)) * 45;
      }
    }
  }
  for (const s of acts.filter((a) => a.type === 'saut')) {
    const p = prog(t, s.debut, s.fin);
    if (p > 0 && p < 1) sautY -= Math.sin(p * Math.PI) * 90;
  }
  const phase = t * 10;

  // --- bras ---
  const bras = (cote: 'd' | 'g'): Pose => {
    let cur: Pose = pose('repos', t, 0, 1);
    cur = {...cur, a: cur.a + Math.sin(t * 2.1 + (cote === 'd' ? 0 : 1.7)) * 5};
    if (marche) cur = {...cur, a: cur.a + Math.sin(phase + (cote === 'd' ? 0 : Math.PI)) * 14};
    for (const a of acts) {
      if (a.type !== 'bras' || !a[cote]) continue;
      if (t < a.debut || t > a.fin + 0.22) continue;
      const w = Math.min(prog(t, a.debut, a.debut + 0.2), 1 - prog(t, a.fin, a.fin + 0.22));
      const p = pose(a[cote]!, t, t - a.debut, a.fin - a.debut);
      cur = {a: lerp(cur.a, p.a, w), b: lerp(cur.b, p.b, w), main: w > 0.5 ? p.main : cur.main};
    }
    return cur;
  };
  const enAct = (type: string) => acts.find((a) => a.type === type && t >= a.debut && t <= a.fin);
  const pAct = (type: string) => {
    const a = acts.find((x) => x.type === type && t >= x.debut - 0.25 && t <= x.fin + 0.25);
    if (!a) return 0;
    return Math.min(prog(t, a.debut - 0.25, a.debut), 1 - prog(t, a.fin, a.fin + 0.25));
  };
  const affale = pAct('affale');
  const hoche = enAct('hoche') ? Math.sin((t - enAct('hoche')!.debut) * 12) * 9 : 0;
  const souffle = enAct('souffle') ? Math.sin(prog(t, enAct('souffle')!.debut, enAct('souffle')!.fin) * Math.PI) : 0;
  const regard = enAct('regarde');
  const lx = regard?.lx ?? 0, ly = regard?.ly ?? 0;
  const clin = enAct('clin') ? 1 : 0;
  const recul = pAct('sursaute');

  const mainsActives = (cote: 'd' | 'g') => {
    let m = cote === 'd' ? acteur.main_d : acteur.main_g;
    for (const a of acts) if (a.type === 'main' && t >= a.debut && (a as any)[cote] !== undefined) m = (a as any)[cote];
    return m;
  };

  const respir = Math.sin(t * 2.6) * 0.018;
  const bob = marche ? -Math.abs(Math.sin(phase)) * 8 : 0;
  const corpsRot = affale * 32 + Math.sin(t * 1.7) * 1.5 - recul * 8;
  const teteRot = affale * 20 + hoche + Math.sin(t * 1.3) * 2.5 + ly * 6;

  const expr = acteur.expr;
  const ferme = expr === 'fatigue' ? 0.45 : expr === 'fier' ? 0.22 : 0;
  const blink = Math.max(clignement(t, acteur.qui.length), ferme);
  const rOeil = expr === 'surpris' ? 21 : 18;

  const brasG = bras('g'), brasD = bras('d');
  const drawArm = (cote: 'd' | 'g', p: Pose) => {
    const sx = cote === 'd' ? 1 : -1;
    const [Sx, Sy] = SH[cote];
    const a = (p.a * Math.PI) / 180, th = ((p.a + p.b) * Math.PI) / 180;
    const E = [Sx + sx * Math.sin(a) * L1, Sy + Math.cos(a) * L1];
    const H = [E[0] + sx * Math.sin(th) * L2, E[1] + Math.cos(th) * L2];
    const rotMain = cote === 'd' ? -(p.a + p.b) : p.a + p.b;
    const acc = mainsActives(cote);
    return (
      <g key={cote}>
        <path d={`M${Sx} ${Sy} L${E[0]} ${E[1]} L${H[0]} ${H[1]}`} fill="none" stroke={fonce(ap.haut, 0.3)} strokeWidth={33} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${Sx} ${Sy} L${E[0]} ${E[1]} L${H[0]} ${H[1]}`} fill="none" stroke={ap.haut} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${Sx - 4} ${Sy - 4} L${E[0] - 4} ${E[1] - 4}`} fill="none" stroke={clair(ap.haut, 0.4)} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        <circle cx={H[0] - (Math.sin(th) * sx * 6)} cy={H[1] - Math.cos(th) * 6} r={13} fill={ap.dessous} stroke={fonce(ap.dessous, 0.25)} strokeWidth={2} />
        <g transform={`translate(${H[0]} ${H[1]}) rotate(${rotMain}) scale(${sx} 1)`}>
          <Main c={ap.peau} type={p.main} />
        </g>
        {acc && <g transform={`translate(${H[0] + sx * Math.sin(th) * 14} ${H[1] + Math.cos(th) * 14})`}><Accessoire nom={acc} t={t} /></g>}
      </g>
    );
  };

  const leg = (hx: number, ang: number) => (
    <g transform={`rotate(${ang} ${hx} 455)`}>
      <path d={`M${hx} 455 L${hx} 565`} stroke={fonce(ap.pantalon, 0.25)} strokeWidth={42} strokeLinecap="round" />
      <path d={`M${hx} 455 L${hx} 565`} stroke={ap.pantalon} strokeWidth={37} strokeLinecap="round" />
      <path d={`M${hx - 8} 462 L${hx - 8} 540`} stroke={clair(ap.pantalon, 0.35)} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
      <ellipse cx={hx + 8} cy={586} rx={32} ry={17} fill={`url(#${gid}s)`} stroke={fonce(ap.chaussures, 0.3)} strokeWidth={2.5} />
      <Reflet cx={hx} cy={579} rx={10} ry={4} o={0.45} />
    </g>
  );
  const angL = marche ? Math.sin(phase) * 24 : 0;

  // --- cheveux ---
  const cheveux = () => {
    const c = ap.cheveux;
    const st = {fill: `url(#${gid}h)`, stroke: fonce(c, 0.3), strokeWidth: 2.5};
    if (ap.coiffure === 'epis')
      return (
        <g>
          <path d="M62 170 Q60 82 150 78 Q240 82 238 170 Q226 128 196 118 Q150 132 104 118 Q74 128 62 170 Z" {...st} />
          {[78, 104, 130, 156, 182, 208].map((x, i) => (
            <path key={i} d={`M${x - 16} ${110 - (i % 2) * 3} L${x + 4 + (i % 2) * 4} ${62 - (i % 3) * 6} L${x + 18} ${106}`} {...st} />
          ))}
          <Reflet cx={118} cy={92} rx={22} ry={7} o={0.35} />
        </g>
      );
    if (ap.coiffure === 'boucles')
      return (
        <g>
          {[[70, 150], [76, 112], [100, 86], [130, 74], [162, 72], [194, 82], [220, 108], [230, 146], [62, 188], [238, 186]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={26} {...st} />
          ))}
          <Reflet cx={130} cy={70} rx={18} ry={7} o={0.4} />
        </g>
      );
    if (ap.coiffure === 'chignon')
      return (
        <g>
          <circle cx={150} cy={66} r={36} {...st} />
          <path d="M62 175 Q58 86 150 82 Q242 86 238 175 Q220 120 150 112 Q80 120 62 175 Z" {...st} />
          <Reflet cx={140} cy={54} rx={14} ry={6} o={0.4} />
        </g>
      );
    return (
      <g>
        <path d="M60 196 Q56 140 78 112 Q92 150 84 196 Z" {...st} />
        <path d="M240 196 Q244 140 222 112 Q208 150 216 196 Z" {...st} />
        <path d="M110 90 Q150 76 190 90" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  };

  const bouche = () => {
    const s = {fill: 'none', stroke: '#6B2E2E', strokeWidth: 4.5, strokeLinecap: 'round' as const};
    switch (expr) {
      case 'content': return <path d="M139 226 Q150 239 161 226" {...s} />;
      case 'surpris': return <ellipse cx={150} cy={232} rx={6} ry={8} fill="#6B2E2E" />;
      case 'inquiet': return <path d="M140 232 Q145 226 150 232 Q155 238 160 232" {...s} />;
      case 'fatigue': return <path d="M142 233 L158 233" {...s} />;
      case 'fier': return <path d="M139 228 Q153 238 163 222" {...s} />;
      default: return <path d="M143 230 L157 230" {...s} />;
    }
  };
  const sourcils = () => {
    const s = {fill: 'none', stroke: fonce(ap.cheveux, 0.35), strokeWidth: 6, strokeLinecap: 'round' as const};
    const m: Record<Expr, [string, string]> = {
      neutre: ['M102 156 L132 154', 'M168 154 L198 156'],
      content: ['M102 154 Q117 145 132 152', 'M168 152 Q183 145 198 154'],
      surpris: ['M100 144 Q117 132 134 142', 'M166 142 Q183 132 200 144'],
      inquiet: ['M102 160 L132 148', 'M168 148 L198 160'],
      fatigue: ['M102 156 L132 160', 'M168 160 L198 156'],
      fier: ['M102 150 L132 157', 'M168 157 L198 150'],
    };
    return <g><path d={m[expr][0]} {...s} /><path d={m[expr][1]} {...s} /></g>;
  };

  const torse = () => {
    const c = ap.haut;
    return (
      <g>
        <rect x={78} y={268} width={144} height={206} rx={66} fill={`url(#${gid}b)`} stroke={fonce(c, 0.3)} strokeWidth={3} />
        {ap.type === 'cardigan' ? (
          <g>
            <path d="M126 272 L174 272 L162 470 L138 470 Z" fill={ap.dessous} stroke={fonce(ap.dessous, 0.2)} strokeWidth={2} />
            {[330, 375, 420].map((y) => <circle key={y} cx={168} cy={y} r={5} fill="#F4C24A" stroke="#A9790E" strokeWidth={1.5} />)}
          </g>
        ) : (
          <g>
            <path d="M124 270 L176 270 L150 370 Z" fill={ap.dessous} stroke={fonce(ap.dessous, 0.2)} strokeWidth={2} />
            <path d="M124 270 L150 370 L132 300 L112 296 Z" fill={fonce(c, 0.12)} stroke={fonce(c, 0.3)} strokeWidth={2} />
            <path d="M176 270 L150 370 L168 300 L188 296 Z" fill={fonce(c, 0.12)} stroke={fonce(c, 0.3)} strokeWidth={2} />
            <circle cx={150} cy={402} r={5.5} fill={fonce(c, 0.35)} />
            {ap.noeud && <g><path d="M150 282 L130 270 L130 296 Z M150 282 L170 270 L170 296 Z" fill={ap.noeud} stroke={fonce(ap.noeud, 0.3)} strokeWidth={2} /><circle cx={150} cy={282} r={6} fill={fonce(ap.noeud, 0.15)} /></g>}
          </g>
        )}
        <Reflet cx={108} cy={312} rx={16} ry={34} rot={-15} o={0.3} />
      </g>
    );
  };

  const tete = () => (
    <g transform={`rotate(${teteRot} 150 262)`}>
      <rect x={134} y={244} width={32} height={30} rx={10} fill={fonce(ap.peau, 0.08)} />
      {ap.coiffure === 'boucles' && <path d="M62 190 Q60 250 90 262 L210 262 Q240 250 238 190 Z" fill={`url(#${gid}h)`} stroke={fonce(ap.cheveux, 0.3)} strokeWidth={2.5} />}
      <ellipse cx={62} cy={186} rx={14} ry={20} fill={fonce(ap.peau, 0.05)} stroke={fonce(ap.peau, 0.3)} strokeWidth={2.5} />
      <ellipse cx={238} cy={186} rx={14} ry={20} fill={fonce(ap.peau, 0.05)} stroke={fonce(ap.peau, 0.3)} strokeWidth={2.5} />
      <ellipse cx={150} cy={172} rx={88} ry={92} fill={`url(#${gid}f)`} stroke={fonce(ap.peau, 0.3)} strokeWidth={3} />
      {ap.barbe && (
        <g opacity={0.32}>
          <path d="M72 200 Q80 262 150 266 Q220 262 228 200 Q206 236 150 240 Q94 236 72 200 Z" fill={ap.cheveux} />
          <path d="M126 214 Q150 206 174 214 L172 220 Q150 214 128 220 Z" fill={ap.cheveux} />
        </g>
      )}
      <circle cx={98} cy={214} r={(acteur.joues && enAct('joues') ? 20 : 13)} fill="#F28FA8" opacity={0.45} />
      <circle cx={202} cy={214} r={(acteur.joues && enAct('joues') ? 20 : 13)} fill="#F28FA8" opacity={0.45} />
      <Oeil x={118 + lx * 3} y={186} r={rOeil} ferme={blink} lx={lx} ly={ly} />
      {clin ? <path d="M168 188 Q182 178 196 188" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : <Oeil x={182 + lx * 3} y={186} r={rOeil} ferme={blink} lx={lx} ly={ly} />}
      {ap.lunettes && <g fill="none" stroke="#3B3550" strokeWidth={4.5}><circle cx={118} cy={186} r={27} /><circle cx={182} cy={186} r={27} /><path d="M145 184 Q150 179 155 184" /></g>}
      {sourcils()}
      <ellipse cx={150} cy={210} rx={9} ry={7} fill={fonce(ap.peau, 0.12)} />
      {bouche()}
      {cheveux()}
      <Reflet cx={104} cy={128} rx={22} ry={12} o={0.35} />
    </g>
  );

  const s = ech;
  const yPied = acteur.y ?? 1000;
  return (
    <>
      <OmbreSol x={x} y={yPied + dy} w={190 * s} k={1 + sautY / 600} />
      <div style={{position: 'absolute', left: x - 150 * s, top: yPied + dy - 600 * s + sautY * s, width: 300 * s, height: 620 * s, transform: acteur.flip ? 'scaleX(-1)' : undefined}}>
        <svg viewBox="0 0 300 620" width={300 * s} height={620 * s} style={{overflow: 'visible'}}>
          <defs>
            <Grad id={`${gid}b`} c={ap.haut} />
            <Grad id={`${gid}f`} c={ap.peau} />
            <Grad id={`${gid}h`} c={ap.cheveux} />
            <Grad id={`${gid}s`} c={ap.chaussures} />
          </defs>
          {leg(128, angL)}
          {leg(172, -angL)}
          <g transform={`translate(0 ${bob - souffle * 6}) rotate(${corpsRot} 150 460) translate(150 460) scale(${1 - respir + souffle * 0.03} ${1 + respir - souffle * 0.04}) translate(-150 -460)`}>
            {torse()}
            {tete()}
            {drawArm('g', brasG)}
            {drawArm('d', brasD)}
          </g>
        </svg>
      </div>
    </>
  );
};
