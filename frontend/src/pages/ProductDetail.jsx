import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, assetUrl } from '../api';
import { marbleSVG, seedFromId } from '../utils/marble';
import { useWishlist } from '../context/WishlistContext';
import QuoteModal from '../components/QuoteModal';
import SEO from '../components/SEO';

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
    setActiveShot(0);
    Promise.all([api.getProduct(id), api.getCategories()])
      .then(([p, cats]) => {
        setProduct(p);
        setCategories(cats);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <>
        <SEO title="Product Not Found" noindex />
        <div className="empty" style={{ padding: 80 }}>
          This product couldn't be found — it may have been removed.{' '}
          <Link to="/catalog" style={{ color: 'var(--gold)' }}>Back to catalog →</Link>
        </div>
      </>
    );
  }
  if (!product) return null;

  const cat = categories.find((c) => c.slug === product.category);
  const wished = wishlist.has(product._id);
  const hasPhotos = product.images && product.images.length > 0;

  let gallery; // array of { type: 'photo' | 'generated', value }
  if (hasPhotos) {
    gallery = product.images.map((img) => ({ type: 'photo', value: assetUrl(img) }));
  } else {
    const seedBase = seedFromId(product._id);
    gallery = cat
      ? [1, 2, 3].map((i) => ({ type: 'generated', value: marbleSVG(seedBase * 13 + i * 29, cat.colorBase, cat.colorVein) }))
      : [];
  }

  const metaDescription = `${product.name} from ${product.origin}. ${product.thickness} thickness, ${product.finish} finish. ${product.description}`.slice(0, 160);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: cat?.name,
    ...(hasPhotos && { image: product.images.map((img) => assetUrl(img)) }),
    brand: { '@type': 'Brand', name: 'Yatharth Emerald Stones' },
    // No "offers" block - pricing is quote-based, not listed publicly,
    // and schema.org's Offer type requires an actual price to be valid.
  };

  return (
    <>
      <SEO
        title={product.name}
        description={metaDescription}
        path={`/product/${product._id}`}
        image={hasPhotos ? assetUrl(product.images[0]) : undefined}
        jsonLd={productJsonLd}
      />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 28px 0' }}>
        <Link className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }} to="/catalog">← Back to catalog</Link>
      </div>
      <div className="pd-wrap">
        <div>
          <div className="pd-gallery-main">
            {gallery[activeShot]?.type === 'photo' ? (
              <img
                src={gallery[activeShot].value}
                alt={`${product.name} - ${product.origin}, ${product.finish} finish`}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: gallery[activeShot]?.value || '' }} />
            )}
          </div>
          <div className="pd-thumbs">
            {gallery.map((shot, i) => (
              <div key={i} className={`t ${i === activeShot ? 'active' : ''}`} onClick={() => setActiveShot(i)}>
                {shot.type === 'photo' ? (
                  <img
                    src={shot.value}
                    alt={`${product.name} view ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: shot.value }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="pd-info">
          <div className="origin">{product.origin}</div>
          <h1>{product.name}</h1>
          <div className="mono" style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
            Price on request — send a quote request below
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
