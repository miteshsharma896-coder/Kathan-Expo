import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.submitMessage(form);
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="band light">
      <div className="band-inner" style={{ maxWidth: 560 }}>
        {!sent ? (
          <>
            <h2 style={{ marginBottom: 8 }}>Get in touch</h2>
            <p style={{ color: 'var(--stone-grey)', fontSize: 14, marginBottom: 32 }}>
              Questions about a bulk order or site visit? Send us a note.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Full name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              {error && <p style={{ color: 'var(--sandstone)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-brass" type="submit">Send message</button>
            </form>
          </>
        ) : (
          <div className="confirm" style={{ textAlign: 'left', padding: 0 }}>
            <div className="checkmark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#132140" strokeWidth="2.4">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 8 }}>Message sent</h2>
            <p style={{ color: 'var(--stone-grey)', fontSize: 14 }}>Thanks — we'll reply within a business day.</p>
            <Link to="/" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-block' }}>Back to home</Link>
          </div>
        )}
      </div>
    </section>
  );
}
