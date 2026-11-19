import React from 'react';
import {FONT, INK, ORANGE_ACTIF, pop} from './base';

export type Mot = {texte: string; debut: number; fin: number};
export type Bloc = {texte: string; debut: number; fin: number; ponct: boolean};

const UNITES: Record<string, number> = {
  zéro: 0, zero: 0, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, vingts: 20, trente: 30,
  quarante: 40, cinquante: 50, soixante: 60,
};
const nettoie = (w: string) => w.toLowerCase().replace(/[.,:;!?…«»"]/g, '');
const estNombre = (w: string, prev: string | null, dansRun: boolean) => {
  const n = nettoie(w);
  if (!n) return false;
  if (n === 'un' && !dansRun && prev !== 'numéro') return false;
  if (n === 'et') return false;
  return n.split('-').every((p) => p in UNITES || p === 'cent' || p === 'cents' || p === 'mille' || p === 'et');
};
const valeur = (parts: string[]) => {
  let total = 0, cur = 0, prev = '';
  for (const p of parts) {
    if (p === 'et') continue;
    if (p === 'cent' || p === 'cents') cur = (cur || 1) * 100;
    else if (p === 'mille') { total += (cur || 1) * 1000; cur = 0; }
    else if ((p === 'vingt' || p === 'vingts') && prev === 'quatre') cur += 76; // quatre-vingts
    else cur += UNITES[p];
    prev = p;
  }
  return total + cur;
};
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const finPonct = (w: string) => /[.,:;!?]$/.test(w);
const affiche = (w: string) => w.replace(/\b([A-Z])\.(?=[A-Z]\.)/g, '$1').replace(/([A-Z])\.([A-Z])\./g, '$1$2').replace(/[.,:;]+$/, '').replace(/\?$/, '\u00A0?').toUpperCase();

/** Regroupe les nombres dits en lettres (+ « pour cent », « euros ») en un seul bloc chiffré. */
export const blocs = (brut: Mot[]): Bloc[] => {
  const out: Bloc[] = [];
  const mots: Mot[] = [];
  for (const m of brut) {
    if (/^[.,:;!?…]+$/.test(m.texte) && mots.length) {
      const p = mots[mots.length - 1];
      mots[mots.length - 1] = {...p, texte: p.texte + m.texte};
    } else mots.push(m);
  }
  let i = 0;
  while (i < mots.length) {
    const prevW = i > 0 ? nettoie(mots[i - 1].texte) : null;
    if (estNombre(mots[i].texte, prevW, false)) {
      let j = i;
      const parts: string[] = [];
      while (j < mots.length && estNombre(mots[j].texte, j === i ? prevW : null, j > i)) {
        parts.push(...nettoie(mots[j].texte).split('-'));
        j++;
        if (finPonct(mots[j - 1].texte)) break;
      }
      let txt = fmt(valeur(parts));
      if (prevW === 'numéro' && out.length) {
        out[out.length - 1].texte = 'N°' + txt;
        out[out.length - 1].fin = mots[j - 1].fin;
        out[out.length - 1].ponct = finPonct(mots[j - 1].texte);
        i = j;
        continue;
      }
      if (!finPonct(mots[j - 1].texte) && j + 1 < mots.length && nettoie(mots[j].texte) === 'pour' && nettoie(mots[j + 1].texte) === 'cent') {
        txt += ' %';
        j += 2;
      } else if (!finPonct(mots[j - 1].texte) && j < mots.length && /^euros?$/.test(nettoie(mots[j].texte))) {
        txt += ' €';
        j += 1;
      }
      out.push({texte: txt, debut: mots[i].debut, fin: mots[j - 1].fin, ponct: finPonct(mots[j - 1].texte)});
      i = j;
    } else {
      const w = mots[i].texte;
      out.push({texte: nettoie(w) === 'numéro' ? 'N°' : affiche(w), debut: mots[i].debut, fin: mots[i].fin, ponct: finPonct(w)});
      i++;
    }
  }
  return out;
};

/** Groupes de 2 à 4 blocs, coupés à la ponctuation. */
export const groupes = (bs: Bloc[]): Bloc[][] => {
  const gs: Bloc[][] = [];
  let g: Bloc[] = [];
  bs.forEach((b, i) => {
    g.push(b);
    const long = g.reduce((a, x) => a + x.texte.length, 0);
    const reste = bs.length - i - 1;
    if ((g.length >= 3 || long > 16 || (g.length >= 2 && b.ponct)) && reste !== 1) {
      gs.push(g);
      g = [];
    }
  });
  if (g.length) {
    if (g.length === 1 && gs.length && gs[gs.length - 1].length < 4) gs[gs.length - 1].push(...g);
    else gs.push(g);
  }
  return gs;
};

export const SousTitres: React.FC<{mots: Mot[]; t: number; y?: number}> = ({mots, t, y = 1560}) => {
  const gs = React.useMemo(() => groupes(blocs(mots)), [mots]);
  if (!gs.length || t < gs[0][0].debut - 0.05) return null;
  let gi = 0;
  for (let k = 0; k < gs.length; k++) if (t >= gs[k][0].debut - 0.05) gi = k;
  const g = gs[gi];
  const k = pop(t, g[0].debut - 0.05);
  const total = g.reduce((a, b) => a + b.texte.length + 1, 0);
  const fs = total > 22 ? 58 : 70;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `translateY(-50%) scale(${0.9 + 0.1 * k})`, background: '#fff', borderRadius: 40, padding: '10px 34px', maxWidth: 940, boxShadow: '0 8px 0 rgba(43,42,76,.12), 0 14px 26px rgba(43,42,76,.22)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18}}>
        {g.map((b, i) => {
          const actif = t >= b.debut - 0.03 && (t < b.fin + 0.06 || (i === g.length - 1 && t >= b.fin)) && !(g[i + 1] && t >= g[i + 1].debut - 0.03);
          return (
            <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: actif ? ORANGE_ACTIF : INK, whiteSpace: 'nowrap', display: 'inline-block', transform: actif ? 'scale(1.06)' : 'none'}}>
              {b.texte}
            </span>
          );
        })}
      </div>
    </div>
  );
};
