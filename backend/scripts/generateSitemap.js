// Generates frontend/public/sitemap.xml with every static page plus every
// product currently in the database. Run this again any time you add a
// batch of new products, and always after deploying to a real domain.
//
// Usage (from the backend folder):   npm run sitemap
//
// Reads SITE_URL from backend/.env - set it to your real site's URL first,
// e.g. SITE_URL=https://www.yatharthemeraldstones.com (no trailing slash).

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const SITE_URL = (process.env.SITE_URL || 'https://www.yourdomain.com').replace(/\/$/, '');
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'sitemap.xml');

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/catalog', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
];

function urlEntry(loc, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>\n    ` : ''}<changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function run() {
  if (SITE_URL.includes('yourdomain.com')) {
    console.warn(
      'WARNING: SITE_URL is not set in backend/.env - the sitemap will use a placeholder domain.\n' +
      'Add this line to backend/.env before deploying:\n' +
      '  SITE_URL=https://www.yourrealdomain.com\n'
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find().select('_id updatedAt').lean();
  await mongoose.disconnect();

  const staticEntries = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, p.changefreq, p.priority));
  const productEntries = products.map((p) =>
    urlEntry(`${SITE_URL}/product/${p._id}`, 'weekly', '0.7', p.updatedAt ? p.updatedAt.toISOString().slice(0, 10) : undefined)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...productEntries].join('\n')}
</urlset>
`;

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`Sitemap written to ${OUTPUT_PATH}`);
  console.log(`${STATIC_PAGES.length} static pages + ${products.length} products = ${STATIC_PAGES.length + products.length} URLs`);
}

run().catch((err) => {
  console.error('Sitemap generation failed:', err.message);
  process.exit(1);
});
