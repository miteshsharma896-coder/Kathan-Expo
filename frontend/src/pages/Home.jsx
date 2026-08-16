import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { marbleSVG } from '../utils/marble';
import ProductCard from '../components/ProductCard';
import QuoteModal from '../components/QuoteModal';
import SEO from '../components/SEO';

// Hero slides — 4 different stone textures auto-cycle like the reference.
// To use REAL photos instead: replace the `bg` strings with
//   <img src="/hero1.jpg" style="width:100%;height:100%;object-fit:cover;" />
// and put the photos in frontend/public/
const HERO_SLIDES = [
  { seed: 17, base: '#1A1814', vein: '#3A3530', accent: '#5A5248', label: 'Rajsamand · Rajasthan Quarry Belt' },
  { seed: 88, base: '#EEEBE4', vein: '#B0A898', accent: '#787068', label: 'Makrana · Premium White Marble' },
  { seed: 51, base: '#161614', vein: '#C9A84C', accent: '#8A7030', label: 'Rajnagar · Indian Black Marble' },
  { seed: 33, base: '#243830', vein: '#5A9870', accent: '#8AC8A0', label: 'Udaipur · Green Onyx Collection' },
];

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Yatharth Emerald Stones',
  description: "Marble, granite, onyx and sandstone slabs sourced directly from Rajasthan's quarry belt.",
  address: { '@type': 'PostalAddress', addressLocality: 'Rajsamand', addressRegion: 'Rajasthan', addressCountry: 'IN' },
  areaServed: 'IN',
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts()])
      .then(([cats, prods]) => { setCategories(cats); setProducts(prods); })
      .finally(() => setLoading(false));
  }, []);

  function advanceTo(nextFn) {
    setFading(true);
    setTimeout(() => { setSlide(nextFn); setFading(false); }, 380);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      advanceTo(s => (s + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  function jumpTo(i) {
    clearInterval(timerRef.current);
    advanceTo(() => i);
    timerRef.current = setInterval(() => {
      advanceTo(s => (s + 1) % HERO_SLIDES.length);
    }, 5000);
  }

  const s = HERO_SLIDES[slide];

  return (
    <>
      <SEO
        title="Marble, Granite & Sandstone Direct from Rajasthan"
        description="Yatharth Emerald Stones sources marble, granite, onyx and sandstone slabs directly from Rajasthan's quarry belt - Makrana, Kishangarh, Rajnagar, Jalore and Dholpur. Request a quote online, no showroom markup."
        path="/"
        jsonLd={LOCAL_BUSINESS_JSON_LD}
      />

      {/* ── FULLSCREEN HERO WITH SLIDER ── */}
      <section className="hero hero-slider">

        {/* Slide background — cross-fades between stone textures */}
        <div
          className="hero-slide-bg"
          style={{ opacity: fading ? 0 : 1 }}
          dangerouslySetInnerHTML={{ __html: marbleSVG(s.seed, s.base, s.vein, s.accent) }}
        />

        {/* Dark gradient overlay for text legibility */}
        <div className="hero-overlay" />

        {/* All text/CTA content */}
        <div className="hero-inner" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.38s ease' }}>
          <div className="hero-eyebrow-label">STONE GALLERY</div>
          <h1 className="hero-title">
            Yatharth Emerald Stones sources slabs and tiles straight from the quarries and GODOWNS of RAJSAMAND.
          </h1>
          <div className="hero-cta-group">
            <button className="btn hero-btn-outline" onClick={() => navigate('/catalog')}>
              Browse Collection →
            </button>
            <button className="btn hero-btn-text" onClick={() => navigate('/contact')}>
              Enquire Now →
            </button>
          </div>

          {/* Slide indicators + label — like the reference */}
          <div className="hero-footer">
            <div className="hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot${i === slide ? ' active' : ''}`}
                  onClick={() => jumpTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="hero-slide-label">{s.label}</div>
          </div>
        </div>
      </section>

      {/* ── BELOW HERO CONTENT ── */}
      {!loading && (
        <>
          <div className="gold-rule" />
          <section className="band warm" style={{ paddingBottom: 40 }}>
            <div className="band-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 24, borderBottom: '1px solid var(--line-soft)', paddingBottom: 40 }}>
              <Stat n={products.length} label="Stone varieties" />
              <Stat n={categories.length} label="Stone categories" />
              <Stat n="Direct" label="From our own stock" />
              <Stat n="24 hrs" label="Quote turnaround" />
            </div>
          </section>

          <section className="band light">
            <div className="band-inner">
              <div className="section-head">
                <div>
                  <div className="section-label">Our collection</div>
                  <h2>Browse by stone</h2>
                  <p>Six categories sourced across Rajasthan's quarry belt.</p>
                </div>
                <Link className="btn btn-outline" to="/catalog">View full catalog →</Link>
              </div>
              <div className="cat-grid">
                {categories.map((c) => {
                  const count = products.filter((p) => p.category === c.slug).length;
                  return (
                    <Link className="cat-card" to={`/catalog?cat=${c.slug}`} key={c.slug}>
                      <div className="cat-swatch" dangerouslySetInnerHTML={{ __html: marbleSVG(c.slug.length * 17 + 3, c.colorBase, c.colorVein) }} />
                      <div className="cat-card-body">
                        <div className="name">{c.name}</div>
                        <div className="count">{count} product{count === 1 ? '' : 's'}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="band warm">
            <div className="band-inner">
              <div className="section-head">
                <div>
                  <div className="section-label">Featured slabs</div>
                  <h2>Currently available</h2>
                  <p>A selection of stones ready to quote on.</p>
                </div>
              </div>
              <div className="prod-grid">
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p._id} product={p} categories={categories} onQuote={setQuoteProduct} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="band dark">
        <div className="band-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40 }}>
          <Step n="01" title="Send your requirement" body="Tell us the stone, quantity in sq. ft., and finish you need. We'll respond within 24 hours." />
          <Step n="02" title="We quote directly" body="Straight from our own godowns in Rajsamand — no showroom margin, no middleman." />
          <Step n="03" title="Slabs reach your site" body="Dispatched and delivered to your project location across India." />
        </div>
      </section>

      <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
    </>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 28, color: 'var(--ink)' }}>{n}</div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--stone-grey)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 5 }}>{label}</div>
    </div>
  );
}
function Step({ n, title, body }) {
  return (
    <div>
      <div className="mono" style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.14em', marginBottom: 12 }}>— {n}</div>
      <h3 style={{ fontSize: 20, marginBottom: 10, color: 'var(--ivory)' }}>{title}</h3>
      <p style={{ color: 'rgba(250,250,247,0.6)', fontSize: 14, lineHeight: 1.68 }}>{body}</p>
    </div>
  );
}
