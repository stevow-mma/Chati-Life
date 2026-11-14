import {DecorVoiture} from './ObjetsSceneEp12';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Décors plats colorés, un par scène. Ajouter un décor = ajouter une entrée dans DECORS.
 * Un nom inconnu donne un fond uni coloré (déduit du nom), pour ne jamais casser le rendu.
 */

const OUT = '#1b1b2f';
const W = 1080;
const H = 1920;
const SOL = 1480; // ligne du sol (pieds de Max)

const Studio: React.FC<{variante: number; frame: number}> = ({variante, frame}) => {
  const palettes = [
    ['#7B2CBF', '#9D4EDD'],
    ['#E63946', '#FF6B6B'],
    ['#0077B6', '#00B4D8'],
  ];
  const [a, b] = palettes[variante % palettes.length];
  const rays = 18;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill={a} />
      <g transform={`rotate(${frame * 0.6} 540 1000)`}>
        {Array.from({length: rays}).map((_, i) => {
          const a0 = (i / rays) * Math.PI * 2;
          const a1 = a0 + Math.PI / rays;
          const R = 2400;
          return (
            <path
              key={i}
              d={`M 540 1000 L ${540 + Math.cos(a0) * R} ${1000 + Math.sin(a0) * R} L ${540 + Math.cos(a1) * R} ${1000 + Math.sin(a1) * R} Z`}
              fill={b}
            />
          );
        })}
      </g>
      <circle cx={540} cy={1000} r={420} fill="white" opacity={0.12} />
      {/* podium */}
      <ellipse cx={540} cy={SOL + 30} rx={420} ry={80} fill="#FFD60A" stroke={OUT} strokeWidth={10} />
      <rect x={120} y={SOL + 30} width={840} height={500} fill="#F4A261" stroke={OUT} strokeWidth={10} />
      <ellipse cx={540} cy={SOL + 30} rx={420} ry={80} fill="#FFD60A" stroke={OUT} strokeWidth={10} />
      {/* confettis */}
      {Array.from({length: 26}).map((_, i) => {
        const x = (i * 137) % W;
        const y = ((i * 241 + frame * (4 + (i % 3))) % (H + 200)) - 100;
        const colors = ['#FFD60A', '#06D6A0', '#FF70A6', '#FFFFFF'];
        return (
          <rect key={i} x={x} y={y} width={22} height={34} rx={4} fill={colors[i % 4]}
            transform={`rotate(${(frame * 6 + i * 40) % 360} ${x + 11} ${y + 17})`} />
        );
      })}
    </svg>
  );
};

const Chambre: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#A8DADC" />
    {/* papier peint à pois */}
    {Array.from({length: 60}).map((_, i) => (
      <circle key={i} cx={(i % 6) * 200 + ((Math.floor(i / 6) % 2) * 100) + 40} cy={Math.floor(i / 6) * 170 + 40} r={14} fill="#BFE6E8" />
    ))}
    {/* fenêtre de nuit */}
    <rect x={640} y={250} width={340} height={400} rx={20} fill="#1D3557" stroke={OUT} strokeWidth={12} />
    <circle cx={880} cy={340} r={46} fill="#FFE8A3" />
    {[[700, 320], [760, 520], [920, 560], [820, 430]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6 + Math.sin(frame / 6 + i) * 2} fill="white" />
    ))}
    <path d="M 810 250 V 650 M 640 450 H 980" stroke={OUT} strokeWidth={12} />
    {/* poster */}
    <rect x={90} y={300} width={260} height={340} rx={10} fill="#FFD60A" stroke={OUT} strokeWidth={10} transform="rotate(-4 220 470)" />
    <path d="M 175 420 l 100 60 l -100 60 z" fill="#E63946" stroke={OUT} strokeWidth={8} transform="rotate(-4 220 470)" />
    {/* sol parquet */}
    <rect y={SOL - 60} width={W} height={H - SOL + 60} fill="#D4A373" />
    {Array.from({length: 7}).map((_, i) => (
      <path key={i} d={`M ${i * 180} ${SOL - 60} L ${i * 180 - 120} ${H}`} stroke="#B5835A" strokeWidth={8} />
    ))}
    <rect y={SOL - 72} width={W} height={20} fill="#FFFFFF" stroke={OUT} strokeWidth={6} />
    {/* lit */}
    <rect x={-40} y={1180} width={300} height={260} rx={30} fill="#FF70A6" stroke={OUT} strokeWidth={10} />
    <rect x={-40} y={1140} width={180} height={90} rx={30} fill="white" stroke={OUT} strokeWidth={10} />
    {/* lampe */}
    <rect x={900} y={1250} width={140} height={190} rx={12} fill="#06D6A0" stroke={OUT} strokeWidth={10} />
    <path d="M 930 1140 h 80 l 30 110 h -140 z" fill="#FFE8A3" stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
  </svg>
);

const Rue: React.FC<{frame: number}> = ({frame}) => {
  const buildings = [
    {x: -20, w: 240, h: 760, c: '#F4A261'},
    {x: 200, w: 200, h: 980, c: '#E76F51'},
    {x: 680, w: 220, h: 900, c: '#2A9D8F'},
    {x: 880, w: 240, h: 700, c: '#E9C46A'},
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF9E00" />
          <stop offset="1" stopColor="#FF5D8F" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ciel)" />
      <circle cx={540} cy={760} r={220} fill="#FFE066" />
      {/* nuages */}
      {[0, 1, 2].map((i) => {
        const x = ((i * 420 + frame * 1.5) % 1400) - 200;
        return (
          <g key={i} fill="white" opacity={0.85}>
            <ellipse cx={x} cy={260 + i * 140} rx={110} ry={40} />
            <ellipse cx={x + 60} cy={235 + i * 140} rx={70} ry={45} />
          </g>
        );
      })}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={SOL - b.h} width={b.w} height={b.h} fill={b.c} stroke={OUT} strokeWidth={10} />
          {Array.from({length: Math.floor(b.h / 130)}).map((_, r) => (
            <g key={r}>
              <rect x={b.x + 34} y={SOL - b.h + 50 + r * 130} width={56} height={72} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={6} />
              <rect x={b.x + b.w - 90} y={SOL - b.h + 50 + r * 130} width={56} height={72} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={6} />
            </g>
          ))}
        </g>
      ))}
      {/* trottoir et route */}
      <rect y={SOL - 40} width={W} height={120} fill="#CED4DA" stroke={OUT} strokeWidth={10} />
      <rect y={SOL + 80} width={W} height={H} fill="#495057" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 300 + 40} y={SOL + 230} width={160} height={26} rx={8} fill="#FFD60A" />
      ))}
      {/* lampadaire */}
      <rect x={110} y={900} width={20} height={540} fill={OUT} />
      <ellipse cx={120} cy={900} rx={60} ry={30} fill="#FFE066" stroke={OUT} strokeWidth={8} />
    </svg>
  );
};

const Banque: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#2D6A4F" />
    <rect y={0} width={W} height={180} fill="#1B4332" />
    {/* colonnes */}
    {[60, 860].map((x) => (
      <g key={x}>
        <rect x={x} y={220} width={160} height={1240} fill="#D8F3DC" stroke={OUT} strokeWidth={10} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${x + 40 + k * 40} 240 V 1440`} stroke="#95D5B2" strokeWidth={10} />
        ))}
        <rect x={x - 20} y={200} width={200} height={50} fill="#B7E4C7" stroke={OUT} strokeWidth={10} />
        <rect x={x - 20} y={1420} width={200} height={50} fill="#B7E4C7" stroke={OUT} strokeWidth={10} />
      </g>
    ))}
    {/* porte de coffre-fort */}
    <circle cx={540} cy={560} r={300} fill="#ADB5BD" stroke={OUT} strokeWidth={12} />
    <circle cx={540} cy={560} r={240} fill="#CED4DA" stroke={OUT} strokeWidth={8} />
    <g transform={`rotate(${frame * 1.2} 540 560)`}>
      {[0, 60, 120].map((a) => (
        <rect key={a} x={530} y={380} width={20} height={360} rx={8} fill="#6C757D" transform={`rotate(${a} 540 560)`} />
      ))}
      <circle cx={540} cy={560} r={50} fill="#FFD60A" stroke={OUT} strokeWidth={8} />
    </g>
    {/* sol damier */}
    <rect y={SOL - 40} width={W} height={H} fill="#081C15" />
    {Array.from({length: 24}).map((_, i) => (
      <rect key={i} x={(i % 6) * 180 + (Math.floor(i / 6) % 2) * 90} y={SOL - 40 + Math.floor(i / 6) * 120} width={90} height={120} fill="#40916C" />
    ))}
    {/* billets qui tombent */}
    {Array.from({length: 9}).map((_, i) => {
      const x = 80 + ((i * 263) % 920);
      const y = ((i * 310 + frame * 7) % 1700) - 150;
      return (
        <g key={i} transform={`rotate(${Math.sin(frame / 8 + i) * 25} ${x} ${y})`}>
          <rect x={x - 50} y={y - 26} width={100} height={52} rx={6} fill="#95D5B2" stroke={OUT} strokeWidth={5} />
          <circle cx={x} cy={y} r={14} fill="#52B788" stroke={OUT} strokeWidth={4} />
        </g>
      );
    })}
  </svg>
);

const Bureau: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#F1FAEE" />
    {/* bandes murales */}
    {Array.from({length: 9}).map((_, i) => (
      <rect key={i} x={i * 130} y={0} width={60} height={SOL} fill="#E3F2E9" />
    ))}
    {/* tableau avec courbe qui chute */}
    <rect x={90} y={230} width={520} height={360} rx={16} fill="white" stroke={OUT} strokeWidth={12} />
    <path d="M 130 300 V 550 H 580" fill="none" stroke={OUT} strokeWidth={8} />
    <path
      d={`M 140 330 L 250 ${380 + Math.sin(frame / 9) * 8} L 350 360 L 450 ${470 + Math.sin(frame / 7) * 8} L 560 520`}
      fill="none" stroke="#E63946" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round"
    />
    <path d="M 560 520 l -36 -6 l 22 -28 z" fill="#E63946" />
    {/* horloge */}
    <circle cx={860} cy={330} r={110} fill="white" stroke={OUT} strokeWidth={12} />
    {Array.from({length: 12}).map((_, i) => (
      <rect key={i} x={856} y={232} width={8} height={22} rx={3} fill={OUT} transform={`rotate(${i * 30} 860 330)`} />
    ))}
    <line x1={860} y1={330} x2={860} y2={260} stroke={OUT} strokeWidth={10} strokeLinecap="round" transform={`rotate(${frame * 6} 860 330)`} />
    <line x1={860} y1={330} x2={910} y2={330} stroke={OUT} strokeWidth={12} strokeLinecap="round" />
    <circle cx={860} cy={330} r={12} fill="#E63946" />
    {/* plante */}
    <rect x={880} y={1230} width={130} height={150} rx={14} fill="#E76F51" stroke={OUT} strokeWidth={10} />
    {[-40, -10, 20, 50].map((a, i) => (
      <ellipse key={i} cx={945} cy={1160} rx={26} ry={80} fill="#40916C" stroke={OUT} strokeWidth={8}
        transform={`rotate(${a + Math.sin(frame / 12 + i) * 4} 945 1230)`} />
    ))}
    {/* sol moquette */}
    <rect y={SOL - 60} width={W} height={H} fill="#8D99AE" />
    <rect y={SOL - 72} width={W} height={20} fill="#EDF2F4" stroke={OUT} strokeWidth={6} />
    {/* bureau avec écran derrière Max */}
    <rect x={60} y={1210} width={960} height={50} rx={10} fill="#BC6C25" stroke={OUT} strokeWidth={10} />
    <rect x={100} y={1260} width={40} height={180} fill="#9C5A1E" stroke={OUT} strokeWidth={8} />
    <rect x={940} y={1260} width={40} height={180} fill="#9C5A1E" stroke={OUT} strokeWidth={8} />
    <rect x={110} y={1030} width={220} height={150} rx={12} fill="#264653" stroke={OUT} strokeWidth={10} />
    <rect x={130} y={1050} width={180} height={110} rx={6} fill="#8ECAE6" />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={145} y={1066 + k * 30} width={60 + ((frame * 3 + k * 40) % 90)} height={14} rx={6} fill="white" />
    ))}
    <rect x={200} y={1180} width={40} height={30} fill="#264653" stroke={OUT} strokeWidth={8} />
    {/* mug */}
    <rect x={800} y={1140} width={60} height={70} rx={10} fill="#FFD60A" stroke={OUT} strokeWidth={8} />
    <path d="M 860 1155 q 30 0 30 20 q 0 20 -30 20" fill="none" stroke={OUT} strokeWidth={8} />
    {[0, 1].map((k) => (
      <path key={k} d={`M ${818 + k * 22} 1125 q -10 -20 0 -40`} fill="none" stroke="#ADB5BD" strokeWidth={6} strokeLinecap="round"
        opacity={0.5 + Math.sin(frame / 6 + k) * 0.4} />
    ))}
  </svg>
);

const Salon: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#FFCAD4" />
    {/* papier peint à rayures */}
    {Array.from({length: 12}).map((_, i) => (
      <rect key={i} x={i * 96} y={0} width={40} height={SOL} fill="#FFB3C1" />
    ))}
    {/* cadres */}
    <rect x={110} y={260} width={240} height={190} rx={10} fill="#A8DADC" stroke={OUT} strokeWidth={10} transform="rotate(-3 230 355)" />
    <path d="M 140 420 l 60 -80 l 50 50 l 40 -40 l 50 70 z" fill="#2A9D8F" stroke={OUT} strokeWidth={6} transform="rotate(-3 230 355)" />
    <rect x={720} y={240} width={220} height={260} rx={10} fill="#FFD60A" stroke={OUT} strokeWidth={10} transform="rotate(4 830 370)" />
    <circle cx={830} cy={350} r={50} fill="#E63946" stroke={OUT} strokeWidth={6} transform="rotate(4 830 370)" />
    {/* lampe sur pied */}
    <rect x={952} y={820} width={14} height={620} fill={OUT} />
    <path d="M 900 700 h 118 l 30 130 h -178 z" fill="#FFE8A3" stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
    <ellipse cx={960} cy={900} rx={150} ry={60} fill="#FFE8A3" opacity={0.25 + Math.sin(frame / 10) * 0.05} />
    {/* sol */}
    <rect y={SOL - 60} width={W} height={H} fill="#B08968" />
    {Array.from({length: 8}).map((_, i) => (
      <path key={i} d={`M 0 ${SOL - 60 + i * 60} H ${W}`} stroke="#9C6644" strokeWidth={6} />
    ))}
    <rect y={SOL - 72} width={W} height={20} fill="#FFFFFF" stroke={OUT} strokeWidth={6} />
    {/* canapé derrière Max */}
    <rect x={60} y={1040} width={960} height={220} rx={60} fill="#5E60CE" stroke={OUT} strokeWidth={12} />
    <rect x={40} y={1180} width={1000} height={200} rx={40} fill="#6930C3" stroke={OUT} strokeWidth={12} />
    <rect x={20} y={1120} width={120} height={280} rx={50} fill="#5E60CE" stroke={OUT} strokeWidth={12} />
    <rect x={940} y={1120} width={120} height={280} rx={50} fill="#5E60CE" stroke={OUT} strokeWidth={12} />
    <rect x={90} y={1380} width={30} height={60} fill={OUT} />
    <rect x={960} y={1380} width={30} height={60} fill={OUT} />
    {/* coussins */}
    <rect x={170} y={1090} width={170} height={130} rx={30} fill="#FFD60A" stroke={OUT} strokeWidth={10} transform="rotate(-8 255 1155)" />
    <rect x={740} y={1090} width={170} height={130} rx={30} fill="#06D6A0" stroke={OUT} strokeWidth={10} transform="rotate(8 825 1155)" />
    {/* tapis */}
    <ellipse cx={540} cy={SOL + 230} rx={460} ry={110} fill="#F4A261" stroke={OUT} strokeWidth={10} />
    <ellipse cx={540} cy={SOL + 230} rx={360} ry={70} fill="none" stroke="#E76F51" strokeWidth={12} strokeDasharray="30 20" />
  </svg>
);

/** Boutique de vêtements : portants, étagère de pulls pliés, caisse. Aucune enseigne réelle. */
const Magasin: React.FC<{frame: number; /** ep06 : file de caisse (la caisse elle-même est l'objet « caisse_tapis », devant le personnage) */ caisse?: boolean}> = ({frame, caisse = false}) => {
  const habits = ['#FF70A6', '#FFD60A', '#06D6A0', '#4361EE', '#F77F00', '#9D4EDD', '#E63946'];
  const portant = (x0: number, n: number, decal: number) => (
    <g>
      <path d={`M ${x0} 1440 V 900 H ${x0 + n * 62 + 40} V 1440`} fill="none" stroke={OUT} strokeWidth={14} strokeLinejoin="round" />
      <rect x={x0 - 40} y={1430} width={n * 62 + 120} height={20} rx={8} fill="#6C757D" stroke={OUT} strokeWidth={8} />
      {Array.from({length: n}).map((_, i) => {
        const x = x0 + 40 + i * 62;
        const sw = Math.sin(frame / 10 + i + decal) * 3;
        const c = habits[(i + decal) % habits.length];
        return (
          <g key={i} transform={`rotate(${sw} ${x} 900)`}>
            <path d={`M ${x} 900 v 16 l -34 22 h 68 z`} fill="none" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
            <path
              d={`M ${x - 40} 936 L ${x - 58} 990 L ${x - 38} 998 L ${x - 34} 1150 H ${x + 34} L ${x + 38} 998 L ${x + 58} 990 L ${x + 40} 936 Z`}
              fill={c}
              stroke={OUT}
              strokeWidth={7}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect width={W} height={H} fill="#FFF1E6" />
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={i * 170} y={0} width={85} height={SOL} fill="#FDE2E4" />
      ))}
      {/* guirlande de fanions */}
      <path d="M 0 140 Q 540 260 1080 140" fill="none" stroke={OUT} strokeWidth={6} />
      {Array.from({length: 11}).map((_, i) => {
        const x = 50 + i * 98;
        const y = 140 + Math.sin((x / 1080) * Math.PI) * 118 * 0.9;
        return <path key={i} d={`M ${x - 30} ${y} L ${x + 30} ${y} L ${x} ${y + 60} Z`} fill={habits[i % habits.length]} stroke={OUT} strokeWidth={5} strokeLinejoin="round" />;
      })}
      {/* étagère de pulls pliés */}
      <rect x={640} y={330} width={380} height={420} rx={12} fill="#DDB892" stroke={OUT} strokeWidth={10} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={640} y={330 + (r + 1) * 140 - 12} width={380} height={14} fill="#B08968" stroke={OUT} strokeWidth={6} />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              {[0, 1, 2].map((p) => (
                <rect key={p} x={665 + k * 118} y={330 + (r + 1) * 140 - 30 - p * 28} width={96} height={28} rx={8} fill={habits[(r * 3 + k + p) % habits.length]} stroke={OUT} strokeWidth={5} />
              ))}
            </g>
          ))}
        </g>
      ))}
      {caisse ? (
        // panneau de file de caisse suspendu (générique)
        <g transform={`rotate(${Math.sin(frame / 20) * 1.5} 230 330)`}>
          <path d="M 180 330 V 380 M 280 330 V 380" stroke={OUT} strokeWidth={6} />
          <rect x={90} y={380} width={280} height={170} rx={18} fill="#577590" stroke={OUT} strokeWidth={10} />
          <text x={230} y={455} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={62} fill="white">CAISSE</text>
          <circle cx={230} cy={505} r={30} fill="#06D6A0" stroke={OUT} strokeWidth={6} />
          <text x={230} y={520} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={40} fill={OUT}>3</text>
        </g>
      ) : (
      // affiche "SOLDES" générique
      <g transform="rotate(-6 230 470)">
        <rect x={80} y={360} width={300} height={200} rx={16} fill="#E63946" stroke={OUT} strokeWidth={10} />
        <text x={230} y={455} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={78} fill="white">SOLDES</text>
        <text x={230} y={530} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={60} fill="#FFD60A" opacity={0.6 + Math.sin(frame / 5) * 0.4}>-50 %</text>
      </g>
      )}
      {/* sol carrelé */}
      <rect y={SOL - 60} width={W} height={H} fill="#E9ECEF" />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={(i % 6) * 180 + (Math.floor(i / 6) % 2) * 90} y={SOL - 60 + Math.floor(i / 6) * 150} width={90} height={150} fill="#CED4DA" />
      ))}
      <rect y={SOL - 72} width={W} height={20} fill="#FFFFFF" stroke={OUT} strokeWidth={6} />
      {/* portants (derrière le personnage) */}
      {portant(-30, 4, 0)}
      {/* caisse */}
      {caisse ? null : (
        <>
      <rect x={720} y={1150} width={360} height={300} rx={14} fill="#F4A261" stroke={OUT} strokeWidth={10} />
      <rect x={700} y={1130} width={400} height={40} rx={10} fill="#E76F51" stroke={OUT} strokeWidth={10} />
      <rect x={800} y={1040} width={170} height={90} rx={12} fill="#495057" stroke={OUT} strokeWidth={8} />
      <rect x={815} y={1052} width={140} height={34} rx={6} fill="#06D6A0" />
      <text x={885} y={1080} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={28} fill={OUT}>{(29.9 + Math.floor(frame / 10) % 3 * 10).toFixed(2)}</text>
      <rect x={830} y={1094} width={110} height={26} rx={5} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
      {/* sac shopping */}
      <path d="M 980 1050 h 80 l 8 80 h -96 z" fill="#FF70A6" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 1000 1050 q 0 -36 20 -36 q 20 0 20 36" fill="none" stroke={OUT} strokeWidth={7} />
        </>
      )}
    </svg>
  );
};

/** Devanture de restaurant vue du trottoir : store rayé, enseigne générique, vitrine avec comptoir, trottoir. */
const Restaurant: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#FFB4A2" />
    {/* façade */}
    <rect x={0} y={0} width={W} height={SOL} fill="#E9C46A" />
    {Array.from({length: 14}).map((_, r) => (
      <g key={r}>
        {Array.from({length: 8}).map((_, k) => (
          <rect key={k} x={k * 150 - (r % 2) * 75} y={r * 60} width={146} height={56} fill="#E2B85A" />
        ))}
      </g>
    ))}
    {/* enseigne générique */}
    <rect x={190} y={220} width={700} height={120} rx={20} fill="#264653" stroke={OUT} strokeWidth={10} />
    <text x={540} y={312} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={84} fill="#FFE8A3" letterSpacing={6}>
      RESTAURANT
    </text>
    {/* store rayé */}
    <path d="M 40 400 H 1040 L 1080 560 H 0 Z" fill="#F1FAEE" stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
    {Array.from({length: 10}).map((_, i) => (
      <path key={i} d={`M ${40 + i * 100} 400 h 50 L ${i * 108 + 54} 560 h -54 Z`} fill="#2A9D8F" />
    ))}
    <path d="M 0 560 H 1080 L 1080 560" stroke={OUT} strokeWidth={10} />
    {Array.from({length: 12}).map((_, i) => (
      <path key={i} d={`M ${i * 90} 560 q 45 ${50 + Math.sin(frame / 10 + i) * 4} 90 0`} fill={i % 2 ? '#2A9D8F' : '#F1FAEE'} stroke={OUT} strokeWidth={8} />
    ))}
    {/* vitrine */}
    <rect x={40} y={660} width={760} height={780} rx={12} fill="#3D405B" stroke={OUT} strokeWidth={12} />
    <rect x={60} y={680} width={720} height={740} fill="#FFE8A3" />
    {/* intérieur : lampes, étagère, comptoir, sacs de commandes */}
    {[200, 420, 640].map((x, i) => (
      <g key={x}>
        <path d={`M ${x} 680 V 740`} stroke={OUT} strokeWidth={6} />
        <path d={`M ${x - 40} 780 Q ${x} 720 ${x + 40} 780 Z`} fill="#F4A261" stroke={OUT} strokeWidth={7} />
        <ellipse cx={x} cy={800} rx={60} ry={20} fill="white" opacity={0.35 + Math.sin(frame / 8 + i) * 0.1} />
      </g>
    ))}
    <rect x={90} y={860} width={660} height={16} fill="#BC6C25" stroke={OUT} strokeWidth={6} />
    {[130, 230, 330, 560, 660].map((x, i) => (
      <rect key={x} x={x} y={800} width={60} height={60} rx={8} fill={['#E76F51', '#06D6A0', '#FFD60A', '#4361EE', '#FF70A6'][i]} stroke={OUT} strokeWidth={6} />
    ))}
    <rect x={60} y={1150} width={720} height={270} fill="#BC6C25" stroke={OUT} strokeWidth={10} />
    <rect x={60} y={1130} width={720} height={36} fill="#DDA15E" stroke={OUT} strokeWidth={10} />
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M ${60 + k * 240} 1166 V 1420`} stroke="#9C5A1E" strokeWidth={8} />
    ))}
    {/* sacs kraft en attente sur le comptoir */}
    {[110, 200].map((x, i) => (
      <g key={x}>
        <path d={`M ${x} 1130 l 6 -96 h 68 l 6 96 z`} fill="#D4A373" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M ${x + 16} 1034 l 8 -16 h 32 l 8 16`} fill="none" stroke={OUT} strokeWidth={6} />
        <rect x={x + 20} y={1066} width={40} height={30} rx={4} fill="white" stroke={OUT} strokeWidth={4} transform={`rotate(${i ? 4 : -4} ${x + 40} 1080)`} />
      </g>
    ))}
    {/* sonnette de comptoir */}
    <path d="M 620 1128 q 0 -50 44 -50 q 44 0 44 50 z" fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
    <rect x={608} y={1122} width={112} height={12} rx={5} fill="#6C757D" stroke={OUT} strokeWidth={5} />
    <circle cx={664} cy={1072} r={8} fill="#6C757D" stroke={OUT} strokeWidth={4} />
    {/* reflets sur la vitre */}
    <path d="M 120 700 L 60 820 M 190 700 L 80 920" stroke="white" strokeWidth={16} opacity={0.35} />
    <path d="M 60 680 H 780" stroke="#3D405B" strokeWidth={6} />
    {/* porte */}
    <rect x={840} y={660} width={200} height={780} rx={10} fill="#264653" stroke={OUT} strokeWidth={12} />
    <rect x={866} y={690} width={148} height={420} rx={8} fill="#FFE8A3" stroke={OUT} strokeWidth={8} />
    <rect x={880} y={760} width={120} height={60} rx={8} fill="white" stroke={OUT} strokeWidth={5} />
    <text x={940} y={802} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={34} fill="#2A9D8F">OUVERT</text>
    <circle cx={866} cy={1200} r={14} fill="#FFD60A" stroke={OUT} strokeWidth={6} />
    {/* trottoir et bordure */}
    <rect y={SOL - 40} width={W} height={160} fill="#CED4DA" stroke={OUT} strokeWidth={10} />
    {Array.from({length: 6}).map((_, i) => (
      <path key={i} d={`M ${i * 200 + 100} ${SOL - 40} V ${SOL + 120}`} stroke="#ADB5BD" strokeWidth={6} />
    ))}
    <rect y={SOL + 120} width={W} height={36} fill="#ADB5BD" stroke={OUT} strokeWidth={8} />
    <rect y={SOL + 156} width={W} height={H} fill="#495057" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 300 + 40} y={SOL + 300} width={160} height={26} rx={8} fill="#FFD60A" />
    ))}
  </svg>
);

const Uni: React.FC<{nom: string}> = ({nom}) => {
  let h = 0;
  for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <AbsoluteFill
      style={{background: `radial-gradient(circle at 50% 45%, hsl(${h} 80% 65%), hsl(${(h + 40) % 360} 70% 40%))`}}
    />
  );
};

/** Chantier : salon en rénovation, mur ouvert avec gaines, tableau électrique ouvert. Aucune marque. */
const Chantier: React.FC<{frame: number}> = ({frame}) => {
  const lampe = 0.22 + Math.sin(frame / 9) * 0.04;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* mur : ancien papier peint arraché, plâtre nu */}
      <rect width={W} height={H} fill="#EDE0D4" />
      {Array.from({length: 6}).map((_, i) => (
        <rect key={i} x={380 + i * 96} y={0} width={40} height={520} fill="#E6CCB2" />
      ))}
      <path d="M 340 0 H 1080 V 560 Q 980 600 900 540 Q 820 610 720 560 Q 640 620 560 560 Q 470 610 380 540 Z" fill="#DDB892" opacity={0.55} />
      <path d="M 300 640 q 60 -30 120 10 q 40 30 100 0" fill="none" stroke="#C9A27E" strokeWidth={6} />
      {/* mur ouvert à gauche : saignées, gaines, boîtes d'encastrement */}
      <path d="M 0 600 H 250 L 262 700 L 244 860 L 258 1040 L 240 1220 L 250 1320 H 0 Z" fill="#B08968" stroke={OUT} strokeWidth={10} strokeLinejoin="round" />
      <path d="M 0 600 H 250 L 262 700 L 244 860 L 258 1040 L 240 1220 L 250 1320 H 0 Z" fill="none" stroke="#7F5539" strokeWidth={4} strokeDasharray="4 18" />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={0} y={640 + k * 170} width={250} height={14} fill="#9C6644" opacity={0.6} />
      ))}
      {/* gaines annelées (grises et orange) */}
      {[
        {d: 'M 70 600 V 900 Q 70 960 130 960 H 250', c: '#F77F00'},
        {d: 'M 150 600 V 1320', c: '#8D99AE'},
        {d: 'M 210 600 Q 210 760 120 800 Q 40 840 40 1000 V 1320', c: '#8D99AE'},
      ].map((g, i) => (
        <g key={i} fill="none" strokeLinecap="round">
          <path d={g.d} stroke={OUT} strokeWidth={30} />
          <path d={g.d} stroke={g.c} strokeWidth={20} />
          <path d={g.d} stroke="rgba(0,0,0,0.25)" strokeWidth={20} strokeDasharray="4 8" />
        </g>
      ))}
      {[[110, 1110], [190, 760]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={36} fill="#F1F3F5" stroke={OUT} strokeWidth={8} />
          <circle cx={x} cy={y} r={20} fill="#495057" />
          <path d={`M ${x - 6} ${y} q 10 -30 30 -24 M ${x + 4} ${y + 4} q 14 -10 34 6`} fill="none" stroke="#E63946" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* tableau électrique ouvert à droite : porte ouverte, rangées de disjoncteurs, fils */}
      <g>
        <rect x={830} y={620} width={220} height={420} rx={14} fill="#F8F9FA" stroke={OUT} strokeWidth={10} />
        <path d="M 1050 630 L 1080 600 V 1060 L 1050 1030" fill="#DEE2E6" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={846} y={650 + r * 92} width={188} height={14} rx={4} fill="#ADB5BD" />
            {Array.from({length: 6}).map((_, k) => (
              <g key={k}>
                <rect x={850 + k * 30} y={668 + r * 92} width={26} height={54} rx={4} fill="white" stroke={OUT} strokeWidth={4} />
                <rect
                  x={858 + k * 30}
                  y={(r * 6 + k) % 7 === 3 ? 696 + r * 92 : 678 + r * 92}
                  width={10}
                  height={18}
                  rx={3}
                  fill={(r * 6 + k) % 7 === 3 ? '#E63946' : k === 0 ? '#4361EE' : '#495057'}
                />
              </g>
            ))}
          </g>
        ))}
        {/* fils qui pendent du bas du tableau */}
        {['#E63946', '#4361EE', '#06D6A0', '#FFD60A'].map((c, i) => (
          <path
            key={c}
            d={`M ${870 + i * 40} 1040 q ${10 + Math.sin(frame / 14 + i) * 8} 70 ${-10 + i * 6} 130`}
            fill="none"
            stroke={c}
            strokeWidth={9}
            strokeLinecap="round"
          />
        ))}
        {/* étiquette de danger générique */}
        <path d="M 940 586 l 26 44 h -52 z" fill="#FFD60A" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 942 596 l -8 16 h 12 l -8 14" fill="none" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* baladeuse de chantier suspendue */}
      <path d="M 560 0 V 170" stroke={OUT} strokeWidth={6} />
      <path d="M 530 170 h 60 l 14 60 h -88 z" fill="#FFD60A" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
      <ellipse cx={560} cy={260} rx={260} ry={150} fill="#FFF3B0" opacity={lampe} />
      {/* sol : chape brute + bâche de protection */}
      <rect y={SOL - 60} width={W} height={H} fill="#ADB5BD" />
      <rect y={SOL - 72} width={W} height={20} fill="#CED4DA" stroke={OUT} strokeWidth={6} />
      <path d={`M 0 ${SOL + 40} L 1080 ${SOL - 10} L 1080 ${SOL + 300} L 0 ${SOL + 360} Z`} fill="#DDE9F0" opacity={0.85} stroke={OUT} strokeWidth={6} />
      <path d={`M 120 ${SOL + 120} q 200 -40 400 10 M 500 ${SOL + 220} q 200 -30 420 -10`} fill="none" stroke="#B8C9D4" strokeWidth={8} />
      {/* escabeau à droite, seau d'enduit à gauche */}
      <g>
        <path d="M 900 1480 L 960 1120 L 1020 1480" fill="none" stroke={OUT} strokeWidth={22} strokeLinejoin="round" />
        <path d="M 900 1480 L 960 1120 L 1020 1480" fill="none" stroke="#E9C46A" strokeWidth={12} strokeLinejoin="round" />
        {[1200, 1290, 1380].map((y) => (
          <path key={y} d={`M ${960 - (y - 1120) / 6} ${y} H ${960 + (y - 1120) / 6}`} stroke={OUT} strokeWidth={10} strokeLinecap="round" />
        ))}
      </g>
      <g>
        <path d="M 60 1380 h 130 l -12 110 h -106 z" fill="white" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 66 1410 H 184" stroke="#4361EE" strokeWidth={10} />
        <path d="M 66 1380 Q 125 1330 184 1380" fill="none" stroke={OUT} strokeWidth={5} />
      </g>
      {/* poussière qui flotte */}
      {Array.from({length: 14}).map((_, i) => {
        const x = (i * 173) % W;
        const y = 300 + (((i * 211) + frame * (1 + (i % 3))) % 900);
        return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="white" opacity={0.5} />;
      })}
    </svg>
  );
};

/** Entrepôt (ep07) : rayonnages métalliques et cartons vierges, sol béton, transpalette jaune, quai de chargement, néons. Aucun logo. */
const Entrepot: React.FC<{frame: number}> = ({frame}) => {
  const HORIZON = 1240;
  const carton = (x: number, y: number, w: number, h: number, k: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={k % 3 === 0 ? '#C8955C' : k % 3 === 1 ? '#D4A373' : '#BC8A5F'} stroke={OUT} strokeWidth={5} />
      <rect x={x + w / 2 - 7} y={y} width={14} height={h} fill="#E9C99A" opacity={0.85} />
    </g>
  );
  // rayonnage : montants bleu acier, lisses orange, 4 niveaux de cartons
  const rayonnage = (x0: number, largeur: number, cote: number) => {
    const niveaux = [380, 620, 860, 1100];
    return (
      <g>
        {niveaux.map((y, n) => (
          <g key={y}>
            {Array.from({length: 3}).map((_, k) => {
              const w = 70 + ((k * 29 + n * 17) % 30);
              const h = 120 + ((k * 41 + n * 23) % 70);
              const x = x0 + 26 + k * ((largeur - 52) / 3);
              return carton(x, y + 220 - h, w, h, k + n);
            })}
            <rect x={x0} y={y + 220} width={largeur} height={26} fill="#F77F00" stroke={OUT} strokeWidth={6} />
          </g>
        ))}
        {[x0, x0 + largeur - 26].map((x) => (
          <g key={x}>
            <rect x={x} y={300} width={26} height={1160} fill="#3E6A99" stroke={OUT} strokeWidth={6} />
            {Array.from({length: 22}).map((_, k) => (
              <rect key={k} x={x + 9} y={320 + k * 52} width={8} height={14} rx={2} fill="#22405F" />
            ))}
          </g>
        ))}
        {/* croisillons */}
        <path d={`M ${cote < 0 ? x0 + largeur - 13 : x0 + 13} 1340 l ${cote * -60} -100`} stroke="#3E6A99" strokeWidth={10} />
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* mur du fond (bardage métallique) */}
      <rect width={W} height={HORIZON} fill="#6C7A89" />
      {Array.from({length: 28}).map((_, i) => (
        <rect key={i} x={i * 40} y={0} width={6} height={HORIZON} fill="#5E6B79" />
      ))}
      {/* charpente + néons */}
      <rect y={0} width={W} height={60} fill="#4A5563" />
      {[90, 230].map((y, r) => (
        <path key={y} d={`M 0 ${y} H ${W}`} stroke="#3A4452" strokeWidth={16} />
      ))}
      {[[150, 120], [600, 120], [380, 260], [840, 260]].map(([x, y], i) => {
        const halo = 0.18 + Math.sin(frame / 7 + i) * 0.03;
        return (
          <g key={i}>
            <path d={`M ${x + 30} ${y - 30} V ${y} M ${x + 230} ${y - 30} V ${y}`} stroke={OUT} strokeWidth={5} />
            <ellipse cx={x + 130} cy={y + 60} rx={240} ry={90} fill="#F8F9FA" opacity={halo} />
            <rect x={x} y={y} width={260} height={26} rx={13} fill="#F8F9FA" stroke={OUT} strokeWidth={6} />
            <rect x={x + 14} y={y + 7} width={232} height={8} rx={4} fill="white" />
          </g>
        );
      })}
      {/* quai de chargement au fond : porte sectionnelle à moitié levée, lumière du jour, butoirs */}
      <g>
        <rect x={350} y={660} width={380} height={HORIZON - 660} fill="#3A4452" stroke={OUT} strokeWidth={10} />
        <rect x={370} y={860} width={340} height={HORIZON - 870} fill="#BDE0FE" />
        <rect x={370} y={1060} width={340} height={HORIZON - 1070} fill="#A3B18A" />
        {/* remorque de camion générique (blanche, sans marque) */}
        <rect x={410} y={900} width={260} height={230} rx={8} fill="#F1F3F5" stroke={OUT} strokeWidth={6} />
        <path d="M 540 900 V 1130" stroke="#CED4DA" strokeWidth={6} />
        {/* porte relevée */}
        <rect x={370} y={680} width={340} height={180} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
        {[716, 752, 788, 824].map((y) => (
          <path key={y} d={`M 370 ${y} H 710`} stroke="#868E96" strokeWidth={5} />
        ))}
        {/* bandes jaune et noir sur les côtés */}
        {[350, 714].map((x) => (
          <g key={x}>
            <rect x={x} y={660} width={16} height={HORIZON - 660} fill="#FFD60A" />
            {Array.from({length: 12}).map((_, k) => (
              <rect key={k} x={x} y={672 + k * 48} width={16} height={22} fill={OUT} />
            ))}
          </g>
        ))}
        {/* petit panneau numéro de quai */}
        <rect x={500} y={598} width={80} height={50} rx={8} fill="#FFD60A" stroke={OUT} strokeWidth={6} />
        <text x={540} y={638} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={38} fill={OUT}>
          4
        </text>
      </g>
      {/* sol béton + marquage jaune */}
      <rect y={HORIZON} width={W} height={H - HORIZON} fill="#B5AFA4" />
      <path d={`M 0 ${HORIZON} H ${W}`} stroke={OUT} strokeWidth={8} />
      {[[120, 1330], [700, 1400], [300, 1600], [860, 1700], [520, 1820]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={60 + (i % 2) * 30} ry={10} fill="#A39D92" />
      ))}
      <path d={`M 330 ${HORIZON} L 140 ${H}`} stroke="#FFD60A" strokeWidth={18} />
      <path d={`M 750 ${HORIZON} L 940 ${H}`} stroke="#FFD60A" strokeWidth={18} />
      {/* rayonnages gauche et droite */}
      {rayonnage(-20, 330, 1)}
      {rayonnage(770, 330, -1)}
      {/* transpalette jaune (fourches + timon) avec une palette de cartons, à gauche */}
      <g>
        <rect x={40} y={1280} width={250} height={26} fill="#D4A373" stroke={OUT} strokeWidth={6} />
        {carton(56, 1170, 110, 110, 0)}
        {carton(170, 1190, 104, 90, 1)}
        <rect x={30} y={1306} width={290} height={28} rx={6} fill="#FFC300" stroke={OUT} strokeWidth={6} />
        <rect x={286} y={1236} width={60} height={98} rx={10} fill="#FFC300" stroke={OUT} strokeWidth={6} />
        <path d="M 316 1240 L 378 1086" stroke={OUT} strokeWidth={20} strokeLinecap="round" />
        <path d="M 316 1240 L 378 1086" stroke="#FFC300" strokeWidth={10} strokeLinecap="round" />
        <path d="M 356 1084 H 404" stroke={OUT} strokeWidth={18} strokeLinecap="round" />
        <path d="M 356 1084 H 404" stroke="#343A40" strokeWidth={9} strokeLinecap="round" />
        {[60, 280, 316].map((x) => (
          <circle key={x} cx={x} cy={1342} r={13} fill="#343A40" stroke={OUT} strokeWidth={5} />
        ))}
      </g>
      {/* poussière dans la lumière des néons */}
      {Array.from({length: 12}).map((_, i) => {
        const x = (i * 181) % W;
        const y = 200 + (((i * 197) + frame * (1 + (i % 3))) % 900);
        return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="white" opacity={0.4} />;
      })}
    </svg>
  );
};

/** Parking couvert d'immeuble résidentiel (ep09) : plafond béton avec néons et gaines, mur peint à bande colorée,
 *  piliers numérotés, places tracées au sol, flèche de sens de circulation, voitures garées génériques
 *  (silhouettes de face sans logo, plaques vierges illisibles). */
const Parking: React.FC<{frame: number}> = ({frame}) => {
  const HORIZON = 1180;
  const voitureFace = (cx: number, w: number, couleur: string, k: number) => {
    const h = w * 0.62;
    const y0 = HORIZON - h + 6;
    return (
      <g key={k}>
        <ellipse cx={cx} cy={HORIZON + 8} rx={w * 0.55} ry={10} fill="rgba(0,0,0,0.25)" />
        {/* toit et pare-brise */}
        <path d={`M ${cx - w * 0.36} ${y0 + h * 0.42} L ${cx - w * 0.27} ${y0 + 4} H ${cx + w * 0.27} L ${cx + w * 0.36} ${y0 + h * 0.42} Z`} fill={couleur} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${cx - w * 0.3} ${y0 + h * 0.38} L ${cx - w * 0.23} ${y0 + 14} H ${cx + w * 0.23} L ${cx + w * 0.3} ${y0 + h * 0.38} Z`} fill="#9DB4C0" stroke={OUT} strokeWidth={4} />
        {/* capot, phares, plaque vierge */}
        <rect x={cx - w / 2} y={y0 + h * 0.4} width={w} height={h * 0.46} rx={16} fill={couleur} stroke={OUT} strokeWidth={6} />
        <rect x={cx - w * 0.44} y={y0 + h * 0.5} width={w * 0.18} height={h * 0.1} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={4} />
        <rect x={cx + w * 0.26} y={y0 + h * 0.5} width={w * 0.18} height={h * 0.1} rx={6} fill="#FFF3B0" stroke={OUT} strokeWidth={4} />
        <rect x={cx - w * 0.16} y={y0 + h * 0.66} width={w * 0.32} height={h * 0.1} rx={3} fill="#F8F9FA" stroke={OUT} strokeWidth={3} />
        <rect x={cx - w * 0.46} y={y0 + h * 0.84} width={w * 0.14} height={h * 0.16} rx={5} fill="#212529" />
        <rect x={cx + w * 0.32} y={y0 + h * 0.84} width={w * 0.14} height={h * 0.16} rx={5} fill="#212529" />
      </g>
    );
  };
  const pilier = (x: number, w: number, num: string) => (
    <g key={num}>
      <rect x={x} y={180} width={w} height={HORIZON - 180 + 300} fill="#C9C5BC" stroke={OUT} strokeWidth={8} />
      <rect x={x + w - 26} y={180} width={18} height={HORIZON + 120} fill="#B5B0A6" />
      <rect x={x} y={760} width={w} height={150} fill="#2A9D8F" stroke={OUT} strokeWidth={6} />
      <text x={x + w / 2} y={862} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={78} fill="white">{num}</text>
      {/* bandes de protection en bas du pilier */}
      {Array.from({length: 4}).map((_, k) => (
        <rect key={k} x={x} y={HORIZON + 160 + k * 36} width={w} height={18} fill={k % 2 ? '#FFD60A' : OUT} />
      ))}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* mur du fond : béton clair, bande colorée en bas */}
      <rect width={W} height={HORIZON} fill="#D9D4CA" />
      <rect y={HORIZON - 260} width={W} height={260} fill="#8ECAE6" />
      <path d={`M 0 ${HORIZON - 260} H ${W}`} stroke={OUT} strokeWidth={6} />
      {/* plafond : dalle béton, poutres, gaines, néons */}
      <rect width={W} height={180} fill="#A8A398" />
      {[0, 360, 720].map((x) => (
        <rect key={x} x={x} y={150} width={W / 3} height={50} fill="#9A958A" stroke={OUT} strokeWidth={5} />
      ))}
      <path d="M 0 236 H 1080" stroke="#7D8590" strokeWidth={22} />
      <path d="M 0 268 H 1080" stroke="#C0392B" strokeWidth={12} opacity={0.7} />
      {[150, 690].map((x, i) => {
        const halo = 0.2 + Math.sin(frame / 8 + i) * 0.03;
        return (
          <g key={x}>
            <ellipse cx={x + 120} cy={330} rx={240} ry={80} fill="#FFFDE7" opacity={halo} />
            <rect x={x} y={300} width={240} height={24} rx={12} fill="#FFFDE7" stroke={OUT} strokeWidth={6} />
          </g>
        );
      })}
      {/* panneau générique de sortie */}
      <rect x={420} y={420} width={240} height={80} rx={12} fill="#1F9D55" stroke={OUT} strokeWidth={7} />
      <text x={540} y={478} textAnchor="middle" fontFamily="Luckiest Guy" fontSize={44} fill="white">SORTIE →</text>
      {/* voitures garées au fond (génériques, de face) */}
      {voitureFace(330, 230, '#E76F51', 0)}
      {voitureFace(760, 250, '#F8F9FA', 1)}
      {/* sol : enrobé gris, places tracées en perspective, flèche */}
      <rect y={HORIZON} width={W} height={H - HORIZON} fill="#7A7F87" />
      <path d={`M 0 ${HORIZON} H ${W}`} stroke={OUT} strokeWidth={8} />
      {[-300, 60, 420, 780, 1140, 1500].map((x, i) => (
        <path key={i} d={`M ${540 + (x - 540) * 0.35} ${HORIZON} L ${x} ${H}`} stroke="#F8F9FA" strokeWidth={12} opacity={0.85} />
      ))}
      <path d={`M 0 ${HORIZON + 140} H ${W}`} stroke="#F8F9FA" strokeWidth={10} opacity={0.6} />
      <path d={`M 470 ${H - 160} L 540 ${H - 260} L 610 ${H - 160} H 570 V ${H - 60} H 510 V ${H - 160} Z`} fill="#F8F9FA" opacity={0.75} />
      {[[160, 1600], [900, 1720], [700, 1560]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={70} ry={12} fill="#6C717A" />
      ))}
      {/* piliers numérotés */}
      {pilier(-40, 150, 'B2')}
      {pilier(970, 150, 'B3')}
    </svg>
  );
};

/** Coworking (ep10) : open space lumineux, grandes baies vitrées, bureaux partagés, plantes, suspensions. Aucun logo. */
const Coworking: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#F7F3EA" />
    {/* baies vitrées : ciel, immeubles au loin */}
    <rect x={40} y={140} width={1000} height={760} rx={10} fill="#BDE7F5" stroke={OUT} strokeWidth={10} />
    <circle cx={850} cy={300} r={70} fill="#FFF3B0" opacity={0.9} />
    {[[90, 560, 120, 340], [230, 480, 100, 420], [350, 620, 140, 280], [520, 520, 110, 380], [650, 600, 130, 300], [800, 500, 120, 400], [930, 640, 100, 260]].map(([x, y, w, h], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill={i % 2 ? '#A9C6D9' : '#93B5CC'} />
        {Array.from({length: 4}).map((_, k) => (
          <rect key={k} x={x + 16} y={y + 24 + k * 50} width={w - 32} height={18} fill="white" opacity={0.45} />
        ))}
      </g>
    ))}
    {[290, 540, 790].map((x) => (
      <rect key={x} x={x - 7} y={140} width={14} height={760} fill="#F7F3EA" stroke={OUT} strokeWidth={5} />
    ))}
    <rect x={40} y={500} width={1000} height={12} fill="#F7F3EA" stroke={OUT} strokeWidth={5} />
    {/* reflets */}
    <path d="M 100 200 l 120 120 M 130 200 l 60 60 M 600 220 l 140 140" stroke="white" strokeWidth={10} opacity={0.5} strokeLinecap="round" />
    {/* suspensions */}
    {[220, 540, 860].map((x, i) => (
      <g key={x} transform={`rotate(${Math.sin(frame / 30 + i) * 1.5} ${x} 0)`}>
        <path d={`M ${x} 0 V 150`} stroke={OUT} strokeWidth={5} />
        <path d={`M ${x - 60} 210 Q ${x} 130 ${x + 60} 210 Z`} fill="#F4A261" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <ellipse cx={x} cy={222} rx={70} ry={20} fill="#FFF3B0" opacity={0.6} />
      </g>
    ))}
    {/* plante suspendue */}
    <g transform={`rotate(${Math.sin(frame / 25) * 3} 980 0)`}>
      <path d="M 980 0 V 110" stroke={OUT} strokeWidth={4} />
      <path d="M 940 110 h 80 l -10 50 h -60 z" fill="#E9C46A" stroke={OUT} strokeWidth={6} />
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={`M ${950 + k * 20} 150 q ${k % 2 ? 20 : -20} 80 ${k % 2 ? 0 : -10} 160`} fill="none" stroke="#40916C" strokeWidth={12} strokeLinecap="round" />
      ))}
    </g>
    {/* bureaux partagés au fond (écrans génériques, sans personne) */}
    <rect x={0} y={1080} width={W} height={50} fill="#D6B98C" stroke={OUT} strokeWidth={8} />
    {[150, 420, 690, 960].map((x, i) => (
      <g key={x}>
        <rect x={x - 70} y={980} width={140} height={96} rx={8} fill="#343A40" stroke={OUT} strokeWidth={6} />
        <rect x={x - 60} y={990} width={120} height={76} rx={4} fill={i % 2 ? '#CDE7F7' : '#D8F3DC'} />
        <rect x={x - 8} y={1076} width={16} height={8} fill="#495057" />
        <rect x={x - 46} y={960 - (i % 2) * 6} width={0} height={0} />
      </g>
    ))}
    <rect x={0} y={1130} width={W} height={200} fill="#C9A878" />
    {/* grande plante en pot à gauche */}
    <rect x={30} y={1280} width={130} height={170} rx={16} fill="#F1F3F5" stroke={OUT} strokeWidth={9} />
    {[-50, -25, 0, 25, 50].map((a, i) => (
      <ellipse key={i} cx={95} cy={1150} rx={30} ry={110} fill={i % 2 ? '#52B788' : '#2D6A4F'} stroke={OUT} strokeWidth={7}
        transform={`rotate(${a + Math.sin(frame / 14 + i) * 3} 95 1280)`} />
    ))}
    {/* sol parquet clair */}
    <rect y={SOL - 60} width={W} height={H} fill="#E3C79E" />
    {Array.from({length: 9}).map((_, i) => (
      <path key={i} d={`M 0 ${SOL - 60 + i * 56} H ${W}`} stroke="#CFAE7E" strokeWidth={5} />
    ))}
    <rect y={SOL - 72} width={W} height={18} fill="#FFFFFF" stroke={OUT} strokeWidth={6} />
    {/* petite plante au sol à droite */}
    <rect x={930} y={1340} width={110} height={120} rx={14} fill="#E76F51" stroke={OUT} strokeWidth={8} />
    {[-30, 0, 30].map((a, i) => (
      <ellipse key={i} cx={985} cy={1270} rx={24} ry={70} fill="#40916C" stroke={OUT} strokeWidth={6}
        transform={`rotate(${a + Math.sin(frame / 12 + i) * 4} 985 1340)`} />
    ))}
  </svg>
);

/** ep11 : salon de coiffure : miroirs éclairés, tablette de produits génériques (sans marque), fauteuils, bacs à shampoing
 *  au fond à droite, sol en damier, plante. Aucune enseigne réelle. */
const SalonCoiffure: React.FC<{frame: number}> = ({frame}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
    <rect width={W} height={H} fill="#F6E7E1" />
    {/* lambris et frise */}
    <rect y={1040} width={W} height={SOL} fill="#E8CFC4" />
    <rect y={1030} width={W} height={18} fill="#D4A5A5" stroke={OUT} strokeWidth={5} />
    {/* miroirs éclairés (ampoules qui scintillent) */}
    {[200, 600].map((mx, i) => (
      <g key={mx}>
        <rect x={mx - 150} y={260} width={300} height={560} rx={150} fill="#F8F9FA" stroke={OUT} strokeWidth={12} />
        <rect x={mx - 128} y={282} width={256} height={516} rx={128} fill="#CDE7F7" />
        <path d={`M ${mx - 80} 380 l 120 -80 M ${mx - 90} 470 l 160 -110`} stroke="white" strokeWidth={14} strokeLinecap="round" opacity={0.7} />
        {Array.from({length: 7}).map((_, k) => {
          const a = Math.PI + (k / 6) * Math.PI;
          const bx = mx + Math.cos(a) * 168;
          const by = 410 + Math.sin(a) * 168;
          return <circle key={k} cx={bx} cy={by} r={14} fill="#FFF3B0" stroke={OUT} strokeWidth={4} opacity={0.75 + Math.sin(frame / 6 + k + i) * 0.25} />;
        })}
        {/* tablette sous le miroir */}
        <rect x={mx - 180} y={840} width={360} height={30} rx={8} fill="#BC8A5F" stroke={OUT} strokeWidth={7} />
        {[-120, -70, 60, 110].map((dx, k) => (
          <g key={dx}>
            <rect x={mx + dx - 16} y={780 - (k % 2) * 14} width={32} height={60 + (k % 2) * 14} rx={9} fill={['#8ECAE6', '#FFB4A2', '#B7E4C7', '#CDB4DB'][k]} stroke={OUT} strokeWidth={4} />
            <rect x={mx + dx - 7} y={766 - (k % 2) * 14} width={14} height={14} fill="#495057" stroke={OUT} strokeWidth={3} />
          </g>
        ))}
        {/* sèche-cheveux posé */}
        <path d={`M ${mx - 10} 826 h 60 a 16 16 0 0 0 0 -32 h -60 z`} fill="#343A40" stroke={OUT} strokeWidth={4} />
      </g>
    ))}
    {/* bacs à shampoing au fond à droite */}
    <g>
      <rect x={840} y={1000} width={240} height={260} rx={20} fill="#2B2D42" stroke={OUT} strokeWidth={9} />
      <path d="M 860 1000 Q 960 920 1060 1000 Z" fill="#F8F9FA" stroke={OUT} strokeWidth={8} />
      <path d="M 960 940 v -60 q 0 -30 30 -30 h 40" fill="none" stroke="#ADB5BD" strokeWidth={10} strokeLinecap="round" />
      <rect x={870} y={1110} width={200} height={70} rx={20} fill="#3D405B" stroke={OUT} strokeWidth={7} />
    </g>
    {/* fauteuils de coiffure vides au fond */}
    {[200, 600].map((fx) => (
      <g key={fx} transform={`translate(${fx} 0)`}>
        <rect x={-90} y={980} width={180} height={220} rx={40} fill="#2B2D42" stroke={OUT} strokeWidth={8} />
        <rect x={-110} y={1180} width={220} height={40} rx={16} fill="#2B2D42" stroke={OUT} strokeWidth={8} />
        <rect x={-14} y={1220} width={28} height={70} fill="#ADB5BD" stroke={OUT} strokeWidth={5} />
        <ellipse cx={0} cy={1296} rx={80} ry={16} fill="#ADB5BD" stroke={OUT} strokeWidth={6} />
      </g>
    ))}
    {/* plante */}
    <rect x={410} y={1190} width={70} height={100} rx={10} fill="#E9C46A" stroke={OUT} strokeWidth={6} />
    {[-35, 0, 35].map((a, i) => (
      <ellipse key={i} cx={445} cy={1140} rx={16} ry={56} fill="#40916C" stroke={OUT} strokeWidth={5} transform={`rotate(${a + Math.sin(frame / 12 + i) * 4} 445 1190)`} />
    ))}
    {/* sol en damier */}
    <rect y={SOL - 60} width={W} height={H} fill="#F8F9FA" />
    {Array.from({length: 7}).map((_, r) =>
      Array.from({length: 12}).map((_, c) =>
        (r + c) % 2 ? <rect key={`${r}-${c}`} x={c * 90} y={SOL - 60 + r * 70} width={90} height={70} fill="#343A40" /> : null,
      ),
    )}
    <rect y={SOL - 72} width={W} height={18} fill="#D4A5A5" stroke={OUT} strokeWidth={6} />
  </svg>
);

export const Decor: React.FC<{nom: string; variante?: number}> = ({nom, variante = 0}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // léger zoom continu pour garder le plan vivant
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  let content: React.ReactNode;
  switch (nom) {
    case 'studio':
      content = <Studio variante={variante} frame={frame} />;
      break;
    case 'chambre':
      content = <Chambre frame={frame} />;
      break;
    case 'rue':
      content = <Rue frame={frame} />;
      break;
    case 'magasin':
      content = <Magasin frame={frame} />;
      break;
    case 'magasin_caisse':
      content = <Magasin frame={frame} caisse />;
      break;
    case 'bureau':
      content = <Bureau frame={frame} />;
      break;
    case 'salon':
      content = <Salon frame={frame} />;
      break;
    case 'restaurant':
      content = <Restaurant frame={frame} />;
      break;
    case 'chantier':
      content = <Chantier frame={frame} />;
      break;
    case 'banque':
      content = <Banque frame={frame} />;
      break;
    case 'entrepot':
      content = <Entrepot frame={frame} />;
      break;
    case 'parking':
      content = <Parking frame={frame} />;
      break;
    case 'coworking':
      content = <Coworking frame={frame} />;
      break;
    case 'voiture':
      content = <DecorVoiture frame={frame} />;
      break;
    case 'salon_coiffure':
      content = <SalonCoiffure frame={frame} />;
      break;
    default:
      content = <Uni nom={nom} />;
  }
  return <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>{content}</AbsoluteFill>;
};
