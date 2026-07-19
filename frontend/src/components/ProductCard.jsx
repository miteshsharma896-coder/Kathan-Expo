import { Link } from 'react-router-dom';
import { productThumb } from '../utils/marble';
import { useWishlist } from '../context/WishlistContext';
import { assetUrl } from '../api';

export default function ProductCard({ product, categories, onQuote }) {
  const { wishlist, toggle } = useWishlist();
  const wished = wishlist.has(product._id);
  const hasPhoto = product.images && product.images.length > 0;

  return (
    <Link className="card" to={`/product/${product._id}`}>
      <div className="thumb">
        {hasPhoto ? (
          <img src={assetUrl(product.images[0])} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: productThumb(product, categories) }} />
        )}
        <div
          className={`heart ${wished ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product._id);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 21s-7.5-4.6-10-9.2C0.3 8 2 4 6 4c2.2 0 3.7 1.2 6 3.6C14.3 5.2 15.8 4 18 4c4 0 5.7 4 4 7.8-2.5 4.6-10 9.2-10 9.2z" />
          </svg>
        </div>
      </div>
      <div className="body">
        <div className="origin">{product.origin}</div>
        <h4>{product.name}</h4>
        <div className="spec-strip">
          <span>{product.thickness}</span>
          <span>{product.finish}</span>
        </div>
        <div className="price-row">
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--stone-grey)' }}>Price on request</span>
          <button
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuote(product);
            }}
          >
            Get quote
          </button>
        </div>
      </div>
    </Link>
  );
}
