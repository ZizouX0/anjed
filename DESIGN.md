# Anjed's Closet — Direction Artistique

> « Soie & Lumière » — une boîte à bijoux que l'on garde dans sa poche.
> Identité visuelle complète, prête à coder. Mobile-first, plein écran, UI française.

---

## 1. Énoncé du concept

**Anjed's Closet** n'est pas une application, c'est un **boudoir numérique**. On l'ouvre comme
on ouvre un coffret précieux : une lumière douce, une matière soyeuse, un parfum de couleur.
Tout y est **rond, tendre et lumineux** — aucun angle dur, aucun gris triste, aucun jargon.

La direction tient en trois mots :

- **Soie** — des surfaces douces, des dégradés vaporeux, des ombres colorées et basses (jamais
  noires), des coins très arrondis. La lumière « tombe » sur l'interface comme sur un tissu.
- **Lumière** — chaque mood est une *heure du jour* différente (aube rosée, soleil doré, nuit
  lavande…). Le fond n'est jamais plat : c'est toujours un **halo** qui respire.
- **Bijou** — des détails précieux : touches métalliques chaudes (or rose, champagne), micro-
  brillances, transitions lentes et satinées. Assez beau pour qu'on ait *envie de le montrer*.

Le but émotionnel : qu'**Anjed** se sente accueillie, jolie, et en confiance — qu'une débutante
totale comprenne tout du premier regard, et qu'elle sourie au premier changement de mood.

---

## 2. Typographie

Deux familles Google Fonts, complémentaires : un serif optique *couture* pour la poésie des
titres, un sans-serif rond et chaleureux pour une lisibilité parfaite au pouce.

| Rôle | Famille | Pourquoi |
|------|---------|----------|
| **Display / Titres** | **Fraunces** | Serif « old-style » à axe optique, avec des italiques et des courbes féminines somptueuses. Réglages variables (`opsz`, `wght`, `SOFT`, `WONK`) pour un rendu éditorial, doux et désirable, façon magazine de mode. |
| **Texte / UI** | **Plus Jakarta Sans** | Géométrique mais chaleureux, terminaisons arrondies, excellente lisibilité aux petites tailles, cibles tactiles claires. Parfait pour une utilisatrice non technique. |

### Balises `<link>` à coller dans le `<head>`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
  rel="stylesheet">
```

> Astuce : les titres respirent mieux avec un `letter-spacing` très légèrement négatif (déjà
> appliqué dans `tokens.css`). L'italique de Fraunces est réservé aux accents émotionnels
> (« Surprends-moi », noms de moods) pour garder de l'élégance sans surcharge.

---

## 3. Philosophie des couleurs

**Aucune couleur n'est imposée par défaut** — le système est *piloté par le mood*. Toutes les
couleurs de l'app sont des **jetons sémantiques** (`--bg`, `--primary`, `--accent`…) ; changer
`data-mood` sur `<html>` re-thématise **toute** l'application instantanément.

Principes :

1. **Le fond n'est jamais plat.** `--gradient-hero` est un dégradé multi-stops vaporeux propre à
   chaque mood. Les surfaces (`--surface`) sont translucides et posées dessus comme du verre dépoli.
2. **Pas de noir pur, pas de gris froid.** Le texte le plus sombre est un brun-prune ou un
   bleu-nuit *teinté*, jamais `#000`. Les ombres sont **colorées et basses** (`--shadow-*` utilise
   la teinte primaire du mood, à faible opacité).
3. **Deux accents par mood** (`--accent`, `--accent-2`) pour les dégradés de boutons, badges et
   brillances — la touche « bijou ».
4. **Contraste d'abord.** Chaque palette de mood vise un contraste texte/fond confortable
   (corps ≥ 4.5:1, gros titres ≥ 3:1) ; `--text-on-primary` est toujours choisi pour rester
   lisible sur le bouton principal.
5. **Palette par défaut (hors mood)** = « Blush Champagne » : un rose poudré crème, neutre et
   universellement flatteur, qui sert de socle avant tout choix de mood.

---

## 4. Iconographie

- **Style :** trait fin et **arrondi** (`stroke-linecap: round`, `stroke-linejoin: round`),
  épaisseur ~1.6–1.8px, coins généreux — cohérent avec la rondeur typographique. Recommandation :
  **Lucide** / Phosphor (poids « regular » ou « light »), ou pictos maison dans le même esprit.
- **Pas de remplissage agressif.** Les icônes sont en `currentColor` (donc re-thématisées par le
  mood). L'état actif peut recevoir un léger fond `--surface-2` arrondi (`--radius-full`).
- **Emojis comme totems de mood.** Chaque mood garde son emoji signature (🌙 💗 👑 ✨ ☁️ 🪩) — chaleureux,
  universel, sans traduction, parfait pour une débutante.
- **Badges d'origine :** `perso` (cœur/maison) vs `web` (globe + libellé « À tester »), toujours
  distincts pour respecter la séparation Dressing / Découvertes.

---

## 5. Mouvement & animation

La règle d'or : **satiné, jamais nerveux.** Le mouvement doit évoquer du tissu qui retombe.

- **Easings :** `--ease` (sortie douce, pour l'UI courante) et `--ease-spring` (léger rebond
  *tendre*, pour les apparitions joyeuses — cartes, résultat d'essayage, sélection de mood).
- **Durées :** `--dur-fast` (140ms, retours tactiles), `--dur` (240ms, transitions standard),
  `--dur-slow` (480ms, changements d'ambiance / dégradés de fond).
- **Transition de mood = le moment « waouh ».** Les jetons couleur sont animés (`transition` sur
  `background`, `color`, `border-color`) → quand on change de mood, **toute l'app fond** d'une
  ambiance à l'autre en douceur (~480ms).
- **Micro-interactions :** boutons qui s'enfoncent et se soulèvent (`:active` → `scale(.97)`),
  cartes interactives qui montent à l'effleurement, halo `--ring` au focus (accessibilité).
- **États d'attente jolis :** `.shimmer` (vague de lumière qui traverse) pour les chargements de
  vignettes, `.spinner` doux pour la génération IA — *jamais* une simple roue triste.
- **Respect de l'utilisatrice :** prévoir `@media (prefers-reduced-motion)` côté intégration pour
  neutraliser les animations non essentielles.

---

## 6. Les 6 moods (une ambiance = une heure du jour)

Chaque mood redéfinit les jetons sémantiques *et* `--gradient-hero`. Couleurs pensées pour être
belles **et** lisibles.

- 🌙 **Cosy / Chill** — *Le soir sous un plaid.* Terracotta tiède, caramel et crème latte sur un
  fond sable réconfortant. Lumière de bougie, cocooning. Musique lo-fi douce.

- 💗 **Romantique** — *L'aube rose.* Rose poudré, framboise tendre et pétale, sur un blush laiteux.
  Doux, amoureux, rêveur. Piano / R&B caressant.

- 👑 **Confiance / Boss** — *Le velours du soir.* Prune profonde, magenta affirmé et touches d'or
  rose sur un fond aubergine sombre — le seul mood « dark », pour se sentir puissante. Pop
  *empowering*.

- ✨ **Glow / Énergique** — *Le plein soleil.* Corail vif, pêche et or chaud sur une crème
  lumineuse. Pétillant, solaire, vitaminé. Pop entraînante.

- ☁️ **Rêveuse / Dreamy** — *La tête dans les nuages.* Lavande, lilas et bleu-ciel laiteux sur un
  brouillard mauve très clair. Éthéré, flottant, apaisant. Ambient.

- 🪩 **Fun / Y2K** — *La boule à facettes.* Fuchsia bonbon, cyan électrique et citron sur un fond
  lilas pâle pop. Ludique, espiègle, pétillant — sans jamais agresser l'œil. Pop Y2K.

---

## 7. Fichiers livrés

| Fichier | Contenu |
|---------|---------|
| `styles/tokens.css` | Jetons de base sur `:root` (fondation non-colorée + palette par défaut « Blush Champagne ») + reset/base global. |
| `styles/moods.css` | Les 6 palettes `:root[data-mood="…"]` qui surchargent les jetons sémantiques. |
| `styles/components.css` | Tous les composants UI stylés **uniquement** via les jetons → un changement de mood re-thématise tout. |

**Ordre d'inclusion recommandé :** `tokens.css` → `moods.css` → `components.css`.

```html
<link rel="stylesheet" href="/styles/tokens.css">
<link rel="stylesheet" href="/styles/moods.css">
<link rel="stylesheet" href="/styles/components.css">
```

Et sur la balise racine : `<html lang="fr" data-mood="romantic">` (mood par défaut au choix).
