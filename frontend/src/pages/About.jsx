import SEO from '../components/SEO';

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Yatharth Emerald Stones is run out of Rajsamand, Rajasthan, sourcing marble, granite and sandstone directly from quarries and processing units in Makrana, Kishangarh, Rajnagar, Jalore and Dholpur."
        path="/about"
      />
      <section className="band dark">
        <div className="band-inner" style={{ maxWidth: 720 }}>
          <span className="eyebrow">● Our story</span>
          <h1 style={{ color: 'var(--ivory)', fontSize: 34, margin: '22px 0 16px', fontFamily: "'Fraunces',serif", fontWeight: 600 }}>
            Built by people who grew up around the quarries.
          </h1>
          <p style={{ color: 'var(--stone-grey)', lineHeight: 1.8, fontSize: 15 }}>
            Yatharth Emerald Stones is run out of Rajsamand, in the heart of Rajasthan's marble belt — a short
            drive from Makrana's white-marble quarries and Kishangarh's processing units, which
            together supply a large share of India's dimension stone. We started as a small
            trading desk taking orders by phone; this site is us putting that same catalog
            online, quoting each order the same way we always have.
          </p>
        </div>
      </section>
      <section className="band light">
        <div className="band-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32 }}>
          <Point title="SOURCING" heading="Straight from the belt" body="Every slab is sourced directly from quarries and processing units in Makrana, Kishangarh, Rajnagar, Jalore and Dholpur — no intermediate trader." />
          <Point title="PRICING" heading="Quoted, not listed" body="We don't publish prices on the site — every buyer gets a quote based on quantity, finish and delivery location, the same way we've always worked with our dealer and contractor clients." />
          <Point title="DELIVERY" heading="Crated and dispatched" body="Slabs are crated at our Kishangarh unit and dispatched across India; timelines depend on quantity and finish." />
        </div>
      </section>
      <section className="band light" style={{ paddingTop: 0 }}>
        <div className="band-inner" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 44 }}>
          <h3 style={{ fontSize: 19, marginBottom: 20 }}>Who we work with</h3>
          <div className="cat-grid">
            <Who name="Homeowners" desc="Flooring, kitchen counters, bathroom cladding" />
            <Who name="Architects & designers" desc="Sample requests, spec sheets, custom finishes" />
            <Who name="Builders & contractors" desc="Bulk quantities, site-timed dispatch" />
            <Who name="Dealers" desc="Standing rates, repeat orders" />
          </div>
        </div>
      </section>
    </>
  );
}

function Point({ title, heading, body }) {
  return (
    <div>
      <div className="mono" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <h3 style={{ fontSize: 19, marginBottom: 8 }}>{heading}</h3>
      <p style={{ color: 'var(--stone-grey)', fontSize: 14, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
function Who({ name, desc }) {
  return (
    <div className="cat-card" style={{ cursor: 'default' }}>
      <div className="name">{name}</div>
      <div className="count">{desc}</div>
    </div>
  );
}
