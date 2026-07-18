import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { marbleSVG } from '../utils/marble';
import ProductCard from '../components/ProductCard';
import QuoteModal from '../components/QuoteModal';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  function goSearch() {
    navigate(`/catalog${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">● Direct from Rajasthan's marble belt</span>
          <h1>Stone from the source, not the middleman.</h1>
          <p className="lead">
            Yatharth Emerald Stones sources slabs and tiles straight from the quarries and processing units of
            Makrana and Kishangarh — priced by the square foot, no showroom markup.
          </p>
          <div className="search-bar">
            <input
              placeholder="Search “Makrana white”, “green onyx”, “granite”…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goSearch()}
            />
            <button onClick={goSearch}>Search</button>
          </div>
          <div className="hero-quarries">
            <div className="quarry-tag"><b>Makrana</b> · white marble, since antiquity</div>
            <div className="quarry-tag"><b>Kishangarh</b> · Asia's largest marble market</div>
            <div className="quarry-tag"><b>Rajnagar</b> · marble &amp; sandstone belt</div>
          </div>
        </div>
        <svg className="vein" viewBox="0 0 1180 28" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
          <path d="M0,14 C150,4 300,24 450,12 S750,2 900,16 S1100,22 1180,10" stroke="#3B6EA5" opacity="0.4" />
        </svg>
      </section>

      {!loading && (
        <>
          <section className="band light" style={{ paddingBottom: 40 }}>
            <div className="band-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 24, borderBottom: '1px solid var(--line)', paddingBottom: 40 }}>
              <Stat n={products.length} label="Stone varieties listed" />
              <Stat n={categories.length} label="Quarry regions covered" />
              <Stat n="Live" label="Prices from the database" />
              <Stat n="24 hrs" label="Typical quote turnaround" />
            </div>
          </section>

          <section className="band light">
            <div className="band-inner">
              <div className="section-head">
                <div>
                  <h2>Browse by stone</h2>
                  <p>Categories sourced across Rajasthan's quarry belt and beyond.</p>
                </div>
                <Link className="btn btn-outline" to="/catalog">View full catalog →</Link>
              </div>
              <div className="cat-grid">
                {categories.map((c) => {
                  const count = products.filter((p) => p.category === c.slug).length;
                  return (
                    <Link className="cat-card" to={`/catalog?cat=${c.slug}`} key={c.slug}>
                      <div className="cat-swatch" dangerouslySetInnerHTML={{ __html: marbleSVG(c.slug.length * 17 + 3, c.colorBase, c.colorVein) }} />
                      <div className="name">{c.name}</div>
                      <div className="count">{count} product{count === 1 ? '' : 's'}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="band dark">
            <div className="band-inner">
              <div className="section-head">
                <div>
                  <h2 style={{ color: 'var(--ivory)' }}>Featured slabs</h2>
                  <p>A few pieces currently moving fast.</p>
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

      <section className="band light">
        <div className="band-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32 }}>
          <Step n="01 — REQUEST" title="Send us your requirement" body="Tell us the stone, quantity in sq. ft., and finish you need." />
          <Step n="02 — QUOTE" title="We price it directly" body="Straight from our processing unit — no showroom margin added." />
          <Step n="03 — DISPATCH" title="Slabs reach your site" body="Crated and dispatched from Kishangarh to your location." />
        </div>
      </section>

      <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
    </>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="display" style={{ fontSize: 28 }}>{n}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--stone-grey)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}
function Step({ n, title, body }) {
  return (
    <div>
      <div className="mono" style={{ color: 'var(--brass)', fontSize: 12, letterSpacing: '0.08em', marginBottom: 10 }}>{n}</div>
      <h3 style={{ fontSize: 19, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--stone-grey)', fontSize: 14, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
