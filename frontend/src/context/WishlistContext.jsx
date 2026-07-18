import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);

function loadWishlist() {
  try {
    return new Set(JSON.parse(localStorage.getItem('mh_wishlist') || '[]'));
  } catch {
    return new Set();
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlistState] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem('mh_wishlist', JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);

  function toggle(id) {
    setWishlistState((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggle }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
