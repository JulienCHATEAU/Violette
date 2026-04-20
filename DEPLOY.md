# 🚀 Mise en ligne Violette v1

Ce document a deux parties :

- **Partie A** : pour **toi** (Julien) — déploiement sur Railway (~30 min, une fois).
- **Partie B** : à **copier-coller en SMS ou email à la personne qui utilisera l'app** — guide d'installation iPhone rédigé pour quelqu'un de zéro-tech.

---

# Partie A — Déploiement Railway (pour Julien)

## ⚙️ Pré-requis

- [ ] Un compte [railway.app](https://railway.app) (gratuit, $5 de crédit mensuel offert).
- [ ] Un compte GitHub avec le repo Violette poussé dessus (branche `develop`).
- [ ] Node installé localement (tu l'as déjà).

## 🔑 Étape 1 — Générer tes clés (2 min)

Dans le terminal, à la racine du projet :

```bash
npm run vapid:generate
```

→ Tu obtiens 3 lignes. **Garde-les sous la main**, tu vas les coller dans Railway.

Récupère aussi :

- **`ANTHROPIC_API_KEY`** : [console.anthropic.com → Keys](https://console.anthropic.com/settings/keys). Crée-en une, copie-la.
- **`PLANT_ID_API_KEY`** *(optionnel)* : [Plant.id](https://web.plant.id/api-access-request/) — si tu veux une reco + précise. Sinon, Claude Vision fait le taf.
- **`CRON_SECRET`** : génère un string random, ex :
  ```bash
  openssl rand -hex 32
  ```
- **Basic Auth** : choisis un user (ex: `violette`) et un mot de passe **simple à taper sur un clavier iPhone** (12 caractères, pas de caractères bizarres) — tu vas le partager à la moldu.

> 💡 **Alternative si tu veux zéro friction pour la moldu** : laisse `BASIC_AUTH_USER` et `BASIC_AUTH_PASSWORD` **vides** dans Railway. L'auth sera désactivée et la sécurité reposera uniquement sur le fait que l'URL est inconnue du grand public. Acceptable pour un usage perso non sensible.

## 🐙 Étape 2 — Pousser le code sur GitHub (si pas déjà fait)

```bash
# Depuis la racine du projet, sur la branche develop :
git add .
git commit -m "v1: Violette MVP — PWA, push personnifiés, Railway-ready"
git push origin develop
```

## 🚂 Étape 3 — Créer le projet Railway (5 min)

1. Va sur [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Autorise Railway à accéder à ton repo Violette.
3. Sélectionne le repo → choisis la branche `develop`.
4. Railway détecte Next.js et lance un premier build (il va **échouer** faute de DB/volumes, c'est normal).

## 💾 Étape 4 — Ajouter les deux volumes (5 min)

Le service `web` vient d'être créé. Clique dessus.

1. **Settings → Volumes → + New Volume**
   - Mount path : `/app/data`
   - Size : `1 GB`
   - Create.
2. **+ New Volume** (encore)
   - Mount path : `/app/public/uploads`
   - Size : `1 GB`
   - Create.

## 🔐 Étape 5 — Ajouter les variables d'environnement (5 min)

Toujours sur le service `web` : **Variables → + New Variable** (ou "Raw Editor" en une passe).

Copie-colle ce bloc dans le **Raw Editor**, en remplaçant les `...` par tes valeurs :

```
DATABASE_URL=file:/app/data/violette.db
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_SUBJECT=mailto:julien@beehelp.fr
ANTHROPIC_API_KEY=...
PLANT_ID_API_KEY=...
CRON_SECRET=...
BASIC_AUTH_USER=violette
BASIC_AUTH_PASSWORD=...
TZ=Europe/Paris
```

> ⚠️ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` doit avoir **exactement la même valeur** que `VAPID_PUBLIC_KEY`.

## 🌐 Étape 6 — Activer le domaine public (1 min)

Service `web` → **Settings → Networking → Generate Domain**.

Railway te donne une URL du type `https://violette-production-abcd.up.railway.app`. **Note-la**, c'est le lien que tu enverras à la moldu.

## 🔁 Étape 7 — Redéployer le web (2 min)

Service `web` → **Deployments → (3 points sur le dernier) → Redeploy**.

Attends ~2 min que le build passe. Dans les logs tu dois voir :

```
Applying migration `20260420120343_init`
✓ Ready on 0.0.0.0:3000
```

Si tu vois ça : ta base SQLite est initialisée sur le volume, l'app tourne. 🎉

## ⏰ Étape 8 — Ajouter le service cron (5 min)

Dans le même projet Railway :

1. **+ New → GitHub Repo** (même repo, même branche `develop`).
2. Clique sur le nouveau service → **Settings → Service → Name** → renomme-le `cron`.
3. **Settings → Deploy → Custom Start Command** : `npm run cron`
4. **Variables** (Raw Editor) :
   ```
   APP_URL=http://web.railway.internal:3000
   CRON_SECRET=...              # MÊME valeur que le service web !
   ANTHROPIC_API_KEY=...         # idem
   TZ=Europe/Paris
   ```
   > `web.railway.internal` est le nom DNS privé du service `web` dans le réseau interne Railway — zéro latence, pas de Basic Auth à traverser.
5. **Settings → Networking** : **NE PAS** activer Generate Domain (ce worker n'a pas besoin d'être exposé publiquement).
6. **Deployments → Redeploy**.

Dans les logs du service `cron`, tu dois voir :

```
⏰ dev-cron running. Next.js must be up on http://web.railway.internal:3000
[...] /api/cron/watering-reminders → 200 ...
```

## 🌱 Étape 9 — Ajouter les 3 plantes de seed (optionnel, 2 min)

Si tu veux des plantes d'exemple pour tester. Sinon passe : la moldu ajoutera les siennes.

Installe la CLI Railway (une fois) :

```bash
brew install railway
railway login
railway link           # sélectionne le projet Violette
railway service web    # sélectionne le service
```

Puis :

```bash
railway run -- npm run seed
```

## ✅ Étape 10 — Vérifications finales

1. Ouvre ton URL Railway dans Chrome desktop → popup Basic Auth → entre user/password → tu dois voir le dashboard.
2. Ajoute une plante de test (avec photo) → vérifie que tout s'enregistre.
3. Depuis ton terminal :
   ```bash
   curl -X POST -H "x-cron-secret: <TON_CRON_SECRET>" \
     https://<TON_URL>.up.railway.app/api/cron/watering-reminders
   ```
   Réponse attendue : `{"ok":true,"due":...,"sent":...}`.

Si tout est OK, passe à la **Partie B** — tu vas l'envoyer à la moldu.

---

## 🛠️ Maintenance utile

**Sauvegarder la base** (recommandé 1x/mois) :
```bash
railway run --service web -- cat /app/data/violette.db > backup.$(date +%F).db
```

**Mettre à jour l'app** : push sur `develop` → Railway redéploie auto. Les migrations Prisma sont appliquées au démarrage, les données/photos survivent (volumes).

**Voir les logs live** : Railway dashboard → service → Logs.

**Coûts** : ~5-10 $/mois pour 2 services always-on. Le tier gratuit Railway offre $5/mois — suffisant si tu arrêtes le service `cron` la nuit (option "Sleep" dans Settings).

---

---

# Partie B — À envoyer à la moldu

> 📩 **Sélectionne tout ce qui suit (à partir du titre "🌿 Violette…"), copie-le et envoie-le en SMS, email ou iMessage. Pense à remplacer les 3 placeholders entre `[[...]]`.**

---

## 🌿 Violette — ton appli pour tes plantes

Hello 💚

Je t'ai fait une petite appli pour gérer tes plantes : tu les photographies, elle les reconnaît toute seule, et surtout… **tes plantes t'envoient des petits messages quand elles ont soif** 🌱

L'installation prend **2 minutes**. Je t'explique, c'est vraiment simple, mais il y a **quelques étapes précises à suivre dans l'ordre** (iPhone est un peu maniaque là-dessus).

### 👉 Ce qu'il te faut :
- Un iPhone avec **iOS 16.4 ou plus récent** (pour vérifier : *Réglages → Général → Informations → Version logicielle*. Si c'est en-dessous de 16.4, fais une mise à jour dans *Réglages → Général → Mise à jour logicielle*).
- Ton navigateur **Safari** (pas Chrome, pas Firefox, **uniquement Safari**).

### 1️⃣ Ouvre le lien dans Safari

Appuie sur ce lien : **[[COLLE ICI TON URL RAILWAY, ex: https://violette-production-abcd.up.railway.app]]**

Si tu l'ouvres depuis un SMS, iOS choisira Safari tout seul. Si tu es dans WhatsApp ou un autre app, appuie sur les 3 points en haut à droite → "Ouvrir dans Safari".

### 2️⃣ Entre le mot de passe

Une petite fenêtre grise va apparaître au milieu de l'écran avec marqué *"Sign in to…"* ou *"Se connecter à…"*.

- **Nom d'utilisateur** : `[[COLLE ICI LE BASIC_AUTH_USER, ex: violette]]`
- **Mot de passe** : `[[COLLE ICI LE BASIC_AUTH_PASSWORD]]`

Appuie sur **Se connecter**. Safari va s'en souvenir, tu ne l'auras plus jamais à retaper sur ce téléphone.

### 3️⃣ Ajoute l'appli à ton écran d'accueil

C'est LA étape importante. L'appli ne marchera **pas correctement** si tu l'utilises depuis Safari — il faut la mettre en icône sur ton écran, comme les autres apps.

1. En bas de l'écran Safari, appuie sur l'icône **Partager** (c'est un **carré avec une flèche vers le haut ↑**, au milieu de la barre en bas).
2. Fais glisser la liste vers le bas jusqu'à voir **"Sur l'écran d'accueil"** (ou *"Ajouter à l'écran d'accueil"* / *"Add to Home Screen"* selon ta langue).
3. Appuie dessus. Une nouvelle fenêtre te montre un aperçu de l'icône.
4. Appuie sur **Ajouter** en haut à droite.

✅ Une icône **Violette** 🌿 apparaît maintenant sur ton écran d'accueil, comme une vraie appli.

### 4️⃣ Ferme Safari et lance l'appli depuis l'icône

Retourne à l'écran d'accueil (swipe depuis le bas ou bouton Home) et appuie sur l'icône **Violette** que tu viens d'ajouter. L'appli s'ouvre en plein écran, sans la barre de Safari.

> ⚠️ **Important** : à partir de maintenant, **lance toujours l'appli depuis cette icône**, jamais depuis Safari. Sinon les notifications ne marcheront pas.

### 5️⃣ Active les notifications (le moment rigolo 🎉)

Dans l'appli, en bas à droite, appuie sur **⚙️ Réglages**.

- Appuie sur le bouton vert **"Activer les notifications"**.
- Une popup iOS te demande *"… souhaite vous envoyer des notifications"* → appuie sur **Autoriser**.
- Puis dans l'appli, appuie sur **"Envoyer un test"**.

Dans les 5 secondes, tu devrais recevoir une notif qui dit *"Test Violette 🌿 — Si tu lis ça, les notifs fonctionnent !"*. Si c'est le cas : **c'est gagné** 🎊

### 6️⃣ Ajoute ta première plante

- Retour à l'accueil (icône **🏠** en bas).
- Appuie sur le bouton vert **+ Ajouter** en haut à droite.
- Appuie sur **📷 Photo** → prends une photo de ta plante (ou choisis-en une dans la galerie).
- Patiente 3-5 secondes : l'appli identifie la plante et pré-remplit sa fiche (nom, arrosage, lumière, etc.).
- Modifie si tu veux (surnom rigolo encouragé — *Gérard, Josette, Kevin*… 😄).
- Appuie sur **Créer**.

Voilà ! La plante sait maintenant quand elle a soif. Quand ça arrivera, **elle t'enverra un message** du style *"Coucou c'est Gérard, j'ai soif, tu passes me voir ?"*.

### 🚨 Si ça ne marche pas

- **Je vois une page blanche** → vérifie que tu as bien entré le mot de passe à l'étape 2. Sinon, demande-moi.
- **La popup de permission ne s'affiche pas** → tu es probablement encore dans Safari. Ferme Safari, ouvre l'app depuis **l'icône sur l'écran d'accueil**, puis retourne dans Réglages.
- **Le test arrive pas** → iOS a parfois besoin d'une minute pour tout configurer. Attends, réessaie. Vérifie aussi que tu as bien **iOS 16.4+**.
- **Autre problème** → fais-moi un screenshot, j'arrange.

### 🌿 Petits conseils d'usage

- Quand une plante te dit qu'elle a soif et que tu l'as arrosée, **ouvre sa fiche et appuie sur "💧 Je viens d'arroser"**. Sinon elle continuera à te relancer.
- Tu peux régler la fréquence d'arrosage dans chaque fiche (bouton **Modifier** en haut à droite).
- L'appli fonctionne aussi **sans réseau** pour consulter tes plantes (offline). Pour ajouter une nouvelle plante ou arroser, il faut du réseau.

Bon jardinage 🌱

---

*(Fin du message à envoyer — le reste du fichier est de la doc technique pour Julien.)*

---

# Annexe — Que faire si la moldu perd l'app

- **Elle a désinstallé** → il suffit qu'elle refasse les étapes 1 à 4. Ses données sont sauvegardées sur Railway, elle retrouvera ses plantes.
- **Elle a changé de téléphone** → pareil, les données sont chez toi (Railway). Nouveau téléphone = étapes 1 à 4 + relogin.
- **Elle a oublié le mot de passe** → renvoie-lui le SMS initial. Si tu veux le changer : Railway → service `web` → Variables → édite `BASIC_AUTH_PASSWORD` → Redeploy.
