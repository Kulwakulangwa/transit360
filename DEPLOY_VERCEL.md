# Deploying to Vercel

This project is a TanStack Start app (Vite + Nitro). It is configured to build for Vercel via Nitro's `vercel` preset.

## 1. Push your code to GitHub / GitLab / Bitbucket

Make sure the following files are committed:
- `vercel.json`
- `package.json` / `package-lock.json` (or `bun.lockb`)
- `vite.config.ts`
- everything under `src/`

`.env` is gitignored — its values must be added in Vercel (see step 3).

## 2. Import the project in Vercel

1. Go to https://vercel.com/new
2. Import your repo.
3. **Framework Preset**: leave as **Other** (our `vercel.json` handles it).
4. **Build Command**: leave default — `vercel.json` sets `NITRO_PRESET=vercel npm run build`.
5. **Output Directory**: leave default — `vercel.json` sets `.vercel/output`.
6. **Install Command**: `npm install` (default).

## 3. Environment Variables

In Vercel → Project → Settings → Environment Variables, add these for **Production**, **Preview**, and **Development**:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://decfsydewrsefindpqbu.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (copy from `.env`) |
| `VITE_SUPABASE_ANON_KEY` | (copy from `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | `decfsydewrsefindpqbu` |
| `SUPABASE_URL` | `https://decfsydewrsefindpqbu.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | (same as VITE_SUPABASE_PUBLISHABLE_KEY) |
| `SUPABASE_PROJECT_ID` | `decfsydewrsefindpqbu` |
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase dashboard → Project Settings → API → service_role) — **server-only, do NOT prefix with VITE_** |

The `VITE_*` variables are bundled into the browser. The non-prefixed ones are read by server functions only.

## 4. Deploy

Click **Deploy**. Vercel will:
1. Run `npm install`.
2. Run `NITRO_PRESET=vercel npm run build` — Nitro emits the Vercel Build Output API v3 layout into `.vercel/output/`.
3. Serve the SSR functions + static assets automatically.

## 5. Supabase Auth Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add your Vercel URLs to **Site URL** and **Redirect URLs**:
- `https://<your-project>.vercel.app`
- `https://<your-project>.vercel.app/**`
- your custom domain if any

Otherwise sign-in / password reset / Google OAuth will fail with "redirect not allowed".

## Local sanity check

```bash
NITRO_PRESET=vercel npm run build
```

Should produce a `.vercel/output/` directory with `config.json`, `functions/`, and `static/`.
