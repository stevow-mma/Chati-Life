import {useCurrentFrame} from 'remotion';
import type {AccessoireSol} from '../types';

/** Objets posés au sol à côté du personnage (vélo garé, sablier). Style plat, aucun logo. */

const OUT = '#1b1b2f';

/** Vélo de ville vu de profil : cadre ouvert, garde-boues, porte-bagages, panier, phare. */
export const VeloProfil: React.FC<{couleur?: string}> = ({couleur = '#2D6A4F'}) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 520 340" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={260} cy={322} rx={240} ry={14} fill="rgba(0,0,0,0.22)" />
      {[110, 410].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={240} r={84} fill="none" stroke={OUT} strokeWidth={22} />
          <circle cx={cx} cy={240} r={84} fill="none" stroke="#343A40" strokeWidth={10} />
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <path key={a} d={`M ${cx - 76} 240 H ${cx + 76}`} stroke="#ADB5BD" strokeWidth={3} transform={`rotate(${a} ${cx} 240)`} />
          ))}
          <circle cx={cx} cy={240} r={10} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
          <path d={`M ${cx - 92} 226 A 94 94 0 0 1 ${cx + 70} 170`} fill="none" stroke={couleur} strokeWidth={12} strokeLinecap="round" />
        </g>
      ))}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 110 240 L 200 150 L 250 250 L 380 120 L 410 240 M 250 250 L 110 240 M 200 150 L 190 110" stroke={OUT} strokeWidth={22} />
        <path d="M 110 240 L 200 150 L 250 250 L 380 120 L 410 240 M 250 250 L 110 240 M 200 150 L 190 110" stroke={couleur} strokeWidth={12} />
        <path d="M 380 120 L 370 80 L 420 74" stroke={OUT} strokeWidth={16} />
        <path d="M 380 120 L 370 80 L 420 74" stroke="#ADB5BD" strokeWidth={7} />
        <path d="M 60 150 H 190" stroke={OUT} strokeWidth={12} />
      </g>
      {/* selle */}
      <path d="M 160 104 Q 190 92 224 104 Q 216 116 176 114 Z" fill="#343A40" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      {/* pédalier */}
      <circle cx={250} cy={250} r={20} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
      <path d="M 250 250 L 270 290" stroke={OUT} strokeWidth={10} strokeLinecap="round" />
      {/* panier avant */}
      <path d="M 404 92 h 86 l -10 64 h -66 z" fill="#E9C46A" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 420 100 l 4 50 M 446 100 v 52 M 472 100 l -4 50" stroke="#BC8A5F" strokeWidth={4} />
      {/* phare */}
      <circle cx={396} cy={98} r={13} fill="#FFF3B0" stroke={OUT} strokeWidth={5} />
      <circle cx={396} cy={98} r={22 + Math.sin(frame / 4) * 3} fill="#FFF3B0" opacity={0.3} />
      {/* béquille */}
      <path d="M 250 250 L 232 318" stroke={OUT} strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
};

/** Sablier dont le sable s'écoule (boucle de 3 s). */
export const Sablier: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (frame % 90) / 90;
  const haut = 1 - p;
  const tilt = Math.sin(frame / 18) * 3;
  return (
    <svg viewBox="0 0 200 260" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={100} cy={250} rx={84} ry={10} fill="rgba(0,0,0,0.22)" />
      <g transform={`rotate(${tilt} 100 130)`}>
        <clipPath id="sablier-verre">
          <path d="M 44 28 H 156 Q 156 92 108 130 Q 156 168 156 232 H 44 Q 44 168 92 130 Q 44 92 44 28 Z" />
        </clipPath>
        <path d="M 44 28 H 156 Q 156 92 108 130 Q 156 168 156 232 H 44 Q 44 168 92 130 Q 44 92 44 28 Z" fill="#E7F5FF" />
        <g clipPath="url(#sablier-verre)">
          <rect x={40} y={130 - 92 * haut} width={120} height={92 * haut} fill="#F4A261" />
          <path d={`M 40 232 L 100 ${232 - 80 * p} L 160 232 Z`} fill="#F4A261" />
          <rect x={97} y={128} width={6} height={104} fill="#F4A261" opacity={p < 0.98 ? 1 : 0} />
        </g>
        <path d="M 44 28 H 156 Q 156 92 108 130 Q 156 168 156 232 H 44 Q 44 168 92 130 Q 44 92 44 28 Z" fill="none" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <rect x={24} y={10} width={152} height={24} rx={10} fill="#BC6C25" stroke={OUT} strokeWidth={7} />
        <rect x={24} y={226} width={152} height={24} rx={10} fill="#BC6C25" stroke={OUT} strokeWidth={7} />
      </g>
    </svg>
  );
};

/** Pile de vêtements pliés (couleurs variées, aucun logo). */
export const PileVetements: React.FC = () => {
  const frame = useCurrentFrame();
  const couches = ['#E76F51', '#8ECAE6', '#F4A261', '#6A4C93', '#E9C46A', '#3D5A80', '#F28482'];
  return (
    <svg viewBox="0 0 300 320" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={150} cy={312} rx={140} ry={10} fill="rgba(0,0,0,0.22)" />
      {couches.map((c, i) => {
        const y = 270 - i * 38;
        const dx = Math.sin(i * 1.7) * 14 + (i === couches.length - 1 ? Math.sin(frame / 20) * 2 : 0);
        return (
          <g key={i} transform={`translate(${dx} 0)`}>
            <rect x={30} y={y} width={240} height={40} rx={12} fill={c} stroke={OUT} strokeWidth={7} />
            <path d={`M 50 ${y + 14} H ${150 + (i % 3) * 30}`} stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/** Veste en jean suspendue à un cintre sur un crochet mural (aucun logo). */
export const VesteCintre: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 16) * 2.5;
  return (
    <svg viewBox="0 0 270 420" width="100%" height="100%" style={{overflow: 'visible'}}>
      <rect x={110} y={0} width={50} height={22} rx={8} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
      <g transform={`rotate(${sway} 135 22)`}>
        {/* cintre */}
        <path d="M 135 22 q 0 -18 14 -18 M 135 22 V 44 L 40 92 H 230 L 135 44" fill="none" stroke={OUT} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
        <path d="M 135 44 L 40 92 H 230 Z" fill="none" stroke="#BC8A5F" strokeWidth={5} strokeLinejoin="round" />
        {/* veste */}
        <path d="M 60 92 L 210 92 L 236 140 L 226 380 L 44 380 L 34 140 Z" fill="#5C7DA8" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 34 140 L 6 330 L 40 340 L 56 190 M 236 140 L 264 330 L 230 340 L 214 190" fill="#4A6A94" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 100 92 L 135 160 L 170 92" fill="#4A6A94" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 135 160 V 380" stroke={OUT} strokeWidth={6} />
        {[200, 250, 300, 350].map((y) => (
          <circle key={y} cx={146} cy={y} r={6} fill="#E9C46A" stroke={OUT} strokeWidth={3} />
        ))}
        <rect x={64} y={200} width={50} height={40} rx={6} fill="none" stroke="#E9C46A" strokeWidth={4} strokeDasharray="6 5" />
        <rect x={156} y={200} width={50} height={40} rx={6} fill="none" stroke="#E9C46A" strokeWidth={4} strokeDasharray="6 5" />
        {/* étiquette */}
        <path d="M 210 120 l 34 18 l -10 22 l -34 -18 z" fill="white" stroke={OUT} strokeWidth={5} />
      </g>
    </svg>
  );
};

/** Portant de friperie avec des jeans suspendus, étiquette de prix (aucun logo). */
export const PortantJeans: React.FC = () => {
  const frame = useCurrentFrame();
  const bleus = ['#3D5A80', '#5C7DA8', '#26415E', '#7895B2', '#3D5A80', '#4F6D93'];
  return (
    <svg viewBox="0 0 560 520" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={280} cy={510} rx={260} ry={12} fill="rgba(0,0,0,0.22)" />
      <path d="M 30 500 V 40 M 530 500 V 40 M 20 40 H 540" fill="none" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
      <path d="M 30 500 V 40 M 530 500 V 40 M 20 40 H 540" fill="none" stroke="#ADB5BD" strokeWidth={8} strokeLinecap="round" />
      <path d="M 0 500 H 70 M 490 500 H 560" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
      {bleus.map((c, i) => {
        const x = 70 + i * 76;
        const sway = Math.sin(frame / 14 + i) * 2;
        return (
          <g key={i} transform={`rotate(${sway} ${x + 30} 40)`}>
            <path d={`M ${x + 30} 40 V 62 M ${x} 74 L ${x + 30} 58 L ${x + 60} 74`} fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M ${x} 74 H ${x + 60} L ${x + 64} 330 H ${x + 36} L ${x + 30} 130 L ${x + 24} 330 H ${x - 4} Z`} fill={c} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${x} 92 H ${x + 60}`} stroke="#E9C46A" strokeWidth={3} strokeDasharray="5 4" />
          </g>
        );
      })}
      {/* étiquette de prix */}
      <g transform={`rotate(${-8 + Math.sin(frame / 10) * 4} 300 120)`}>
        <path d="M 300 74 V 110" stroke={OUT} strokeWidth={4} />
        <path d="M 262 110 H 338 L 350 130 L 338 150 H 262 Z" fill="#FFD60A" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <text x={300} y={142} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={32} fill={OUT}>15 €</text>
      </g>
    </svg>
  );
};

/** Position à l'écran de chaque objet (le vélo est derrière le personnage, le sablier devant à droite). */
export const OBJETS_SOL: Record<AccessoireSol, {left: number; top: number; width: number; height: number; devant: boolean}> = {
  velo: {left: 0, top: 1160, width: 520, height: 340, devant: false},
  sablier: {left: 800, top: 1270, width: 180, height: 234, devant: true},
  pile_vetements: {left: 20, top: 1190, width: 280, height: 300, devant: false},
  veste_cintre: {left: 800, top: 880, width: 250, height: 390, devant: false},
  portant_jeans: {left: 10, top: 960, width: 560, height: 520, devant: false},
};

const OBJET_COMPOSANT: Partial<Record<AccessoireSol, React.FC>> = {
  sablier: Sablier,
  pile_vetements: PileVetements,
  veste_cintre: VesteCintre,
  portant_jeans: PortantJeans,
};

export const ObjetSol: React.FC<{nom: AccessoireSol; couleurVelo?: string}> = ({nom, couleurVelo}) => {
  const pos = OBJETS_SOL[nom];
  return (
    <div style={{position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height}}>
      {nom === 'velo' ? <VeloProfil couleur={couleurVelo} /> : (() => {
        const C = OBJET_COMPOSANT[nom] ?? Sablier;
        return <C />;
      })()}
    </div>
  );
};
