#!/usr/bin/env python3
"""Génère episodes/ep18/script.json ; actions calées sur les durées de voix.json (si présent)."""
import json, os
D0 = os.path.join(os.path.dirname(__file__), '..', 'episodes', 'ep18')
durees = {}
vp = os.path.join(D0, 'voix.json')
if os.path.exists(vp):
    v = json.load(open(vp))
    deb = [sc['debut'] for sc in v['scenes']] + [v['fin']]
    durees = {i: deb[i + 1] - deb[i] for i in range(len(v['scenes']))}
EXTRA_FIN = float(os.environ.get('EXTRA_FIN', '0'))

def chaine(D, seq, t0=0.0, gap=0.05):
    """Enchaîne les gestes de `seq` (cycliques) de t0 à D, sans trou > gap."""
    out, t, i = [], t0, 0
    while t < D - 0.2:
        typ, dur, kw = seq[i % len(seq)]
        fin = min(D, t + dur)
        a = {'t': round(t, 2), 'fin': round(fin, 2), 'type': typ}; a.update(kw)
        out.append(a); t = fin + gap; i += 1
    return out

def obj(objet, t=0, fin=None, cote='r', **kw):
    a = {'t': t, 'type': 'objet', 'objet': objet, 'cote': cote}
    if fin is not None: a['fin'] = round(fin, 2)
    a.update(kw); return a

S = []
def scene(**p): S.append(p)

# 1
scene(texte="Nolan, dix-huit ans, surfe sur GTA six et encaisse huit cents euros par mois. Il lui reste environ cinq cent cinquante euros.",
      texte_voix="Nolan, dix-huit ans, surfe sur G.T.A. six et encaisse huit cents euros par mois. Il lui reste environ cinq cent cinquante euros.",
      decor="setup_gaming", expression="content", mot_jaune="reste", etiquette=None,
      puis={"expression": "choque", "au_mot": "cinq"},
      element_visuel={"type": "cartes_successives", "cartes": [
          {"valeur": "800 €", "legende": "encaissés par mois", "au_mot": "huit"},
          {"valeur": "≈ 550 €", "legende": "qui restent", "au_mot": "reste", "alerte": True}],
          "mention": "Exemple illustratif"},
      _acteurs=lambda D: [
          {"id": "nolan_casque", "x": 300, "pose": "assis", "chaise": "#212529", "nom": "Nolan, 18 ans, streamer",
           "actions": chaine(D * 0.62, [("manette", 1.2, {"objet": "manette"}), ("lever", 0.7, {"cote": "deux"}), ("manette", 1.0, {"objet": "manette"}), ("incline", 0.7, {"angle": 10})])
                      + [{"t": round(D * 0.62, 2), "fin": round(D * 0.62 + 0.7, 2), "type": "incline", "angle": -12},
                         {"t": round(D * 0.62 + 0.75, 2), "fin": round(D * 0.62 + 1.4, 2), "type": "recul", "dx": -30},
                         {"t": round(D * 0.62 + 1.45, 2), "fin": round(D, 2), "type": "hausse"}]}],
      objets_scene=lambda D: [{"type": "ecran_jeu", "x": 790, "y": 1250, "largeur": 500, "hauteur": 290, "t": 0, "fin": D, "labels": ["140", "860"]}])
# 2
scene(texte="Trois sources : TikTok, quatre cent cinquante euros ; YouTube, deux cent cinquante ; Twitch, cent.",
      decor="chambre", expression="neutre", mot_jaune="sources", etiquette=None,
      element_visuel={"type": "carte_taux", "titre": "3 sources = 800 € par mois", "lignes": [
          {"label": "TikTok : 750 000 vues × 0,60 € pour 1 000 vues", "valeur": "450 €", "au_mot": "tiktok"},
          {"label": "YouTube : 125 000 vues × 2 € pour 1 000 vues", "valeur": "250 €", "au_mot": "youtube"},
          {"label": "Twitch : 20 abonnés × 2,50 € + bits et pubs ≈ 50 €", "valeur": "100 €", "au_mot": "twitch"}],
          "petit": "Total : 450 € + 250 € + 100 € = 800 €",
          "mention": "Hypothèse : vues et abonnés d'un mois type", "source": "Sources : Go-Viral, Ibrahim Kamara, Formalive"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 330, "pose": "assis", "chaise": "#495057",
           "actions": chaine(D * 0.55, [("taper", 1.1, {}), ("pointer", 0.6, {"cible": "cote"}), ("taper", 0.9, {})])
                      + chaine(D, [("compter", 1.4, {"cote": "l", "doigts": [1, 2, 3]}), ("hoche", 0.6, {})], t0=D * 0.55)}],
      objets_scene=lambda D: [{"type": "timeline", "x": 330, "y": 1290, "largeur": 480, "t": 0, "fin": D * 0.5},
                              {"type": "tirelire", "x": 830, "y": 1440, "instants": [D * 0.15, D * 0.45, D * 0.75]}])
# 3
scene(texte="Ensuite, deux cent cinq euros de cotisations et quarante de matériel. Il reste environ cinq cent cinquante euros, avant impôt.",
      decor="bureau", expression="perplexe", mot_jaune="cotisations", etiquette="EN CLAIR",
      element_visuel={"type": "cascade", "titre": "Ce qui part chaque mois",
          "definition": "Micro-entreprise : les cotisations sont un pourcentage de ce que tu encaisses, avant toute dépense",
          "lignes": [{"label": "Encaissé", "valeur": "800 €"},
                     {"label": "Cotisations (25,6 %)", "valeur": "− 205 €", "au_mot": "cotisations", "negatif": True},
                     {"label": "Matériel", "valeur": "− 40 €", "au_mot": "quarante", "negatif": True},
                     {"label": "Reste avant impôt", "valeur": "≈ 555 €", "au_mot": "reste", "resultat": True}],
          "hypotheses": "Hypothèse : 40 € par mois (carte de capture, logiciels, abonnements)",
          "mention": "Exemple illustratif", "source": "Sources : Legalplace, LS Compta"},
      _acteurs=lambda D: [
          {"id": "comptable", "x": 790, "expression": "neutre",
           "actions": chaine(D * 0.4, [("ecrire", 1.2, {"objet": "stylo"}), ("hoche", 0.5, {})])
                      + [obj("papiers", 0, D * 0.4, cote="l")]
                      + chaine(D, [("tendre", 1.0, {"cote": "l", "objet": "recu"}), ("hoche", 0.6, {}), ("croiser", 1.2, {})], t0=D * 0.4)},
          {"id": "nolan", "x": 320,
           "actions": [{"t": 0, "fin": 1.2, "type": "walkIn", "from": "left", "x": 320}]
                      + chaine(D * 0.45, [("saisir", 0.7, {"objet": "recu"}), ("incline", 0.6, {"angle": 8})], t0=1.25)
                      + [obj("billets", D * 0.45, D, cote="r")]
                      + chaine(D, [("compter", 1.3, {"cote": "l", "doigts": [3, 2, 1]}), ("hausse", 0.7, {}), ("nuque", 1.0, {"cote": "l"})], t0=D * 0.45)}],
      objets_scene=lambda D: [{"type": "pile_descend", "x": 560, "y": 1480, "instants": [D * 0.3, D * 0.8]}])
# 4
scene(texte="Mais entre le live, les clips et les montages, cent soixante-quinze heures : environ trois euros de l'heure.",
      decor="chambre_nuit", expression="perplexe", mot_jaune="heures", etiquette="MAIS",
      element_visuel={"type": "barres_comparees", "titre": "555 € ÷ 175 h ≈ 3 € par heure", "barres": [
          {"label": "Live", "valeur": 90, "texte": "90 h", "au_mot": "live"},
          {"label": "Clips", "valeur": 60, "texte": "60 h", "au_mot": "clips"},
          {"label": "Montages", "valeur": 25, "texte": "25 h", "au_mot": "montages"},
          {"label": "Total", "valeur": 175, "texte": "175 h", "au_mot": "heures"}],
          "mention": "Hypothèse : 3 h de live et 2 h de clips par jour, 5 montages de 5 h",
          "source": "≈ 3 € par heure : estimation"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 420, "pose": "assis", "chaise": "#495057",
           "actions": chaine(D, [("montre", 0.9, {}), ("frotterYeux", 1.2, {}), ("baille", 1.0, {"cote": "l"}), ("teteMains", 1.3, {}), ("incline", 0.8, {"angle": 14})])}],
      objets_scene=lambda D: [{"type": "chrono", "x": 130, "y": 1000, "instants": [0, D], "hauteur": 4, "texte": "175 h"},
                              {"type": "pile_clips", "x": 860, "y": 1460, "t": 0, "fin": D, "hauteur": 12}])
# 5
scene(texte="Premier levier : transformer les spectateurs en abonnés. Cinquante abonnés, c'est environ cent vingt-cinq euros par mois.",
      decor="setup_gaming", expression="content", mot_jaune="abonnés", etiquette="LEVIER N°1",
      element_visuel={"type": "carte_taux", "titre": "50 abonnés × 2,50 € ≈ 125 € par mois", "lignes": [
          {"label": "Aujourd'hui : 20 abonnés", "valeur": "≈ 50 €", "au_mot": "spectateurs"},
          {"label": "Objectif : 50 abonnés", "valeur": "≈ 125 € / mois", "au_mot": "cinquante"}],
          "petit": "Abonnement à 4,99 € : ≈ 2,50 € pour toi (50 %)",
          "mention": "Exemple illustratif", "source": "Sources : Formalive, CreatorsJet"},
      _acteurs=lambda D: [
          {"id": "spectatrice", "x": 820, "expression": "content",
           "actions": [{"t": 0, "fin": 1.3, "type": "walkIn", "from": "right", "x": 820}]
                      + [obj("telephone", 0, D, cote="l")]
                      + chaine(D, [("pointer", 0.7, {"cible": "avant"}), ("saut", 0.8, {}), ("pouce", 0.8, {}), ("hoche", 0.6, {})], t0=1.35)},
          {"id": "nolan_casque", "x": 300, "pose": "assis", "chaise": "#212529",
           "actions": chaine(D, [("saluer", 1.0, {}), ("clin", 0.6, {}), ("lever", 0.8, {"cote": "r"}), ("manette", 1.2, {"objet": "manette"}), ("pouce", 0.8, {})])}],
      objets_scene=lambda D: [{"type": "compteur_abos", "x": 560, "y": 1090, "t": D * 0.3, "fin": D * 0.85, "labels": ["20", "50"]},
                              {"type": "bouton_abo", "x": 820, "y": 1660, "instants": [1.6], "devant": True}])
# 6
scene(texte="Deuxième levier : miser sur les montages. Ils paient dix euros de l'heure, contre sept cinquante pour les clips.",
      decor="bureau", expression="fier", mot_jaune="montages", etiquette="LEVIER N°2",
      element_visuel={"type": "barres_comparees", "titre": "+ 1 montage par semaine ≈ + 200 € par mois", "barres": [
          {"label": "Live : 100 € ÷ 90 h", "valeur": 1, "texte": "≈ 1 €/h", "au_mot": "miser"},
          {"label": "Clips : 450 € ÷ 60 h", "valeur": 7.5, "texte": "7,50 €/h", "au_mot": "sept"},
          {"label": "Montages : 250 € ÷ 25 h", "valeur": 10, "texte": "10 €/h", "au_mot": "dix"}],
          "mention": "Exemple illustratif ; + 200 € = Hypothèse"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 330, "pose": "assis", "chaise": "#495057",
           "actions": chaine(D * 0.5, [("taper", 1.2, {}), ("pointer", 0.6, {"cible": "cote"}), ("taper", 1.0, {})])
                      + chaine(D, [("montre", 0.8, {"objet": "chronometre", "cote": "l"}), ("hoche", 0.6, {}), ("poing", 0.8, {})], t0=D * 0.5)}],
      objets_scene=lambda D: [{"type": "timeline", "x": 330, "y": 1290, "largeur": 480, "t": 0, "fin": D * 0.5},
                              {"type": "graphique", "x": 820, "y": 1300, "t": D * 0.3, "fin": D}])
# 7
scene(texte="Troisième levier : une vidéo sponsorisée par mois. De cinquante à deux cent cinquante euros, dès mille abonnés.",
      decor="coworking", expression="content", mot_jaune="sponsorisée", etiquette="LEVIER N°3",
      element_visuel={"type": "carte_taux", "titre": "1 vidéo sponsorisée : 50 à 250 €", "lignes": [
          {"label": "De 1 000 à 10 000 abonnés", "valeur": "50 à 250 €", "au_mot": "cinquante"},
          {"label": "Exemple : 1 par mois", "valeur": "≈ + 150 €", "au_mot": "mille"}],
          "mention": "Hypothèse. À signaler comme publicité", "source": "Source : Go-Viral"},
      _acteurs=lambda D: [
          {"id": "resp_marque", "x": 780, "expression": "content", "nom": "Responsable de marque",
           "actions": [{"t": 0, "fin": 1.2, "type": "walkIn", "from": "right", "x": 780},
                       {"t": 1.25, "fin": 2.3, "type": "serrerMain", "cote": "l"},
                       {"t": 2.35, "fin": 3.4, "type": "tendre", "cote": "l", "objet": "tablette"}]
                      + chaine(D, [("hoche", 0.6, {}), ("pouce", 0.8, {"cote": "l"}), ("croiser", 1.0, {})], t0=3.45)},
          {"id": "nolan", "x": 330,
           "actions": [{"t": 0, "fin": 1.2, "type": "hoche"},
                       {"t": 1.25, "fin": 2.3, "type": "serrerMain"},
                       {"t": 2.4, "fin": 3.8, "type": "ecrire", "objet": "stylo"}, obj("tablette", 2.4, 3.8, cote="l"),
                       {"t": 3.85, "fin": 5.2, "type": "montrer", "objet": "telephone"}, obj("flacon", 3.85, 5.2, cote="l")]
                      + chaine(D, [("pouce", 0.8, {}), ("saut", 0.8, {})], t0=5.25)}],
      objets_scene=lambda D: [])
# 8
scene(texte="Quatrième levier : sous-titrer en anglais. Une vue américaine paie deux à trois fois plus qu'en France.",
      decor="chambre", expression="fier", mot_jaune="anglais", etiquette="LEVIER N°4",
      element_visuel={"type": "carte_taux", "titre": "Revenu par vue : audience américaine ≈ 2 à 3 × la France", "lignes": [
          {"label": "Une vue en France", "valeur": "× 1", "au_mot": "vue"},
          {"label": "Une vue américaine", "valeur": "≈ × 2 à 3", "au_mot": "deux"}],
          "petit": "Mêmes montages, nouveau public",
          "mention": "Estimation", "source": "Sources : Digitiz, Ibrahim Kamara"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 330, "pose": "assis", "chaise": "#495057",
           "actions": chaine(D * 0.45, [("taper", 1.2, {}), ("hoche", 0.5, {})])
                      + chaine(D, [("pointer", 1.0, {"cible": "cote"}), ("hoche", 0.6, {}), ("gratter", 0.8, {"cote": "l"})], t0=D * 0.45)}],
      objets_scene=lambda D: [{"type": "timeline", "x": 330, "y": 1290, "largeur": 480, "t": 0, "fin": D * 0.3, "texte": "EN", "instants": [D * 0.15, D * 0.3, D * 0.45, D * 0.6]},
                              {"type": "globe", "x": 830, "y": 1130, "largeur": 140, "allume": D * 0.5}])
# 9
scene(texte="Cinquième levier : l'ACRE. Vingt-cinq pour cent de cotisations en moins la première année, si tu y as droit.",
      texte_voix="Cinquième levier : l'A.C.R.E. Vingt-cinq pour cent de cotisations en moins la première année, si tu y as droit.",
      decor="banque", expression="content", mot_jaune="l'ACRE", etiquette="LEVIER N°5",
      element_visuel={"type": "carte_taux", "titre": "ACRE : − 25 % de cotisations la 1re année", "lignes": [
          {"label": "Cotisations par mois", "valeur": "205 € → ≈ 154 €", "au_mot": "cotisations"},
          {"label": "Gagnés par mois", "valeur": "≈ 51 €", "au_mot": "première"}],
          "mention": "Sous conditions : micro-entreprise créée depuis le 1er juillet 2026", "source": "Source : Legalplace"},
      _acteurs=lambda D: [
          {"id": "conseillere", "x": 790, "expression": "content", "nom": "Conseillère",
           "actions": [{"t": 0, "fin": 1.2, "type": "tamponner", "objet": "tampon"},
                       {"t": 1.25, "fin": 2.4, "type": "tendre", "cote": "l", "objet": "dossier"}]
                      + chaine(D, [("hoche", 0.6, {}), ("saluer", 0.9, {"cote": "l"}), ("croiser", 1.0, {})], t0=2.45)},
          {"id": "nolan", "x": 320,
           "actions": [{"t": 0, "fin": 1.2, "type": "walkIn", "from": "left", "x": 320},
                       {"t": 1.3, "fin": 2.4, "type": "saisir", "objet": "dossier"},
                       {"t": 2.45, "fin": 3.4, "type": "sousBras", "objet": "dossier"},
                       obj("sac", 3.4, D, cote="l")]
                      + chaine(D, [("compter", 1.3, {"doigts": [1, 2, 3]}), ("hoche", 0.6, {}), ("pouce", 0.8, {})], t0=3.45)}],
      objets_scene=lambda D: [{"type": "papier_tampon", "x": 620, "y": 1260, "texte": "VALIDÉ", "instants": [0.8]}])
# 10
scene(texte="Conseil : note tes heures par plateforme, et garde ce qui paie le mieux.",
      decor="salon", expression="neutre", mot_jaune="heures", etiquette="CONSEIL",
      element_visuel={"type": "carte_taux", "titre": "revenu ÷ heures = € par heure", "lignes": [
          {"label": "Live", "valeur": "heures notées", "au_mot": "note"},
          {"label": "Clips", "valeur": "heures notées", "au_mot": "heures"},
          {"label": "Montages", "valeur": "heures notées", "au_mot": "plateforme"}],
          "petit": "Garde ce qui rapporte le plus d'euros par heure",
          "mention": "Exemple illustratif"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 480,
           "actions": [obj("carnet", 0, D * 0.5, cote="l")]
                      + chaine(D * 0.5, [("ecrire", 1.1, {"objet": "stylo"}), ("montre", 0.6, {"objet": "chronometre"})])
                      + chaine(D, [("montrer", 1.0, {"objet": "telephone"}), ("hoche", 0.6, {}), ("pouce", 0.7, {})], t0=D * 0.5)}],
      objets_scene=lambda D: [])
# 11
scene(texte="Attention : Rockstar peut retirer tes vidéos. Pas de spoilers, ni de cinématiques isolées, ni de fuites.",
      decor="bureau", expression="neutre", mot_jaune="retirer", etiquette="ATTENTION",
      puis={"expression": "choque", "au_mot": "retirer"},
      element_visuel={"type": "carte_taux", "titre": "Règles de Rockstar", "lignes": [
          {"label": "Spoilers", "valeur": "interdits", "au_mot": "spoilers"},
          {"label": "Cinématiques isolées", "valeur": "interdites", "au_mot": "cinématiques"},
          {"label": "Contenu fuité avant la sortie", "valeur": "interdit", "au_mot": "fuites"}],
          "petit": "Retrait possible à tout moment ; politique pensée pour un usage non commercial",
          "source": "Source : Rockstar Support"},
      _acteurs=lambda D: [
          {"id": "moderateur", "x": 780, "expression": "neutre", "nom": "Agent de modération",
           "actions": [{"t": 0, "fin": 1.0, "type": "walkIn", "from": "right", "x": 780},
                       {"t": 1.05, "fin": 2.0, "type": "tamponner", "cote": "l", "objet": "tampon"}]
                      + chaine(D, [("croiser", 1.2, {}), ("hoche", 0.6, {}), ("pointer", 0.8, {"cote": "l", "cible": "cote"})], t0=2.05)},
          {"id": "nolan", "x": 300,
           "actions": [{"t": 0, "fin": 1.0, "type": "montrer", "objet": "telephone"},
                       {"t": 1.05, "fin": 1.6, "type": "pointer", "cible": "cote"},
                       {"t": 1.9, "fin": 2.5, "type": "recul", "dx": -50}]
                      + chaine(D, [("tendre", 1.0, {"cote": "r"}), ("hausse", 0.7, {}), ("hoche", 0.6, {})], t0=2.55)}],
      objets_scene=lambda D: [{"type": "video_retiree", "x": 560, "y": 1180, "instants": [1.7]}])
# 12
scene(texte="Règle numéro un : calcule ton revenu par heure, pas ton nombre de vues.",
      decor="studio", expression="neutre", mot_jaune="heure", etiquette="RÈGLE N°1",
      element_visuel={"type": "addition_pastilles", "pastilles": [
          {"texte": "≈ 3 € par heure ✓", "au_mot": "heure"},
          {"texte": "750 000 vues ✗", "au_mot": "nombre"}],
          "resultat": {"texte": "€ par heure = ton vrai revenu", "au_mot": "vues"},
          "mention": "Exemple illustratif"},
      _acteurs=lambda D: [
          {"id": "nolan", "x": 540, "echelle": 0.85,
           "actions": [{"t": 0, "fin": 1.1, "type": "walkIn", "from": "left", "x": 540},
                       {"t": 1.15, "fin": 2.2, "type": "tracer"},
                       {"t": 2.25, "fin": 3.1, "type": "coller", "objet": "pastille_revenus"}]
                      + chaine(D, [("pointer", 0.9, {"cible": "haut"}), ("hoche", 0.6, {}), ("croiser", 1.0, {})], t0=3.15)}],
      objets_scene=lambda D: [])
# 13
scene(texte="Surfer sur GTA six : bon plan ou piège ? Dis-le en commentaire, et abonne-toi pour d'autres vrais chiffres.",
      texte_voix="Surfer sur G.T.A. six : bon plan ou piège ? Dis-le en commentaire, et abonne-toi pour d'autres vrais chiffres.",
      decor="setup_gaming", expression="content", mot_jaune="commentaire", etiquette="TON AVIS",
      element_visuel={"type": "icones_cta"},
      _acteurs=lambda D: [
          {"id": "spectatrice", "x": -200, "echelle": 0.62, "y": 1440, "expression": "content",
           "actions": [{"t": 0.2, "fin": 2.0, "type": "walkTo", "x": 760}, {"t": 2.05, "fin": 3.2, "type": "saluer", "cote": "l"},
                       {"t": 3.25, "fin": 5.0, "type": "walkOut", "to": "right"}]},
          {"id": "resp_marque", "x": 1300, "echelle": 0.62, "y": 1440, "expression": "content",
           "actions": [{"t": 1.0, "fin": 3.0, "type": "walkTo", "x": 860}, {"t": 3.05, "fin": 4.2, "type": "saluer", "cote": "l"},
                       {"t": 4.25, "fin": 6.2, "type": "walkOut", "to": "left"}]},
          {"id": "nolan_casque", "x": 360,
           "actions": chaine(D, [("clin", 0.7, {}), ("pointer", 1.0, {"cible": "bas"}), ("saut", 0.9, {}), ("saluer", 0.9, {}), ("pouce", 0.8, {}), ("hoche", 0.6, {})])}],
      objets_scene=lambda D: [])

out = []
for i, p in enumerate(S):
    D = durees.get(i, 6.0)
    if i == len(S) - 1: D += EXTRA_FIN
    q = {k: v for k, v in p.items() if not k.startswith('_') and k != 'objets_scene'}
    q['duree'] = round(D, 3)
    q['acteurs'] = p['_acteurs'](D)
    q['objets_scene'] = p['objets_scene'](D)
    for o in q['objets_scene']:
        for k in ('t', 'fin'):
            if k in o: o[k] = round(o[k], 2)
        if 'instants' in o: o['instants'] = [round(x, 2) for x in o['instants']]
        if 'allume' in o: o['allume'] = round(o['allume'], 2)
    out.append(q)
json.dump(out, open(os.path.join(D0, 'script.json'), 'w'), ensure_ascii=False, indent=1)
print('scenes', len(out), 'durees', [round(durees.get(i, 0), 2) for i in range(len(out))])
