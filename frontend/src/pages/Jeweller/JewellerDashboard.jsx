import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const STATUS_OPTIONS = [
  'reviewed',
  'accepted',
  'rejected',
  'in_progress',
  'ready',
  'completed',
];

const STATUS_LABELS = {
  submitted: 'New Request',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  ready: 'Ready',
  completed: 'Completed',
};

function formatStatus(status = 'submitted') {
  return STATUS_LABELS[status] ||
    status.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return 'Not specified';
  return String(value).replaceAll('_', ' ');
}

function JewellerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [filter, setFilter] = useState('all');

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      throw new Error('Please log in to view jeweller requests.');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_URL}/customizations/jeweller/requests`,
        { headers: getHeaders() }
      );

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data.requests || data.customizations || data.data || [];

      if (!Array.isArray(list)) {
        throw new Error('Unexpected response from the requests API.');
      }

      setRequests(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not load customer requests.'
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function updateStatus(requestId, status) {
    setUpdatingId(requestId);
    setError('');

    try {
      const response = await axios.patch(
        `${API_URL}/customizations/${requestId}/status`,
        { status },
        { headers: getHeaders() }
      );

      const updated = response.data?.customization ||
        response.data?.request ||
        response.data?.data;

      setRequests(current =>
        current.map(request =>
          request._id === requestId
            ? {
                ...request,
                ...(updated && typeof updated === 'object' ? updated : {}),
                status,
              }
            : request
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update the request status.'
      );
    } finally {
      setUpdatingId('');
    }
  }

  const filteredRequests = requests.filter(request =>
    filter === 'all' || (request.status || 'submitted') === filter
  );

  const countFor = status =>
    requests.filter(request => (request.status || 'submitted') === status).length;

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f7f5f2',
      padding: '32px 20px',
      color: '#292521',
      fontFamily: 'Arial, sans-serif',
    },
    container: { maxWidth: '1180px', margin: '0 auto' },
    heading: { fontSize: '30px', margin: '0 0 8px' },
    muted: { color: '#716b65', lineHeight: 1.5 },
    button: {
      border: '1px solid #ded7cf',
      borderRadius: '9px',
      padding: '10px 14px',
      background: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
    },
    card: {
      background: '#fff',
      border: '1px solid #e8e2da',
      borderRadius: '14px',
      padding: '20px',
      marginTop: '18px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
      gap: '14px',
      marginTop: '25px',
    },
    stat: {
      background: '#fff',
      border: '1px solid #e8e2da',
      borderRadius: '12px',
      padding: '18px',
    },
    label: {
      display: 'block',
      color: '#716b65',
      fontSize: '13px',
      marginBottom: '7px',
    },
    select: {
      padding: '10px',
      border: '1px solid #ded7cf',
      borderRadius: '8px',
      background: '#fff',
      maxWidth: '100%',
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <p style={{ color: '#947344', fontWeight: 700, letterSpacing: '2px' }}>
              JEWELORA · JEWELLER PORTAL
            </p>
            <h1 style={styles.heading}>Request Dashboard</h1>
            <p style={styles.muted}>
              Review customer designs and manage their jewelry requests.
            </p>
          </div>

          <button
            type="button"
            style={styles.button}
            onClick={loadRequests}
            disabled={loading}
          >
            {loading ? 'Loading...' : '↻ Refresh Requests'}
          </button>
        </header>

        <section style={styles.grid}>
          {[
            ['Total Requests', requests.length],
            ['New Requests', countFor('submitted')],
            ['In Progress', countFor('in_progress')],
            ['Ready', countFor('ready')],
            ['Completed', countFor('completed')],
          ].map(([label, value]) => (
            <div key={label} style={styles.stat}>
              <span style={styles.label}>{label}</span>
              <strong style={{ fontSize: '27px' }}>{value}</strong>
            </div>
          ))}
        </section>

        {error && (
          <div role="alert" style={{
            ...styles.card,
            color: '#a12626',
            borderColor: '#e8baba',
          }}>
            <strong>Notice:</strong> {error}
            <p style={styles.muted}>
              Check that the backend is running and that you are logged in
              with a jeweller account.
            </p>
          </div>
        )}

        <section style={styles.card}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h2 style={{ margin: '0 0 6px' }}>Customer Requests</h2>
              <p style={styles.muted}>
                Only requests assigned to your jeweller account should appear here.
              </p>
            </div>

            <select
              aria-label="Filter requests by status"
              value={filter}
              onChange={event => setFilter(event.target.value)}
              style={styles.select}
            >
              <option value="all">All statuses</option>
              <option value="submitted">New requests</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p style={styles.muted}>Loading customer requests...</p>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 12px' }}>
              <h3>No requests to display</h3>
              <p style={styles.muted}>
                Requests assigned to you will appear here when available.
              </p>
            </div>
          ) : (
            filteredRequests.map(request => {
              const customer = request.user || {};
              const design = request.design || {};
              const price = request.priceEstimate;
              const priceText = price && typeof price === 'object'
                ? price.estimatedPrice ?? price.estimated_price ?? price.price
                : price;

              return (
                <article key={request._id} style={{
                  borderTop: '1px solid #eee7df',
                  padding: '22px 0',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px' }}>
                        {formatValue(request.jewelryType)} Design
                      </h3>
                      <p style={styles.muted}>
                        Request ID: {request._id}
                      </p>
                      <p style={styles.muted}>
                        Customer: {customer.name || 'Customer'} 
                        {customer.email ? ` · ${customer.email}` : ''}
                      </p>
                    </div>

                    <span style={{
                      padding: '7px 11px',
                      borderRadius: '20px',
                      background: '#f3ece0',
                      color: '#765725',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}>
                      {formatStatus(request.status)}
                    </span>
                  </div>

                  {design.imageBase64 && (
                    <img
                      src={design.imageBase64}
                      alt="Customer's saved jewelry design"
                      loading="lazy"
                      style={{
                        width: '160px',
                        height: '160px',
                        objectFit: 'contain',
                        border: '1px solid #eee7df',
                        borderRadius: '10px',
                        margin: '12px 0',
                      }}
                    />
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
                    gap: '14px',
                    marginTop: '14px',
                  }}>
                    {[
                      ['Style', request.style || design.style],
                      ['Material', request.material || design.material],
                      ['Purity', request.purity || design.purity],
                      ['Metal Color', request.metalColor || design.metalColor],
                      ['Size', request.size || design.size],
                      ['Weight', request.estimatedWeight || design.estimatedWeight
                        ? `${request.estimatedWeight || design.estimatedWeight} g`
                        : 'Not specified'],
                      ['Gemstone', request.gemstone || design.gemstone],
                      ['Complexity', request.complexity || design.complexity],
                      ['Budget', request.budget != null
                        ? `₹${request.budget}`
                        : 'Not specified'],
                      ['Estimated Price', priceText != null
                        ? `₹${priceText}`
                        : 'Not available'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span style={styles.label}>{label}</span>
                        <strong>{formatValue(value)}</strong>
                      </div>
                    ))}
                  </div>

                  {request.description && (
                    <div style={{ marginTop: '18px' }}>
                      <span style={styles.label}>Customer Description</span>
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {request.description}
                      </p>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '20px',
                  }}>
                    <label htmlFor={`status-${request._id}`} style={{ fontWeight: 600 }}>
                      Update status:
                    </label>

                    <select
                      id={`status-${request._id}`}
                      value={request.status || 'submitted'}
                      disabled={updatingId === request._id}
                      onChange={event =>
                        updateStatus(request._id, event.target.value)
                      }
                      style={styles.select}
                    >
                      <option value="submitted" disabled>
                        {formatStatus('submitted')}
                      </option>
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>

                    {updatingId === request._id && (
                      <span style={styles.muted}>Saving status...</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

export default JewellerDashboard;