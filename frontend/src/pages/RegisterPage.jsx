import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faLock,
  faEye, faEyeSlash, faHeart
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-panel-left">
        <div className="auth-panel-content">
          <div className="auth-brand">
            <FontAwesomeIcon icon={faHeart} />
            <span>Evon MediCare</span>
          </div>
          <h2>Join our health community</h2>
          <p>Create your free account and start shopping genuine healthcare products today.</p>
          <div className="auth-features">
            <div className="auth-feature">🎁 Welcome discount on first order</div>
            <div className="auth-feature">📦 Track your orders easily</div>
            <div className="auth-feature">💊 Prescription uploads</div>
            <div className="auth-feature">🔔 Health alerts & reminders</div>
          </div>
        </div>
        <div className="auth-panel-bg" />
      </div>

      {/* Right Panel */}
      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Start your healthcare journey with us</p>
          </div>

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input id="reg-name" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email address</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone">Phone <span style={{fontWeight: 400, color: 'var(--text-subtle)'}}>(optional)</span></label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
                <input id="reg-phone" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-with-icon">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="password-strength">
                  <div className={`strength-bar ${form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak'}`} />
                  <span>{form.password.length >= 8 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}</span>
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><div className="btn-spinner" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-footer">
            Already have an account? <Link to="/login" id="go-to-login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
