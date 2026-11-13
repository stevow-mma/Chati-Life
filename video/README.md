# Chati Life · vidéos cartoon (Remotion)

Format 1080x1920, 30 fps. Toute la vidéo est générée à partir de `script.json`.

```bash
npm install
npm run studio            # aperçu interactif (une composition par épisode)
npm run render            # épisode 1 → out/ep01.mp4
npm run render -- ep02    # épisode 2 → out/ep02.mp4
npm run render -- ep03    # épisode 3 → out/ep03.mp4
npm run render -- ep04    # épisode 4 → out/ep04.mp4
```

## Épisodes

```
episodes/epNN/
  episode.json   titre, personnage, réglages de voix
  script.json    les plans (schéma ci-dessous)
  voix.json      généré par scripts/voix.mjs (timings des mots et des coupes)
public/epNN/     mp3 de la voix off
```

Nouvel épisode : créer `episodes/epNN/{episode,script}.json`, ajouter le personnage dans
`src/personnages.ts` (teint, cheveux, tenue, accessoire de tête, genre), lancer
`node scripts/voix.mjs epNN`, puis ajouter les imports dans `src/episodes.ts`.

### Voix off (ElevenLabs, REST, authentifiée par le proxy réseau)

`episode.json` → `voix.mode` :

- `par_scene` (ep01) : un mp3 par plan ; durée du plan = max(`duree`, audio + 0,3 s).
- `piste_unique` (ep02) : un seul appel pour tout l'épisode, `voice_settings` de `episode.json`.
  Silences de début/fin coupés, `silence_avant` s devant. Chaque plan va de son premier mot au premier
  mot du suivant (le champ `duree` est ignoré) ; le dernier reste `fin_apres_derniere_parole` s.

Cache : hash du texte et des réglages ; rien n'est régénéré s'ils n'ont pas changé.

## script.json

Un tableau de plans. Chaque plan correspond à une coupe (~4 s) :

| champ | rôle |
|---|---|
| `texte` | sous-titre (apparaît mot à mot ; `{mot}` = mot rotatif) |
| `decor` | `studio`, `chambre`, `rue`, `banque`, `bureau`, `salon`, `magasin`, `restaurant` (un autre nom donne un fond uni coloré) |
| `expression` | `neutre`, `content`, `fier`, `reveur`, `perplexe`, `choque` |
| `element_visuel` | `null` ou un objet (voir ci-dessous) |
| `mot_jaune` | mot(s) affichés en jaune, ou `"{mot}"` |
| `etiquette` | étiquette de pivot (`"MAIS"`, `"ATTENTION"`, …) ou `null` |
| `duree` | durée en secondes |
| `pose` | optionnel : `debout` (défaut), `velo` (pédale, vu de face), `assis`, `pointe_bas` |
| `accessoire_sol` | optionnel : `velo` (vélo garé derrière), `sablier` |

Éléments visuels :

- `{"type": "mots_rotatifs", "mots": [...], "intervalle": 1, "accessoires": ["cravate", "gants", "telephone"]}`
- `{"type": "compteur_vues", "valeur": 1000000, "legende": "vues"}`
- `{"type": "carte_chiffre", "valeur": "1 234 €", "legende": "...", "source": "Source : ..."}` (`legende` et `source` optionnels ; `"0,50 $ / 1 000 vues"` → l'unité après ` / ` passe en dessous)
- `{"type": "icone", "nom": "question" | "billets" | "billets_fondent"}`
- `{"type": "ecran_telephone", "plateforme": "tiktok" | "youtube"}`
- `{"type": "chrono", "valeur": "1:00"}`
- `{"type": "jauge", "valeur": 50, "legende": "..."}`
- `{"type": "ecran_telephone", "plateforme": "pub", "texte": "Boutique sans stock"}` (pub générique)
- `{"type": "solde_telephone", "depart": 0, "arrivee": -600, "devise": "€"}`
- `{"type": "schema", "etapes": [{"icone": "vendeuse" | "fournisseur" | "client", "label": "..."}]}`
- `{"type": "calcul", "expression": "30 € − 14 € = 16 €", "mention": "Exemple illustratif"}`
- `{"type": "calendrier", "jours": 21}`
- `{"type": "notifications", "items": [{"type": "avis" | "remboursement", "titre": "...", "texte": "...", "note": 1}]}`
- `{"type": "liste", "items": ["...", "..."]}`
- `{"type": "icone", "nom": "velo_livraison"}`
- carte chiffre : `"A · B"` → une ligne par partie
- `{"type": "carte_evolution", "avant": "11,75 €", "apres": "19 €", "mention": "...", "source": "..."}`
- `{"type": "notification_telephone", "titre": "Nouvelle commande"}`
- `{"type": "barre_temps", "titre": "1 heure connectée", "segments": [{"minutes": 40, "label": "payées", "couleur": "#06D6A0"}], "mention": "..."}`
- `{"type": "chaine", "etapes": ["19 €", "12,70 €", "9 €"], "mention": "..."}` (calcul en chaîne)
- `{"type": "calendrier_mois", "semaine_barree": 2, "legende": "0 € payé"}`
- `{"type": "icones_cta"}` (cœur, commentaire, « + », sans logo)
- calcul : opérateurs `−`, `+`, `×`, `÷`, `=`, `≈` (le résultat après `=` ou `≈` passe en jaune)

Étiquettes colorées : `MAIS`, `ATTENTION`, `PIÈGE N°1/2/3`, `CONSEIL` (jaunes, bandes noires), `TON AVIS`, `RÈGLE N°1`, `EN CLAIR`, `PLAN B`, `POURQUOI`, `SUITE` (toute autre étiquette : violet).

## Structure

- `src/components/Personnage.tsx` : personnage paramétrable (SVG, 6 expressions, clignement, bouche synchronisée) ; presets dans `src/personnages.ts` (Max, Inès, Karim, Manon)
- `src/components/Decor.tsx` : les décors
- `src/components/Objets.tsx` : objets au sol (vélo garé, sablier)

Règles de la série : voir `CLAUDE.md`.
- `src/components/Subtitle.tsx` : sous-titres blancs avec contour noir, mot-clé en jaune
- `src/components/Etiquette.tsx` : étiquettes de pivot
- `src/components/ElementVisuel.tsx` : compteur, cartes de chiffres, icônes
