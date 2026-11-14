import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ElementVisuel, ObjetScene} from '../types';
import {Glisse} from './ElementsEp10';
import {ObjetSceneEp17} from './Ep17';

/**
 * ep16 (Karim, plombier indépendant) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Salopette, genouillères, objets tenus (cle_molette, caisse_outils, panier, carte_paiement, recu, attestation,
 * pistolet), objets de scène (evier, camion, pompe, chaudiere, calendrier, pile_papiers, boite_pieces, tuyaux),
 * décor `cuisine` / `cuisine_nuit`, élément `carte_vedette`. Aucune marque, aucun logo. Repère personnage : 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
type Pt = [number, number];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Salopette : bavette + bretelles sur le t-shirt. */
export const Salopette: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <path d="M 238 520 L 362 520 L 370 690 Q 300 704 230 690 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={262} y={540} width={76} height={56} rx={8} fill={ombre} stroke={OUT} strokeWidth={5} />
    <path d="M 244 524 L 232 416 M 356 524 L 368 416" stroke={OUT} strokeWidth={30} strokeLinecap="round" />
    <path d="M 244 524 L 232 416 M 356 524 L 368 416" stroke={couleur} strokeWidth={18} strokeLinecap="round" />
    <circle cx={246} cy={526} r={9} fill="#DEE2E6" stroke={OUT} strokeWidth={4} />
    <circle cx={354} cy={526} r={9} fill="#DEE2E6" stroke={OUT} strokeWidth={4} />
  </g>
);

/** Genouillère dessinée sur une jambe (coordonnées de la jambe). */
export const Genouillere: React.FC<{x: number; couleur: string}> = ({x, couleur}) => (
  <g>
    <rect x={x - 4} y={712} width={74} height={50} rx={16} fill={couleur} stroke={OUT} strokeWidth={6} />
    <path d={`M ${x + 8} 737 H ${x + 58}`} stroke="#ADB5BD" strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const OBJETS_EP16 = new Set(['cle_molette', 'caisse_outils', 'panier', 'carte_paiement', 'recu', 'attestation', 'pistolet']);

export const ObjetMainEp16: React.FC<{nom: string; main: Pt; peau: string; frame: number}> = ({nom, main, peau, frame}) => {
  const [x, y] = main;
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'cle_molette':
      return (
        <g transform={`rotate(${-30 + Math.sin(frame / 5) * 8} ${x} ${y})`}>
          <rect x={x - 14} y={y - 150} width={28} height={170} rx={12} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - 34} ${y - 150} q 0 -50 34 -50 q 34 0 34 50 l -20 0 l 0 -24 l -28 0 l 0 24 z`} fill="#CED4DA" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          <rect x={x - 14} y={y - 40} width={28} height={50} rx={10} fill="#E63946" stroke={OUT} strokeWidth={6} />
          {mainDessus}
        </g>
      );
    case 'caisse_outils':
      return (
        <g>
          <path d={`M ${x - 40} ${y + 14} q 0 -36 40 -36 q 40 0 40 36`} fill="none" stroke={OUT} strokeWidth={12} />
          <rect x={x - 110} y={y + 14} width={220} height={120} rx={14} fill="#E63946" stroke={OUT} strokeWidth={8} />
          <rect x={x - 110} y={y + 14} width={220} height={34} rx={10} fill="#C1121F" stroke={OUT} strokeWidth={6} />
          <rect x={x - 18} y={y + 40} width={36} height={18} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
          {mainDessus}
        </g>
      );
    case 'panier':
      return (
        <g>
          <path d={`M ${x - 50} ${y + 10} q 50 -50 100 0`} fill="none" stroke={OUT} strokeWidth={10} />
          <path d={`M ${x - 90} ${y + 10} h 180 l -20 110 h -140 z`} fill="#4CC9F0" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
          <rect x={x - 70} y={y - 20} width={20} height={60} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
          <circle cx={x + 10} cy={y} r={18} fill="#F8F9FA" stroke={OUT} strokeWidth={5} />
          <rect x={x + 40} y={y - 26} width={30} height={40} rx={6} fill="#FFD60A" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    case 'carte_paiement':
      return (
        <g transform={`rotate(-10 ${x} ${y})`}>
          <rect x={x - 60} y={y - 80} width={120} height={78} rx={10} fill="#4361EE" stroke={OUT} strokeWidth={6} />
          <rect x={x - 44} y={y - 62} width={26} height={20} rx={4} fill="#FFD60A" stroke={OUT} strokeWidth={3} />
          {mainDessus}
        </g>
      );
    case 'recu':
      return (
        <g>
          <path d={`M ${x - 40} ${y - 160} h 80 v 140 l -10 8 l -10 -8 l -10 8 l -10 -8 l -10 8 l -10 -8 l -10 8 l -10 -8 z`} fill="white" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M ${x - 26} ${y - 136 + k * 24} h ${k === 3 ? 30 : 52}`} stroke="#ADB5BD" strokeWidth={5} />
          ))}
          {mainDessus}
        </g>
      );
    case 'attestation':
      return (
        <g transform={`rotate(-6 ${x} ${y})`}>
          <rect x={x - 70} y={y - 180} width={140} height={180} rx={6} fill="#FFFDF2" stroke={OUT} strokeWidth={6} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${x - 50} ${y - 150 + k * 22} h 100`} stroke="#ADB5BD" strokeWidth={5} />
          ))}
          <circle cx={x + 30} cy={y - 50} r={24} fill="none" stroke="#C1121F" strokeWidth={6} />
          <path d={`M ${x + 18} ${y - 50} l 8 8 l 16 -16`} stroke="#C1121F" strokeWidth={6} fill="none" />
          {mainDessus}
        </g>
      );
    case 'pistolet':
      return (
        <g>
          <path d={`M ${x} ${y} q -60 60 -40 160`} fill="none" stroke={OUT} strokeWidth={14} />
          <path d={`M ${x - 20} ${y - 30} h 50 l 50 -20 l 6 16 l -46 26 h -60 z`} fill="#2B2D42" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          {mainDessus}
        </g>
      );
    default:
      return null;
  }
};

/** Objets de scène ep16. */
export const ObjetSceneEp16: React.FC<{o: ObjetScene; frame: number; fps: number}> = ({o, frame, fps}) => {
  const t = frame / fps;
  const {x, y} = o;
  const inst = o.instants ?? [];
  switch (o.type as string) {
    case 'evier': {
      // meuble sous évier (porte ouverte), plan de travail, robinet ; fuite entre `ouvre` et `ferme`
      const w = o.largeur ?? 420;
      const fuite = o.ouvre !== undefined && t >= o.ouvre && (o.ferme === undefined || t < o.ferme);
      return (
        <g>
          <rect x={x - w / 2} y={y - 360} width={w} height={360} fill="#F1FAEE" stroke={OUT} strokeWidth={8} />
          <rect x={x - w / 2 + 20} y={y - 330} width={w / 2 - 30} height={300} fill="#DDE5E0" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x - w / 2 + 20} ${y - 330} l -70 30 v 260 l 70 10 z`} fill="#A8DADC" stroke={OUT} strokeWidth={6} />
          <rect x={x + 10} y={y - 330} width={w / 2 - 30} height={300} fill="#A8DADC" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x - 60} ${y - 330} v 120 q 0 30 30 30 h 40`} fill="none" stroke="#ADB5BD" strokeWidth={18} />
          <rect x={x - w / 2 - 30} y={y - 390} width={w + 60} height={34} rx={6} fill="#8D99AE" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x} ${y - 390} v -90 h 70 v 30`} fill="none" stroke="#ADB5BD" strokeWidth={18} strokeLinecap="round" />
          <path d={`M ${x} ${y - 390} v -90 h 70 v 30`} fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
          {fuite
            ? [0, 1, 2].map((k) => {
                const ph = ((t * 1.6 + k / 3) % 1);
                return <ellipse key={k} cx={x - 30} cy={y - 180 + ph * 160} rx={10} ry={14} fill="#4CC9F0" stroke={OUT} strokeWidth={3} opacity={1 - ph * 0.5} />;
              })
            : null}
          {fuite ? <ellipse cx={x - 30} cy={y - 10} rx={70 + Math.sin(t * 3) * 6} ry={12} fill="#4CC9F0" opacity={0.7} /> : null}
        </g>
      );
    }
    case 'camion': {
      // camionnette blanche de profil, sans logo ; porte latérale qui claque à `ferme`
      const w = o.largeur ?? 520;
      const porte = o.ferme !== undefined ? interpolate(t, [o.ferme - 0.2, o.ferme], [1, 0], clamp) : 0;
      const choc = o.ferme !== undefined && t > o.ferme ? Math.max(0, 1 - (t - o.ferme) / 0.4) * Math.sin((t - o.ferme) * 40) * 4 : 0;
      return (
        <g transform={`translate(0 ${choc})`}>
          <path d={`M ${x - w / 2} ${y - 60} V ${y - 300} H ${x + w / 2 - 140} L ${x + w / 2} ${y - 190} V ${y - 60} Z`} fill="#F8F9FA" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
          <path d={`M ${x + w / 2 - 130} ${y - 280} L ${x + w / 2 - 20} ${y - 190} H ${x + w / 2 - 130} Z`} fill="#A8DADC" stroke={OUT} strokeWidth={6} />
          <rect x={x - w / 2 + 40 + porte * 120} y={y - 280} width={190} height={200} fill={porte > 0.1 ? '#495057' : '#F1F3F5'} stroke={OUT} strokeWidth={6} />
          {[x - w / 2 + 100, x + w / 2 - 110].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={y - 50} r={50} fill="#2B2D42" stroke={OUT} strokeWidth={8} />
              <circle cx={cx} cy={y - 50} r={20} fill="#ADB5BD" />
            </g>
          ))}
        </g>
      );
    }
    case 'pompe':
      return (
        <g>
          <rect x={x - 70} y={y - 380} width={140} height={380} rx={14} fill="#E9ECEF" stroke={OUT} strokeWidth={8} />
          <rect x={x - 50} y={y - 350} width={100} height={70} rx={8} fill="#1b1b2f" />
          <text x={x} y={y - 302} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={34} fill="#80ED99">
            {inst.length ? Math.min(60, Math.max(0, (t - inst[0]) * 12)).toFixed(0) : '0'} L
          </text>
          <path d={`M ${x - 40} ${y - 230} h 80 M ${x - 40} ${y - 200} h 60`} stroke="#ADB5BD" strokeWidth={8} />
        </g>
      );
    case 'chaudiere': {
      const p = o.ouvre !== undefined ? interpolate(t, [o.ouvre, o.ouvre + 1.2], [0, 1], clamp) : 1;
      return (
        <g>
          <rect x={x - 110} y={y - 300} width={220} height={300} rx={18} fill="#F8F9FA" stroke={OUT} strokeWidth={8} />
          <circle cx={x} cy={y - 190} r={50} fill="white" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x} ${y - 190} L ${x + Math.cos(Math.PI * (1 - p * 0.6)) * 38} ${y - 190 - Math.sin(Math.PI * (1 - p * 0.6)) * 38}`} stroke="#E63946" strokeWidth={6} strokeLinecap="round" />
          <circle cx={x - 60} cy={y - 60} r={12} fill={p > 0.9 ? '#80ED99' : '#ADB5BD'} stroke={OUT} strokeWidth={4} />
          {[-60, -20, 20, 60].map((dx) => (
            <path key={dx} d={`M ${x + dx} ${y} v ${60 * Math.min(1, p * 2)}`} stroke="#CD7F32" strokeWidth={14} strokeLinecap="round" />
          ))}
        </g>
      );
    }
    case 'calendrier': {
      const colle = inst.length && t >= inst[0];
      return (
        <g>
          <rect x={x - 110} y={y - 140} width={220} height={240} rx={10} fill="white" stroke={OUT} strokeWidth={7} />
          <rect x={x - 110} y={y - 140} width={220} height={50} rx={10} fill="#E63946" stroke={OUT} strokeWidth={7} />
          {Array.from({length: 12}).map((_, k) => (
            <rect key={k} x={x - 92 + (k % 4) * 46} y={y - 76 + Math.floor(k / 4) * 56} width={36} height={42} rx={4} fill="#E9ECEF" />
          ))}
          {colle ? <rect x={x - 46} y={y - 20 - (1 - Math.min(1, (t - inst[0]) / 0.25)) * 40} width={46} height={46} fill="#FFD60A" stroke={OUT} strokeWidth={5} transform={`rotate(-8 ${x} ${y})`} /> : null}
        </g>
      );
    }
    case 'pile_papiers': {
      const n = Math.round(interpolate(t, [o.t ?? 0, o.fin ?? (o.t ?? 0) + 3], [1, o.hauteur ?? 10], clamp));
      return (
        <g>
          {Array.from({length: n}).map((_, k) => (
            <rect key={k} x={x - 80 + ((k * 7) % 12)} y={y - 16 - k * 14} width={160} height={14} rx={3} fill={k % 2 ? '#FFFDF2' : '#F1F3F5'} stroke={OUT} strokeWidth={4} />
          ))}
        </g>
      );
    }
    case 'boite_pieces': {
      const colle = o.ouvre !== undefined && t >= o.ouvre;
      const s = colle ? spring({frame: frame - Math.round(o.ouvre! * fps), fps, config: {damping: 8, stiffness: 220}}) : 0;
      return (
        <g>
          <rect x={x - 120} y={y - 130} width={240} height={130} rx={10} fill="#DDA15E" stroke={OUT} strokeWidth={8} />
          <path d={`M ${x - 120} ${y - 100} h 240`} stroke={OUT} strokeWidth={5} />
          <rect x={x - 90} y={y - 170} width={22} height={60} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
          <circle cx={x} cy={y - 140} r={22} fill="#F8F9FA" stroke={OUT} strokeWidth={5} />
          {colle ? (
            <g transform={`translate(${x + 60} ${y - 60}) scale(${s}) rotate(-12)`}>
              <circle r={44} fill="#1F9D55" stroke={OUT} strokeWidth={6} />
              <text y={12} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={30} fill="white">+25%</text>
            </g>
          ) : null}
        </g>
      );
    }
    case 'tuyaux':
      return (
        <g>
          <path d={`M ${x - 200} ${y} h 160 v -120 h 200`} fill="none" stroke={OUT} strokeWidth={26} strokeLinejoin="round" />
          <path d={`M ${x - 200} ${y} h 160 v -120 h 200`} fill="none" stroke="#CD7F32" strokeWidth={14} strokeLinejoin="round" />
          <circle cx={x + 60} cy={y - 120} r={34} fill="white" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x + 60} ${y - 120} l ${Math.cos(t * 2) * 22} ${Math.sin(t * 2) * -22 - 6}`} stroke="#E63946" strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    default:
      return <ObjetSceneEp17 o={o} frame={frame} fps={fps} />;
  }
};

/** Décor `cuisine` (variante `nuit` : lumière chaude, fenêtre sombre). */
export const DecorCuisine: React.FC<{frame: number; nuit?: boolean}> = ({frame, nuit}) => {
  const W = 1080;
  const H = 1920;
  const SOL = 1480;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill={nuit ? '#5A4636' : '#FFF1D6'} />
      {/* crédence carrelée */}
      <g opacity={nuit ? 0.6 : 1}>
        {Array.from({length: 12}).map((_, i) =>
          Array.from({length: 5}).map((__, j) => (
            <rect key={`${i}-${j}`} x={i * 92} y={SOL - 620 + j * 80} width={88} height={76} fill={(i + j) % 2 ? '#E0F2F1' : '#FFFFFF'} stroke="#B8C4C2" strokeWidth={3} />
          )),
        )}
      </g>
      {/* fenêtre */}
      <rect x={640} y={330} width={320} height={380} rx={12} fill={nuit ? '#1B263B' : '#A9DEF9'} stroke={OUT} strokeWidth={10} />
      {nuit ? <circle cx={880} cy={410} r={34} fill="#FFF3B0" /> : <circle cx={700 + ((frame * 0.4) % 200)} cy={420} r={0} />}
      {!nuit ? <ellipse cx={760 + Math.sin(frame / 50) * 20} cy={430} rx={60} ry={22} fill="white" /> : null}
      <path d="M 800 330 V 710 M 640 520 H 960" stroke={OUT} strokeWidth={8} />
      {/* placards hauts */}
      <rect x={40} y={300} width={540} height={300} rx={10} fill="#F4A261" stroke={OUT} strokeWidth={9} />
      <path d="M 310 300 V 600" stroke={OUT} strokeWidth={7} />
      <rect x={270} y={430} width={14} height={50} rx={6} fill="#495057" />
      <rect x={336} y={430} width={14} height={50} rx={6} fill="#495057" />
      {/* plan de travail et meubles bas au fond */}
      <rect x={0} y={SOL - 300} width={W} height={300} fill="#E9C46A" stroke={OUT} strokeWidth={8} />
      <rect x={0} y={SOL - 330} width={W} height={36} fill="#8D99AE" stroke={OUT} strokeWidth={8} />
      {[0, 270, 540, 810].map((x) => (
        <g key={x}>
          <rect x={x + 20} y={SOL - 280} width={230} height={250} rx={8} fill="#F4A261" stroke={OUT} strokeWidth={6} />
          <rect x={x + 115} y={SOL - 200} width={40} height={12} rx={6} fill="#495057" />
        </g>
      ))}
      {/* sol carrelé */}
      <rect y={SOL - 20} width={W} height={H - SOL + 20} fill={nuit ? '#6B5B4B' : '#D6CCC2'} />
      {Array.from({length: 9}).map((_, k) => (
        <path key={k} d={`M ${k * 135} ${SOL - 20} L ${k * 135 + (k - 4) * 60} ${H}`} stroke={nuit ? '#4E4034' : '#B8ADA2'} strokeWidth={4} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={`M 0 ${SOL + 40 + k * k * 40} H ${W}`} stroke={nuit ? '#4E4034' : '#B8ADA2'} strokeWidth={4} />
      ))}
      {nuit ? (
        <>
          {/* lampe suspendue et halo chaud */}
          <path d="M 300 0 V 160" stroke={OUT} strokeWidth={6} />
          <path d="M 240 220 Q 300 140 360 220 Z" fill="#FFB703" stroke={OUT} strokeWidth={7} />
          <ellipse cx={300} cy={700} rx={520} ry={760} fill="#FFB703" opacity={0.18 + Math.sin(frame / 20) * 0.02} />
        </>
      ) : null}
    </svg>
  );
};

/** Carte simplifiée : UN chiffre vedette en très gros (étapes successives sur `au_mot`), ≤ 3 lignes, une mention, une source. */
type MotFrame = (mot: string) => number | undefined;
const ICONES: Record<string, React.ReactNode> = {
  coeur: <path d="M 50 85 L 15 50 Q 0 30 20 18 Q 40 8 50 30 Q 60 8 80 18 Q 100 30 85 50 Z" fill="#E63946" stroke={OUT} strokeWidth={6} />,
  bulle: (
    <g>
      <path d="M 10 20 Q 10 8 22 8 H 78 Q 90 8 90 20 V 60 Q 90 72 78 72 H 40 L 22 90 V 72 Q 10 72 10 60 Z" fill="#4CC9F0" stroke={OUT} strokeWidth={6} />
      <path d="M 28 32 H 72 M 28 50 H 60" stroke="white" strokeWidth={7} strokeLinecap="round" />
    </g>
  ),
  plus: (
    <g>
      <rect x={6} y={6} width={88} height={88} rx={22} fill="#1F9D55" stroke={OUT} strokeWidth={6} />
      <path d="M 50 25 V 75 M 25 50 H 75" stroke="white" strokeWidth={12} strokeLinecap="round" />
    </g>
  ),
};

const CarteVedette: React.FC<{el: Extract<ElementVisuel, {type: 'carte_vedette'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const debuts = el.etapes.map((e, i) => (e.au_mot && motFrame ? (motFrame(e.au_mot) ?? 6 + i * 45) : 6 + i * 45));
  let k = 0;
  debuts.forEach((d, i) => {
    if (frame >= d) k = i;
  });
  const e = el.etapes[k];
  const s = spring({frame: frame - debuts[k], fps, config: {damping: 8, stiffness: 190}});
  const couleur = e.couleur === 'rouge' ? '#E63946' : e.couleur === 'vert' ? '#1F9D55' : OUT;
  return (
    <Glisse>
      <div style={{width: 900, background: 'white', border: `10px solid ${OUT}`, borderRadius: 40, boxShadow: '0 16px 0 rgba(0,0,0,0.3)', padding: '18px 30px 14px', transform: 'rotate(-1.5deg)', fontFamily: FONT_TEXTE, color: OUT, textAlign: 'center'}}>
        {e.icones ? (
          <div style={{display: 'flex', justifyContent: 'center', gap: 40, padding: '10px 0'}}>
            {e.icones.map((ic, i) => {
              const si = spring({frame: frame - debuts[k] - i * 8, fps, config: {damping: 7, stiffness: 200}});
              return (
                <svg key={i} viewBox="0 0 100 100" width={150} height={150} style={{transform: `scale(${si})`}}>
                  {ICONES[ic]}
                </svg>
              );
            })}
          </div>
        ) : (
          <div style={{fontFamily: FONT_TITRE, fontSize: e.valeur.length <= 7 ? 150 : e.valeur.length <= 10 ? 120 : 92, lineHeight: 1, paddingTop: 18, color: couleur, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, whiteSpace: 'nowrap'}}>
            {e.valeur}
          </div>
        )}
        {(e.lignes ?? []).slice(0, 3).map((l, i) => (
          <div key={i} style={{fontSize: i === 0 ? 40 : 34, lineHeight: 1.15, marginTop: 6, opacity: Math.min(1, Math.max(0, (frame - debuts[k] - 4 - i * 5) / 6))}}>
            {l}
          </div>
        ))}
        {el.mention ? <div style={{display: 'inline-block', marginTop: 10, background: '#FFF3B0', border: `4px solid ${OUT}`, borderRadius: 14, padding: '4px 14px 0', fontSize: 24}}>{el.mention}</div> : null}
        {el.source ? <div style={{fontSize: 22, color: '#6C757D', marginTop: 6}}>{el.source}</div> : null}
      </div>
    </Glisse>
  );
};

export const ElementEp16: React.FC<{element: ElementVisuel; motFrame?: MotFrame}> = ({element, motFrame}) =>
  element.type === 'carte_vedette' ? <CarteVedette el={element} motFrame={motFrame} /> : null;
