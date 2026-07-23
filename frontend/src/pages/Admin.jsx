import { useEffect, useState } from 'react';
import { api, assetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { marbleSVG } from '../utils/marble';

const emptyForm = { name: '', category: '', origin: '', price: '', thickness: '', finish: '', images: [] };
const emptyCatForm = { slug: '', name: '', colorBase: '#DCC9A6', colorVein: '#9C7B4B' };
const MAX_IMAGES = 4;

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
          <label>Username<span className="required-mark">*</span></label>
          <input required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>Password<span className="required-mark">*</span></label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--sandstone)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-brass" style={{ width: '100%' }} type="submit">Log in</button>
      </form>
    </div>
  );
}

function Panel({ logout }) {
  const [tab, setTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catForm, setCatForm] = useState(emptyCatForm);
  const [catEditingId, setCatEditingId] = useState(null);
  const [catError, setCatError] = useState('');

  function openAddCategory() {
    setCatForm(emptyCatForm);
    setCatEditingId(null);
    setCatError('');
    setCatFormOpen(true);
  }
  function openEditCategory(c) {
    setCatForm({ slug: c.slug, name: c.name, colorBase: c.colorBase, colorVein: c.colorVein });
    setCatEditingId(c._id);
    setCatError('');
    setCatFormOpen(true);
  }
  async function handleSaveCategory(e) {
    e.preventDefault();
    setCatError('');
    try {
      if (catEditingId) await api.updateCategory(catEditingId, catForm);
      else await api.createCategory(catForm);
      setCatFormOpen(false);
      loadAll();
    } catch (err) {
      setCatError(err.message);
    }
  }
  async function handleDeleteCategory(id) {
    try {
      await api.deleteCategory(id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

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
    setUploadError('');
    setFormOpen(true);
  }
  function openEdit(p) {
    setForm({
      name: p.name,
      category: p.category,
      origin: p.origin,
      price: p.price,
      thickness: p.thickness,
      finish: p.finish,
      images: p.images || [],
    });
    setEditingId(p._id);
    setUploadError('');
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

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow selecting the same file again later
    if (!files.length) return;

    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setUploadError(`You can add up to ${MAX_IMAGES} photos per product.`);
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const toUpload = files.slice(0, room);
      const uploaded = [];
      for (const file of toUpload) {
        const { url } = await api.uploadImage(file);
        uploaded.push(url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  return (
    <div className="admin-shell">
      <div className="admin-head">
        <h2>Admin panel</h2>
        <button className="btn btn-outline" onClick={logout}>Log out</button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidenav">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Categories</button>
          <button className={tab === 'inquiries' ? 'active' : ''} onClick={() => setTab('inquiries')}>Quote requests</button>
          <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>Contact messages</button>
        </aside>

        <div className="admin-content">
          {tab === 'dashboard' && <Dashboard quotes={quotes} messages={messages} products={products} categories={categories} />}

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
                    const hasPhoto = p.images && p.images.length > 0;
                    return (
                      <tr key={p._id}>
                        <td>
                          {hasPhoto ? (
                            <img className="swatch-sm" src={assetUrl(p.images[0])} alt="" style={{ objectFit: 'cover' }} />
                          ) : (
                            cat && <div className="swatch-sm" dangerouslySetInnerHTML={{ __html: marbleSVG(p._id.length + 7, cat.colorBase, cat.colorVein) }} />
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

          {tab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                <button className="btn btn-brass" onClick={openAddCategory}>+ Add category</button>
              </div>
              <table>
                <thead>
                  <tr><th></th><th>Name</th><th>Slug</th><th>Products using it</th><th></th></tr>
                </thead>
                <tbody>
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c.slug).length;
                    return (
                      <tr key={c._id}>
                        <td><div className="swatch-sm" dangerouslySetInnerHTML={{ __html: marbleSVG(c.slug.length + 3, c.colorBase, c.colorVein) }} /></td>
                        <td>{c.name}</td>
                        <td className="mono" style={{ fontSize: 12, color: 'var(--stone-grey)' }}>{c.slug}</td>
                        <td>{count}</td>
                        <td className="row-actions">
                          <button onClick={() => openEditCategory(c)}>Edit</button>
                          <button onClick={() => handleDeleteCategory(c._id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && <tr><td colSpan="5" className="empty">No categories yet.</td></tr>}
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
        </div>
      </div>

      {formOpen && (
        <div className="overlay">
          <div className="modal">
            <button className="close" onClick={() => setFormOpen(false)}>&times;</button>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <p className="sub">Saved directly to MongoDB.</p>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Name<span className="required-mark">*</span></label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Category<span className="required-mark">*</span></label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Select…</option>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Origin<span className="required-mark">*</span></label>
                <input required placeholder="e.g. Kishangarh, Rajasthan" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              </div>
              <div className="field">
                <label>Price per sq.ft (₹)<span className="required-mark">*</span></label>
                <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Thickness<span className="required-mark">*</span></label>
                <input required placeholder="e.g. 18mm / 20mm" value={form.thickness} onChange={(e) => setForm({ ...form, thickness: e.target.value })} />
              </div>
              <div className="field">
                <label>Finish<span className="required-mark">*</span></label>
                <input required placeholder="e.g. Polished" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
              </div>

              <div className="field">
                <label>Photos ({form.images.length}/{MAX_IMAGES})</label>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {form.images.map((img, i) => (
                      <div key={img + i} style={{ position: 'relative', width: 64, height: 64 }}>
                        <img
                          src={assetUrl(img)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, border: '1px solid var(--line)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                            background: 'var(--sandstone)', color: '#fff', fontSize: 13, lineHeight: 1,
                          }}
                          aria-label="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length < MAX_IMAGES && (
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleFileSelect} disabled={uploading} />
                )}
                {uploading && <p style={{ fontSize: 12.5, color: 'var(--stone-grey)', marginTop: 6 }}>Uploading…</p>}
                {uploadError && <p style={{ fontSize: 12.5, color: 'var(--sandstone)', marginTop: 6 }}>{uploadError}</p>}
                {form.images.length === 0 && !uploading && (
                  <p style={{ fontSize: 12.5, color: 'var(--stone-grey)', marginTop: 6 }}>
                    No photos yet — the product will show a generated stone texture until you add one.
                  </p>
                )}
              </div>

              <button className="btn btn-brass" style={{ width: '100%' }} type="submit" disabled={uploading}>
                Save product
              </button>
            </form>
          </div>
        </div>
      )}

      {catFormOpen && (
        <div className="overlay">
          <div className="modal">
            <button className="close" onClick={() => setCatFormOpen(false)}>&times;</button>
            <h3>{catEditingId ? 'Edit category' : 'Add category'}</h3>
            <p className="sub">Used to group products and color their generated swatch.</p>
            <form onSubmit={handleSaveCategory}>
              <div className="field">
                <label>Name<span className="required-mark">*</span></label>
                <input
                  required
                  placeholder="e.g. Rajasthan Granite"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Slug<span className="required-mark">*</span></label>
                <input
                  required
                  placeholder="e.g. granite (no spaces, lowercase)"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') })}
                  disabled={!!catEditingId}
                />
                {catEditingId && (
                  <p style={{ fontSize: 11.5, color: 'var(--stone-grey)', marginTop: 6 }}>
                    Slug can't be changed once products are using it.
                  </p>
                )}
              </div>
              <div className="field">
                <label>Swatch base color<span className="required-mark">*</span></label>
                <input
                  required
                  type="color"
                  value={catForm.colorBase}
                  onChange={(e) => setCatForm({ ...catForm, colorBase: e.target.value })}
                  style={{ height: 42, padding: 4 }}
                />
              </div>
              <div className="field">
                <label>Swatch vein color<span className="required-mark">*</span></label>
                <input
                  required
                  type="color"
                  value={catForm.colorVein}
                  onChange={(e) => setCatForm({ ...catForm, colorVein: e.target.value })}
                  style={{ height: 42, padding: 4 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="swatch-sm" style={{ width: 64, height: 64 }} dangerouslySetInnerHTML={{ __html: marbleSVG(7, catForm.colorBase, catForm.colorVein) }} />
              </div>
              {catError && <p style={{ color: 'var(--sandstone)', fontSize: 13, marginBottom: 12 }}>{catError}</p>}
              <button className="btn btn-brass" style={{ width: '100%' }} type="submit">Save category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function buildDailySeries(quotes, messages, days = 14) {
  const today = new Date();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const quoteCount = quotes.filter((q) => (q.createdAt || '').slice(0, 10) === key).length;
    const messageCount = messages.filter((m) => (m.createdAt || '').slice(0, 10) === key).length;
    series.push({ key, label, quoteCount, messageCount });
  }
  return series;
}

function EnquiryTrendChart({ series }) {
  const width = 720;
  const height = 170;
  const padding = 8;
  const max = Math.max(1, ...series.map((d) => Math.max(d.quoteCount, d.messageCount)));
  const groupW = (width - padding * 2) / series.length;
  const barW = Math.min(11, groupW * 0.32);

  return (
    <svg viewBox={`0 0 ${width} ${height + 22}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={padding} x2={width - padding}
          y1={height - f * (height - 10)} y2={height - f * (height - 10)}
          stroke="var(--line)" strokeWidth="1"
        />
      ))}
      {series.map((d, i) => {
        const cx = padding + i * groupW + groupW / 2;
        const qh = (d.quoteCount / max) * (height - 14);
        const mh = (d.messageCount / max) * (height - 14);
        const showLabel = series.length <= 14 || i % 2 === 0;
        return (
          <g key={d.key}>
            <rect x={cx - barW - 1.5} y={height - qh} width={barW} height={qh} fill="var(--brass)" rx="1.5" />
            <rect x={cx + 1.5} y={height - mh} width={barW} height={mh} fill="var(--stone-grey)" opacity="0.55" rx="1.5" />
            {showLabel && (
              <text x={cx} y={height + 16} textAnchor="middle" fontSize="9" fill="var(--stone-grey)" fontFamily="'IBM Plex Mono',monospace">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Dashboard({ quotes, messages, products, categories }) {
  const total = quotes.length + messages.length;
  const quotePct = total ? Math.round((quotes.length / total) * 100) : 0;
  const messagePct = total ? 100 - quotePct : 0;

  const countsByProduct = {};
  quotes.forEach((q) => {
    countsByProduct[q.productName] = (countsByProduct[q.productName] || 0) + 1;
  });
  const topProducts = Object.entries(countsByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topProductsMax = Math.max(1, ...topProducts.map(([, count]) => count));

  const recent = [
    ...quotes.map((q) => ({ type: 'Quote', label: `${q.name} — ${q.productName}`, at: q.createdAt })),
    ...messages.map((m) => ({ type: 'Contact', label: `${m.name} — message`, at: m.createdAt })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  const dailySeries = buildDailySeries(quotes, messages, 14);

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <Stat n={total} label="Total enquiries" />
        <Stat n={quotes.length} label="From quote requests" />
        <Stat n={messages.length} label="From contact form" />
        <Stat n={products.length} label="Products listed" />
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Where enquiries come from</h3>
        {total === 0 ? (
          <p className="empty">No enquiries yet — this fills in once customers start submitting quote requests or contact messages.</p>
        ) : (
          <>
            <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ width: `${quotePct}%`, background: 'linear-gradient(160deg,var(--brass-light),var(--brass))' }} />
              <div style={{ width: `${messagePct}%`, background: 'var(--ivory-dim)' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 13 }}>
              <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--brass)', marginRight: 6 }} />Quote requests — {quotes.length} ({quotePct}%)</span>
              <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--ivory-dim)', border: '1px solid var(--line)', marginRight: 6 }} />Contact messages — {messages.length} ({messagePct}%)</span>
            </div>
          </>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Enquiries — last 14 days</h3>
        <p style={{ fontSize: 12.5, color: 'var(--stone-grey)', marginBottom: 14 }}>
          Bars are counted by the day each enquiry was submitted.
        </p>
        <EnquiryTrendChart series={dailySeries} />
        <div style={{ display: 'flex', gap: 24, marginTop: 8, fontSize: 12.5 }}>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--brass)', marginRight: 6 }} />Quote requests</span>
          <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--stone-grey)', opacity: 0.55, marginRight: 6 }} />Contact messages</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Most-quoted products</h3>
          {topProducts.length === 0 && <p className="empty">No quote requests yet.</p>}
          {topProducts.map(([name, count]) => (
            <div key={name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span>{name}</span>
                <span className="mono" style={{ color: 'var(--stone-grey)' }}>{count}</span>
              </div>
              <div style={{ height: 8, background: 'var(--ivory-dim)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(count / topProductsMax) * 100}%`, height: '100%', background: 'linear-gradient(160deg,var(--brass-light),var(--brass))' }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Recent activity</h3>
          {recent.length === 0 && <p className="empty">Nothing yet.</p>}
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
              <span className="mono" style={{ color: 'var(--stone-grey)', flexShrink: 0, fontSize: 11 }}>{r.type}</span>
            </div>
          ))}
        </div>
      </div>
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
