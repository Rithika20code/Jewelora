
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function getImageSource(design) {
  const source = design?.imageUrl || design?.imageBase64;

  if (typeof source !== 'string' || !source.trim()) {
    return '';
  }

  const value = source.trim();

  if (
    value.startsWith('data:image/') ||
    /^https?:\/\//i.test(value) ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  return `data:image/png;base64,${value}`;
}

export default function Favorites() {
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jeweloraToken')}`,
    },
  });

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/designs/favorites`,
        authConfig()
      );

      const list = Array.isArray(response.data?.designs)
        ? response.data.designs
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setDesigns(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load favorite designs. Please check your login and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Reopen the saved record, not a newly generated AI design.
  const openDesign = (design) => {
    navigate(`/design-result?id=${design._id}`, {
      state: {
        design,
        savedDesign: design,
        priceEstimate: design.priceEstimate || null,
      },
    });
  };

  const removeFavorite = async (id) => {
    try {
      setBusyId(id);
      setError('');

      await axios.patch(
        `${API_URL}/designs/${id}/favorite`,
        {},
        authConfig()
      );

      setDesigns((previous) =>
        previous.filter((design) => design._id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update favorite. Please try again.'
      );
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return (
      <main style={styles.message}>
        Loading your favorites...
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/my-designs" style={styles.link}>
          ← My Designs
        </Link>

        <Link to="/customer/dashboard" style={styles.link}>
          Dashboard
        </Link>
      </nav>

      <header style={styles.header}>
        <p style={styles.eyebrow}>YOUR PERSONAL COLLECTION</p>
        <h1 style={styles.title}>Favorite Designs</h1>
        <p style={styles.subtitle}>
          Keep the jewelry concepts you love close at hand.
        </p>
      </header>

      {error && (
        <div role="alert" style={styles.error}>
          <p>{error}</p>
          <button
            type="button"
            onClick={loadFavorites}
            style={styles.retryButton}
          >
            Try again
          </button>
        </div>
      )}

      {!error && designs.length === 0 ? (
        <section style={styles.empty}>
          <div style={styles.heart}>♡</div>
          <h2>No favorites yet</h2>
          <p>
            Your favorite jewelry concepts will appear here.
            Open My Designs and tap the heart to add a design
            to your favorites.
          </p>
          <Link to="/my-designs" style={styles.emptyLink}>
            View My Designs
          </Link>
        </section>
      ) : (
        !error && (
          <section style={styles.grid}>
            {designs.map((design) => {
              const imageSrc = getImageSource(design);

              return (
                <article key={design._id} style={styles.card}>
                  <div style={styles.imageWrapper}>
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={`${design.style || 'Custom'} ${design.jewelryType || 'jewelry'}`}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noImage}>
                        Image unavailable
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFavorite(design._id)}
                      disabled={busyId === design._id}
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                      style={styles.heartButton}
                    >
                      {busyId === design._id ? '…' : '♥'}
                    </button>
                  </div>

                  <div style={styles.details}>
                    <p style={styles.eyebrowSmall}>
                      {design.material || 'Material not specified'}
                      {' · '}
                      {design.purity || 'Purity not specified'}
                    </p>

                    <h2 style={styles.cardTitle}>
                      {design.style || 'Custom'}{' '}
                      {design.jewelryType || 'Jewelry'}
                    </h2>

                    <p style={styles.meta}>
                      Metal color: {design.metalColor || '—'}
                    </p>

                    <p style={styles.meta}>
                      Purity: {design.purity || '—'}
                    </p>

                    <p style={styles.meta}>
                      Estimated weight: {design.estimatedWeight ?? '—'} g
                    </p>

                    {design.gemstone && (
                      <p style={styles.meta}>
                        Gemstone: {design.gemstone}
                        {Number(design.carat) > 0
                          ? ` · ${design.carat} ct`
                          : ''}
                      </p>
                    )}

                    <p style={styles.meta}>
                      Budget: ₹
                      {Number(design.budget || 0).toLocaleString('en-IN')}
                    </p>

                    {design.description && (
                      <p style={styles.description}>
                        {design.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => openDesign(design)}
                      style={styles.viewButton}
                    >
                      View Design →
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFavorite(design._id)}
                      disabled={busyId === design._id}
                      style={styles.removeButton}
                    >
                      {busyId === design._id
                        ? 'Please wait...'
                        : '♥ Remove from Favorites'}
                    </button>

                    <p style={styles.date}>
                      {design.createdAt
                        ? `Saved ${new Date(
                            design.createdAt
                          ).toLocaleDateString('en-IN')}`
                        : 'Saved design'}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '28px clamp(18px, 5vw, 64px) 64px',
    background: '#faf7f3',
    color: '#30241f',
    fontFamily: 'Arial, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  header: {
    marginBottom: 36,
    paddingBottom: 26,
    borderBottom: '1px solid #eee4da',
  },
  eyebrow: {
    letterSpacing: 3,
    fontSize: 11,
    color: '#a17b52',
    fontWeight: 700,
  },
  eyebrowSmall: {
    letterSpacing: 1.2,
    fontSize: 10,
    color: '#a17b52',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 400,
    margin: '12px 0',
  },
  subtitle: {
    color: '#796d64',
    lineHeight: 1.7,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
    gap: 24,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #eee4da',
    boxShadow: '0 8px 24px rgba(65, 44, 28, 0.06)',
  },
  imageWrapper: {
    height: 250,
    position: 'relative',
    background: '#f2ece5',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  noImage: {
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    background: '#f2ece5',
    color: '#796d64',
  },
  details: {
    padding: 18,
  },
  cardTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 21,
    fontWeight: 400,
    margin: '8px 0 14px',
    textTransform: 'capitalize',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: '1px solid #eee4da',
    background: '#fffaf3',
    color: '#a15b55',
    fontSize: 26,
    cursor: 'pointer',
  },
  meta: {
    color: '#796d64',
    fontSize: 14,
    margin: '8px 0',
    lineHeight: 1.5,
  },
  description: {
    color: '#796d64',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 12,
  },
  viewButton: {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    marginTop: 18,
    background: '#30241f',
    color: '#fffaf3',
    border: '1px solid #30241f',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  removeButton: {
    display: 'block',
    width: '100%',
    padding: '11px 14px',
    marginTop: 9,
    background: '#fff',
    color: '#9b4444',
    border: '1px solid #e7caca',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  date: {
    color: '#a1968d',
    fontSize: 12,
    marginTop: 16,
  },
  link: {
    color: '#79583b',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  empty: {
    background: '#fff',
    border: '1px solid #eee4da',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: 620,
    margin: '30px auto',
  },
  heart: {
    fontSize: 48,
    color: '#a17b52',
  },
  emptyLink: {
    display: 'inline-block',
    marginTop: 12,
    color: '#79583b',
    fontWeight: 600,
  },
  message: {
    padding: 48,
    background: '#faf7f3',
    minHeight: '100vh',
    color: '#796d64',
  },
  error: {
    color: '#a22',
    marginBottom: 20,
    padding: 16,
    border: '1px solid #e6b8b8',
    background: '#fff2f2',
    borderRadius: 8,
  },
  retryButton: {
    padding: '8px 14px',
    cursor: 'pointer',
  },
};

