# Cahier des charges — Anjed's Closet (application d'essayage virtuel par IA)

> Document de référence fonctionnel et technique.
> **Statut :** brouillon validé pour construction — en attente du feu vert final.
> **Dernière mise à jour :** 2026-06-13

---

## 0. En une phrase

Une **application mobile (PWA installable)** ultra esthétique et féminine qui permet à une
utilisatrice — **même sans aucune connaissance du web** — d'**essayer sur elle-même**, grâce à
l'IA, les vêtements de **sa propre garde-robe** (photographiés) ainsi que des articles
**trouvés sur Google / le web**, avec **historique**, **suggestions de combinaisons**,
et une **ambiance sonore + colorée pilotée par le « mood »**.

---

## 1. Vision & principes directeurs

| # | Principe | Implication concrète |
|---|----------|----------------------|
| P1 | **Esthétique avant tout** | L'app doit être « très très jolie », douce, féminine, soignée dans le moindre détail. Le visuel est traité par **Claude Design** (cf. §10). |
| P2 | **Intuitive pour débutant total** | Une utilisatrice sans aucune culture web doit réussir seule. Zéro jargon, gros boutons, parcours guidé, langue française simple. |
| P3 | **« Mes vêtements » d'abord** | L'usage principal = tester **SES** tenues. Les articles Google/web sont **secondaires et clairement séparés**. |
| P4 | **Gratuit** | Aucune dépendance payante obligatoire (IA en quota gratuit, musique libre de droits, hébergement gratuit). |
| P5 | **Qualité / conformité** | Résultats réalistes, respect de la vie privée (RGPD), musiques **libres de droits**, accessibilité, robustesse. |
| P6 | **Privé par défaut** | Photos et dressing stockés **sur l'appareil** ; aucune sortie réseau hormis l'appel à l'IA d'essayage. |
| P7 | **Sensoriel** | L'ambiance (musique + couleurs selon le mood) fait partie de l'expérience, pas un gadget. |

---

## 2. Cible utilisateur (persona)

- **Persona principal — « Lina », 17–30 ans.** Aime la mode, prépare ses tenues, partage ses
  looks. **Pas technicienne** : ne sait pas ce qu'est un « cache », une « URL », un « fichier ».
  Utilise son téléphone, prend des photos, fait défiler. Veut un résultat **joli et immédiat**.
- **Contexte d'usage :** chez elle devant son armoire, ou en shopping en ligne, sur **téléphone**,
  souvent une seule personne (beta perso au départ).

---

## 3. Plateforme & format de livraison

- **PWA (Progressive Web App)** installable :
  - Déployée sur une **URL** (hébergement gratuit).
  - « **Ajouter à l'écran d'accueil** » → **icône sur l'iPhone/Android**, ouverture **plein écran**
    comme une app native, **sans App Store** et **sans compte développeur Apple**.
  - Fonctionne iOS + Android + navigateur.
- **Mobile-first** strict (conçue pour le pouce, une main).

---

## 4. Périmètre fonctionnel détaillé (MVP = « tout »)

Légende des critères : **US** = user story, **CA** = critères d'acceptation.

### 4.1 — Profil & photo « mannequin »
La photo de référence de l'utilisatrice, utilisée par l'IA comme base de l'essayage.

- **US :** « En tant qu'utilisatrice, je prends/choisis une photo de moi pour m'en servir comme
  modèle d'essayage. »
- **Fonctions :**
  - Prendre une photo (caméra) **ou** choisir depuis la galerie.
  - Conseils visuels simples au moment de la prise : *plein pied, bonne lumière, fond simple*.
  - Possibilité d'enregistrer **plusieurs photos de soi** (ex. face, plein pied) et d'en choisir
    une « active ».
  - Recadrage simple.
- **CA :**
  - [ ] La photo est stockée **localement** (jamais envoyée ailleurs que l'IA d'essayage).
  - [ ] On peut changer / supprimer sa photo à tout moment.
  - [ ] Un message clair explique à quoi sert cette photo et la protection de la vie privée.

### 4.2 — Mon Dressing (garde-robe personnelle) — *priorité n°1*
- **US :** « Je photographie mes vêtements pour construire mon dressing numérique. »
- **Fonctions :**
  - Ajouter un vêtement via **photo** (caméra ou galerie).
  - **Détourage automatique du fond** (optionnel, pour un rendu « catalogue » propre).
  - Renseigner en 2 taps : **catégorie** (Haut / Bas / Robe / Chaussures / Accessoire / Veste),
    **nom** libre (optionnel), **couleur dominante** (auto-détectée, modifiable).
  - Vue **grille** jolie, filtrable par catégorie et couleur.
  - Détail d'un article : aperçu, infos, **« Essayer »**, supprimer, marquer favori.
  - `source = "perso"` (interne, invisible pour l'utilisatrice mais structurant l'app).
- **CA :**
  - [ ] Ajout d'un vêtement en **moins de 15 secondes**.
  - [ ] La grille reste fluide jusqu'à plusieurs centaines d'articles.
  - [ ] Tout est stocké **localement**.

### 4.3 — Découvertes (articles Google / web) — *séparé, secondaire*
Section **distincte** de « Mon Dressing » : ici on collecte des vêtements repérés en ligne
pour les tester avant d'acheter.

- **US :** « J'ajoute un vêtement vu sur Google / une boutique pour voir s'il me va. »
- **Fonctions (3 façons, de la plus simple à la plus avancée) :**
  1. **Importer une image** depuis la galerie (capture d'écran d'un produit) — *le plus simple*.
  2. **Coller un lien** de page produit → l'app récupère automatiquement l'image principale.
  3. **Coller un lien d'image** direct.
  - Mêmes métadonnées que le dressing (catégorie, couleur).
  - `source = "web"` + mémorisation du lien d'origine (pour « revoir le produit »).
- **Séparation visuelle et logique stricte :**
  - Onglet/section dédié « Découvertes » distinct de « Mon Dressing ».
  - Dans l'écran d'essayage, les articles web sont **regroupés à part** et **étiquetés** (badge
    « Web / À tester »), jamais mélangés silencieusement avec les vêtements possédés.
  - Les **suggestions de combos** (§4.6) se basent **prioritairement sur le dressing perso**.
- **CA :**
  - [ ] Un débutant réussit l'ajout par **capture d'écran** sans comprendre ce qu'est une URL.
  - [ ] L'origine (perso vs web) est **toujours visible** quand c'est pertinent.

### 4.4 — Essayage IA (cœur de l'app)
- **US :** « Je choisis un ou plusieurs vêtements et je me vois les porter. »
- **Fonctions :**
  - Sélection : **ma photo** + **1 à N articles** (ex. haut + bas + chaussures) issus du dressing
    et/ou des découvertes.
  - Composition d'une **tenue complète** (empilement de pièces).
  - Lancement de l'essayage → écran d'attente **agréable et animé** (pas une simple roue).
  - Résultat : image réaliste de l'utilisatrice portant la tenue.
  - Actions sur le résultat : **enregistrer** (→ historique), **refaire**, **partager**,
    **comparer** avec l'original, marquer favori.
- **Moteur IA :** **Gemini 2.5 Flash Image (« Nano Banana »)** via une **route serveur sécurisée**
  (la clé API n'est jamais exposée côté navigateur). Cf. §8.4.
- **CA :**
  - [ ] Le visage et la posture sont **préservés**, le vêtement **plausible** (drapé, taille).
  - [ ] Gestion d'erreur claire (réseau, quota, image inadaptée) avec message rassurant + réessai.
  - [ ] Aucune photo n'est conservée côté serveur après génération.

### 4.5 — Historique des essayages
- **US :** « Je retrouve toutes les tenues que j'ai déjà essayées. »
- **Fonctions :**
  - Galerie chronologique de tous les essayages (date, vignette du résultat).
  - Chaque entrée mémorise : image résultat, **articles utilisés**, **origine** (perso/web),
    **mood** du moment (optionnel).
  - Actions : rouvrir, **réessayer** (relancer la même tenue), favori, supprimer, partager.
  - Filtres : favoris, par mood, par origine.
- **CA :**
  - [ ] Rien n'est perdu entre deux ouvertures de l'app (stockage local persistant).
  - [ ] Suppression simple et définitive (RGPD).

### 4.6 — Suggestions de combinaisons (« combos »)
- **US :** « L'app me propose des tenues à partir de mes propres vêtements. »
- **Fonctions :**
  - Génère des **associations** à partir du **dressing perso** : Haut + Bas (+ Chaussures /
    Veste / Accessoire), en respectant des règles simples (catégories compatibles + **harmonie
    de couleurs**).
  - Présentation sous forme de **cartes « tenue à essayer »** ; un tap → essayage direct.
  - **Niveau 1 (sans IA, gratuit immédiat) :** règles couleur + catégories.
  - **Niveau 2 (optionnel, IA) :** suggestions stylistiques affinées par l'IA (mêmes quotas
    gratuits). Activable plus tard.
  - Possibilité de « **Surprends-moi** » → une tenue aléatoire cohérente.
- **CA :**
  - [ ] Les combos se basent **d'abord** sur les vêtements possédés (perso).
  - [ ] Au moins quelques combos pertinents dès qu'il y a ≥ 1 haut et ≥ 1 bas.

### 4.7 — Ambiance « Mood » : musique + couleurs
Caractéristique signature : l'utilisatrice **choisit un mood**, l'app **change la musique de fond
ET l'ambiance colorée**.

- **US :** « Je choisis une humeur et l'app met une musique et des couleurs assorties. »
- **Moods proposés (liste de départ, ajustable) :**
  - 🌙 **Cosy / Chill** — douce, lo-fi.
  - 💗 **Romantique** — rêveuse, R&B/piano doux.
  - 👑 **Confiance / Boss** — pop affirmée, *empowering*.
  - ✨ **Glow / Énergique** — pop entraînante.
  - ☁️ **Rêveuse / Dreamy** — ambient éthéré.
  - 🪩 **Fun / Y2K** — pop ludique.
  - *(Soirée / Élégante en option.)*
- **Fonctions :**
  - Sélecteur de mood très visuel et amusant (l'écran respire au changement).
  - **Musique de fond** en boucle, **libre de droits** (cf. §9 licences), avec **lecture/pause**,
    **volume**, **muet**, piste suivante.
  - **Thème couleur** de toute l'app qui bascule selon le mood (système de *design tokens*
    interchangeables — les palettes elles-mêmes sont définies par **Claude Design**, cf. §10).
  - Mémorisation du dernier mood choisi.
  - **Contrainte iOS :** la musique ne démarre qu'**après une première interaction** de
    l'utilisatrice (politique d'autoplay) → prévoir un joli bouton « ▶ Lancer l'ambiance ».
- **CA :**
  - [ ] Changer de mood change **musique + couleurs** de façon fluide et immédiate.
  - [ ] La musique respecte un usage **100 % libre de droits**.
  - [ ] On peut couper le son à tout moment (et l'app reste belle en silencieux).

### 4.8 — Looks & partage
- **US :** « Je garde mes meilleures tenues et je les partage. »
- **Fonctions :**
  - **Favoris** transverses (articles, essayages, combos).
  - **Partage** du rendu via le partage natif du téléphone (Web Share API) — réseaux, messages.
  - Export image du look.
- **CA :**
  - [ ] Le partage utilise la feuille de partage native (aucune configuration utilisateur).

### 4.9 — Réglages
- Photo(s) de profil, mood/son par défaut, **gestion des données** (tout effacer),
  page « Confidentialité » en langage simple, infos appli/version.

---

## 5. Parcours utilisateur clés (flows)

1. **Première ouverture :** accueil chaleureux → choisir un mood (ambiance se met en place) →
   inviter à **ajouter sa photo** → inviter à **ajouter un premier vêtement** → proposer un
   **premier essayage**. Tout est guidé, aucun terme technique.
2. **Essayer un vêtement à moi :** Mon Dressing → choisir un article → « Essayer » → résultat →
   enregistrer.
3. **Tester un article repéré en ligne :** Découvertes → importer capture d'écran → « Essayer ».
4. **Composer une tenue :** sélectionner haut + bas (+ chaussures) → essayer la tenue complète.
5. **Se laisser guider :** Suggestions → « Surprends-moi » → essayer.
6. **Revoir / partager :** Historique → favori → partager.

**Navigation principale (barre du bas, 5 entrées max) — intitulés provisoires :**
`Dressing` · `Découvertes` · `Essayer` (bouton central proéminent) · `Looks/Historique` · `Mood`.
*(Disposition finale et libellés = ressort de Claude Design + ergonomie.)*

---

## 6. Modèle de données (stockage local — IndexedDB)

```text
Profile {
  id, name?, photos: [Blob], activePhotoId, createdAt
}

Item {                      // vêtement (dressing OU web)
  id, name?, category,      // 'haut'|'bas'|'robe'|'chaussures'|'veste'|'accessoire'
  colorTag,                 // couleur dominante (auto, modifiable)
  source,                   // 'perso' | 'web'
  image: Blob,
  sourceUrl?,               // si source = 'web'
  favorite, createdAt
}

Look {                      // entrée d'historique = un essayage
  id, resultImage: Blob,
  itemIds: [string],        // articles utilisés
  mood?, favorite, createdAt
}

Settings {
  mood, volume, muted, lastUsed, ...
}
```

> Les *images* sont stockées en **Blob** localement (compressées). Aucune base de données
> serveur en v1 → gratuité, vie privée, zéro configuration.

---

## 7. Exigences non-fonctionnelles (normes de qualité)

- **UX / esthétique :** soignée, féminine, animations douces, micro-interactions, états vides
  jolis, écrans d'attente travaillés. *(Identité visuelle = Claude Design.)*
- **Accessibilité & simplicité :** langue française simple, **gros boutons / cibles tactiles ≥ 44px**,
  contrastes suffisants, zéro jargon, parcours sans cul-de-sac, retours visuels clairs.
- **Performance :** mobile-first, images compressées, chargement rapide, **coque hors-ligne**
  (consultation du dressing/looks sans réseau ; l'essayage IA requiert le réseau).
- **Confidentialité / RGPD :** données **sur l'appareil**, consentement clair pour la photo,
  suppression facile et totale, page confidentialité en clair, aucune conservation serveur des
  photos. *(Note : le tier gratuit Gemini peut utiliser les contenus pour améliorer les modèles —
  à indiquer honnêtement dans la page confidentialité, choix assumé pour la beta perso.)*
- **Sécurité :** clé API **uniquement côté serveur**, jamais dans le navigateur.
- **Licences :** musiques **libres de droits / usage commercial autorisé** uniquement (cf. §9).
- **Modération :** garde-fous pour éviter les usages détournés de l'essayage.
- **Robustesse :** gestion explicite des erreurs (réseau, quota IA, image inadaptée) avec
  messages rassurants et réessai.

---

## 8. Architecture technique (mon périmètre)

### 8.1 Stack
- **Next.js (App Router) + TypeScript** — PWA.
- **Stockage local :** IndexedDB (via `idb` / `localForage`).
- **Hébergement gratuit** avec HTTPS (nécessaire à l'installation PWA).
- **PWA :** manifest (nom, icônes, plein écran), service worker (coque hors-ligne, installation).

### 8.2 Routes serveur (API)
- `POST /api/tryon` → appelle Gemini (photo + article(s) + prompt) → renvoie l'image.
- `GET  /api/fetch-garment?url=` → récupère l'image principale d'une page produit (évite les
  blocages navigateur), renvoie l'image.
- `POST /api/suggest` *(optionnel, niveau 2)* → combos affinés par IA.

### 8.3 Mood-engine
- **Thème :** variables CSS (*design tokens*) commutées à l'exécution selon le mood ;
  **les valeurs de palette par mood sont fournies par Claude Design**, je fournis le mécanisme.
- **Audio :** lecteur HTML5 en boucle par mood, démarrage après interaction (iOS), contrôles
  volume/pause/muet, playlist libre de droits.

### 8.4 Intégration Gemini (essayage)
- Modèle : **Gemini 2.5 Flash Image** (« Nano Banana »). *Quota gratuit confortable.*
- Entrées : image de la personne + image(s) du/des vêtement(s) + consigne textuelle
  (préserver visage/posture, ajustement réaliste du vêtement, fond cohérent).
- Clé via variable d'environnement **`GEMINI_API_KEY`** (jamais exposée au client).
- Nom de modèle **paramétrable** (env) pour suivre les évolutions sans refonte.

### 8.5 Déploiement & installation
- Déploiement sur hébergeur gratuit → URL HTTPS.
- L'utilisatrice ouvre l'URL → « Ajouter à l'écran d'accueil » → **icône + plein écran**.
- Un mini-guide illustré « Comment installer » sera prévu (utilisatrice non technique).

---

## 9. Musique — sourcing & licences (gratuit + conforme)

- **Source privilégiée :** bibliothèques **libres de droits, usage commercial autorisé, sans
  attribution obligatoire** (ex. *Pixabay Music*) ; alternatives Creative Commons avec
  attribution si besoin.
- **Mise en œuvre :** une courte sélection de boucles **par mood**, vérifiées niveau licence.
- **Interdit :** toute musique commerciale sous copyright (Spotify, charts, etc.).
- Traçabilité des licences conservée dans le dépôt (fichier `CREDITS`/`LICENSES`).

---

## 10. Prompt pour **Claude Design** (identité visuelle — liberté créative totale)

> **À copier-coller tel quel à Claude Design.** Je (le développeur) ne fige **aucune** charte
> graphique : couleurs, typographies, formes, iconographie, illustrations et palettes par mood
> sont **entièrement** à l'appréciation de Claude Design.

```text
Tu es le directeur artistique d'une application mobile d'essayage virtuel de vêtements par IA.
Conçois l'identité visuelle complète et les écrans en haute fidélité. Tu as une LIBERTÉ
CRÉATIVE TOTALE : choisis toi-même la palette, les typographies, les formes, l'iconographie,
le style d'illustration et l'ensemble de la charte graphique. Aucune contrainte de couleur ne
t'est imposée.

CONCEPT
Une app où une utilisatrice s'essaie virtuellement, grâce à l'IA, les vêtements de sa propre
garde-robe (qu'elle photographie) et des articles repérés en ligne, avec historique des tenues
essayées, suggestions de combinaisons à partir de ses vêtements, et une ambiance sonore +
colorée qui change selon le « mood » choisi.

DIRECTION ÉMOTIONNELLE (à interpréter librement)
- Esthétique AVANT TOUT : « très très jolie », raffinée, désirable, digne d'un moodboard.
- Féminine, douce, élégante, premium mais accessible.
- Sensorielle et immersive : on doit avoir envie d'y rester.
- INTUITIVE pour une utilisatrice SANS AUCUNE connaissance technique : évidente au premier
  regard, gros éléments tactiles, zéro jargon, parcours guidé, aucune ambiguïté.

PLATEFORME & CONTRAINTES D'USAGE
- Mobile-first, plein écran type app native (PWA installée sur l'écran d'accueil).
- Pensée pour une utilisation au pouce, à une main.
- Textes en français, simples et chaleureux.
- Cibles tactiles généreuses, hiérarchie visuelle très lisible, fort contraste de lecture.

SYSTÈME DE « MOOD » (élément signature à designer)
L'app propose plusieurs moods (ex. Cosy/Chill, Romantique, Confiance/Boss, Glow/Énergique,
Rêveuse/Dreamy, Fun/Y2K). Chaque mood déclenche une musique ET une ambiance colorée.
=> Conçois UNE PALETTE DISTINCTE PAR MOOD (jeu de design tokens) + un sélecteur de mood
ludique et magnifique. Le passage d'un mood à l'autre doit être un moment « waouh » fluide.

ÉCRANS À CONCEVOIR (haute fidélité + états vides + chargements)
1. Accueil / onboarding chaleureux (premier lancement guidé).
2. Sélecteur de Mood (signature) + mini-lecteur de musique (play/pause, volume, muet).
3. Mon Dressing : grille de vêtements, filtres par catégorie/couleur, ajout par photo.
4. Découvertes (articles web) : CLAIREMENT séparé du dressing perso, articles « à tester »
   badgés, ajout par capture d'écran ou lien.
5. Détail d'un vêtement (avec bouton « Essayer » proéminent).
6. Écran d'Essayage : sélection photo de soi + 1..N vêtements, composition d'une tenue,
   bouton d'action central très désirable.
7. Écran d'attente de génération IA : agréable, animé, jamais ennuyeux.
8. Résultat d'essayage : grand visuel + actions (enregistrer, refaire, comparer, partager,
   favori).
9. Suggestions de combos : cartes « tenue à essayer » + bouton « Surprends-moi ».
10. Historique / Looks : galerie chronologique, favoris, filtres.
11. Réglages + page Confidentialité (rédigée simplement).
12. Mini-guide « Installer l'app sur mon téléphone » (utilisatrice non technique).

LIVRABLES ATTENDUS
- Maquettes haute fidélité de tous les écrans ci-dessus (états remplis + états vides + erreurs).
- Une bibliothèque de composants (boutons, cartes, champs, badges « perso » vs « web »,
  barre de navigation, lecteur de musique, sélecteur de mood, vignettes).
- L'ensemble des palettes PAR MOOD sous forme de design tokens nommés, réutilisables en code.
- Iconographie cohérente et style d'illustration/visuel.
- Propositions de transitions/animations clés (sélection de mood, lancement d'essayage,
  apparition du résultat).
- Typographies (titres + texte) et échelle typographique.

PRINCIPE FINAL
Surprends-moi : l'app doit être assez belle pour donner envie de la montrer. Priorise le
« beau » et le « simple ». Quand tu hésites entre joli et fonctionnel, trouve les deux.
```

---

## 11. Hors périmètre v1 (idées pour plus tard)

- Comptes utilisateurs + **synchronisation cloud** multi-appareils.
- Aspect **social** (suivre des amies, voter sur des tenues).
- **Recommandations shopping** / liens d'achat affiliés.
- **Avatar 3D** / mensurations.
- Détection automatique d'articles depuis une simple URL de moteur de recherche (au-delà de
  l'image principale).
- Multi-langues.

---

## 12. Découpage de livraison proposé

1. **Lot 0 — Fondations :** projet PWA, navigation, stockage local, mood-engine (couleurs +
   musique), coque visuelle (en attendant Claude Design).
2. **Lot 1 — Dressing & Profil :** photo mannequin, ajout/gestion vêtements perso.
3. **Lot 2 — Essayage IA :** intégration Gemini + écran résultat + enregistrement.
4. **Lot 3 — Découvertes web :** import capture/lien, séparation perso/web.
5. **Lot 4 — Historique & Combos :** galerie, favoris, suggestions de combinaisons.
6. **Lot 5 — Finition :** partage, hors-ligne, page confidentialité, guide d'installation,
   intégration du design final de Claude Design.

---

## 13. Décisions à confirmer avant construction

- **Nom de l'app** : **Anjed's Closet** ✅ (application personnelle dédiée à Anjed).
- **Clé `GEMINI_API_KEY`** : à fournir au moment du Lot 2 (création gratuite sur Google AI Studio).
- **Liste finale des moods** et nombre de pistes musicales par mood.
- **Hébergeur gratuit** cible pour le déploiement / installation.
