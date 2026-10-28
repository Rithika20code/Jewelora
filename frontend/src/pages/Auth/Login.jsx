import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Store authentication information
        localStorage.setItem('jeweloraToken', token);
        localStorage.setItem('jeweloraUser', JSON.stringify(user));

        // Redirect based on user role
        if (user.role === 'jeweller') {
          navigate('/jeweller/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to sign in. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Left Side */}
        <div className="auth-brand">
          <div className="auth-brand-content">

            <div className="logo">Jewelora</div>

            <p className="eyebrow">
              AI-POWERED JEWELRY DESIGN
            </p>

            <h1>
              Welcome back to
              <br />
              <span>your jewelry journey.</span>
            </h1>

            <p>
              Sign in to continue creating personalized jewelry designs,
              manage your saved creations and connect with jewellers.
            </p>

          </div>
        </div>

        {/* Right Side */}
        <div className="auth-form-section">
          <div className="auth-form-card">

            <Link to="/" className="back-link">
              ← Back to Jewelora
            </Link>

            <div className="auth-heading">

              <p className="eyebrow">
                WELCOME BACK
              </p>

              <h2>
                Sign in to Jewelora
              </h2>

              <p>
                Enter your details to access your account.
              </p>

            </div>

            {/* Login Error */}
            {error && (
              <div className="auth-message auth-error">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-options">

                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {
                    setError(
                      'Forgot password functionality will be added later.'
                    );
                  }}
                >
                  Forgot password?
                </button>

              </div>

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-switch">
              Don't have an account?{' '}

              <Link to="/register">
                Create an account
              </Link>
            </p>

            <p className="auth-note">
              By continuing, you agree to Jewelora's terms and
              privacy policy.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;