import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { marbleSVG } from '../utils/marble';

const emptyForm = { name: '', category: '', origin: '', price: '', thickness: '', finish: '' };

export default function Admin() {
  const { isLoggedIn, login, logout } = useAuth();
  if (!isLoggedIn) return <LoginForm login={login} />;
  return <Panel logout={logout} />;
}

function LoginForm({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-box">
      <h2 style={{ marginBottom: 6 }}>Admin login</h2>
      <p style={{ color: 'var(--stone-grey)', fontSize: 13.5, marginBottom: 24 }}>
        Demo credentials — set in the backend's <code>.env</code> file (default: <b>admin</b> / <b>marble123</b>)
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Username</label>
          <input required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--sandstone)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-brass" style={{ width: '100%' }} type="submit">Log in</button>
      </form>
    </div>
  );
}

function Panel({ logout }) {
  const { wishlist } = useWishlist();
  const [tab, setTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  function loadAll() {
    api.getCategories().then(setCategories);
    api.getProducts().then(setProducts);
    api.getQuotes().then(setQuotes).catch(() => setQuotes([]));
    api.getMessages().then(setMessages).catch(() => setMessages([]));
  }
  useEffect(loadAll, []);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  }
  function openEdit(p) {
    setForm({ name: p.name, category: p.category, origin: p.origin, price: p.price, thickness: p.thickness, finish: p.finish });
    setEditingId(p._id);
    setFormOpen(true);
  }
  async function handleDelete(id) {
    await api.deleteProduct(id);
    loadAll();
  }
  async function handleSave(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), description: 'Added via the Yatharth Emerald Stones admin panel.' };
    if (editingId) await api.updateProduct(editingId, payload);
    else await api.createProduct(payload);
    setFormOpen(false);
    loadAll();
  }

  return (
    <div className="admin-shell">
      <div className="admin-head">
        <h2>Admin panel</h2>
        <button className="btn btn-outline" onClick={logout}>Log out</button>
      </div>
      <div className="stat-grid">
        <Stat n={products.length} label="Products" />
        <Stat n={quotes.length} label="Quote requests" />
        <Stat n={messages.length} label="Contact messages" />
        <Stat n={wishlist.size} label="Wishlist saves (this device)" />
      </div>
      <div className="tabbar">
        {['products', 'inquiries', 'messages'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'products' ? 'Products' : t === 'inquiries' ? 'Quote requests' : 'Contact messages'}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn btn-brass" onClick={openAdd}>+ Add product</button>
          </div>
          <table>
            <thead>
              <tr><th></th><th>Name</th><th>Category</th><th>Origin</th><th>Price/sq.ft</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = categories.find((c) => c.slug === p.category);
                return (
                  <tr key={p._id}>
                    <td>
                      {cat && (
                        <div className="swatch-sm" dangerouslySetInnerHTML={{ __html: marbleSVG(p._id.length + 7, cat.colorBase, cat.colorVein) }} />
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{cat?.name}</td>
                    <td>{p.origin}</td>
                    <td>₹{p.price}</td>
                    <td className="row-actions">
                      <button onClick={() => openEdit(p)}>Edit</button>
                      <button onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inquiries' && (
        <table>
          <thead><tr><th>Product</th><th>Name</th><th>Phone</th><th>Qty (sq.ft)</th><th>Message</th></tr></thead>
          <tbody>
            {quotes.length === 0 && <tr><td colSpan="5" className="empty">No quote requests yet.</td></tr>}
            {quotes.map((q) => (
              <tr key={q._id}><td>{q.productName}</td><td>{q.name}</td><td>{q.phone}</td><td>{q.qty}</td><td>{q.message}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'messages' && (
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Message</th></tr></thead>
          <tbody>
            {messages.length === 0 && <tr><td colSpan="4" className="empty">No contact messages yet.</td></tr>}
            {messages.map((m) => (
              <tr key={m._id}><td>{m.name}</td><td>{m.phone}</td><td>{m.email}</td><td>{m.message}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      {formOpen && (
        <div className="overlay">
          <div className="modal">
            <button className="close" onClick={() => setFormOpen(false)}>&times;</button>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <p className="sub">Saved directly to MongoDB.</p>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Select…</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Origin</label>
                <input required placeholder="e.g. Kishangarh, Rajasthan" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              </div>
              <div className="field">
                <label>Price per sq.ft (₹)</label>
                <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Thickness</label>
                <input required placeholder="e.g. 18mm / 20mm" value={form.thickness} onChange={(e) => setForm({ ...form, thickness: e.target.value })} />
              </div>
              <div className="field">
                <label>Finish</label>
                <input required placeholder="e.g. Polished" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
              </div>
              <button className="btn btn-brass" style={{ width: '100%' }} type="submit">Save product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div className="stat">
      <div className="num">{n}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}
