# 🌿 Violette

PWA de gestion de l'entretien de plantes — fiches détaillées, reconnaissance par photo, et notifications push **personnifiées** ("tes plantes qui te parlent").

Stack : **Next.js 14** (App Router) · **TypeScript strict** · **Tailwind** · **Prisma + SQLite** · **Web Push (VAPID)** · **Plant.id** (+ fallback **Claude Vision**) · **Claude API** pour les messages.

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Préparer l'env
cp .env.example .env

# 3. Générer les clés VAPID (web push) et les coller dans .env
npm run vapid:generate

# 4. Créer la base SQLite + tables
npm run prisma:migrate -- --name init

# 5. Seed : 3 plantes de démo (Gérard, Alouette, Figaro)
npm run seed

# 6. Lancer l'app
npm run dev
# http://localhost:3000
```

Pour tester les notifications en local, dans un **second terminal** :

```bash
npm run cron:dev
```

Ce worker appelle les endpoints `/api/cron/*` toutes les heures avec le `CRON_SECRET`.

---

## 🔑 Variables d'environnement

Voir `.env.example`. Les trois clés stratégiques :

| Variable | Où l'obtenir |
|---|---|
| `PLANT_ID_API_KEY` | [Plant.id API access](https://web.plant.id/api-access-request/) — free tier OK pour tester |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/settings/keys) — sert pour la voix des plantes ET la vision fallback |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Générées localement : `npm run vapid:generate` |

⚠️ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` doit **aussi** être défini (même valeur que `VAPID_PUBLIC_KEY`) pour que le client puisse s'abonner au push.

---

## 🧩 Architecture

```
src/
├── app/
│   ├── page.tsx                    # Dashboard (plantes à arroser)
│   ├── plants/                     # liste, détail, new, edit
│   ├── settings/                   # notifications, install PWA
│   └── api/
│       ├── plants/...              # CRUD + /water
│       ├── upload/                 # photos
│       ├── recognize/              # Plant.id → Claude Vision
│       ├── push/{subscribe,unsubscribe,test}
│       └── cron/{watering-reminders,random-greeting}
├── lib/
│   ├── db.ts                       # Prisma singleton
│   ├── zod-schemas.ts
│   ├── storage/                    # StorageAdapter (local)
│   ├── recognition/                # plant-id + claude-vision + cascade
│   ├── push/                       # web-push wrapper + message generator
│   └── watering.ts                 # status helpers
├── components/                     # Nav, PlantCard, PlantForm, PhotoUpload, WaterButton, NotificationPermission
└── worker/index.js                 # custom SW (push + notificationclick)
```

### Reconnaissance — cascade

1. **Plant.id** (`PLANT_ID_API_KEY`) — source primaire, identifie l'espèce.
2. **Claude Vision** (`ANTHROPIC_API_KEY`) — complète les données de soin manquantes ou prend le relais si Plant.id est indisponible.
3. **Mode manuel** si rien ne répond : l'utilisateur remplit la fiche à la main.

### Messages personnifiés

`src/lib/push/generate-message.ts` appelle **Claude Haiku 4.5** avec :
- un `system` prompt cacheable (prompt caching activé → cache hit quasi systématique entre plantes),
- le contexte de la plante (surnom, espèce, jours de retard).

Fallback : **templates statiques** (≥5 par type, `{{nickname}}` interpolé) si l'API échoue.

### Anti-spam & quiet hours

- Dedup des `watering_due` : pas deux fois la même plante sous 12h (table `PushMessage`).
- `quietHoursStart`/`End` par subscription — zéro push entre 22h et 8h par défaut. Supporte les plages à cheval sur minuit.

---

## 🚢 Déploiement Railway (perso, avec volumes)

On garde **SQLite** et le **stockage local** — persistés par des volumes Railway. Deux services : `web` (Next.js) et `cron` (worker `node-cron` qui tape les endpoints du web via le réseau privé).

### Étapes UI

1. **Créer le projet** : New Project → Deploy from GitHub repo → sélectionner le repo (branche `develop`).
2. **Service `web`** (auto-créé, nixpacks détecte Next.js) :
   - **Volumes** (Settings → Volumes, 2 volumes sur le même service) :
     - `/app/data` (1 GB) → SQLite
     - `/app/public/uploads` (1 GB) → photos
   - **Variables** (Settings → Variables) :
     ```
     DATABASE_URL=file:/app/data/violette.db
     VAPID_PUBLIC_KEY=...                 # npm run vapid:generate en local
     VAPID_PRIVATE_KEY=...
     NEXT_PUBLIC_VAPID_PUBLIC_KEY=...     # même valeur que VAPID_PUBLIC_KEY
     VAPID_SUBJECT=mailto:tu@exemple.com
     ANTHROPIC_API_KEY=...
     PLANT_ID_API_KEY=...                 # optionnel
     CRON_SECRET=<string aléatoire>
     BASIC_AUTH_USER=<toi>
     BASIC_AUTH_PASSWORD=<fort>
     TZ=Europe/Paris
     ```
   - **Networking** → "Generate Domain" → récupère `https://violette-xxx.up.railway.app`.
3. **Service `cron`** (New Service → même repo GitHub) :
   - **Start command override** : `npm run cron`
   - **Variables** :
     ```
     APP_URL=http://web.railway.internal:3000
     CRON_SECRET=<MÊME valeur que web>
     TZ=Europe/Paris
     ```
   - Pas de port exposé, pas de volume.

### Fonctionnement

- Au démarrage du service `web`, `npm start` lance `prisma migrate deploy` puis `next start` — la DB est auto-migrée à chaque déploiement.
- Le service `cron` reste allumé et appelle `/api/cron/*` via le réseau privé `web.railway.internal` (zéro latence, zéro Basic Auth à traverser puisque `/api/cron` est exempté du middleware).
- **Basic Auth** protège toutes les autres routes → quand tu ouvres l'URL pour la 1ʳᵉ fois sur un appareil, popup user/password (mémorisée par le navigateur/PWA ensuite).
- Les photos uploadées et la DB survivent aux redeploys (volumes Railway).

### Backup

```bash
# Depuis ta machine, avec la CLI Railway liée au projet :
railway run --service web -- cat /app/data/violette.db > backup.$(date +%F).db
```

### Notes Vercel

`vercel.json` est laissé dans le repo mais inutilisé sur Railway — les crons sont gérés par le service `cron`. Tu peux le supprimer si tu ne comptes pas déployer sur Vercel.

---

## 🐛 Dépannage

**« VAPID keys not configured »** → lance `npm run vapid:generate` puis colle les 3 lignes dans `.env` (n'oublie pas `NEXT_PUBLIC_VAPID_PUBLIC_KEY`).

**iOS — pas de push** → iOS 16.4+ requis, **et** l'app doit être ajoutée à l'écran d'accueil via Safari (pas depuis un onglet classique).

**Reconnaissance toujours vide** → vérifie les logs serveur. Sans clé Plant.id ni Anthropic, l'endpoint renvoie `{ source: "none" }` et l'UI passe en mode manuel : c'est attendu.

**Prisma — migration rejouée** → `rm prisma/dev.db prisma/dev.db-journal` puis `npm run prisma:migrate -- --name init && npm run seed`.

---

## 🛣️ Roadmap (non-MVP)

- Auth + multi-user
- Mutations offline (Background Sync + IndexedDB queue)
- Stats d'arrosage (graphiques)
- Partage de plantes avec un autre humain
- Icônes PNG haute-res (192, 512, maskable)
