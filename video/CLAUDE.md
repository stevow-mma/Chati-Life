# Chati Life · règles de la série (vidéos Remotion)

Format 1080x1920, 30 fps. `npm run render -- epNN` → `out/epNN.mp4` (voix en cache puis vidéo).
Options Remotion après l'épisode, ex. `npm run render -- ep03 --concurrency=2` si la mémoire manque.

## Personnage muet (correction de série)
**À partir de l'épisode 5 (ep05 à ep10, …), personnages muets, voix off indépendante ; ep01 à ep04 inchangés.**
L'option `muet` (`episode.json`) s'applique à TOUS les personnages de l'épisode, secondaires compris (ep10).
- `episode.json` → `"muet": true` (ep05 et suivants) ; transmis à `<Personnage muet />` (défaut `false` = comportement
  des épisodes 1 à 4, bouche synchronisée).
- Personnage muet : aucune animation de parole, aucun visème, aucune bulle de dialogue. Il garde le clignement,
  la respiration et les 6 expressions avec leur bouche **fixe** (sourire, grimace, bouche en « o »…).
- L'expression change aux coupures de scène, selon l'émotion indiquée (une émotion « A puis B » écrite dans le
  script peut basculer sur un mot via `puis`, sans jamais animer la bouche).

## MOUVEMENT (règle de série depuis l'épisode 10)
Les personnages ne restent jamais statiques : **chaque scène contient au moins 2 actions visibles** (déplacement, geste,
objet manipulé) et **aucun personnage visible ne reste sans action plus de 1,5 s**. Vérifier avec
`node scripts/verifie-mouvement.mjs epNN` (durées des scènes lues dans `voix.json`). ep01 à ep09 n'ont aucune action :
rendu inchangé (contrôlé au pixel près sur des images témoins).
- Un plan déclare `acteurs` (liste) : le calque `src/components/Acteurs.tsx` remplace alors le personnage seul au centre.
  Sans `acteurs`, comportement d'origine.
- Acteur : `{id, x, y?, echelle?, miroir?, pose?, expression?, nom?, chaise?, accessoire?, actions}` ; `id` = clé de
  `src/personnages.ts` ; `x` = centre (px), `y` = ligne des pieds (défaut 1502), `echelle` défaut 0.78 (deux personnages) ;
  `nom` = étiquette de nom à la première apparition (« Enzo, manager ») ; `chaise` = chaise de bureau à roulettes (avec
  `pose: "assis"`) ; `expression` défaut = celle du plan (avec `puis`).
- Actions `{t, fin?, type, …}` en secondes relatives au début de la scène (`fin` défaut t + 0,6 s ; `objet` : fin de scène).
  - Déplacements : `walkIn` (`from: left|right`, arrivée `x`), `walkOut` (`to`), `walkTo` (`x`, `y`, `echelle` : avancer
    vers la caméra, monter un escalier), `glisse` (sans pas, ex. chaise à roulettes), `recul` (`dx`, recul de surprise),
    `saut` (petits sauts de joie), `miroir` (`valeur`). La marche anime le rebond du corps, les jambes et les bras.
  - Tête et corps : `hoche`, `incline` (`angle`), `hausse` (haussement d'épaules), `expression` (`expression`).
  - Bras articulés (épaule + coude, `cote: l|r|deux`, l = bras à gauche de l'écran) : `pointer` (`cible: haut|cote|bas|avant`),
    `taper` (clavier, deux mains), `compter` (`doigts: [2, 3]`), `tendre`, `saisir`, `serrerMain`, `saluer`, `croiser`,
    `teteMains`, `boire`, `montre` (regarde sa montre), `tapeMain` (tope-là), `pouce`, `ballants`, `sousBras`, `tenir`,
    `ecrire`, `tracer` (tableau blanc), `nuque`, `poing`, `tapeEpaule`, `montrer` (montre son téléphone), `lever` (pancarte).
  - Objets qui suivent la main : paramètre `objet` d'un geste, ou action `objet` (`cote`, `objet`, intervalle) :
    `telephone`, `telephone_b`, `ordinateur`, `contrat`, `papiers`, `stylo`, `feutre`, `tasse`, `billets`, `enveloppe`,
    `cheque` (+ `texte`), `dossier`, `pastille_compte|revenus|contenu`, `pastilles`, `pancarte` (+ `texte`, `\n`),
    `calculatrice`, `sac`.
- Composant `Personnage` : prop optionnelle `mouvement` (marche, angles des bras, objets, tête, épaules, miroir), calculée par
  le calque Acteurs. Absente = rendu des épisodes 1 à 9. Dessins dans `src/components/PersonnageExtras.tsx`.
- `objets_scene` (coordonnées écran, `devant: true` = devant les personnages) : `bureau`, `ordinateur` (`ouvre`, `ferme`,
  `ecran: barres|messages|tableau`), `poste` (bureau + écran de messages génériques sur le côté + clavier), `tableau_blanc`
  (`trace: [début, fin]`), `calculatrice`, `pile_billets` (monte entre `t` et `fin`), `escalier` (`marches: [{label, petit}]`),
  `ecran_mural` (`variante: loi|suspendu`), `pastilles_bureau` (`prises` : instants où chaque pastille est prise).
- Plans avec acteurs : léger travelling horizontal pendant la scène ; la carte glisse depuis le côté et rebondit, dans la
  zone haute (y ≈ 318 à 920), sans couvrir les personnages (têtes sous y ≈ 900 à l'échelle 0.78).
- Personnages secondaires : même composant (muet), apparence différente, actions plus simples.

## Voix (ElevenLabs, REST direct)
- Voix « Guillaume - Narrator », `voice_id` `ohItIVrXTBI80RrUECOD`. **Ne jamais changer de voix.**
- Modèle `eleven_multilingual_v2`, format `mp3_44100_128`.
- `voice_settings` : stability 0.35, similarity_boost 0.8, style 0.45, use_speaker_boost true, speed 1.0.
- Authentification ajoutée par le proxy réseau : aucune clé, aucun en-tête `xi-api-key`, pas de SDK.
- **Une seule piste par épisode** : les textes lus mis bout à bout (séparés par un espace), en UN appel
  `POST /v1/text-to-speech/{voice_id}/with-timestamps`. Pas d'appel de test. 2 essais max ; en cas
  d'échec, rapporter l'erreur exacte.
- Silences de début et de fin supprimés ; **0,4 s avant la première parole**.
- Chaque scène commence au premier mot de son texte et dure jusqu'au premier mot de la suivante
  (pas de durée minimale, pas de marge) ; la piste est jouée une fois, en continu.
- **Image finale : la dernière scène reste 3 s après la dernière parole.**
- Sous-titres mot à mot et mot jaune calés sur `alignment` (ep01 à ep04 : la bouche aussi ; ep05+ : jamais la bouche).
- Cache : hash (texte + réglages). `scripts/voix.mjs` ne rappelle pas l'API si rien n'a changé.
- **Sigles épelés pour la voix (depuis ep10)** : champ de plan `texte_voix` = texte prononcé (« O.F. », « B.N.C. »,
  « B.I.C. »), `texte` = texte affiché (« OF », « BNC », « BIC », sous-titres compris). Même nombre de mots dans les deux.

## Écriture
- **Scène 1 = hook chiffré**, aucune intro ni logo : la première image montre déjà l'action.
- **Dernière scène = appel à l'action lié au sujet** (avis en commentaire, abonnement), jamais de teaser.
- **Un nouveau personnage par épisode** (original), via le composant paramétrable
  `src/components/Personnage.tsx` + une entrée dans `src/personnages.ts`. Même style plat, mêmes animations
  (clignement, respiration, 6 expressions : neutre, content, fier, reveur, perplexe, choque ; bouche fixe dès ep05).
- Correspondance émotion → expression : dépité/agacé/méfiant/soupir/inquiet/curieux/étonné → `perplexe` ;
  choqué/effrayé/alarmé/surpris → `choque` ; concentré/lucide/résigné/posé → `neutre` ;
  fier/confiant/sûr de soi/déterminé → `fier` ; content/satisfait/complice/enthousiaste → `content` ; réfléchi/sérieux → `neutre`.
- **Chiffres écrits en lettres dans le texte lu** (le champ `texte` = ce qui est prononcé, mot pour mot) ;
  les cartes affichent les chiffres en symboles.
- **Sources sur les cartes** (`source`: « Source : … »).
- **Estimations jamais présentées comme officielles** : toute carte qui montre une estimation porte une
  `mention` (« Exemple illustratif : estimations ») et le signe « ≈ » ; les chiffres officiels portent leur source.
- **Exemples signalés** (`mention` : « Exemple illustratif », « Estimation »…). Les hypothèses d'un exemple
  restent visibles à l'écran : champ de plan `hypotheses` (bandeau discret en haut, `\n` = retour à la ligne).
- Aucun logo ni couleur de marque réelle (plateformes, applis, enseignes, constructeurs automobiles).
- **Aucun logo existant sur les cartes ou les écrans** (depuis ep09) : pas de logo de moteur de recherche, de service de
  cartes, d'assureur, de banque, de réseau social… Même si le texte lu nomme un service (« fiche Google »), l'écran montre
  une interface générique (`fiche_entreprise`, `carte_quartier`). Voitures : silhouettes génériques, sans logo ni plaque lisible.
- Étiquettes : `MAIS` rouge ; `ATTENTION`, `PIÈGE N°1/2/3`, `CONSEIL` jaunes à bandes noires ;
  **`LEVIER N°1` à `LEVIER N°5` fond vert, texte blanc, bandes noires** (même style que PIÈGE, depuis ep07 ; N°4 et N°5
  depuis ep08) ;
  `RÈGLE N°1`, `EN CLAIR`, `POURQUOI`, `TON AVIS`, etc. en aplat coloré. Nouvelle étiquette : l'ajouter dans
  `src/components/Etiquette.tsx` (`COULEURS`, et `RAYEES` si elle est à bandes).
- Ton : depuis ep07, privilégier les stratégies concrètes et les conseils utiles (moins d'avertissements) ;
  le personnage peut finir content et plein d'énergie. ep08 : même ton, **une seule étiquette ATTENTION** dans l'épisode.
  ep09 : ton optimiste (le calcul d'abord, puis cinq leviers concrets), **un seul ATTENTION et un seul CONSEIL**.
- Hypothèses et estimations : les marquer « Hypothèse » ou « Estimation » sur la carte (`mention`, `petit` ou `source`).
- Coupures : flash blanc + zoom (sauf la toute première image).
- Une émotion « A puis B » : `expression` = A, `puis: {expression: B, au_mot: "mot"}` (bascule quand la voix
  prononce ce mot).
- Durée visée : 70 à 80 s (le texte imposé et la vitesse 1.0 peuvent donner un peu plus : ep09 ≈ 84 s, ep10 ≈ 85 s) ; toujours vérifier au ffprobe que le mp4 dépasse 62 s.
- Mot jaune : il est comparé au mot affiché débarrassé de sa ponctuation ; pour un mot élidé, écrire la forme
  affichée (`"l'employeur"`, pas `"employeur"`). Si le mot revient plusieurs fois, `mot_jaune_rang` (1 = première
  occurrence) n'en colore qu'une (sinon toutes).
- Chiffre + unité dans un titre de carte : espaces insécables (`1\u00a0897\u00a0€`) pour éviter un « % » orphelin.

## Sujets sensibles (depuis ep08 : revenus de créatrice sur plateforme d'abonnement)
- **Exception ep10 (demandée)** : « OF » peut être écrit dans les sous-titres, cartes et étiquettes (prononcé « O.F. »).
  **Jamais le vrai logo** : seulement la pastille générique `PastilleOF` (carré arrondi jaune de la série, lettres « OF » en
  texte simple, police de la série) ; aucun autre logo de marque réel ; autres plateformes = « A » et « B » génériques.
  Écrans de téléphone : icônes neutres et bulles de message génériques uniquement. Tous les personnages sont adultes,
  entièrement habillés, gestes banals (téléphone, café, contrat, stylo, geste de la main).
- **Ne nommer aucune plateforme précise** (sauf l'exception ci-dessus) : écrire « plateforme » / « plateforme d'abonnement », dans le texte lu comme
  sur les cartes (les sources peuvent citer un média ou un site de statistiques, jamais la plateforme).
- **Aucun visuel suggestif** : jamais d'écran, d'image ou de pose suggestive ; l'épisode parle de finances, pas du
  contenu vendu. On montre seulement le matériel (smartphone sur trépied, ring light, ordinateur portable avec
  graphiques ou chiffres) et des cartes de chiffres. Tenue du personnage neutre et entièrement couverte.

## Personnages déjà utilisés (ne pas refaire un look proche)
- ep01 Max : casquette rouge, sweat turquoise, mèches châtain.
- ep02 Inès : chignon bouclé, lunettes rondes dorées, haut corail, créoles dorées.
- ep03 Karim : casque de vélo blanc, veste marine à bandes, barbe, sac de livraison.
- ep04 Manon : carré noir lisse à frange, sweat à capuche oversize vert forêt, créoles argentées,
  smartphone en main gauche (`telephone`), tote bag de jeans (`objet_main: "tote_jeans"`).
- ep05 Julien (muet) : roux, cheveux courts en épi (`court_dessus`), taches de rousseur (`rousseur`), T-shirt gris
  anthracite manches courtes (`tshirt`), pantalon de travail gris à poches orange (`poches`), ceinture porte-outils
  (`ceintureOutils`), lunettes de protection relevées (`tete: lunettes_protection`), tournevis testeur en poche (`testeur`).
- ep06 Awa (muette) : peau brun foncé, afro puff haut (`afro_puff`) tenu par un bandeau violet (`bandeau`), clous d'oreilles
  dorés (`clous`), tunique de caisse bordeaux manches courtes (`tenue.tunique`) avec badge prénom (`badge`), pantalon noir,
  ceinture-pochette (`ceinturePochette`).
- ep07 Mehdi (muet) : peau brun clair, cheveux brun foncé ondulés, mèche relevée, côtés en dégradé (`ondule_meche`),
  pas de barbe, T-shirt gris chiné (`tenue.tshirt` + `tenue.chine`), gilet de sécurité vert fluo à bandes grises
  (`gilet`), badge vierge sur cordon (`cordonBadge`), douchette de scan générique à la ceinture (`douchette`),
  pantalon de travail noir, baskets blanches.
- ep08 Jade (muette) : peau claire, cheveux blond cendré en queue-de-cheval haute avec frange (`queue_frange`, sourcils
  plus foncés `sourcils`), petites boucles d'oreilles en perles (`perles`), pull oversize bleu ciel en maille
  (`tenue.oversize` + `tenue.pull`), jean droit bleu délavé (`tenue.jean` = couleur des surpiqûres), baskets blanches,
  casque audio générique autour du cou (`casqueCou`).
- ep09 Théo (muet) : peau mate, rasé de près, cheveux noirs courts en dégradé (`degrade`) sous une casquette noire portée à
  l'envers sans logo (`tete: casquette` + `envers: true`), combinaison de travail turquoise (`tenue.combinaison`, bas = haut)
  aux manches retroussées (`tenue.retroussees`) avec traces de mousse (`tenue.mousse`), gants en nitrile bleu clair
  accrochés à la ceinture (`gantsCeinture`), baskets blanches.

- ep10 Enzo (muet), manager, 27 ans : peau claire, cheveux châtain clair plaqués en arrière au gel (`gomine`), barbe de trois
  jours taillée, aviateurs relevés dans les cheveux (`tete: aviateur`), chemise blanche (`tenue.chemise`) manches retroussées
  sous une doudoune sans manches kaki (`doudoune`), jean noir, baskets blanches, montre argentée (`montre`, visible avec les
  bras articulés), écouteurs tour de cou (`ecouteursCou`) ; ordinateur portable et deux smartphones (objets tenus).
- ep10 secondaires : Luna, 22 ans (`luna` : longs cheveux bouclés châtain clair à mèches caramel `long_boucle` + `meches`,
  sweat oversize lilas `tenue.sweat`, jean droit, baskets blanches, petit sac à dos `petitSac`) ; deux chatteurs
  (`chatteur_a`, `chatteur_b`, silhouettes simples assises) ; un comptable (`comptable` : cheveux gris, lunettes rondes,
  `accessoire: "cravate"`, dossier sous le bras).

## Éléments visuels réutilisables (en plus de ceux du README)
- `carte_texte` (titre, surtitre, indices, petit, illustration `enveloppe_batiment` | `appli_cintre`, mention, source).
- `compteur_tampon` (compteur + tampon au passage d'un seuil), `calcul_lignes` (calcul posé ligne par ligne).
- `liste` avec `deja` (suite d'une checklist), `chaine` avec `barrer: false`.
- Objets au sol (un ou plusieurs) : `velo`, `sablier`, `pile_vetements`, `veste_cintre`, `portant_jeans`.
- Poses : `debout`, `velo`, `assis`, `pointe_bas`, `photo` (photographie avec le téléphone), `tire_cable` (tire un
  câble sorti du mur, à placer dans le décor `chantier`).
- Décor `chantier` : salon en rénovation, mur ouvert avec gaines, tableau électrique ouvert, escabeau, bâche.
- Objets au sol : `camionnette` (blanche, sans logo), `perceuse`. Objet en main : `devis` (devis papier).
- Éléments ep05 : `carte_transformation` (une valeur se retourne en une autre sur `au_mot`), `jauge_heures`
  (h travaillées → h facturées + icônes devis/trajets/achats), `calculette`, `barre_ponction` (tranche rouge qui se
  détache sur `au_mot`), `barre_retrecit`, `jauge_plafond` ; `calcul_lignes.ecart` (s entre deux lignes).
- `au_mot` d'un élément visuel : l'animation se déclenche quand la voix prononce ce mot.
- Décor `magasin_caisse` (ep06) : le magasin avec panneau « CAISSE 3 » à la place de l'affiche et sans la petite
  caisse ; à combiner avec l'objet `caisse_tapis` (devant le personnage : tapis roulant, vitre de scanner qui bipe,
  écran TOTAL) et la pose `scanne` (article générique glissé au-dessus du scanner, cycle `CYCLE_SCAN`).
- Pose `regarde_telephone` (téléphone avec appli bancaire générique). Objet au sol `billets_pieces` (billets et pièces génériques).
- Éléments ep06 : `face_a_face` (deux montants, le droit sur `au_mot`), `carte_hausse` (avant → après + pastille d'écart
  sur `au_mot`), `fiche_paie` (lignes `cle/label/valeur` ; `allumer: [{cle, au_mot}]` une à une, `surligne`, `gros_plan`
  avec montant qui clignote), `barre_empilee` (`animation`: `decoupe` | `empile` | `hachure`, segments
  `{label, montant, couleur, hachure?, texte?}`) ; `carte_chiffre.mention`.
- Décor `entrepot` (ep07) : rayonnages métalliques et cartons vierges, sol béton à marquage jaune, transpalette jaune
  (à gauche), quai de chargement au fond (porte relevée, remorque blanche sans marque), néons.
- Objets au sol ep07 : `chariot_cartons` (devant, à droite ; à combiner avec la pose `pousse`),
  `silhouette_responsable` (silhouette sans visage à droite, avec tablette : responsable ou manager).
- Poses ep07 : `pousse` (pousse le chariot), `pouce` (pouce levé), `poing` (poing serré levé).
- Éléments ep07 : `puce` (pastille + `mention`), `tampon` (ex. « FACULTATIVE », `petit` dessous),
  `telephone_simulation` (smartphone générique : barre de progression puis résultat sur `au_mot` ; `puce` à côté,
  `\n` = retour à la ligne), `chaine_fleches` (étapes verticales `{label, sens: haut|bas, petit?}`) ;
  `face_a_face.symbole` (défaut « ≠ ») et `face_a_face.positif` (colonne droite verte) ; `carte_chiffre.petit`.
- Objets au sol ep08 : `trepied_ring_light` (à gauche : trépied, smartphone générique dans une ring light),
  `bureau_ordinateur` (devant, à droite : petit bureau, ordinateur portable avec graphique en barres) ; ensemble =
  coin bureau de créatrice, à combiner avec le décor `chambre`.
- Éléments ep08 : `puce.suite` + `au_mot` (seconde puce qui claque dessous), `face_a_face.neutre` (deux options à
  comparer, colonnes bleues), `abonnements_calendrier` (`pastilles: [{texte, au_mot}]`, 12 mois cochés un à un, `titre`
  sur `au_mot`), `enveloppes` (`gauche`, `droite` sur `au_mot`, `texte`, `mention`), `contrat_ordinateur` (`titre`,
  ligne `surligne` surlignée sur `au_mot`, `petit`, `source`).
- Décor `parking` (ep09) : parking couvert d'immeuble résidentiel (plafond béton, néons, gaines, mur à bande bleue,
  piliers numérotés B2/B3 à bandes jaune et noir, places tracées au sol, flèche, panneau « SORTIE », deux voitures garées
  de face, génériques, plaques vierges).
- Objets au sol ep09 : `berline` (berline générique de profil, derrière à gauche), `berline_rue` (berline blanche, à droite,
  tournée vers le personnage), `citadine` (citadine orange, derrière à gauche), `kit_nettoyage` (devant à droite :
  aspirateur eau/poussière, seau mousseux, microfibres, pulvérisateur), `siege_auto` (à droite : portière ouverte et
  banquette dont les taches s'effacent ; à combiner avec la pose `extracteur`).
- Poses ep09 : `deballe` (microfibre pliée tenue à deux mains), `retrousse` (retrousse sa manche), `tape` (mains sur le clavier
  de `bureau_ordinateur`), `extracteur` (suceur d'extracteur sur `siege_auto`), `serre_main` (serre la main de
  `silhouette_responsable`), `pulverise` (pulvérisateur « SANS EAU » vers la droite + microfibre).
- Éléments ep09 : `carte_quartier` (carte de quartier générique, 3 punaises regroupées, trait court sur `au_mot`, `chip`),
  `fiche_entreprise` (smartphone générique : `recherche` tapée, fiche `nom`/`activite` avec 5 étoiles, photos avant/après
  sur `au_mot`, `mention`).

- Décor `coworking` (ep10) : open space lumineux, grandes baies vitrées sur la ville, suspensions, bureaux partagés au fond
  (écrans génériques), plantes (grande plante en pot, plante suspendue), parquet clair.
- Étiquettes déjà disponibles : `LEVIER N°1` à `N°5` (fond vert, texte blanc, bandes noires), `CONSEIL` / `ATTENTION`
  (jaune à bandes noires), `MAIS`, `RÈGLE N°1`, `EN CLAIR`, `TON AVIS`.
- Éléments ep10 (`src/components/ElementsEp10.tsx`, glissent et rebondissent) : `cartes_successives` (cartes chiffrées une
  par `au_mot`, `alerte`, `pastille: "OF"`), `cascade` (lignes qui tombent une à une, `resultat`, `negatif`, `definition`,
  `hypotheses`, `petit`), `contrat_cases` (cases cochées sur `au_mot`), `carte_taux`, `profils_comptes`, `tableau_bord`
  (tuiles, `jauge`), `compte_suspendu` (puis plateformes génériques A/B sur `au_mot`), `verrous` (pastilles verrouillées sur
  une destination). `au_mot: "mille#2"` = 2e occurrence du mot dans le plan.

## Fichiers
- `episodes/epNN/{episode,script}.json` (à la main), `voix.json` + `voix-brute.*` (générés).
- `public/epNN/voix.mp3` : piste jouée par Remotion.
- Enregistrer l'épisode dans `src/episodes.ts`.
- Composants partagés : `src/components/` (Subtitle, Etiquette, ElementVisuel, Decor, Personnage, Objets).
- Ne jamais casser les épisodes précédents : nouveaux champs optionnels, nouveaux types d'éléments plutôt
  que modifier le rendu des anciens.
- **Les mp4 ne sont pas commités** (`out/*.mp4` est dans `.gitignore`).
