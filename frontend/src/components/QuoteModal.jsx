import { useState, useEffect } from 'react';
import { api } from '../api';
import PhoneField from './PhoneField';

const emptyForm = { name: '', phone: '', qty: 100, message: '' };

export default function QuoteModal({ product, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [instanceKey, setInstanceKey] = useState(0);

  // Every time the modal is opened for a product (including the same
  // product a second time), reset back to a fresh form instead of
  // showing the previous "request sent" confirmation. Bumping
  // instanceKey also forces PhoneField to remount so its internal
  // country/number state clears too.
  useEffect(() => {
    if (product) {
      setSent(false);
      setForm(emptyForm);
      setError('');
      setInstanceKey((k) => k + 1);
    }
  }, [product]);

  if (!product) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.submitQuote({ productId: product._id, ...form });
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={onClose}>&times;</button>
        {!sent ? (
          <>
            <h3>Request a quote</h3>
            <p className="sub">For {product.name}</p>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name<span className="required-mark">*</span></label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone<span className="required-mark">*</span></label>
                <PhoneField key={instanceKey} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
              </div>
              <div className="field">
                <label>Quantity (sq. ft)<span className="required-mark">*</span></label>
                <input required type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div className="field">
                <label>Message (optional)</label>
                <textarea
                  placeholder="Delivery city, timeline, finish preference…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              {error && <p style={{ color: 'var(--sandstone)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-brass" style={{ width: '100%' }} type="submit">Submit request</button>
            </form>
          </>
        ) : (
          <div className="confirm">
            <div className="checkmark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#132140" strokeWidth="2.4">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>
            <h3>Request sent</h3>
            <p style={{ color: 'var(--stone-grey)', fontSize: 14, marginTop: 8 }}>
              We'll get back to you with pricing within 24 hours.
            </p>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
