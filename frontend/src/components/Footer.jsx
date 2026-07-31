import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo" style={{ color: 'var(--ivory)', marginBottom: 14 }}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke="#C9A84C" strokeWidth="1.4"/>
              <polygon points="16,2 30,10 16,14 2,10" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1"/>
              <line x1="16" y1="14" x2="16" y2="30" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>
            </svg>
            Yatharth Emerald Stones
          </div>
          <p>Marble, granite, onyx and sandstone sourced directly from the quarries and godowns of Rajsamand, Rajasthan.</p>
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
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} Yatharth Emerald Stones. All rights reserved.</span>
        <span>Rajsamand, Rajasthan, India</span>
      </div>
    </footer>
  );
}
