import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../hooks/useCart';
import { toast } from 'react-toastify';
import { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate a stable rating from product name
  const rating = (((product.name.length * 7) % 10) / 10 + 4).toFixed(1);
  const reviews = ((product.name.length * 13) % 200) + 50;

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const fallbackImage = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="product-card card">
      <div className="product-img-wrap">
        {discount > 0 && <span className="discount-tag">{discount}% OFF</span>}
        <span className="cat-tag">{product.category}</span>
        <img
          src={imgError ? fallbackImage : product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-rating">
          <FontAwesomeIcon icon={faStar} className="star" />
          <span className="rating-val">{rating}</span>
          <span className="rating-count">({reviews})</span>
        </div>

        <div className="product-price-row">
          <div className="price-group">
            <span className="current-price">₹{Number(product.price).toFixed(0)}</span>
            {discount > 0 && (
              <span className="original-price">₹{Number(product.originalPrice).toFixed(0)}</span>
            )}
          </div>
          <span className={`stock-indicator ${product.stock > 0 ? 'in' : 'out'}`}>
            {product.stock > 0 ? '● In Stock' : '● Out of Stock'}
          </span>
        </div>

        <button
          className="btn btn-primary add-btn"
          onClick={handleAdd}
          disabled={product.stock <= 0}
          id={`add-to-cart-${product.id}`}
        >
          <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
