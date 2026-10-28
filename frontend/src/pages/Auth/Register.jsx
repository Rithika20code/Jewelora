import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Register() {
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Handle registration
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'customer',
      });

      if (response.data.success) {
        setSuccess('Account created successfully! Redirecting to login...');

        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to create your account. Please try again.';

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

            <div className="logo">
              Jewelora
            </div>

            <p className="eyebrow">
              CREATE YOUR JEWELRY STORY
            </p>

            <h1>
              Your imagination.
              <br />
              <span>Your jewelry.</span>
            </h1>

            <p>
              Create your Jewelora account and start exploring
              personalized jewelry designs created around your
              unique preferences.
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
                GET STARTED
              </p>

              <h2>
                Create your account
              </h2>

              <p>
                Join Jewelora and begin designing jewelry that
                is uniquely yours.
              </p>

            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-message auth-error">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="auth-message auth-success">
                {success}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login">
                Sign in
              </Link>
            </p>

            <p className="auth-note">
              By creating an account, you agree to Jewelora's
              terms and privacy policy.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;