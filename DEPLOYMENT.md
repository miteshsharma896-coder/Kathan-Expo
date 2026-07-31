# Deploying MarbleHub — Backend on Render, Frontend on Vercel

Both are free to start. You already have MongoDB Atlas set up, so this
just connects your existing GitHub repo to two hosting services.

**Known limitation:** product photos uploaded through the Admin panel are
saved to a local folder on the backend server. Render's free tier wipes
that folder on every restart/redeploy, so uploaded photos may disappear
over time. Everything else works normally either way — this only affects
real uploaded photos (products without photos still show fine using the
generated marble texture). Ask me later if you want this fixed properly
with cloud photo storage (Cloudinary, free tier).

---

## Part 1 — Deploy the backend (Render)

1. Go to https://render.com and sign up (GitHub sign-in is fastest)
2. Click **New +** → **Web Service**
3. Connect your GitHub account if asked, then select your repo
4. Fill in:
   - **Name**: `yatharth-emerald-stones-api` (or anything)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Scroll to **Environment Variables** and add each of these (same values
   as your local `backend/.env` file):
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `ADMIN_USER` — e.g. `admin`
   - `ADMIN_PASS` — your admin password
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — leave as `http://localhost:5173` for now, we'll update
     this in Part 3
   - `SITE_URL` — leave as-is for now too
6. Click **Create Web Service**. Render will build and start it — takes
   a few minutes. Watch the logs; you're looking for:
   ```
   MongoDB connected: ...
   MarbleHub API running on http://localhost:...
   ```
7. Once live, copy the URL Render gives you at the top of the page —
   looks like `https://yatharth-emerald-stones-api.onrender.com`.
   **Save this URL, you'll need it in Part 2.**

Test it worked: open `https://your-render-url.onrender.com/api/health`
in a browser — you should see `{"ok":true}`.

*Free-tier note: Render spins the server down after 15 minutes of no
traffic, and takes 30-60 seconds to wake back up on the next request.
That's normal on the free tier, not a bug.*

---

## Part 2 — Deploy the frontend (Vercel)

1. Go to https://vercel.com and sign up (GitHub sign-in is fastest)
2. Click **Add New** → **Project**
3. Import the same GitHub repo
4. Vercel will ask to configure the project:
   - **Root Directory**: click Edit, choose `frontend`
   - **Framework Preset**: should auto-detect as "Vite" — leave it
   - **Build Command**: `npm run build` (should be pre-filled)
   - **Output Directory**: `dist` (should be pre-filled)
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
     (use the real URL you copied from Part 1, keep the `/api` at the end)
6. Click **Deploy**. Takes about a minute.
7. Once done, Vercel gives you a live URL — something like
   `https://yatharth-emerald-stones.vercel.app`. **This is your live
   website.** Open it and click around.

---

## Part 3 — Connect them properly (fixes CORS)

Now that both are live, go back and tell the backend about the frontend's
real URL, so the API accepts requests from it:

1. In Render, go to your backend service → **Environment**
2. Edit `CLIENT_URL` → set it to your real Vercel URL, e.g.
   `https://yatharth-emerald-stones.vercel.app`
3. Save — Render will automatically redeploy with the new value

Also update `SITE_URL` in Render's environment variables to the same
Vercel URL — this is what the sitemap generator will use.

---

## Part 4 — Load your data

Your Atlas database already has your seeded products from local testing,
so nothing else to do — the live site will show the same data
immediately. If you want to reseed or regenerate the sitemap from your
own computer (pointed at the same Atlas database), your local `backend/.env`
already has the right `MONGO_URI`.

---

## After this

- Your site is now live and publicly visible at the Vercel URL
- Go back to `SEO-GROWTH-GUIDE.md` and continue with Google Search
  Console (use your Vercel URL) and Google Business Profile
- A custom domain (e.g. `yatharthemeraldstones.com`) can be bought later
  from any registrar (GoDaddy, Namecheap, or Indian ones like
  BigRock/GoDaddy India, roughly ₹700-1000/year) and connected to Vercel
  in a few clicks under your Vercel project's **Domains** settings — ask
  me when you're ready and I'll walk you through it
