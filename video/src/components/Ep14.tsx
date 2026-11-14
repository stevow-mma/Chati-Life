import {FONT_TITRE} from '../fonts';

/**
 * ep14 (Maël, tatoueur indépendant) : ajouts optionnels, inutilisés par les épisodes précédents.
 * Grosse barbe, objets tenus (machine à tatouer générique, tablette, valise, clé), décor `shop_tatouage`.
 * Aucune marque, aucun logo ; motifs de tatouage génériques (formes géométriques, fleurs).
 * Repère du personnage : viewBox 600 x 900.
 */

const OUT = '#1b1b2f';
const SW = 9;
type Pt = [number, number];

/** Grosse barbe fournie : couvre joues, menton et bas du visage ; la bouche reste visible. */
export const GrosseBarbe: React.FC<{couleur: string}> = ({couleur}) => (
  <g strokeLinejoin="round">
    <path
      d="M 156 270 Q 160 340 196 380 Q 236 446 300 452 Q 364 446 404 380 Q 440 340 444 270 Q 428 318 392 330 Q 350 318 300 322 Q 250 318 208 330 Q 172 318 156 270 Z"
      fill={couleur}
      stroke={OUT}
      strokeWidth={7}
    />
    {/* moustache */}
    <path d="M 246 336 Q 274 318 300 330 Q 326 318 354 336 Q 330 346 300 340 Q 270 346 246 336 Z" fill={couleur} stroke={OUT} strokeWidth={5} />
    {/* espace de la bouche */}
    <ellipse cx={300} cy={364} rx={42} ry={22} fill="#C98F78" opacity={0.0} />
    <path d="M 220 390 q 10 20 4 36 M 380 390 q -10 20 -4 36 M 300 420 v 22" stroke="rgba(255,255,255,0.18)" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

/** Motifs géométriques génériques sur l'avant-bras (entre coude et poignet). */
export const MotifsAvantBras: React.FC<{coude: Pt; main: Pt; couleur: string}> = ({coude, main, couleur}) => {
  const pts = [0.3, 0.52, 0.74].map((k) => [coude[0] + (main[0] - coude[0]) * k, coude[1] + (main[1] - coude[1]) * k] as Pt);
  return (
    <g fill="none" stroke={couleur} strokeWidth={3.5} strokeLinejoin="round">
      <path d={`M ${pts[0][0]} ${pts[0][1] - 9} l 9 9 l -9 9 l -9 -9 Z`} />
      <circle cx={pts[1][0]} cy={pts[1][1]} r={7} />
      <path d={`M ${pts[2][0] - 8} ${pts[2][1] + 6} l 8 -13 l 8 13 Z`} />
    </g>
  );
};

/** Objets tenus en main ajoutés en ep14 (main gantée : couleur passée dans `peau`). */
export const ObjetMainEp14: React.FC<{nom: string; main: Pt; peau: string; frame: number}> = ({nom, main, peau, frame}) => {
  const [x, y] = main;
  const mainDessus = <circle cx={x} cy={y} r={30} fill={peau} stroke={OUT} strokeWidth={SW} />;
  switch (nom) {
    case 'machine_tatouage': {
      // machine générique type stylo : corps gris, grip noir, aiguille qui vibre, petit câble
      const vib = Math.sin(frame * 2.3) * 2;
      return (
        <g>
          <path d={`M ${x + 6} ${y - 40} q 40 -30 70 -80`} fill="none" stroke="#495057" strokeWidth={6} strokeLinecap="round" />
          <g transform={`rotate(30 ${x} ${y})`}>
            <rect x={x - 16} y={y - 70} width={32} height={84} rx={12} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
            <rect x={x - 14} y={y + 8} width={28} height={40} rx={6} fill="#212529" stroke={OUT} strokeWidth={5} />
            <path d={`M ${x} ${y + 48} v ${18 + vib}`} stroke="#6C757D" strokeWidth={4} strokeLinecap="round" />
          </g>
          {mainDessus}
        </g>
      );
    }
    case 'tablette': {
      // tablette à dessin générique : un motif de fleur se trace, s'efface, recommence
      const p = (frame % 90) / 90;
      const n = Math.floor(p * 6);
      return (
        <g>
          <rect x={x - 120} y={y - 190} width={200} height={150} rx={14} fill="#343A40" stroke={OUT} strokeWidth={7} />
          <rect x={x - 108} y={y - 178} width={176} height={126} rx={6} fill="#F8F9FA" />
          {Array.from({length: n}).map((_, k) => {
            const a = (k / 6) * Math.PI * 2;
            return <ellipse key={k} cx={x - 20 + Math.cos(a) * 22} cy={y - 115 + Math.sin(a) * 22} rx={14} ry={9} fill="none" stroke="#1b1b2f" strokeWidth={3} transform={`rotate(${(a * 180) / Math.PI} ${x - 20 + Math.cos(a) * 22} ${y - 115 + Math.sin(a) * 22})`} />;
          })}
          {n >= 3 ? <circle cx={x - 20} cy={y - 115} r={8} fill="#F2C14E" stroke={OUT} strokeWidth={3} /> : null}
          {mainDessus}
        </g>
      );
    }
    case 'valise':
      return (
        <g>
          <path d={`M ${x - 18} ${y + 4} v -12 h 36 v 12`} fill="none" stroke={OUT} strokeWidth={8} />
          <rect x={x - 80} y={y + 6} width={160} height={190} rx={18} fill="#2A9D8F" stroke={OUT} strokeWidth={7} />
          <path d={`M ${x - 40} ${y + 10} v 182 M ${x + 40} ${y + 10} v 182`} stroke="#21867A" strokeWidth={8} />
          <circle cx={x - 50} cy={y + 204} r={10} fill="#343A40" stroke={OUT} strokeWidth={4} />
          <circle cx={x + 50} cy={y + 204} r={10} fill="#343A40" stroke={OUT} strokeWidth={4} />
          {mainDessus}
        </g>
      );
    case 'cle':
      return (
        <g>
          <circle cx={x} cy={y - 62} r={18} fill="none" stroke="#E0B341" strokeWidth={9} />
          <path d={`M ${x} ${y - 44} v 34 M ${x} ${y - 24} h 12 M ${x} ${y - 14} h 10`} stroke="#E0B341" strokeWidth={8} strokeLinecap="round" />
          {mainDessus}
        </g>
      );
    default:
      return null;
  }
};

/** Décor `shop_tatouage` : murs briques chaudes, planches de flashs, vitrine, fauteuil de tatouage, lampes chaudes. */
export const DecorShopTatouage: React.FC<{frame: number}> = ({frame}) => {
  const flash = (x: number, y: number, k: number) => {
    const motifs = [
      <g key="f">
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <circle key={i} cx={x + 50 + Math.cos(a) * 18} cy={y + 50 + Math.sin(a) * 18} r={13} fill="#F28482" stroke={OUT} strokeWidth={3} />;
        })}
        <circle cx={x + 50} cy={y + 50} r={9} fill="#F2C14E" stroke={OUT} strokeWidth={3} />
      </g>,
      <path key="d" d={`M ${x + 50} ${y + 18} l 30 32 l -30 32 l -30 -32 Z M ${x + 50} ${y + 34} l 14 16 l -14 16 l -14 -16 Z`} fill="none" stroke={OUT} strokeWidth={4} />,
      <text key="t" x={x + 50} y={y + 68} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={48} fill="#3A86FF" stroke={OUT} strokeWidth={2}>
        A
      </text>,
      <path key="e" d={`M ${x + 20} ${y + 70} l 30 -50 l 30 50 Z`} fill="#90BE6D" stroke={OUT} strokeWidth={4} />,
    ];
    return (
      <g key={`${x}-${y}`}>
        <rect x={x} y={y} width={100} height={100} rx={6} fill="#FFF8E7" stroke={OUT} strokeWidth={5} />
        {motifs[k % 4]}
      </g>
    );
  };
  const lueur = 0.18 + Math.sin(frame / 20) * 0.03;
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill="#7A3E2B" />
      {/* briques */}
      {Array.from({length: 22}).map((_, r) => (
        <g key={r}>
          <path d={`M 0 ${r * 52} H 1080`} stroke="#5E2E20" strokeWidth={4} />
          {Array.from({length: 9}).map((_, c) => (
            <path key={c} d={`M ${c * 130 + (r % 2 ? 65 : 0)} ${r * 52} v 52`} stroke="#5E2E20" strokeWidth={4} />
          ))}
        </g>
      ))}
      {/* vitrine à gauche */}
      <rect x={40} y={340} width={300} height={560} rx={10} fill="#BDE0FE" stroke={OUT} strokeWidth={8} />
      <path d="M 190 340 V 900 M 40 620 H 340" stroke="white" strokeWidth={10} />
      <path d="M 70 380 l 80 120 M 230 400 l 60 90" stroke="white" strokeWidth={8} opacity={0.6} strokeLinecap="round" />
      <text x={190} y={600} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={46} fill="#FFD166" stroke={OUT} strokeWidth={3} transform="rotate(-4 190 600)">
        TATTOO
      </text>
      {/* planches de flashs au mur */}
      <rect x={400} y={300} width={620} height={500} rx={12} fill="#2B2D42" stroke={OUT} strokeWidth={8} />
      {[0, 1, 2, 3, 4].map((c) => [0, 1, 2].map((r) => flash(420 + c * 120, 320 + r * 158, c + r * 2)))}
      {/* lampes suspendues chaudes */}
      {[260, 720].map((x) => (
        <g key={x}>
          <path d={`M ${x} 0 V 150`} stroke={OUT} strokeWidth={5} />
          <path d={`M ${x - 60} 210 Q ${x} 130 ${x + 60} 210 Z`} fill="#E9A23B" stroke={OUT} strokeWidth={6} />
          <circle cx={x} cy={214} r={16} fill="#FFE8A3" />
          <path d={`M ${x - 60} 214 L ${x - 260} 1400 L ${x + 260} 1400 L ${x + 60} 214 Z`} fill="#FFD27A" opacity={lueur} />
        </g>
      ))}
      {/* sol */}
      <rect x={0} y={1100} width={1080} height={820} fill="#3D3530" />
      {Array.from({length: 8}).map((_, k) => (
        <path key={k} d={`M 0 ${1150 + k * 100} H 1080`} stroke="#4A403A" strokeWidth={5} />
      ))}
      <path d="M 0 1100 H 1080" stroke={OUT} strokeWidth={8} />
      {/* fauteuil de tatouage (au fond à droite) */}
      <g>
        <rect x={760} y={940} width={240} height={70} rx={24} fill="#1E1F26" stroke={OUT} strokeWidth={7} />
        <path d="M 980 950 L 1040 820 L 1060 840 L 1010 970 Z" fill="#1E1F26" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <rect x={860} y={1010} width={40} height={90} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
        <ellipse cx={880} cy={1110} rx={90} ry={16} fill="#6C757D" stroke={OUT} strokeWidth={6} />
      </g>
      {/* desserte avec flacons d'encre génériques */}
      <g>
        <rect x={40} y={1000} width={200} height={20} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
        <path d="M 60 1020 V 1120 M 220 1020 V 1120" stroke={OUT} strokeWidth={8} />
        {['#E63946', '#3A86FF', '#2B2D42', '#F4A261', '#2A9D8F'].map((c, k) => (
          <g key={c}>
            <rect x={54 + k * 36} y={952} width={26} height={48} rx={6} fill={c} stroke={OUT} strokeWidth={4} />
            <rect x={58 + k * 36} y={940} width={18} height={14} rx={3} fill="#F8F9FA" stroke={OUT} strokeWidth={3} />
          </g>
        ))}
      </g>
    </svg>
  );
};
