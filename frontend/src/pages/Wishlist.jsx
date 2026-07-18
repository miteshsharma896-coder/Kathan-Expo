import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import QuoteModal from '../components/QuoteModal';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods.filter((p) => wishlist.has(p._id)));
      })
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <>
      <section className="band light">
        <div className="band-inner">
          <div className="section-head">
            <div>
              <h2>Your wishlist</h2>
              <p>Saved slabs — this stays on your device between visits.</p>
            </div>
          </div>
          <div className="prod-grid">
            {!loading && products.length === 0 && (
              <div className="empty">
                Nothing saved yet. Browse the <Link to="/catalog" style={{ color: 'var(--brass)' }}>catalog</Link> and tap the heart on any product to keep it here.
              </div>
            )}
            {products.map((p) => (
              <ProductCard key={p._id} product={p} categories={categories} onQuote={setQuoteProduct} />
            ))}
          </div>
        </div>
      </section>
      <QuoteModal product={quoteProduct} onClose={() => setQuoteProduct(null)} />
    </>
  );
}
