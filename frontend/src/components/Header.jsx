import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart, faUser, faSignOutAlt, faCog,
  faSun, faMoon, faBars, faTimes, faHeart
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useState, useEffect } from 'react';
import CartDrawer from './CartDrawer';
import './Header.css';

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner container">
          <Link to="/" className="logo">
            <FontAwesomeIcon icon={faHeart} className="logo-icon" />
            <span>Evon <strong>MediCare</strong></span>
          </Link>

          <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <a href="/#products" className="nav-link">Products</a>
            <a href="/#categories" className="nav-link">Categories</a>
            <a href="/#contact" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            {/* Dark mode toggle */}
            <button
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme-toggle-btn"
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
            </button>

            {/* Cart button */}
            <button className="icon-btn cart-btn" onClick={() => setCartOpen(true)} id="cart-open-btn">
              <FontAwesomeIcon icon={faShoppingCart} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            {/* Auth actions */}
            {user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item" id="admin-link">
                      <FontAwesomeIcon icon={faCog} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item danger" id="logout-btn">
                    <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-ghost btn-sm" id="login-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-link">
                  <FontAwesomeIcon icon={faUser} /> Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-btn"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
      </header>

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  );
}
