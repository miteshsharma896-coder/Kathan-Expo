// Premium SVG marble texture generator.
// Each call produces a unique slab appearance — realistic veining,
// depth, and mineral inclusions — using only SVG filters.

export function marbleSVG(seed, base, vein, accent) {
  const s = seed || 1;
  const acc = accent || vein;
  const bf1 = (0.006 + (s % 7) * 0.002).toFixed(4);
  const bf2 = (0.028 + (s % 11) * 0.008).toFixed(4);
  const bfFine = (0.045 + (s % 5) * 0.012).toFixed(4);
  const angle = (s * 37) % 180;
  const veinOpacity = (0.55 + (s % 4) * 0.1).toFixed(2);
  const fineOpacity = (0.2 + (s % 3) * 0.08).toFixed(2);

  return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <!-- Main veining pattern -->
      <filter id="mv${s}" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="${bf1} ${bf2}" numOctaves="6" seed="${s}" result="t1"/>
        <feColorMatrix in="t1" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2 2 2 0 -1.1" result="veins"/>
      </filter>
      <!-- Fine mineral texture -->
      <filter id="mf${s}" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="${bfFine} ${bfFine}" numOctaves="3" seed="${s + 13}" result="t2"/>
        <feColorMatrix in="t2" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 1.5 1.5 0 -0.8" result="fine"/>
      </filter>
      <!-- Diagonal directional grain -->
      <linearGradient id="mg${s}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle},200,130)">
        <stop offset="0%" stop-color="${base}" stop-opacity="1"/>
        <stop offset="40%" stop-color="${base}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${acc}" stop-opacity="0.25"/>
      </linearGradient>
      <!-- Gloss sheen -->
      <linearGradient id="gs${s}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="white" stop-opacity="0.18"/>
        <stop offset="50%" stop-color="white" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="white" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <!-- Base stone color -->
    <rect width="400" height="260" fill="${base}"/>
    <!-- Directional tonal variation -->
    <rect width="400" height="260" fill="url(#mg${s})" opacity="0.45"/>
    <!-- Main vein layer -->
    <rect width="400" height="260" filter="url(#mv${s})" fill="${vein}" opacity="${veinOpacity}"/>
    <!-- Fine grain overlay -->
    <rect width="400" height="260" filter="url(#mf${s})" fill="${acc}" opacity="${fineOpacity}"/>
    <!-- Polished surface sheen -->
    <rect width="400" height="260" fill="url(#gs${s})"/>
  </svg>`;
}

// Category definitions with richer color palettes (base, vein, accent)
export const MARBLE_COLORS = {
  white:     { base: '#F0EDE6', vein: '#C8BFB0', accent: '#9E9690' },
  beige:     { base: '#E8D9C0', vein: '#C4A87A', accent: '#8C7455' },
  black:     { base: '#1C1C1A', vein: '#C9A84C', accent: '#8A7845' },
  onyx:      { base: '#2C4A36', vein: '#6FA882', accent: '#A8D4B8' },
  granite:   { base: '#4E4A46', vein: '#8C8480', accent: '#C8C0B8' },
  sandstone: { base: '#A04030', vein: '#D4886A', accent: '#C87050' },
};

export function productThumb(product, categories) {
  const cat = categories.find((c) => c.slug === product.category);
  const colors = MARBLE_COLORS[product.category] || MARBLE_COLORS.granite;
  const base = cat?.colorBase || colors.base;
  const vein = cat?.colorVein || colors.vein;
  const accent = colors.accent;
  return marbleSVG(seedFromId(product._id) * 13 + 7, base, vein, accent);
}

export function seedFromId(id) {
  if (!id) return 1;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  return hash || 1;
}
