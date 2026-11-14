import {ObjetMainEp13} from './Ep13';
import {ObjetMainEp17, OBJETS_EP17} from './Ep17';
import {ObjetMainEp18, OBJETS_EP18} from './Ep18';
import {ObjetMainEp15} from './Ep15';
import {Genouillere, ObjetMainEp16, OBJETS_EP16} from './Ep16';
import {MotifsAvantBras, ObjetMainEp14} from './Ep14';
/**
 * Extensions du personnage (ep10) : bras articulés (épaule + coude), jambes qui marchent, objets animés tenus
 * en main, nouvelles coiffures et nouveaux vêtements. Tout est optionnel : rien ici n'est utilisé par les
 * épisodes 1 à 9 (le composant Personnage n'y fait appel que si la prop `mouvement` ou un nouveau champ
 * d'apparence est fourni).
 * Repère : viewBox 600 x 900 du personnage.
 */

const OUT = '#1b1b2f';
const SW = 9;

export type Pt = [number, number];

/** Angles d'un bras articulé, en degrés.
 *  `epaule` : 0 = bras le long du corps, 90 = horizontal vers l'extérieur, 180 = levé ; négatif = vers l'intérieur.
 *  `coude` : rotation de l'avant-bras par rapport au bras (même sens). */
export type BrasAngles = {
  epaule: number;
  coude: number;
  /** Nombre de doigts levés (compter sur ses doigts), 0 à 5. */
  doigts?: number;
  /** Main ouverte (saluer, taper dans la main). */
  ouverte?: boolean;
  /** Index tendu dans le prolongement de l'avant-bras (pointer). */
  index?: boolean;
  /** Pouce levé. */
  pouce?: boolean;
};

export type ObjetTenu =
  // ep13
  | 'appareil' | 'objectif' | 'bouquet' | 'album' | 'sac_photo'
  // ep14
  | 'machine_tatouage' | 'tablette' | 'valise' | 'cle'
  // ep15
  | 'chronometre' | 'bouteille' | 'haltere' | 'elastique' | 'tapis_roule'
  // ep16
  | 'cle_molette' | 'caisse_outils' | 'panier' | 'carte_paiement' | 'recu' | 'attestation' | 'pistolet'
  // ep17
  | 'raclette' | 'perche' | 'seau' | 'pulverisateur' | 'microfibre'
  | 'manette'
  | 'telephone'
  | 'telephone_b'
  | 'ordinateur'
  | 'contrat'
  | 'stylo'
  | 'feutre'
  | 'tasse'
  | 'billets'
  | 'enveloppe'
  | 'cheque'
  | 'dossier'
  | 'pastille_compte'
  | 'pastille_revenus'
  | 'pastille_contenu'
  | 'pastilles'
  | 'pancarte'
  | 'calculatrice'
  | 'sac'
  | 'papiers'
  // ep11
  | 'ciseaux'
  | 'peigne'
  | 'trousse'
  | 'agenda'
  | 'carnet'
  | 'calepin'
  | 'note'
  | 'flacon'
  | 'serviette'
  | 'miroir'
  | 'pinceau'
  | 'postit'
  | 'diplome'
  | 'tampon';

/** État du mouvement à l'image courante (calculé par le calque Acteurs à partir des actions du script). */
export type Mouvement = {
  /** Phase (radians) du cycle de marche ; null/absent = immobile sur ses jambes. */
  marche?: number | null;
  bras?: {l?: BrasAngles; r?: BrasAngles};
  /** Objet tenu dans chaque main (l = main à gauche de l'écran, r = à droite, avant miroir). */
  objets?: {l?: ObjetTenu | null; r?: ObjetTenu | null};
  /** Texte de l'objet (chèque, pancarte). */
  texteObjet?: {l?: string; r?: string};
  /** Tête : rotation (inclinaison, degrés) et décalage vertical (hochement, px). */
  tete?: {rot?: number; dy?: number};
  /** Haussement d'épaules (px vers le haut). */
  epaules?: number;
  /** Miroir gauche/droite. */
  miroir?: boolean;
  /** ep11 : cape de coupe sur les épaules (couleur). */
  cape?: string | null;
  /** ep11 : clin d'œil. */
  clin?: boolean;
};

export const L_BRAS = 118;
export const L_AVANT_BRAS = 100;

const rad = (d: number) => (d * Math.PI) / 180;

/** Cinématique directe : épaule → [coude, main]. `cote` = -1 (bras à gauche de l'écran) ou 1. */
export const bras = (epaule: Pt, cote: -1 | 1, a: BrasAngles): [Pt, Pt] => {
  const e = rad(a.epaule);
  const f = rad(a.epaule + a.coude);
  const coude: Pt = [epaule[0] + cote * Math.sin(e) * L_BRAS, epaule[1] + Math.cos(e) * L_BRAS];
  const main: Pt = [coude[0] + cote * Math.sin(f) * L_AVANT_BRAS, coude[1] + Math.cos(f) * L_AVANT_BRAS];
  return [coude, main];
};

/** Bras articulé : deux segments (bras, avant-bras) avec articulation arrondie au coude. */
export const BrasArticule: React.FC<{
  epaule: Pt;
  coude: Pt;
  main: Pt;
  cote: -1 | 1;
  a: BrasAngles;
  manche: string;
  peau: string;
  /** Manche retroussée : avant-bras nu, revers roulé au coude (couleur du revers). */
  revers?: string;
  /** Poignet de sweat (couleur), manche longue jusqu'au poignet. */
  poignet?: string;
  /** Montre (couleur du boîtier) au poignet. */
  montre?: string;
  /** ep11 : rayures de marinière sur la manche (couleur). */
  rayures?: string;
  /** ep14 : gant (couleur de la main). */
  gant?: string;
  /** ep14 : motifs génériques sur l'avant-bras nu (couleur). */
  tatouage?: string;
}> = ({epaule, coude, main, cote, a, manche, peau, revers, poignet, montre, rayures, gant, tatouage}) => {
  const d1 = `M ${epaule[0]} ${epaule[1]} L ${coude[0]} ${coude[1]}`;
  const d2 = `M ${coude[0]} ${coude[1]} L ${main[0]} ${main[1]}`;
  const avantNu = !!revers;
  const f = rad(a.epaule + a.coude);
  const dir: Pt = [cote * Math.sin(f), Math.cos(f)];
  const poignetPt: Pt = [main[0] - dir[0] * 34, main[1] - dir[1] * 34];
  const angDeg = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
  return (
    <g>
      {/* contour */}
      <path d={d1} stroke={OUT} strokeWidth={62} strokeLinecap="round" />
      <path d={d2} stroke={OUT} strokeWidth={58} strokeLinecap="round" />
      <path d={d2} stroke={avantNu ? peau : manche} strokeWidth={42} strokeLinecap="round" />
      <path d={d1} stroke={manche} strokeWidth={46} strokeLinecap="round" />
      {rayures ? <path d={d1} stroke={rayures} strokeWidth={46} strokeDasharray="12 16" /> : null}
      {revers ? (
        <g>
          <circle cx={coude[0]} cy={coude[1]} r={31} fill={OUT} />
          <circle cx={coude[0]} cy={coude[1]} r={25} fill={revers} />
          <path d={`M ${coude[0] - 18} ${coude[1] - 6} q 18 10 36 0`} fill="none" stroke={OUT} strokeWidth={3} opacity={0.35} />
        </g>
      ) : (
        <circle cx={coude[0]} cy={coude[1]} r={22} fill={manche} />
      )}
      {poignet ? (
        <g transform={`rotate(${angDeg - 90} ${poignetPt[0]} ${poignetPt[1]})`}>
          <rect x={poignetPt[0] - 26} y={poignetPt[1] - 10} width={52} height={20} rx={8} fill={poignet} stroke={OUT} strokeWidth={5} />
        </g>
      ) : null}
      {montre ? (
        <g transform={`rotate(${angDeg - 90} ${poignetPt[0]} ${poignetPt[1]})`}>
          <rect x={poignetPt[0] - 24} y={poignetPt[1] - 7} width={48} height={14} rx={5} fill="#9AA1AB" stroke={OUT} strokeWidth={4} />
          <circle cx={poignetPt[0]} cy={poignetPt[1]} r={13} fill={montre} stroke={OUT} strokeWidth={5} />
          <circle cx={poignetPt[0]} cy={poignetPt[1]} r={7} fill="#F8F9FA" />
          <path d={`M ${poignetPt[0]} ${poignetPt[1]} v -5 M ${poignetPt[0]} ${poignetPt[1]} h 4`} stroke={OUT} strokeWidth={2} />
        </g>
      ) : null}
      {tatouage && avantNu ? <MotifsAvantBras coude={coude} main={main} couleur={tatouage} /> : null}
      <Main main={main} dir={dir} a={a} peau={gant ?? peau} />
    </g>
  );
};

/** Main : poing (cercle), main ouverte, doigts comptés, index tendu, pouce levé. */
export const Main: React.FC<{main: Pt; dir: Pt; a: BrasAngles; peau: string}> = ({main, dir, a, peau}) => {
  const [x, y] = main;
  const angDeg = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
  const doigts = Math.max(0, Math.min(5, Math.round(a.doigts ?? 0)));
  const ouverte = a.ouverte || doigts > 0;
  return (
    <g>
      {ouverte ? (
        // doigts en éventail vers le haut de l'écran (main tournée vers la caméra)
        <g>
          {[-2, -1, 0, 1].map((k, i) => {
            const leve = a.ouverte ? true : i < Math.min(doigts, 4);
            const h = leve ? 46 : 20;
            return (
              <rect
                key={k}
                x={x + k * 15 - 1}
                y={y - 18 - h}
                width={16}
                height={h + 16}
                rx={8}
                fill={peau}
                stroke={OUT}
                strokeWidth={5}
                transform={`rotate(${k * 9 + 4} ${x} ${y})`}
              />
            );
          })}
          {/* pouce (5e doigt) */}
          {a.ouverte || doigts >= 5 ? (
            <rect x={x - 46} y={y - 16} width={16} height={40} rx={8} fill={peau} stroke={OUT} strokeWidth={5} transform={`rotate(-50 ${x - 30} ${y})`} />
          ) : null}
        </g>
      ) : null}
      {a.index ? (
        <g transform={`rotate(${angDeg - 90} ${x} ${y})`}>
          <rect x={x - 11} y={y + 10} width={22} height={58} rx={11} fill={peau} stroke={OUT} strokeWidth={6} />
        </g>
      ) : null}
      {a.pouce ? <rect x={x - 12} y={y - 70} width={26} height={54} rx={13} fill={peau} stroke={OUT} strokeWidth={SW - 2} /> : null}
      <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
      {a.pouce ? <path d={`M ${x - 18} ${y - 6} h 34 M ${x - 18} ${y + 8} h 34`} stroke={OUT} strokeWidth={4} strokeLinecap="round" opacity={0.55} /> : null}
    </g>
  );
};

/** Jambes (ep10) : même dessin que les jambes de base, avec rotation à la hanche pour la marche. */
export const Jambes: React.FC<{
  phase: number | null;
  bas: string;
  jean?: string;
  chaussures: string;
  bande: string;
  /** ep16 : genouillères (couleur). */
  genou?: string | null;
}> = ({phase, bas, jean, chaussures, bande, genou}) => {
  const amp = phase === null ? 0 : Math.sin(phase) * 20;
  const lever = (s: number) => (phase === null ? 0 : Math.max(0, Math.sin(phase) * s) * 14);
  const jambe = (x: number, hanche: Pt, ang: number, leve: number, gauche: boolean) => (
    <g transform={`rotate(${ang} ${hanche[0]} ${hanche[1]}) translate(0 ${-leve})`}>
      <rect x={x} y={640} width={66} height={200} rx={26} fill={bas} stroke={OUT} strokeWidth={SW} />
      {jean ? (
        <g>
          <path d={`M ${gauche ? x + 4 : x + 62} 700 V 828`} stroke={jean} strokeWidth={4} strokeDasharray="10 7" />
          <rect x={x + 18} y={704} width={30} height={90} rx={15} fill="white" opacity={0.12} />
          <path d={`M ${x + 4} 812 H ${x + 62}`} stroke={jean} strokeWidth={4} strokeDasharray="8 6" />
        </g>
      ) : null}
      {genou ? <Genouillere x={x} couleur={genou} /> : null}
      {gauche ? (
        <>
          <path d="M 196 836 q 0 -34 40 -34 h 46 q 14 0 14 20 v 26 h -100 z" fill={chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <rect x={196} y={828} width={100} height={14} rx={6} fill={bande} stroke={OUT} strokeWidth={6} />
        </>
      ) : (
        <>
          <path d="M 404 836 q 0 -34 -40 -34 h -46 q -14 0 -14 20 v 26 h 100 z" fill={chaussures} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <rect x={304} y={828} width={100} height={14} rx={6} fill={bande} stroke={OUT} strokeWidth={6} />
        </>
      )}
    </g>
  );
  return (
    <g>
      {jambe(222, [255, 650], amp, lever(1), true)}
      {jambe(312, [345, 650], -amp, lever(-1), false)}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Coiffures ep10

/** Cheveux plaqués en arrière au gel (Enzo) : derrière la tête. */
export const GomineArriere: React.FC<{c: string}> = ({c}) => (
  <path d="M 150 250 Q 136 112 300 92 Q 464 112 450 250 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);

/** Cheveux plaqués en arrière au gel : front dégagé, volume sur le dessus, traces de peigne, reflets brillants. */
export const GomineAvant: React.FC<{c: string}> = ({c}) => (
  <g>
    <path
      d="M 154 262 Q 146 150 214 112 Q 300 66 386 112 Q 454 150 446 262 Q 436 214 412 194 Q 394 168 360 164 Q 300 150 240 164 Q 206 168 188 194 Q 164 214 154 262 Z"
      fill={c}
      stroke={OUT}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
    {/* traces de peigne vers l'arrière */}
    <path d="M 232 166 Q 226 126 262 98 M 270 158 Q 270 118 300 90 M 314 156 Q 322 116 350 98 M 356 164 Q 372 132 396 120" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={5} strokeLinecap="round" />
    {/* brillance du gel */}
    <path d="M 210 150 Q 250 104 320 98" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={9} strokeLinecap="round" />
    <path d="M 360 124 Q 392 138 410 166" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={6} strokeLinecap="round" />
    {/* côtés courts */}
    <path d="M 156 250 Q 158 214 176 196 L 182 236 Q 172 252 172 280 Z M 444 250 Q 442 214 424 196 L 418 236 Q 428 252 428 280 Z" fill={c} opacity={0.75} />
  </g>
);

/** Lunettes de soleil aviateur relevées dans les cheveux (monture argentée, verres fumés). */
export const AviateurReleve: React.FC<{monture: string; verre: string}> = ({monture, verre}) => (
  <g transform="translate(0 -6)">
    {[
      [238, -1],
      [362, 1],
    ].map(([cx, s]) => (
      <g key={cx}>
        <path
          d={`M ${cx - 44} 120 Q ${cx} 108 ${cx + 44} 120 Q ${cx + 46 * s} 162 ${cx + 6 * s} 172 Q ${cx - 40 * s} 168 ${cx - 46 * s} 132 Z`}
          fill={verre}
          stroke={OUT}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d={`M ${cx - 44} 120 Q ${cx} 108 ${cx + 44} 120 Q ${cx + 46 * s} 162 ${cx + 6 * s} 172 Q ${cx - 40 * s} 168 ${cx - 46 * s} 132 Z`}
          fill="none"
          stroke={monture}
          strokeWidth={3}
        />
        <path d={`M ${cx - 26} 126 q 12 -6 26 -4`} stroke="white" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      </g>
    ))}
    {/* double pont */}
    <path d="M 282 118 Q 300 110 318 118 M 284 128 Q 300 122 316 128" fill="none" stroke={OUT} strokeWidth={7} strokeLinecap="round" />
    <path d="M 282 118 Q 300 110 318 118" fill="none" stroke={monture} strokeWidth={3} strokeLinecap="round" />
    {/* branches qui disparaissent dans les cheveux */}
    <path d="M 194 124 L 168 140 M 406 124 L 432 140" stroke={monture} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** Longs cheveux bouclés (Luna) : masse arrière jusque sous les épaules, bords en boucles, mèches caramel. */
export const LongBoucleArriere: React.FC<{c: string; meches: string; frame: number}> = ({c, meches, frame}) => {
  const sway = Math.sin(frame / 13) * 3;
  const bord: Pt[] = [];
  for (let k = 0; k <= 12; k++) {
    const u = k / 12;
    bord.push([116 + u * 368 + (u < 0.5 ? -1 : 1) * Math.sin(u * Math.PI) * 10, 560 + Math.sin(u * Math.PI) * 26]);
  }
  return (
    <g transform={`rotate(${sway} 300 150)`}>
      <path d="M 300 92 Q 130 100 122 260 Q 104 420 112 560 L 488 560 Q 496 420 478 260 Q 470 100 300 92 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {bord.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={26} fill={c} stroke={OUT} strokeWidth={SW - 2} />
      ))}
      {[116, 484].map((x, i) =>
        [300, 360, 420, 480].map((y, j) => <circle key={`${i}-${j}`} cx={x + (i ? 1 : -1) * 6} cy={y} r={24} fill={c} stroke={OUT} strokeWidth={SW - 2} />),
      )}
      <path d="M 120 300 L 480 300 L 488 560 L 112 560 Z" fill={c} />
      {/* mèches caramel en spirales */}
      {[
        [150, 300],
        [148, 420],
        [190, 520],
        [450, 320],
        [452, 440],
        [410, 530],
      ].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} q 18 14 0 28 q -18 14 0 28 q 18 14 0 28`} fill="none" stroke={meches} strokeWidth={9} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const LongBoucleAvant: React.FC<{c: string; meches: string}> = ({c, meches}) => (
  <g>
    {/* dessus avec raie sur le côté, volume bouclé */}
    <path
      d="M 150 300 Q 132 140 270 104 Q 300 98 330 102 Q 468 128 450 300 Q 440 236 410 208 Q 380 190 352 188 Q 316 150 270 168 Q 230 178 206 200 Q 166 230 150 300 Z"
      fill={c}
      stroke={OUT}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
    <path d="M 268 108 Q 262 140 272 168" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={5} strokeLinecap="round" />
    <path d="M 196 160 q 20 -30 60 -40 M 330 120 q 50 6 80 44" fill="none" stroke={meches} strokeWidth={10} strokeLinecap="round" />
    {/* boucles qui encadrent le visage et retombent devant les épaules */}
    {[-1, 1].map((s) => (
      <g key={s}>
        <path
          d={`M ${300 + s * 150} 250 q ${s * 30} 40 ${s * 6} 80 q ${s * 30} 40 ${s * 4} 84 q ${s * 32} 40 ${s * 4} 86 q ${s * 30} 34 ${s * -6} 60`}
          fill="none"
          stroke={OUT}
          strokeWidth={50}
          strokeLinecap="round"
        />
        <path
          d={`M ${300 + s * 150} 250 q ${s * 30} 40 ${s * 6} 80 q ${s * 30} 40 ${s * 4} 84 q ${s * 32} 40 ${s * 4} 86 q ${s * 30} 34 ${s * -6} 60`}
          fill="none"
          stroke={c}
          strokeWidth={36}
          strokeLinecap="round"
        />
        <path
          d={`M ${300 + s * 156} 300 q ${s * 18} 24 ${s * 2} 50 M ${300 + s * 158} 420 q ${s * 18} 24 ${s * 2} 50`}
          fill="none"
          stroke={meches}
          strokeWidth={8}
          strokeLinecap="round"
        />
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------------------
// Vêtements ep10

/** Col et patte de boutonnage d'une chemise. */
export const Chemise: React.FC<{ombre: string}> = ({ombre}) => (
  <g>
    <path d="M 300 430 V 690" stroke={ombre} strokeWidth={6} />
    {[470, 530, 590, 650].map((y) => (
      <circle key={y} cx={300} cy={y} r={6} fill="#F1F3F5" stroke={OUT} strokeWidth={3} />
    ))}
    <path d="M 250 406 L 300 440 L 278 470 Z" fill="white" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 350 406 L 300 440 L 322 470 Z" fill="white" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Doudoune sans manches, ouverte devant : pans matelassés, col montant. */
export const Doudoune: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => {
  const gauche = 'M 186 470 Q 184 412 246 404 L 270 404 Q 282 500 280 600 L 278 700 Q 226 698 176 688 Z';
  const droite = 'M 414 470 Q 416 412 354 404 L 330 404 Q 318 500 320 600 L 322 700 Q 374 698 424 688 Z';
  return (
    <g>
      <clipPath id="doudoune-pans">
        <path d={gauche} />
        <path d={droite} />
      </clipPath>
      {[gauche, droite].map((d, i) => (
        <path key={i} d={d} fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      ))}
      <g clipPath="url(#doudoune-pans)">
        {[466, 522, 578, 634].map((y) => (
          <path key={y} d={`M 170 ${y} Q 230 ${y + 12} 290 ${y} M 310 ${y} Q 370 ${y + 12} 430 ${y}`} fill="none" stroke={ombre} strokeWidth={6} strokeLinecap="round" />
        ))}
        {[440, 494, 550, 606, 662].map((y) => (
          <path key={y} d={`M 196 ${y} q 30 -8 60 0 M 344 ${y} q 30 -8 60 0`} fill="none" stroke="white" strokeWidth={5} opacity={0.22} strokeLinecap="round" />
        ))}
        <path d="M 176 470 Q 192 560 188 700 L 176 700 Z M 424 470 Q 408 560 412 700 L 424 700 Z" fill={ombre} />
      </g>
      {[gauche, droite].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      ))}
      {/* fermetures éclair des bords */}
      <path d="M 276 420 L 278 690 M 324 420 L 322 690" stroke="#ADB5BD" strokeWidth={3} strokeDasharray="5 5" />
      {/* col montant */}
      <path d="M 236 408 Q 238 382 262 380 L 270 404 Z" fill={couleur} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 364 408 Q 362 382 338 380 L 330 404 Z" fill={couleur} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

/** Sweat à col rond (sans capuche) : col côtelé, bas côtelé. */
export const SweatColRond: React.FC<{ombre: string}> = ({ombre}) => (
  <g>
    <path d="M 176 682 Q 300 706 424 682 L 428 694 Q 300 716 172 694 Z" fill={ombre} />
    <path d="M 244 412 Q 300 458 356 412" fill="none" stroke={OUT} strokeWidth={28} strokeLinecap="round" />
    <path d="M 244 412 Q 300 458 356 412" fill="none" stroke={ombre} strokeWidth={16} strokeLinecap="round" />
    <path d="M 236 560 Q 250 610 242 660 M 364 560 Q 350 610 358 660" fill="none" stroke={ombre} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** Écouteurs tour de cou (sans logo) : tour de cou fin et deux écouteurs pendants. */
export const EcouteursCou: React.FC<{couleur: string; embouts: string}> = ({couleur, embouts}) => (
  <g>
    <path d="M 232 416 Q 300 462 368 416" fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
    <path d="M 232 416 Q 300 462 368 416" fill="none" stroke={couleur} strokeWidth={7} strokeLinecap="round" />
    {[
      [232, 416, 222],
      [368, 416, 384],
    ].map(([x, y, bx]) => (
      <g key={x}>
        <path d={`M ${x} ${y} Q ${bx} ${y + 40} ${bx} ${y + 70}`} fill="none" stroke={couleur} strokeWidth={4} />
        <ellipse cx={bx} cy={y + 80} rx={11} ry={13} fill={embouts} stroke={OUT} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Bretelles d'un petit sac à dos. */
export const BretellesSac: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    {/* haut du sac qui dépasse derrière les épaules */}
    <path d="M 214 418 Q 214 392 240 390 L 360 390 Q 386 392 386 418 Z" fill={ombre} stroke={OUT} strokeWidth={6} />
    <path d="M 226 414 Q 234 520 230 610 M 374 414 Q 366 520 370 610" fill="none" stroke={OUT} strokeWidth={22} strokeLinecap="round" />
    <path d="M 226 414 Q 234 520 230 610 M 374 414 Q 366 520 370 610" fill="none" stroke={couleur} strokeWidth={13} strokeLinecap="round" />
    <rect x={220} y={540} width={20} height={14} rx={3} fill="#ADB5BD" stroke={OUT} strokeWidth={3} />
    <rect x={360} y={540} width={20} height={14} rx={3} fill="#ADB5BD" stroke={OUT} strokeWidth={3} />
  </g>
);

/** Chaise de bureau à roulettes, vue de face, derrière un personnage assis. */
export const ChaiseBureau: React.FC<{couleur: string; tourne?: number}> = ({couleur, tourne = 0}) => (
  <g>
    <rect x={200} y={360} width={200} height={300} rx={50} fill={couleur} stroke={OUT} strokeWidth={SW} />
    <rect x={180} y={720} width={240} height={46} rx={20} fill={couleur} stroke={OUT} strokeWidth={SW} />
    <rect x={288} y={766} width={24} height={60} fill="#495057" stroke={OUT} strokeWidth={6} />
    <path d="M 200 840 L 400 840 M 300 826 L 300 846" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
    {[210, 300, 390].map((x, i) => (
      <g key={x} transform={`rotate(${tourne * 40 + i * 30} ${x} 860)`}>
        <circle cx={x} cy={860} r={16} fill="#343A40" stroke={OUT} strokeWidth={5} />
        <path d={`M ${x - 8} 860 h 16`} stroke="#ADB5BD" strokeWidth={3} />
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------------------
// Objets tenus en main (dessinés à la position de la main, la main redessinée par-dessus)

const BulleGenerique: React.FC<{x: number; y: number; w: number; droite?: boolean; couleur?: string}> = ({x, y, w, droite, couleur = 'white'}) => (
  <rect x={droite ? x - w : x} y={y} width={w} height={12} rx={6} fill={couleur} />
);

export const ObjetMain: React.FC<{nom: ObjetTenu; main: Pt; peau: string; miroir: boolean; texte?: string; frame: number}> = ({nom, main, peau, miroir, texte, frame}) => {
  const [x, y] = main;
  // contre-miroir pour les textes (le personnage peut être retourné)
  const lisible = (cx: number, cy: number) => (miroir ? `translate(${cx} ${cy}) scale(-1 1) translate(${-cx} ${-cy})` : undefined);
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'telephone':
    case 'telephone_b': {
      const coque = nom === 'telephone' ? '#2B2D42' : '#E9ECEF';
      return (
        <g transform={`rotate(-8 ${x} ${y})`}>
          <rect x={x - 34} y={y - 112} width={68} height={124} rx={12} fill={coque} stroke={OUT} strokeWidth={7} />
          <rect x={x - 26} y={y - 102} width={52} height={96} rx={6} fill="#CDE7F7" />
          <BulleGenerique x={x - 22} y={y - 92} w={30} />
          <BulleGenerique x={x + 22} y={y - 74} w={26} droite couleur="#FFD60A" />
          <BulleGenerique x={x - 22} y={y - 56} w={34} />
          <BulleGenerique x={x + 22} y={y - 38} w={22} droite couleur="#FFD60A" />
          {mainDessus}
        </g>
      );
    }
    case 'ordinateur':
      // ordinateur portable fermé, tenu contre soi (sans logo)
      return (
        <g transform={`rotate(-12 ${x} ${y})`}>
          <rect x={x - 90} y={y - 64} width={180} height={122} rx={14} fill="#C9CED6" stroke={OUT} strokeWidth={7} />
          <rect x={x - 90} y={y + 44} width={180} height={14} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    case 'contrat':
    case 'papiers':
      return (
        <g transform={`rotate(${nom === 'papiers' ? 8 : -6} ${x} ${y})`}>
          {nom === 'papiers' ? <rect x={x - 46} y={y - 128} width={96} height={128} rx={6} fill="#E9ECEF" stroke={OUT} strokeWidth={5} transform={`rotate(8 ${x} ${y - 64})`} /> : null}
          <rect x={x - 50} y={y - 134} width={100} height={134} rx={6} fill="white" stroke={OUT} strokeWidth={6} />
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              {nom === 'contrat' ? <rect x={x - 38} y={y - 118 + k * 26} width={14} height={14} rx={3} fill="none" stroke={OUT} strokeWidth={3} /> : null}
              <rect x={x - (nom === 'contrat' ? 18 : 38)} y={y - 114 + k * 26} width={nom === 'contrat' ? 54 : 74} height={7} rx={3} fill="#CED4DA" />
            </g>
          ))}
          {mainDessus}
        </g>
      );
    case 'stylo':
    case 'feutre':
      return (
        <g transform={`rotate(${nom === 'stylo' ? -30 : -20} ${x} ${y})`}>
          <rect x={x - (nom === 'feutre' ? 9 : 6)} y={y - 78} width={nom === 'feutre' ? 18 : 12} height={92} rx={5} fill={nom === 'feutre' ? '#2B2D42' : '#3A86FF'} stroke={OUT} strokeWidth={4} />
          <path d={`M ${x - 5} ${y - 78} L ${x} ${y - 94} L ${x + 5} ${y - 78} Z`} fill={nom === 'feutre' ? '#E63946' : '#F1F3F5'} stroke={OUT} strokeWidth={3} />
          {mainDessus}
        </g>
      );
    case 'tasse':
      return (
        <g>
          <path d={`M ${x - 30} ${y - 74} L ${x + 30} ${y - 74} L ${x + 24} ${y - 8} Q ${x} ${y} ${x - 24} ${y - 8} Z`} fill="#F8F9FA" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <rect x={x - 34} y={y - 86} width={68} height={16} rx={6} fill="#6F4E37" stroke={OUT} strokeWidth={5} />
          <rect x={x - 28} y={y - 50} width={56} height={18} fill="#E9C46A" />
          {[0, 1].map((k) => (
            <path key={k} d={`M ${x - 10 + k * 18} ${y - 96} q -8 -16 0 -32`} fill="none" stroke="#ADB5BD" strokeWidth={5} strokeLinecap="round" opacity={0.4 + Math.sin(frame / 6 + k) * 0.35} />
          ))}
          {mainDessus}
        </g>
      );
    case 'billets':
      return (
        <g>
          {[-14, 0, 14].map((r, k) => (
            <g key={k} transform={`rotate(${r} ${x} ${y})`}>
              <rect x={x - 26} y={y - 110} width={52} height={96} rx={6} fill={k === 1 ? '#95D5B2' : '#74C69D'} stroke={OUT} strokeWidth={5} />
              <circle cx={x} cy={y - 62} r={12} fill="none" stroke="#2D6A4F" strokeWidth={4} />
            </g>
          ))}
          {mainDessus}
        </g>
      );
    case 'enveloppe':
      return (
        <g transform={`rotate(-8 ${x} ${y})`}>
          <rect x={x - 70} y={y - 96} width={140} height={90} rx={8} fill="#E9C46A" stroke={OUT} strokeWidth={6} />
          <path d={`M ${x - 70} ${y - 96} L ${x} ${y - 46} L ${x + 70} ${y - 96}`} fill="none" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
          <text x={x} y={y - 18} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={26} fill={OUT} transform={lisible(x, y - 28)}>
            €
          </text>
          {mainDessus}
        </g>
      );
    case 'cheque':
      // grand chèque générique, tenu par son bord gauche
      return (
        <g>
          <g transform={`rotate(-4 ${x} ${y})`}>
            <g transform={lisible(x + 150, y - 70)}>
              <rect x={x - 20} y={y - 150} width={340} height={160} rx={12} fill="#FFF3B0" stroke={OUT} strokeWidth={7} />
              <rect x={x} y={y - 136} width={140} height={12} rx={6} fill="#E9C46A" />
              <text x={x + 150} y={y - 46} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={64} fill="#1F9D55" stroke={OUT} strokeWidth={3} paintOrder="stroke">
                {texte ?? ''}
              </text>
              <path d={`M ${x + 170} ${y - 14} q 30 -20 60 0 q 30 20 60 -6`} fill="none" stroke="#3A86FF" strokeWidth={4} strokeLinecap="round" />
            </g>
          </g>
          {mainDessus}
        </g>
      );
    case 'dossier':
      return (
        <g transform={`rotate(10 ${x} ${y})`}>
          <rect x={x - 30} y={y - 150} width={120} height={170} rx={8} fill="#D4A373" stroke={OUT} strokeWidth={6} />
          <rect x={x - 22} y={y - 160} width={56} height={22} rx={6} fill="#D4A373" stroke={OUT} strokeWidth={5} />
          <rect x={x - 18} y={y - 140} width={100} height={150} rx={4} fill="white" opacity={0.5} />
          {mainDessus}
        </g>
      );
    case 'pastille_compte':
    case 'pastille_revenus':
    case 'pastille_contenu':
    case 'pastilles': {
      const coul: Record<string, string> = {pastille_compte: '#4361EE', pastille_revenus: '#1F9D55', pastille_contenu: '#FF70A6'};
      const liste = nom === 'pastilles' ? ['pastille_compte', 'pastille_revenus', 'pastille_contenu'] : [nom];
      return (
        <g>
          {liste.map((n, k) => (
            <g key={n}>
              <circle cx={x + (k - (liste.length - 1) / 2) * 34} cy={y - 50 - k * 6} r={32} fill={coul[n]} stroke={OUT} strokeWidth={6} />
              <circle cx={x + (k - (liste.length - 1) / 2) * 34 - 10} cy={y - 60 - k * 6} r={8} fill="white" opacity={0.6} />
            </g>
          ))}
          {mainDessus}
        </g>
      );
    }
    case 'pancarte':
      return (
        <g>
          <rect x={x - 8} y={y - 150} width={16} height={170} rx={4} fill="#BC6C25" stroke={OUT} strokeWidth={5} />
          <g transform={lisible(x, y - 200)}>
            <rect x={x - 130} y={y - 270} width={260} height={130} rx={14} fill="white" stroke={OUT} strokeWidth={8} />
            <text x={x} y={y - 218} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={40} fill="#1F9D55">
              {(texte ?? '').split('\n')[0]}
            </text>
            <text x={x} y={y - 170} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={40} fill="#1F9D55">
              {(texte ?? '').split('\n')[1] ?? ''}
            </text>
          </g>
          {mainDessus}
        </g>
      );
    case 'calculatrice':
      return (
        <g transform={`rotate(-6 ${x} ${y})`}>
          <rect x={x - 46} y={y - 132} width={92} height={128} rx={12} fill="#495057" stroke={OUT} strokeWidth={6} />
          <rect x={x - 34} y={y - 120} width={68} height={28} rx={4} fill="#B7E4C7" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={x - 34 + c * 24} y={y - 84 + r * 24} width={18} height={16} rx={3} fill={(frame + r * 3 + c * 5) % 20 < 3 ? '#FFD60A' : '#DEE2E6'} />
            )),
          )}
          {mainDessus}
        </g>
      );
    case 'sac':
      return (
        <g>
          <path d={`M ${x - 18} ${y} Q ${x} ${y - 30} ${x + 18} ${y}`} fill="none" stroke={OUT} strokeWidth={8} />
          <rect x={x - 56} y={y + 6} width={112} height={128} rx={30} fill="#B392D9" stroke={OUT} strokeWidth={7} />
          <rect x={x - 36} y={y + 64} width={72} height={46} rx={12} fill="#9D7CC4" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    default:
      // ep11 : objets supplémentaires (ciseaux, peigne, trousse, agenda…)
      return <ObjetMainEp11 nom={nom} main={main} peau={peau} miroir={miroir} texte={texte} frame={frame} />;
  }
};

// ---------------------------------------------------------------------------
// ep11 : coiffures, vêtements et objets (Lina, coiffeuse à domicile, et personnages secondaires). Tout est optionnel.

/** Coupe pixie (Lina) : petite calotte derrière la tête. */
export const PixieArriere: React.FC<{c: string}> = ({c}) => (
  <path d="M 158 252 Q 150 118 300 106 Q 450 118 442 252 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);

/** Coupe pixie décolorée : dessus texturé en mèches pointues, frange balayée sur le côté, côtés courts (oreilles dégagées),
 *  racines un peu plus foncées. */
export const PixieAvant: React.FC<{c: string; racines: string}> = ({c, racines}) => (
  <g>
    <path
      d="M 156 252 Q 140 150 214 112 L 232 84 L 252 104 L 276 72 L 298 98 L 326 70 L 344 100 L 372 82 L 384 114 Q 456 146 444 252 Q 438 214 422 198 Q 404 214 380 206 Q 350 196 322 210 Q 286 230 244 228 Q 204 226 182 214 Q 166 226 156 252 Z"
      fill={c}
      stroke={OUT}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
    {/* racines plus foncées au sommet */}
    <path d="M 236 112 Q 300 88 366 108" fill="none" stroke={racines} strokeWidth={10} strokeLinecap="round" opacity={0.55} />
    {/* mèches de la frange balayée */}
    <path d="M 214 140 Q 262 160 316 200 M 262 120 Q 316 150 356 196 M 330 112 Q 380 140 410 190" fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth={5} strokeLinecap="round" />
    <path d="M 220 130 Q 270 116 330 120" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Cheveux mi-longs raie au milieu (cliente A) : masse jusqu'aux épaules. */
export const MiLongArriere: React.FC<{c: string; frame: number}> = ({c, frame}) => {
  const sway = Math.sin(frame / 12) * 2;
  return <path d={`M 300 100 Q 136 106 130 260 Q 124 380 ${140 + sway} 476 L ${460 + sway} 476 Q 476 380 470 260 Q 464 106 300 100 Z`} fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />;
};

export const MiLongAvant: React.FC<{c: string}> = ({c}) => (
  <g>
    <path
      d="M 300 110 Q 176 118 154 252 Q 144 340 156 436 Q 178 440 188 392 Q 190 262 232 192 Q 268 148 300 128 Q 332 148 368 192 Q 410 262 412 392 Q 422 440 444 436 Q 456 340 446 252 Q 424 118 300 110 Z"
      fill={c}
      stroke={OUT}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
    <path d="M 300 112 V 130" stroke="rgba(0,0,0,0.25)" strokeWidth={5} />
    <path d="M 200 200 Q 176 300 176 400 M 400 200 Q 424 300 424 400" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** Longs cheveux lisses (cliente B) : masse jusqu'au milieu du dos. */
export const LongLisseArriere: React.FC<{c: string; frame: number}> = ({c, frame}) => {
  const sway = Math.sin(frame / 13) * 3;
  return <path d={`M 300 96 Q 128 104 124 260 L ${118 + sway} 600 L ${482 + sway} 600 L 476 260 Q 472 104 300 96 Z`} fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />;
};

export const LongLisseAvant: React.FC<{c: string}> = ({c}) => (
  <g>
    <path d="M 152 292 Q 138 128 300 106 Q 462 128 448 292 Q 432 218 384 178 Q 334 146 300 150 Q 266 146 216 178 Q 168 218 152 292 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {[-1, 1].map((s) => (
      <path
        key={s}
        d={`M ${300 + s * 150} 250 L ${300 + s * 160} 604 Q ${300 + s * 130} 616 ${300 + s * 102} 604 L ${300 + s * 106} 330 Q ${300 + s * 112} 280 ${300 + s * 126} 250 Z`}
        fill={c}
        stroke={OUT}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    ))}
    <path d="M 220 150 Q 260 130 300 128" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={8} strokeLinecap="round" />
    <path d="M 172 330 V 560 M 428 330 V 560" stroke="rgba(255,255,255,0.18)" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Cheveux courts bouclés (voisine) : calotte de petites boucles. */
export const CourtOnduleArriere: React.FC<{c: string}> = ({c}) => (
  <path d="M 150 262 Q 138 108 300 98 Q 462 108 450 262 Z" fill={c} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
);

export const CourtOnduleAvant: React.FC<{c: string}> = ({c}) => {
  const pts: Pt[] = [];
  for (let k = 0; k <= 8; k++) {
    const a = Math.PI + (k / 8) * Math.PI;
    pts.push([300 + Math.cos(a) * 140, 238 + Math.sin(a) * 118]);
  }
  return (
    <g>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={36} fill={c} stroke={OUT} strokeWidth={SW - 2} />
      ))}
      <path d="M 170 246 Q 170 140 300 132 Q 430 140 430 246 Q 300 196 170 246 Z" fill={c} />
      {pts.slice(1, 8).map(([x, y], i) => (
        <path key={i} d={`M ${x - 12} ${y + 6} q 12 -14 24 0`} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={4} strokeLinecap="round" />
      ))}
    </g>
  );
};

/** Rayures horizontales de marinière, à placer dans un clipPath du torse. */
export const RayuresTorse: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    {Array.from({length: 10}).map((_, k) => (
      <rect key={k} x={150} y={432 + k * 30} width={300} height={13} fill={couleur} />
    ))}
  </g>
);

/** Tablier de coiffure noir : bavette, bretelle de cou, lien à la taille, poche avec ciseaux et peigne. */
export const TablierCoiffure: React.FC<{couleur: string; poche: string}> = ({couleur, poche}) => (
  <g>
    <path d="M 252 444 Q 246 410 268 402 M 348 444 Q 354 410 332 402" fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
    <path d="M 252 444 Q 246 410 268 402 M 348 444 Q 354 410 332 402" fill="none" stroke={couleur} strokeWidth={7} strokeLinecap="round" />
    <path d="M 244 442 L 356 442 L 366 566 Q 384 640 398 800 Q 300 818 202 800 Q 216 640 234 566 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    {/* lien à la taille */}
    <path d="M 234 568 Q 300 580 366 568" fill="none" stroke="#3A3A44" strokeWidth={6} />
    <path d="M 204 572 L 234 568 M 396 572 L 366 568" stroke={couleur} strokeWidth={10} strokeLinecap="round" />
    {/* surpiqûres */}
    <path d="M 256 456 H 344 M 214 786 Q 300 802 386 786" fill="none" stroke="#6C757D" strokeWidth={3} strokeDasharray="8 6" />
    {/* ciseaux et peigne qui dépassent de la poche */}
    <g>
      <path d="M 270 646 L 284 588 M 284 646 L 272 588" stroke="#CED4DA" strokeWidth={7} strokeLinecap="round" />
      <path d="M 270 646 L 284 588 M 284 646 L 272 588" stroke={OUT} strokeWidth={2} strokeLinecap="round" />
      <circle cx={268} cy={580} r={10} fill="none" stroke="#E76F51" strokeWidth={6} />
      <circle cx={290} cy={580} r={10} fill="none" stroke="#E76F51" strokeWidth={6} />
      <rect x={318} y={590} width={16} height={60} rx={4} fill="#F1F3F5" stroke={OUT} strokeWidth={4} />
      {[600, 612, 624, 636].map((y) => (
        <path key={y} d={`M 334 ${y} h 8`} stroke={OUT} strokeWidth={3} />
      ))}
    </g>
    <rect x={244} y={622} width={112} height={78} rx={10} fill={poche} stroke={OUT} strokeWidth={6} />
    <path d="M 252 634 H 348" stroke="#6C757D" strokeWidth={3} strokeDasharray="7 5" />
  </g>
);

/** Peigne glissé derrière l'oreille (à droite de l'écran). */
export const PeigneOreille: React.FC<{couleur: string}> = ({couleur}) => (
  <g transform="rotate(-62 452 238)">
    <rect x={412} y={228} width={86} height={18} rx={5} fill={couleur} stroke={OUT} strokeWidth={5} />
    {Array.from({length: 9}).map((_, k) => (
      <path key={k} d={`M ${418 + k * 9} 246 v 12`} stroke={OUT} strokeWidth={3} strokeLinecap="round" />
    ))}
  </g>
);

/** Petit piercing (clou) au lobe de l'oreille à gauche de l'écran. */
export const Piercing: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <circle cx={146} cy={310} r={8} fill={couleur} stroke={OUT} strokeWidth={3} />
    <circle cx={143} cy={307} r={2.5} fill="white" opacity={0.7} />
  </g>
);

/** Gilet en maille ouvert (cliente A) : pans, boutons, haut visible au milieu. */
export const Cardigan: React.FC<{ombre: string; dessous: string}> = ({ombre, dessous}) => (
  <g>
    <path d="M 270 412 Q 300 440 330 412 L 334 690 Q 300 696 266 690 Z" fill={dessous} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 244 414 Q 300 452 356 414" fill="none" stroke={OUT} strokeWidth={5} opacity={0.5} />
    {[470, 530, 590, 650].map((y) => (
      <circle key={y} cx={262} cy={y} r={7} fill={ombre} stroke={OUT} strokeWidth={3} />
    ))}
    <path d="M 180 680 Q 300 702 420 680" fill="none" stroke={ombre} strokeWidth={12} />
    <path d="M 226 470 Q 236 580 230 670 M 374 470 Q 364 580 370 670" fill="none" stroke={ombre} strokeWidth={5} strokeDasharray="4 8" opacity={0.8} />
  </g>
);

/** Robe de chambre légère (voisine) : col châle, ceinture nouée, pan qui descend sous les genoux. */
export const RobeChambre: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => (
  <g>
    <path d="M 194 676 L 406 676 L 418 806 Q 300 824 182 806 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 300 700 L 306 812" stroke={ombre} strokeWidth={6} />
    <path d="M 250 410 Q 286 480 302 600 M 350 410 Q 316 480 300 600" fill="none" stroke={OUT} strokeWidth={30} strokeLinecap="round" />
    <path d="M 250 410 Q 286 480 302 600 M 350 410 Q 316 480 300 600" fill="none" stroke={ombre} strokeWidth={18} strokeLinecap="round" />
    <rect x={192} y={604} width={216} height={24} rx={10} fill={ombre} stroke={OUT} strokeWidth={6} />
    <path d="M 316 620 l 12 70 M 322 620 l 30 62" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
    <path d="M 316 620 l 12 70 M 322 620 l 30 62" stroke={ombre} strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** Veste de costume : revers et boutons (à combiner avec l'accessoire « cravate »). */
export const ReversCostume: React.FC<{ombre: string}> = ({ombre}) => (
  <g>
    <path d="M 256 412 L 292 548 L 230 456 Z M 344 412 L 308 548 L 370 456 Z" fill={ombre} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
    {[640, 676].map((y) => (
      <circle key={y} cx={300} cy={y} r={7} fill={OUT} />
    ))}
    <rect x={340} y={492} width={42} height={8} rx={3} fill={OUT} opacity={0.5} />
  </g>
);

/** Gilet beige à poches (contrôleur), ouvert devant. */
export const GiletPoches: React.FC<{couleur: string; ombre: string}> = ({couleur, ombre}) => {
  const gauche = 'M 190 468 Q 190 414 248 406 L 270 406 Q 280 520 278 690 Q 226 692 182 682 Z';
  const droite = 'M 410 468 Q 410 414 352 406 L 330 406 Q 320 520 322 690 Q 374 692 418 682 Z';
  return (
    <g>
      {[gauche, droite].map((d, i) => (
        <path key={i} d={d} fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      ))}
      {[
        [200, 470],
        [334, 470],
        [198, 580],
        [330, 580],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={66} height={70} rx={6} fill={ombre} stroke={OUT} strokeWidth={5} />
          <rect x={x} y={y} width={66} height={20} rx={5} fill={couleur} stroke={OUT} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

/** Cape de coupe posée sur les épaules d'une cliente assise (cache le buste et les bras). */
export const CapeCoupe: React.FC<{couleur: string}> = ({couleur}) => (
  <g>
    <path d="M 232 412 Q 300 446 368 412 L 482 724 Q 300 772 118 724 Z" fill={couleur} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 200 520 Q 190 620 178 716 M 400 520 Q 410 620 422 716" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={6} strokeLinecap="round" />
    <path d="M 236 416 Q 300 450 364 416" fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Clin d'œil : l'œil à droite de l'écran se ferme en arc. */
export const ClinOeil: React.FC<{peau: string}> = ({peau}) => (
  <g>
    <ellipse cx={355} cy={272} rx={48} ry={58} fill={peau} />
    <path d="M 316 278 Q 355 300 394 278" fill="none" stroke={OUT} strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** Objets tenus en main ajoutés en ep11 (dessinés à la position de la main, la main redessinée par-dessus). */
export const ObjetMainEp11: React.FC<{nom: string; main: Pt; peau: string; miroir: boolean; texte?: string; frame: number}> = ({nom, main, peau, miroir, texte, frame}) => {
  const [x, y] = main;
  const lisible = (cx: number, cy: number) => (miroir ? `translate(${cx} ${cy}) scale(-1 1) translate(${-cx} ${-cy})` : undefined);
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'ciseaux': {
      const op = 6 + Math.abs(Math.sin(frame * 0.7)) * 22;
      return (
        <g transform={`translate(${x} ${y}) rotate(-28)`}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`rotate(${s * op * 0.5} 24 0)`}>
              <path d={`M 0 ${s * 12} L 24 0`} stroke="#E76F51" strokeWidth={10} strokeLinecap="round" />
              <path d={`M 22 ${-s * 5} L 112 ${s * 1} L 22 ${s * 6} Z`} fill="#DEE2E6" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
            </g>
          ))}
          <circle cx={24} cy={0} r={5} fill={OUT} />
          <circle cx={0} cy={0} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
        </g>
      );
    }
    case 'peigne':
      return (
        <g transform={`translate(${x} ${y}) rotate(-20)`}>
          <rect x={14} y={-24} width={100} height={18} rx={5} fill="#3A3A44" stroke={OUT} strokeWidth={5} />
          {Array.from({length: 11}).map((_, k) => (
            <path key={k} d={`M ${22 + k * 8.5} -6 v 14`} stroke={OUT} strokeWidth={3} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
        </g>
      );
    case 'trousse':
      return (
        <g>
          <path d={`M ${x - 22} ${y + 6} Q ${x} ${y - 28} ${x + 22} ${y + 6}`} fill="none" stroke={OUT} strokeWidth={9} />
          <rect x={x - 78} y={y + 8} width={156} height={96} rx={18} fill="#2A9D8F" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - 64} ${y + 30} H ${x + 64}`} stroke="#E9ECEF" strokeWidth={4} strokeDasharray="6 4" />
          <rect x={x + 40} y={y + 22} width={14} height={18} rx={3} fill="#E9C46A" stroke={OUT} strokeWidth={3} />
          <rect x={x - 54} y={y + 50} width={108} height={36} rx={8} fill="#21867A" stroke={OUT} strokeWidth={4} />
          {mainDessus}
        </g>
      );
    case 'agenda': {
      // agenda ouvert tenu devant soi ; une page tourne régulièrement
      const p = (frame % 40) / 40;
      const flip = p < 0.35 ? Math.cos((p / 0.35) * Math.PI) : 1;
      return (
        <g>
          <g transform={lisible(x, y - 70)}>
            <rect x={x - 104} y={y - 136} width={208} height={132} rx={10} fill="#C1121F" stroke={OUT} strokeWidth={7} />
            <rect x={x - 96} y={y - 128} width={92} height={116} rx={4} fill="white" stroke={OUT} strokeWidth={4} />
            <rect x={x + 4} y={y - 128} width={92} height={116} rx={4} fill="white" stroke={OUT} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k}>
                <path d={`M ${x - 86} ${y - 108 + k * 20} h 72`} stroke="#CED4DA" strokeWidth={4} />
                <path d={`M ${x + 14} ${y - 108 + k * 20} h 72`} stroke="#CED4DA" strokeWidth={4} />
              </g>
            ))}
            <rect x={x - 86} y={y - 92} width={40} height={12} rx={4} fill="#FFD60A" />
            {texte ? (
              <g>
                <rect x={x + 14} y={y - 76} width={70} height={22} rx={6} fill="#B7E4C7" stroke={OUT} strokeWidth={3} />
                <path d={`M ${x + 130} ${y - 64} H ${x + 92} M ${x + 104} ${y - 76} L ${x + 90} ${y - 64} L ${x + 104} ${y - 52}`} fill="none" stroke="#E63946" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                <text x={x + 136} y={y - 50} fontFamily="Lilita One" fontSize={38} fill="#E63946" stroke="white" strokeWidth={8} paintOrder="stroke">
                  {texte}
                </text>
              </g>
            ) : null}
            {flip < 1 ? (
              <g transform={`translate(${x} 0) scale(${flip} 1) translate(${-x} 0)`}>
                <rect x={x + 4} y={y - 128} width={92} height={116} rx={4} fill="#F8F9FA" stroke={OUT} strokeWidth={4} />
              </g>
            ) : null}
          </g>
          {mainDessus}
        </g>
      );
    }
    case 'carnet':
    case 'calepin':
      return (
        <g transform={`rotate(-8 ${x} ${y})`}>
          <rect x={x - 44} y={y - 124} width={88} height={116} rx={8} fill={nom === 'calepin' ? '#D4A373' : 'white'} stroke={OUT} strokeWidth={6} />
          <rect x={x - 36} y={y - 112} width={72} height={96} rx={4} fill="white" />
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M ${x - 28} ${y - 96 + k * 20} h 56`} stroke="#ADB5BD" strokeWidth={4} />
          ))}
          {[-24, -8, 8, 24].map((dx) => (
            <circle key={dx} cx={x + dx} cy={y - 124} r={5} fill="none" stroke={OUT} strokeWidth={3} />
          ))}
          {mainDessus}
        </g>
      );
    case 'note':
      // note (reçu) détachée du carnet
      return (
        <g transform={`rotate(6 ${x} ${y})`}>
          <rect x={x - 40} y={y - 96} width={80} height={84} rx={4} fill="white" stroke={OUT} strokeWidth={5} />
          <g transform={lisible(x, y - 78)}>
            <text x={x} y={y - 70} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={20} fill={OUT}>
              NOTE
            </text>
          </g>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${x - 28} ${y - 56 + k * 14} h 56`} stroke="#ADB5BD" strokeWidth={4} />
          ))}
          {mainDessus}
        </g>
      );
    case 'flacon':
      return (
        <g>
          <rect x={x - 10} y={y - 132} width={20} height={20} rx={4} fill="#343A40" stroke={OUT} strokeWidth={4} />
          <rect x={x - 28} y={y - 114} width={56} height={98} rx={16} fill="#8ECAE6" stroke={OUT} strokeWidth={6} />
          <rect x={x - 20} y={y - 86} width={40} height={36} rx={6} fill="white" />
          <path d={`M ${x - 12} ${y - 104} v 70`} stroke="white" strokeWidth={5} opacity={0.5} strokeLinecap="round" />
          {mainDessus}
        </g>
      );
    case 'serviette':
      return (
        <g>
          <path d={`M ${x - 20} ${y - 14} L ${x + 120} ${y - 24} Q ${x + 132} ${y + 50} ${x + 112} ${y + 100} L ${x - 6} ${y + 110} Q ${x - 24} ${y + 40} ${x - 20} ${y - 14} Z`} fill="#F8F9FA" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${x - 12} ${y + 80} L ${x + 116} ${y + 72}`} stroke="#4CC9F0" strokeWidth={8} />
          {mainDessus}
        </g>
      );
    case 'miroir':
      return (
        <g>
          <rect x={x - 9} y={y - 70} width={18} height={70} rx={6} fill="#6C584C" stroke={OUT} strokeWidth={5} />
          <ellipse cx={x} cy={y - 128} rx={52} ry={64} fill="#6C584C" stroke={OUT} strokeWidth={7} />
          <ellipse cx={x} cy={y - 128} rx={40} ry={52} fill="#CDE7F7" />
          <path d={`M ${x - 22} ${y - 150} l 30 -20 M ${x - 18} ${y - 126} l 40 -28`} stroke="white" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
          {mainDessus}
        </g>
      );
    case 'pinceau':
      return (
        <g transform={`translate(${x} ${y}) rotate(-35)`}>
          <rect x={10} y={-8} width={78} height={16} rx={6} fill="#343A40" stroke={OUT} strokeWidth={4} />
          <path d="M 86 -12 L 118 -14 L 120 14 L 86 12 Z" fill="#7B2CBF" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />
        </g>
      );
    case 'postit':
      return (
        <g transform={`rotate(-6 ${x} ${y})`}>
          <rect x={x - 36} y={y - 92} width={72} height={72} rx={4} fill="#FFD60A" stroke={OUT} strokeWidth={5} />
          <path d={`M ${x - 24} ${y - 70} h 48 M ${x - 24} ${y - 52} h 34`} stroke="#B08900" strokeWidth={4} />
          {mainDessus}
        </g>
      );
    case 'diplome':
      return (
        <g transform={`rotate(-5 ${x} ${y})`}>
          <rect x={x - 100} y={y - 170} width={200} height={150} rx={6} fill="#BC6C25" stroke={OUT} strokeWidth={7} />
          <rect x={x - 84} y={y - 154} width={168} height={118} fill="#FFFDF2" stroke={OUT} strokeWidth={3} />
          <g transform={lisible(x, y - 120)}>
            <text x={x} y={y - 116} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={26} fill={OUT}>
              {texte ?? 'DIPLÔME'}
            </text>
          </g>
          {[0, 1].map((k) => (
            <path key={k} d={`M ${x - 56} ${y - 96 + k * 16} h 112`} stroke="#ADB5BD" strokeWidth={4} />
          ))}
          <circle cx={x + 52} cy={y - 54} r={14} fill="#E63946" stroke={OUT} strokeWidth={4} />
          {mainDessus}
        </g>
      );
    case 'tampon':
      return (
        <g>
          <circle cx={x} cy={y - 62} r={20} fill="#C1121F" stroke={OUT} strokeWidth={5} />
          <rect x={x - 8} y={y - 46} width={16} height={30} fill="#6C584C" stroke={OUT} strokeWidth={4} />
          <rect x={x - 34} y={y + 10} width={68} height={22} rx={5} fill="#343A40" stroke={OUT} strokeWidth={5} />
          {mainDessus}
        </g>
      );
    default:
      if (OBJETS_EP18.has(nom)) return <ObjetMainEp18 nom={nom} main={main} frame={frame} />;
      if (OBJETS_EP17.has(nom)) return <ObjetMainEp17 nom={nom} main={main} peau={peau} frame={frame} />;
      if (OBJETS_EP16.has(nom)) return <ObjetMainEp16 nom={nom} main={main} peau={peau} frame={frame} />;
      if (['chronometre', 'bouteille', 'haltere', 'elastique', 'tapis_roule'].includes(nom)) return <ObjetMainEp15 nom={nom} main={main} peau={peau} frame={frame} />;
      if (['machine_tatouage', 'tablette', 'valise', 'cle'].includes(nom)) return <ObjetMainEp14 nom={nom} main={main} peau={peau} frame={frame} />;
      return <ObjetMainEp13 nom={nom} main={main} peau={peau} miroir={miroir} texte={texte} frame={frame} />;
  }
};

export const OBJETS_EP11 = new Set(['ciseaux', 'peigne', 'trousse', 'agenda', 'carnet', 'calepin', 'note', 'flacon', 'serviette', 'miroir', 'pinceau', 'postit', 'diplome', 'tampon']);
