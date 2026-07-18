import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { marbleSVG, seedFromId } from '../utils/marble';
import { useWishlist } from '../context/WishlistContext';
import QuoteModal from '../components/QuoteModal';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [activeShot, setActiveShot] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const { wishlist, toggle } = useWishlist();

  useEffect(() => {
    setNotFound(false);
    setProduct(null);
    Promise.all([api.getProduct(id), api.getCategories()])
      .then(([p, cats]) => {
        setProduct(p);
        setCategories(cats);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="empty" style={{ padding: 80 }}>
        This product couldn't be found — it may have been removed.{' '}
        <Link to="/catalog" style={{ color: 'var(--brass)' }}>Back to catalog →</Link>
      </div>
    );
  }
  if (!product) return null;

  const cat = categories.find((c) => c.slug === product.category);
  const wished = wishlist.has(product._id);
  const seedBase = seedFromId(product._id);
  const shots = cat ? [1, 2, 3].map((i) => marbleSVG(seedBase * 13 + i * 29, cat.colorBase, cat.colorVein)) : [];

  return (
    <>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 28px 0' }}>
        <Link className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }} to="/catalog">← Back to catalog</Link>
      </div>
      <div className="pd-wrap">
        <div>
          <div className="pd-gallery-main" dangerouslySetInnerHTML={{ __html: shots[activeShot] }} />
          <div className="pd-thumbs">
            {shots.map((s, i) => (
              <div
                key={i}
                className={`t ${i === activeShot ? 'active' : ''}`}
                onClick={() => setActiveShot(i)}
                dangerouslySetInnerHTML={{ __html: s }}
              />
            ))}
          </div>
        </div>
        <div className="pd-info">
          <div className="origin">{product.origin}</div>
          <h1>{product.name}</h1>
          <div className="price">
            ₹{product.price} <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--stone-grey)', fontWeight: 400 }}>/ sq.ft</span>
          </div>
          <p className="desc">{product.description}</p>
          <div className="spec-table">
            <Row k="Category" v={cat?.name} />
            <Row k="Thickness" v={product.thickness} />
            <Row k="Finish" v={product.finish} />
            <Row k="Origin" v={product.origin} />
          </div>
          <div className="pd-actions">
            <button className="btn btn-brass" onClick={() => setShowQuote(true)}>Request a quote</button>
            <button className="btn btn-outline" onClick={() => toggle(product._id)}>
              {wished ? '♥ Saved' : '♡ Save to wishlist'}
            </button>
          </div>
        </div>
      </div>
      {showQuote && <QuoteModal product={product} onClose={() => setShowQuote(false)} />}
    </>
  );
}

function Row({ k, v }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span>{v}</span>
    </div>
  );
}
