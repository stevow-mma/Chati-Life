import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Decor} from './components/Decor';
import {ElementVisuelView} from './components/ElementVisuel';
import {Etiquette} from './components/Etiquette';
import {ObjetSol, OBJETS_SOL} from './components/Objets';
import {Personnage, type Apparence} from './components/Personnage';
import {PremiereImage} from './intro';
import {FONT_TEXTE} from './fonts';
import {Subtitle, revealFrames} from './components/Subtitle';
import {Acteurs} from './components/Acteurs';
import {ElementEp10, EST_EP10, Glisse} from './components/ElementsEp10';
import type {Accessoire, Plan} from './types';

export const PlanScene: React.FC<{plan: Plan; personnage: Apparence; premier?: boolean; /** personnage muet (ep05+) : bouche jamais calée sur la voix */ muet?: boolean}> = ({
  plan,
  personnage,
  premier = false,
  muet = false,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const voix = plan.voix ?? null;
  const ev = plan.element_visuel;
  const t = frame / fps;
  const motsVoix = voix?.mots ?? [];
  const debutF = (k: number) => Math.round((motsVoix[k]?.debut ?? 0) * fps);

  // Mot rotatif (hook) : {mot} change quand la voix le prononce (sinon toutes les `intervalle` s).
  let mot: string | null = null;
  let motIndex = 0;
  let motStart = 0;
  let accessoire: Accessoire = null;
  // index (dans le texte affiché) du mot qui contient {mot}
  const motsTexte = plan.texte.split(/\s+/).filter(Boolean);
  const posMot = motsTexte.findIndex((w) => w.includes('{mot}'));
  let motStarts: number[] | null = null;
  if (ev?.type === 'mots_rotatifs' && ev.mots.length > 0) {
    if (voix && posMot >= 0 && motsVoix.length >= posMot + ev.mots.length) {
      motStarts = ev.mots.map((_, j) => debutF(posMot + j));
    } else {
      const step = Math.round((ev.intervalle ?? 1) * fps);
      motStarts = ev.mots.map((_, j) => j * step);
    }
    motIndex = 0;
    motStarts.forEach((st, j) => {
      if (frame >= st) motIndex = j;
    });
    motStart = motStarts[motIndex];
    mot = ev.mots[motIndex];
    accessoire = ev.accessoires?.[motIndex] ?? null;
  }
  const texte = mot ? plan.texte.replace('{mot}', mot) : plan.texte;
  const motJaune = plan.mot_jaune === '{mot}' ? mot : plan.mot_jaune;
  const isRotating = mot !== null;

  // Apparition mot à mot calée sur la voix
  let starts: number[] | null = null;
  if (voix) {
    if (isRotating && motStarts) {
      starts = motsTexte.map((_, i) => (i === posMot ? motStarts![0] : debutF(i < posMot ? i : i + (motStarts!.length - 1))));
    } else if (motsVoix.length === motsTexte.length) {
      starts = motsTexte.map((_, i) => debutF(i));
    }
  }

  // "Punch" d'entrée à chaque coupe (et à chaque changement de mot du hook).
  // (avant le premier mot rotatif, c'est la coupe elle-même qui "punche")
  const punchFrom = isRotating && motStarts && frame >= motStarts[0] ? motStart : 0;
  const punch = spring({frame: frame - punchFrom, fps, config: {damping: 14, stiffness: 220}});
  // Première image de l'épisode : pas de flash ni de zoom, l'action est déjà à l'écran.
  const sceneScale = premier ? 1 : interpolate(punch, [0, 1], [1.1, 1]);
  const flash = premier ? 0 : interpolate(frame - punchFrom, [0, 4], [0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const reveal = isRotating ? 1 : revealFrames(texte, fps, durationInFrames);
  // Bouche : bouge pendant que la voix prononce un mot
  const talking = voix
    ? motsVoix.some((m) => t >= m.debut - 0.02 && t <= m.fin + 0.04)
    : isRotating
      ? frame - motStart < 18
      : frame < reveal + 4;

  // Changement d'expression en cours de plan (« contente puis inquiète »), calé sur le mot prononcé.
  let expression = plan.expression;
  if (plan.puis) {
    const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
    const k = motsTexte.findIndex((w) => norm(w) === norm(plan.puis!.au_mot));
    const bascule = k >= 0 && voix && motsVoix[k] ? debutF(k) : Math.round(durationInFrames / 2);
    if (frame >= bascule) expression = plan.puis.expression;
  }

  // Bascule d'un élément visuel (« au_mot ») : frame où la voix prononce ce mot.
  let basculeEv: number | undefined;
  if (ev && 'au_mot' in ev && ev.au_mot && voix) {
    const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
    const k = motsTexte.findIndex((w) => norm(w) === norm(ev.au_mot!));
    if (k >= 0 && motsVoix[k]) basculeEv = debutF(k);
  }
  // Instant (frame) où la voix prononce un mot donné du plan (éléments à plusieurs bascules, ep06).
  const motFrame = (m: string) => {
    if (!voix) return undefined;
    const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
    if (m.includes('#')) {
      // ep10 : « mot#2 » = 2e occurrence du mot dans le plan
      const [mot, rang] = m.split('#');
      const ks = motsTexte.map((w, i) => (norm(w) === norm(mot) ? i : -1)).filter((i) => i >= 0);
      const k = ks[Number(rang) - 1];
      return k !== undefined && motsVoix[k] ? debutF(k) : undefined;
    }
    const k = motsTexte.findIndex((w) => norm(w) === norm(m));
    return k >= 0 && motsVoix[k] ? debutF(k) : undefined;
  };
  // ep10 : plusieurs personnages animés par des actions (sinon : personnage seul au centre, comportement d'origine)
  const acteurs = plan.acteurs && plan.acteurs.length ? plan.acteurs : null;
  // léger travelling horizontal pendant le plan (ep10)
  const travelling = acteurs ? interpolate(frame, [0, durationInFrames], [-18, 18]) * (plan.decor.length % 2 ? 1 : -1) : 0;

  // Objets au sol (un seul ou une liste)
  const objets = plan.accessoire_sol ? (Array.isArray(plan.accessoire_sol) ? plan.accessoire_sol : [plan.accessoire_sol]) : [];
  const objetsDerriere = objets.filter((o) => !OBJETS_SOL[o].devant);
  const objetsDevant = objets.filter((o) => OBJETS_SOL[o].devant);

  return (
    <PremiereImage.Provider value={premier}>
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {voix?.fichier ? <Audio src={staticFile(voix.fichier)} /> : null}
      <AbsoluteFill style={{transform: acteurs ? `scale(${sceneScale}) translateX(${travelling}px)` : `scale(${sceneScale})`}}>
        <Decor nom={plan.decor} variante={motIndex} />

        {objetsDerriere.map((o) => (
          <ObjetSol key={o} nom={o} couleurVelo={personnage.velo ?? undefined} />
        ))}

        {acteurs ? (
          <Acteurs acteurs={acteurs} objets={plan.objets_scene ?? []} expressionPlan={expression} principal={personnage} muet={muet} />
        ) : (
        /* Personnage : centre de l'écran */
        <div
          style={{
            position: 'absolute',
            left: (1080 - 560) / 2,
            top: 690,
            width: 560,
            height: 840,
          }}
        >
          <Personnage apparence={personnage} expression={expression} talking={muet ? false : talking} muet={muet} accessoire={accessoire} entree={!premier} pose={plan.pose} objetMain={plan.objet_main ?? null} />
        </div>
        )}

        {objetsDevant.map((o) => (
          <ObjetSol key={o} nom={o} couleurVelo={personnage.velo ?? undefined} />
        ))}

        {/* Élément visuel : zone haute */}
        {ev && ev.type !== 'mots_rotatifs' && acteurs ? (
          // ep10 : zone haute, la carte glisse depuis le côté et rebondit, sans couvrir les personnages
          <div style={{position: 'absolute', left: 0, right: 0, top: 318, display: 'flex', justifyContent: 'center', transform: `translateX(${-travelling}px)`}}>
            {EST_EP10.has(ev.type) ? (
              <ElementEp10 element={ev} bascule={basculeEv} motFrame={motFrame} />
            ) : (
              <Glisse>
                <div style={{width: 1080, height: 440}}>
                  <ElementVisuelView element={ev} bascule={basculeEv} motFrame={motFrame} />
                </div>
              </Glisse>
            )}
          </div>
        ) : ev && ev.type !== 'mots_rotatifs' ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 320, height: 440}}>
            <ElementVisuelView element={ev} bascule={basculeEv} motFrame={motFrame} />
          </div>
        ) : null}
      </AbsoluteFill>

      {plan.hypotheses ? (
        // rappel discret des hypothèses de l'exemple chiffré
        <div style={{position: 'absolute', top: 12, left: 30, right: 30, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              background: 'rgba(27,27,47,0.82)',
              color: 'white',
              fontFamily: FONT_TEXTE,
              fontSize: 24,
              lineHeight: 1.15,
              padding: '6px 20px',
              whiteSpace: 'pre-line',
              borderRadius: 18,
              textAlign: 'center',
            }}
          >
            {plan.hypotheses}
          </div>
        </div>
      ) : null}

      {plan.etiquette ? <Etiquette texte={plan.etiquette} /> : null}

      <Subtitle
        texte={texte}
        motJaune={motJaune}
        revealDuration={reveal}
        punchFrom={isRotating ? motStart : null}
        starts={starts}
        rangJaune={plan.mot_jaune_rang ?? null}
      />

      <AbsoluteFill style={{backgroundColor: 'white', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
    </PremiereImage.Provider>
  );
};
