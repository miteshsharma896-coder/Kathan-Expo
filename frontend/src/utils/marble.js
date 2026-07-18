// Generates a marble-vein texture as an SVG data URI so product cards
// don't depend on stock photos. Tinted per category using colors from the API.
export function marbleSVG(seed, base, vein) {
  const bf1 = (0.008 + (seed % 5) * 0.003).toFixed(4);
  const bf2 = (0.04 + (seed % 7) * 0.01).toFixed(4);
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="mrb${seed}" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="${bf1} ${bf2}" numOctaves="4" seed="${seed}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.6 0.6 0.6 0 -0.55" result="veins"/>
      </filter>
    </defs>
    <rect width="300" height="200" fill="${base}"/>
    <rect width="300" height="200" filter="url(#mrb${seed})" fill="${vein}" opacity="0.65"/>
  </svg>`;
}

export function productThumb(product, categories) {
  const cat = categories.find((c) => c.slug === product.category);
  if (!cat) return '';
  return marbleSVG(seedFromId(product._id) * 13 + 7, cat.colorBase, cat.colorVein);
}

// Mongo ids are strings - turn them into a stable small number for the SVG seed
export function seedFromId(id) {
  if (!id) return 1;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  return hash;
}
