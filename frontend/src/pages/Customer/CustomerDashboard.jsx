import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('jeweloraUser');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Unable to read user information:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jeweloraToken');
    localStorage.removeItem('jeweloraUser');

    navigate('/login');
  };

  return (
    <div className="customer-dashboard">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <Link to="/" className="dashboard-logo">
          Jewelora
        </Link>

        <p className="dashboard-label">
          CUSTOMER
        </p>

        <nav className="dashboard-nav">

          <Link
            to="/customer/dashboard"
            className="dashboard-nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/design-studio"
            className="dashboard-nav-item"
          >
            <span>✦</span>
            Create Design
          </Link>

          <Link
            to="/my-designs"
            className="dashboard-nav-item"
          >
            <span>◇</span>
            My Designs
          </Link>

          <Link
            to="/favorites"
            className="dashboard-nav-item"
          >
            <span>♡</span>
            Favorites
          </Link>

          <Link
            to="/compare"
            className="dashboard-nav-item"
          >
            <span>⇄</span>
            Compare
          </Link>

          <Link
            to="/jeweller-requests"
            className="dashboard-nav-item"
          >
            <span>◈</span>
            Jeweller Requests
          </Link>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <Link
            to="/profile"
            className="dashboard-nav-item"
          >
            <span>◯</span>
            Profile
          </Link>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top Bar */}
        <header className="dashboard-topbar">

          <div>
            <p className="dashboard-eyebrow">
              YOUR JEWELRY SPACE
            </p>

            <h1>
              Welcome back, {user?.name || 'there'}.
            </h1>
          </div>

          <div className="dashboard-profile">

            <div className="dashboard-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : 'J'}
            </div>

            <div>
              <strong>
                {user?.name || 'Customer'}
              </strong>

              <span>
                {user?.email || ''}
              </span>
            </div>

          </div>

        </header>

        {/* Hero */}
        <section className="dashboard-hero">

          <div className="dashboard-hero-content">

            <p className="dashboard-eyebrow">
              AI-POWERED JEWELRY DESIGN
            </p>

            <h2>
              Turn your imagination
              <br />
              into something timeless.
            </h2>

            <p>
              Create personalized jewelry concepts based on
              your style, material, gemstone preferences and
              budget.
            </p>

            <Link
              to="/design-studio"
              className="dashboard-primary-button"
            >
              Create New Design
              <span>→</span>
            </Link>

          </div>

          <div className="dashboard-hero-decoration">
            <div className="hero-ring">
              ✦
            </div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">
                EXPLORE
              </p>

              <h2>
                Your jewelry workspace
              </h2>
            </div>
          </div>

          <div className="dashboard-cards">

            <Link
              to="/design-studio"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                ✦
              </div>

              <h3>
                Create a Design
              </h3>

              <p>
                Start a new personalized jewelry concept.
              </p>

              <span className="dashboard-card-link">
                Start designing →
              </span>
            </Link>

            <Link
              to="/my-designs"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                ◇
              </div>

              <h3>
                My Designs
              </h3>

              <p>
                View and manage your generated jewelry designs.
              </p>

              <span className="dashboard-card-link">
                View designs →
              </span>
            </Link>

            <Link
              to="/favorites"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                ♡
              </div>

              <h3>
                Favorites
              </h3>

              <p>
                Keep your favorite jewelry concepts in one place.
              </p>

              <span className="dashboard-card-link">
                View favorites →
              </span>
            </Link>

            <Link
              to="/jeweller-requests"
              className="dashboard-card"
            >
              <div className="dashboard-card-icon">
                ◈
              </div>

              <h3>
                Jeweller Requests
              </h3>

              <p>
                Track designs you've shared with jewellers.
              </p>

              <span className="dashboard-card-link">
                View requests →
              </span>
            </Link>

          </div>

        </section>

        {/* Account Information */}
        <section className="dashboard-account">

          <div>
            <p className="dashboard-eyebrow">
              ACCOUNT
            </p>

            <h2>
              Your Jewelora account
            </h2>

            <p>
              Manage your personal information and continue
              creating jewelry designs that are uniquely yours.
            </p>
          </div>

          <Link
            to="/profile"
            className="dashboard-secondary-button"
          >
            View Profile →
          </Link>

        </section>

      </main>

    </div>
  );
}

export default CustomerDashboard;