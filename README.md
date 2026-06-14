# Anjed's Closet 💛

Application d'essayage virtuel de vêtements par IA — **PWA** mobile-first, pensée pour Anjed.
Essaie sur toi les vêtements de **ta garde-robe** (photographiés) et des **articles repérés en
ligne**, avec **historique**, **suggestions de tenues** et une **ambiance (musique + couleurs)
pilotée par le mood**.

Concept produit complet : voir [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md).
Direction artistique : voir [`DESIGN.md`](./DESIGN.md).

## Stack
- **Next.js (App Router) + TypeScript**, PWA installable (manifest + service worker).
- **Stockage 100 % local** (IndexedDB) — photos et dressing restent sur l'appareil.
- **IA d'essayage** : Google Gemini 2.5 Flash Image (« Nano Banana ») via une route serveur.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigne GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Clé API gratuite : https://aistudio.google.com/apikey

## Build & déploiement

```bash
npm run build && npm start
```

Déploie sur un hébergeur gratuit en HTTPS (Vercel, Netlify…). Définis la variable
d'environnement **`GEMINI_API_KEY`** (et éventuellement `GEMINI_MODEL`).
Une fois en ligne : ouvre l'URL sur le téléphone → **« Ajouter à l'écran d'accueil »** →
l'icône apparaît et l'app s'ouvre en plein écran, **sans App Store**.

## Scripts utiles
- `node scripts/gen-icons.mjs` — régénère les icônes PWA (cœur dégradé, sans dépendance).
- Musiques d'ambiance : voir [`public/music/README.md`](./public/music/README.md).

## Confidentialité
Les données restent sur l'appareil. Lors d'un essayage, la photo est envoyée à l'IA de Google
uniquement pour générer l'image. Réglages → « Tout effacer » supprime tout localement.
