# Violette — Maquettes Phase 1

Maquettes HTML autonomes pour valider la direction visuelle de la refonte UX/UI avant tout code de prod.

> **Comment utiliser** : ouvrir chaque fichier `.html` directement dans un navigateur. Tailwind est chargé via CDN, Google Fonts aussi. Aucun build, aucune install npm. Le code de ces maquettes est **jetable** — il sert seulement à valider la direction.

> **Périmètre** : 3 écrans par variation (Dashboard, Détail plante, Ajout). Login, Settings et notifications push seront maquettés en Phase 2 une fois la direction validée.

---

## Direction validée — Botanique apaisant

Esthétique herbier moderne, tons végétaux, formes organiques, personnification douce des plantes. Deux variations explorent la même direction sous deux ambiances complémentaires.

| | **Variation A** | **Variation B** |
|---|---|---|
| **Mood** | Carnet d'herboriste, vintage moderne | Atelier de créateur, zen contemporain |
| **Palette** | Terracotta `#C4583E` · mousse `#5C6F4F` · papier `#F4ECDD` · encre `#2B1F1A` | Sage `#6A8458` · lin `#FBF8F2` · terracotta clair `#D4855E` · cacao `#3D2F26` |
| **Titres** | **Fraunces** (serif organique, opsz variable) | **Lora** (serif chaleureux, italique fréquent) |
| **Corps** | Plus Jakarta Sans | DM Sans |
| **Formes** | `border-radius` asymétriques fixes (28/36/40px) — feel "papier découpé" | Blobs vrais (`border-radius` 4 valeurs % asymétriques) — feel "naturel" |
| **Bulles personnification** | Post-it terracotta, légèrement penché, queue de bulle | Feuille ronde sage, italique Lora |
| **Texture fond** | Grain papier subtil (radial gradient noise) | Lavis lumineux (radial gradients sage + terracotta) |
| **Ombres** | Sèches, courtes, "encrées" | Diffuses, longues, "étoffe" |
| **Iconographie** | Line art arrondi 1.6px, custom SVG inline (feuilles à nervures) | Line art arrondi 1.6px, accents en blob SVG |

## Choix communs aux deux variations

- **Mobile-only** : viewport iPhone 390×844, navigation bottom à 3 items (Accueil · CTA central Ajouter · Mes plantes).
- **Carousel scroll-snap** horizontal pour parcourir Dashboard → Détail → Ajout.
- **CTA arroser** = peak moment : gros bouton coloré, animation `:active` scale + ombre intérieure pour feedback tactile.
- **Badge urgence** sur les plantes assoiffées : pastille colorée avec icône goutte, animée `drop-pulse` (1.6s ease-in-out).
- **Cards d'arrivée** animées (`leaf-in`, fade + translate Y, stagger 70ms).
- **Personnification** : 1 à 2 bulles affichées par écran, contenu typé en dur dans la maquette ("Hé, j'ai vraiment soif", "Salut", "Tu m'as manqué…", "Coucou"). En Phase 2, le déclenchement (fréquence, conditions) sera définissable côté lib.
- **Champs de formulaire** : forme organique, focus state coloré (4px ring), placeholders en italique de la font serif.
- **`prefers-reduced-motion`** respecté : toutes les animations désactivées si l'utilisateur préfère.

## Mapping Laws of UX (https://lawsofux.com)

Chaque parti pris est traçable à au moins une loi.

- **Fitts's Law** — CTA "Arroser" en bas de carte ou en sticky bottom, 56px min de hauteur tactile, FAB caméra centré dans la nav.
- **Hick's Law** — Bottom nav à 3 items maximum (vs 5 conseillés). Dashboard découpé en 2 sections seulement (À arroser · Cette semaine), pas plus.
- **Jakob's Law** — Bottom nav, swipe horizontal, scroll vertical natif, status bar en haut, pull-up sticky CTA : conventions mobiles intactes.
- **Law of Proximity** — Photo + nom + nom scientifique + statut = un seul bloc rapproché par carte, le CTA Arroser collé à droite ou en bas.
- **Law of Common Region** — Chaque plante = une carte aux contours doux (organic radius ou blob), texture de fond subtile en background du device pour faire respirer.
- **Aesthetic-Usability Effect** — Investissement fort dans : grain papier, ombres délicates, typo serif, ornements botaniques discrets, animations de bulles.
- **Miller's Law** — Section "Cette semaine" en grille 2×2 (4 plantes max visibles). La fiche détaillée groupe les caractéristiques par 4 (lumière / humidité / température / fréquence).
- **Doherty Threshold** — Animations `leaf-in` sous 400ms, feedback `:active` scale immédiat. Aucune transition au-delà de 250ms hors décoratifs.
- **Peak-End Rule** — Le moment "Arroser" est le pic : couleur dédiée, animation pulse sur badge urgence, gros bouton. L'ajout d'une plante se conclura (Phase 2) sur une animation positive de plantation.
- **Von Restorff Effect** — Le CTA "Arroser" est la seule couleur saturée (terracotta A / sage profond B) sur fond crème. Tout le reste est en demi-teinte.

## Tokens de design (à porter en Phase 2)

### Variation A — Herbier moderne

```js
// tailwind.config.ts
colors: {
  terracotta: { 50:'#FBF1EC', 100:'#F1D8CC', 200:'#E5BBA8', 400:'#D17B5C', 500:'#C4583E', 600:'#A8402A', 700:'#7A2A1A' },
  moss:       { 50:'#EFF1EA', 100:'#DBE0CC', 200:'#B9C3A0', 400:'#7D8E6A', 500:'#5C6F4F', 600:'#445436', 700:'#2D3A22' },
  paper:      { 50:'#FAF6EC', 100:'#F4ECDD', 200:'#E9DEC4', 300:'#D9C9A4' },
  ink:        { 400:'#8C7A6E', 600:'#5A4A40', 800:'#2B1F1A', 900:'#1A1310' },
}
```

### Variation B — Atelier vert tendre

```js
colors: {
  sage:  { 50:'#F1F4EC', 100:'#DDE5CF', 200:'#BCC9A4', 400:'#8AA070', 500:'#6A8458', 600:'#506A40', 700:'#37502A' },
  clay:  { 50:'#FBEEE5', 100:'#F4D7C2', 400:'#E0A07E', 500:'#D4855E', 600:'#B36A45', 700:'#8A4A2C' },
  linen: { 50:'#FBF8F2', 100:'#EFE7D8', 200:'#E0D3BB', 300:'#C9B79A' },
  cocoa: { 400:'#7A6655', 600:'#54443A', 800:'#3D2F26', 900:'#2A1E18' },
}
```

### Communs aux deux

```js
fontFamily: {
  serif: ['Fraunces' /* ou Lora */, 'serif'],
  sans:  ['Plus Jakarta Sans' /* ou DM Sans */, 'system-ui', 'sans-serif'],
},
borderRadius: {
  // organic preset cards
  'organic-1': '28px 36px 28px 40px',
  'organic-2': '36px 28px 40px 28px',
  'organic-3': '32px 32px 40px 28px',
  'blob-soft': '36px 48px 36px 48px / 44px 36px 44px 36px',
},
boxShadow: {
  'paper': '0 1px 2px rgba(43,31,26,.06), 0 8px 24px -12px rgba(43,31,26,.18)',
  'lift':  '0 2px 4px rgba(43,31,26,.08), 0 18px 38px -16px rgba(43,31,26,.25)',
},
transitionTimingFunction: {
  'spring': 'cubic-bezier(.34, 1.56, .64, 1)', // organic spring for taps
}
```

## Contraintes d'accessibilité (à préserver en Phase 2)

- **Contraste WCAG AA** : le texte ink-800 sur paper-50 (variation A) et cocoa-800 sur linen-50 (variation B) dépasse 12:1 (vérifié à l'œil, à confirmer).
- **Tailles tactiles** : tous les boutons font ≥ 44×44 px.
- **Focus states** visibles sur les inputs (ring de couleur 4px).
- **`aria-label`** à ajouter en Phase 2 sur tous les boutons icône (pas présent dans les maquettes).
- **`prefers-reduced-motion`** déjà respecté dans le CSS des deux maquettes.

## Différences décisives (pour t'aider à choisir)

| | Variation A | Variation B |
|---|---|---|
| **Sensation au scroll** | Plus dense, plus chaud, plus structuré | Plus aéré, plus organique, plus "respirant" |
| **Risque de fatigue visuelle** | Faible — la texture papier est subtile | Très faible — le lin est plus neutre |
| **Difficulté d'implémentation** | Moyenne — texture en CSS multi-radial-gradient | Légèrement plus haute — vrais blobs en `border-radius` 8 valeurs |
| **Caractère différenciant** | Très fort — le post-it manuscrit est mémorable | Fort — les blobs sont marquants mais plus "tendance générique" |
| **Compatibilité dark mode** | Difficile (l'identité repose sur le papier) | Plus facile (palette plus polyvalente) |
| **Si on doit choisir un risque** | Trop "scrapbook" si pas dosé | Trop "wellness app" si pas dosé |

## Prochaine étape — Phase 2

Une fois la variation choisie, je produirai un **prompt structuré** pour Claude Code qui :
1. Listera les écrans dans l'ordre d'implémentation (système de design → composants → écrans).
2. Inclura les tokens validés.
3. Rappellera les Laws of UX appliquées.
4. Définira les règles de dev (mobile-first, framer-motion, perf, a11y).
5. Cadrera le périmètre : refonte UI uniquement, logique métier intacte.

> En attente de ta décision : **Variation A**, **Variation B**, ou un mix précis (ex. "palette de B, post-it bubbles de A").
