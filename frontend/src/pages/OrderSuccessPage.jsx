import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(orderId)
      .then(res => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const fmt = (n) => `₹${Number(n).toFixed(2)}`;

  if (loading) return (
    <div className="loading-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="success-page">
      <div className="success-card card">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p className="order-id-label">Order ID: <strong>{orderId}</strong></p>

        {order && (
          <div className="order-details">
            <div className="detail-section">
              <h3>Delivery To</h3>
              <p>{order.customerName}</p>
              <p>{order.customerAddress}, {order.customerCity}</p>
              <p>{order.customerState} - {order.customerPincode}</p>
              <p>📞 {order.customerPhone}</p>
            </div>

            <div className="detail-section">
              <h3>Order Summary</h3>
              {order.items?.map((item, i) => (
                <div key={i} className="order-item-row">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{fmt(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="order-total">
                <span>Total Paid</span>
                <strong>{fmt(order.total)}</strong>
              </div>
            </div>

            <div className="status-row">
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                💳 {order.paymentStatus?.toUpperCase()}
              </span>
              <span className="badge badge-warning">📦 {order.orderStatus?.toUpperCase()}</span>
            </div>
          </div>
        )}

        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
