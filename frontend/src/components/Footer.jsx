import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="logo" style={{ color: 'var(--ivory)', marginBottom: 12 }}>Yatharth Emerald Stones</div>
          <p style={{ maxWidth: 260, lineHeight: 1.6 }}>
            Marble, granite and sandstone sourced directly from Rajasthan's quarries.
          </p>
        </div>
        <div className="cols">
          <div>
            <h5>Explore</h5>
            <Link to="/catalog">Catalog</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link to="/about">About us</Link>
          </div>
        </div>
      </div>
      <div className="foot-bottom">Yatharth Emerald Stones — powered by a live MongoDB + Express API.</div>
    </footer>
  );
}
