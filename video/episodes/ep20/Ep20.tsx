import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import scenesData from './scenes.json';
import voix from './voix.json';
import {Fond, Sticker, Carte, MentionSource, Flash, FONT, INK, pop, prog, ease, easeOut, lerp, rebond, clamp, StickerDef} from '../../shared/toy/base';
import {SousTitres, Mot} from '../../shared/toy/SousTitres';
import {Personnage, Acteur} from '../../shared/toy/Personnage';
import * as O from '../../shared/toy/Objets';

const FPS = 30;
/** Tenue supplémentaire de la dernière scène (s), si la vidéo devait faire moins de 80 s. */
const TENUE_EXTRA = 0;
const SFX_VOL = 0.1; // crêtes des bruitages ≈ −19 à −20 dB sous la crête de la voix (−3,3 dBFS)

type SceneJ = any;
const SCENES = scenesData as SceneJ[];
const V = voix as {fin: number; scenes: {debut: number; mots: Mot[]}[]};

const BORNES = (() => {
  const b = V.scenes.map((s) => Math.round(s.debut * FPS));
  b.push(Math.round((V.fin + TENUE_EXTRA) * FPS));
  return b;
})();
export const EP20_DUREE = BORNES[BORNES.length - 1];

const norm = (w: string) => w.toLowerCase().replace(/[.,:;!?]/g, '');
const motsScene = (i: number): Mot[] => V.scenes[i].mots.map((m) => ({texte: m.texte, debut: m.debut - BORNES[i] / FPS, fin: m.fin - BORNES[i] / FPS}));
const resoudre = (q: any, mots: Mot[], def = 0.3): number => {
  if (typeof q === 'number') return q;
  if (typeof q !== 'string') return def;
  const m = mots.find((x) => norm(x.texte).startsWith(q.toLowerCase()));
  return m ? m.debut : def;
};

type Prep = {
  sc: SceneJ; mots: Mot[]; dur: number;
  stickers: StickerDef[]; lignes: {texte: string; debut: number; couleur?: string; taille?: number}[];
  acts: O.ActS[]; mentionT: number; sons: Record<string, number[]>;
};
const PREP: Prep[] = SCENES.map((sc, i) => {
  const mots = motsScene(i);
  const dur = (BORNES[i + 1] - BORNES[i]) / FPS;
  const stickers = (sc.stickers ?? []).map((s: any) => ({...s, debut: resoudre(s.quand, mots), barre: s.barre !== undefined ? resoudre(s.barre, mots) : undefined}));
  const lignes = (sc.carte ?? []).map((l: any) => ({...l, debut: resoudre(l.quand, mots)}));
  const acts = (sc.sujet_actions ?? []).map((a: any) => {
    const d = resoudre(a.debut, mots);
    return {nom: a.nom, debut: d, fin: a.fin ?? d + 0.6};
  });
  const mentionT = sc.mention_quand !== undefined ? resoudre(sc.mention_quand, mots) : lignes.length ? lignes[0].debut + 0.15 : 0.3;
  const sons: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(sc.sons ?? {})) sons[k] = (v as any[]).map((q) => resoudre(q, mots));
  sons.pop = [...stickers.filter((s: any) => s.style !== 'tampon').map((s: any) => s.debut), ...(lignes.length ? [lignes[0].debut] : [])];
  return {sc, mots, dur, stickers, lignes, acts, mentionT, sons};
});

// ---------------------------------------------------------------- sujets
const Notes: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => (
  <svg style={{position: 'absolute', left: x, top: y - 160, overflow: 'visible'}} width={10} height={10}>
    {[0, 1, 2].map((i) => {
      const c = (t * 0.9 + i / 3) % 1;
      return (
        <g key={i} transform={`translate(${Math.sin(c * 6 + i) * 20 + i * 30} ${-c * 140})`} opacity={1 - c}>
          <ellipse cx={0} cy={30} rx={11} ry={8} fill={INK} /><rect x={8} y={-8} width={4} height={38} fill={INK} /><path d="M12 -8 Q26 0 22 12" stroke={INK} strokeWidth={4} fill="none" />
        </g>
      );
    })}
  </svg>
);

const Arriere: React.FC<{p: Prep; t: number}> = ({p, t}) => {
  const {acts} = p;
  switch (p.sc.sujet) {
    case 'voiture': {
      const k = O.pa(acts, 'traverse', t);
      return k > 0 && k < 1 ? <O.Sujet x={lerp(-260, 1340, k)} y={880} w={400} h={210} t={t} flottant={false} sq={[1, 1 + Math.sin(t * 30) * 0.02]}><O.Voiture t={t} /></O.Sujet> : null;
    }
    case 'reveil':
      return <O.Sujet x={250} y={900} w={400} h={240} t={t} flottant={false} sol={1010}><O.Bureau /></O.Sujet>;
    case 'villa':
      return <O.Sujet x={200} y={850} w={200} h={300} t={t} flottant={false} sol={1004}><O.Escabeau /></O.Sujet>;
    default:
      return null;
  }
};

const SujetScene: React.FC<{p: Prep; t: number}> = ({p, t}) => {
  const {acts} = p;
  const pa = (n: string) => O.pa(acts, n, t);
  const ta = (n: string) => O.ta(acts, n);
  switch (p.sc.sujet) {
    case 'maison': {
      const r1 = rebond(t, ta('rebond')), r2 = rebond(t, ta('rebond2'));
      const kp = pa('panneau');
      return (
        <>
          <O.Sujet x={680} y={740} w={460} h={440} t={t} sq={[r1[0] * r2[0], r1[1] * r2[1]]}><O.Maison t={t} /></O.Sujet>
          {t >= ta('panneau') && (
            <div style={{position: 'absolute', left: 0, top: -300 * (1 - easeOut(kp)), width: 1080, height: 1920}}>
              <O.Sujet x={420} y={850} w={242} h={330} t={t} flottant={false} sol={1008} sq={rebond(t, ta('panneau') + 0.3)} rot={Math.sin(t * 3) * 2}><O.PanneauVendre t={t} /></O.Sujet>
            </div>
          )}
        </>
      );
    }
    case 'billet': {
      const k = ease(pa('degonfle'));
      return <O.Sujet x={640} y={760} w={520} h={280} t={t} k={lerp(1, 0.42, k)} rot={k * 360 + Math.sin(t * 9) * 6 * k}><O.Billet t={t} /></O.Sujet>;
    }
    case 'gateau': {
      const part = easeOut(pa('part'));
      return <O.Sujet x={630} y={790} w={520} h={360} t={t} sq={rebond(t, ta('coupe') + 0.5)}><O.Gateau t={t} part={part} partVisible={t < ta('part') + 0.75} /></O.Sujet>;
    }
    case 'calculatrice': {
      const n = Math.min(4, Math.ceil(pa('sacs') * 4));
      return (
        <>
          <O.Sujet x={700} y={740} w={360} h={480} t={t} sq={rebond(t, ta('allume'))}><O.Calculatrice t={t} ecran={t < ta('allume') ? '7500×4' : '30000'} allume={1} /></O.Sujet>
          <svg style={{position: 'absolute', left: 340, top: 600, overflow: 'visible'}} width={140} height={400}>
            {Array.from({length: n}).map((_, i) => {
              const t0 = ta('sacs') + (i + 1) * 0.8 - 0.8;
              const d = easeOut(prog(t, t0, t0 + 0.3));
              return <g key={i} transform={`translate(${(i % 2) * 14 - 7} ${250 - i * 96 - (1 - d) * 300}) scale(0.95)`}><O.Sac /></g>;
            })}
          </svg>
        </>
      );
    }
    case 'acte':
      return (
        <>
          <O.Sujet x={600} y={880} w={400} h={270} t={t} phase={2}><O.Acte /></O.Sujet>
          <O.Sujet x={640} y={640} w={200} h={330} t={t} phase={0} rot={Math.sin(t * 4) * 6} ombre={false}><O.Plume t={t} /></O.Sujet>
          <O.Sujet x={440} y={560} w={200} h={220} t={t} phase={1} ombre={false}><O.Calendrier t={t} vole={true} /></O.Sujet>
        </>
      );
    case 'enveloppe': {
      const a = pa('avale');
      const ch = a > 0 && a < 1 ? Math.abs(Math.sin(a * Math.PI * 3)) : 0.15 + Math.abs(Math.sin(t * 2)) * 0.1;
      return (
        <>
          <O.Sujet x={660} y={790} w={420} h={320} t={t} sq={rebond(t, O.ta(acts, 'avale') + 0.9)}><O.Enveloppe t={t} bouche={ch} /></O.Sujet>
          {a < 1 && (
            <O.Sujet x={lerp(360, 660, ease(a))} y={lerp(640, 760, ease(a))} w={520} h={280} t={t} k={lerp(0.35, 0.12, ease(a))} rot={a * 90} ombre={false}><O.Billet t={t} /></O.Sujet>
          )}
        </>
      );
    }
    case 'voiture': {
      const k = pa('traverse');
      return (
        <>
          <O.Sujet x={640} y={740} w={326} h={380} t={t} flottant={false} sol={1000} rot={Math.sin(t * 2.5) * 2}><O.PanneauAnnonce colle={pa('colle')} /></O.Sujet>
          <O.Sujet x={880} y={540} w={180} h={120} t={t} ombre={false} phase={1}><O.Jauge niveau={1 - k * 0.75} /></O.Sujet>
          <O.Sujet x={930} y={780} w={120} h={200} t={t} phase={2}><O.Telephone t={t} /></O.Sujet>
        </>
      );
    }
    case 'pile': {
      const k = pa('tombe');
      const c = (t * 1.6) % 1;
      return (
        <>
          <O.Sujet x={680} y={750} w={340} h={420} t={t}><O.PileBillets n={lerp(9, 4, k)} t={t} /></O.Sujet>
          {k > 0 && k < 1 && (
            <O.Sujet x={760 + c * 200} y={560 + c * 420} w={340} h={60} t={t} rot={c * 120} ombre={false}><rect x={20} y={0} width={300} height={44} rx={14} fill="#5DBB72" stroke="#3E8A50" strokeWidth={3} opacity={1 - c} /></O.Sujet>
          )}
        </>
      );
    }
    case 'reveil': {
      const s = pa('sonne');
      const sonne = s > 0 && s < 1;
      return <O.Sujet x={700} y={720} w={380} h={420} t={t}><O.Reveil t={t} vitesse={sonne ? 7 : 3} sonne={sonne} /></O.Sujet>;
    }
    case 'calendrier12': {
      const z0 = ta('zeros');
      return <O.Sujet x={650} y={760} w={600} h={490} t={t}><O.Calendrier12 t={t} zeros={Array.from({length: 8}).map((_, i) => z0 + i * 0.16)} /></O.Sujet>;
    }
    case 'cles': {
      const tr = ease(pa('tourne')) * 2;
      return (
        <>
          <O.Sujet x={600} y={700} w={420} h={200} t={t} sq={rebond(t, O.ta(acts, 'tourne') + 1.4)}><O.Cle t={t} c="#F4B63B" yeux tourne={tr} /></O.Sujet>
          <O.Sujet x={560} y={890} w={420} h={200} t={t} k={0.62} phase={2}><O.Cle t={t} c="#A9AEBB" /></O.Sujet>
          <O.Sujet x={600} y={500} w={140} h={170} t={t} ombre={false} phase={1}><O.Chrono t={t} v={1 + ease(pa('chrono')) * 6} /></O.Sujet>
        </>
      );
    }
    case 'chiffre': {
      const tc = ta('change'), tp = ta('piece');
      const avant = t < tc;
      const pc = prog(t, tp, tp + 0.5);
      return (
        <>
          <O.Sujet x={620} y={720} w={400} h={440} t={t} sq={rebond(t, tc, 0.7, 0.3)} k={avant ? 1 : pop(t, tc)}><O.Chiffre texte={avant ? '4' : '5'} c={avant ? '#F07B2B' : '#3DB86B'} /></O.Sujet>
          <O.Sujet x={910} y={880} w={460} h={440} t={t} k={0.4} sq={rebond(t, tp + 0.5, 0.6, 0.3)} phase={1}><O.Maison t={t} seed={3} /></O.Sujet>
          {t >= tp && <O.Sujet x={910} y={lerp(-150, 640, Math.min(1, pc * pc))} w={200} h={200} t={t} ombre={false} flottant={pc >= 1} sq={rebond(t, tp + 0.5)}><g transform="translate(100 100)"><O.Piece r={80} /></g></O.Sujet>}
        </>
      );
    }
    case 'curseur': {
      const g = pa('glisse');
      return <O.Sujet x={555} y={760} w={680} h={220} t={t} k={0.82}><O.Curseur t={t} val={lerp(75, 80, easeOut(g))} claque={O.ta(acts, 'glisse') + 1.2} /></O.Sujet>;
    }
    case 'villa': {
      const v = ease(pa('grossit'));
      const m = easeOut(pa('metre'));
      const xm = 380, lm = m * 120;
      return (
        <>
          <O.Sujet x={700} y={740} w={460} h={440} t={t} k={1 + v * 0.18} sq={rebond(t, O.ta(acts, 'grossit') + 1.6, 0.6, 0.25)}><O.Maison t={t} villa={v} /></O.Sujet>
          {m > 0 && <div style={{position: 'absolute', left: xm, top: 588, width: lm, height: 22, background: 'repeating-linear-gradient(90deg,#F4C24A 0 14px,#C99A1E 14px 16px)', borderRadius: 4, border: '2px solid #A9790E'}} />}
        </>
      );
    }
    case 'pieces':
      return <O.Sujet x={680} y={740} w={300} h={440} t={t}><O.PilePieces n={lerp(3, 12, pa('monte'))} /></O.Sujet>;
    case 'ticket': {
      const a = acts.find((x) => x.nom === 'coupe')!;
      const c = pa('coupe');
      const coupe = easeOut(prog(t, a.fin - 0.1, a.fin + 0.4));
      return (
        <>
          <O.Sujet x={660} y={740} w={300} h={520} t={t}><O.Ticket t={t} coupe={coupe} /></O.Sujet>
          {c > 0 && c < 1 && <O.Sujet x={lerp(440, 900, c)} y={740} w={280} h={120} t={t} ombre={false} flottant={false}><O.Ciseaux t={t} ouvre={Math.abs(Math.sin(t * 14))} /></O.Sujet>}
        </>
      );
    }
    case 'enveloppe_petite':
      return <O.Sujet x={600} y={780} w={420} h={320} t={t} k={lerp(1, 0.6, ease(pa('retrecit')))}><O.Enveloppe t={t} bouche={0.15 + Math.abs(Math.sin(t * 2.4)) * 0.15} /></O.Sujet>;
    case 'contrat':
      return <O.Sujet x={650} y={740} w={480} h={560} t={t} k={0.92}><O.Contrat t={t} coches={[ta('c1'), ta('c2'), ta('c3')]} /></O.Sujet>;
    case 'tampon': {
      const a = acts.find((x) => x.nom === 'abat')!;
      const d = prog(t, a.debut, a.fin);
      const off = t < a.debut ? -260 + Math.sin(t * 4) * 20 : lerp(-260, 0, d * d);
      const marque = t >= a.fin;
      return (
        <>
          <div style={{position: 'absolute', left: 430, top: 900, width: 440, height: 110, background: '#fff', borderRadius: 18, border: '4px solid #E3DCF2', boxShadow: '0 10px 18px rgba(0,0,0,.15)'}}>
            {marque && <div style={{position: 'absolute', inset: 12, border: '6px solid #D6262F', borderRadius: 14, color: '#D6262F', fontFamily: FONT, fontWeight: 800, fontSize: 56, textAlign: 'center', lineHeight: '72px', transform: `rotate(-4deg) scale(${pop(t, a.fin)})`}}>TVA 20 %</div>}
          </div>
          <div style={{position: 'absolute', left: 0, top: off, width: 1080, height: 1920}}>
            <O.Sujet x={650} y={720} w={380} h={360} t={t} flottant={false} ombre={false} sq={rebond(t, a.fin, 0.6, 0.3)}><O.TamponTVA t={t} /></O.Sujet>
          </div>
          {marque && t < a.fin + 0.4 && [0, 1, 2, 3, 4, 5].map((i) => {
            const k = prog(t, a.fin, a.fin + 0.4);
            const ang = (i / 6) * Math.PI - Math.PI;
            return <div key={i} style={{position: 'absolute', left: 650 + Math.cos(ang) * (240 + k * 80), top: 900 + Math.sin(ang) * (120 + k * 60), width: 50, height: 10, borderRadius: 5, background: '#2B2A4C', opacity: 1 - k, transform: `rotate(${(ang * 180) / Math.PI}deg)`}} />;
          })}
        </>
      );
    }
    case 'icones': {
      const t0 = 0.4;
      return (
        <>
          {[O.Coeur, O.BulleIcone, O.Plus].map((C, i) => {
            const k = pop(t, t0 + i * 0.3);
            const per = (t + i * 0.4) % 1.4;
            return k > 0 ? (
              <O.Sujet key={i} x={300 + i * 240} y={470} w={160} h={150} t={t} k={k} phase={i} sq={rebond(per, 0, 0.5, 0.18)}><C /></O.Sujet>
            ) : null;
          })}
        </>
      );
    }
    default:
      return null;
  }
};

const EnClair: React.FC<{texte: string; t: number}> = ({texte, t}) => {
  const k = pop(t, 0.25);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 380, transform: `scale(${k}) rotate(-1deg)`, background: '#fff', borderRadius: 30, border: '5px solid #3E78E8', padding: '14px 26px', boxShadow: '0 10px 0 #2A55A8, 0 18px 26px rgba(0,0,0,.2)'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.12, color: INK, textAlign: 'center'}}>{texte}</div>
    </div>
  );
};

const Scene: React.FC<{p: Prep}> = ({p}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const zoom = 1 + 0.06 * clamp(t / p.dur);
  const persos = (p.sc.persos ?? []) as (Acteur & {notes?: number[]})[];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
        <Fond nom={p.sc.fond} t={t + p.sc.n * 3} />
        {persos.filter((a) => a.derriere).map((a, i) => <Personnage key={'d' + i} acteur={a} t={t} />)}
        <Arriere p={p} t={t} />
        <SujetScene p={p} t={t} />
        {persos.filter((a) => !a.derriere).map((a, i) => <Personnage key={i} acteur={a} t={t} />)}
        {persos.filter((a) => a.notes && t >= a.notes[0] && t <= a.notes[1]).map((a, i) => <Notes key={'n' + i} t={t} x={a.x + 60} y={560} />)}
        {p.sc.enclair && <EnClair texte={p.sc.enclair} t={t} />}
        {p.stickers.map((s, i) => <Sticker key={i} s={s} t={t} />)}
        {p.lignes.length > 0 && <Carte lignes={p.lignes} t={t} />}
        <MentionSource mention={p.sc.mention} source={p.sc.source} t={t} debut={p.mentionT} />
      </div>
      <SousTitres mots={p.mots} t={t} />
      <Flash frame={frame} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bruitages (pistes séparées)
const SFX: {type: string; f: number}[] = (() => {
  const out: {type: string; f: number}[] = [];
  PREP.forEach((p, i) => {
    if (i > 0) out.push({type: 'whoosh', f: Math.max(0, BORNES[i] - 4)});
    for (const [k, ts] of Object.entries(p.sons)) for (const tt of ts) out.push({type: k, f: BORNES[i] + Math.round(tt * FPS)});
  });
  return out;
})();
const SFX_GAIN: Record<string, number> = {whoosh: 1, pop: 0.75, tchak: 0.9, ding: 0.9, pieces: 0.9, tictac: 0.6};

export const Ep20: React.FC = () => (
  <AbsoluteFill style={{background: '#F6C9DE'}}>
    {PREP.map((p, i) => (
      <Sequence key={i} from={BORNES[i]} durationInFrames={BORNES[i + 1] - BORNES[i]}>
        <Scene p={p} />
      </Sequence>
    ))}
    <Audio src={staticFile('ep20/voix.mp3')} />
    {Object.keys(SFX_GAIN).map((type) => (
      <Sequence key={type} name={`sfx-${type}`}>
        {SFX.filter((s) => s.type === type).map((s, j) => (
          <Sequence key={j} from={s.f} durationInFrames={type === 'tictac' ? 120 : 45}>
            <Audio src={staticFile(`ep20/sfx/${type}.wav`)} volume={SFX_VOL * SFX_GAIN[type]} />
          </Sequence>
        ))}
      </Sequence>
    ))}
  </AbsoluteFill>
);
