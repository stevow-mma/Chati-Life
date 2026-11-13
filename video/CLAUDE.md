# Chati Life · règles de la série (vidéos Remotion)

Format 1080x1920, 30 fps. `npm run render -- epNN` → `out/epNN.mp4` (voix en cache puis vidéo).
Options Remotion après l'épisode, ex. `npm run render -- ep03 --concurrency=2` si la mémoire manque.

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
- Sous-titres mot à mot, mot jaune et bouche du personnage calés sur `alignment`.
- Cache : hash (texte + réglages). `scripts/voix.mjs` ne rappelle pas l'API si rien n'a changé.

## Écriture
- **Scène 1 = hook chiffré**, aucune intro ni logo : la première image montre déjà l'action.
- **Dernière scène = appel à l'action lié au sujet** (avis en commentaire, abonnement), jamais de teaser.
- **Un nouveau personnage par épisode** (original), via le composant paramétrable
  `src/components/Personnage.tsx` + une entrée dans `src/personnages.ts`. Même style plat, mêmes animations
  (clignement, respiration, bouche, 6 expressions : neutre, content, fier, reveur, perplexe, choque).
- **Chiffres écrits en lettres dans le texte lu** (le champ `texte` = ce qui est prononcé, mot pour mot) ;
  les cartes affichent les chiffres en symboles.
- **Sources sur les cartes** (`source`: « Source : … »).
- **Exemples signalés** (`mention` : « Exemple illustratif », « Estimation »…).
- Aucun logo ni couleur de marque réelle (plateformes, applis, enseignes).
- Étiquettes : `MAIS` rouge ; `ATTENTION`, `PIÈGE N°1/2/3`, `CONSEIL` jaunes à bandes noires ;
  `EN CLAIR`, `TON AVIS`, etc. en aplat coloré.
- Coupures : flash blanc + zoom (sauf la toute première image).

## Fichiers
- `episodes/epNN/{episode,script}.json` (à la main), `voix.json` + `voix-brute.*` (générés).
- `public/epNN/voix.mp3` : piste jouée par Remotion.
- Enregistrer l'épisode dans `src/episodes.ts`.
- Composants partagés : `src/components/` (Subtitle, Etiquette, ElementVisuel, Decor, Personnage, Objets).
- Ne jamais casser les épisodes précédents : nouveaux champs optionnels, nouveaux types d'éléments plutôt
  que modifier le rendu des anciens.
- **Les mp4 ne sont pas commités** (`out/*.mp4` est dans `.gitignore`).
