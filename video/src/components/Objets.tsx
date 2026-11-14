import {useCurrentFrame} from 'remotion';
import type {AccessoireSol} from '../types';
import {BIP_SCAN, CYCLE_SCAN} from './Personnage';

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
/** Camionnette utilitaire blanche vue de profil, SANS logo ni inscription. */
export const Camionnette: React.FC = () => {
  const frame = useCurrentFrame();
  const roue = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy={350} r={52} fill="#212529" stroke={OUT} strokeWidth={9} />
      <circle cx={cx} cy={350} r={24} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
      <path d={`M ${cx - 14} 350 H ${cx + 14} M ${cx} 336 V 364`} stroke={OUT} strokeWidth={4} transform={`rotate(${frame} ${cx} 350)`} />
    </g>
  );
  return (
    <svg viewBox="0 0 680 420" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={340} cy={404} rx={320} ry={14} fill="rgba(0,0,0,0.22)" />
      {/* caisse + cabine */}
      <path d="M 24 330 V 70 Q 24 50 44 50 H 470 Q 500 50 516 80 L 580 190 Q 650 200 656 250 V 330 Q 656 346 640 346 H 40 Q 24 346 24 330 Z" fill="#F8F9FA" stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
      {/* vitre cabine */}
      <path d="M 488 82 L 548 186 H 488 Z" fill="#8ECAE6" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 498 100 L 520 140" stroke="white" strokeWidth={6} strokeLinecap="round" />
      {/* portes, poignées, galerie */}
      <path d="M 470 56 V 330 M 250 56 V 330" stroke="#CED4DA" strokeWidth={6} />
      <rect x={430} y={210} width={26} height={10} rx={4} fill="#868E96" />
      <rect x={210} y={210} width={26} height={10} rx={4} fill="#868E96" />
      <path d="M 60 50 V 34 M 200 50 V 34 M 340 50 V 34 M 40 34 H 380" stroke={OUT} strokeWidth={8} strokeLinecap="round" />
      {/* échelle sur la galerie */}
      <rect x={70} y={14} width={280} height={18} rx={4} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
      {/* bas de caisse, phares, pare-chocs */}
      <path d="M 24 300 H 656" stroke="#DEE2E6" strokeWidth={12} />
      <rect x={630} y={228} width={26} height={30} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={5} />
      <rect x={14} y={300} width={22} height={34} rx={4} fill="#E63946" stroke={OUT} strokeWidth={5} />
      <rect x={600} y={318} width={66} height={24} rx={8} fill="#495057" stroke={OUT} strokeWidth={6} />
      {roue(150)}
      {roue(540)}
    </svg>
  );
};

/** Perceuse-visseuse sans fil (générique, sans marque) posée au sol. */
export const Perceuse: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 240 190" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={120} cy={182} rx={100} ry={8} fill="rgba(0,0,0,0.22)" />
      {/* foret qui tourne */}
      <rect x={196} y={52} width={40} height={10} rx={3} fill="#ADB5BD" stroke={OUT} strokeWidth={4} />
      <path d={`M ${200 + (frame % 8)} 52 l 6 10 M ${214 + (frame % 8)} 52 l 6 10`} stroke={OUT} strokeWidth={3} />
      {/* corps */}
      <path d="M 40 30 H 170 Q 200 30 200 57 Q 200 84 170 84 H 120 L 110 96 H 70 L 60 84 H 40 Q 24 84 24 57 Q 24 30 40 30 Z" fill="#F77F00" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <rect x={178} y={40} width={22} height={34} rx={6} fill="#343A40" stroke={OUT} strokeWidth={5} />
      {/* poignée */}
      <path d="M 70 84 L 60 150 H 110 L 116 84 Z" fill="#343A40" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <rect x={110} y={92} width={14} height={22} rx={4} fill="#E63946" stroke={OUT} strokeWidth={4} />
      {/* batterie */}
      <rect x={40} y={146} width={96} height={30} rx={8} fill="#495057" stroke={OUT} strokeWidth={7} />
      <rect x={54} y={156} width={30} height={8} rx={3} fill="#06D6A0" />
      <path d="M 44 46 H 150" stroke="rgba(255,255,255,0.4)" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

/** Caisse de supermarché vue de face (devant le personnage) : tapis roulant, vitre de scanner qui bipe,
 *  écran de caisse, terminal de paiement. Générique, aucun logo. Cycle calé sur la pose « scanne ». */
export const CaisseTapis: React.FC = () => {
  const frame = useCurrentFrame();
  const u = (frame % CYCLE_SCAN) / CYCLE_SCAN;
  const bip = u >= BIP_SCAN[0] && u <= BIP_SCAN[1];
  const nbScans = Math.floor(frame / CYCLE_SCAN) + (u > BIP_SCAN[0] ? 1 : 0);
  const total = (12.4 + nbScans * 3.35).toFixed(2).replace('.', ',');
  const avance = (frame * 3) % 60;
  // articles qui avancent sur le tapis vers la caissière
  const articles = [0, 1, 2, 3].map((k) => ({x: ((frame * 2.2 + k * 110) % 440) - 40, k}));
  return (
    <svg viewBox="0 0 1080 300" width="100%" height="100%" style={{overflow: 'visible'}}>
      {/* écran client + terminal de paiement sur mât, à droite */}
      <rect x={884} y={-150} width={18} height={180} fill="#495057" stroke={OUT} strokeWidth={6} />
      <rect x={812} y={-250} width={172} height={110} rx={14} fill="#343A40" stroke={OUT} strokeWidth={8} />
      <rect x={826} y={-236} width={144} height={82} rx={6} fill="#CFF5E7" />
      <text x={898} y={-206} textAnchor="middle" fontFamily="Lilita One" fontSize={22} fill="#2D6A4F">TOTAL</text>
      <text x={898} y={-170} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={34} fill={OUT}>{total} €</text>
      {/* comptoir : plateau */}
      <rect x={-20} y={20} width={1120} height={44} rx={10} fill="#DEE2E6" stroke={OUT} strokeWidth={8} />
      {/* tapis roulant à gauche */}
      <rect x={-20} y={26} width={420} height={30} rx={8} fill="#2B2D42" />
      <g opacity={0.5}>
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={-60 + i * 60 + avance} y={30} width={8} height={22} fill="#6C757D" />
        ))}
      </g>
      <rect x={-20} y={26} width={420} height={30} rx={8} fill="none" stroke={OUT} strokeWidth={5} />
      {/* articles sur le tapis */}
      {articles.map(({x, k}) => (
        <g key={k} opacity={x > 330 ? Math.max(0, 1 - (x - 330) / 50) : 1}>
          {k % 3 === 0 ? (
            <rect x={x} y={-30} width={64} height={56} rx={6} fill={k === 0 ? '#F4A261' : '#90BE6D'} stroke={OUT} strokeWidth={5} />
          ) : k % 3 === 1 ? (
            <g>
              <rect x={x + 8} y={-50} width={34} height={76} rx={10} fill="#4CC9F0" stroke={OUT} strokeWidth={5} />
              <rect x={x + 17} y={-64} width={16} height={18} rx={4} fill="#3A86FF" stroke={OUT} strokeWidth={4} />
            </g>
          ) : (
            <g>
              <circle cx={x + 20} cy={4} r={22} fill="#FFD166" stroke={OUT} strokeWidth={5} />
              <circle cx={x + 50} cy={6} r={20} fill="#FFD166" stroke={OUT} strokeWidth={5} />
            </g>
          )}
        </g>
      ))}
      {/* séparateur de commande */}
      <rect x={350} y={6} width={60} height={20} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
      {/* vitre du scanner au centre */}
      <rect x={462} y={28} width={156} height={28} rx={6} fill={bip ? '#FF8FA3' : '#9FD3E6'} stroke={OUT} strokeWidth={6} />
      <path d="M 476 42 H 604 M 500 32 L 580 52 M 500 52 L 580 32" stroke="#E63946" strokeWidth={3} opacity={bip ? 1 : 0.45} />
      {bip ? (
        <g>
          <ellipse cx={540} cy={30} rx={110} ry={26} fill="#E63946" opacity={0.25} />
          <g transform="translate(700 -40) rotate(8)">
            <rect x={-62} y={-30} width={124} height={56} rx={14} fill="#FFD60A" stroke={OUT} strokeWidth={6} />
            <text x={0} y={18} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={42} fill={OUT}>BIP</text>
          </g>
        </g>
      ) : null}
      {/* zone d'emballage à droite */}
      <rect x={680} y={28} width={400} height={28} rx={6} fill="#CED4DA" />
      {/* face avant du comptoir */}
      <rect x={-20} y={64} width={1120} height={250} fill="#577590" stroke={OUT} strokeWidth={8} />
      <rect x={-20} y={64} width={1120} height={26} fill="#4A6680" />
      {[120, 380, 700, 960].map((x) => (
        <rect key={x} x={x - 90} y={118} width={180} height={150} rx={14} fill="#6A89A7" stroke={OUT} strokeWidth={5} />
      ))}
      <rect x={494} y={110} width={92} height={150} rx={10} fill="#343A40" stroke={OUT} strokeWidth={6} />
      <rect x={508} y={128} width={64} height={18} rx={4} fill="#ADB5BD" />
    </svg>
  );
};

/** Pile de billets et de pièces génériques (aucun motif officiel), une pièce qui brille. */
export const BilletsPieces: React.FC = () => {
  const frame = useCurrentFrame();
  const flotte = Math.sin(frame / 8) * 4;
  const eclat = (frame % 50) / 50;
  return (
    <svg viewBox="0 0 260 220" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={130} cy={208} rx={124} ry={12} fill="rgba(0,0,0,0.22)" />
      {[0, 1, 2, 3].map((k) => (
        <g key={k} transform={`translate(${k % 2 ? 6 : -4} ${-k * 18}) rotate(${k % 2 ? 3 : -2} 110 180)`}>
          <rect x={20} y={150} width={180} height={50} rx={6} fill="#95D5B2" stroke={OUT} strokeWidth={6} />
          <rect x={30} y={158} width={160} height={34} rx={4} fill="none" stroke="#52B788" strokeWidth={4} />
          <circle cx={110} cy={175} r={13} fill="#D8F3DC" stroke="#52B788" strokeWidth={4} />
          <text x={52} y={186} fontFamily="Luckiest Guy" fontSize={22} fill="#2D6A4F">€</text>
        </g>
      ))}
      {/* billet qui flotte */}
      <g transform={`translate(0 ${flotte}) rotate(${-12 + flotte} 120 70)`}>
        <rect x={40} y={50} width={170} height={48} rx={6} fill="#B7E4C7" stroke={OUT} strokeWidth={6} />
        <circle cx={125} cy={74} r={12} fill="#D8F3DC" stroke="#52B788" strokeWidth={4} />
        <text x={58} y={84} fontFamily="Luckiest Guy" fontSize={22} fill="#2D6A4F">€</text>
      </g>
      {/* pièces */}
      {[[200, 186], [228, 176], [214, 158]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={24} ry={14} fill="#F2C14E" stroke={OUT} strokeWidth={5} />
          <ellipse cx={x} cy={y - 3} rx={14} ry={7} fill="none" stroke="#C9A227" strokeWidth={3} />
        </g>
      ))}
      <path d={`M 214 ${136 - eclat * 6} l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z`} fill="white" opacity={1 - eclat} />
    </svg>
  );
};

/** Chariot plateau chargé de cartons vierges (ep07), poignée à gauche : le personnage (pose « pousse ») la tient. */
export const ChariotCartons: React.FC = () => {
  const frame = useCurrentFrame();
  const roule = (frame * 6) % 360;
  const va = Math.sin(frame / 8) * 6;
  const carton = (x: number, y: number, w: number, h: number, k: number) => (
    <g key={k}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={k % 2 ? '#C8955C' : '#D4A373'} stroke={OUT} strokeWidth={6} />
      <rect x={x + w / 2 - 9} y={y} width={18} height={h} fill="#E9C99A" opacity={0.9} />
      <path d={`M ${x + 12} ${y + h - 18} h 34`} stroke="#9C6B3C" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 500" width="100%" height="100%" style={{overflow: 'visible'}}>
      <g transform={`translate(${va} 0)`}>
        <ellipse cx={220} cy={492} rx={190} ry={10} fill="rgba(0,0,0,0.22)" />
        {/* cartons empilés */}
        {carton(120, 330, 250, 110, 0)}
        {carton(140, 236, 200, 94, 1)}
        {carton(170, 160, 140, 76, 2)}
        {/* plateau */}
        <rect x={34} y={438} width={358} height={24} rx={6} fill="#495057" stroke={OUT} strokeWidth={6} />
        {/* roues */}
        {[86, 344].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={476} r={20} fill="#212529" stroke={OUT} strokeWidth={5} />
            <path d={`M ${cx - 12} 476 H ${cx + 12}`} stroke="#ADB5BD" strokeWidth={4} transform={`rotate(${roule} ${cx} 476)`} />
          </g>
        ))}
        {/* poignée */}
        <path d="M 46 450 V 254 H 0" fill="none" stroke={OUT} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 46 450 V 254 H 0" fill="none" stroke="#868E96" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

/** Silhouette générique d'un responsable (ep07) : sans visage, tient une tablette. */
export const SilhouetteResponsable: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 9) * 3;
  const C = '#3D4A5C';
  const C2 = '#2E3949';
  return (
    <svg viewBox="0 0 300 640" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={150} cy={628} rx={120} ry={12} fill="rgba(0,0,0,0.22)" />
      <g transform={`translate(0 ${bob})`}>
        {/* jambes */}
        <rect x={98} y={400} width={46} height={220} rx={18} fill={C2} stroke={OUT} strokeWidth={6} />
        <rect x={156} y={400} width={46} height={220} rx={18} fill={C2} stroke={OUT} strokeWidth={6} />
        {/* buste */}
        <path d="M 70 230 Q 72 170 130 164 H 170 Q 228 170 230 230 L 236 420 Q 150 436 64 420 Z" fill={C} stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        {/* bras + tablette */}
        <path d="M 78 210 Q 40 300 96 340" fill="none" stroke={OUT} strokeWidth={40} strokeLinecap="round" />
        <path d="M 78 210 Q 40 300 96 340" fill="none" stroke={C} strokeWidth={28} strokeLinecap="round" />
        <path d="M 222 210 Q 258 300 200 330" fill="none" stroke={OUT} strokeWidth={40} strokeLinecap="round" />
        <path d="M 222 210 Q 258 300 200 330" fill="none" stroke={C} strokeWidth={28} strokeLinecap="round" />
        <rect x={100} y={276} width={96} height={72} rx={8} fill="#E9ECEF" stroke={OUT} strokeWidth={6} transform="rotate(-8 148 312)" />
        {/* cou + tête (sans visage) */}
        <rect x={132} y={140} width={36} height={32} fill={C2} stroke={OUT} strokeWidth={6} />
        <circle cx={150} cy={96} r={62} fill={C} stroke={OUT} strokeWidth={7} />
      </g>
    </svg>
  );
};


/** Trépied avec smartphone générique au centre d'une ring light (ep08). Sans logo. */
export const TrepiedRingLight: React.FC = () => {
  const frame = useCurrentFrame();
  const lueur = 0.35 + Math.sin(frame / 10) * 0.08;
  return (
    <svg viewBox="0 0 300 740" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={150} cy={728} rx={130} ry={12} fill="rgba(0,0,0,0.22)" />
      {/* pieds du trépied */}
      <path d="M 150 300 L 40 724 M 150 300 L 260 724 M 150 300 L 150 724" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
      <path d="M 150 300 L 40 724 M 150 300 L 260 724 M 150 300 L 150 724" stroke="#495057" strokeWidth={8} strokeLinecap="round" />
      <rect x={136} y={240} width={28} height={110} rx={8} fill="#343A40" stroke={OUT} strokeWidth={6} />
      {/* halo */}
      <circle cx={150} cy={140} r={150} fill="#FFF6D6" opacity={lueur} />
      {/* anneau lumineux */}
      <circle cx={150} cy={140} r={112} fill="none" stroke={OUT} strokeWidth={46} />
      <circle cx={150} cy={140} r={112} fill="none" stroke="#FFFBEA" strokeWidth={32} />
      <circle cx={150} cy={140} r={112} fill="none" stroke="#FFE8A3" strokeWidth={6} strokeDasharray="4 10" />
      {/* smartphone (dos visible, sans logo) */}
      <rect x={122} y={86} width={56} height={104} rx={10} fill="#2B2D42" stroke={OUT} strokeWidth={6} />
      <circle cx={138} cy={102} r={7} fill="#6C757D" stroke={OUT} strokeWidth={3} />
      <rect x={140} y={186} width={20} height={56} fill="#343A40" stroke={OUT} strokeWidth={5} />
    </svg>
  );
};

/** Petit bureau avec ordinateur portable générique : graphique en barres et chiffres (ep08). Sans logo. */
export const BureauOrdinateur: React.FC = () => {
  const frame = useCurrentFrame();
  const barres = [40, 62, 54, 80, 96];
  return (
    <svg viewBox="0 0 380 420" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={200} cy={412} rx={170} ry={10} fill="rgba(0,0,0,0.2)" />
      {/* bureau */}
      <rect x={40} y={190} width={22} height={220} fill="#8D6A4A" stroke={OUT} strokeWidth={6} />
      <rect x={330} y={190} width={22} height={220} fill="#8D6A4A" stroke={OUT} strokeWidth={6} />
      <rect x={10} y={170} width={370} height={34} rx={8} fill="#C79A6B" stroke={OUT} strokeWidth={7} />
      {/* écran de l'ordinateur */}
      <g transform="rotate(-4 200 110)">
        <rect x={84} y={20} width={232} height={150} rx={12} fill="#2B2D42" stroke={OUT} strokeWidth={7} />
        <rect x={96} y={32} width={208} height={124} rx={6} fill="#F8F9FA" />
        <rect x={106} y={40} width={90} height={12} rx={6} fill="#ADB5BD" />
        <text x={292} y={54} textAnchor="end" fontFamily="Luckiest Guy" fontSize={20} fill="#1F9D55">+ €</text>
        {barres.map((h, i) => {
          const hh = h * (1 + Math.sin(frame / 9 + i) * 0.04);
          return <rect key={i} x={116 + i * 36} y={148 - hh} width={24} height={hh} rx={4} fill={i === barres.length - 1 ? '#1F9D55' : '#76B4DE'} stroke={OUT} strokeWidth={3} />;
        })}
      </g>
      {/* clavier */}
      <path d="M 70 172 L 330 172 L 346 184 L 54 184 Z" fill="#CED4DA" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      {/* tasse */}
      <rect x={20} y={130} width={40} height={42} rx={8} fill="#FF8FA3" stroke={OUT} strokeWidth={6} />
    </svg>
  );
};

/** Berline générique vue de profil (ep09) : silhouette sans logo, sans plaque, sans calandre de marque. */
export const Berline: React.FC<{couleur?: string; inverse?: boolean}> = ({couleur = '#5B7DB1', inverse = false}) => {
  const frame = useCurrentFrame();
  const reflet = 0.35 + Math.sin(frame / 14) * 0.08;
  const roue = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy={282} r={54} fill="#212529" stroke={OUT} strokeWidth={9} />
      <circle cx={cx} cy={282} r={28} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
      <circle cx={cx} cy={282} r={8} fill="#6C757D" />
    </g>
  );
  return (
    <svg viewBox="0 0 760 360" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={380} cy={340} rx={360} ry={14} fill="rgba(0,0,0,0.22)" />
      <g transform={inverse ? 'translate(760 0) scale(-1 1)' : undefined}>
        {/* caisse */}
        <path d="M 30 282 Q 18 282 18 262 V 214 Q 20 180 60 172 L 196 158 L 270 92 Q 290 76 330 74 H 470 Q 506 74 532 96 L 606 160 L 700 176 Q 740 184 742 220 V 262 Q 742 282 722 282 Z" fill={couleur} stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
        {/* vitres */}
        <path d="M 222 160 L 284 104 Q 296 94 324 94 H 384 V 160 Z" fill="#BDE0FE" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 404 160 V 94 H 466 Q 494 94 512 110 L 566 160 Z" fill="#BDE0FE" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 250 150 L 300 106" stroke="white" strokeWidth={8} strokeLinecap="round" opacity={reflet + 0.3} />
        {/* portes, poignées, bas de caisse, rétroviseur */}
        <path d="M 394 164 V 270 M 236 172 Q 232 230 246 270 M 570 166 Q 580 230 566 270" fill="none" stroke={OUT} strokeWidth={5} opacity={0.55} />
        <rect x={326} y={186} width={40} height={10} rx={5} fill="#E9ECEF" stroke={OUT} strokeWidth={4} />
        <rect x={500} y={186} width={40} height={10} rx={5} fill="#E9ECEF" stroke={OUT} strokeWidth={4} />
        <path d="M 60 252 H 700" stroke="rgba(0,0,0,0.18)" strokeWidth={14} />
        <path d="M 120 200 Q 380 186 680 204" stroke="white" strokeWidth={6} opacity={reflet} fill="none" />
        <path d="M 572 150 l 30 -6 l 6 18 l -30 4 Z" fill={couleur} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        {/* phares et feux (génériques) */}
        <path d="M 708 200 Q 734 202 738 222 L 712 222 Z" fill="#FFF3B0" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
        <rect x={18} y={196} width={22} height={28} rx={6} fill="#E63946" stroke={OUT} strokeWidth={5} />
        {roue(170)}
        {roue(596)}
      </g>
    </svg>
  );
};

/** Citadine générique vue de profil (ep09) : petite trois-portes à hayon, sans logo ni plaque. */
export const Citadine: React.FC = () => {
  const roue = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy={262} r={46} fill="#212529" stroke={OUT} strokeWidth={8} />
      <circle cx={cx} cy={262} r={22} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
    </g>
  );
  return (
    <svg viewBox="0 0 560 340" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={280} cy={318} rx={260} ry={12} fill="rgba(0,0,0,0.22)" />
      <path d="M 34 262 Q 20 262 20 244 V 120 Q 22 84 60 80 L 300 74 Q 340 74 372 104 L 440 160 L 506 172 Q 538 180 540 210 V 244 Q 540 262 522 262 Z" fill="#F4A261" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 50 156 V 102 Q 52 94 64 94 H 190 V 156 Z" fill="#BDE0FE" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 210 156 V 94 H 296 Q 326 94 350 116 L 400 156 Z" fill="#BDE0FE" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 200 160 V 252" stroke={OUT} strokeWidth={5} opacity={0.5} />
      <rect x={250} y={176} width={36} height={9} rx={4} fill="#FFF1E6" stroke={OUT} strokeWidth={4} />
      <path d="M 510 190 Q 534 192 538 210 L 512 210 Z" fill="#FFF3B0" stroke={OUT} strokeWidth={5} />
      <rect x={20} y={150} width={18} height={30} rx={5} fill="#E63946" stroke={OUT} strokeWidth={4} />
      {roue(120)}
      {roue(440)}
    </svg>
  );
};

/** Matériel de nettoyage auto (ep09) : aspirateur eau/poussière avec tuyau, seau mousseux et brosse,
 *  pile de microfibres, pulvérisateur. Générique, sans marque. */
export const KitNettoyage: React.FC = () => {
  const frame = useCurrentFrame();
  const bulle = (k: number) => Math.sin(frame / 8 + k) * 3;
  return (
    <svg viewBox="0 0 380 280" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={190} cy={270} rx={180} ry={10} fill="rgba(0,0,0,0.2)" />
      {/* aspirateur eau/poussière : cuve, tête moteur, roulettes, tuyau annelé */}
      <path d="M 150 118 Q 220 60 196 20" fill="none" stroke={OUT} strokeWidth={22} strokeLinecap="round" />
      <path d="M 150 118 Q 220 60 196 20" fill="none" stroke="#5C677D" strokeWidth={12} strokeLinecap="round" strokeDasharray="10 5" />
      <path d="M 26 120 H 154 L 146 246 Q 90 258 34 246 Z" fill="#E9C46A" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 30 172 H 150" stroke="#C9A43E" strokeWidth={6} />
      <path d="M 18 120 Q 18 84 90 82 Q 162 84 162 120 Z" fill="#495057" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <rect x={70} y={70} width={40} height={16} rx={7} fill="#343A40" stroke={OUT} strokeWidth={5} />
      {[46, 134].map((x) => (
        <circle key={x} cx={x} cy={252} r={11} fill="#343A40" stroke={OUT} strokeWidth={4} />
      ))}
      {/* seau + mousse + brosse */}
      <path d="M 178 150 H 268 L 258 258 H 188 Z" fill="#4EA8DE" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 180 160 Q 223 110 266 160" fill="none" stroke="#6C757D" strokeWidth={5} />
      <rect x={232} y={84} width={14} height={70} rx={5} fill="#BC8A5F" stroke={OUT} strokeWidth={4} transform="rotate(14 239 120)" />
      <g fill="white" stroke="#BFD7E0" strokeWidth={2}>
        {[188, 206, 224, 242, 258].map((x, k) => (
          <circle key={x} cx={x} cy={150 + bulle(k)} r={12 + (k % 2) * 4} />
        ))}
      </g>
      {/* pile de microfibres */}
      {['#06D6A0', '#FFD60A', '#4EA8DE', '#FF8FA3'].map((c, k) => (
        <rect key={c} x={274} y={238 - k * 18} width={96} height={20} rx={7} fill={c} stroke={OUT} strokeWidth={5} />
      ))}
      {/* pulvérisateur */}
      <rect x={300} y={118} width={44} height={66} rx={10} fill="#E9F5FB" stroke={OUT} strokeWidth={5} />
      <rect x={302} y={140} width={40} height={20} fill="#06D6A0" />
      <path d="M 310 118 v -22 h 42 l 6 10 h -20 v 12 Z" fill="#343A40" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
};

/** Intérieur de voiture vu par la portière ouverte (ep09) : banquette avec taches, bande propre et humide là où passe l'extracteur. */
export const SiegeAuto: React.FC = () => {
  const frame = useCurrentFrame();
  const propre = Math.min(1, frame / 120);
  return (
    <svg viewBox="0 0 340 440" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={170} cy={430} rx={170} ry={10} fill="rgba(0,0,0,0.2)" />
      {/* encadrement de portière (carrosserie) */}
      <path d="M 0 40 Q 10 10 60 8 H 330 V 420 H 0 Z" fill="#5B7DB1" stroke={OUT} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 26 56 Q 34 34 70 32 H 312 V 396 H 26 Z" fill="#2B2D42" stroke={OUT} strokeWidth={6} />
      {/* dossier + appui-tête */}
      <rect x={210} y={70} width={64} height={46} rx={18} fill="#6C757D" stroke={OUT} strokeWidth={6} />
      <path d="M 190 300 L 206 128 Q 210 110 236 110 H 262 Q 290 110 292 132 L 300 300 Z" fill="#868E96" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 220 140 V 290 M 266 140 V 290" stroke="#6C757D" strokeWidth={5} />
      {/* assise */}
      <rect x={34} y={286} width={276} height={62} rx={18} fill="#868E96" stroke={OUT} strokeWidth={7} />
      {/* taches qui disparaissent peu à peu */}
      <g fill="#8D6E4C" opacity={0.75 * (1 - propre * 0.85)}>
        <ellipse cx={90} cy={312} rx={26} ry={10} />
        <ellipse cx={168} cy={324} rx={18} ry={8} />
        <ellipse cx={244} cy={200} rx={14} ry={22} />
      </g>
      {/* bande propre, légèrement humide */}
      <rect x={70} y={292} width={110} height={50} rx={12} fill="#ADB5BD" opacity={0.5 + propre * 0.3} />
      {/* étincelles de propre */}
      {[0, 1].map((k) => {
        const p = ((frame + k * 20) % 40) / 40;
        return <path key={k} d={`M ${110 + k * 60} ${270 - p * 20} l 5 12 l 12 4 l -12 4 l -5 12 l -5 -12 l -12 -4 l 12 -4 Z`} fill="white" opacity={1 - p} />;
      })}
    </svg>
  );
};

export const OBJETS_SOL: Record<AccessoireSol, {left: number; top: number; width: number; height: number; devant: boolean}> = {
  velo: {left: 0, top: 1160, width: 520, height: 340, devant: false},
  sablier: {left: 800, top: 1270, width: 180, height: 234, devant: true},
  pile_vetements: {left: 20, top: 1190, width: 280, height: 300, devant: false},
  veste_cintre: {left: 800, top: 880, width: 250, height: 390, devant: false},
  portant_jeans: {left: 10, top: 960, width: 560, height: 520, devant: false},
  camionnette: {left: -120, top: 1040, width: 680, height: 420, devant: false},
  perceuse: {left: 800, top: 1320, width: 220, height: 175, devant: true},
  caisse_tapis: {left: 0, top: 1262, width: 1080, height: 300, devant: true},
  billets_pieces: {left: 790, top: 1290, width: 260, height: 220, devant: true},
  chariot_cartons: {left: 680, top: 1004, width: 400, height: 500, devant: true},
  silhouette_responsable: {left: 800, top: 880, width: 270, height: 576, devant: false},
  trepied_ring_light: {left: 0, top: 760, width: 300, height: 740, devant: false},
  bureau_ordinateur: {left: 730, top: 1080, width: 360, height: 420, devant: true},
  // ep09
  berline: {left: -230, top: 1124, width: 760, height: 360, devant: false},
  berline_rue: {left: 560, top: 1134, width: 760, height: 360, devant: false},
  citadine: {left: -150, top: 1170, width: 560, height: 340, devant: false},
  kit_nettoyage: {left: 706, top: 1236, width: 360, height: 266, devant: true},
  siege_auto: {left: 760, top: 1050, width: 340, height: 440, devant: false},
};

const OBJET_COMPOSANT: Partial<Record<AccessoireSol, React.FC>> = {
  sablier: Sablier,
  pile_vetements: PileVetements,
  veste_cintre: VesteCintre,
  portant_jeans: PortantJeans,
  camionnette: Camionnette,
  perceuse: Perceuse,
  caisse_tapis: CaisseTapis,
  billets_pieces: BilletsPieces,
  chariot_cartons: ChariotCartons,
  silhouette_responsable: SilhouetteResponsable,
  trepied_ring_light: TrepiedRingLight,
  bureau_ordinateur: BureauOrdinateur,
  berline: Berline,
  citadine: Citadine,
  kit_nettoyage: KitNettoyage,
  siege_auto: SiegeAuto,
};

export const ObjetSol: React.FC<{nom: AccessoireSol; couleurVelo?: string}> = ({nom, couleurVelo}) => {
  const pos = OBJETS_SOL[nom];
  return (
    <div style={{position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height}}>
      {nom === 'velo' ? <VeloProfil couleur={couleurVelo} /> : nom === 'berline_rue' ? <Berline couleur="#E9ECEF" inverse /> : (() => {
        const C = OBJET_COMPOSANT[nom] ?? Sablier;
        return <C />;
      })()}
    </div>
  );
};
