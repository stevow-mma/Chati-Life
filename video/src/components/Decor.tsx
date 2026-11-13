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

const Uni: React.FC<{nom: string}> = ({nom}) => {
  let h = 0;
  for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <AbsoluteFill
      style={{background: `radial-gradient(circle at 50% 45%, hsl(${h} 80% 65%), hsl(${(h + 40) % 360} 70% 40%))`}}
    />
  );
};

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
    case 'banque':
      content = <Banque frame={frame} />;
      break;
    default:
      content = <Uni nom={nom} />;
  }
  return <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>{content}</AbsoluteFill>;
};
