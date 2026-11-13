export type Expression = 'neutre' | 'fier' | 'reveur' | 'perplexe' | 'choque' | 'content';

export type Pose = 'debout' | 'velo' | 'assis' | 'pointe_bas';

export type AccessoireSol = 'velo' | 'sablier';

export type Accessoire = 'cravate' | 'gants' | 'telephone' | null;

export type ElementVisuel =
  | {
      type: 'mots_rotatifs';
      /** Mots qui remplacent {mot} dans le texte, un par intervalle. */
      mots: string[];
      /** Secondes entre deux mots (défaut : 1). */
      intervalle?: number;
      /** Accessoire de Max associé à chaque mot (optionnel). */
      accessoires?: Accessoire[];
    }
  | {type: 'compteur_vues'; valeur: number; legende?: string}
  | {type: 'carte_chiffre'; valeur: string; legende?: string; source?: string}
  | {type: 'icone'; nom: 'question' | 'billets' | 'billets_fondent' | 'velo_livraison'}
  /** Carte « avant → après » : l'ancien chiffre barré, le nouveau en gros. */
  | {type: 'carte_evolution'; avant: string; apres: string; legende?: string; mention?: string; source?: string}
  /** Téléphone qui vibre, notification générique (sans logo). */
  | {type: 'notification_telephone'; titre: string; texte?: string}
  /** Barre de temps (1 h) découpée en segments colorés. */
  | {type: 'barre_temps'; titre?: string; segments: {minutes: number; label: string; couleur?: string}[]; mention?: string}
  /** Calcul en chaîne : A → B → C → D, le dernier en jaune. */
  | {type: 'chaine'; etapes: string[]; mention?: string}
  /** Calendrier d'un mois avec une semaine barrée. */
  | {type: 'calendrier_mois'; semaine_barree: number; legende?: string}
  /** Appel à l'action : cœur, bulle de commentaire, bouton « + », l'un après l'autre (sans logo). */
  | {type: 'icones_cta'}
  /** Écran de téléphone vertical : interface stylisée d'une plateforme, ou pub générique si `texte`. */
  | {type: 'ecran_telephone'; plateforme?: 'tiktok' | 'youtube' | 'pub' | string; texte?: string}
  /** Téléphone avec appli bancaire : le solde chute de `depart` à `arrivee`. */
  | {type: 'solde_telephone'; depart: number; arrivee: number; devise?: string}
  /** Schéma en étapes reliées par des flèches (3 icônes). */
  | {type: 'schema'; etapes: {icone: 'vendeuse' | 'fournisseur' | 'client' | string; label: string}[]}
  /** Calcul qui s'écrit terme par terme : "30 € − 14 € = 16 €". */
  | {type: 'calcul'; expression: string; mention?: string}
  /** Calendrier dont les jours défilent, avec un colis qui attend. */
  | {type: 'calendrier'; jours: number}
  /** Notifications qui s'empilent (avis clients, remboursements). */
  | {
      type: 'notifications';
      items: {type: 'avis' | 'remboursement'; titre: string; texte: string; note?: number}[];
    }
  /** Liste à puces cochées une à une. */
  | {type: 'liste'; items: string[]}
  /** Chronomètre qui défile jusqu'à `valeur` ("m:ss"). */
  | {type: 'chrono'; valeur: string}
  /** Jauge horizontale qui se remplit jusqu'à `valeur` %. */
  | {type: 'jauge'; valeur: number; legende?: string};

export type Plan = {
  texte: string;
  decor: string;
  expression: Expression;
  element_visuel: ElementVisuel | null;
  /** Mot (ou groupe de mots) affiché en jaune. "{mot}" = le mot rotatif. */
  mot_jaune: string | null;
  /** Étiquette de pivot : "MAIS", "ATTENTION", … */
  etiquette: string | null;
  /** Durée du plan en secondes. */
  duree: number;
  /** Pose du personnage (défaut : debout). */
  pose?: Pose;
  /** Objet posé au sol à côté du personnage. */
  accessoire_sol?: AccessoireSol | null;
  /** Voix off (ajoutée depuis src/voix.json, pas dans script.json). */
  voix?: Voix | null;
};

export type MotVoix = {texte: string; debut: number; fin: number};

export type Voix = {
  /** Chemin du mp3 dans public/ (null : la scène fait partie d'une piste unique). */
  fichier: string | null;
  texte_lu: string;
  duree_audio: number;
  /** Instants (s) de chaque mot prononcé, depuis l'alignement ElevenLabs. */
  mots: MotVoix[];
};
