
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Jewelora</div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-button">
            Login
          </Link>

          <button
            className="primary-button"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">
              AI-POWERED JEWELRY DESIGN
            </p>

            <h1>
              Design Jewelry
              <br />
              <span>That Is Uniquely Yours.</span>
            </h1>

            <p className="hero-description">
              Bring your imagination to life with personalized jewelry
              designs created with AI. Customize every detail and discover
              a design made just for you.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button large-button"
                onClick={() => navigate('/register')}
              >
                Start Designing ✦
              </button>

              <a
                href="#how-it-works"
                className="secondary-button"
              >
                Explore How It Works
              </a>
            </div>
          </div>

          {/* Solitaire Diamond Ring */}
          <div className="hero-card">
            <div className="jewel-placeholder">
              <img
                src="/images/diamond-ring.png"
                alt="Elegant solitaire diamond ring in gold"
                className="hero-ring-image"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="features-section"
        >
          <div className="section-heading">
            <p className="eyebrow">
              THE JEWELORA EXPERIENCE
            </p>

            <h2>From imagination to jewelry.</h2>

            <p>
              Create, personalize and connect with a jeweller through one
              intelligent platform.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-number">01</div>
              <h3>Customize</h3>
              <p>
                Choose your jewelry type, material, purity, gemstone, size,
                weight, style and other specifications.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-number">02</div>
              <h3>Generate</h3>
              <p>
                AI generates personalized 2D jewelry design concepts based
                on your selected preferences.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-number">03</div>
              <h3>Estimate</h3>
              <p>
                Get an approximate price estimate based on the selected
                materials, gemstones, weight and design complexity.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-number">04</div>
              <h3>Connect</h3>
              <p>
                Choose a jeweller and send your customized design request
                for further discussion.
              </p>
            </article>
          </div>
        </section>

        {/* About */}
        <section id="about" className="about-section">
          <div>
            <p className="eyebrow">ABOUT JEWELORA</p>

            <h2>
              Your idea.
              <br />
              Your style.
              <br />
              Your jewelry.
            </h2>
          </div>

          <div className="about-text">
            <p>
              Jewelora is an AI-powered custom jewelry platform designed to
              make personalized jewelry creation more accessible and
              interactive.
            </p>

            <p>
              Instead of choosing only from predefined designs, customers
              can describe their preferences and explore AI-generated
              concepts before connecting with a jeweller.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate('/register')}
            >
              Create Your Design ✦
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="logo">Jewelora</div>
        <p>Design jewelry that is uniquely yours.</p>
      </footer>
    </div>
  );
}

export default Home;
