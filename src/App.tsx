import './App.css';

function App() {
  return (
    <div className="shell">
      <div className="shell__atmosphere" aria-hidden>
        <div className="shell__mesh" />
        <div className="shell__orbs">
          <span className="orb orb--1" />
          <span className="orb orb--2" />
          <span className="orb orb--3" />
        </div>
        <div className="shell__grain" />
      </div>

      <header className="top">
        <a className="mark" href="/">
          <span className="mark__glyph" aria-hidden />
          Erudis
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#philosophy">Philosophy</a>
          <a href="#pillars">Pillars</a>
          <a href="#early-access">Early access</a>
        </nav>
      </header>

      <main className="hero">
        <p className="eyebrow">
          <span className="eyebrow__pulse" aria-hidden />
          Initial release · crafted for focus
        </p>
        <h1 className="hero__title">
          Where curiosity
          <span className="hero__title-break"> becomes clarity.</span>
        </h1>
        <p className="hero__lead">
          Erudis is a workspace for people who read deeply, write carefully, and
          think in layers—not headlines. One surface. No noise. Your thread of
          thought, uninterrupted.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#early-access">
            Join the waitlist
          </a>
          <a className="btn btn--quiet" href="#philosophy">
            Read the manifesto
          </a>
        </div>
      </main>

      <section className="philosophy" id="philosophy" aria-labelledby="philosophy-heading">
        <div className="philosophy__panel">
          <h2 id="philosophy-heading" className="section-title">
            Calm is a feature
          </h2>
          <p className="section-copy">
            Tools should disappear behind the work. Erudis strips away feeds,
            badges, and urgency so attention can settle where it matters—on the
            sentence, the source, and the slow build of real understanding.
          </p>
        </div>
      </section>

      <section className="pillars" id="pillars" aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="visually-hidden">
          Three pillars
        </h2>
        <ul className="pillar-grid">
          <li className="pillar">
            <span className="pillar__index">01</span>
            <h3 className="pillar__title">Sources first</h3>
            <p className="pillar__text">
              Citations, margins, and context stay visible—never buried in modal
              stacks.
            </p>
          </li>
          <li className="pillar">
            <span className="pillar__index">02</span>
            <h3 className="pillar__title">Linear by design</h3>
            <p className="pillar__text">
              One narrative flow you control. Branch only when you choose to.
            </p>
          </li>
          <li className="pillar">
            <span className="pillar__index">03</span>
            <h3 className="pillar__title">Built to last</h3>
            <p className="pillar__text">
              Local-first posture, exportable artifacts, and interfaces that age
              quietly.
            </p>
          </li>
        </ul>
      </section>

      <section className="cta-band" id="early-access">
        <div className="cta-band__inner">
          <h2 className="cta-band__title">Be first in line</h2>
          <p className="cta-band__copy">
            We are opening a small circle of readers and writers before public
            launch. Leave your email—no spam, one update when the door opens.
          </p>
          <form
            className="signup"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label htmlFor="email" className="visually-hidden">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@domain.com"
              className="signup__input"
            />
            <button type="submit" className="btn btn--primary signup__btn">
              Notify me
            </button>
          </form>
        </div>
      </section>

      <footer className="foot">
        <p className="foot__line">
          <span className="foot__brand">Erudis</span>
          <span className="foot__sep" aria-hidden>
            ·
          </span>
          <span>Initial commit · {new Date().getFullYear()}</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
