import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_TEXTE, FONT_TITRE} from '../fonts';
import type {ElementVisuel} from '../types';
import {ElementEp11} from './ElementsEp11';

/**
 * Éléments visuels de l'épisode 10 : cartes qui glissent depuis le côté et rebondissent, chiffres en symboles,
 * source en petit en bas. Aucun logo réel : la pastille « OF » est générique (carré arrondi jaune de la série,
 * texte simple), sans rapport de forme ni de couleur avec un logo existant.
 */

const OUT = '#1b1b2f';
const VERT = '#1F9D55';
const ROUGE = '#E63946';

type MotFrame = (mot: string) => number | undefined;

/** Apparition « glisse + rebond » d'une carte (depuis la droite par défaut). */
export const Glisse: React.FC<{children: React.ReactNode; depuis?: number; sens?: 1 | -1; delai?: number}> = ({children, depuis = 0, sens = 1, delai = 2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - depuis - delai, fps, config: {damping: 9, stiffness: 140, mass: 0.8}});
  const x = interpolate(s, [0, 1], [sens * 1150, 0]);
  const rot = interpolate(s, [0, 1], [sens * 8, 0]);
  return <div style={{transform: `translateX(${x}px) rotate(${rot}deg)`}}>{children}</div>;
};

/** Petite ligne qui tombe et rebondit à son tour. */
const Tombe: React.FC<{children: React.ReactNode; depuis: number}> = ({children, depuis}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < depuis) return <div style={{opacity: 0}}>{children}</div>;
  const s = spring({frame: frame - depuis, fps, config: {damping: 8, stiffness: 200}});
  return <div style={{transform: `translateY(${interpolate(s, [0, 1], [-60, 0])}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`, opacity: Math.min(1, s * 2)}}>{children}</div>;
};

const Carte: React.FC<{children: React.ReactNode; largeur?: number; rotation?: number}> = ({children, largeur = 900, rotation = -1.5}) => (
  <div
    style={{
      width: largeur,
      background: 'white',
      border: `10px solid ${OUT}`,
      borderRadius: 38,
      boxShadow: '0 16px 0 rgba(0,0,0,0.3)',
      padding: '26px 40px 18px',
      transform: `rotate(${rotation}deg)`,
      textAlign: 'center',
      fontFamily: FONT_TEXTE,
      color: OUT,
    }}
  >
    {children}
  </div>
);

const Source: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontSize: 24, color: '#6C757D', marginTop: 10, lineHeight: 1.15}}>{children}</div>;

const Mention: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'inline-block', marginTop: 10, background: '#FFF3B0', border: `4px solid ${OUT}`, borderRadius: 14, padding: '4px 14px 0', fontSize: 26}}>{children}</div>
);

/** Pastille générique « OF » : carré arrondi jaune de la série, lettres en texte simple. */
export const PastilleOF: React.FC<{texte?: string; taille?: number}> = ({texte = 'OF', taille = 96}) => (
  <div
    style={{
      width: taille,
      height: taille,
      borderRadius: taille * 0.28,
      background: '#FFD60A',
      border: `7px solid ${OUT}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT_TITRE,
      fontSize: taille * 0.44,
      paddingTop: taille * 0.1,
      color: OUT,
      boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
      transform: 'rotate(-6deg)',
      flexShrink: 0,
    }}
  >
    {texte}
  </div>
);

const frameDe = (motFrame: MotFrame | undefined, mot: string | undefined, defaut: number) => (mot && motFrame ? (motFrame(mot) ?? defaut) : defaut);

// ---------------------------------------------------------------------------

const CartesSuccessives: React.FC<{el: Extract<ElementVisuel, {type: 'cartes_successives'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const debuts = el.cartes.map((c, i) => frameDe(motFrame, c.au_mot, i * 45));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        {el.pastille ? <PastilleOF texte={el.pastille} taille={110} /> : null}
        {el.cartes.map((c, i) => {
          const actif = frame >= debuts[i];
          const dernier = i === el.cartes.length - 1 || frame < debuts[i + 1];
          const s = spring({frame: frame - debuts[i], fps, config: {damping: 9, stiffness: 150}});
          if (!actif) return null;
          return (
            <div
              key={i}
              style={{
                transform: `translateX(${interpolate(s, [0, 1], [900, 0])}px) translateY(${(1 - s) * -40}px) scale(${dernier ? 1 : 0.86})`,
                background: c.alerte ? '#FFE5E7' : 'white',
                border: `9px solid ${c.alerte ? ROUGE : OUT}`,
                borderRadius: 30,
                padding: '16px 22px 8px',
                boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
                textAlign: 'center',
                minWidth: 220,
              }}
            >
              <div style={{fontFamily: FONT_TITRE, fontSize: dernier ? 72 : 56, color: c.alerte ? ROUGE : OUT, lineHeight: 1, whiteSpace: 'nowrap'}}>{c.valeur}</div>
              {c.legende ? <div style={{fontFamily: FONT_TEXTE, fontSize: 30, color: '#495057', whiteSpace: 'nowrap'}}>{c.legende}</div> : null}
            </div>
          );
        })}
      </div>
      {el.mention ? <Mention>{el.mention}</Mention> : null}
      {el.source ? <Source>{el.source}</Source> : null}
    </div>
  );
};

const Cascade: React.FC<{el: Extract<ElementVisuel, {type: 'cascade'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const debuts = el.lignes.map((l, i) => frameDe(motFrame, l.au_mot, 8 + i * 30));
  return (
    <Glisse>
      <Carte largeur={940}>
        {el.definition ? (
          <div style={{background: '#E8F8F2', border: `4px solid ${OUT}`, borderRadius: 16, padding: '6px 14px 2px', fontSize: 30, marginBottom: 10, lineHeight: 1.15}}>{el.definition}</div>
        ) : null}
        {el.titre || el.pastille ? (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 6}}>
            {el.pastille ? <PastilleOF texte={el.pastille} taille={64} /> : null}
            {el.titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 44, paddingTop: 8}}>{el.titre}</div> : null}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          {el.lignes.map((l, i) => (
            <Tombe key={i} depuis={debuts[i]}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 20,
                  padding: l.resultat ? '8px 18px 2px' : '2px 18px',
                  borderRadius: 16,
                  background: l.resultat ? '#FFD60A' : 'transparent',
                  border: l.resultat ? `5px solid ${OUT}` : '5px solid transparent',
                  borderTop: !l.resultat && i > 0 ? '3px dashed #CED4DA' : undefined,
                  transform: l.resultat && frame >= debuts[i] ? `scale(${1 + Math.max(0, Math.sin((frame - debuts[i]) / 4)) * 0.02})` : undefined,
                }}
              >
                <span style={{fontSize: l.resultat ? 40 : 36, textAlign: 'left'}}>{l.label}</span>
                <span style={{fontFamily: FONT_TITRE, fontSize: l.resultat ? 60 : 48, color: l.negatif ? ROUGE : l.resultat ? OUT : OUT, whiteSpace: 'nowrap'}}>{l.valeur}</span>
              </div>
            </Tombe>
          ))}
        </div>
        {el.petit ? <div style={{fontSize: 28, color: '#495057', marginTop: 8}}>{el.petit}</div> : null}
        {el.hypotheses ? <div style={{fontSize: 24, color: '#495057', marginTop: 8, lineHeight: 1.15, whiteSpace: 'pre-line'}}>{el.hypotheses}</div> : null}
        {el.mention ? <Mention>{el.mention}</Mention> : null}
        {el.source ? <Source>{el.source}</Source> : null}
      </Carte>
    </Glisse>
  );
};

const Coche: React.FC<{depuis: number}> = ({depuis}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [depuis, depuis + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" style={{flexShrink: 0}}>
      <rect x={4} y={4} width={48} height={48} rx={10} fill={p > 0 ? '#D8F3DC' : 'white'} stroke={OUT} strokeWidth={6} />
      <path d="M 14 30 L 25 41 L 44 15" fill="none" stroke={VERT} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 - p * 100} />
    </svg>
  );
};

const ContratCases: React.FC<{el: Extract<ElementVisuel, {type: 'contrat_cases'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const debuts = el.cases.map((c, i) => frameDe(motFrame, c.au_mot, 20 + i * 20));
  return (
    <Glisse sens={-1}>
      <div
        style={{
          width: 820,
          background: '#FFFDF7',
          border: `10px solid ${OUT}`,
          borderRadius: 18,
          boxShadow: '0 16px 0 rgba(0,0,0,0.3)',
          padding: '22px 40px 16px',
          transform: 'rotate(2deg)',
          fontFamily: FONT_TEXTE,
          color: OUT,
        }}
      >
        <div style={{fontFamily: FONT_TITRE, fontSize: 50, textAlign: 'center', paddingTop: 6}}>{el.titre}</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8}}>
          {el.cases.map((c, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Coche depuis={debuts[i]} />
              <div style={{fontSize: 38, lineHeight: 1.05}}>
                {c.label}
                {c.petit ? <span style={{fontSize: 28, color: '#6C757D'}}> · {c.petit}</span> : null}
              </div>
            </div>
          ))}
        </div>
        {el.petit ? <div style={{fontSize: 28, color: '#495057', marginTop: 12, textAlign: 'center'}}>{el.petit}</div> : null}
        {el.mention ? <div style={{textAlign: 'center'}}><Mention>{el.mention}</Mention></div> : null}
        {el.source ? <div style={{textAlign: 'center'}}><Source>{el.source}</Source></div> : null}
      </div>
    </Glisse>
  );
};

const CarteTaux: React.FC<{el: Extract<ElementVisuel, {type: 'carte_taux'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const debuts = el.lignes.map((l, i) => frameDe(motFrame, l.au_mot, 10 + i * 30));
  return (
    <Glisse>
      <Carte largeur={900}>
        {el.titre ? <div style={{fontFamily: FONT_TITRE, fontSize: 46, paddingTop: 6}}>{el.titre}</div> : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          {el.lignes.map((l, i) => (
            <Tombe key={i} depuis={debuts[i]}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20, padding: '2px 10px', borderTop: i > 0 ? '3px dashed #CED4DA' : undefined}}>
                <span style={{fontSize: 38, textAlign: 'left'}}>{l.label}</span>
                <span style={{fontFamily: FONT_TITRE, fontSize: 50, whiteSpace: 'nowrap', color: i === el.lignes.length - 1 && el.lignes.length > 2 ? VERT : OUT}}>{l.valeur}</span>
              </div>
            </Tombe>
          ))}
        </div>
        {el.petit ? <div style={{fontSize: 28, color: '#495057', marginTop: 8}}>{el.petit}</div> : null}
        {el.mention ? <Mention>{el.mention}</Mention> : null}
        {el.source ? <Source>{el.source}</Source> : null}
      </Carte>
    </Glisse>
  );
};

const Profil: React.FC<{couleur: string}> = ({couleur}) => (
  <svg width={130} height={130} viewBox="0 0 130 130">
    <circle cx={65} cy={65} r={58} fill={couleur} stroke={OUT} strokeWidth={8} />
    <circle cx={65} cy={50} r={20} fill="white" stroke={OUT} strokeWidth={5} />
    <path d="M 30 104 Q 65 64 100 104" fill="white" stroke={OUT} strokeWidth={5} />
  </svg>
);

const ProfilsComptes: React.FC<{el: Extract<ElementVisuel, {type: 'profils_comptes'}>; bascule?: number}> = ({el, bascule}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = bascule ?? 40;
  const couleurs = ['#FF70A6', '#4CC9F0', '#F4A261', '#90BE6D'];
  return (
    <Glisse>
      <Carte largeur={880}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 30}}>
          {Array.from({length: el.n}).map((_, i) => {
            const s = spring({frame: frame - 6 - i * 7, fps, config: {damping: 8, stiffness: 220}});
            return (
              <div key={i} style={{transform: `scale(${s}) translateY(${Math.sin(frame / 8 + i) * 4}px)`}}>
                <Profil couleur={couleurs[i % couleurs.length]} />
              </div>
            );
          })}
        </div>
        <Tombe depuis={b}>
          <div style={{fontFamily: FONT_TITRE, fontSize: 52, marginTop: 10, whiteSpace: 'nowrap'}}>
            {el.calcul} <span style={{background: '#FFD60A', padding: '6px 14px 0', borderRadius: 14, border: `5px solid ${OUT}`}}>{el.resultat}</span>
          </div>
        </Tombe>
        {el.mention ? <div style={{fontSize: 26, color: '#495057', marginTop: 12, lineHeight: 1.15}}>{el.mention}</div> : null}
      </Carte>
    </Glisse>
  );
};

const TableauBord: React.FC<{el: Extract<ElementVisuel, {type: 'tableau_bord'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const debuts = el.tuiles.map((tu, i) => frameDe(motFrame, tu.au_mot, 8 + i * 30));
  return (
    <Glisse>
      <div style={{width: 940, background: '#212A3E', border: `10px solid ${OUT}`, borderRadius: 34, padding: '20px 24px 14px', boxShadow: '0 16px 0 rgba(0,0,0,0.3)', fontFamily: FONT_TEXTE}}>
        <div style={{display: 'flex', gap: 18}}>
          {el.tuiles.map((tu, i) => {
            const p = interpolate(frame, [debuts[i], debuts[i] + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div key={i} style={{flex: 1, opacity: frame >= debuts[i] ? 1 : 0.25, background: 'white', borderRadius: 22, border: `6px solid ${OUT}`, padding: '14px 16px 10px', color: OUT, transform: `scale(${0.9 + 0.1 * p})`}}>
                <div style={{fontFamily: FONT_TITRE, fontSize: 36, lineHeight: 1.05, paddingTop: 4}}>{tu.titre}</div>
                {tu.jauge !== undefined ? (
                  <div style={{height: 30, borderRadius: 15, background: '#E9ECEF', border: `4px solid ${OUT}`, margin: '10px 0', overflow: 'hidden'}}>
                    <div style={{width: `${tu.jauge * p}%`, height: '100%', background: VERT}} />
                  </div>
                ) : null}
                <div style={{fontSize: 28, lineHeight: 1.12, color: '#343A40', whiteSpace: 'pre-line'}}>{tu.detail}</div>
              </div>
            );
          })}
        </div>
        {el.source ? <div style={{fontSize: 24, color: '#ADB5BD', marginTop: 10, textAlign: 'center'}}>{el.source}</div> : null}
      </div>
    </Glisse>
  );
};

const CompteSuspendu: React.FC<{el: Extract<ElementVisuel, {type: 'compte_suspendu'}>; bascule?: number}> = ({el, bascule}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = bascule ?? 60;
  const apres = frame >= b;
  const s = spring({frame: frame - b, fps, config: {damping: 9, stiffness: 160}});
  const tremble = !apres ? Math.sin(frame * 1.7) * 4 : 0;
  return (
    <Glisse>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, fontFamily: FONT_TEXTE}}>
        <div style={{transform: `translateX(${tremble}px) scale(${apres ? 0.8 : 1})`, width: 300, background: '#2B2D42', border: `10px solid ${OUT}`, borderRadius: 42, padding: 16, boxShadow: '0 16px 0 rgba(0,0,0,0.3)'}}>
          <div style={{background: '#FFE5E7', borderRadius: 24, padding: '20px 12px', textAlign: 'center', color: ROUGE}}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <rect x={14} y={34} width={52} height={40} rx={8} fill={ROUGE} stroke={OUT} strokeWidth={5} />
              <path d="M 26 34 V 24 a 14 14 0 0 1 28 0 V 34" fill="none" stroke={OUT} strokeWidth={7} />
            </svg>
            <div style={{fontSize: 34, lineHeight: 1.05}}>{el.titre}</div>
            <div style={{fontFamily: FONT_TITRE, fontSize: 80, lineHeight: 1, paddingTop: 8}}>{el.valeur}</div>
          </div>
        </div>
        {apres ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `translateX(${(1 - s) * 500}px)`}}>
            <svg width={90} height={60} viewBox="0 0 90 60">
              <path d="M 6 30 H 70 M 52 10 L 80 30 L 52 50" fill="none" stroke={OUT} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              {el.plateformes.map((p, i) => (
                <div key={p} style={{width: 150, height: 150, borderRadius: 30, background: i === 0 ? '#4CC9F0' : '#90BE6D', border: `8px solid ${OUT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TITRE, fontSize: 80, paddingTop: 12, color: 'white', WebkitTextStroke: `4px ${OUT}`, paintOrder: 'stroke fill', boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {el.petit ? <div style={{fontFamily: FONT_TEXTE, fontSize: 26, color: 'white', textAlign: 'center', marginTop: 12, textShadow: '0 3px 0 rgba(0,0,0,0.6)'}}>{el.petit}</div> : null}
    </Glisse>
  );
};

const Verrous: React.FC<{el: Extract<ElementVisuel, {type: 'verrous'}>; motFrame?: MotFrame}> = ({el, motFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const debuts = el.pastilles.map((p, i) => frameDe(motFrame, p.au_mot, 20 + i * 20));
  const couleurs = ['#4361EE', VERT, '#FF70A6'];
  return (
    <Glisse>
      <Carte largeur={920}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 22}}>
          {el.pastilles.map((p, i) => {
            const s = spring({frame: frame - debuts[i], fps, config: {damping: 10, stiffness: 200}});
            const ferme = frame >= debuts[i] + 8;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - s) * -80}px)`, opacity: frame >= debuts[i] ? 1 : 0.2}}>
                <div style={{background: couleurs[i % 3], color: 'white', border: `6px solid ${OUT}`, borderRadius: 40, padding: '12px 26px 4px', fontFamily: FONT_TITRE, fontSize: 40}}>{p.texte}</div>
                <svg width={60} height={64} viewBox="0 0 60 64" style={{marginTop: 6}}>
                  <rect x={8} y={28} width={44} height={32} rx={7} fill={ferme ? '#FFD60A' : '#E9ECEF'} stroke={OUT} strokeWidth={5} />
                  <path d={ferme ? 'M 18 28 V 18 a 12 12 0 0 1 24 0 V 28' : 'M 18 28 V 18 a 12 12 0 0 1 24 0 V 12'} fill="none" stroke={OUT} strokeWidth={6} />
                </svg>
              </div>
            );
          })}
        </div>
        <div style={{fontFamily: FONT_TITRE, fontSize: 50, marginTop: 8, color: VERT}}>→ {el.destination}</div>
        {el.mention ? <Mention>{el.mention}</Mention> : null}
      </Carte>
    </Glisse>
  );
};

/** Rend un élément ep10 ; null si le type n'en est pas un. */
export const ElementEp10: React.FC<{element: ElementVisuel; bascule?: number; motFrame?: MotFrame}> = ({element, bascule, motFrame}) => {
  switch (element.type) {
    case 'cartes_successives':
      return <CartesSuccessives el={element} motFrame={motFrame} />;
    case 'cascade':
      return <Cascade el={element} motFrame={motFrame} />;
    case 'contrat_cases':
      return <ContratCases el={element} motFrame={motFrame} />;
    case 'carte_taux':
      return <CarteTaux el={element} motFrame={motFrame} />;
    case 'profils_comptes':
      return <ProfilsComptes el={element} bascule={bascule} />;
    case 'tableau_bord':
      return <TableauBord el={element} motFrame={motFrame} />;
    case 'compte_suspendu':
      return <CompteSuspendu el={element} bascule={bascule} />;
    case 'verrous':
      return <Verrous el={element} motFrame={motFrame} />;
    case 'barres_comparees':
    case 'addition_pastilles':
      return <ElementEp11 element={element} motFrame={motFrame} />;
    default:
      return null;
  }
};

export const EST_EP10 = new Set(['cartes_successives', 'cascade', 'contrat_cases', 'carte_taux', 'profils_comptes', 'tableau_bord', 'compte_suspendu', 'verrous', 'barres_comparees', 'addition_pastilles', 'carte_vedette']);
