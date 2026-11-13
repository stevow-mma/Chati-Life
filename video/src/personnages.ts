import type {Apparence} from './components/Personnage';

/**
 * Personnages des épisodes. Pour un nouvel épisode : ajouter une entrée ici,
 * puis la référencer dans episodes/<ep>/episode.json → "personnage".
 */
export const PERSONNAGES: Record<string, Apparence> = {
  /** Max — 20 ans, casquette rouge, très naïf (épisode 1). */
  max: {
    nom: 'Max',
    genre: 'homme',
    teint: {peau: '#F5C29A', ombre: '#E7A97C', joues: '#F28482'},
    cheveux: {style: 'meches', couleur: '#6B3E26'},
    tenue: {haut: '#2EC4B6', hautOmbre: '#22A094', bas: '#3A5A8C', chaussures: 'white', bandeChaussures: '#E63946'},
    tete: {type: 'casquette', couleur: '#E63946', couleurOmbre: '#B5202D', initiale: 'M'},
  },
  /** Inès — 24 ans, vendeuse (épisode 2). */
  ines: {
    nom: 'Inès',
    genre: 'femme',
    teint: {peau: '#C68B59', ombre: '#A86F42', joues: '#E07A5F'},
    cheveux: {style: 'chignon_boucle', couleur: '#4A2C1D'},
    tenue: {haut: '#FF7F6B', hautOmbre: '#E3604D', bas: '#3D5A80', chaussures: 'white', bandeChaussures: '#E9ECEF'},
    tete: {type: 'lunettes_rondes', couleur: '#D4A017'},
    boucles: '#F2C14E',
  },
  /** Karim — 27 ans, livreur à vélo (épisode 3). Aucun logo ni couleur de marque. */
  karim: {
    nom: 'Karim',
    genre: 'homme',
    teint: {peau: '#D2A06E', ombre: '#B07F50', joues: '#D9826A'},
    cheveux: {style: 'court', couleur: '#17171C'},
    tenue: {haut: '#1F2A4D', hautOmbre: '#141C36', bas: '#1E1E24', chaussures: 'white', bandeChaussures: '#DEE2E6', bandes: '#B8BEC6'},
    tete: {type: 'casque_velo', couleur: '#FFFFFF', couleurOmbre: '#DDE1E6'},
    barbe: '#17171C',
    sac: {couleur: '#B5452F', ombre: '#8E3322'},
    velo: '#2D6A4F',
  },
  /** Manon — 23 ans, étudiante qui vend ses vêtements en ligne (épisode 4). Aucun logo ni couleur de marque. */
  manon: {
    nom: 'Manon',
    genre: 'femme',
    teint: {peau: '#E2BD93', ombre: '#C69D72', joues: '#D98A76'},
    cheveux: {style: 'carre_frange', couleur: '#141418'},
    tenue: {haut: '#2F5D3A', hautOmbre: '#234A2C', bas: '#2B3A55', chaussures: '#F4EDE1', bandeChaussures: '#1F3B2A', capuche: true, oversize: true},
    tete: null,
    boucles: '#C9CED6',
    telephone: '#E8E4F0',
  },
  /** Julien — 29 ans, électricien indépendant (épisode 5). Aucun logo ni couleur de marque. */
  julien: {
    nom: 'Julien',
    genre: 'homme',
    teint: {peau: '#F8DCC4', ombre: '#E8BFA0', joues: '#F2A08B'},
    cheveux: {style: 'court_dessus', couleur: '#C8501E'},
    tenue: {
      haut: '#3A3F47',
      hautOmbre: '#2B2F35',
      bas: '#7D858F',
      chaussures: '#6B4A2B',
      bandeChaussures: '#3E2A18',
      tshirt: true,
      poches: '#F77F00',
    },
    tete: {type: 'lunettes_protection', couleur: '#F1F3F5', elastique: '#495057'},
    rousseur: '#B5562B',
    ceintureOutils: {couleur: '#9C6B3C', ombre: '#7A5230'},
    testeur: '#E63946',
  },
  /** Awa — 31 ans, caissière (épisode 6). Aucun logo ni couleur de marque. */
  awa: {
    nom: 'Awa',
    genre: 'femme',
    teint: {peau: '#6B4226', ombre: '#4E2E19', joues: '#A0524A'},
    cheveux: {style: 'afro_puff', couleur: '#1A1210'},
    tenue: {
      haut: '#7B1E3A',
      hautOmbre: '#5C1429',
      bas: '#1C1C22',
      chaussures: '#2B2B33',
      bandeChaussures: '#E9ECEF',
      tunique: true,
    },
    tete: null,
    bandeau: '#7B4FC9',
    clous: '#F2C14E',
    badge: {texte: 'AWA', couleur: '#7B1E3A'},
    ceinturePochette: {couleur: '#2B2B33', ombre: '#16161B'},
  },
};
