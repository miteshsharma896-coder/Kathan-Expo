import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" path="/404" noindex />
      <section className="band light" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="band-inner" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 14 }}>
            ERROR 404
          </div>
          <h1 style={{ fontSize: 30, marginBottom: 14, fontFamily: "'Fraunces',serif", fontWeight: 600 }}>
            This page doesn't exist
          </h1>
          <p style={{ color: 'var(--stone-grey)', fontSize: 14.5, marginBottom: 30, lineHeight: 1.6 }}>
            The page you're looking for may have been moved, renamed, or never existed.
            Try the catalog, or head back home.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-brass">Back to home</Link>
            <Link to="/catalog" className="btn btn-outline">Browse catalog</Link>
          </div>
        </div>
      </section>
    </>
  );
}
