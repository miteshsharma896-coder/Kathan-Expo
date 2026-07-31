import { NavLink, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export default function Header() {
  const { wishlist } = useWishlist();
  const navClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <header>
      <div className="nav-inner">
        <Link className="logo" to="/">
          <svg className="logo-mark" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke="#C9A84C" strokeWidth="1.4"/>
            <polygon points="16,2 30,10 16,14 2,10" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1"/>
            <line x1="2" y1="10" x2="16" y2="14" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>
            <line x1="30" y1="10" x2="16" y2="14" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>
            <line x1="16" y1="14" x2="16" y2="30" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>
          </svg>
          Yatharth Emerald Stones
        </Link>
        <nav className="navlinks">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/catalog" className={navClass}>Catalog</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>
          <NavLink to="/wishlist" className={navClass}>
            Wishlist<span className="badge">{wishlist.size}</span>
          </NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
