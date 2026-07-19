import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import QuoteModal from '../components/QuoteModal';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeCats, setActiveCats] = useState(() => new Set(searchParams.get('cat') ? [searchParams.get('cat')] : []));
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ search })
      .then((all) => {
        const filtered = activeCats.size ? all.filter((p) => activeCats.has(p.category)) : all;
        setProducts(filtered);
      })
      .finally(() => setLoading(false));
  }, [search, activeCats]);

  function toggleCat(slug, checked) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      checked ? next.add(slug) : next.delete(slug);
      return next;
    });
  }
  function resetFilters() {
    setActiveCats(new Set());
    setSearch('');
    setSearchParams({});
  }

  return (
    <>
      <section className="band light" style={{ paddingBottom: 20 }}>
        <div className="band-inner">
          <div className="section-head">
            <div>
              <h2>Full catalog</h2>
              <p>{loading ? 'Loading…' : `Showing ${products.length} products`}</p>
            </div>
            <input
              placeholder="Search stone…"
              style={{ padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 2, fontSize: 14, width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="catalog-layout">
            <aside className="filters">
              <div className="filter-group">
                <h3>Category</h3>
                {categories.map((c) => (
                  <label className="filter-opt" key={c.slug}>
                    <input
                      type="checkbox"
                      checked={activeCats.has(c.slug)}
                      onChange={(e) => toggleCat(c.slug, e.target.checked)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={resetFilters}>Reset filters</button>
            </aside>
            <div className="prod-grid">
              {!loading && products.length === 0 && (
                <div className="empty">No stone matches that search. Try a different keyword or category.</div>
              )}
              {products.map((p) => (
                <ProductCard key={p._id} product={p} categories={categories} onQuote={setQuoteProduct} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
    </>
  );
}
