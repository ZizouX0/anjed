# Atelier Anjed's Closet — orchestration multi-agents

Ce document décrit l'équipe d'agents qui construit et améliore **Anjed's Closet**, et la
façon dont ils travaillent ensemble en **cycles** sous la direction d'un chef d'orchestre
**très exigeant**.

## L'équipe

| Agent | Rôle | Périmètre |
|-------|------|-----------|
| 🎼 **Chef d'orchestre** (« loop master ») | Dirige tout. Définit le standard de qualité, distribue le travail, **critique sans complaisance**, décide ce qu'on garde, fait recommencer jusqu'à l'excellence. | Coordination, implémentation du cœur, arbitrage. |
| 🎨 **Agent Design** | Identité visuelle et nouveaux écrans (concept « Soie & Lumière »). | `DESIGN.md`, `styles/*` uniquement. |
| 🧪 **Agent Test** | Écrit et exécute les tests, garde le build vert, traque les régressions. | Tests + config de test uniquement. |
| 🔭 **Agent Chercheur** | Étudie les apps concurrentes, propose fonctionnalités et nouveautés, **en boucle**. | `docs/RECHERCHE_CONCURRENTS.md` uniquement. |

## Le standard (le « très très exigeant »)

Un livrable n'est accepté par le chef d'orchestre que s'il coche **tout** :

1. **Esthétique irréprochable** — digne d'être montré ; aucune approximation visuelle.
2. **Intuitif pour une débutante totale** — évident au premier regard, zéro jargon.
3. **Zéro régression** — `npm run build` vert, types stricts OK, tests au vert.
4. **Fidèle à l'ADN** — personnel, féminin, sensoriel (mood = musique + couleurs).
5. **Qualité & conformité** — accessibilité, performance mobile, RGPD (données locales),
   musiques libres de droits.

Si un seul point manque → **on recommence**. Pas de « c'est presque bon ».

## Le cycle (la boucle)

```
①  Chercheur  →  idées & veille concurrentielle
②  Chef d'orchestre  →  critique + priorisation impitoyable (top features)
③  Design  →  écrans / composants des features retenues
④  Chef d'orchestre  →  implémentation du cœur
⑤  Test  →  vérification, build, non-régression
⑥  Chef d'orchestre  →  revue exigeante  →  ✅ on garde   ou   🔁 on refait
```

**Critères de sortie d'un cycle :** la/les feature(s) du cycle passent les 5 points du standard,
le build est vert, les tests passent, et le rendu est jugé « beau et évident » par le chef
d'orchestre.

## Cadence & honnêteté technique

- Les agents **ne tournent pas en démon autonome infini** : ils s'exécutent jusqu'à livrer.
- Le chef d'orchestre relance les cycles : soit **à la suite** (round après round), soit en
  **itérations planifiées** récurrentes.
- À chaque round : on intègre la veille du chercheur, on fait travailler design + test, on
  critique, on itère. La boucle s'arrête quand Anjed dit stop ou quand le standard est tenu
  sur tout le périmètre visé.

## Journal des cycles

- **Cycle 0** — Fondations : PWA, dressing, découvertes web, essayage IA (Gemini), historique,
  combos, mood (musique + couleurs), design « Soie & Lumière », build vert. ✅
- **Cycle 1** — Veille concurrentielle (Chercheur) + tests unitaires (Test, 35 verts) →
  priorisation impitoyable. ✅
- **Cycle 2** — Styliste IA conversationnelle, « améliorer la photo », comparer des looks,
  lookbooks & agenda ; design des nouveaux écrans (Soie & Lumière) ; build vert + 35 tests. ✅
- **Cycle 3** — DevOps (CI + E2E) + audit accessibilité (web-design-guidelines) + captures
  réelles (webapp-testing). _en cours_
