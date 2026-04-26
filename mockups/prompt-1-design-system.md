# Prompt Claude Code — Design System Violette + Module de visualisation

> À coller dans Claude Code. Le prompt est auto-portant : il s'appuie sur `CLAUDE.md` pour le contexte projet et n'a pas besoin de cette conversation.

---

## 1. Contexte

Violette est une PWA mobile-first de gestion de plantes d'intérieur (Next.js 14 App Router + TypeScript + Tailwind CSS + Prisma). Cf. `CLAUDE.md` à la racine.

Une refonte UX/UI complète a été décidée. La direction visuelle retenue est **Herbier moderne** (terracotta, mousse, papier, typo serif Fraunces). Les maquettes de référence sont dans `mockups/variation-a-herbier.html` (à ouvrir dans un navigateur pour comprendre la direction).

**Cette tâche** : produire le **design system** dans la codebase et un **module de visualisation** pour parcourir les composants. La refonte des écrans existants se fera dans un second temps — **ne pas y toucher pour l'instant**.

## 2. Contraintes git (non négociables)

- Travailler **exclusivement sur la branche courante**.
- Commandes git **lecture seule uniquement** : `git status`, `git diff`, `git log`, `git show`, `git branch --show-current`.
- **Strictement interdit** : `git add`, `git commit`, `git push`, `git stash`, `git checkout` (changement de branche), `git merge`, `git rebase`, `git reset`, `git restore`. C'est moi qui commit.

## 3. Workflow (cf. CLAUDE.md §3)

1. **Audit lecture seule** : lis `tailwind.config.ts`, `src/app/globals.css`, `src/components/`, `package.json`. Vérifie la version exacte de Next.js, Tailwind, et la liste actuelle des dépendances.
2. **Plan numéroté** : objectif, fichiers créés/modifiés, dépendances à installer (avec mes validations explicites requises), risques, hors scope.
3. **Attendre mon "ok / go / valide"** avant de coder.
4. **Exécution étape par étape**. Si une étape révèle un problème non prévu, t'arrêter et me prévenir.
5. **Récap final** : fait / reste / points d'attention / commandes à lancer.

## 4. Direction visuelle — Herbier moderne (Variation A validée)

### Palette

```ts
// Étendre tailwind.config.ts > theme.extend.colors
colors: {
  terracotta: { 50:'#FBF1EC', 100:'#F1D8CC', 200:'#E5BBA8', 400:'#D17B5C', 500:'#C4583E', 600:'#A8402A', 700:'#7A2A1A' },
  moss:       { 50:'#EFF1EA', 100:'#DBE0CC', 200:'#B9C3A0', 400:'#7D8E6A', 500:'#5C6F4F', 600:'#445436', 700:'#2D3A22' },
  paper:      { 50:'#FAF6EC', 100:'#F4ECDD', 200:'#E9DEC4', 300:'#D9C9A4' },
  ink:        { 400:'#8C7A6E', 600:'#5A4A40', 800:'#2B1F1A', 900:'#1A1310' },
}
```

- **`terracotta-500` = couleur d'action** (CTA Arroser, badges urgence) — utilisée avec parcimonie pour respecter le **Von Restorff Effect**.
- **`moss-500` = couleur secondaire végétale** (états "tranquille", indicateurs neutres positifs).
- **`paper-50/100` = backgrounds**.
- **`ink-800` = texte principal**.
- Vérifier les contrastes WCAG AA (≥ 4.5:1) avec `ink-800` sur `paper-50` et `terracotta-500` sur `paper-50`.

### Typographie

À intégrer via **`next/font/google`** (zéro impact perf en prod, pas d'install npm).

- **Fraunces** (titres, accents en italique) — opsz variable 9..144, poids 400/500/600/700.
- **Plus Jakarta Sans** (corps, UI) — poids 400/500/600/700.

Variables CSS à exposer dans `globals.css` : `--font-serif` et `--font-sans`. Étendre `tailwind.config.ts > fontFamily` pour les utiliser via `font-serif` et `font-sans`.

### Border radius organiques

```ts
borderRadius: {
  'organic-1': '28px 36px 28px 40px',
  'organic-2': '36px 28px 40px 28px',
  'organic-3': '32px 32px 40px 28px',
  'pill-organic': '22px 26px 22px 26px',
}
```

### Ombres papier

```ts
boxShadow: {
  'paper': '0 1px 2px rgba(43,31,26,.06), 0 8px 24px -12px rgba(43,31,26,.18)',
  'lift':  '0 2px 4px rgba(43,31,26,.08), 0 18px 38px -16px rgba(43,31,26,.25)',
  'press': 'inset 0 2px 4px rgba(43,31,26,.10)',
}
```

### Motion

```ts
transitionTimingFunction: {
  'spring': 'cubic-bezier(.34, 1.56, .64, 1)',
  'organic': 'cubic-bezier(.4, 0, .2, 1)',
},
transitionDuration: {
  '180': '180ms',
  '250': '250ms',
  '400': '400ms', // Doherty Threshold limit
}
```

Toute animation > 400ms doit être justifiée (sauf bulles flottantes décoratives en boucle).

### Texture papier (helper CSS)

À ajouter dans `globals.css` :

```css
.paper-grain {
  background-image:
    radial-gradient(rgba(90,74,64,.04) 1px, transparent 1px),
    radial-gradient(rgba(90,74,64,.03) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
}
```

## 5. Dépendances à installer (validation requise avant)

- **`framer-motion`** (~50 KB gzip) — pour les micro-interactions, transitions de page, gestures. Demander mon ok dans le plan avant `npm install`.

Pas d'autre dépendance pour cette tâche.

## 6. Composants atomiques à produire (vague 1)

Tous dans `src/design-system/components/`. Tous typés strictement, tous avec `forwardRef`, tous avec une prop `className` qui s'ajoute via `clsx` (lib déjà présente — sinon `cn()` helper local, à vérifier dans l'audit).

### `Typography`
- `<H1>`, `<H2>`, `<H3>` — Fraunces, tailles dégressives.
- `<Body>`, `<Caption>` — Plus Jakarta Sans.
- `<Label>` — uppercase, tracking large, semibold, taille 11px.
- `<Italic>` — Fraunces italic pour noms scientifiques.

### `Button`
Variants :
- `cta` — terracotta-500 → terracotta-600 gradient, `shadow-paper`, `border-radius: pill-organic`. Animation `:active` scale .96 + box-shadow `press`.
- `secondary` — fond `paper-50`, border `paper-300`, texte `ink-800`.
- `ghost` — pas de fond, texte `ink-800`.
- `icon` — circulaire, 40×40 ou 48×48, fond paper-50/95 avec backdrop-blur.

Tailles : `sm` (36px h), `md` (44px h, **Fitts's Law min**), `lg` (56px h, peak moments).

État `:active` animé via framer-motion (`whileTap={{ scale: 0.96 }}`). Respect `prefers-reduced-motion`.

### `Card`
Props : `radius` (`organic-1` | `organic-2` | `organic-3` | `pill-organic`), `elevation` (`flat` | `paper` | `lift`), `padding`. Background blanc par défaut.

### `Input`
- `<TextInput>` — radius organique, focus ring `terracotta-500/12%`, placeholder italique Fraunces.
- `<NumberStepper>` — boutons − / + circulaires de chaque côté, valeur centrale en Fraunces 3xl.
- `<SegmentedControl>` — pour le choix de lumière (Faible / Indirecte / Vive), avec icône emoji ou SVG, sélection en `terracotta-500`.

### `Badge`
Variants : `urgent` (terracotta-500 fond), `soon` (paper-200 fond), `ok` (moss-100 fond, moss-700 texte), `info` (paper-100). Avec ou sans icône leading.

### `PlantBubble` (composant signature)
La bulle de personnification post-it. Props :
- `message: string` (obligatoire)
- `position: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'`
- `tilt?: number` (degrés, défaut -3)
- `size?: 'sm' | 'md'`

Style : fond `terracotta-50`, border `terracotta-200`, font Fraunces italic, queue de bulle en triangle CSS, animation `bubble-float` 5s ease-in-out infinite (rotation + translateY). Désactivée si `prefers-reduced-motion`.

### `Icon` (wrapper)
Set custom de **~12 icônes SVG inline** dessinées spécifiquement pour Violette (line art arrondi, stroke 1.6px, stroke-linecap round). À créer dans `src/design-system/icons/` :

- `Droplet` (goutte d'eau)
- `Leaf` (feuille à nervures)
- `Sun` (soleil rayons fins)
- `Cloud` (humidité)
- `Thermometer`
- `Clock` (fréquence)
- `Camera`
- `Plus`
- `ArrowLeft`
- `Home`
- `PlantPot`
- `Sparkles` (succès)

**Ne PAS utiliser `lucide-react` pour les écrans de production** — le set custom est l'identité visuelle. `lucide-react` peut rester pour le module de viz interne ou être supprimé en Phase 2.

### `WaterCTA` (composant signature)
Le CTA "Arroser" en peak moment. Props :
- `state: 'idle' | 'pending' | 'done'`
- `onWater: () => void | Promise<void>`
- `size: 'inline' | 'large'`

Animations :
- `idle → pending` : shrink + spinner.
- `pending → done` : burst de gouttelettes (3-5 SVG circles animés en framer-motion `animate` avec stagger), puis morph en checkmark moss-500. Durée totale ≤ 1.2s. **Peak-End Rule**.
- `done` : auto-revert à `idle` après 2s.

## 7. Module de visualisation

### Accès

Route `/design-system/*` accessible **uniquement en `NODE_ENV === 'development'`**.

Implémentation : dans `src/app/design-system/layout.tsx`, vérifier `process.env.NODE_ENV !== 'development'` côté serveur et appeler `notFound()` (Next.js 14). Le module disparaît ainsi du build prod.

**Ne pas modifier le middleware**. Le check se fait dans le layout côté serveur.

### Structure des sous-routes (sidebar de navigation)

```
src/app/design-system/
  layout.tsx              # check NODE_ENV + sidebar + main outlet
  page.tsx                # overview ("Welcome to Violette DS")
  tokens/
    page.tsx              # palette de couleurs (swatches), typo, radii, shadows, motion
  typography/
    page.tsx              # tous les composants Typography
  buttons/
    page.tsx              # tous les variants/tailles/états du Button + WaterCTA
  cards/
    page.tsx              # tous les radii/élévations
  inputs/
    page.tsx              # TextInput, NumberStepper, SegmentedControl
  badges/
    page.tsx              # tous les variants
  bubbles/
    page.tsx              # PlantBubble dans toutes les positions/tilts
  icons/
    page.tsx              # grille des 12 icônes custom
  motion/
    page.tsx              # démo des durations + easings (rectangles animés)
```

### Layout de la viz

- **Desktop** : sidebar gauche fixe 240px (liste des sections en Plus Jakarta Sans, section active en `terracotta-500`), main area avec padding généreux.
- **Mobile** : sidebar transformée en menu déroulant en haut (le module est principalement consulté en dev sur desktop, donc mobile peut être minimal).
- Chaque page de catégorie présente :
  - Un titre `<H2>` du composant.
  - Une description courte (1 phrase) du rôle.
  - Une grille d'exemples avec **chaque exemple sur fond `paper-50` + `paper-grain`** pour rester fidèle au contexte d'usage.
  - Pour chaque exemple : un label de la variante + le rendu + (optionnel) un snippet de code en `<code>` pour faciliter la copie.

### Critère de réussite

À la fin de cette tâche, je dois pouvoir lancer `npm run dev`, ouvrir `http://localhost:3000/design-system`, et naviguer entre les sections via la sidebar. Chaque composant produit doit être visible et exhaustif (toutes les variants visibles).

## 8. Structure de fichiers attendue

```
src/
  design-system/
    tokens/
      colors.ts          # re-export typé des couleurs (utile pour composants TS)
      motion.ts          # durées + easings exportés en const
      radii.ts
    components/
      Button.tsx
      Card.tsx
      Input.tsx           # TextInput, NumberStepper, SegmentedControl
      Badge.tsx
      PlantBubble.tsx
      WaterCTA.tsx
      Typography.tsx      # H1, H2, H3, Body, Caption, Label, Italic
    icons/
      Droplet.tsx
      Leaf.tsx
      … (12 au total)
      index.ts            # re-export
    index.ts              # barrel export du DS

src/app/
  design-system/          # module de visualisation, dev-only
    layout.tsx
    page.tsx
    tokens/page.tsx
    typography/page.tsx
    buttons/page.tsx
    cards/page.tsx
    inputs/page.tsx
    badges/page.tsx
    bubbles/page.tsx
    icons/page.tsx
    motion/page.tsx
```

`tailwind.config.ts` étendu, `globals.css` complété (variables fonts + helper `paper-grain` + `prefers-reduced-motion` global).

## 9. Laws of UX à respecter (https://lawsofux.com)

À citer en commentaire JSDoc sur chaque composant qui en applique une :

- **Fitts's Law** — boutons ≥ 44×44 px (Button md+, IconButton).
- **Doherty Threshold** — animations ≤ 400ms hors décoratif.
- **Aesthetic-Usability Effect** — texture papier, ombres délicates, micro-anim sur tap.
- **Von Restorff Effect** — `terracotta-500` réservé au CTA principal et badges urgence.
- **Peak-End Rule** — `WaterCTA` orchestré pour un retour visuel satisfaisant.

## 10. Règles de dev

1. **Mobile-first strict** : aucune media query desktop dans les composants UI (la viz peut en avoir).
2. **Animations** : `transform` + `opacity` uniquement. Pas de `width/height/top/left` animés. `will-change` avec parcimonie.
3. **Accessibilité** :
   - Contraste WCAG AA documenté dans le module Tokens.
   - `aria-label` sur tous les boutons icône.
   - États focus visibles (ring 4px coloré).
   - Respect `prefers-reduced-motion` au niveau composant ET en `globals.css` (règle globale `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }`).
4. **Code et commentaires en anglais** ; **textes UI en français**.
5. **Pas de `any`** TypeScript. Pas de `// @ts-ignore`. Discriminer correctement les variants via union types.
6. **Aucune logique métier** dans le DS. Les composants sont stateless ou contrôlés par leurs props.

## 11. Périmètre exclu (NE PAS toucher)

- ❌ `src/app/(routes existantes)` — aucun écran existant n'est refondu dans cette tâche.
- ❌ `src/lib/` — aucune logique métier modifiée.
- ❌ `src/middleware.ts` — non touché.
- ❌ `prisma/schema.prisma` — non touché.
- ❌ `src/lib/auth/` — non touché.
- ❌ Service worker / PWA / VAPID — non touché.
- ❌ Pas de suppression de code existant non sollicitée (ex. `lucide-react` reste en place tant que les écrans actuels l'utilisent).

## 12. Livrables attendus en fin de tâche

1. Le design system fonctionnel sous `src/design-system/`.
2. Le module de viz accessible via `/design-system` en dev.
3. `tailwind.config.ts` et `globals.css` mis à jour.
4. Aucun écran existant cassé — `npm run build` doit toujours passer.
5. Récap clair listant : fichiers créés / modifiés, commandes à lancer (notamment `npm install framer-motion` si validé), TODO laissés pour la Phase 2 (refonte des écrans).

## 13. Évolutivité du DS

Le design system **vivra** : chaque nouveau composant ajouté pendant la refonte (Phase 2) devra :
- Être placé dans `src/design-system/components/`.
- Avoir une page de viz correspondante dans `src/app/design-system/`.
- Être documenté avec ses variants, ses props, et la loi UX qu'il applique.

Mentionner cette règle dans un commentaire en tête de `src/design-system/index.ts`.

---

**Démarre par l'audit lecture seule, puis propose ton plan numéroté. N'écris aucun code avant validation explicite de ma part.**
