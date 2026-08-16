import { useEffect, useState } from 'react';
import { api, assetUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { marbleSVG } from '../utils/marble';
import SEO from '../components/SEO';

const emptyForm = { name: '', category: '', origin: '', thickness: '', finish: '', images: [] };
const emptyCatForm = { slug: '', name: '', colorBase: '#DCC9A6', colorVein: '#9C7B4B' };
const MAX_IMAGES = 8;
const MAX_SIZE_MB = 5;

export default function Admin() {
  const { isLoggedIn, login, logout } = useAuth();
  return (
    <>
      <SEO title="Admin" path="/admin" noindex />
      {!isLoggedIn ? <LoginForm login={login} /> : <Panel logout={logout} />}
    </>
  );
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
  const [uploadProgress, setUploadProgress] = useState('');

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catForm, setCatForm] = useState(emptyCatForm);
  const [catEditingId, setCatEditingId] = useState(null);
  const [catError, setCatError] = useState('');

  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Validate files client-side before even hitting the API
  function validateFiles(files) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowed.includes(file.type)) {
        return `"${file.name}" is not a supported format. Only JPG, PNG and WEBP are allowed.`;
      }
      if (file.size > MAX_SIZE_BYTES) {
        return `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — image size must not exceed ${MAX_SIZE_MB} MB.`;
      }
    }
    return null;
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file
    if (!files.length) return;

    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setUploadError(`You can add up to ${MAX_IMAGES} photos per product.`);
      return;
    }

    const toUpload = files.slice(0, room);

    // ── Client-side validation (size + type) ──────────────────────────────────
    const clientError = validateFiles(toUpload);
    if (clientError) {
      setUploadError(clientError);
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      if (toUpload.length === 1) {
        // Single file — use the existing single-upload endpoint
        setUploadProgress('Uploading image…');
        const { url } = await api.uploadImage(toUpload[0]);
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      } else {
        // Multiple files — use the batch endpoint
        setUploadProgress(`Uploading ${toUpload.length} images…`);
        const { urls } = await api.uploadImages(toUpload);
        setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  function removeImage(index) {
    const img = form.images[index];
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
    // Attempt to delete from disk — non-blocking, ignore errors
    if (img) {
      const filename = img.replace(/^\/uploads\//, '');
      api.deleteImage(filename).catch(() => {});
    }
  }

  function moveImage(from, to) {
    if (to < 0 || to >= form.images.length) return;
    setForm((f) => {
      const imgs = [...f.images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      return { ...f, images: imgs };
    });
  }

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
    setSaveError('');
    setFormOpen(true);
  }
  function openEdit(p) {
    setForm({
      name: p.name,
      category: p.category,
      origin: p.origin,
      thickness: p.thickness,
      finish: p.finish,
      images: p.images || [],
    });
    setEditingId(p._id);
    setUploadError('');
    setSaveError('');
    setFormOpen(true);
  }
  async function handleDelete(id) {
    await api.deleteProduct(id);
    loadAll();
  }
  const [saveError, setSaveError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');
    try {
      const payload = { ...form, description: 'Added via the Yatharth Emerald Stones admin panel.' };
      if (editingId) await api.updateProduct(editingId, payload);
      else await api.createProduct(payload);
      setFormOpen(false);
      loadAll();
    } catch (err) {
      // 401 = session expired → tell admin to log out and back in
      if (err.message && err.message.includes('401')) {
        setSaveError('Session expired — please log out and log back in, then try again.');
      } else {
        setSaveError(err.message || 'Could not save product. Please try again.');
      }
    }
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
      if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'))) {
        setUploadError('Session expired — please Log out and log back in, then try uploading again.');
      } else {
        setUploadError(err.message);
      }
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
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
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
                  <tr><th></th><th>Name</th><th>Category</th><th>Origin</th><th></th></tr>
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

          {tab === 'settings' && <SettingsPanel />}

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
                <label>Thickness<span className="required-mark">*</span></label>
                <input required placeholder="e.g. 18mm / 20mm" value={form.thickness} onChange={(e) => setForm({ ...form, thickness: e.target.value })} />
              </div>
              <div className="field">
                <label>Finish<span className="required-mark">*</span></label>
                <input required placeholder="e.g. Polished" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
              </div>

              {/* ── IMAGE MANAGER ─────────────────────────────────────────── */}
              <div className="field">
                <label>
                  Product Images ({form.images.length}/{MAX_IMAGES})
                  {form.images.length > 0 && (
                    <span style={{ fontWeight: 400, color: 'var(--stone-grey)', marginLeft: 8, fontSize: 10.5, textTransform: 'none', letterSpacing: 0 }}>
                      First image = primary (shown in catalog &amp; home)
                    </span>
                  )}
                </label>

                {/* Image grid */}
                {form.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
                    {form.images.map((img, i) => (
                      <div key={img + i} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: i === 0 ? '2px solid var(--gold)' : '1px solid var(--line-soft)', background: '#f5f5f3' }}>
                        {/* Primary badge */}
                        {i === 0 && (
                          <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--gold)', color: '#1A1A18', fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, padding: '2px 6px', borderRadius: 2, zIndex: 2, letterSpacing: '0.04em' }}>
                            PRIMARY
                          </div>
                        )}
                        {/* Image preview */}
                        <img
                          src={assetUrl(img)}
                          alt={`Product image ${i + 1}`}
                          style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
                        />
                        {/* Action row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', background: '#fff', borderTop: '1px solid var(--line-soft)' }}>
                          {/* Reorder buttons */}
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              type="button"
                              onClick={() => moveImage(i, i - 1)}
                              disabled={i === 0}
                              title="Move left (set as primary)"
                              style={{ background: 'none', border: '1px solid var(--line-soft)', borderRadius: 2, width: 20, height: 20, fontSize: 10, cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1, color: 'var(--ink)' }}
                            >←</button>
                            <button
                              type="button"
                              onClick={() => moveImage(i, i + 1)}
                              disabled={i === form.images.length - 1}
                              title="Move right"
                              style={{ background: 'none', border: '1px solid var(--line-soft)', borderRadius: 2, width: 20, height: 20, fontSize: 10, cursor: i === form.images.length - 1 ? 'default' : 'pointer', opacity: i === form.images.length - 1 ? 0.3 : 1, color: 'var(--ink)' }}
                            >→</button>
                          </div>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            title="Remove image"
                            style={{ background: 'none', border: 'none', color: '#C0392B', fontSize: 14, lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {form.images.length < MAX_IMAGES && (
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px',
                    border: '1.5px dashed var(--gold)', borderRadius: 3, cursor: uploading ? 'not-allowed' : 'pointer',
                    color: 'var(--gold)', fontSize: 13, fontWeight: 600, opacity: uploading ? 0.6 : 1,
                    background: 'rgba(201,168,76,0.04)', marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                    {form.images.length === 0 ? 'Upload Images' : `Add More (${MAX_IMAGES - form.images.length} remaining)`}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                {/* Status messages */}
                {uploading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--stone-grey)', marginTop: 4 }}>
                    <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    {uploadProgress || 'Uploading…'}
                  </div>
                )}
                {uploadError && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: '#C0392B', marginTop: 6, padding: '8px 10px', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 3 }}>
                    <span style={{ flexShrink: 0, fontWeight: 700 }}>⚠</span>
                    <span>{uploadError}</span>
                  </div>
                )}
                {form.images.length === 0 && !uploading && !uploadError && (
                  <p style={{ fontSize: 12, color: 'var(--stone-grey)', marginTop: 4, lineHeight: 1.5 }}>
                    No photos yet — the product will show a generated stone texture until you add one.<br />
                    <span style={{ fontSize: 11 }}>Max {MAX_IMAGES} images · JPG, PNG or WEBP · up to {MAX_SIZE_MB} MB each</span>
                  </p>
                )}
                {form.images.length > 0 && !uploading && (
                  <p style={{ fontSize: 11, color: 'var(--stone-grey)', marginTop: 4 }}>
                    Use ← → to reorder. The first image is the primary shown in listings.
                  </p>
                )}
              </div>
              {/* ── END IMAGE MANAGER ──────────────────────────────────────── */}

      <button className="btn btn-gold" style={{ width: '100%' }} type="submit" disabled={uploading}>
                {uploading ? 'Please wait for upload to finish…' : 'Save product'}
              </button>
              {saveError && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 3, fontSize: 13, color: '#C0392B' }}>
                  ⚠ {saveError}
                </div>
              )}
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
          stroke="var(--line-soft)" strokeWidth="1"
        />
      ))}
      {series.map((d, i) => {
        const cx = padding + i * groupW + groupW / 2;
        const qh = (d.quoteCount / max) * (height - 14);
        const mh = (d.messageCount / max) * (height - 14);
        const showLabel = series.length <= 14 || i % 2 === 0;
        return (
          <g key={d.key}>
            <rect x={cx - barW - 1.5} y={height - qh} width={barW} height={qh} fill="var(--gold)" rx="1.5" />
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
            <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line-soft)' }}>
              <div style={{ width: `${quotePct}%`, background: 'linear-gradient(160deg,var(--gold-light),var(--gold))' }} />
              <div style={{ width: `${messagePct}%`, background: 'var(--ivory-dim)' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 13 }}>
              <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', marginRight: 6 }} />Quote requests — {quotes.length} ({quotePct}%)</span>
              <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--ivory-dim)', border: '1px solid var(--line-soft)', marginRight: 6 }} />Contact messages — {messages.length} ({messagePct}%)</span>
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
          <span><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', marginRight: 6 }} />Quote requests</span>
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
                <div style={{ width: `${(count / topProductsMax) * 100}%`, height: '100%', background: 'linear-gradient(160deg,var(--gold-light),var(--gold))' }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Recent activity</h3>
          {recent.length === 0 && <p className="empty">Nothing yet.</p>}
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
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

function SettingsPanel() {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    api.getSettings()
      .then((s) => setEmail(s.notificationEmail || ''))
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveSettings(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await api.updateSettings({ notificationEmail: email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 18, marginBottom: 6, fontFamily: "'Fraunces',serif" }}>Notification Settings</h3>
      <p style={{ fontSize: 13.5, color: 'var(--stone-grey)', marginBottom: 28, lineHeight: 1.6 }}>
        Every new quote request and contact message will be emailed to this address instantly.
        Leave blank to disable email notifications (enquiries still save to the database).
      </p>

      {loading ? (
        <p style={{ color: 'var(--stone-grey)', fontSize: 14 }}>Loading…</p>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <div className="field">
            <label>Notification email address</label>
            <input
              type="email"
              placeholder="e.g. yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'var(--rust)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          {saved && (
            <p style={{ color: '#2E7D32', fontSize: 13, marginBottom: 12 }}>
              ✓ Saved — new enquiries will be sent to {email || 'nobody (notifications off)'}
            </p>
          )}
          <button className="btn btn-gold" type="submit">Save email address</button>
        </form>
      )}

      <div style={{ marginTop: 36, padding: 20, background: 'var(--ivory-dim)', borderRadius: 4, border: '1px solid var(--line-soft)' }}>
        <h4 style={{ fontSize: 14, marginBottom: 10 }}>Email setup checklist</h4>
        <ol style={{ fontSize: 13.5, color: 'var(--stone-grey)', lineHeight: 1.9, paddingLeft: 18 }}>
          <li>Open <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 2, fontSize: 12 }}>backend/.env</code> in VS Code</li>
          <li>Set <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 2, fontSize: 12 }}>MAIL_USER</code> = your Gmail address</li>
          <li>Set <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 2, fontSize: 12 }}>MAIL_PASS</code> = Gmail App Password (16-char code)</li>
          <li>Restart the backend server (<code style={{ background: '#fff', padding: '1px 5px', borderRadius: 2, fontSize: 12 }}>Ctrl+C</code> then <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 2, fontSize: 12 }}>npm run dev</code>)</li>
          <li>Enter the delivery email above and click Save</li>
          <li>Submit a test quote from the catalog to verify</li>
        </ol>
        <p style={{ fontSize: 12.5, color: 'var(--stone-grey)', marginTop: 10 }}>
          Don't have a Gmail App Password yet? See the instructions in <code style={{ fontSize: 12 }}>backend/.env.example</code> — it takes about 2 minutes to generate one.
        </p>
      </div>
    </div>
  );
}
