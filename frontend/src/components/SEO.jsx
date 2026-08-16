import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Yatharth Emerald Stones';
const DEFAULT_IMAGE = '/og-default.jpg'; // put a real 1200x630 photo here later

// Set VITE_SITE_URL in frontend/.env once you have a real domain
// (e.g. https://yatharthemeraldstones.com). Until then it falls back to
// whatever URL the site is currently running on.
const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function SEO({ title, description, path = '', image, noindex = false, jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Marble, Granite & Sandstone Direct from Rajasthan`;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image ? `${SITE_URL}${image}` : `${SITE_URL}${DEFAULT_IMAGE}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
