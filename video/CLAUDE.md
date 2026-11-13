# Chati Life · règles de la série (vidéos Remotion)

Format 1080x1920, 30 fps. `npm run render -- epNN` → `out/epNN.mp4` (voix en cache puis vidéo).
Options Remotion après l'épisode, ex. `npm run render -- ep03 --concurrency=2` si la mémoire manque.

## Personnage muet (correction de série)
**À partir de l'épisode 5 (ep05, ep06, …), personnage muet, voix off indépendante ; ep01 à ep04 inchangés.**
- `episode.json` → `"muet": true` (ep05 et suivants) ; transmis à `<Personnage muet />` (défaut `false` = comportement
  des épisodes 1 à 4, bouche synchronisée).
- Personnage muet : aucune animation de parole, aucun visème, aucune bulle de dialogue. Il garde le clignement,
  la respiration et les 6 expressions avec leur bouche **fixe** (sourire, grimace, bouche en « o »…).
- L'expression change aux coupures de scène, selon l'émotion indiquée (une émotion « A puis B » écrite dans le
  script peut basculer sur un mot via `puis`, sans jamais animer la bouche).

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

## Écriture
- **Scène 1 = hook chiffré**, aucune intro ni logo : la première image montre déjà l'action.
- **Dernière scène = appel à l'action lié au sujet** (avis en commentaire, abonnement), jamais de teaser.
- **Un nouveau personnage par épisode** (original), via le composant paramétrable
  `src/components/Personnage.tsx` + une entrée dans `src/personnages.ts`. Même style plat, mêmes animations
  (clignement, respiration, 6 expressions : neutre, content, fier, reveur, perplexe, choque ; bouche fixe dès ep05).
- Correspondance émotion → expression : dépité/agacé/méfiant/soupir/inquiet/curieux/étonné → `perplexe` ;
  choqué/effrayé/alarmé/surpris → `choque` ; concentré/lucide/résigné/posé → `neutre` ;
  fier/confiant/sûr de soi → `fier` ; content/satisfait/complice → `content`.
- **Chiffres écrits en lettres dans le texte lu** (le champ `texte` = ce qui est prononcé, mot pour mot) ;
  les cartes affichent les chiffres en symboles.
- **Sources sur les cartes** (`source`: « Source : … »).
- **Estimations jamais présentées comme officielles** : toute carte qui montre une estimation porte une
  `mention` (« Exemple illustratif : estimations ») et le signe « ≈ » ; les chiffres officiels portent leur source.
- **Exemples signalés** (`mention` : « Exemple illustratif », « Estimation »…). Les hypothèses d'un exemple
  restent visibles à l'écran : champ de plan `hypotheses` (bandeau discret en haut, `\n` = retour à la ligne).
- Aucun logo ni couleur de marque réelle (plateformes, applis, enseignes).
- Étiquettes : `MAIS` rouge ; `ATTENTION`, `PIÈGE N°1/2/3`, `CONSEIL` jaunes à bandes noires ;
  `EN CLAIR`, `TON AVIS`, etc. en aplat coloré.
- Coupures : flash blanc + zoom (sauf la toute première image).
- Une émotion « A puis B » : `expression` = A, `puis: {expression: B, au_mot: "mot"}` (bascule quand la voix
  prononce ce mot).
- Durée visée : 70 à 80 s ; toujours vérifier au ffprobe que le mp4 dépasse 62 s.
- Mot jaune : il est comparé au mot affiché débarrassé de sa ponctuation ; pour un mot élidé, écrire la forme
  affichée (`"l'employeur"`, pas `"employeur"`).
- Chiffre + unité dans un titre de carte : espaces insécables (`1\u00a0897\u00a0€`) pour éviter un « % » orphelin.

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

## Fichiers
- `episodes/epNN/{episode,script}.json` (à la main), `voix.json` + `voix-brute.*` (générés).
- `public/epNN/voix.mp3` : piste jouée par Remotion.
- Enregistrer l'épisode dans `src/episodes.ts`.
- Composants partagés : `src/components/` (Subtitle, Etiquette, ElementVisuel, Decor, Personnage, Objets).
- Ne jamais casser les épisodes précédents : nouveaux champs optionnels, nouveaux types d'éléments plutôt
  que modifier le rendu des anciens.
- **Les mp4 ne sont pas commités** (`out/*.mp4` est dans `.gitignore`).
