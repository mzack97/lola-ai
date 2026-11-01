# LOLA AI — lola-ai.uz

The LOLA AI website: a public landing page, registration, a course catalog with enrollment, a teacher side (curriculum sections, chat, Google Meet lessons, materials) and an admin panel.

**Stack:** Next.js 15 (React, TypeScript) · PostgreSQL 16 · Drizzle ORM · Tailwind CSS · Docker Compose · Caddy (automatic HTTPS)

---

## Who sees what

| Role | Where | What they do |
| --- | --- | --- |
| Guest | `/`, `/kurslar`, `/yangiliklar` | Read, register |
| Student | `/kabinet` | Apply to courses, enter the course room once a teacher approves |
| Teacher | `/oqituvchi` | Approve requests, build sections, announce Meet lessons, chat, upload materials |
| Admin | `/admin` | Landing texts, news, categories, courses, assign teachers, users and roles |

The course room for everyone is `/xona/<course-id>`.

---

## Putting it on the server (first time)

You need: the domain `lola-ai.uz`, an Ubuntu 24.04 server, its IP address and root password.

### 1. Point the domain at the server

In your domain registrar's control panel, open **DNS settings** and add two records:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | your server IP |
| A | `www` | your server IP |

It can take from a few minutes to a few hours to start working.

### 2. Connect to the server

On Windows, open **PowerShell**; on Mac, open **Terminal**. Type (replace with your IP):

```
ssh root@YOUR_SERVER_IP
```

Type `yes` when asked, then the root password (nothing is shown while typing; that's normal).

### 3. Install Docker and a firewall (copy-paste, one line at a time)

```
curl -fsSL https://get.docker.com | sh
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

The last line adds 2 GB of "spare memory" (swap). It lets a small 2 GB server build the site without running out of memory.

### 4. Get the code onto the server

The repository is private, so the server needs a read-only key ("deploy key"):

```
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "lola-server"
cat ~/.ssh/id_ed25519.pub
```

Copy the line that starts with `ssh-ed25519`. On GitHub open the repository → **Settings → Deploy keys → Add deploy key**, paste it, title it `server`, leave "Allow write access" **unticked**, and click **Add key**. Then:

```
cd /root
git clone git@github.com:YOUR_GITHUB_NAME/lola-ai.git
cd lola-ai
```

Type `yes` if it asks about GitHub's fingerprint.

### 5. Fill in the settings

```
cp .env.example .env
nano .env
```

Change the values (domain, a long database password, your admin phone and password). Save with **Ctrl+O**, **Enter**, exit with **Ctrl+X**.

### 6. Start everything

```
docker compose up -d --build
```

The first start takes 3–5 minutes. Then open **https://lola-ai.uz**, click **Kirish**, and log in with the admin phone and password from `.env`.

### 7. Turn on daily backups

```
crontab -e
```

Choose `nano` if asked, go to the bottom line and paste:

```
30 3 * * * /root/lola-ai/deploy/backup.sh >> /root/lola-backup.log 2>&1
```

Save and exit. Backups are saved every night at 03:30 to `/root/lola-backups` (last 14 days). Copy them off the server from time to time.

---

## Everyday commands (on the server, inside `/root/lola-ai`)

| Task | Command |
| --- | --- |
| Update the site to the latest code | `./deploy/update.sh` |
| Is everything running? | `docker compose ps` |
| See the site's logs | `docker compose logs -f app` |
| Restart | `docker compose restart app` |
| Back up now | `./deploy/backup.sh` |

---

## First things to do in the admin panel

1. **Bosh sahifa bloklari** — check the texts, add contacts and team photos.
2. **Foydalanuvchilar** → "+ Yangi foydalanuvchi" — create an account for each teacher (role: O‘qituvchi) and give them their phone and password.
3. **Kurslar** → "+ Yangi kurs" — fill in the course, tick the teacher, tick "Saytda nashr etish".
4. The teacher logs in, opens **Kurs xonasi**, adds sections, and announces lessons with a Google Meet link.

---

## For developers

```
npm install
cp .env.example .env    # set DATABASE_URL=postgresql://user@localhost:5432/lola
npm run db:migrate && npm run db:seed
npm run dev             # http://localhost:3000
```

After changing `src/db/schema.ts`: `npm run db:generate` (creates a migration in `drizzle/`), then commit it. Migrations run automatically on every deploy.

`scripts/demo.ts` fills the database with demo courses and users, **for local testing only**.
