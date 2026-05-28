# Deployment Guide — Tim Keselamatan Api

## Prerequisites

- Node.js 18+ installed
- Git installed
- Free accounts at [Supabase](https://supabase.com) and [Vercel](https://vercel.com)

---

## Step 1 — Initialize Git & Push to GitHub

```bash
cd fire-safety-module
git init
git add .
git commit -m "Initial commit: fire safety gamification module"
```

Create a new **public** repository on GitHub (e.g. `fire-safety-module`), then:

```bash
git remote add origin https://github.com/your-username/fire-safety-module.git
git branch -M main
git push -u origin main
```

> **Why public?** Vercel Hobby (free) connects to public repos for CI/CD.

---

## Step 2 — Set Up Supabase Database (Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up / log in.

2. Click **New project**:
   - **Name**: `fire-safety-module`
   - **Database Password**:6c*E5Jh?w2?YU/e
   - **Region**: Pick **Singapore** (closest to Indonesia, lowest latency)
   - **Pricing Plan**: **Free** (stays on Free)

3. Wait ~2 minutes for the database to provision.

4. In the left sidebar, go to **SQL Editor**.

5. Click **New query**, paste the entire contents of `supabase/migrations/00001_init.sql`, then click **Run**.

6. Verify in **Table Editor** that tables `profiles`, `lesson_progress`, `badges_earned`, and `xapi_statements` were created.

7. In **Authentication → Settings**:
   - Under **User signups**, ensure email/password sign-up is enabled.
   - Disable **Confirm email** if you want students to log in without email confirmation (not recommended for production — use with caution).

---

## Step 3 — Configure Environment Variables

1. In the Supabase dashboard, go to **Project Settings → API**.

2. Copy the **Project URL** and **anon public key**.

3. In your project folder, create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 4 — Test Locally

```bash
npm run dev
```

Open http://localhost:3000 — the mission map should load. Click on a lesson to verify content renders.

---

## Step 5 — Deploy to Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.

2. Click **Add New → Project**.

3. Import the `fire-safety-module` repository.

4. In the **Configure Project** step:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./fire-safety-module` (if you pushed the whole workspace) or leave as `./` (if that's the repo root)
   - Expand **Environment Variables** and add:
     - `NEXT_PUBLIC_SUPABASE_URL` — paste from Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — paste from Supabase

5. Click **Deploy**. Wait ~2 minutes for the build.

6. Once deployed, Vercel gives you a URL like `https://fire-safety-module.vercel.app`. Visit it.

---

## Step 6 — Create Users (For 30 Students)

### Option A — Let students sign up themselves

Share the deployed URL with students. They click **Daftar** and create an account with email/password. For SMP students without email, use a pattern like:

- Username: `siswa1`, `siswa2`, ... `siswa30`
- Email: `siswa1@sekolah.sch.id` (doesn't need to be real if email confirmation is off)

### Option B — Pre-create accounts (recommended for classrooms)

1. In Supabase → **Authentication → Users**, click **Invite** or **Add user**.
2. Create accounts in bulk using Supabase's Management API or manually add 30 users.
3. Provide each student with their login credentials on a printed card.

---

## Step 7 — (Optional) Custom Domain

In Vercel project settings → **Domains**, add a custom domain like `keselamatan.sekolah.sch.id`.

You'll need to add a CNAME record at your domain provider pointing to `cname.vercel-dns.com`.

---

## Step 8 — Monitor Usage

- **Supabase Free Plan limits**: 500 MB database, 5 GB bandwidth, 50,000 monthly active users — more than enough for 30 students.
- **Vercel Hobby limits**: 100 GB bandwidth, 6000 build minutes/month, 1 concurrent build — also sufficient.

Check usage in:
- Supabase → **Project Settings → Usage**
- Vercel → **Dashboard → Usage**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page on lesson | Open browser console — if `data` fetch fails, ensure `.env.local` variables are set correctly in Vercel |
| Auth not working | Verify `NEXT_PUBLIC_SUPABASE_URL` ends with `.supabase.co` (no trailing slash) |
| Database tables missing | Re-run the migration SQL in Supabase SQL Editor |
| Image not loading | Check `public/assets/` folder structure — Vercel serves these directly |
| Build fails | Ensure all npm deps are installed: delete `node_modules` and `package-lock.json`, run `npm install` again |

---

## Architecture Overview

```
Student Browser                    Vercel (CDN)                    Supabase
     │                                │                              │
     ├── https://your-app.vercel.app ─┤                              │
     │                                ├── Static assets (/,public)   │
     │                                ├── Next.js SSR/SSG pages      │
     │                                └── API routes ────────────────┤
     │                                                              ├── Auth (login/signup)
     │                                                              ├── Lesson progress
     │                                                              ├── Badges
     │                                                              └── xAPI analytics
```

No separate backend server is needed — Vercel hosts the Next.js app (frontend + API). Supabase provides database + auth. Both are free tier.
