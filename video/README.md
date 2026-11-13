# Chati Life · vidéos cartoon (Remotion)

Format 1080x1920, 30 fps. Toute la vidéo est générée à partir de `script.json`.

```bash
npm install
npm run studio    # aperçu interactif
npm run render    # rendu → out/prototype.mp4
```

## script.json

Un tableau de plans. Chaque plan correspond à une coupe (~4 s) :

| champ | rôle |
|---|---|
| `texte` | sous-titre (apparaît mot à mot ; `{mot}` = mot rotatif) |
| `decor` | `studio`, `chambre`, `rue`, `banque` (un autre nom donne un fond uni coloré) |
| `expression` | `neutre`, `content`, `fier`, `reveur`, `perplexe`, `choque` |
| `element_visuel` | `null` ou un objet (voir ci-dessous) |
| `mot_jaune` | mot(s) affichés en jaune, ou `"{mot}"` |
| `etiquette` | étiquette de pivot (`"MAIS"`, `"ATTENTION"`, …) ou `null` |
| `duree` | durée en secondes |

Éléments visuels :

- `{"type": "mots_rotatifs", "mots": [...], "intervalle": 1, "accessoires": ["cravate", "gants", "telephone"]}`
- `{"type": "compteur_vues", "valeur": 1000000, "legende": "vues"}`
- `{"type": "carte_chiffre", "valeur": "1 234 €", "legende": "...", "source": "Source : ..."}`
- `{"type": "icone", "nom": "question" | "billets"}`

## Structure

- `src/components/Max.tsx` : le personnage (SVG, expressions, clignement, bouche qui parle)
- `src/components/Decor.tsx` : les décors
- `src/components/Subtitle.tsx` : sous-titres blancs avec contour noir, mot-clé en jaune
- `src/components/Etiquette.tsx` : étiquettes de pivot
- `src/components/ElementVisuel.tsx` : compteur, cartes de chiffres, icônes
