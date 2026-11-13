import raw from '../script.json';
import type {Plan} from './types';

export const FPS = 30;

const EXPRESSIONS = ['neutre', 'fier', 'reveur', 'perplexe', 'choque', 'content'];

/** Charge et vérifie script.json ; lève une erreur claire si un plan est invalide. */
export const loadScript = (): Plan[] => {
  if (!Array.isArray(raw)) {
    throw new Error('script.json doit contenir un tableau de plans.');
  }
  return (raw as unknown[]).map((p, i) => {
    const plan = p as Partial<Plan>;
    const where = `script.json, plan #${i + 1}`;
    if (typeof plan.texte !== 'string' || !plan.texte.trim()) {
      throw new Error(`${where} : "texte" manquant.`);
    }
    if (typeof plan.duree !== 'number' || plan.duree <= 0) {
      throw new Error(`${where} : "duree" doit être un nombre de secondes > 0.`);
    }
    if (plan.expression && !EXPRESSIONS.includes(plan.expression)) {
      throw new Error(
        `${where} : expression "${plan.expression}" inconnue (${EXPRESSIONS.join(', ')}).`,
      );
    }
    return {
      texte: plan.texte,
      decor: plan.decor ?? 'uni',
      expression: plan.expression ?? 'neutre',
      element_visuel: plan.element_visuel ?? null,
      mot_jaune: plan.mot_jaune ?? null,
      etiquette: plan.etiquette ?? null,
      duree: plan.duree,
    };
  });
};

export const planFrames = (plan: Plan) => Math.round(plan.duree * FPS);
