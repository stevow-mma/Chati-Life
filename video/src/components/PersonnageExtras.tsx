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
  | 'papiers';

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
}> = ({epaule, coude, main, cote, a, manche, peau, revers, poignet, montre}) => {
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
      <Main main={main} dir={dir} a={a} peau={peau} />
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
}> = ({phase, bas, jean, chaussures, bande}) => {
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
      return null;
  }
};
