import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../hooks/useCart';
import { orderAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';
import './CartDrawer.css';

export default function CartDrawer({ onClose }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart,
          subtotal, taxes, delivery, total } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod'
  });

  const fmt = (n) => `₹${Number(n).toFixed(2)}`;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Cart is empty!');
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price)
        })),
        subtotal: Number(subtotal.toFixed(2)),
        taxes: Number(taxes.toFixed(2)),
        delivery: Number(delivery.toFixed(2)),
        total: Number(total.toFixed(2)),
        customerInfo: {
          name: form.name, phone: form.phone, address: form.address,
          city: form.city, state: form.state, pincode: form.pincode
        },
        paymentMethod: form.paymentMethod
      };

      if (form.paymentMethod === 'online') {
        // Razorpay flow
        const rpRes = await paymentAPI.createOrder({ amount: orderData.total });
        const { orderId: rpOrderId, amount: rpAmount, currency, key } = rpRes.data;

        const options = {
          key,
          amount: rpAmount,
          currency,
          order_id: rpOrderId,
          name: 'Ewon Medicare',
          description: 'Medicine Order',
          handler: async (payment) => {
            const finalOrder = {
              ...orderData,
              razorpayOrderId: payment.razorpay_order_id,
              razorpayPaymentId: payment.razorpay_payment_id,
              razorpaySignature: payment.razorpay_signature
            };
            const res = await orderAPI.place(finalOrder);
            clearCart();
            onClose();
            navigate(`/order-success/${res.data.orderId}`);
          },
          prefill: { name: form.name, contact: form.phone },
          theme: { color: '#3a86ff' }
        };

        if (window.Razorpay) {
          new window.Razorpay(options).open();
        } else {
          toast.error('Razorpay not loaded. Using COD fallback.');
          orderData.paymentMethod = 'cod';
          const res = await orderAPI.place(orderData);
          clearCart();
          onClose();
          navigate(`/order-success/${res.data.orderId}`);
        }
      } else {
        // COD
        const res = await orderAPI.place(orderData);
        clearCart();
        onClose();
        navigate(`/order-success/${res.data.orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Cart ({cartItems.length})</h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div style={{ fontSize: '3rem' }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{fmt(Number(item.price) * item.quantity)}</p>
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>{fmt(taxes)}</span></div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{delivery === 0 ? <span className="free-tag">Free</span> : fmt(delivery)}</span>
              </div>
              {subtotal < 299 && (
                <p className="free-delivery-hint">Add ₹{(299 - subtotal).toFixed(2)} more for free delivery</p>
              )}
              <div className="summary-row total-row">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
              <button className="btn btn-primary w-full" onClick={() => setShowCheckout(true)}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="overlay" style={{ zIndex: 1100 }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Checkout</h3>
              <button className="close-btn" onClick={() => setShowCheckout(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handlePlaceOrder}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--gray)' }}>Delivery Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit number" />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} required placeholder="Street address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="6-digit pincode" maxLength={6} />
              </div>

              <h4 style={{ margin: '1rem 0 0.75rem', color: 'var(--gray)' }}>Payment Method</h4>
              <div className="payment-options">
                {[['cod', '💵 Cash on Delivery'], ['online', '💳 Pay Online (Razorpay)']].map(([val, label]) => (
                  <label key={val} className={`pay-option ${form.paymentMethod === val ? 'selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value={val}
                      checked={form.paymentMethod === val} onChange={handleChange} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="checkout-total">
                <span>Total to Pay:</span>
                <strong>{fmt(total)}</strong>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Processing...' : `Place Order — ${fmt(total)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
