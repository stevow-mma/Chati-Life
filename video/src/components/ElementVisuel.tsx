import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import {usePremiereImage} from '../intro';
import type {ElementVisuel} from '../types';

const OUT = '#1b1b2f';

const formatFr = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const usePop = (delay = 4) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const premier = usePremiereImage();
  if (premier) return 1;
  return spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 200}});
};

const Card: React.FC<{children: React.ReactNode; rotate?: number}> = ({children, rotate = -2}) => {
  const pop = usePop();
  return (
    <div
      style={{
        transform: `scale(${pop}) rotate(${rotate}deg)`,
        background: 'white',
        border: `10px solid ${OUT}`,
        borderRadius: 40,
        boxShadow: '0 18px 0 rgba(0,0,0,0.3)',
        padding: '36px 56px',
        textAlign: 'center',
        minWidth: 640,
      }}
    >
      {children}
    </div>
  );
};

const CompteurVues: React.FC<{valeur: number; legende?: string}> = ({valeur, legende}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [6, 6 + fps * 1.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const eased = 1 - Math.pow(1 - t, 3);
  const done = t >= 1;
  const bump = done ? spring({frame: frame - 6 - fps * 1.6, fps, config: {damping: 8}}) : 0;
  return (
    <Card>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, justifyContent: 'center'}}>
        <svg width={120} height={86} viewBox="0 0 120 86">
          <rect x={4} y={4} width={112} height={78} rx={22} fill="#E63946" stroke={OUT} strokeWidth={7} />
          <path d="M 48 24 L 80 43 L 48 62 Z" fill="white" />
        </svg>
        <div
          style={{
            fontFamily: FONT_TITRE,
            fontSize: 110,
            color: OUT,
            lineHeight: 1,
            paddingTop: 16,
            transform: `scale(${1 + bump * 0.08 * (done ? Math.max(0, 1 - (frame - 54) / 20) : 0)})`,
          }}
        >
          {formatFr(valeur * eased)}
        </div>
      </div>
      {legende ? (
        <div style={{fontFamily: FONT_TEXTE, fontSize: 56, color: '#6C757D', marginTop: 4}}>{legende}</div>
      ) : null}
    </Card>
  );
};

/** Taille du chiffre selon sa longueur, pour que la carte tienne dans l'écran. */
const tailleChiffre = (valeur: string) => {
  const n = valeur.length;
  if (n <= 8) return 170;
  if (n <= 11) return 140;
  if (n <= 15) return 112;
  if (n <= 22) return 92;
  return 80;
};

const CarteChiffre: React.FC<{valeur: string; legende?: string; source?: string; mention?: string; petit?: string}> = ({valeur, legende, source, mention, petit}) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 5) * 2;
  // "0,50 – 1,50 $ / 1 000 vues" : le chiffre en gros, l'unité "/ …" en dessous
  // "A · B" : une ligne par partie
  const lignes = valeur.split(' · ');
  const [chiffre, ...unite] = lignes.length > 1 ? [valeur] : valeur.split(' / ');
  return (
    <Card rotate={2}>
      <div style={{maxWidth: 860}}>
        {lignes.length > 1 ? (
          lignes.map((l, i) => (
            <div key={i} style={{fontFamily: FONT_TITRE, fontSize: 62, whiteSpace: 'nowrap', color: i === 0 ? '#E63946' : '#2D6A4F', lineHeight: 1.1, paddingTop: i === 0 ? 20 : 8, transform: `rotate(${wobble}deg)`}}>
              {l}
            </div>
          ))
        ) : (
          <div style={{fontFamily: FONT_TITRE, fontSize: tailleChiffre(chiffre), color: '#2D6A4F', lineHeight: 1.05, paddingTop: 20, transform: `rotate(${wobble}deg)`}}>
            {chiffre}
          </div>
        )}
        {unite.length ? (
          <div style={{fontFamily: FONT_TITRE, fontSize: 70, color: '#2D6A4F', lineHeight: 1, marginTop: 6}}>/ {unite.join(' / ')}</div>
        ) : null}
        {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 60, color: OUT, marginTop: 8}}>{legende}</div> : null}
        {petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 40, color: '#495057', marginTop: 6, fontStyle: 'italic'}}>{petit}</div> : null}
        {source ? (
          <div
            style={{
              fontFamily: FONT_TEXTE,
              fontSize: 34,
              color: '#6C757D',
              marginTop: 22,
              borderTop: '4px dashed #CED4DA',
              paddingTop: 14,
            }}
          >
            {source}
          </div>
        ) : null}
        {mention ? <Mention>{mention}</Mention> : null}
      </div>
    </Card>
  );
};

/** Écran de téléphone vertical, interface stylisée (pas de logo officiel). */
const EcranTelephone: React.FC<{plateforme?: string; texte?: string}> = ({plateforme, texte}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  if (texte) return <PubTelephone texte={texte} />;
  const yt = plateforme === 'youtube';
  const nom = yt ? 'YouTube Shorts' : plateforme === 'tiktok' ? 'TikTok' : plateforme ?? '';
  const accent = yt ? '#FF0033' : '#25F4EE';
  const accent2 = yt ? '#FFFFFF' : '#FE2C55';
  const scroll = (frame * 3) % 120;
  const like = 1 + Math.max(0, Math.sin(frame / 5)) * 0.15;
  return (
    <div style={{transform: `scale(${pop}) rotate(${Math.sin(frame / 10) * 3}deg)`}}>
      <svg width={230} height={337} viewBox="0 0 300 440">
        <rect x={8} y={8} width={284} height={424} rx={44} fill="#222" stroke={OUT} strokeWidth={10} />
        <clipPath id="ecran"><rect x={26} y={30} width={248} height={380} rx={26} /></clipPath>
        <g clipPath="url(#ecran)">
          <rect x={26} y={30} width={248} height={380} fill="#111" />
          {/* vidéos qui défilent */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={26} y={30 + i * 120 - scroll} width={248} height={112} fill={i % 2 ? '#3A0CA3' : '#4361EE'} opacity={0.55} />
          ))}
          <path d="M 130 190 l 50 30 l -50 30 z" fill="white" opacity={0.9} />
          {/* colonne d'icônes */}
          <g transform={`translate(240 230) scale(${like})`}>
            <path d="M 0 8 C -14 -8 -26 6 0 24 C 26 6 14 -8 0 8 Z" fill={accent2} stroke={OUT} strokeWidth={3} />
          </g>
          <circle cx={240} cy={290} r={14} fill="white" opacity={0.85} />
          <circle cx={240} cy={340} r={14} fill="white" opacity={0.85} />
          {/* barre du bas */}
          <rect x={26} y={370} width={248} height={40} fill="#000" />
          <rect x={130} y={378} width={40} height={24} rx={8} fill={accent} />
          <rect x={136} y={378} width={28} height={24} rx={6} fill={accent2} />
        </g>
        <rect x={120} y={16} width={60} height={10} rx={5} fill="#444" />
      </svg>
      <div
        style={{
          fontFamily: FONT_TITRE,
          fontSize: 58,
          color: 'white',
          textAlign: 'center',
          marginTop: -6,
          WebkitTextStroke: '10px black',
          paintOrder: 'stroke fill',
        }}
      >
        {nom}
      </div>
    </div>
  );
};

/** Chronomètre : les secondes défilent jusqu'à la valeur, puis l'aiguille clignote. */
const Chrono: React.FC<{valeur: string}> = ({valeur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [m, sec] = valeur.split(':').map((x) => parseInt(x, 10) || 0);
  const cible = m * 60 + sec;
  const t = interpolate(frame, [6, 6 + fps * 1.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const now = Math.round(cible * (1 - Math.pow(1 - t, 2)));
  const txt = `${Math.floor(now / 60)}:${String(now % 60).padStart(2, '0')}`;
  const done = t >= 1;
  const angle = (now / Math.max(cible, 1)) * 360;
  return (
    <Card rotate={-3}>
      <div style={{display: 'flex', alignItems: 'center', gap: 36, justifyContent: 'center'}}>
        <svg width={200} height={230} viewBox="0 0 200 230">
          <rect x={80} y={4} width={40} height={30} rx={6} fill="#ADB5BD" stroke={OUT} strokeWidth={7} />
          <circle cx={100} cy={130} r={90} fill={done && Math.floor(frame / 6) % 2 ? '#FFD60A' : 'white'} stroke={OUT} strokeWidth={10} />
          <path d={`M 100 130 L 100 54 A 76 76 0 ${angle > 180 ? 1 : 0} 1 ${100 + Math.sin((angle * Math.PI) / 180) * 76} ${130 - Math.cos((angle * Math.PI) / 180) * 76} Z`} fill="#E63946" opacity={0.85} />
          <line x1={100} y1={130} x2={100 + Math.sin((angle * Math.PI) / 180) * 70} y2={130 - Math.cos((angle * Math.PI) / 180) * 70} stroke={OUT} strokeWidth={9} strokeLinecap="round" />
          <circle cx={100} cy={130} r={12} fill={OUT} />
        </svg>
        <div style={{fontFamily: FONT_TITRE, fontSize: 170, color: OUT, lineHeight: 1, paddingTop: 24}}>{txt}</div>
      </div>
    </Card>
  );
};

/** Jauge horizontale qui se remplit jusqu'à `valeur` %. */
const Jauge: React.FC<{valeur: number; legende?: string}> = ({valeur, legende}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [8, 8 + fps * 1.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = valeur * (1 - Math.pow(1 - t, 3));
  const W = 700;
  return (
    <Card rotate={-2}>
      <div style={{fontFamily: FONT_TITRE, fontSize: 150, color: '#E63946', lineHeight: 1, paddingTop: 18}}>{Math.round(v)} %</div>
      <div style={{position: 'relative', width: W, height: 90, margin: '18px auto 0', borderRadius: 45, border: `9px solid ${OUT}`, background: '#E9ECEF', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: 'repeating-linear-gradient(-45deg, #FFD60A 0 26px, #F4A261 26px 52px)', borderRight: `9px solid ${OUT}`}} />
        <div style={{position: 'absolute', left: '50%', top: -10, bottom: -10, borderLeft: `6px dashed ${OUT}`, opacity: 0.4}} />
      </div>
      {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 56, color: '#6C757D', marginTop: 10}}>{legende}</div> : null}
    </Card>
  );
};

/** Pile de billets qui fond comme une glace au soleil. */
const BilletsFondent: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = usePop();
  const melt = interpolate(frame, [fps * 0.6, durationInFrames - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pile = 6;
  return (
    <div style={{transform: `scale(${pop})`}}>
      <svg width={520} height={420} viewBox="0 0 520 420">
        {/* flaque verte qui s'étale */}
        <ellipse cx={260} cy={380} rx={120 + melt * 130} ry={22 + melt * 18} fill="#52B788" stroke={OUT} strokeWidth={8} />
        {Array.from({length: pile}).map((_, i) => {
          const gone = melt * pile > pile - 1 - i + 0.5; // le haut fond en premier
          const h = 46 * (1 - Math.min(1, Math.max(0, melt * pile - (pile - 1 - i))));
          const y = 360 - (i + 1) * 46 + (46 - h);
          if (gone && h < 4) return null;
          return (
            <g key={i}>
              <rect x={120 + (i % 2) * 10} y={y} width={260} height={Math.max(h, 4)} rx={8} fill="#95D5B2" stroke={OUT} strokeWidth={7} />
              {h > 24 ? <circle cx={250 + (i % 2) * 10} cy={y + h / 2} r={14} fill="#52B788" stroke={OUT} strokeWidth={5} /> : null}
            </g>
          );
        })}
        {/* gouttes */}
        {[0, 1, 2, 3].map((k) => {
          const dy = ((frame * 4 + k * 30) % 90);
          return melt > 0.05 ? (
            <path key={k} d={`M ${150 + k * 70} ${300 + dy} q 10 16 0 24 q -10 -8 0 -24 z`} fill="#52B788" stroke={OUT} strokeWidth={4} opacity={1 - dy / 90} />
          ) : null;
        })}
        {/* soleil */}
        <g transform={`rotate(${frame * 2} 450 70)`}>
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={446} y={10} width={8} height={24} rx={4} fill="#FFB703" transform={`rotate(${i * 45} 450 70)`} />
          ))}
        </g>
        <circle cx={450} cy={70} r={34} fill="#FFD60A" stroke={OUT} strokeWidth={6} />
      </svg>
    </div>
  );
};

/** Cadre de téléphone commun (vertical). */
const Telephone: React.FC<{children: React.ReactNode; w?: number; h?: number}> = ({children, w = 300, h = 420}) => (
  <div
    style={{
      width: w,
      height: h,
      background: '#222',
      border: `10px solid ${OUT}`,
      borderRadius: 46,
      padding: '26px 14px 20px',
      boxSizing: 'border-box',
      boxShadow: '0 18px 0 rgba(0,0,0,0.3)',
      position: 'relative',
    }}
  >
    <div style={{position: 'absolute', top: 9, left: '50%', marginLeft: -30, width: 60, height: 9, borderRadius: 5, background: '#444'}} />
    <div style={{width: '100%', height: '100%', borderRadius: 26, overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);

/** Pub générique (aucune marque) affichée dans un téléphone. */
const PubTelephone: React.FC<{texte: string}> = ({texte}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const pulse = 1 + Math.max(0, Math.sin(frame / 4)) * 0.08;
  return (
    <div style={{transform: `scale(${pop * 0.84}) rotate(${Math.sin(frame / 10) * 3}deg)`}}>
      <Telephone w={290} h={420}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #FFD60A, #FF70A6)'}} />
        <div style={{position: 'absolute', top: 12, left: 12, background: OUT, color: 'white', fontFamily: FONT_TITRE, fontSize: 24, padding: '6px 12px 2px', borderRadius: 8}}>
          PUB
        </div>
        {/* étoiles brillantes */}
        {[0, 1, 2].map((k) => (
          <div key={k} style={{position: 'absolute', left: 30 + k * 80, top: 60 + (k % 2) * 30, fontSize: 30, opacity: 0.5 + 0.5 * Math.sin(frame / 4 + k), color: 'white', fontFamily: FONT_TITRE}}>
            +
          </div>
        ))}
        <svg width={120} height={100} viewBox="0 0 120 100" style={{position: 'absolute', left: 81, top: 92}}>
          <path d="M 10 40 L 25 10 H 95 L 110 40 Z" fill="#E63946" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <rect x={18} y={40} width={84} height={52} fill="white" stroke={OUT} strokeWidth={6} />
          <rect x={48} y={58} width={24} height={34} fill="#8ECAE6" stroke={OUT} strokeWidth={5} />
        </svg>
        <div style={{position: 'absolute', top: 200, left: 10, right: 10, textAlign: 'center', fontFamily: FONT_TITRE, fontSize: 40, lineHeight: 1.05, color: OUT}}>
          {texte}
        </div>
        <div style={{position: 'absolute', top: 300, left: 10, right: 10, textAlign: 'center', fontFamily: FONT_TEXTE, fontSize: 24, color: OUT}}>
          Sans risque ! Gagnez gros !
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 30,
            right: 30,
            background: '#06D6A0',
            border: `5px solid ${OUT}`,
            borderRadius: 30,
            textAlign: 'center',
            fontFamily: FONT_TITRE,
            fontSize: 26,
            padding: '8px 0 2px',
            color: OUT,
            transform: `scale(${pulse})`,
          }}
        >
          J'EN PROFITE
        </div>
      </Telephone>
    </div>
  );
};

const formatSigne = (n: number, devise: string) => `${n < 0 ? '-' : n > 0 ? '+' : ''}${formatFr(Math.abs(n))} ${devise}`;

/** Appli bancaire : le solde chute, la courbe plonge. */
const SoldeTelephone: React.FC<{depart: number; arrivee: number; devise?: string}> = ({depart, arrivee, devise = '€'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = usePop();
  const premier = usePremiereImage();
  const t0 = premier ? 0 : 6;
  const t = interpolate(frame, [t0, t0 + fps * 2.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const eased = t * t * (3 - 2 * t);
  const v = depart + (arrivee - depart) * eased;
  const negatif = v < 0;
  const shake = t >= 1 ? Math.sin(frame * 2) * Math.max(0, 6 - (frame - t0 - fps * 2.2) * 0.4) : 0;
  const pts = Array.from({length: 12}).map((_, i) => {
    const x = (i / 11) * 230;
    const local = Math.min(1, eased * 1.05);
    const y = 30 + (i / 11) * 120 * local + Math.sin(i * 1.7) * 8;
    return `${x},${y}`;
  });
  return (
    <div style={{transform: `scale(${pop * 0.84}) rotate(-4deg) translateX(${shake}px)`}}>
      <Telephone w={310} h={430}>
        <div style={{position: 'absolute', inset: 0, background: '#F8F9FA'}} />
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 70, background: '#1D3557', color: 'white', fontFamily: FONT_TITRE, fontSize: 28, padding: '24px 0 0 20px', boxSizing: 'border-box'}}>
          Mon compte
        </div>
        <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_TEXTE, fontSize: 26, color: '#6C757D'}}>Solde</div>
        <div
          style={{
            position: 'absolute',
            top: 122,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT_TITRE,
            fontSize: 70,
            color: negatif ? '#E63946' : OUT,
          }}
        >
          {formatSigne(Math.round(v), devise)}
        </div>
        <svg width={250} height={170} viewBox="-10 0 250 170" style={{position: 'absolute', left: 16, top: 210}}>
          <polyline points={pts.join(' ')} fill="none" stroke="#E63946" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 228 150 l -26 -2 l 16 -22 z" fill="#E63946" opacity={eased > 0.2 ? 1 : 0} />
        </svg>
      </Telephone>
    </div>
  );
};

/** Petites icônes du schéma. */
const IconeSchema: React.FC<{nom: string}> = ({nom}) => {
  if (nom === 'vendeuse') {
    return (
      <svg width={170} height={170} viewBox="0 0 170 170">
        <circle cx={85} cy={85} r={78} fill="#FFE5D9" stroke={OUT} strokeWidth={8} />
        <circle cx={85} cy={34} r={18} fill="#4A2C1D" stroke={OUT} strokeWidth={5} />
        <path d="M 35 160 Q 40 112 85 110 Q 130 112 135 160 Z" fill="#FF7F6B" stroke={OUT} strokeWidth={6} />
        <circle cx={85} cy={74} r={34} fill="#C68B59" stroke={OUT} strokeWidth={6} />
        <path d="M 52 66 Q 54 38 85 38 Q 116 38 118 66 Q 100 52 85 52 Q 70 52 52 66 Z" fill="#4A2C1D" />
        <circle cx={72} cy={74} r={11} fill="none" stroke="#D4A017" strokeWidth={5} />
        <circle cx={98} cy={74} r={11} fill="none" stroke="#D4A017" strokeWidth={5} />
      </svg>
    );
  }
  if (nom === 'fournisseur') {
    return (
      <svg width={170} height={170} viewBox="0 0 170 170">
        <circle cx={85} cy={85} r={78} fill="#E9ECEF" stroke={OUT} strokeWidth={8} />
        <path d="M 30 130 V 80 L 60 62 V 80 L 90 62 V 80 L 120 62 V 130 Z" fill="#ADB5BD" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <rect x={124} y={40} width={18} height={90} fill="#6C757D" stroke={OUT} strokeWidth={6} />
        <rect x={60} y={96} width={34} height={34} fill="#D4A373" stroke={OUT} strokeWidth={5} />
        <path d="M 60 112 H 94" stroke={OUT} strokeWidth={4} />
      </svg>
    );
  }
  // client : maison qui reçoit le colis
  return (
    <svg width={170} height={170} viewBox="0 0 170 170">
      <circle cx={85} cy={85} r={78} fill="#D8F3DC" stroke={OUT} strokeWidth={8} />
      <path d="M 30 82 L 85 38 L 140 82" fill="#E63946" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      <rect x={42} y={80} width={86} height={56} fill="white" stroke={OUT} strokeWidth={6} />
      <rect x={74} y={100} width={22} height={36} fill="#2EC4B6" stroke={OUT} strokeWidth={5} />
    </svg>
  );
};

/** Schéma : icônes reliées par des flèches, qui apparaissent l'une après l'autre ; un colis circule. */
const Schema: React.FC<{etapes: {icone: string; label: string}[]}> = ({etapes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8}}>
      {etapes.map((e, i) => {
        const pop = spring({frame: frame - 4 - i * 14, fps, config: {damping: 12, stiffness: 200}});
        const fleche = spring({frame: frame - 12 - i * 14, fps, config: {damping: 14}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center'}}>
            <div style={{transform: `scale(${pop * 1.3})`, textAlign: 'center', width: 230, margin: '0 10px'}}>
              <IconeSchema nom={e.icone} />
              <div style={{fontFamily: FONT_TITRE, fontSize: 46, color: 'white', WebkitTextStroke: '9px black', paintOrder: 'stroke fill', marginTop: 4}}>
                {e.label}
              </div>
            </div>
            {i < etapes.length - 1 ? (
              <svg width={80} height={60} viewBox="0 0 80 60" style={{marginTop: -70, marginLeft: 20, marginRight: 20, transform: `scaleX(${fleche})`, transformOrigin: 'left center'}}>
                <path d="M 4 30 H 56" stroke={OUT} strokeWidth={14} strokeLinecap="round" />
                <path d="M 4 30 H 56" stroke="#FFD60A" strokeWidth={7} strokeLinecap="round" />
                <path d="M 50 12 L 76 30 L 50 48 Z" fill="#FFD60A" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/** Calcul écrit terme par terme ; le résultat (après "=") claque en jaune. */
const Calcul: React.FC<{expression: string; mention?: string}> = ({expression, mention}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // termes : nombres avec unité, et opérateurs (−, +, =, ×)
  const tokens = expression.split(/\s+(?=[−+=×÷≈-]\s)|(?<=\s[−+=×÷≈-])\s+/);
  const egal = tokens.findIndex((t) => t === '=' || t === '≈');
  return (
    <Card rotate={-2}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 18, maxWidth: 900, paddingTop: 16}}>
        {tokens.map((tok, i) => {
          const pop = spring({frame: frame - 6 - i * 7, fps, config: {damping: 11, stiffness: 240}});
          const op = /^[−+=×÷≈-]$/.test(tok);
          const resultat = egal >= 0 && i > egal;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                transform: `scale(${pop})`,
                fontFamily: FONT_TITRE,
                fontSize: op ? 90 : 110,
                lineHeight: 1.1,
                color: op ? '#6C757D' : resultat ? '#2D6A4F' : OUT,
                background: resultat ? '#FFD60A' : 'transparent',
                borderRadius: 18,
                padding: resultat ? '8px 18px 0' : 0,
                border: resultat ? `6px solid ${OUT}` : 'none',
              }}
            >
              {tok}
            </span>
          );
        })}
      </div>
      {mention ? (
        <div style={{fontFamily: FONT_TEXTE, fontSize: 34, color: '#6C757D', marginTop: 18, borderTop: '4px dashed #CED4DA', paddingTop: 12}}>
          {mention}
        </div>
      ) : null}
    </Card>
  );
};

/** Calendrier : les jours défilent (J+1 → J+n), le colis attend. */
const Calendrier: React.FC<{jours: number}> = ({jours}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = usePop();
  const fin = Math.max(fps, durationInFrames - fps * 0.6);
  const j = Math.max(1, Math.round(interpolate(frame, [6, fin], [1, jours], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const flip = (frame % 6) / 6;
  const colisX = Math.sin(frame / 5) * 6;
  return (
    <div style={{transform: `scale(${pop})`, display: 'flex', alignItems: 'center', gap: 40}}>
      <div style={{position: 'relative', width: 300, height: 320}}>
        <div style={{position: 'absolute', inset: 0, background: 'white', border: `10px solid ${OUT}`, borderRadius: 30, boxShadow: '0 18px 0 rgba(0,0,0,0.3)', overflow: 'hidden'}}>
          <div style={{height: 90, background: '#E63946', borderBottom: `8px solid ${OUT}`, color: 'white', fontFamily: FONT_TITRE, fontSize: 46, textAlign: 'center', paddingTop: 26, boxSizing: 'border-box'}}>
            ATTENTE
          </div>
          <div style={{fontFamily: FONT_TITRE, fontSize: 130, color: OUT, textAlign: 'center', marginTop: 28}}>J+{j}</div>
        </div>
        {/* page qui s'envole */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            top: 98,
            height: 200,
            background: '#F1F3F5',
            borderRadius: 12,
            transformOrigin: 'top center',
            transform: `rotateX(${flip * 90}deg) translateY(${-flip * 30}px)`,
            opacity: j < jours ? 1 - flip : 0,
          }}
        />
        {[60, 220].map((x) => (
          <div key={x} style={{position: 'absolute', top: -18, left: x, width: 20, height: 46, borderRadius: 10, background: '#ADB5BD', border: `6px solid ${OUT}`}} />
        ))}
      </div>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{transform: `translateX(${colisX}px)`}}>
        <path d="M 30 80 L 110 50 L 190 80 L 110 110 Z" fill="#E9C46A" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 30 80 V 170 L 110 200 V 110 Z" fill="#D4A373" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 190 80 V 170 L 110 200 V 110 Z" fill="#BC8A5F" stroke={OUT} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 70 65 L 150 95 V 125" fill="none" stroke="#F1FAEE" strokeWidth={10} />
        {[0, 1, 2].map((k) => (
          <text key={k} x={170 + k * 16} y={40 - k * 10} fontFamily={FONT_TITRE} fontSize={34 + k * 6} fill="#FFD60A" stroke={OUT} strokeWidth={4} paintOrder="stroke" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 8 + k))}>
            z
          </text>
        ))}
      </svg>
    </div>
  );
};

const Etoiles: React.FC<{note: number}> = ({note}) => (
  <svg width={150} height={30} viewBox="0 0 150 30">
    {[0, 1, 2, 3, 4].map((k) => (
      <path
        key={k}
        d="M 15 2 L 19 11 L 29 12 L 21 18 L 24 28 L 15 22 L 6 28 L 9 18 L 1 12 L 11 11 Z"
        transform={`translate(${k * 30} 0)`}
        fill={k < note ? '#FFB703' : '#DEE2E6'}
        stroke={OUT}
        strokeWidth={2}
      />
    ))}
  </svg>
);

/** Notifications qui tombent et s'empilent. */
const Notifications: React.FC<{items: {type: string; titre: string; texte: string; note?: number}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * 0.55);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 900}}>
      {items.map((it, i) => {
        const p = spring({frame: frame - 4 - i * ecart, fps, config: {damping: 13, stiffness: 220}});
        const avis = it.type === 'avis';
        return (
          <div
            key={i}
            style={{
              transform: `translateY(${(1 - p) * -120}px) scale(${0.8 + p * 0.2}) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
              opacity: Math.min(1, p * 1.5),
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              background: 'white',
              border: `7px solid ${OUT}`,
              borderRadius: 26,
              padding: '12px 22px',
              boxShadow: '0 10px 0 rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: 18,
                border: `5px solid ${OUT}`,
                background: avis ? '#FFD60A' : '#E63946',
                color: avis ? OUT : 'white',
                fontFamily: FONT_TITRE,
                fontSize: 44,
                textAlign: 'center',
                lineHeight: '66px',
              }}
            >
              {avis ? '!' : '€'}
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <span style={{fontFamily: FONT_TITRE, fontSize: 38, color: avis ? OUT : '#E63946', paddingTop: 6}}>{it.titre}</span>
                {avis ? <Etoiles note={it.note ?? 1} /> : null}
              </div>
              <div style={{fontFamily: FONT_TEXTE, fontSize: 36, color: '#495057', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{it.texte}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Liste à puces cochées une à une. */
const Liste: React.FC<{items: string[]; deja?: number; titre?: string}> = ({items, deja = 0, titre}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * 0.6);
  return (
    <Card rotate={-2}>
      {titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 48, color: '#6C757D', paddingTop: 10, textAlign: 'left'}}>{titre}</div> : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', padding: '10px 0'}}>
        {items.map((it, i) => {
          // les `deja` premiers items sont déjà affichés et cochés (suite d'une checklist)
          const k = i - deja;
          const p = i < deja ? 1 : spring({frame: frame - 6 - k * ecart, fps, config: {damping: 12, stiffness: 220}});
          const coche = i < deja ? 1 : spring({frame: frame - 14 - k * ecart, fps, config: {damping: 10, stiffness: 260}});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${(1 - p) * -80}px)`, opacity: Math.min(1, p * 1.4)}}>
              <svg width={78} height={78} viewBox="0 0 78 78">
                <rect x={5} y={5} width={68} height={68} rx={16} fill={coche > 0.5 ? '#06D6A0' : 'white'} stroke={OUT} strokeWidth={8} />
                <path d="M 20 40 L 34 54 L 60 24" fill="none" stroke={OUT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={70} strokeDashoffset={70 * (1 - Math.min(1, coche))} />
              </svg>
              <span style={{fontFamily: FONT_TITRE, fontSize: it.length > 24 ? 52 : 70, color: OUT, paddingTop: 12, maxWidth: it.length > 24 ? 700 : undefined, lineHeight: it.length > 24 ? 1.1 : undefined, textAlign: 'left'}}>{it}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** Silhouette d'un vélo de livraison (générique) avec un point d'interrogation. */
const VeloLivraison: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const rot = frame * 8;
  const x = Math.sin(frame / 14) * 30;
  return (
    <div style={{transform: `scale(${pop}) translateX(${x}px)`}}>
      <svg width={560} height={400} viewBox="0 0 560 400">
        <g fill="none" stroke={OUT} strokeLinecap="round" strokeLinejoin="round">
          {[130, 430].map((cx) => (
            <g key={cx} transform={`rotate(${rot} ${cx} 300)`}>
              <circle cx={cx} cy={300} r={78} strokeWidth={18} />
              {[0, 45, 90, 135].map((a) => (
                <path key={a} d={`M ${cx - 70} 300 H ${cx + 70}`} strokeWidth={5} transform={`rotate(${a} ${cx} 300)`} />
              ))}
            </g>
          ))}
          <path d="M 130 300 L 230 180 L 380 180 L 430 300 M 230 180 L 280 300 L 380 180 M 280 300 L 130 300" strokeWidth={16} />
          <path d="M 215 150 H 260 M 380 180 L 360 120 H 400" strokeWidth={16} />
        </g>
        {/* silhouette du livreur */}
        <g fill={OUT}>
          <circle cx={300} cy={50} r={30} />
          <path d="M 270 80 Q 250 130 240 150 L 300 170 L 360 130 L 330 85 Z" />
          <path d="M 270 150 L 300 230 L 284 300" stroke={OUT} strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
        {/* sac de livraison isotherme (générique) */}
        <rect x={150} y={40} width={110} height={110} rx={12} fill="#06D6A0" stroke={OUT} strokeWidth={10} transform="rotate(-8 205 95)" />
        <text x={205} y={118} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={80} fill="#FFD60A" stroke={OUT} strokeWidth={6} paintOrder="stroke" transform="rotate(-8 205 95)">
          ?
        </text>
      </svg>
    </div>
  );
};

const Icone: React.FC<{nom: string}> = ({nom}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const bounce = Math.abs(Math.sin(frame / 6)) * -30;
  if (nom === 'billets_fondent') return <BilletsFondent />;
  if (nom === 'velo_livraison') return <VeloLivraison />;
  if (nom === 'question') {
    return (
      <div style={{transform: `scale(${pop}) translateY(${bounce}px)`}}>
        <svg width={460} height={420} viewBox="0 0 460 420">
          <path d="M 40 40 h 380 a 30 30 0 0 1 30 30 v 220 a 30 30 0 0 1 -30 30 h -200 l -80 80 v -80 h -100 a 30 30 0 0 1 -30 -30 v -220 a 30 30 0 0 1 30 -30 z"
            fill="white" stroke={OUT} strokeWidth={12} strokeLinejoin="round" />
          <text x={230} y={275} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={240} fill="#FFD60A" stroke={OUT} strokeWidth={10} paintOrder="stroke">
            ?
          </text>
        </svg>
      </div>
    );
  }
  // icône générique : billet
  return (
    <div style={{transform: `scale(${pop}) translateY(${bounce}px)`}}>
      <svg width={420} height={240} viewBox="0 0 420 240">
        <rect x={10} y={10} width={400} height={220} rx={24} fill="#95D5B2" stroke={OUT} strokeWidth={12} />
        <circle cx={210} cy={120} r={60} fill="#52B788" stroke={OUT} strokeWidth={8} />
        <text x={210} y={150} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={90} fill="white">€</text>
      </svg>
    </div>
  );
};

/** Mention / source en bas de carte (petit texte gris, séparateur pointillé). */
const Mention: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: FONT_TEXTE, fontSize: 34, color: '#6C757D', marginTop: 18, borderTop: '4px dashed #CED4DA', paddingTop: 12}}>
    {children}
  </div>
);

/** Carte « avant → après » : l'ancien chiffre barré, une flèche, le nouveau qui claque. */
const CarteEvolution: React.FC<{avant: string; apres: string; legende?: string; mention?: string; source?: string}> = ({
  avant,
  apres,
  legende,
  mention,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const premier = usePremiereImage();
  const d = premier ? 0 : 8;
  const barre = interpolate(frame, [d + 4, d + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop = premier ? 1 : spring({frame: frame - d - 10, fps, config: {damping: 9, stiffness: 240}});
  const wobble = Math.sin(frame / 5) * 2;
  return (
    <Card rotate={2}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, paddingTop: 16}}>
        <div style={{position: 'relative', fontFamily: FONT_TITRE, fontSize: avant.length > 7 ? 96 : 116, color: '#6C757D', lineHeight: 1, whiteSpace: 'nowrap'}}>
          {avant}
          <div style={{position: 'absolute', left: -8, top: '42%', height: 14, width: `${barre * 105}%`, background: '#E63946', borderRadius: 7, transform: 'rotate(-8deg)'}} />
        </div>
        <svg width={110} height={70} viewBox="0 0 110 70">
          <path d="M 6 35 H 80 M 60 10 L 96 35 L 60 60" fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{fontFamily: FONT_TITRE, fontSize: 150, color: '#2D6A4F', lineHeight: 1, whiteSpace: 'nowrap', transform: `scale(${pop}) rotate(${wobble}deg)`}}>
          {apres}
        </div>
      </div>
      {legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 56, color: OUT, marginTop: 8}}>{legende}</div> : null}
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

/** Téléphone qui vibre, notification générique qui descend. Aucun logo. */
const NotificationTelephone: React.FC<{titre: string; texte?: string}> = ({titre, texte}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = usePop();
  const notif = spring({frame: frame - 12, fps, config: {damping: 12, stiffness: 200}});
  const vibre = frame > 12 && frame < 40 ? Math.sin(frame * 2.4) * 5 : 0;
  return (
    <div style={{transform: `scale(${pop}) rotate(${vibre}deg)`, position: 'relative'}}>
      <Telephone w={300} h={420}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#8ECAE6, #219EBC)'}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 70, color: 'white', textAlign: 'center', marginTop: 64, opacity: 0.9}}>12:04</div>
        </div>
      </Telephone>
      <div
        style={{
          position: 'absolute',
          left: -150,
          right: -150,
          top: 120,
          transform: `translateY(${(1 - notif) * -140}px)`,
          opacity: Math.min(1, notif * 1.5),
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'white',
          border: `8px solid ${OUT}`,
          borderRadius: 28,
          padding: '16px 24px',
          boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div style={{width: 76, height: 76, flexShrink: 0, borderRadius: 20, border: `6px solid ${OUT}`, background: '#06D6A0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={46} height={46} viewBox="0 0 46 46">
            <path d="M 23 4 Q 36 4 36 20 V 30 L 41 36 H 5 L 10 30 V 20 Q 10 4 23 4 Z" fill="white" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={23} cy={40} r={5} fill={OUT} />
          </svg>
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 52, color: OUT, paddingTop: 8, lineHeight: 1}}>{titre}</div>
          {texte ? <div style={{fontFamily: FONT_TEXTE, fontSize: 36, color: '#495057'}}>{texte}</div> : null}
        </div>
      </div>
    </div>
  );
};

/** Barre d'une heure découpée en segments (ex. 40 min payées / 20 min d'attente). */
const BarreTemps: React.FC<{titre?: string; segments: {minutes: number; label: string; couleur?: string}[]; mention?: string}> = ({
  titre,
  segments,
  mention,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = segments.reduce((a, b) => a + b.minutes, 0) || 60;
  const L = 820;
  let x0 = 0;
  return (
    <Card rotate={-2}>
      {titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 58, color: OUT, paddingTop: 10}}>{titre}</div> : null}
      <div style={{position: 'relative', width: L, height: 110, margin: '18px auto 0', border: `8px solid ${OUT}`, borderRadius: 26, overflow: 'hidden', background: '#F1F3F5'}}>
        {segments.map((sg, i) => {
          const w = (sg.minutes / total) * L;
          const grow = interpolate(frame, [6 + i * 16, 22 + i * 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const left = x0;
          x0 += w;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left,
                top: 0,
                bottom: 0,
                width: w * grow,
                background: sg.couleur ?? '#06D6A0',
                borderRight: i < segments.length - 1 ? `6px solid ${OUT}` : 'none',
                backgroundImage: i > 0 ? 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 16px, transparent 16px 32px)' : undefined,
              }}
            />
          );
        })}
      </div>
      <div style={{display: 'flex', width: L, margin: '10px auto 0'}}>
        {segments.map((sg, i) => {
          const pop = spring({frame: frame - 14 - i * 16, fps, config: {damping: 11, stiffness: 240}});
          return (
            <div key={i} style={{width: (sg.minutes / total) * L, textAlign: 'center', transform: `scale(${pop})`}}>
              <div style={{fontFamily: FONT_TITRE, fontSize: 60, color: sg.couleur ?? OUT, WebkitTextStroke: `2px ${OUT}`, lineHeight: 1.1, paddingTop: 6}}>{sg.minutes} min</div>
              <div style={{fontFamily: FONT_TEXTE, fontSize: 40, color: OUT}}>{sg.label}</div>
            </div>
          );
        })}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
    </Card>
  );
};

/** Calcul en chaîne : chaque étape apparaît après une flèche, la dernière en jaune. */
const Chaine: React.FC<{etapes: string[]; mention?: string; source?: string; barrer?: boolean}> = ({etapes, mention, source, barrer = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * 0.45);
  return (
    <Card rotate={-2}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: 10, paddingTop: 14}}>
        {etapes.map((e, i) => {
          const pop = spring({frame: frame - 6 - i * ecart, fps, config: {damping: 11, stiffness: 240}});
          const dernier = i === etapes.length - 1;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
              {i > 0 ? (
                <svg width={46} height={40} viewBox="0 0 46 40" style={{transform: `scale(${pop})`}}>
                  <path d="M 4 20 H 32 M 22 6 L 40 20 L 22 34" fill="none" stroke="#6C757D" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              <span
                style={{
                  display: 'inline-block',
                  transform: `scale(${pop})`,
                  fontFamily: FONT_TITRE,
                  fontSize: dernier ? 104 : 66,
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  color: dernier ? '#2D6A4F' : i === 0 ? '#E63946' : OUT,
                  background: dernier ? '#FFD60A' : 'transparent',
                  border: dernier ? `6px solid ${OUT}` : 'none',
                  borderRadius: 18,
                  padding: dernier ? '8px 16px 0' : 0,
                  textDecoration: i === 0 && barrer ? 'line-through' : 'none',
                }}
              >
                {e}
              </span>
            </div>
          );
        })}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

/** Calendrier d'un mois : une semaine se fait barrer d'une croix rouge. */
const CalendrierMois: React.FC<{semaine_barree: number; legende?: string}> = ({semaine_barree, legende}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = usePop();
  const jours = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const C = 92;
  const s = Math.max(0, Math.min(3, semaine_barree - 1));
  const trait = interpolate(frame, [14, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tampon = spring({frame: frame - 28, fps, config: {damping: 9, stiffness: 260}});
  return (
    <div style={{transform: `scale(${pop}) rotate(-2deg)`, position: 'relative'}}>
      <div style={{background: 'white', border: `10px solid ${OUT}`, borderRadius: 30, boxShadow: '0 18px 0 rgba(0,0,0,0.3)', overflow: 'hidden', width: C * 7 + 40}}>
        <div style={{height: 70, background: '#E63946', borderBottom: `8px solid ${OUT}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 20px'}}>
          {jours.map((j, i) => (
            <span key={i} style={{fontFamily: FONT_TITRE, fontSize: 40, color: 'white', paddingTop: 8, width: C, textAlign: 'center'}}>{j}</span>
          ))}
        </div>
        <div style={{padding: '10px 20px 14px', position: 'relative'}}>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} style={{display: 'flex'}}>
              {jours.map((_, k) => (
                <div key={k} style={{width: C, height: 64, fontFamily: FONT_TEXTE, fontSize: 36, color: r === s ? '#E63946' : '#495057', textAlign: 'center', lineHeight: '64px', background: r === s ? '#FFE3E3' : 'transparent'}}>
                  {r * 7 + k + 1}
                </div>
              ))}
            </div>
          ))}
          {/* croix sur la semaine */}
          <svg width={C * 7} height={64} viewBox={`0 0 ${C * 7} 64`} style={{position: 'absolute', left: 20, top: 10 + s * 64}}>
            <path d={`M 10 32 H ${10 + (C * 7 - 20) * trait}`} stroke="#E63946" strokeWidth={14} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {legende ? (
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -30,
            transform: `scale(${tampon}) rotate(10deg)`,
            background: '#FFD60A',
            border: `8px solid ${OUT}`,
            borderRadius: 22,
            padding: '16px 24px 4px',
            fontFamily: FONT_TITRE,
            fontSize: 60,
            color: '#E63946',
            boxShadow: '0 10px 0 rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          {legende}
        </div>
      ) : null}
    </div>
  );
};

/** Appel à l'action : cœur, bulle de commentaire, bouton « + », animés l'un après l'autre (génériques, sans logo). */
const IconesCta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * 0.7);
  const icones = [
    {fond: '#FF4D6D', svg: <path d="M 60 100 C 20 72 10 50 22 34 C 34 18 54 22 60 38 C 66 22 86 18 98 34 C 110 50 100 72 60 100 Z" fill="white" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />},
    {
      fond: '#4361EE',
      svg: (
        <g>
          <path d="M 20 30 Q 20 18 32 18 H 88 Q 100 18 100 30 V 70 Q 100 82 88 82 H 52 L 32 100 V 82 Q 20 82 20 70 Z" fill="white" stroke={OUT} strokeWidth={7} strokeLinejoin="round" />
          {[42, 60, 78].map((x) => (
            <circle key={x} cx={x} cy={50} r={7} fill={OUT} />
          ))}
        </g>
      ),
    },
    {fond: '#06D6A0', svg: <path d="M 60 24 V 96 M 24 60 H 96" stroke="white" strokeWidth={22} strokeLinecap="round" />},
  ];
  return (
    <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
      {icones.map((ic, i) => {
        const debut = 6 + i * ecart;
        const pop = spring({frame: frame - debut, fps, config: {damping: 8, stiffness: 220}});
        const actif = frame >= debut && frame < debut + ecart;
        const pulse = actif ? 1 + Math.sin(((frame - debut) / ecart) * Math.PI) * 0.18 : 1;
        const bounce = frame >= debut ? Math.abs(Math.sin((frame - debut) / 9)) * -10 : 0;
        return (
          <div
            key={i}
            style={{
              width: 220,
              height: 220,
              borderRadius: i === 2 ? 110 : 56,
              background: ic.fond,
              border: `10px solid ${OUT}`,
              boxShadow: '0 16px 0 rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateY(${bounce}px) scale(${pop * pulse})`,
            }}
          >
            <svg width={150} height={150} viewBox="0 0 120 120">
              {ic.svg}
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/** Icône d'appli générique : cintre blanc sur fond neutre (aucune marque). */
const AppliCintre: React.FC<{taille?: number}> = ({taille = 120}) => (
  <svg width={taille} height={taille} viewBox="0 0 120 120">
    <rect x={6} y={6} width={108} height={108} rx={28} fill="#5E6B7A" stroke={OUT} strokeWidth={7} />
    <path d="M 60 34 q 0 -12 10 -12 q 8 0 8 8 q 0 7 -8 10 L 60 44 L 24 76 Q 20 84 28 84 H 92 Q 100 84 96 76 L 60 44" fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Enveloppe qui s'envole vers un bâtiment d'administration générique (colonnes, fronton, sans drapeau ni logo). */
const EnveloppeBatiment: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [10, 10 + fps * 1.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = 1 - Math.pow(1 - p, 2);
  const x = 40 + e * 420;
  const y = 70 - Math.sin(e * Math.PI) * 50 + e * 10;
  const arrive = p >= 1;
  const tremble = arrive ? Math.sin(frame * 1.4) * Math.max(0, 1 - (frame - 10 - fps * 1.4) / 10) * 3 : 0;
  return (
    <svg width={760} height={170} viewBox="0 0 760 170" style={{overflow: 'visible'}}>
      {/* trajectoire */}
      <path d="M 80 110 Q 300 20 560 110" fill="none" stroke="#CED4DA" strokeWidth={5} strokeDasharray="12 12" />
      {/* bâtiment */}
      <g transform={`translate(${560 + tremble} 10)`}>
        <path d="M 0 52 L 90 8 L 180 52 Z" fill="#E9ECEF" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <rect x={6} y={52} width={168} height={14} fill="#DEE2E6" stroke={OUT} strokeWidth={5} />
        {[22, 62, 102, 142].map((cx) => (
          <rect key={cx} x={cx} y={66} width={16} height={70} fill="white" stroke={OUT} strokeWidth={4} />
        ))}
        <rect x={0} y={136} width={180} height={18} fill="#DEE2E6" stroke={OUT} strokeWidth={5} />
        <circle cx={90} cy={34} r={8} fill="#ADB5BD" stroke={OUT} strokeWidth={3} />
      </g>
      {/* enveloppe */}
      {!arrive ? (
        <g transform={`translate(${x} ${y}) rotate(${-10 + e * 20}) scale(${1 - e * 0.35})`}>
          <rect x={-50} y={-32} width={100} height={64} rx={6} fill="white" stroke={OUT} strokeWidth={6} />
          <path d="M -50 -30 L 0 8 L 50 -30" fill="none" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
          <rect x={20} y={6} width={20} height={16} fill="#F4A261" stroke={OUT} strokeWidth={3} />
        </g>
      ) : null}
      {arrive ? (
        <text x={650} y={4} textAnchor="middle" fontFamily={FONT_TITRE} fontSize={36} fill="#2D6A4F">reçu</text>
      ) : null}
    </svg>
  );
};

/** Carte de texte : surtitre, titre, pastilles qui apparaissent une à une, petite précision, illustration. */
const CarteTexte: React.FC<{
  titre: string;
  surtitre?: string;
  indices?: string[];
  petit?: string;
  illustration?: 'enveloppe_batiment' | 'appli_cintre';
  mention?: string;
  source?: string;
}> = ({titre, surtitre, indices, petit, illustration, mention, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const premier = usePremiereImage();
  const ecart = Math.round(fps * 0.5);
  const n = titre.length;
  const taille = n <= 22 ? 84 : n <= 34 ? 72 : n <= 48 ? 64 : 58;
  return (
    <Card rotate={-1.5}>
      <div style={{maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {illustration === 'appli_cintre' ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 18, paddingTop: 4}}>
            <AppliCintre taille={84} />
            {surtitre ? <div style={{fontFamily: FONT_TITRE, fontSize: 52, color: '#6C757D', paddingTop: 10}}>{surtitre}</div> : null}
          </div>
        ) : surtitre ? (
          <div style={{fontFamily: FONT_TITRE, fontSize: 44, color: '#6C757D', paddingTop: 10}}>{surtitre}</div>
        ) : null}
        <div style={{fontFamily: FONT_TITRE, fontSize: taille, color: OUT, lineHeight: 1.12, paddingTop: 14}}>{titre}</div>
        {indices?.length ? (
          <div style={{display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center'}}>
            {indices.map((it, i) => {
              const pop = premier ? 1 : spring({frame: frame - 10 - i * ecart, fps, config: {damping: 10, stiffness: 240}});
              return (
                <div
                  key={i}
                  style={{
                    transform: `scale(${pop})`,
                    fontFamily: FONT_TITRE,
                    fontSize: 44,
                    color: OUT,
                    background: '#FFD60A',
                    border: `5px solid ${OUT}`,
                    borderRadius: 20,
                    padding: '10px 18px 2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {i + 1}. {it}
                </div>
              );
            })}
          </div>
        ) : null}
        {petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 38, color: '#6C757D', marginTop: 10, fontStyle: 'italic'}}>{petit}</div> : null}
        {illustration === 'enveloppe_batiment' ? (
          <div style={{marginTop: 18}}>
            <EnveloppeBatiment />
          </div>
        ) : null}
        {mention ? <Mention>{mention}</Mention> : null}
        {source ? <Mention>{source}</Mention> : null}
      </div>
    </Card>
  );
};

/** Compteur qui monte jusqu'à `cible` ; un tampon claque quand il dépasse `seuil`. */
const CompteurTampon: React.FC<{cible: number; seuil: number; tampon: string; unite?: string; legende?: string; mention?: string}> = ({
  cible,
  seuil,
  tampon,
  unite,
  legende,
  mention,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d0 = 6;
  const d1 = d0 + fps * 2.2;
  const t = interpolate(frame, [d0, d1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = Math.round(cible * (1 - Math.pow(1 - t, 2)));
  // instant où le compteur passe le seuil
  const tSeuil = 1 - Math.sqrt(1 - seuil / cible);
  const fSeuil = d0 + tSeuil * (d1 - d0);
  const stamp = spring({frame: frame - fSeuil, fps, config: {damping: 9, stiffness: 260}});
  const depasse = frame >= fSeuil;
  return (
    <Card rotate={2}>
      <div style={{position: 'relative', paddingTop: 10}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 20}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 170, lineHeight: 1, color: depasse ? '#E63946' : '#2D6A4F'}}>{v}</div>
          {unite ? <div style={{fontFamily: FONT_TITRE, fontSize: 64, color: OUT}}>{unite}</div> : null}
        </div>
        {legende ? <div style={{fontFamily: FONT_TITRE, fontSize: 60, color: OUT, marginTop: 4}}>{legende}</div> : null}
        {depasse ? (
          <div
            style={{
              position: 'absolute',
              right: -60,
              top: -70,
              transform: `rotate(-14deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`,
              opacity: Math.min(1, stamp * 2),
              fontFamily: FONT_TITRE,
              fontSize: 58,
              color: '#E63946',
              border: '8px solid #E63946',
              borderRadius: 16,
              padding: '10px 18px 0',
              background: 'rgba(255,255,255,0.85)',
              whiteSpace: 'nowrap',
            }}
          >
            {tampon}
          </div>
        ) : null}
        {mention ? <Mention>{mention}</Mention> : null}
      </div>
    </Card>
  );
};

/** Calcul posé ligne par ligne : chaque ligne glisse à son tour, la dernière est surlignée. */
const CalculLignes: React.FC<{lignes: {label: string; valeur: string}[]; mention?: string; source?: string; ecart?: number}> = ({lignes, mention, source, ecart: ecartS = 1.1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * ecartS);
  const serre = lignes.length >= 5;
  return (
    <Card rotate={-1.5}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, minWidth: 760, paddingTop: 10}}>
        {lignes.map((l, i) => {
          const p = spring({frame: frame - 6 - i * ecart, fps, config: {damping: 12, stiffness: 220}});
          const dernier = i === lignes.length - 1;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 30,
                transform: `translateX(${(1 - p) * 120}px)`,
                opacity: Math.min(1, p * 1.5),
                borderTop: dernier ? `6px solid ${OUT}` : 'none',
                paddingTop: dernier ? 8 : 0,
              }}
            >
              <span style={{fontFamily: FONT_TITRE, fontSize: serre ? 44 : l.label.length > 16 ? 46 : 60, color: '#6C757D', paddingTop: 8, textAlign: 'left'}}>{l.label}</span>
              <span
                style={{
                  fontFamily: FONT_TITRE,
                  fontSize: serre ? (dernier ? 70 : 56) : dernier ? 84 : 72,
                  color: dernier ? '#E63946' : OUT,
                  background: dernier ? '#FFD60A' : 'transparent',
                  border: dernier ? `5px solid ${OUT}` : 'none',
                  borderRadius: 14,
                  padding: dernier ? '6px 14px 0' : 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {l.valeur}
              </span>
            </div>
          );
        })}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};


// ---------------------------------------------------------------------------
// Épisode 5 (chantier) : carte qui se retourne, jauge d'heures, calculette, ponction, barre qui rétrécit, plafond.

/** Instant de bascule (frame) : celui du mot prononcé si connu, sinon une fraction du plan. */
const useBascule = (bascule: number | undefined, fraction = 0.45) => {
  const {durationInFrames} = useVideoConfig();
  return bascule ?? Math.round(durationInFrames * fraction);
};

const CarteTransformation: React.FC<{avant: string; avant_legende?: string; apres: string; apres_legende?: string; mention?: string; bascule?: number}> = ({
  avant,
  avant_legende,
  apres,
  apres_legende,
  mention,
  bascule,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule);
  // retournement : la face avant s'écrase, la face arrière se déplie
  const p = interpolate(frame, [b - 4, b + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const face = p < 0.5;
  const sy = face ? 1 - p * 2 : p * 2 - 1;
  const bump = frame >= b + 6 ? spring({frame: frame - b - 6, fps, config: {damping: 8, stiffness: 260}}) : 0;
  const wobble = Math.sin(frame / 5) * 2;
  return (
    <Card rotate={2}>
      <div style={{transform: `scaleY(${Math.max(0.02, sy)})`, minWidth: 620}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: 170, lineHeight: 1.05, paddingTop: 20, color: face ? '#2D6A4F' : '#E63946', transform: `rotate(${wobble}deg) scale(${1 + (face ? 0 : (1 - bump) * 0.25)})`, whiteSpace: 'nowrap'}}>
          {face ? avant : apres}
        </div>
        <div style={{fontFamily: FONT_TITRE, fontSize: 64, color: OUT, marginTop: 4}}>{face ? avant_legende : apres_legende}</div>
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
    </Card>
  );
};

/** Petites icônes plates (devis papier, camionnette de trajet, chariot d'achats). */
export const IconeChantier: React.FC<{nom: string; taille?: number}> = ({nom, taille = 96}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {nom === 'devis' ? (
      <g>
        <rect x={18} y={6} width={64} height={86} rx={6} fill="white" stroke={OUT} strokeWidth={6} />
        <rect x={28} y={16} width={30} height={8} rx={3} fill="#2B2D42" />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M 28 ${36 + k * 11} H 72`} stroke="#ADB5BD" strokeWidth={5} strokeLinecap="round" />
        ))}
        <rect x={48} y={78} width={26} height={8} rx={2} fill="#FFD60A" stroke={OUT} strokeWidth={2} />
      </g>
    ) : nom === 'trajets' ? (
      <g>
        <path d="M 6 70 V 34 Q 6 28 12 28 H 62 Q 68 28 72 34 L 84 50 Q 94 52 94 60 V 70 Z" fill="#F8F9FA" stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 66 34 L 76 50 H 66 Z" fill="#8ECAE6" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={26} cy={72} r={11} fill="#212529" stroke={OUT} strokeWidth={4} />
        <circle cx={76} cy={72} r={11} fill="#212529" stroke={OUT} strokeWidth={4} />
        <path d="M 4 90 H 30 M 42 90 H 60 M 72 90 H 96" stroke="#ADB5BD" strokeWidth={5} strokeLinecap="round" />
      </g>
    ) : nom === 'achats' ? (
      <g>
        <path d="M 6 18 H 20 L 32 66 H 80 L 90 32 H 24" fill="none" stroke={OUT} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        <rect x={34} y={22} width={22} height={30} rx={3} fill="#F77F00" stroke={OUT} strokeWidth={4} />
        <circle cx={66} cy={36} r={12} fill="#8D99AE" stroke={OUT} strokeWidth={4} />
        <circle cx={66} cy={36} r={5} fill="#F8F9FA" />
        <circle cx={38} cy={82} r={8} fill={OUT} />
        <circle cx={74} cy={82} r={8} fill={OUT} />
      </g>
    ) : nom === 'testeur' ? (
      <g transform="rotate(-35 50 50)">
        <rect x={42} y={4} width={16} height={56} rx={7} fill="#E63946" stroke={OUT} strokeWidth={5} />
        <rect x={45} y={12} width={10} height={20} rx={4} fill="#FFD60A" opacity={0.85} />
        <path d="M 50 60 V 92" stroke={OUT} strokeWidth={9} strokeLinecap="round" />
        <path d="M 50 60 V 92" stroke="#CED4DA" strokeWidth={4} strokeLinecap="round" />
      </g>
    ) : null}
  </svg>
);

const JaugeHeures: React.FC<{total: number; facturees: number; icones?: {nom: string; label: string}[]; mention?: string; source?: string}> = ({
  total,
  facturees,
  icones = [],
  mention,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [10, 10 + fps * 1.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = 1 - Math.pow(1 - t, 3);
  const v = Math.round(total - (total - facturees) * e);
  const W0 = 780;
  const wFact = W0 * (v / total);
  return (
    <Card rotate={-1.5}>
      <div style={{width: W0, paddingTop: 12}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <span style={{fontFamily: FONT_TITRE, fontSize: 52, color: '#6C757D'}}>{formatFr(total)} h travaillées</span>
          <span style={{fontFamily: FONT_TITRE, fontSize: 40, color: '#6C757D'}}>→</span>
        </div>
        <div style={{position: 'relative', height: 86, marginTop: 10, borderRadius: 22, border: `7px solid ${OUT}`, overflow: 'hidden', background: 'repeating-linear-gradient(-45deg, #DEE2E6 0 18px, #ADB5BD 18px 30px)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: wFact, background: '#06D6A0', borderRight: `6px solid ${OUT}`}} />
          <div style={{position: 'absolute', left: 20, top: 16, fontFamily: FONT_TITRE, fontSize: 56, color: OUT}}>{formatFr(v)} h facturées</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 22, marginTop: 14, minHeight: 130}}>
          {icones.map((ic, i) => {
            const pop = spring({frame: frame - 10 - fps * 1.0 - i * 8, fps, config: {damping: 10, stiffness: 240}});
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${pop})`}}>
                <IconeChantier nom={ic.nom} taille={84} />
                <span style={{fontFamily: FONT_TITRE, fontSize: 34, color: '#E63946', paddingTop: 4}}>{ic.label}</span>
              </div>
            );
          })}
          {icones.length ? (
            <div style={{fontFamily: FONT_TITRE, fontSize: 36, color: '#6C757D', alignSelf: 'center', opacity: t >= 1 ? 1 : 0, maxWidth: 200, textAlign: 'left', lineHeight: 1.1}}>
              {formatFr(total - facturees)} h non facturées
            </div>
          ) : null}
        </div>
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

const Calculette: React.FC<{operation: string; resultat: string; legende?: string; mention?: string}> = ({operation, resultat, legende, mention}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = usePop();
  const nType = Math.floor(interpolate(frame, [8, 8 + fps * 1.4], [0, operation.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const fRes = 8 + fps * 1.6;
  const res = frame >= fRes;
  const bump = res ? spring({frame: frame - fRes, fps, config: {damping: 8, stiffness: 260}}) : 0;
  const touche = res ? 19 : nType < operation.length ? (nType * 7) % 15 : -1;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${pop}) rotate(-2deg)`}}>
      <svg width={300} height={410} viewBox="0 0 300 410">
        <rect x={8} y={8} width={284} height={394} rx={34} fill="#3A3F47" stroke={OUT} strokeWidth={10} />
        <rect x={30} y={30} width={240} height={96} rx={12} fill="#B7E4C7" stroke={OUT} strokeWidth={6} />
        <text x={258} y={70} textAnchor="end" fontFamily="Lilita One" fontSize={26} fill="#1B4332">{operation.slice(0, nType)}</text>
        {res ? (
          <text x={258} y={112} textAnchor="end" fontFamily="Luckiest Guy" fontSize={36} fill="#1B4332">{resultat}</text>
        ) : null}
        {Array.from({length: 20}).map((_, k) => {
          const c = k % 4;
          const r = Math.floor(k / 4);
          const actif = k === touche;
          return (
            <rect
              key={k}
              x={34 + c * 60}
              y={146 + r * 50 + (actif ? 4 : 0)}
              width={50}
              height={40}
              rx={10}
              fill={k === 19 ? '#F77F00' : c === 3 ? '#8D99AE' : '#F1F3F5'}
              stroke={OUT}
              strokeWidth={5}
              opacity={actif ? 0.7 : 1}
            />
          );
        })}
      </svg>
      <div style={{background: 'white', border: `10px solid ${OUT}`, borderRadius: 36, boxShadow: '0 18px 0 rgba(0,0,0,0.3)', padding: '26px 34px', textAlign: 'center', maxWidth: 560}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: 60, color: OUT, paddingTop: 10, whiteSpace: 'nowrap'}}>{operation.slice(0, nType) || ' '}</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontFamily: FONT_TITRE,
            fontSize: 92,
            color: '#2D6A4F',
            background: '#FFD60A',
            border: `6px solid ${OUT}`,
            borderRadius: 18,
            padding: '10px 18px 0',
            transform: `scale(${res ? 0.6 + bump * 0.4 : 0})`,
            whiteSpace: 'nowrap',
          }}
        >
          = {resultat}
        </div>
        {legende ? <div style={{fontFamily: FONT_TITRE, fontSize: 52, color: OUT, marginTop: 8, opacity: res ? 1 : 0}}>{legende}</div> : null}
        {mention ? <Mention>{mention}</Mention> : null}
      </div>
    </div>
  );
};

const BarrePonction: React.FC<{titre?: string; calcul: string; part: number; barre?: string; tranche?: string; source?: string; bascule?: number}> = ({
  titre,
  calcul,
  part,
  barre,
  tranche,
  source,
  bascule,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule, 0.5);
  const d = spring({frame: frame - b, fps, config: {damping: 11, stiffness: 160}});
  const W0 = 780;
  const wT = W0 * part;
  return (
    <Card rotate={-1.5}>
      <div style={{width: W0, paddingTop: 10}}>
        {titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 40, color: '#6C757D'}}>{titre}</div> : null}
        <div style={{fontFamily: FONT_TITRE, fontSize: 60, color: OUT, marginTop: 6, whiteSpace: 'nowrap'}}>{calcul}</div>
        <div style={{position: 'relative', height: 90, marginTop: 22}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 80, width: W0 - wT, background: '#06D6A0', border: `7px solid ${OUT}`, borderRadius: '22px 0 0 22px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT_TITRE, fontSize: 46, color: OUT, padding: '16px 0 0 18px', whiteSpace: 'nowrap'}}>{barre}</div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: W0 - wT,
              top: 0,
              height: 80,
              width: wT,
              background: '#E63946',
              border: `7px solid ${OUT}`,
              borderRadius: '0 22px 22px 0',
              boxSizing: 'border-box',
              transform: `translate(${d * 12}px, ${d * 34}px) rotate(${d * 6}deg)`,
              boxShadow: d > 0.1 ? '0 10px 0 rgba(0,0,0,0.25)' : 'none',
            }}
          />
        </div>
        <div style={{height: 90, display: 'flex', justifyContent: 'flex-end', paddingTop: 30}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 56, color: '#E63946', opacity: d, whiteSpace: 'nowrap'}}>{tranche}</div>
        </div>
      </div>
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

const BarreRetrecit: React.FC<{depart: number; arrivee: number; unite: string; legende_depart?: string; legende_arrivee?: string; mention?: string; bascule?: number}> = ({
  depart,
  arrivee,
  unite,
  legende_depart,
  legende_arrivee,
  mention,
  bascule,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule, 0.35);
  const t = interpolate(frame, [b, b + fps * 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = 1 - Math.pow(1 - t, 3);
  const v = depart + (arrivee - depart) * e;
  const W0 = 780;
  const w = W0 * (v / depart);
  const couleur = t < 0.5 ? '#06D6A0' : '#E63946';
  return (
    <Card rotate={2}>
      <div style={{width: W0, paddingTop: 10, textAlign: 'left'}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: 44, color: '#6C757D'}}>
          {formatFr(depart)} {unite} {legende_depart}
        </div>
        <div style={{position: 'relative', height: 110, marginTop: 10}}>
          <div style={{position: 'absolute', inset: 0, border: '6px dashed #ADB5BD', borderRadius: 24}} />
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w, background: couleur, border: `7px solid ${OUT}`, borderRadius: 24, boxSizing: 'border-box'}} />
          <div style={{position: 'absolute', left: 22, top: 22, fontFamily: FONT_TITRE, fontSize: 76, color: OUT, whiteSpace: 'nowrap'}}>
            {formatFr(v)} {unite}
          </div>
        </div>
        <div style={{fontFamily: FONT_TITRE, fontSize: 52, color: '#E63946', marginTop: 12, opacity: t >= 1 ? 1 : 0, whiteSpace: 'nowrap'}}>
          {formatFr(arrivee)} {unite} {legende_arrivee}
        </div>
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
    </Card>
  );
};

const JaugePlafond: React.FC<{titre: string; plafond: number; valeur: number; label_valeur?: string; petit?: string; source?: string}> = ({
  titre,
  plafond,
  valeur,
  label_valeur,
  petit,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [8, 8 + fps * 1.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = 1 - Math.pow(1 - t, 3);
  const W0 = 800;
  const xPlafond = W0 * 0.86;
  const echelle = xPlafond / plafond;
  const w = valeur * echelle * e;
  const clignote = t >= 1 && Math.floor(frame / 8) % 2 === 0;
  return (
    <Card rotate={-1.5}>
      <div style={{width: W0, paddingTop: 10}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: 54, color: OUT, lineHeight: 1.1}}>{titre}</div>
        <div style={{position: 'relative', height: 200, marginTop: 10}}>
          {/* étiquette Julien au-dessus du remplissage */}
          <div style={{position: 'absolute', left: Math.max(0, w - 180), top: 0, width: 200, textAlign: 'center', fontFamily: FONT_TITRE, fontSize: 38, color: '#2D6A4F', whiteSpace: 'nowrap'}}>
            {label_valeur ?? formatFr(valeur)}
            <div style={{fontSize: 30, lineHeight: 0.6}}>▼</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 70, border: `7px solid ${OUT}`, borderRadius: 20, overflow: 'hidden', background: '#F1F3F5', boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', left: xPlafond, right: 0, top: 0, bottom: 0, background: 'repeating-linear-gradient(-45deg, #E63946 0 14px, #FFB3B8 14px 26px)'}} />
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w, background: '#06D6A0'}} />
          </div>
          {/* repère du plafond */}
          <div style={{position: 'absolute', left: xPlafond - 5, top: 54, width: 10, height: 104, background: clignote ? '#E63946' : OUT, borderRadius: 5}} />
          <div style={{position: 'absolute', left: xPlafond - 110, top: 160, width: 220, textAlign: 'center', fontFamily: FONT_TITRE, fontSize: 40, color: '#E63946', whiteSpace: 'nowrap'}}>
            {formatFr(plafond)} €
          </div>
        </div>
        {petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 38, color: '#6C757D', fontStyle: 'italic', marginTop: 6}}>{petit}</div> : null}
      </div>
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Épisode 6 (fiche de paie) : face-à-face, hausse, fiche de paie, barre empilée.

/** Deux montants face à face ; la colonne droite claque quand la voix dit `au_mot`. */
const FaceAFace: React.FC<{
  gauche: {label: string; valeur: string; petit?: string};
  droite: {label: string; valeur: string; petit?: string};
  mention?: string;
  source?: string;
  bascule?: number;
  symbole?: string;
  positif?: boolean;
}> = ({gauche, droite, mention, source, bascule, symbole = '≠', positif = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule, 0.6);
  const pop = spring({frame: frame - b, fps, config: {damping: 9, stiffness: 240}});
  const wobble = Math.sin(frame / 6) * 1.5;
  const colonne = (c: {label: string; valeur: string; petit?: string}, fond: string, coul: string, scale: number, rot: number) => (
    <div style={{width: 380, background: fond, border: `7px solid ${OUT}`, borderRadius: 26, padding: '16px 10px 12px', transform: `scale(${scale}) rotate(${rot}deg)`}}>
      <div style={{fontFamily: FONT_TITRE, fontSize: 40, color: OUT, paddingTop: 6}}>{c.label}</div>
      <div style={{fontFamily: FONT_TITRE, fontSize: 74, color: coul, lineHeight: 1.05, paddingTop: 10, whiteSpace: 'nowrap'}}>{c.valeur}</div>
      {c.petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 28, color: '#495057', marginTop: 4}}>{c.petit}</div> : null}
    </div>
  );
  return (
    <Card rotate={-1.5}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, paddingTop: 4}}>
        {colonne(gauche, '#D8F3DC', '#2D6A4F', 1, wobble * 0.5)}
        <div style={{fontFamily: FONT_TITRE, fontSize: 70, color: positif ? '#2D6A4F' : '#E63946', paddingTop: 14, opacity: Math.min(1, pop * 2)}}>{symbole}</div>
        {positif ? colonne(droite, '#FFF3B0', '#2D6A4F', pop, -wobble * 0.5) : colonne(droite, '#FFE5E9', '#E63946', pop, -wobble * 0.5)}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

/** Un montant qui passe de `avant` à `apres`, pastille d'écart sur `au_mot`. */
const CarteHausse: React.FC<{surtitre?: string; avant: string; avant_legende?: string; apres: string; apres_legende?: string; ecart: string; mention?: string; source?: string; bascule?: number}> = ({
  surtitre,
  avant,
  avant_legende,
  apres,
  apres_legende,
  ecart,
  mention,
  source,
  bascule,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule, 0.7);
  const fleche = interpolate(frame, [10, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const apresPop = spring({frame: frame - 18, fps, config: {damping: 11, stiffness: 220}});
  const badge = spring({frame: frame - b, fps, config: {damping: 7, stiffness: 260}});
  return (
    <Card rotate={1.5}>
      <div style={{position: 'relative', paddingTop: 6}}>
        {surtitre ? <div style={{fontFamily: FONT_TITRE, fontSize: 42, color: '#6C757D', paddingTop: 6}}>{surtitre}</div> : null}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 8}}>
          <div>
            <div style={{fontFamily: FONT_TITRE, fontSize: 74, color: '#495057', lineHeight: 1, paddingTop: 10, whiteSpace: 'nowrap'}}>{avant}</div>
            {avant_legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 34, color: '#6C757D'}}>{avant_legende}</div> : null}
          </div>
          <svg width={90} height={60} viewBox="0 0 110 70" style={{opacity: fleche}}>
            <path d="M 6 35 H 80 M 60 10 L 96 35 L 60 60" fill="none" stroke={OUT} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{transform: `scale(${apresPop})`}}>
            <div style={{fontFamily: FONT_TITRE, fontSize: 92, color: '#2D6A4F', lineHeight: 1, paddingTop: 12, whiteSpace: 'nowrap'}}>{apres}</div>
            {apres_legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 34, color: '#6C757D'}}>{apres_legende}</div> : null}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -46,
            transform: `scale(${badge}) rotate(10deg)`,
            background: '#FFD60A',
            border: `7px solid ${OUT}`,
            borderRadius: 999,
            padding: '16px 26px 4px',
            fontFamily: FONT_TITRE,
            fontSize: 62,
            color: OUT,
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {ecart}
        </div>
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

/** Fiche de paie stylisée (générique, sans logo) : les lignes s'allument (surligneur jaune). */
const FichePaie: React.FC<{
  lignes: {cle: string; label: string; valeur: string}[];
  allumer?: {cle: string; au_mot: string}[];
  surligne?: string;
  gros_plan?: boolean;
  mention?: string;
  source?: string;
  motFrame?: (mot: string) => number | undefined;
}> = ({lignes, allumer, surligne, gros_plan, mention, source, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = usePop();
  // instant d'allumage de chaque ligne
  const debut: Record<string, number> = {};
  if (surligne) debut[surligne] = 8;
  (allumer ?? []).forEach((a, i) => {
    debut[a.cle] = motFrame?.(a.au_mot) ?? Math.round(((i + 1) / ((allumer?.length ?? 0) + 1)) * durationInFrames * 0.8);
  });
  const clignote = Math.floor(frame / 9) % 2 === 0;

  if (gros_plan && surligne) {
    const l = lignes.find((x) => x.cle === surligne)!;
    const zoom = interpolate(spring({frame, fps, config: {damping: 14, stiffness: 160}}), [0, 1], [0.7, 1]);
    return (
      <div style={{transform: `scale(${zoom * pop}) rotate(-2deg)`, background: 'white', border: `10px solid ${OUT}`, borderRadius: 20, boxShadow: '0 18px 0 rgba(0,0,0,0.3)', padding: '26px 40px 18px', width: 920}}>
        <div style={{fontFamily: FONT_TEXTE, fontSize: 30, color: '#6C757D', textAlign: 'left'}}>BULLETIN DE PAIE · …</div>
        <div style={{position: 'relative', marginTop: 14, padding: '18px 20px 6px', borderRadius: 12, background: '#FFE066', border: `6px solid ${OUT}`}}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 62, color: OUT, textAlign: 'left', lineHeight: 1.05}}>{l.label}</div>
          <div style={{fontFamily: FONT_TITRE, fontSize: 116, lineHeight: 1.05, textAlign: 'right', color: clignote ? '#E63946' : OUT, transform: `scale(${clignote ? 1.06 : 1})`, transformOrigin: 'right center'}}>
            {l.valeur}
          </div>
        </div>
        {mention ? <Mention>{mention}</Mention> : null}
        {source ? <Mention>{source}</Mention> : null}
      </div>
    );
  }

  return (
    <div style={{transform: `scale(${pop}) rotate(-2deg)`, background: 'white', border: `10px solid ${OUT}`, borderRadius: 20, boxShadow: '0 18px 0 rgba(0,0,0,0.3)', padding: '22px 36px 16px', width: 900}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `5px solid ${OUT}`, paddingBottom: 6}}>
        <div style={{fontFamily: FONT_TITRE, fontSize: 46, color: OUT, paddingTop: 8}}>BULLETIN DE PAIE</div>
        <div style={{fontFamily: FONT_TEXTE, fontSize: 28, color: '#6C757D'}}>Awa · caissière · 35 h</div>
      </div>
      {lignes.map((l) => {
        const d = debut[l.cle];
        const p = d === undefined ? 0 : interpolate(frame, [d, d + 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const actif = p > 0;
        const cle = d !== undefined;
        return (
          <div key={l.cle} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 12px 2px', marginTop: 6, borderBottom: '3px dashed #CED4DA'}}>
            <div style={{position: 'absolute', left: 0, top: 4, bottom: 2, width: `${p * 100}%`, background: '#FFE066', borderRadius: 10, border: actif ? `4px solid ${OUT}` : 'none', boxSizing: 'border-box'}} />
            <span style={{position: 'relative', fontFamily: cle ? FONT_TITRE : FONT_TEXTE, fontSize: cle ? 40 : 34, color: actif ? OUT : '#495057', paddingTop: cle ? 6 : 0, textAlign: 'left'}}>{l.label}</span>
            <span style={{position: 'relative', fontFamily: FONT_TITRE, fontSize: cle ? 48 : 38, color: actif ? '#E63946' : OUT, whiteSpace: 'nowrap', paddingTop: 6, transform: `scale(${1 + (actif ? (1 - p) * 0.3 : 0)})`}}>{l.valeur}</span>
          </div>
        );
      })}
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </div>
  );
};

/** Barre empilée : découpe d'un montant, empilement des parts, ou part hachurée (allègement). */
const BarreEmpilee: React.FC<{
  animation: 'decoupe' | 'empile' | 'hachure';
  segments: {label: string; montant: number; couleur: string; hachure?: boolean; texte?: string}[];
  titre?: string;
  valeur?: string;
  petit?: string;
  barre_entiere?: string;
  mention?: string;
  source?: string;
  bascule?: number;
}> = ({animation, segments, titre, valeur, petit, barre_entiere, mention, source, bascule}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = useBascule(bascule, 0.45);
  const W0 = 820;
  const GAP = 12;
  const total = segments.reduce((a, s) => a + s.montant, 0);
  const split = animation === 'decoupe' ? spring({frame: frame - b, fps, config: {damping: 12, stiffness: 180}}) : 1;
  const ecart = Math.round(fps * 0.35);
  const apparition = (i: number) => (animation === 'empile' ? spring({frame: frame - 6 - i * ecart, fps, config: {damping: 13, stiffness: 200}}) : 1);
  const hach = animation === 'hachure' ? interpolate(frame, [b, b + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const valeurPop = animation === 'empile' ? spring({frame: frame - b, fps, config: {damping: 9, stiffness: 240}}) : 1;
  const largeurUtile = W0 - GAP * (segments.length - 1) * split;
  let x = 0;
  const blocs = segments.map((s, i) => {
    const w = (s.montant / total) * largeurUtile;
    const bloc = {s, i, x, w};
    x += w + GAP * split;
    return bloc;
  });
  return (
    <Card rotate={-1}>
      <div style={{width: W0, paddingTop: 6}}>
        {titre ? <div style={{fontFamily: FONT_TITRE, fontSize: titre.length > 40 ? 36 : 42, color: '#495057', lineHeight: 1.1, paddingTop: 6}}>{titre}</div> : null}
        {valeur ? (
          <div style={{fontFamily: FONT_TITRE, fontSize: 84, color: '#E63946', lineHeight: 1.05, paddingTop: 10, transform: `scale(${valeurPop})`, whiteSpace: 'nowrap'}}>{valeur}</div>
        ) : null}
        <div style={{position: 'relative', height: 86, marginTop: 14}}>
          {animation === 'decoupe' && split < 0.5 ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: W0, height: 80, background: '#ADB5BD', border: `7px solid ${OUT}`, borderRadius: 22, boxSizing: 'border-box', opacity: 1 - split * 2}}>
              <div style={{fontFamily: FONT_TITRE, fontSize: 44, color: OUT, paddingTop: 16}}>{barre_entiere}</div>
            </div>
          ) : null}
          {blocs.map(({s, i, x: bx, w}) => {
            const a = apparition(i);
            const ghost = s.hachure ? hach : 0;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: bx,
                  top: 0,
                  width: Math.max(w * a, 0),
                  height: 80,
                  background: ghost > 0
                    ? `repeating-linear-gradient(-45deg, ${s.couleur} 0 12px, rgba(255,255,255,${0.9 * ghost}) 12px 24px)`
                    : s.couleur,
                  opacity: (animation === 'decoupe' ? Math.min(1, split * 2) : 1) * (1 - ghost * 0.35),
                  border: `${ghost > 0 ? 6 : 7}px ${ghost > 0.5 ? 'dashed' : 'solid'} ${OUT}`,
                  borderRadius: i === 0 ? '22px 6px 6px 22px' : i === segments.length - 1 ? '6px 22px 22px 6px' : 6,
                  boxSizing: 'border-box',
                  transform: animation === 'decoupe' ? `translateY(${(i % 2 ? 1 : -1) * split * 0}px)` : undefined,
                }}
              />
            );
          })}
        </div>
        {/* légende : une ligne par part */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 22, rowGap: 6, marginTop: 10}}>
          {segments.map((s, i) => {
            const a = animation === 'decoupe' ? split : apparition(i);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - Math.min(1, a)) * 20}px)`}}>
                <div style={{width: 30, height: 30, flex: 'none', borderRadius: 8, border: `5px solid ${OUT}`, background: s.hachure && hach > 0 ? `repeating-linear-gradient(-45deg, ${s.couleur} 0 5px, white 5px 10px)` : s.couleur}} />
                <div style={{fontFamily: FONT_TEXTE, fontSize: 30, color: OUT, textAlign: 'left', lineHeight: 1.05}}>
                  {s.label}{' '}
                  <span style={{fontFamily: FONT_TITRE, fontSize: 32, color: s.hachure && hach > 0.5 ? '#6C757D' : OUT, textDecoration: s.hachure && hach > 0.5 ? 'line-through' : 'none'}}>{s.texte ?? ''}</span>
                </div>
              </div>
            );
          })}
        </div>
        {petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 30, color: '#495057', marginTop: 10, lineHeight: 1.15}}>{petit}</div> : null}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Épisode 7 (entrepôt) : puce, tampon, téléphone de simulation, chaîne de flèches.

/** Petite pastille de texte qui rebondit, mention en petit dessous. */
const Puce: React.FC<{texte: string; mention?: string}> = ({texte, mention}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const flotte = Math.sin(frame / 9) * 6;
  return (
    <div style={{transform: `translateY(${flotte}px) scale(${pop}) rotate(-3deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          background: '#FFD60A',
          border: `9px solid ${OUT}`,
          borderRadius: 999,
          boxShadow: '0 14px 0 rgba(0,0,0,0.3)',
          padding: '26px 56px 8px',
          fontFamily: FONT_TITRE,
          fontSize: 92,
          color: OUT,
          whiteSpace: 'nowrap',
        }}
      >
        {texte}
      </div>
      {mention ? (
        <div style={{marginTop: 14, background: 'rgba(255,255,255,0.92)', border: `5px solid ${OUT}`, borderRadius: 16, padding: '4px 18px', fontFamily: FONT_TEXTE, fontSize: 32, color: '#495057'}}>
          {mention}
        </div>
      ) : null}
    </div>
  );
};

/** Tampon qui claque en biais (ex. « FACULTATIVE »). */
const Tampon: React.FC<{texte: string; petit?: string; couleur?: string}> = ({texte, petit, couleur = '#E63946'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const premier = usePremiereImage();
  const slam = premier ? 1 : spring({frame: frame - 6, fps, config: {damping: 10, stiffness: 260}});
  const scale = interpolate(slam, [0, 1], [2.6, 1]);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: premier || frame >= 6 ? 1 : 0}}>
      <div
        style={{
          transform: `scale(${scale}) rotate(-8deg)`,
          border: `12px solid ${couleur}`,
          borderRadius: 26,
          padding: '28px 46px 8px',
          background: 'rgba(255,255,255,0.88)',
          fontFamily: FONT_TITRE,
          fontSize: 104,
          letterSpacing: 6,
          color: couleur,
          boxShadow: `inset 0 0 0 6px rgba(255,255,255,0.9), inset 0 0 0 12px ${couleur}`,
        }}
      >
        {texte}
      </div>
      {petit ? (
        <div style={{marginTop: 26, opacity: Math.min(1, slam), background: 'white', border: `6px solid ${OUT}`, borderRadius: 20, padding: '14px 26px 4px', fontFamily: FONT_TITRE, fontSize: 52, color: '#2D6A4F'}}>
          {petit}
        </div>
      ) : null}
    </div>
  );
};

/** Smartphone générique (sans logo) : écran « Simulation », barre de progression, puis résultat. */
const TelephoneSimulation: React.FC<{titre: string; resultat: string; resultat_petit?: string; puce?: string; mention?: string; bascule?: number}> = ({
  titre,
  resultat,
  resultat_petit,
  puce,
  mention,
  bascule,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = usePop();
  const b = useBascule(bascule, 0.55);
  const progres = interpolate(frame, [8, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fini = spring({frame: frame - b, fps, config: {damping: 10, stiffness: 240}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 34, transform: `scale(${pop})`}}>
      <div style={{transform: 'rotate(-4deg)'}}>
        <Telephone w={330} h={430}>
          <div style={{background: '#F1FAEE', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 18px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT_TITRE, fontSize: 44, color: OUT, paddingTop: 6}}>{titre}</div>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{alignSelf: 'stretch', marginTop: 12, height: 26, borderRadius: 10, background: '#DEE2E6', display: 'flex', alignItems: 'center', paddingLeft: 10}}>
                <div style={{width: 18, height: 18, borderRadius: 5, background: progres > (k + 1) / 4 ? '#06D6A0' : 'white', border: `3px solid ${OUT}`}} />
              </div>
            ))}
            {fini < 0.05 ? (
              <div style={{alignSelf: 'stretch', marginTop: 28}}>
                <div style={{height: 30, borderRadius: 15, border: `5px solid ${OUT}`, background: 'white', overflow: 'hidden'}}>
                  <div style={{width: `${progres * 100}%`, height: '100%', background: '#06D6A0'}} />
                </div>
                <div style={{fontFamily: FONT_TITRE, fontSize: 34, color: '#495057', marginTop: 8, textAlign: 'center'}}>{Math.round(progres * 100)} %</div>
              </div>
            ) : (
              <div style={{marginTop: 18, transform: `scale(${fini})`, background: '#D8F3DC', border: `5px solid ${OUT}`, borderRadius: 18, padding: '10px 12px 4px', textAlign: 'center', alignSelf: 'stretch'}}>
                <div style={{fontFamily: FONT_TITRE, fontSize: 30, color: '#2D6A4F'}}>✓ Résultat</div>
                <div style={{fontFamily: FONT_TITRE, fontSize: 54, color: OUT, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{resultat}</div>
                {resultat_petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 22, color: '#495057'}}>{resultat_petit}</div> : null}
              </div>
            )}
          </div>
        </Telephone>
      </div>
      {puce || mention ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520}}>
          {puce ? (
            <div style={{background: '#FFD60A', border: `7px solid ${OUT}`, borderRadius: 26, padding: '14px 22px', fontFamily: FONT_TEXTE, fontSize: 34, color: OUT, lineHeight: 1.25, boxShadow: '0 10px 0 rgba(0,0,0,0.3)', transform: 'rotate(2deg)', whiteSpace: 'pre-line'}}>
              {puce}
            </div>
          ) : null}
          {mention ? (
            <div style={{background: 'rgba(255,255,255,0.92)', border: `5px solid ${OUT}`, borderRadius: 16, padding: '6px 16px', fontFamily: FONT_TEXTE, fontSize: 30, color: '#495057'}}>{mention}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** Flèche épaisse qui monte (verte) ou descend (orange). */
const FlecheSens: React.FC<{sens: 'haut' | 'bas'; taille?: number}> = ({sens, taille = 74}) => (
  <svg width={taille} height={taille} viewBox="0 0 80 80" style={{transform: sens === 'bas' ? 'rotate(180deg)' : undefined}}>
    <path d="M 40 6 L 72 42 H 52 V 74 H 28 V 42 H 8 Z" fill={sens === 'haut' ? '#06D6A0' : '#F77F00'} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

/** Enchaînement vertical d'effets (« Revenu ↑ → prime ↓ un peu → total ↑ »), étape par étape. */
const ChaineFleches: React.FC<{etapes: {label: string; sens: 'haut' | 'bas'; petit?: string}[]; mention?: string; source?: string}> = ({etapes, mention, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ecart = Math.round(fps * 0.8);
  return (
    <Card rotate={-1.5}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 6}}>
        {etapes.map((e, i) => {
          const p = spring({frame: frame - 6 - i * ecart, fps, config: {damping: 11, stiffness: 240}});
          const dernier = i === etapes.length - 1;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              {i > 0 ? (
                <svg width={40} height={36} viewBox="0 0 40 36" style={{opacity: Math.min(1, p * 2)}}>
                  <path d="M 20 2 V 26 M 8 16 L 20 30 L 32 16" fill="none" stroke="#6C757D" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transform: `scale(${p})`,
                  background: dernier ? '#FFD60A' : 'transparent',
                  border: dernier ? `6px solid ${OUT}` : 'none',
                  borderRadius: 20,
                  padding: dernier ? '4px 22px' : '0 10px',
                }}
              >
                <span style={{fontFamily: FONT_TITRE, fontSize: dernier ? 76 : 64, color: dernier ? '#2D6A4F' : OUT, paddingTop: 10, whiteSpace: 'nowrap'}}>{e.label}</span>
                <FlecheSens sens={e.sens} taille={dernier ? 80 : 66} />
                {e.petit ? <span style={{fontFamily: FONT_TEXTE, fontSize: 40, color: '#495057', fontStyle: 'italic'}}>{e.petit}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      {mention ? <Mention>{mention}</Mention> : null}
      {source ? <Mention>{source}</Mention> : null}
    </Card>
  );
};

export const ElementVisuelView: React.FC<{
  element: ElementVisuel;
  /** frame du mot `au_mot` dans le plan */
  bascule?: number;
  /** frame où la voix prononce un mot donné du plan (ep06 : plusieurs bascules) */
  motFrame?: (mot: string) => number | undefined;
}> = ({element, bascule, motFrame}) => {
  let inner: React.ReactNode = null;
  switch (element.type) {
    case 'compteur_vues':
      inner = <CompteurVues valeur={element.valeur} legende={element.legende} />;
      break;
    case 'carte_chiffre':
      inner = <CarteChiffre valeur={element.valeur} legende={element.legende} source={element.source} mention={element.mention} petit={element.petit} />;
      break;
    case 'icone':
      inner = <Icone nom={element.nom} />;
      break;
    case 'ecran_telephone':
      inner = <EcranTelephone plateforme={element.plateforme} texte={element.texte} />;
      break;
    case 'solde_telephone':
      inner = <SoldeTelephone depart={element.depart} arrivee={element.arrivee} devise={element.devise} />;
      break;
    case 'schema':
      inner = <Schema etapes={element.etapes} />;
      break;
    case 'calcul':
      inner = <Calcul expression={element.expression} mention={element.mention} />;
      break;
    case 'calendrier':
      inner = <Calendrier jours={element.jours} />;
      break;
    case 'notifications':
      inner = <Notifications items={element.items} />;
      break;
    case 'liste':
      inner = <Liste items={element.items} deja={element.deja} titre={element.titre} />;
      break;
    case 'chrono':
      inner = <Chrono valeur={element.valeur} />;
      break;
    case 'carte_evolution':
      inner = <CarteEvolution avant={element.avant} apres={element.apres} legende={element.legende} mention={element.mention} source={element.source} />;
      break;
    case 'notification_telephone':
      inner = <NotificationTelephone titre={element.titre} texte={element.texte} />;
      break;
    case 'barre_temps':
      inner = <BarreTemps titre={element.titre} segments={element.segments} mention={element.mention} />;
      break;
    case 'chaine':
      inner = <Chaine etapes={element.etapes} mention={element.mention} source={element.source} barrer={element.barrer} />;
      break;
    case 'calendrier_mois':
      inner = <CalendrierMois semaine_barree={element.semaine_barree} legende={element.legende} />;
      break;
    case 'icones_cta':
      inner = <IconesCta />;
      break;
    case 'carte_texte':
      inner = (
        <CarteTexte
          titre={element.titre}
          surtitre={element.surtitre}
          indices={element.indices}
          petit={element.petit}
          illustration={element.illustration}
          mention={element.mention}
          source={element.source}
        />
      );
      break;
    case 'compteur_tampon':
      inner = <CompteurTampon cible={element.cible} seuil={element.seuil} tampon={element.tampon} unite={element.unite} legende={element.legende} mention={element.mention} />;
      break;
    case 'calcul_lignes':
      inner = <CalculLignes lignes={element.lignes} mention={element.mention} source={element.source} ecart={element.ecart} />;
      break;
    case 'jauge':
      inner = <Jauge valeur={element.valeur} legende={element.legende} />;
      break;
    case 'carte_transformation':
      inner = <CarteTransformation avant={element.avant} avant_legende={element.avant_legende} apres={element.apres} apres_legende={element.apres_legende} mention={element.mention} bascule={bascule} />;
      break;
    case 'jauge_heures':
      inner = <JaugeHeures total={element.total} facturees={element.facturees} icones={element.icones} mention={element.mention} source={element.source} />;
      break;
    case 'calculette':
      inner = <Calculette operation={element.operation} resultat={element.resultat} legende={element.legende} mention={element.mention} />;
      break;
    case 'barre_ponction':
      inner = <BarrePonction titre={element.titre} calcul={element.calcul} part={element.part} barre={element.barre} tranche={element.tranche} source={element.source} bascule={bascule} />;
      break;
    case 'barre_retrecit':
      inner = <BarreRetrecit depart={element.depart} arrivee={element.arrivee} unite={element.unite} legende_depart={element.legende_depart} legende_arrivee={element.legende_arrivee} mention={element.mention} bascule={bascule} />;
      break;
    case 'jauge_plafond':
      inner = <JaugePlafond titre={element.titre} plafond={element.plafond} valeur={element.valeur} label_valeur={element.label_valeur} petit={element.petit} source={element.source} />;
      break;
    case 'face_a_face':
      inner = <FaceAFace gauche={element.gauche} droite={element.droite} mention={element.mention} source={element.source} bascule={bascule} symbole={element.symbole} positif={element.positif} />;
      break;
    case 'carte_hausse':
      inner = (
        <CarteHausse
          surtitre={element.surtitre}
          avant={element.avant}
          avant_legende={element.avant_legende}
          apres={element.apres}
          apres_legende={element.apres_legende}
          ecart={element.ecart}
          mention={element.mention}
          source={element.source}
          bascule={bascule}
        />
      );
      break;
    case 'fiche_paie':
      inner = <FichePaie lignes={element.lignes} allumer={element.allumer} surligne={element.surligne} gros_plan={element.gros_plan} mention={element.mention} source={element.source} motFrame={motFrame} />;
      break;
    case 'barre_empilee':
      inner = (
        <BarreEmpilee
          animation={element.animation}
          segments={element.segments}
          titre={element.titre}
          valeur={element.valeur}
          petit={element.petit}
          barre_entiere={element.barre_entiere}
          mention={element.mention}
          source={element.source}
          bascule={bascule}
        />
      );
      break;
    case 'puce':
      inner = <Puce texte={element.texte} mention={element.mention} />;
      break;
    case 'tampon':
      inner = <Tampon texte={element.texte} petit={element.petit} couleur={element.couleur} />;
      break;
    case 'telephone_simulation':
      inner = (
        <TelephoneSimulation
          titre={element.titre}
          resultat={element.resultat}
          resultat_petit={element.resultat_petit}
          puce={element.puce}
          mention={element.mention}
          bascule={bascule}
        />
      );
      break;
    case 'chaine_fleches':
      inner = <ChaineFleches etapes={element.etapes} mention={element.mention} source={element.source} />;
      break;
    default:
      inner = null;
  }
  return (
    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {inner}
    </div>
  );
};
