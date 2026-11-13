import type {Plan} from './types';

export const FPS = 30;

/** Marge après la fin de la voix avant la coupe (s) — mode par_scene (épisode 1). */
export const MARGE_VOIX = 0.3;

/** Texte lu par la voix : {mot} remplacé par les mots rotatifs (même règle que scripts/voix.mjs). */
export const texteLu = (plan: Pick<Plan, 'texte' | 'element_visuel'>) => {
  const ev = plan.element_visuel;
  if (ev?.type === 'mots_rotatifs' && plan.texte.includes('{mot}')) {
    return plan.texte.replace('{mot}', ev.mots.map((m) => m.toLowerCase()).join('... '));
  }
  return plan.texte;
};

const EXPRESSIONS = ['neutre', 'fier', 'reveur', 'perplexe', 'choque', 'content'];

/** Vérifie un script d'épisode ; lève une erreur claire si un plan est invalide. */
export const loadScript = (raw: unknown, fichier: string): Plan[] => {
  if (!Array.isArray(raw)) {
    throw new Error(`${fichier} doit contenir un tableau de plans.`);
  }
  return (raw as unknown[]).map((p, i) => {
    const plan = p as Partial<Plan>;
    const where = `${fichier}, plan #${i + 1}`;
    if (typeof plan.texte !== 'string' || !plan.texte.trim()) {
      throw new Error(`${where} : "texte" manquant.`);
    }
    if (typeof plan.duree !== 'number' || plan.duree <= 0) {
      throw new Error(`${where} : "duree" doit être un nombre de secondes > 0.`);
    }
    if (plan.expression && !EXPRESSIONS.includes(plan.expression)) {
      throw new Error(`${where} : expression "${plan.expression}" inconnue (${EXPRESSIONS.join(', ')}).`);
    }
    return {
      texte: plan.texte,
      decor: plan.decor ?? 'uni',
      expression: plan.expression ?? 'neutre',
      element_visuel: plan.element_visuel ?? null,
      mot_jaune: plan.mot_jaune ?? null,
      etiquette: plan.etiquette ?? null,
      duree: plan.duree,
      voix: null,
    };
  });
};

/** Durée d'un plan en mode par_scene : max(durée du script, durée audio + 0,3 s). */
export const planFrames = (plan: Plan) =>
  Math.ceil(Math.max(plan.duree, plan.voix ? plan.voix.duree_audio + MARGE_VOIX : 0) * FPS);
