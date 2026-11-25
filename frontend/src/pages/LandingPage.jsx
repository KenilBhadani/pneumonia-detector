import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="landing-main">
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">AI-ASSISTED X-RAY REVIEW</p>
          <h2>A clearer way to keep track of your scans.</h2>
          <p className="hero-description">A simple workspace for chest X-ray analysis. Get started in moments and keep your results together in one organized place.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/sign-in">Get started <span aria-hidden="true">→</span></Link>
            <span className="signin-prompt">Already have an account? <Link className="inline-button" to="/sign-in">Sign in</Link></span>
          </div>
          <div className="trust-note"><span aria-hidden="true">✓</span> Your scans are saved to your account</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-glow" />
          <div className="scan-card">
            <div className="scan-card-top"><span className="scan-dot" /><span>CHEST X-RAY</span><span className="scan-date">TODAY</span></div>
            <div className="xray-illustration">
              <div className="xray-spine" />
              <div className="xray-lung left" />
              <div className="xray-lung right" />
              <div className="xray-ribs ribs-left" />
              <div className="xray-ribs ribs-right" />
            </div>
            <div className="scan-card-footer"><span>Analysis ready</span><span className="pulse-dot" /></div>
          </div>
          <div className="floating-note"><span className="floating-check">✓</span><div><strong>Results, organized</strong><small>All in one place</small></div></div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        </div>
      </section>
      <section className="feature-strip">
        <article><span className="feature-number">01</span><div><strong>Easy to use</strong><p>Upload an image and start your review.</p></div></article>
        <article><span className="feature-number">02</span><div><strong>Keep it together</strong><p>Your previous scans are easy to find.</p></div></article>
        <article><span className="feature-number">03</span><div><strong>Use thoughtfully</strong><p>Designed for learning, not diagnosis.</p></div></article>
      </section>
    </main>
  );
}
