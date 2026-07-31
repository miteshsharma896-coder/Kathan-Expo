# Growing Your Search Presence — Beyond the Website

The website's technical SEO is done (see the "SEO" section in the main
README). This document covers the parts that need YOUR business details
and account logins — I can't do these for you, but here's exactly how.

Do these roughly in this order. None of them cost money.

---

## 1. Google Business Profile (do this first — biggest impact)

This is what makes you show up on Google Maps and in "marble suppliers
near me" / "marble suppliers Rajsamand" searches. For a local stone
business, this usually matters more than the website itself.

**Steps:**
1. Go to https://www.google.com/business/ and click **Manage now**
2. Sign in with a Google account (create one for the business if you
   don't have one — e.g. yatharthemeraldstones@gmail.com)
3. Enter your business name: **Yatharth Emerald Stones**
4. Choose a category — search for **"Marble supplier"** or
   **"Building materials supplier"**
5. Add your real address in Rajsamand. If you don't have a public-facing
   office (e.g. you work from a processing unit or warehouse), you can
   choose "I deliver goods and services to my customers" instead and hide
   the exact address — Google still lets you set a service area.
6. Add your phone number and (once live) your website URL
7. Verify the listing — Google will usually mail you a postcard with a
   code, or offer phone/video verification depending on your account.
   This can take a few days to a couple of weeks.
8. Once verified, add:
   - Photos (your yard, slabs, finished projects — real photos help a lot)
   - Business hours
   - A short description (2-3 sentences — you can reuse the "About"
     section text from the website)
   - Services/products you offer

**After it's live:** ask a few real customers to leave a Google review.
Reviews are one of the strongest local-ranking signals there is.

---

## 2. Google Search Console (tells Google your site exists)

This is what gets your actual pages indexed and searchable. Do this once
you have a real domain (not localhost).

**Steps:**
1. Go to https://search.google.com/search-console
2. Click **Add property**, choose **URL prefix**, enter your full domain
   (e.g. `https://www.yatharthemeraldstones.com`)
3. Verify ownership — the easiest method is usually **HTML tag**: it gives
   you a `<meta>` tag to paste into `frontend/index.html`'s `<head>`
   section. Send it to me and I'll add it in for you.
4. Once verified, go to **Sitemaps** in the left menu, and submit:
   ```
   sitemap.xml
   ```
   (referring to `https://www.yourdomain.com/sitemap.xml`, which the
   project already generates — see the main README's SEO section)
5. Give it a few days to a few weeks. Under **Pages**, you'll be able to
   see which pages Google has indexed and if there are any errors.

---

## 3. Directory & Marketplace Listings

Very standard for Indian building-material businesses, and each one is
both a source of direct enquiries AND a backlink that helps your main
site rank better.

Priority order:

1. **IndiaMART** — https://www.indiamart.com/registration/
   The biggest B2B marketplace in India for exactly this kind of
   business. Create a free seller account, list your top products
   (Makrana marble, granite, sandstone etc.) with photos and prices.

2. **TradeIndia** — https://seller.tradeindia.com/
   Similar to IndiaMART, worth having both since buyers search both
   independently.

3. **JustDial** — https://www.justdial.com/business-listing
   More consumer/local-search focused. Good for the "marble suppliers
   near me" type of search.

4. **Facebook Business Page + Instagram** — free, and a place to post
   photos of finished projects, new slab arrivals, etc. Consistent
   posting helps both direct enquiries and (indirectly) search trust.

For each of these, use the **exact same business name, address, and
phone number** as your Google Business Profile — consistency across
listings is itself a ranking factor (it's called "NAP consistency" if
you ever see that term).

---

## 4. Ongoing — Content

The website's product pages now have longer, more detailed descriptions
that naturally include the kind of phrases people search for (stone
names + "price", + "suppliers Rajasthan", etc.). A few ways to keep
building on this over time, whenever you have time for it:

- Add real photos to products in the Admin panel — listings with photos
  outperform generic placeholder art in every marketplace and in Google
  Images search
- If you ever want a blog/articles section (e.g. "How to choose marble
  for your kitchen", "Makrana vs Kishangarh marble — what's the
  difference") — that kind of content is what actually ranks for broad
  searches, since it directly answers questions people type into Google.
  Let me know if you'd like this built into the site later.

---

## What I can help with directly

- Adding a Search Console verification tag to the site — just send me
  the code Google gives you
- Writing more/better product descriptions if you add new stones
- Building a blog/articles section if you want one later
- Any other code-side SEO work

The account creation, verification, and ongoing posting on Google
Business/IndiaMART/social media are steps only you can do, since they
require your phone number, business documents, and account logins.
