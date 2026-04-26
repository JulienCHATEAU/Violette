# CLAUDE.md

Ce fichier est lu automatiquement par Claude Code à chaque session. Il décrit le projet, les conventions et la manière dont je veux travailler avec toi (Claude). Lis-le intégralement avant toute action.

---

## 1. Projet

Application web de **gestion de plantes** à usage familial (4-5 utilisateurs max).
Fonctionnalités actuelles : CRUD plantes, photos, suivi d'arrosage, notifications push, auth maison, cron pour rappels et messages.

**Utilisateurs cibles** : moi + ma famille, accès distant prévu (Railway).
**Langue** : interface en français, code et commentaires en anglais.

---

## 2. Stack

- **Framework** : Next.js (App Router) + TypeScript
- **Styling** : Tailwind CSS
- **DB** : Prisma + SQLite **en dev** / Postgres **en prod** (à venir)
- **Auth** : maison (password hashé + session cookie), voir `src/lib/auth/`
- **Validation** : Zod (`src/lib/zod-schemas.ts`)
- **PWA** : service worker + workbox (généré dans `public/`)
- **Push** : web-push + VAPID (`src/lib/push/`)
- **Tests** : Vitest sur la logique pure de `src/lib/`
- **Déploiement cible** : Railway (le `vercel.json` actuel est legacy, à clarifier)

---

## 3. Workflow attendu

### Pour toute tâche non triviale, tu suis ces 5 étapes, dans l'ordre :

1. **Analyser** — Lis les fichiers concernés. N'invente pas l'existant. Si quelque chose est ambigu, pose **une** question avant de continuer.
2. **Proposer un plan** — Numéroté, avec : objectif, fichiers impactés (créés/modifiés/supprimés), risques, et ce qui est *hors scope*.
3. **Attendre validation explicite** — Ne code pas avant un "ok / go / valide". Une question de ma part n'est pas une validation.
4. **Exécuter étape par étape** — Si une étape révèle un problème non prévu, tu t'arrêtes et tu me préviens avant de dévier du plan.
5. **Récap final** — Liste : ce qui a été fait, ce qui reste, points d'attention (warnings, dette, TODO laissés), commandes à lancer (migrations, tests, build).

### Tâches triviales (workflow allégé) :

Typo, renommage local, ajustement de style mineur, ajout d'un commentaire, formatage. Tu peux y aller direct, mais tu fais quand même un récap court.

### Si tu hésites sur le niveau de la tâche

Considère-la comme non triviale. Le coût d'un plan inutile est faible, le coût d'une exécution non alignée est élevé.

---

## 4. Conventions de code

### Structure App Router
- **Server Components par défaut**, `"use client"` uniquement si nécessaire (état, événements, hooks navigateur).
- Les **API routes** vivent dans `src/app/api/<resource>/route.ts`. Une route = une ressource. Sous-actions en sous-routes (ex: `plants/[id]/water`).
- Le **middleware** (`src/middleware.ts`) gère l'auth route-level. Ne pas dupliquer la logique d'auth dans chaque route.

### Logique métier
- Toute logique testable vit dans `src/lib/`, pas dans les composants ni dans les routes.
- Les routes API sont des **adaptateurs** : parse + valide (Zod) + appelle `lib/` + retourne.
- Les schémas Zod sont centralisés dans `src/lib/zod-schemas.ts`.

### Prisma
- Toute modification de schéma → migration nommée explicitement (`npx prisma migrate dev --name <verbe_objet>`).
- Pas de `prisma db push` en dehors d'expérimentations locales jetables.
- Le client Prisma est instancié **une seule fois** dans `src/lib/db.ts`.

### Composants
- Composants réutilisables dans `src/components/` (PascalCase).
- Composants liés à une page restent dans le dossier de la page (ex: `src/app/login/LoginForm.tsx`).
- Tailwind only, pas de CSS modules ni de styled-components.

### Tests
- Vitest, fichiers dans `tests/` à la racine, nommés `<module>.test.ts`.
- On teste la logique pure (`lib/`), pas les composants ni les routes API pour le moment.
- Toute nouvelle fonction non triviale dans `lib/` mérite un test.

### Commits
- Conventional commits : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Une feature = une branche dédiée (`feat/<nom-court>`).

---

## 5. Tests — règle systématique

Les tests ne sont pas optionnels. Toute tâche qui ajoute ou modifie du comportement doit s'accompagner de tests.

### Règle générale

À chaque ajout ou modification de fonctionnalité touchant `src/lib/` (ou toute logique métier testable que tu juges critique), tu dois :

1. **Si des tests existent** pour le module concerné → les **mettre à jour** pour couvrir le nouveau comportement, et vérifier que les tests existants passent toujours (ou les adapter si la modification est intentionnelle, en le signalant explicitement dans le récap).
2. **Si aucun test n'existe** pour le module concerné → **créer** le fichier de test correspondant et couvrir au minimum la fonctionnalité ajoutée/modifiée. Ne tente pas de couvrir tout le module historique en une fois ; signale dans le récap ce qui reste à couvrir.
3. **Lancer les tests** (`npm test`) en fin de tâche et inclure le résultat dans le récap.

### Inclus dans le plan

Quand tu présentes ton plan (étape 2 du workflow), tu dois explicitement lister :
- Les fichiers de test créés ou modifiés
- Les cas de test prévus (en une ligne chacun)
- Les cas que tu choisis volontairement de **ne pas** couvrir, avec la raison

Si je valide un plan qui n'inclut pas de tests pour un changement de logique, considère que c'est un oubli de ma part et redemande confirmation.

### Conventions de tests

- **Framework** : Vitest
- **Emplacement** : `tests/<module>.test.ts` à la racine, miroir du nom du fichier source (`src/lib/watering.ts` → `tests/watering.test.ts`)
- **Périmètre** : logique pure de `src/lib/`. On ne teste **pas** : les composants React, les routes API (pour le moment), le code Prisma direct (on mocke ou on isole la logique).
- **Style** : `describe` par fonction publique, `it` par cas. Nommer les `it` en anglais sous la forme `"returns X when Y"` ou `"throws when Z"`.
- **Cas à couvrir par défaut** pour chaque fonction non triviale :
  - Cas nominal (happy path)
  - Cas limites (valeurs vides, zéro, négatives, dates aux frontières)
  - Cas d'erreur (entrées invalides, exceptions attendues)
  - Effets de bord si applicable (mutations, appels externes mockés)
- **Pas de test trivial** : ne pas tester des getters, des constantes, ou du code généré (Prisma, types Zod inférés).
- **Données de test** : préfère des fixtures locales au test plutôt que des helpers globaux, sauf si vraiment réutilisé 3+ fois.
- **Mocks** : `vi.mock()` pour les modules, `vi.fn()` pour les fonctions. Pas de mock de Prisma direct si la logique peut être extraite et testée sans DB.

### Exception

Tâches qui **n'exigent pas** de tests : modifications purement visuelles (Tailwind, layout), renommage, typos, ajout de commentaires, mise à jour de documentation. Dans ces cas, mentionne-le explicitement dans le plan ("pas de test nécessaire car X").

---

## 6. Roadmap (3 objectifs prioritaires)

Voir `docs/roadmap.md` pour le détail. Ordre figé :

1. **Refonte UX** — branche `refonte-ux`. Audit des composants, design system minimal, refonte page par page.
2. **Feature game-changer** — Identification/diagnostic des plantes via photo, en utilisant l'API Claude. Appel **côté serveur uniquement** (la clé ne doit jamais atteindre le client).
3. **Mise en prod Railway** — Migration SQLite → Postgres, stockage photos sur volume persistant Railway (pas `public/uploads` qui est éphémère), variables d'env, cron, PWA en HTTPS.

Ne pas commencer un objectif tant que le précédent n'est pas validé, sauf demande explicite de ma part.

---

## 7. Zones à risque / pièges connus

- **`public/uploads`** : ne survit pas en prod sur Railway. Toute évolution du flux photo doit garder en tête la migration vers volume persistant. Voir ADR à venir dans `docs/decisions.md`.
- **SQLite vs Postgres** : certaines features Prisma diffèrent. Avant tout usage exotique, vérifier la compat Postgres.
- **`vercel.json`** : legacy. Ne pas s'appuyer dessus, ne pas l'enrichir. À supprimer lors de la phase Railway.
- **Service worker** : `public/sw.js` est généré. Ne pas l'éditer à la main. Idem `workbox-*.js`.
- **VAPID keys** : générées par `scripts/generate-vapid.ts`. Ne jamais les committer. Vérifier `.gitignore`.
- **Auth maison** : OK pour usage familial, mais ne pas étendre la surface (pas d'OAuth, pas de reset password par email, pas de rôles complexes) sans en rediscuter.
- **`scripts/user-create.ts`** : création de comptes en CLI. Pour la famille, prévoir une vraie UX d'admin avant la mise en prod.

---

## 8. Commandes utiles

```bash
# Dev
npm run dev

# Tests
npm test
npm test -- --watch

# Prisma
npx prisma migrate dev --name <verbe_objet>
npx prisma studio
npx prisma generate

# Scripts
npx tsx scripts/user-create.ts
npx tsx scripts/generate-vapid.ts
npx tsx scripts/cron.ts

# Build prod
npm run build
npm start
```

> Si tu as besoin d'une commande qui n'est pas listée ici, propose-la dans ton plan, ne l'invente pas en cours d'exécution.

---

## 9. Règles de communication

- **Réponds en français** avec moi, sauf si je te demande autre chose.
- **Pas de flatterie** ("Excellente question !", "Bien sûr !"). Va droit au but.
- **Si tu n'es pas sûr**, dis-le. Une hypothèse explicite vaut mieux qu'une affirmation hasardeuse.
- **Si tu détectes une incohérence** entre ma demande et l'existant, signale-la avant d'exécuter.
- **Si tu vois une amélioration hors scope**, mentionne-la dans le récap final, ne l'implémente pas.

---

## 10. Ce que tu ne fais jamais sans validation explicite

- Modifier `prisma/schema.prisma` ou créer une migration.
- Toucher au middleware ou à la logique d'auth.
- Modifier le service worker ou la config PWA.
- Installer une nouvelle dépendance npm.
- Supprimer du code existant qui n'est pas directement lié à la tâche.
- Faire un `git push`, un `git rebase`, ou réécrire l'historique.
- Lancer une migration Prisma en mode prod.