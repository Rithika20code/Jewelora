
import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://jewelora-backend-rithika.vercel.app/api';

function getImageSource(design) {
  const source = design?.imageUrl || design?.imageBase64;

  if (typeof source !== 'string' || !source.trim()) return '';

  const value = source.trim();

  if (value.startsWith('data:image/')) return value;
  if (/^https?:\/\//i.test(value) || value.startsWith('blob:')) {
    return value;
  }

  return `data:image/png;base64,${value}`;
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') {
    return '—';
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) return '—';

  return `₹${number.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

function getAuthConfig() {
  const token = localStorage.getItem('jeweloraToken');

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function DesignResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const designId = searchParams.get('id');
  const routeDesign = location.state?.design;

  const [loadedDesign, setLoadedDesign] = useState(null);
  const [loadingSavedDesign, setLoadingSavedDesign] = useState(
    Boolean(designId)
  );
  const [designLoadError, setDesignLoadError] = useState('');

  const design = designId
    ? (
        routeDesign?._id &&
        String(routeDesign._id) === designId
          ? routeDesign
          : loadedDesign
      )
    : routeDesign || loadedDesign;

  const price =
    location.state?.priceEstimate ??
    design?.priceEstimate ??
    null;

  const [imageFailed, setImageFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const [savedDesign, setSavedDesign] = useState(
    location.state?.savedDesign || null
  );

  const [isFavorite, setIsFavorite] = useState(
    Boolean(location.state?.savedDesign?.isFavorite)
  );

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Customization request state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [availableJewellers, setAvailableJewellers] = useState([]);
  const [selectedJeweller, setSelectedJeweller] = useState('');
  const [loadingJewellers, setLoadingJewellers] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Load an existing saved design when opened using its ID.
  // This does not generate a new image or call the AI service.
  useEffect(() => {
    if (!designId) {
      setLoadingSavedDesign(false);
      return undefined;
    }

    if (
      routeDesign?._id &&
      String(routeDesign._id) === designId
    ) {
      const saved = location.state?.savedDesign || routeDesign;

      setLoadedDesign(routeDesign);
      setSavedDesign(saved);
      setIsFavorite(Boolean(saved.isFavorite));
      setDesignLoadError('');
      setLoadingSavedDesign(false);

      return undefined;
    }

    let cancelled = false;

    async function loadSavedDesign() {
      try {
        setLoadingSavedDesign(true);
        setDesignLoadError('');

        const token = localStorage.getItem('jeweloraToken');

        if (!token) {
          throw new Error(
            'Please log in again to view your saved design.'
          );
        }

        const response = await axios.get(
          `${API_URL}/designs`,
          getAuthConfig()
        );

        const designs = Array.isArray(response.data?.designs)
          ? response.data.designs
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const found = designs.find(
          (item) => String(item._id) === designId
        );

        if (!found) {
          throw new Error(
            'This saved design could not be found in your collection.'
          );
        }

        if (!cancelled) {
          setLoadedDesign(found);
          setSavedDesign(found);
          setIsFavorite(Boolean(found.isFavorite));
        }
      } catch (err) {
        if (!cancelled) {
          setDesignLoadError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load this saved design. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedDesign(false);
        }
      }
    }

    loadSavedDesign();

    return () => {
      cancelled = true;
    };
  }, [designId, routeDesign, location.state]);

  // Show a loading screen while retrieving a saved design.
  if (designId && loadingSavedDesign && !design) {
    return (
      <main className="jr-page">
        <section className="jr-empty">
          <span className="jr-kicker">
            JEWELORA · YOUR COLLECTION
          </span>
          <h1>Opening your saved design...</h1>
          <p>
            Loading the original image, specifications and price estimate.
          </p>
        </section>
      </main>
    );
  }

  // Show a helpful message if the saved design could not be retrieved.
  if (designId && !loadingSavedDesign && !design) {
    return (
      <main className="jr-page">
        <section className="jr-empty">
          <span className="jr-kicker">
            JEWELORA · YOUR COLLECTION
          </span>
          <h1>Unable to open this design.</h1>
          <p>
            {designLoadError ||
              'The saved design is unavailable. Please return to your collection.'}
          </p>
          <button
            type="button"
            className="jr-primary"
            onClick={() => navigate('/my-designs')}
          >
            Back to My Designs
          </button>
        </section>
      </main>
    );
  }

  // This is shown when the customer opens the page without a design.
  if (!design) {
    return (
      <main className="jr-page">
        <section className="jr-empty">
          <span className="jr-kicker">
            JEWELORA · DESIGN STUDIO
          </span>
          <h1>Your next creation starts here.</h1>
          <p>
            Create a design to see its generated image and price estimate.
          </p>
          <button
            type="button"
            className="jr-primary"
            onClick={() => navigate('/design-studio')}
          >
            Create a design ↗
          </button>
        </section>
      </main>
    );
  }

  const imageSrc = getImageSource(design);
  const budget = price?.budget;
  const status = budget?.status;

  const budgetLabel =
    status === 'above_budget'
      ? 'Above budget'
      : status === 'below_budget'
        ? 'Below budget'
        : status === 'within_budget'
          ? 'Within budget'
          : 'Not available';

  const specifications = [
    ['Jewelry type', design.jewelryType],
    ['Style', design.style],
    ['Material', design.material],
    ['Purity', design.purity],
    ['Metal color', design.metalColor],
    ['Size / dimensions', design.size],
    ['Gemstone', design.gemstone || 'None'],
    ['Gemstone carat', `${design.carat || 0} ct`],
    ['Estimated weight', `${design.estimatedWeight ?? '—'} g`],
    ['Complexity', design.complexity],
  ];

  // Save the existing generated design without generating another image.
  // If it is already saved, return that record.
  async function saveDesignIfNeeded() {
    setError('');
    setMessage('');

    if (savedDesign?._id) {
      return savedDesign;
    }

    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      setError(
        'Please log in before saving your design or requesting customization.'
      );
      return null;
    }

    if (!imageSrc) {
      setError(
        'The design image is missing. Please generate the design again.'
      );
      return null;
    }

    const payload = {
      jewelryType: design.jewelryType,
      size: design.size,
      style: design.style,
      material: design.material,
      purity: design.purity,
      metalColor: design.metalColor,
      gemstone: design.gemstone || '',
      carat: Number(design.carat) || 0,
      estimatedWeight: Number(design.estimatedWeight),
      complexity: design.complexity,
      budget: Number(design.budget ?? budget?.amount),
      description: design.description || '',
      imageBase64: imageSrc,
      priceEstimate: price || null,
    };

    if (
      !payload.jewelryType ||
      !payload.size ||
      !payload.style ||
      !payload.material ||
      !payload.purity ||
      !payload.metalColor ||
      !payload.complexity ||
      !Number.isFinite(payload.estimatedWeight) ||
      !Number.isFinite(payload.budget)
    ) {
      setError(
        'Some required design details are missing. Please return to Design Studio and generate the design again.'
      );
      return null;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        `${API_URL}/designs/generate`,
        payload,
        getAuthConfig()
      );

      const saved = response.data?.design;

      if (!saved?._id) {
        setError('The server did not return a saved design ID.');
        return null;
      }

      setSavedDesign(saved);
      setLoadedDesign(saved);
      setIsFavorite(Boolean(saved.isFavorite));

      return saved;
    } catch (err) {
      console.error('Save design error:', err);

      setError(
        err.response?.data?.message ||
          'Could not save the design. Check your login and backend connection.'
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDesign() {
    setError('');
    setMessage('');

    if (savedDesign?._id) {
      setMessage('This design is already saved to My Designs.');
      return;
    }

    const saved = await saveDesignIfNeeded();

    if (saved?._id) {
      setMessage(
        'Design saved successfully! You can now add it to Favorites.'
      );
    }
  }

  async function handleFavorite() {
    setError('');
    setMessage('');

    if (!savedDesign?._id) {
      setError(
        'Please click Save Design before adding this design to Favorites.'
      );
      return;
    }

    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      setError('Please log in before managing favorites.');
      return;
    }

    try {
      setFavoriting(true);

      const response = await axios.patch(
        `${API_URL}/designs/${savedDesign._id}/favorite`,
        {},
        getAuthConfig()
      );

      const updated = response.data?.design;

      if (updated) {
        setSavedDesign(updated);
        setLoadedDesign(updated);
        setIsFavorite(Boolean(updated.isFavorite));

        setMessage(
          updated.isFavorite
            ? 'Added to Favorites successfully!'
            : 'Removed from Favorites.'
        );
      }
    } catch (err) {
      console.error('Favorite error:', err);

      setError(
        err.response?.data?.message ||
          'Could not update Favorites. Please check the backend.'
      );
    } finally {
      setFavoriting(false);
    }
  }

  // This action is optional. It only opens the request flow.
  // It does not submit a request automatically.
  async function handleOpenRequest() {
    setError('');
    setMessage('');

    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      setError(
        'Please log in as a customer before requesting customization.'
      );
      return;
    }

    // Save the design if it has not already been saved.
    const saved = await saveDesignIfNeeded();

    if (!saved?._id) {
      return;
    }

    try {
      setLoadingJewellers(true);

      const response = await axios.get(
        `${API_URL}/customizations/jewellers`,
        getAuthConfig()
      );

      const jewellers = Array.isArray(response.data?.jewellers)
        ? response.data.jewellers
        : Array.isArray(response.data)
          ? response.data
          : [];

      if (jewellers.length === 0) {
        setError(
          'No jewellers are currently available. Please try again after a jeweller account has been registered or provisioned.'
        );
        return;
      }

      setAvailableJewellers(jewellers);
      setSelectedJeweller(jewellers[0]._id);
      setRequestModalOpen(true);
    } catch (err) {
      console.error('Load jewellers error:', err);

      setError(
        err.response?.data?.message ||
          'Could not load available jewellers. Check the backend and your customer login.'
      );
    } finally {
      setLoadingJewellers(false);
    }
  }

  // A request is created only after the customer confirms submission.
  async function handleSubmitRequest() {
    setError('');
    setMessage('');

    if (!localStorage.getItem('jeweloraToken')) {
      setError('Your session may have expired. Please log in again.');
      return;
    }

    if (!selectedJeweller) {
      setError('Please select a jeweller.');
      return;
    }

    if (!savedDesign?._id) {
      setError('Please save your design before submitting a request.');
      return;
    }

    const estimatedWeight = Number(design.estimatedWeight);
    const budgetAmount = Number(design.budget ?? budget?.amount);

    if (
      !Number.isFinite(estimatedWeight) ||
      !Number.isFinite(budgetAmount)
    ) {
      setError(
        'The estimated weight or budget is invalid. Please check your design details.'
      );
      return;
    }

    let customizationId = null;

    try {
      setSubmittingRequest(true);

      // Step 1: Create a customization request.
      const createResponse = await axios.post(
        `${API_URL}/customizations`,
        {
          jewelryType: design.jewelryType,
          size: design.size,
          style: design.style,
          material: design.material,
          purity: design.purity,
          metalColor: design.metalColor,
          estimatedWeight,
          complexity: design.complexity,
          gemstone: design.gemstone || '',
          carat: Number(design.carat) || 0,
          budget: budgetAmount,
          description: design.description || '',
        },
        getAuthConfig()
      );

      const customization =
        createResponse.data?.customization ||
        createResponse.data?.request ||
        createResponse.data;

      customizationId = customization?._id;

      if (!customizationId) {
        throw new Error(
          'The server did not return the customization request ID.'
        );
      }

      // Step 2: Attach the already-saved design and its price estimate.
      await axios.patch(
        `${API_URL}/customizations/${customizationId}/design`,
        {
          designId: savedDesign._id,
          priceEstimate: price || null,
        },
        getAuthConfig()
      );

      // Step 3: Assign the request to the selected jeweller.
      await axios.patch(
        `${API_URL}/customizations/${customizationId}/assign`,
        {
          jewellerId: selectedJeweller,
        },
        getAuthConfig()
      );

      setRequestModalOpen(false);
      setMessage(
        'Customization request submitted successfully! The selected jeweller can now review your request in their dashboard.'
      );
    } catch (err) {
      console.error('Submit customization request error:', err);

      const serverMessage = err.response?.data?.message;

      if (customizationId) {
        setError(
          serverMessage ||
            'The request was created, but attaching the design or assigning the jeweller failed. Check your requests before retrying to avoid creating a duplicate.'
        );
      } else {
        setError(
          serverMessage ||
            err.message ||
            'Could not submit your customization request. Please check the backend and try again.'
        );
      }
    } finally {
      setSubmittingRequest(false);
    }
  }

  return (
    <main className="jr-page">
      <div className="jr-container">
        <nav className="jr-topbar">
          <button
            type="button"
            className="jr-back"
            onClick={() => navigate('/design-studio')}
          >
            ← Create another
          </button>

          <span className="jr-brand">
            JEWELORA<span>✦</span>
          </span>

          <button
            type="button"
            className="jr-dashboard-link"
            onClick={() => navigate('/customer/dashboard')}
          >
            Dashboard ↗
          </button>
        </nav>

        <header className="jr-hero">
          <span className="jr-kicker">YOUR PERSONALIZED CREATION</span>
          <h1>
            An idea, made <em>yours.</em>
          </h1>
          <p>
            Your AI-generated jewelry concept and approximate price estimate,
            brought together in one place.
          </p>
        </header>

        <section className="jr-main-grid">
          <article className="jr-image-panel">
            <div className="jr-image-toolbar">
              <div>
                <span className="jr-live-dot" />
                <span>YOUR DESIGN CONCEPT</span>
              </div>
              <span className="jr-pill">AI · 2D</span>
            </div>

            <div className="jr-image-stage">
              {imageSrc && !imageFailed ? (
                <img
                  className="jr-design-image"
                  src={imageSrc}
                  alt={`AI-generated ${design.jewelryType || 'jewelry'} concept`}
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="jr-image-fallback">
                  <span className="jr-fallback-symbol">✦</span>
                  <h3>Design image unavailable</h3>
                  <p>
                    The design details and price are available, but the image
                    could not be displayed.
                  </p>
                  <button
                    type="button"
                    className="jr-secondary"
                    onClick={() => navigate('/design-studio')}
                  >
                    Try generating again
                  </button>
                </div>
              )}
            </div>

            <div className="jr-image-footer">
              <div>
                <span className="jr-footer-label">DESIGNED AROUND YOU</span>
                <p>
                  {design.style || 'Custom'} {design.jewelryType || 'Jewelry'}
                </p>
              </div>
              <span className="jr-footer-star">✧</span>
            </div>
          </article>

          <aside className="jr-price-panel">
            <span className="jr-kicker">YOUR PRICE ESTIMATE</span>
            <h2 className="jr-total">{formatCurrency(price?.total)}</h2>
            <p className="jr-price-note">
              Approximate total for your customized design.
            </p>

            <div className="jr-budget-card">
              <div className="jr-budget-top">
                <span>Your budget</span>
                <strong>
                  {formatCurrency(budget?.amount ?? design.budget)}
                </strong>
              </div>

              <div className="jr-budget-bottom">
                <span>Budget comparison</span>
                <strong
                  className={
                    status === 'above_budget'
                      ? 'jr-status-high'
                      : status === 'below_budget'
                        ? 'jr-status-low'
                        : 'jr-status-normal'
                  }
                >
                  {budgetLabel}
                </strong>
              </div>

              {budget && (
                <p>
                  {status === 'above_budget'
                    ? `${formatCurrency(budget.difference)} over budget`
                    : status === 'below_budget'
                      ? `${formatCurrency(budget.difference)} under budget`
                      : status === 'within_budget'
                        ? 'The estimate matches your budget.'
                        : 'Budget comparison unavailable.'}
                </p>
              )}
            </div>

            <div className="jr-breakdown">
              <h3>Price breakdown</h3>

              <div className="jr-price-row">
                <span>
                  {price?.metal?.material || design.material || 'Metal'}{' '}
                  {price?.metal?.purity || design.purity || ''}
                </span>
                <strong>{formatCurrency(price?.metal?.cost)}</strong>
              </div>

              <div className="jr-price-row">
                <span>
                  {price?.gemstone?.type || design.gemstone || 'Gemstone'}
                  {Number(price?.gemstone?.carat) > 0
                    ? ` · ${price.gemstone.carat} ct`
                    : ''}
                </span>
                <strong>{formatCurrency(price?.gemstone?.cost)}</strong>
              </div>

              <div className="jr-price-row">
                <span>
                  Making charges
                  {price?.makingCharges?.percentage != null
                    ? ` (${price.makingCharges.percentage}%)`
                    : ''}
                </span>
                <strong>
                  {formatCurrency(price?.makingCharges?.cost)}
                </strong>
              </div>

              <div className="jr-price-row">
                <span>
                  GST
                  {price?.gst?.percentage != null
                    ? ` (${price.gst.percentage}%)`
                    : ''}
                </span>
                <strong>{formatCurrency(price?.gst?.cost)}</strong>
              </div>

              <div className="jr-price-separator" />

              <div className="jr-price-row jr-subtotal">
                <span>Subtotal</span>
                <strong>{formatCurrency(price?.subtotal)}</strong>
              </div>

              <div className="jr-price-row jr-grand-total">
                <span>Estimated total</span>
                <strong>{formatCurrency(price?.total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="jr-primary jr-full-button"
              onClick={handleSaveDesign}
              disabled={saving || Boolean(savedDesign?._id)}
            >
              {saving
                ? 'Saving design...'
                : savedDesign?._id
                  ? '✓ Design Saved'
                  : 'Save Design ♡'}
            </button>

            <button
              type="button"
              className="jr-secondary jr-full-button"
              onClick={handleFavorite}
              disabled={favoriting || !savedDesign?._id}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {favoriting
                ? 'Updating Favorites...'
                : isFavorite
                  ? '♥ Favorited'
                  : '♡ Add to Favorites'}
            </button>

            <button
              type="button"
              className="jr-secondary jr-full-button"
              onClick={() => navigate('/my-designs')}
              style={{ width: '100%', marginTop: '12px' }}
            >
              View My Designs →
            </button>

            <button
              type="button"
              className="jr-secondary jr-full-button"
              onClick={() => navigate('/favorites')}
              style={{ width: '100%', marginTop: '12px' }}
            >
              View Favorites →
            </button>

            {/* Optional: the customer chooses whether to request assistance. */}
            <button
              type="button"
              className="jr-primary jr-full-button"
              onClick={handleOpenRequest}
              disabled={saving || loadingJewellers || submittingRequest}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {saving
                ? 'Saving design...'
                : loadingJewellers
                  ? 'Loading jewellers...'
                  : 'Request Jeweller Assistance ↗'}
            </button>

            {message && (
              <p
                role="status"
                style={{ color: '#28734b', marginTop: '14px' }}
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                style={{ color: '#b42318', marginTop: '14px' }}
              >
                {error}
              </p>
            )}

            <p className="jr-price-disclaimer">
              Planning estimate only. Actual prices depend on market rates,
              gemstone quality, craftsmanship and jeweller.
            </p>
          </aside>
        </section>

        <section className="jr-spec-panel">
          <div className="jr-section-heading">
            <div>
              <span className="jr-kicker">THE DETAILS</span>
              <h2>Your design, your choices.</h2>
            </div>
            <span className="jr-detail-count">
              {specifications.length} specifications
            </span>
          </div>

          <div className="jr-spec-grid">
            {specifications.map(([label, value]) => (
              <div className="jr-spec-item" key={label}>
                <span>{label}</span>
                <strong>{value || '—'}</strong>
              </div>
            ))}
          </div>

          {design.description && (
            <div className="jr-description">
              <span className="jr-kicker">YOUR ORIGINAL VISION</span>
              <p>{design.description}</p>
            </div>
          )}
        </section>

        <section className="jr-note">
          <span className="jr-note-icon">✧</span>
          <div>
            <h3>A concept to inspire your next creation.</h3>
            <p>
              This is an AI-generated 2D concept, not a manufacturing-ready CAD
              design or a final jeweller quotation. Price figures are estimates
              and may vary with actual materials, workmanship, taxes and
              gemstone specifications.
            </p>
          </div>
        </section>

        <footer className="jr-footer">
          <span>JEWELORA</span>
          <span>Thoughtfully designed. Uniquely yours.</span>
        </footer>
      </div>

      {/* Jeweller selection modal */}
      {requestModalOpen && (
        <div
          role="presentation"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !submittingRequest
            ) {
              setRequestModalOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(20, 17, 15, 0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="jr-request-title"
            style={{
              background: '#fffdf9',
              color: '#28231f',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 70px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <span className="jr-kicker">YOUR NEXT STEP</span>
                <h2
                  id="jr-request-title"
                  style={{ margin: '8px 0', fontSize: '26px' }}
                >
                  Request customization
                </h2>
                <p style={{ lineHeight: 1.6, marginTop: '8px' }}>
                  Select a jeweller to review your saved design and
                  customization details.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close request dialog"
                onClick={() => setRequestModalOpen(false)}
                disabled={submittingRequest}
                style={{
                  border: 0,
                  background: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                border: '1px solid #e9e1d6',
                borderRadius: '12px',
                padding: '16px',
                margin: '20px 0',
                background: '#faf6ef',
              }}
            >
              <strong>
                {design.style || 'Custom'} {design.jewelryType || 'Jewelry'}
              </strong>
              <p style={{ margin: '8px 0 0', color: '#6c6258' }}>
                Estimated price: {formatCurrency(price?.total)}
              </p>
              <p style={{ margin: '4px 0 0', color: '#6c6258' }}>
                Budget: {formatCurrency(budget?.amount ?? design.budget)}
              </p>
            </div>

            <label
              htmlFor="jr-jeweller-select"
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Choose a jeweller
            </label>

            <select
              id="jr-jeweller-select"
              value={selectedJeweller}
              onChange={(event) => setSelectedJeweller(event.target.value)}
              disabled={submittingRequest}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px',
                borderRadius: '9px',
                border: '1px solid #d8cec1',
                background: '#fff',
                color: '#28231f',
                fontSize: '15px',
                marginBottom: '20px',
              }}
            >
              {availableJewellers.map((jeweller) => (
                <option key={jeweller._id} value={jeweller._id}>
                  {jeweller.name || jeweller.email || 'Jeweller'}
                  {jeweller.email && jeweller.name
                    ? ` · ${jeweller.email}`
                    : ''}
                </option>
              ))}
            </select>

            {error && (
              <p
                role="alert"
                style={{
                  color: '#b42318',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <button
                type="button"
                className="jr-primary"
                onClick={handleSubmitRequest}
                disabled={
                  submittingRequest ||
                  !selectedJeweller ||
                  availableJewellers.length === 0
                }
                style={{ flex: '1 1 220px' }}
              >
                {submittingRequest
                  ? 'Submitting request...'
                  : 'Send Customization Request →'}
              </button>

              <button
                type="button"
                className="jr-secondary"
                onClick={() => setRequestModalOpen(false)}
                disabled={submittingRequest}
                style={{ flex: '0 1 auto' }}
              >
                Cancel
              </button>
            </div>

            <p
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#756b61',
                marginTop: '18px',
              }}
            >
              Your AI-generated design is a concept. The jeweller can review
              your specifications and discuss the final design and quotation.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default DesignResult;
