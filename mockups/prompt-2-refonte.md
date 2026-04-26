# Prompt Claude Code — Refonte UX/UI des écrans Violette

> À coller dans Claude Code **après** que le design system de la Phase 1 (`mockups/prompt-1-design-system.md`) ait été produit, validé et mergé.

---

## 1. Contexte

Violette est une PWA mobile-first de gestion de plantes d'intérieur (Next.js 14 App Router + TypeScript + Tailwind CSS + Prisma). Cf. `CLAUDE.md` à la racine.

Le **design system Violette** est désormais en place dans `src/design-system/` (tokens, composants atomiques, icônes custom, module de viz `/design-system` en dev). Direction : **Herbier moderne** — terracotta, mousse, papier, Fraunces + Plus Jakarta Sans, formes organiques, personnification douce.

Les maquettes de référence sont dans `mockups/variation-a-herbier.html` (à ouvrir dans un navigateur pour comprendre le rendu attendu).

**Cette tâche** : refondre les écrans existants en s'appuyant **exclusivement** sur le design system. Ne réinventer aucun composant déjà disponible. La logique métier reste **strictement intacte**.

## 2. Contraintes git (non négociables)

- Travailler **exclusivement sur la branche courante**.
- Commandes git **lecture seule uniquement** : `git status`, `git diff`, `git log`, `git show`, `git branch --show-current`.
- **Strictement interdit** : `git add`, `git commit`, `git push`, `git stash`, `git checkout` (changement de branche), `git merge`, `git rebase`, `git reset`, `git restore`. C'est moi qui commit.

## 3. Workflow (cf. CLAUDE.md §3)

Pour **chaque écran** refondu :

1. **Lire l'existant** — page, composants imbriqués, hooks, props passées par les server components.
2. **Plan numéroté** — fichiers modifiés, composants DS utilisés, comportements préservés, animations ajoutées, points d'attention (notamment ce qui pourrait casser un test ou un appel d'API).
3. **Attendre mon "ok / go / valide"** avant de coder.
4. **Exécution** par étape ; arrêt si problème non prévu.
5. **Récap** par écran : avant / après, fichiers touchés, commandes à lancer, TODO laissés.

**Ne jamais refondre plusieurs écrans en parallèle**. Un écran à la fois, validé, puis le suivant.

## 4. Périmètre

### Écrans à refondre (dans cet ordre)

L'ordre est choisi pour aller du plus simple/contenu au plus complexe :

1. **Login** (`src/app/login/`) — formulaire simple, bon écran pour roder le pattern.
2. **Bottom Navigation** (`src/components/Nav.tsx` ou équivalent) — composant transverse, à finaliser tôt.
3. **Dashboard** (`src/app/page.tsx`) — l'écran d'accueil, avec sections "À arroser" / "Cette semaine".
4. **Liste des plantes** (`src/app/plants/page.tsx`) — grille des plantes.
5. **Détail plante** (`src/app/plants/[id]/page.tsx`) — fiche complète, peak moment du `WaterCTA`.
6. **Ajout plante** (`src/app/plants/new/page.tsx`) — formulaire long, attention à la fluidité.
7. **Édition plante** (`src/app/plants/[id]/edit/page.tsx`) — réutiliser les patterns de l'ajout.
8. **Settings** (`src/app/settings/page.tsx`) — sections + permissions notif.

**Validation explicite requise après chaque écran** avant de passer au suivant.

### Composants transverses

À refondre **avant** ou **avec** le premier écran qui les utilise :

- `PlantCard` (utilisé dans Dashboard et Liste)
- `WaterButton` → remplacé par `WaterCTA` du DS
- `PlantForm` (utilisé dans Ajout et Édition)
- `PhotoUpload`
- `NotificationPermission` (dans Settings)
- `LogoutButton` (dans Settings)

## 5. Règles UX/UI à respecter (Laws of UX — https://lawsofux.com)

Toute décision de design doit être traçable à au moins une loi. Citer la loi dans un commentaire JSDoc sur les composants ou pages où elle est appliquée.

- **Fitts's Law** — zones tactiles ≥ 44×44 px ; CTA principal en bas (zone du pouce).
- **Hick's Law** — bottom nav ≤ 3 items (Home / FAB ajout / Mes plantes). Dashboard découpé en 2 sections seulement.
- **Jakob's Law** — conventions mobiles préservées : bottom nav, swipe, pull-to-refresh si applicable, scroll vertical.
- **Law of Proximity** — info plante (photo + nom + statut + CTA) groupée dans une seule carte.
- **Law of Common Region** — chaque entité = une `<Card>` du DS (radius organique).
- **Aesthetic-Usability Effect** — texture papier, ombres `paper`/`lift`, animations soignées sur chaque interaction.
- **Miller's Law** — 7±2 éléments max par écran sans regroupement. Grille 2×2 ou 2×3 maximum sans pagination/scroll.
- **Doherty Threshold** — feedback en < 400 ms : loader, animation, ou skeleton state.
- **Peak-End Rule** — soigner le `WaterCTA` (peak) et écran de confirmation post-arrosage (end positif). Soigner aussi la confirmation post-ajout d'une plante (peak du onboarding).
- **Von Restorff Effect** — `terracotta-500` réservé au CTA principal et badges urgents. Si plus d'une couleur saturée par écran, justifier.

## 6. Règles de développement

### Mobile-first strict

- Viewport cible 320–430 px de large.
- Aucune media query desktop dans les écrans (le module DS peut en avoir, lui).
- Layout tester à 375×667 (iPhone SE) et 430×932 (iPhone 15 Pro Max).

### Performance

- Animations en `transform` et `opacity` uniquement.
- `will-change` uniquement sur les éléments animés en boucle.
- **Lazy-loading des images de plantes** : utiliser `next/image` avec `placeholder="blur"` quand possible. Vérifier que les blobs en base de données (cf. `CLAUDE.md` v2 — photos BLOB) sont servis via une route qui supporte l'optimisation `next/image` ou via une URL data:.
- **Pagination ou virtualisation** si la liste de plantes peut dépasser 30 items (sinon non requis pour 4-5 utilisateurs familiaux).

### Accessibilité

- Contraste WCAG AA minimum (4.5:1 pour le texte de corps, 3:1 pour le texte large).
- États focus visibles via les composants DS.
- `aria-label` sur tous les boutons icône.
- Respect `prefers-reduced-motion` (déjà implémenté globalement par le DS).
- Form fields avec `<label htmlFor>` ou `aria-label`.
- Status messages (succès arrosage, erreur form) en `role="status"` ou `role="alert"` selon criticité.

### Animations (framer-motion)

- **Page transitions** : utiliser `<AnimatePresence>` pour les transitions entre listes/détail. Slide horizontal lors d'une navigation push, fade pour les modales.
- **Cards stagger** : entrée des `PlantCard` avec stagger 50-70ms.
- **WaterCTA** : déjà packagé dans le DS, l'utiliser tel quel.
- **Erreurs de form** : `shake` horizontal court (translateX -6 +6 -4 +4 0) sur le champ invalide.
- **Tap feedback** : `whileTap={{ scale: 0.96 }}` sur les Cards interactives et boutons.

### Personnification (bulles `PlantBubble`)

Le composant `PlantBubble` est déjà dans le DS. Cette tâche doit :

1. **Créer une lib de messages** : `src/lib/personification/messages.ts`.
   - Catégories : `greeting`, `thirsty`, `watered_thanks`, `long_time_no_see`, `seasonal`, `general`.
   - 6 à 10 messages par catégorie, en français, avec parfois un emoji.
   - Type strict : `{ category: PersonificationCategory; text: string }[]`.

2. **Créer un sélecteur** : `src/lib/personification/select.ts`.
   - Fonction pure `pickMessage(plant: Plant, now: Date): PersonificationMessage | null`.
   - Règles :
     - Si `daysSinceLastWater` > `wateringFrequency + 2` → catégorie `thirsty` (probabilité 70%).
     - Si arrosée il y a < 6h → `watered_thanks` (probabilité 50%).
     - Si pas vue dans l'app depuis > 7 jours → `long_time_no_see` (probabilité 60%).
     - Sinon → `greeting` ou `general` (probabilité globale 25%).
   - Doit être déterministe pour une plante donnée et un jour donné (utiliser un seed `plant.id + dateString` pour avoir le même message toute la journée).

3. **Tests Vitest** : `tests/personification.test.ts` couvrant les 4 règles.

4. **Affichage** : dans `PlantCard`, appeler `pickMessage` côté client une seule fois au mount. Si message non null, l'afficher via `<PlantBubble>` avec une position randomisée parmi les 4 positions disponibles.

5. **Pas plus de 30% des cards visibles ne portent une bulle simultanément** — pour rester subtil. Implémenter ce cap dans le rendu de la liste (pas dans `pickMessage`).

## 7. Écran de confirmation post-arrosage (peak-end)

À ajouter : un écran/modale de confirmation après que l'utilisateur a tapé "Je viens de l'arroser".

- Animation : burst de gouttelettes (3-5 SVG) → checkmark organique → fade vers le retour à la fiche plante.
- Message : phrase chaleureuse en Fraunces italic, ex. *"Mona te dit merci."*
- Durée totale : 1.2-1.8s, puis dismiss automatique.
- Préserver l'interaction réseau : la mutation API se fait en parallèle de l'animation. Si elle échoue, on annule l'animation et on affiche une erreur (shake + message).

## 8. Périmètre exclu (NE PAS toucher)

- ❌ Logique métier dans `src/lib/` (sauf création de la lib personnification listée plus haut).
- ❌ Routes API (`src/app/api/*`).
- ❌ `src/middleware.ts` et tout `src/lib/auth/`.
- ❌ `prisma/schema.prisma` et migrations.
- ❌ Service worker, manifest PWA, config push, VAPID.
- ❌ Backend de notifications (`src/lib/push/`, `scripts/cron.ts`).
- ❌ Module `/design-system` (déjà fait en Phase 1, ne pas régresser).
- ❌ Pas de refactor non sollicité (pas de réécriture de logique fonctionnelle, pas de réorganisation de dossiers en dehors de la refonte UI).

## 9. À chaque écran refondu — checklist

- [ ] Composants DS utilisés (pas de re-création locale d'un composant déjà disponible).
- [ ] Aucune classe Tailwind hardcodée pour des couleurs en dehors des tokens (`terracotta-*`, `moss-*`, `paper-*`, `ink-*`).
- [ ] Toutes les interactions ont un feedback < 400 ms.
- [ ] Tous les boutons icône ont un `aria-label`.
- [ ] Animations désactivées si `prefers-reduced-motion`.
- [ ] La logique métier (props server, mutations API, validation Zod) est inchangée — seul le rendu est refait.
- [ ] L'écran fonctionne en mode hors-ligne PWA (si l'écran a déjà cette capacité aujourd'hui).
- [ ] `npm run build` passe.
- [ ] `npm test` passe.
- [ ] Tester à la main sur viewport 375×667 et 430×932.

## 10. Livrables attendus en fin de Phase 2

1. Tous les écrans listés en §4 refondus.
2. `lucide-react` peut être supprimé du `package.json` **uniquement si** aucun import résiduel n'existe (à vérifier via `grep` avant suppression — demander confirmation).
3. Code et commentaires en anglais, textes UI en français.
4. Tests Vitest pour la lib personnification.
5. Aucune régression fonctionnelle : ajout, édition, suppression, arrosage, notification, login, logout, settings — tout doit fonctionner comme avant.
6. Le module `/design-system` reste accessible en dev et reflète éventuellement les nouveaux composants ajoutés en cours de route (le mettre à jour si pertinent).
7. Récap final listant : écrans refondus, composants DS ajoutés, dépendances modifiées, points d'attention pour la mise en prod Railway.

## 11. Règle d'or

> Si un design choice ne peut pas être justifié par une **Law of UX** ou par cohérence avec le DS existant, **il ne doit pas être implémenté**. Préfère ouvrir une question dans le plan de l'écran que d'inventer un pattern hors système.

---

**Démarre par l'écran 1 (Login) : audit lecture seule de l'existant, puis plan numéroté. N'écris aucun code avant validation explicite de ma part.**
