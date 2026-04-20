# 🚀 Violette — Local & Railway

Stack minimale : Next.js + Prisma (SQLite) + web-push. Aucun service externe payant, aucune API tierce.

---

## Partie 0 — Tester en local (~5 min)

### 1. Installer

```bash
npm install
```

### 2. Générer les clés VAPID

```bash
npm run vapid:generate
```

Colle les 3 lignes affichées dans `.env`. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` doit être **identique** à `VAPID_PUBLIC_KEY`.

### 3. Compléter `.env`

```bash
cp .env.example .env
```

- `CRON_SECRET` : n'importe quelle string (`openssl rand -hex 32`).
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` : laisse vides en local → auth désactivée.
- `APP_URL` : `http://localhost:3000`.

### 4. Init BDD + seed

```bash
npx prisma migrate dev --name init
npm run seed
```

### 5. Lancer

Terminal 1 : `npm run dev`
Terminal 2 (optionnel, pour tester les crons) : `npm run cron:dev`

Ouvre http://localhost:3000 → Chrome/Firefox pour activer les notifs (Safari sur `localhost` ne supporte pas le push).

### 6. Tester le push

1. Réglages → « Activer les notifications »
2. « Envoyer un test » → tu dois recevoir une notif.

---

## Partie A — Déployer sur Railway

Coût : ~5 $/mois. Deux services (web + cron) dans **un seul projet Railway**, qui partagent un volume SQLite.

### 1. Créer le projet

- [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → sélectionne `Violette`.

### 2. Ajouter un Volume (SQLite)

- Dans le service web : **Volumes** → Mount path `/app/data` → Name `data`.

### 3. Variables d'environnement (service web)

```
DATABASE_URL=file:/app/data/prod.db
VAPID_PUBLIC_KEY=<généré>
VAPID_PRIVATE_KEY=<généré>
VAPID_SUBJECT=mailto:julien@beehelp.fr
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<identique à VAPID_PUBLIC_KEY>
CRON_SECRET=<random-hex>
TZ=Europe/Paris
BASIC_AUTH_USER=<choisis>
BASIC_AUTH_PASSWORD=<choisis>
APP_URL=http://web.railway.internal:3000
```

Build command (auto) : `npm run build`
Start command (auto) : `npm start` (exécute `prisma migrate deploy` avant de lancer Next.js)

### 4. Ajouter le service cron

- Dans le même projet : **+ New → Empty Service** (même repo).
- **Variables** : mêmes que le web + `APP_URL=http://web.railway.internal:3000`.
- **Start command** : `npm run cron`
- Ce service ne partage **pas** le volume (il fait juste des HTTP calls vers le web).

### 5. Domaine

- Service web → Settings → Generate Domain. L'app est servie en HTTPS → indispensable pour le push iOS.

### 6. Seed (une fois)

Depuis ta machine :

```bash
railway link   # sélectionne le service web
railway run npm run seed
```

Ou plus simplement : ajoute tes plantes via l'UI.

---

## Partie B — Installer sur iPhone (iOS 16.4+)

1. Ouvre `https://<ton-domaine>.up.railway.app` dans **Safari**.
2. Entre le login Basic Auth (si activé).
3. Icône Partage → **« Sur l'écran d'accueil »**.
4. Ouvre Violette depuis l'écran d'accueil (PAS depuis Safari).
5. Réglages → Activer les notifications → autorise.
6. « Envoyer un test » pour vérifier.

---

## Maintenance

- **Backup SQLite** : `railway run sqlite3 /app/data/prod.db ".backup /app/data/backup.db"`
- **Logs** : Railway dashboard → service web → Logs.
- **Déploiement** : `git push` → Railway redeploy auto.
