# MarbleHub — MERN version

A real full-stack site now: **M**ongoDB (database) + **E**xpress (API server) +
**R**eact (website) + **N**ode (runs the server). The website no longer has any
hardcoded product list — everything comes from the database through an API.

```
marblehub-mern/
├── backend/     ← Node + Express + MongoDB API
└── frontend/    ← React website (Vite)
```

---

## What you need installed first

1. **Node.js** (LTS version) — https://nodejs.org — if you did Step 1 from
   before, you already have this. Check with:
   ```
   node -v
   npm -v
   ```

2. **A MongoDB database.** Easiest option — you do **not** need to install
   MongoDB on your computer:
   - Go to https://www.mongodb.com/cloud/atlas/register and make a free account
   - Create a free "M0" cluster (takes a couple of minutes)
   - Click **Connect → Drivers**, copy the connection string it gives you
     (looks like `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/`)
   - In Atlas, under **Network Access**, add `0.0.0.0/0` (allow access from
     anywhere) so it works from your computer
   - Under **Database Access**, make sure you have a database user with a
     username and password (you set this when creating the cluster)

   (If you'd rather run MongoDB locally instead of Atlas, install MongoDB
   Community Server from mongodb.com and use `mongodb://127.0.0.1:27017/marblehub`
   as your connection string instead — skip the Atlas steps above.)

---

## Step 1 — Set up the backend (API server)

Open a terminal in the `backend` folder:

```
cd backend
npm install
```

Copy the example environment file and edit it:

```
cp .env.example .env
```

(On Windows Command Prompt, use `copy .env.example .env` instead.)

Open `.env` in VS Code and paste in your MongoDB connection string from
Atlas, replacing `<password>` with your actual database user password, and
add `marblehub` as the database name at the end, e.g.:

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/marblehub
```

Now load the sample products into your database:

```
npm run seed
```

You should see: `Seeded 6 categories and 17 products.`

Start the API server:

```
npm run dev
```

You should see: `MarbleHub API running on http://localhost:5000`

Leave this terminal window running.

---

## Step 2 — Set up the frontend (website)

Open a **second** terminal in the `frontend` folder:

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

(On Windows: `copy .env.example .env`)

You should see something like:
```
  VITE ready
  ➜  Local:   http://localhost:5173/
```

Open that link in your browser — that's the live site, now reading real
data from MongoDB through the API.

---

## Trying it out

- **Admin login**: go to the Admin tab → username `admin`, password
  `marble123` (set in `backend/.env` — change these before showing this to
  anyone else)
- Add/edit/delete a product in Admin → refresh the Catalog page → the
  change is really in the database, not just in your browser
- Submit a quote request or contact message → it'll show up under Admin →
  Quote requests / Contact messages
- Wishlist still saves per-device (in your browser), same as before

---

## If something doesn't work

- **"MongoDB connection failed"** in the backend terminal → double check
  the `MONGO_URI` in `backend/.env`, and that you allowed `0.0.0.0/0` under
  Network Access in Atlas
- **Catalog page shows nothing** → make sure the backend terminal is still
  running and says `MarbleHub API running...`, and that you ran `npm run seed`
- **CORS error in browser console** → make sure `CLIENT_URL` in
  `backend/.env` matches the URL Vite gave you (default `http://localhost:5173`)

Send me the exact error text from either terminal and I'll help you fix it.

---

## Product photos

The Admin panel now lets you upload real photos per product (up to 4). They're
saved to `backend/uploads/` on your computer and served by the API itself —
nothing extra to configure. Products without any uploaded photo still show
the generated marble-texture placeholder, same as before.

If you move the project to a new computer or redeploy it later, remember to
copy the `backend/uploads/` folder along with your database, or those photos
will show as broken links.

## Where things live now

- Add/edit real products → use the **Admin panel** in the browser (writes to
  MongoDB) instead of editing a JS file
- Categories → `backend/seed/seed.js` (re-run `npm run seed` after editing —
  note this wipes and reloads all products, so only do this before you have
  real data you care about)
- Design/colors → `frontend/src/styles.css`
- Admin password → `backend/.env`
