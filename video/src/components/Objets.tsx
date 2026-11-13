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

/** Position à l'écran de chaque objet (le vélo est derrière le personnage, le sablier devant à droite). */
export const OBJETS_SOL: Record<AccessoireSol, {left: number; top: number; width: number; height: number; devant: boolean}> = {
  velo: {left: 0, top: 1160, width: 520, height: 340, devant: false},
  sablier: {left: 800, top: 1270, width: 180, height: 234, devant: true},
};

export const ObjetSol: React.FC<{nom: AccessoireSol; couleurVelo?: string}> = ({nom, couleurVelo}) => {
  const pos = OBJETS_SOL[nom];
  return (
    <div style={{position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height}}>
      {nom === 'velo' ? <VeloProfil couleur={couleurVelo} /> : <Sablier />}
    </div>
  );
};
