
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://jewelora-backend-rithika.vercel.app/api';

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

function MyDesigns() {
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const getAuthConfig = () => {
    const token = localStorage.getItem('jeweloraToken');

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/designs`,
        getAuthConfig()
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
          'Unable to load your designs. Please log in again if your session has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Open the existing saved record. Do not generate a new AI image.
  const openDesign = (design) => {
    navigate(`/design-result?id=${design._id}`, {
      state: {
        design,
        savedDesign: design,
        priceEstimate: design.priceEstimate || null,
      },
    });
  };

  const handleFavorite = async (id) => {
    try {
      setBusyId(id);

      const response = await axios.patch(
        `${API_URL}/designs/${id}/favorite`,
        {},
        getAuthConfig()
      );

      const updated = response.data?.design;

      if (updated) {
        setDesigns((current) =>
          current.map((design) =>
            design._id === id ? updated : design
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Unable to update favorite. Please try again.'
      );
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this jewelry design permanently?')) {
      return;
    }

    try {
      setBusyId(id);

      await axios.delete(
        `${API_URL}/designs/${id}`,
        getAuthConfig()
      );

      setDesigns((current) =>
        current.filter((design) => design._id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Unable to delete this design.'
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/customer/dashboard" style={styles.backLink}>
          ← Dashboard
        </Link>

        <Link to="/favorites" style={styles.navLink}>
          ♥ Favorites
        </Link>
      </nav>

      <header style={styles.header}>
        <p style={styles.eyebrow}>YOUR PERSONAL COLLECTION</p>
        <h1 style={styles.title}>My Designs</h1>
        <p style={styles.subtitle}>
          Every idea, imagined and created just for you.
        </p>

        <Link to="/design-studio" style={styles.createButton}>
          + Create New Design
        </Link>
      </header>

      {loading && (
        <p style={styles.status}>
          Loading your jewelry collection...
        </p>
      )}

      {error && (
        <div role="alert" style={styles.error}>
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchDesigns}
            style={styles.retryButton}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && designs.length === 0 && (
        <section style={styles.empty}>
          <div style={styles.emptyIcon}>◇</div>
          <h2>Your collection is waiting</h2>
          <p>
            Your saved jewelry concepts will appear here after you
            generate and save your first design.
          </p>
          <Link to="/design-studio" style={styles.createButton}>
            Create Your First Design
          </Link>
        </section>
      )}

      {!loading && !error && designs.length > 0 && (
        <>
          <p style={styles.count}>
            {designs.length} saved{' '}
            {designs.length === 1 ? 'design' : 'designs'}
          </p>

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
                        Jewelry preview unavailable
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleFavorite(design._id)}
                      disabled={busyId === design._id}
                      aria-label={
                        design.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                      title={
                        design.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                      style={{
                        ...styles.heartButton,
                        color: design.isFavorite
                          ? '#a14c4c'
                          : '#6b5748',
                      }}
                    >
                      {design.isFavorite ? '♥' : '♡'}
                    </button>

                    {design.isFavorite && (
                      <span style={styles.favoriteTag}>
                        FAVORITE
                      </span>
                    )}
                  </div>

                  <div style={styles.details}>
                    <p style={styles.cardEyebrow}>
                      {design.material || 'Material not specified'}
                      {' · '}
                      {design.purity || 'Purity not specified'}
                    </p>

                    <h2 style={styles.cardTitle}>
                      {design.style || 'Custom'}{' '}
                      {design.jewelryType || 'Jewelry'}
                    </h2>

                    <div style={styles.specs}>
                      <p>
                        <span>Metal color</span>
                        <strong>{design.metalColor || '—'}</strong>
                      </p>

                      <p>
                        <span>Estimated weight</span>
                        <strong>
                          {design.estimatedWeight ?? '—'} g
                        </strong>
                      </p>

                      {design.gemstone && (
                        <p>
                          <span>Gemstone</span>
                          <strong>{design.gemstone}</strong>
                        </p>
                      )}

                      <p>
                        <span>Budget</span>
                        <strong>
                          ₹
                          {Number(design.budget || 0).toLocaleString(
                            'en-IN'
                          )}
                        </strong>
                      </p>
                    </div>

                    {design.description && (
                      <p style={styles.description}>
                        {design.description}
                      </p>
                    )}

                    <div style={styles.actions}>
                      <button
                        type="button"
                        onClick={() => openDesign(design)}
                        style={styles.viewButton}
                      >
                        View Design →
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFavorite(design._id)}
                        disabled={busyId === design._id}
                        style={styles.favoriteButton}
                      >
                        {busyId === design._id
                          ? 'Please wait...'
                          : design.isFavorite
                            ? '♥ Favorited'
                            : '♡ Add to Favorites'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(design._id)}
                        disabled={busyId === design._id}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>

                    <p style={styles.date}>
                      {design.createdAt
                        ? `Created ${new Date(
                            design.createdAt
                          ).toLocaleDateString('en-IN')}`
                        : 'Saved design'}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '28px clamp(18px, 5vw, 64px) 64px',
    background: '#faf7f2',
    color: '#33271f',
    fontFamily: 'Arial, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  backLink: {
    color: '#6c5949',
    textDecoration: 'none',
    fontSize: 14,
  },
  navLink: {
    color: '#8a6445',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  header: {
    padding: '50px 0 30px',
    borderBottom: '1px solid #e9ded2',
    marginBottom: 28,
  },
  eyebrow: {
    color: '#a17b52',
    letterSpacing: 3,
    fontSize: 11,
    fontWeight: 700,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 'clamp(38px, 6vw, 60px)',
    fontWeight: 400,
    margin: '12px 0',
  },
  subtitle: {
    color: '#7d7065',
    lineHeight: 1.7,
    marginBottom: 24,
  },
  createButton: {
    display: 'inline-block',
    background: '#33271f',
    color: '#fffaf3',
    textDecoration: 'none',
    padding: '13px 20px',
    borderRadius: 5,
    fontSize: 14,
    border: 'none',
  },
  status: {
    padding: '30px 0',
    color: '#796d64',
  },
  error: {
    padding: 18,
    border: '1px solid #e6b8b8',
    background: '#fff2f2',
    color: '#8b2929',
    borderRadius: 8,
  },
  retryButton: {
    display: 'block',
    marginTop: 12,
    padding: '8px 14px',
    cursor: 'pointer',
  },
  count: {
    color: '#817367',
    fontSize: 13,
    marginBottom: 20,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
    gap: 24,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    border: '1px solid #e9ded2',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(58, 41, 26, 0.05)',
  },
  imageWrapper: {
    height: 260,
    background: '#f1eae1',
    position: 'relative',
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
    color: '#817367',
    fontSize: 13,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#fffaf3',
    border: '1px solid #e9ded2',
    fontSize: 27,
    cursor: 'pointer',
  },
  favoriteTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    background: '#fffaf3',
    color: '#8c5e3d',
    fontSize: 10,
    letterSpacing: 1.5,
    padding: '7px 10px',
    borderRadius: 3,
  },
  details: {
    padding: 19,
  },
  cardEyebrow: {
    color: '#a17b52',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  cardTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 23,
    fontWeight: 400,
    textTransform: 'capitalize',
    margin: '8px 0 18px',
  },
  specs: {
    borderTop: '1px solid #eee5dc',
    paddingTop: 10,
  },
  description: {
    color: '#796d64',
    fontSize: 13,
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
    marginTop: 18,
  },
  viewButton: {
    width: '100%',
    padding: '12px 14px',
    background: '#33271f',
    color: '#fffaf3',
    border: '1px solid #33271f',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 14,
  },
  favoriteButton: {
    width: '100%',
    padding: '11px 12px',
    background: '#f5eee5',
    color: '#664c36',
    border: '1px solid #e6d8c8',
    borderRadius: 5,
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '11px 14px',
    background: '#fff',
    color: '#9b4444',
    border: '1px solid #e7caca',
    borderRadius: 5,
    cursor: 'pointer',
  },
  date: {
    marginTop: 18,
    color: '#a1968d',
    fontSize: 11,
  },
  empty: {
    background: '#fff',
    border: '1px solid #e9ded2',
    borderRadius: 10,
    textAlign: 'center',
    padding: '55px 22px',
    maxWidth: 620,
    margin: '20px auto',
  },
  emptyIcon: {
    fontFamily: 'Georgia, serif',
    fontSize: 56,
    color: '#a17b52',
  },
};

export default MyDesigns;
