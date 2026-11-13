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
};
