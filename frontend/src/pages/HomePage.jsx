import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck, faCheckCircle, faMedal, faHeadset,
  faThermometerHalf, faWind, faAppleWhole, faCapsules,
  faStar, faStethoscope, faBolt, faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

const CATEGORIES = [
  { key: 'all', label: 'All Products', icon: faBolt, color: '#6366f1' },
  { key: 'fever', label: 'Fever & Pain', icon: faThermometerHalf, color: '#ef4444' },
  { key: 'cold', label: 'Cold & Cough', icon: faWind, color: '#3b82f6' },
  { key: 'stomach', label: 'Digestive', icon: faAppleWhole, color: '#f59e0b' },
  { key: 'vitamins', label: 'Vitamins', icon: faCapsules, color: '#10b981' },
  { key: 'skincare', label: 'Skincare', icon: faStar, color: '#ec4899' },
  { key: 'equipment', label: 'Equipment', icon: faStethoscope, color: '#8b5cf6' },
];

const FEATURES = [
  { icon: faTruck, title: 'Fast Delivery', text: 'Free on orders above ₹299', color: '#6366f1' },
  { icon: faCheckCircle, title: 'Genuine Products', text: '100% authentic medicines', color: '#10b981' },
  { icon: faMedal, title: 'Quality Assured', text: 'All products FDA approved', color: '#f59e0b' },
  { icon: faHeadset, title: '24/7 Support', text: 'Dedicated customer service', color: '#06b6d4' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAPI.getAll(activeCategory);
      setProducts(res.data);
    } catch {
      setError('Could not load products. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitProducts = async () => {
    try {
      setLoading(true);
      await productAPI.init();
      await loadProducts();
    } catch {
      setError('Failed to initialize products.');
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">✦ Trusted Since 2020</span>
            <h1>Your Health,<br /><span className="gradient-text">Our Priority</span></h1>
            <p>
              Genuine medicines & medical equipment delivered right to your door.
              Free delivery on orders above <strong>₹299</strong>.
            </p>
            <div className="hero-cta-group">
              <a href="#products" className="btn btn-primary">Shop Now</a>
              <a href="#categories" className="btn btn-outline">Browse Categories</a>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>50,000+</strong><span>Happy Customers</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>5,000+</strong><span>Products</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>99%</strong><span>Authentic</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-float hero-card-1">💊 Paracetamol 500mg<br /><span>₹20</span></div>
            <div className="hero-pill">🩺</div>
            <div className="hero-card-float hero-card-2">🩸 BP Monitor<br /><span>₹1,299</span></div>
            <div className="hero-card-float hero-card-3">🧴 Vitamin D3<br /><span>₹280</span></div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map(({ icon, title, text, color }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon" style={{ '--icon-color': color }}>
                  <FontAwesomeIcon icon={icon} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Pills ────────────────────────────────── */}
      <section className="categories-section" id="categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find everything you need in one place</p>
          </div>
          <div className="category-cards">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`cat-card ${activeCategory === cat.key ? 'active' : ''}`}
                style={{ '--cat-color': cat.color }}
                onClick={() => setActiveCategory(cat.key)}
              >
                <div className="cat-icon"><FontAwesomeIcon icon={cat.icon} /></div>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Section ──────────────────────────────── */}
      <section className="products-section container" id="products">
        <div className="products-header">
          <div>
            <h2>
              {CATEGORIES.find(c => c.key === activeCategory)?.label}
              {!loading && <span className="product-count">{filtered.length} products</span>}
            </h2>
            <p>Quality healthcare products at affordable prices</p>
          </div>
          {/* Search */}
          <div className="search-box">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
            <input
              id="product-search"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>⚠️ Backend not connected</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleInitProducts}>
              Initialize Sample Products
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Click the button to load sample products into MongoDB Atlas.</p>
            <button className="btn btn-primary" onClick={handleInitProducts}>
              Load Sample Products
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Contact / Footer ──────────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-inner">
            <div className="contact-text">
              <h2>Get in Touch</h2>
              <p>We're here to help with all your healthcare needs</p>
            </div>
            <div className="contact-grid">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Address</strong>
                  <p>123 Health Street, Medical District, Mumbai - 400001</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>support@evonmedicare.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕐</span>
                <div>
                  <strong>Hours</strong>
                  <p>Mon–Sat: 9AM – 8PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 Evon MediCare. All rights reserved. | Made with ❤️ for your health.</p>
        </div>
      </footer>
    </div>
  );
}
