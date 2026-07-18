import { NavLink, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export default function Header() {
  const { wishlist } = useWishlist();
  const navClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <header>
      <div className="nav-inner">
        <Link className="logo" to="/">
          <svg className="mark" viewBox="0 0 24 24">
            <path d="M3 20 L3 10 L12 4 L21 10 L21 20 Z" fill="none" stroke="#3B6EA5" strokeWidth="1.4" />
            <path d="M3 10 L12 16 L21 10" fill="none" stroke="#3B6EA5" strokeWidth="1.4" />
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
          <NavLink to="/admin" className={navClass}>Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
