export type Expression = 'neutre' | 'fier' | 'reveur' | 'perplexe' | 'choque' | 'content';

export type Pose = 'debout' | 'velo' | 'assis' | 'pointe_bas' | 'photo' | 'tire_cable';

export type AccessoireSol = 'velo' | 'sablier' | 'pile_vetements' | 'veste_cintre' | 'portant_jeans' | 'camionnette' | 'perceuse';

/** Objet porté à la main (ep04). */
export type ObjetMain = 'tote_jeans' | 'devis';

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
  | {type: 'chaine'; etapes: string[]; mention?: string; source?: string; /** false : la première étape n'est pas barrée (défaut : barrée). */ barrer?: boolean}
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
  | {type: 'liste'; items: string[]; /** Nombre d'items déjà cochés au début du plan (suite d'une checklist). */ deja?: number; titre?: string}
  /** Carte de texte : titre en gros, puces/indices qui apparaissent un à un, petite précision, illustration. */
  | {
      type: 'carte_texte';
      titre: string;
      /** Sous-titre au-dessus du titre (petit, gris). */
      surtitre?: string;
      /** Pastilles qui apparaissent une à une sous le titre. */
      indices?: string[];
      /** Petite précision en italique sous le titre. */
      petit?: string;
      illustration?: 'enveloppe_batiment' | 'appli_cintre';
      mention?: string;
      source?: string;
    }
  /** Compteur qui monte jusqu'à `cible`, puis tampon (ex. « 30 dépassé ») quand il passe `seuil`. */
  | {type: 'compteur_tampon'; cible: number; seuil: number; tampon: string; unite?: string; legende?: string; mention?: string}
  /** Calcul posé ligne par ligne (label · valeur), la dernière ligne surlignée. `ecart` : s entre deux lignes (défaut 1,1). */
  | {type: 'calcul_lignes'; lignes: {label: string; valeur: string}[]; mention?: string; source?: string; ecart?: number}
  /** Chronomètre qui défile jusqu'à `valeur` ("m:ss"). */
  | {type: 'chrono'; valeur: string}
  /** Jauge horizontale qui se remplit jusqu'à `valeur` %. */
  | {type: 'jauge'; valeur: number; legende?: string}
  /** Carte qui se retourne : `avant` (ex. « 75 €/h au devis ») devient `apres` quand la voix dit `au_mot`. */
  | {type: 'carte_transformation'; avant: string; avant_legende?: string; apres: string; apres_legende?: string; au_mot?: string; mention?: string}
  /** Jauge d'heures : `total` h travaillées, dont seulement `facturees` h facturées ; icônes du temps non facturé. */
  | {type: 'jauge_heures'; total: number; facturees: number; icones?: {nom: 'devis' | 'trajets' | 'achats'; label: string}[]; mention?: string; source?: string}
  /** Calculette animée : l'opération se tape sur l'écran, puis le résultat. */
  | {type: 'calculette'; operation: string; resultat: string; legende?: string; mention?: string}
  /** Barre de chiffre d'affaires dont une tranche rouge (`part`, 0..1) se détache quand la voix dit `au_mot`. */
  | {type: 'barre_ponction'; titre?: string; calcul: string; part: number; barre?: string; tranche?: string; au_mot?: string; source?: string}
  /** Barre qui rétrécit de `depart` à `arrivee` (même unité) quand la voix dit `au_mot`. */
  | {type: 'barre_retrecit'; depart: number; arrivee: number; unite: string; legende_depart?: string; legende_arrivee?: string; au_mot?: string; mention?: string}
  /** Jauge jusqu'à un plafond : remplissage jusqu'à `valeur`, repère au `plafond`, zone rouge au-delà. */
  | {type: 'jauge_plafond'; titre: string; plafond: number; valeur: number; label_valeur?: string; petit?: string; source?: string};

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
  accessoire_sol?: AccessoireSol | AccessoireSol[] | null;
  /** Objet porté à la main droite (ex. tote bag rempli de jeans). */
  objet_main?: ObjetMain | null;
  /** Changement d'expression en cours de plan, quand la voix prononce `au_mot` (ex. « contente puis inquiète »). */
  puis?: {expression: Expression; au_mot: string} | null;
  /** Bandeau discret en haut de l'écran rappelant les hypothèses d'un exemple chiffré. */
  hypotheses?: string | null;
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
