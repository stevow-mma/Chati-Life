import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// ---------- police ----------
export const FONT = 'Baloo 2';
loadFont({family: FONT, url: staticFile('fonts/Baloo2-ExtraBold.woff2'), weight: '800'});

// ---------- couleurs ----------
export const INK = '#2B2A4C';
export const ORANGE_ACTIF = '#F47A1F';
export const LILAS = '#B9A4EC';
export const STICKER: Record<string, string> = {
  bleu: '#3E78E8', orange: '#F07B2B', rose: '#E8509A', or: '#F4B63B', vert: '#3DB86B', rouge: '#D6262F', jaune: '#F7C928',
};
export const FONDS: Record<string, [string, string]> = {
  rose: ['#F6C9DE', '#F1A7C8'], creme: ['#FBF0BE', '#F8D98B'], menthe: ['#CFF0DC', '#9FDDBB'],
  lavande: ['#DDD0F6', '#B9A4EC'], peche: ['#FBD9BF', '#F6B38A'], ciel: ['#CDE6F8', '#9CCBF0'],
};
const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number[]) => '#' + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * k));
};
export const clair = (c: string, k = 0.35) => mix(c, '#ffffff', k);
export const fonce = (c: string, k = 0.25) => mix(c, '#000000', k);

// ---------- animation ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => {
  x = clamp(x);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const prog = (t: number, a: number, b: number) => clamp((t - a) / Math.max(1e-6, b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Apparition en ressort : 0 → 1,1 → 1 en 8 images. */
export const pop = (t: number, t0: number) => {
  const f = (t - t0) * 30;
  if (f <= 0) return 0;
  if (f >= 8) return 1;
  return f < 5 ? 1.1 * easeOut(f / 5) : 1.1 - 0.1 * ease((f - 5) / 3);
};
export const flotte = (t: number, phase = 0, amp = 12) => Math.sin(t * 2.3 + phase) * amp;
/** Écrasement / étirement amorti après t0. Renvoie [sx, sy]. */
export const rebond = (t: number, t0: number, dur = 0.6, amp = 0.2): [number, number] => {
  const p = (t - t0) / dur;
  if (p < 0 || p > 1) return [1, 1];
  const s = Math.sin(p * Math.PI * 3) * (1 - p) * amp;
  return [1 + s, 1 - s];
};
/** Rebond périodique léger (jamais immobile). */
export const respire = (t: number, phase = 0): [number, number] => {
  const s = Math.sin(t * 3.1 + phase) * 0.025;
  return [1 + s, 1 - s];
};
export const clignement = (t: number, seed = 0) => {
  const per = 2.7 + (seed % 3) * 0.45;
  const x = (t + seed * 0.77) % per;
  if (x > 0.16) return 0;
  return Math.sin((x / 0.16) * Math.PI);
};

// ---------- primitives SVG ----------
let compteur = 0;
export const useGid = (p: string) => React.useMemo(() => `${p}${++compteur}`, [p]);

/** Dégradé radial « plastique » : lumière en haut à gauche. */
export const Grad: React.FC<{id: string; c: string}> = ({id, c}) => (
  <radialGradient id={id} cx="0.32" cy="0.28" r="0.85">
    <stop offset="0" stopColor={clair(c, 0.45)} />
    <stop offset="0.45" stopColor={c} />
    <stop offset="1" stopColor={fonce(c, 0.22)} />
  </radialGradient>
);
export const Reflet: React.FC<{cx: number; cy: number; rx: number; ry: number; rot?: number; o?: number}> = ({cx, cy, rx, ry, rot = -25, o = 0.6}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />
);
/** Forme jouet : remplissage dégradé + contour fin plus foncé. */
export const plast = (id: string, c: string, w = 3) => ({fill: `url(#${id})`, stroke: fonce(c, 0.3), strokeWidth: w, strokeLinejoin: 'round' as const});

/** Œil : blanc, liseré lilas, pupille noire + reflet. */
export const Oeil: React.FC<{x: number; y: number; r: number; ferme?: number; lx?: number; ly?: number}> = ({x, y, r, ferme = 0, lx = 0, ly = 0}) => (
  <g transform={`translate(${x} ${y}) scale(1 ${Math.max(0.08, 1 - ferme)})`}>
    <circle r={r} fill="#fff" stroke={LILAS} strokeWidth={Math.max(2, r * 0.13)} />
    <circle cx={lx * r * 0.3} cy={ly * r * 0.3} r={r * 0.52} fill="#1B1A2E" />
    <circle cx={lx * r * 0.3 - r * 0.18} cy={ly * r * 0.3 - r * 0.2} r={r * 0.17} fill="#fff" />
  </g>
);
export const Yeux: React.FC<{x: number; y: number; ecart: number; r: number; t: number; seed?: number; lx?: number; ly?: number}> = ({x, y, ecart, r, t, seed = 1, lx = 0, ly = 0}) => {
  const b = clignement(t, seed);
  return (
    <g>
      <Oeil x={x - ecart / 2} y={y} r={r} ferme={b} lx={lx} ly={ly} />
      <Oeil x={x + ecart / 2} y={y} r={r} ferme={b} lx={lx} ly={ly} />
    </g>
  );
};

/** Ombre au sol floue (div). */
export const OmbreSol: React.FC<{x: number; y: number; w: number; k?: number}> = ({x, y, w, k = 1}) => (
  <div
    style={{
      position: 'absolute', left: x - (w * k) / 2, top: y - 18, width: w * k, height: 36, borderRadius: '50%',
      background: 'rgba(60,40,90,0.28)', filter: 'blur(10px)',
    }}
  />
);

// ---------- fond ----------
export const Fond: React.FC<{nom: string; t: number}> = ({nom, t}) => {
  const [a, b] = FONDS[nom] ?? FONDS.rose;
  const noms = Object.keys(FONDS).filter((n) => n !== nom);
  const blobs = [0, 1, 2].map((i) => {
    const c = FONDS[noms[(i * 2 + nom.length) % noms.length]][1];
    const bx = [180, 900, 520][i] + Math.sin(t * 0.35 + i * 2) * 90;
    const by = [380, 900, 1480][i] + Math.cos(t * 0.3 + i) * 80;
    const s = [520, 600, 560][i];
    return <div key={i} style={{position: 'absolute', left: bx - s / 2, top: by - s / 2, width: s, height: s, borderRadius: '50%', background: c, opacity: 0.5, filter: 'blur(70px)'}} />;
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${clair(a, 0.3)} 0%, ${a} 40%, ${b} 100%)`, overflow: 'hidden'}}>
      {blobs}
    </AbsoluteFill>
  );
};

// ---------- stickers ----------
export type StickerDef = {
  texte: string; couleur?: string; style?: 'normal' | 'tampon' | 'bandes';
  x?: number; y?: number; rot?: number; taille?: number; debut: number; barre?: number; fin?: number;
};
export const Sticker: React.FC<{s: StickerDef; t: number}> = ({s, t}) => {
  const k = pop(t, s.debut);
  if (k <= 0) return null;
  if (s.fin !== undefined && t > s.fin + 0.2) return null;
  const sortie = s.fin !== undefined ? 1 - prog(t, s.fin, s.fin + 0.2) : 1;
  const c = STICKER[s.couleur ?? 'bleu'] ?? s.couleur!;
  const taille = s.taille ?? 62;
  const rot = s.rot ?? -5;
  const bob = Math.sin(t * 2.6 + (s.x ?? 0) * 0.01 + taille) * 6;
  const barreK = s.barre !== undefined ? easeOut(prog(t, s.barre, s.barre + 0.25)) : 0;
  const txt: React.CSSProperties = {fontFamily: FONT, fontWeight: 800, fontSize: taille, lineHeight: 1.05, whiteSpace: 'pre', textAlign: 'center'};
  let corps: React.ReactNode;
  if (s.style === 'tampon') {
    corps = (
      <div style={{background: '#fff', border: `${Math.round(taille / 7)}px solid ${STICKER.rouge}`, borderRadius: 18, padding: `${taille * 0.12}px ${taille * 0.4}px`, boxShadow: '0 10px 22px rgba(80,0,10,.25)'}}>
        <div style={{...txt, color: STICKER.rouge, letterSpacing: 2}}>{s.texte}</div>
      </div>
    );
  } else if (s.style === 'bandes') {
    corps = (
      <div style={{padding: 10, borderRadius: 30, background: 'repeating-linear-gradient(45deg,#1E1D2B 0 18px,#F7C928 18px 36px)', boxShadow: `0 10px 0 ${fonce('#B8900F', 0.2)}, 0 20px 26px rgba(0,0,0,.25)`}}>
        <div style={{background: 'linear-gradient(#FFE56B,#F2BE16)', borderRadius: 22, padding: `${taille * 0.08}px ${taille * 0.45}px`, border: '4px solid #fff'}}>
          <div style={{...txt, color: INK, textShadow: '0 3px 0 rgba(255,255,255,.6)'}}>{s.texte}</div>
        </div>
      </div>
    );
  } else {
    corps = (
      <div style={{position: 'relative', background: `linear-gradient(${clair(c, 0.25)}, ${fonce(c, 0.12)})`, border: '6px solid #fff', borderRadius: 30, padding: `${taille * 0.1}px ${taille * 0.42}px`, boxShadow: `0 12px 0 ${fonce(c, 0.38)}, 0 22px 30px rgba(40,30,70,.3)`}}>
        <div style={{position: 'absolute', left: 14, right: 14, top: 6, height: '40%', borderRadius: 20, background: 'linear-gradient(rgba(255,255,255,.45),rgba(255,255,255,0))'}} />
        <div style={{...txt, position: 'relative', color: '#fff', textShadow: '0 4px 8px rgba(0,0,0,.28)'}}>{s.texte}</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: s.x ?? 540, top: (s.y ?? 330) + bob, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k * sortie})`, opacity: s.barre !== undefined && barreK > 0 ? 1 - barreK * 0.25 : 1}}>
      {corps}
      {barreK > 0 && (
        <div style={{position: 'absolute', left: '-4%', top: '46%', height: 16, width: `${108 * barreK}%`, background: STICKER.rouge, borderRadius: 8, transform: 'rotate(-8deg)', transformOrigin: 'left center', boxShadow: '0 3px 0 #8E1018'}} />
      )}
    </div>
  );
};

// ---------- carte chiffrée ----------
export type LigneDef = {texte: string; debut: number; couleur?: string; taille?: number};
const segments = (txt: string, c: string) =>
  txt.split(/(\[\[.*?\]\])/).map((p, i) =>
    p.startsWith('[[') ? <span key={i} style={{color: c}}>{p.slice(2, -2)}</span> : <span key={i}>{p}</span>,
  );
export const Carte: React.FC<{lignes: LigneDef[]; t: number; top?: number}> = ({lignes, t, top = 1000}) => {
  const t0 = lignes[0]?.debut ?? 0;
  const k = pop(t, t0);
  if (k <= 0) return null;
  const n = lignes.length;
  const base = n >= 5 ? 44 : n >= 4 ? 50 : 56;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: top + Math.sin(t * 2) * 4, transform: `scale(${k})`, transformOrigin: '50% 0%'}}>
      <div style={{background: 'linear-gradient(#FFFFFF,#EEF0FA)', borderRadius: 44, border: '5px solid #fff', boxShadow: '0 14px 0 #C3C6DE, 0 28px 40px rgba(43,42,76,.28)', padding: '26px 30px', position: 'relative'}}>
        <div style={{position: 'absolute', left: 24, right: 24, top: 8, height: 40, borderRadius: 30, background: 'linear-gradient(rgba(255,255,255,.9),rgba(255,255,255,0))'}} />
        {lignes.map((l, i) => {
          const kk = pop(t, l.debut);
          return (
            <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: l.taille ?? base, lineHeight: 1.18, color: INK, textAlign: 'center', transform: `scale(${kk})`, opacity: kk > 0 ? 1 : 0, position: 'relative'}}>
              {segments(l.texte, l.couleur ?? STICKER.orange)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MentionSource: React.FC<{mention?: string; source?: string; t: number; debut: number}> = ({mention, source, t, debut}) => {
  const k = pop(t, debut);
  if (k <= 0 || (!mention && !source)) return null;
  const n = source ? source.split(',').length : 0;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, bottom: 1920 - 1488, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `scale(${k})`}}>
      {mention && (
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, lineHeight: 1.15, color: '#fff', background: `linear-gradient(${clair(INK, 0.15)},${INK})`, borderRadius: 26, padding: '6px 22px', textAlign: 'center', boxShadow: '0 5px 0 #15142a, 0 10px 16px rgba(0,0,0,.2)', maxWidth: 900}}>
          {mention}
        </div>
      )}
      {source && (
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: INK, opacity: 0.85, textAlign: 'center'}}>
          {n > 1 ? 'Sources' : 'Source'} : {source}
        </div>
      )}
    </div>
  );
};

// ---------- flash de coupe ----------
export const Flash: React.FC<{frame: number}> = ({frame}) =>
  frame < 3 ? <AbsoluteFill style={{background: '#fff', opacity: 1 - frame / 3}} /> : null;
