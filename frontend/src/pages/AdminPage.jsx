import { useState, useEffect } from 'react';
import { productAPI, orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faBox, faShoppingBag,
  faRupeeSign, faUsers, faTimes, faEye
} from '@fortawesome/free-solid-svg-icons';
import './AdminPage.css';

const EMPTY_PRODUCT = { name: '', description: '', price: '', originalPrice: '', category: 'fever', image: '', stock: 100 };
const CATEGORIES = ['fever', 'cold', 'stomach', 'vitamins', 'skincare'];

export default function AdminPage() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([productAPI.getAll(), orderAPI.getAll()]);
      setProducts(pRes.data);
      setOrders(oRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter(o => o.paymentStatus !== 'pending')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { icon: faBox, label: 'Products', value: products.length, color: '#3a86ff' },
    { icon: faShoppingBag, label: 'Orders', value: orders.length, color: '#06d6a0' },
    { icon: faRupeeSign, label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: '#ffd166' },
    { icon: faUsers, label: 'Customers', value: new Set(orders.map(o => o.customerPhone)).size, color: '#ef476f' },
  ];

  // ── Product CRUD ──────────────────────────────────────────────────
  const openCreate = () => { setEditingProduct(null); setForm(EMPTY_PRODUCT); setShowProductModal(true); };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, category: p.category, image: p.image, stock: p.stock });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice || form.price), stock: Number(form.stock) };
      if (editingProduct) {
        await productAPI.update(editingProduct.id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      loadData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const fmt = (n) => `₹${Number(n).toFixed(2)}`;

  if (loading) return (
    <div className="loading-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
      <div className="spinner" /><p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage products and orders for Ewon Medicare</p>
        </div>
      </div>

      <div className="admin-body container">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map(s => (
            <div className="stat-card card" key={s.label}>
              <div className="stat-icon" style={{ background: s.color }}>
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            <FontAwesomeIcon icon={faBox} /> Products ({products.length})
          </button>
          <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            <FontAwesomeIcon icon={faShoppingBag} /> Orders ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="tab-content card">
            <div className="tab-toolbar">
              <h2>Products</h2>
              <button className="btn btn-primary" onClick={openCreate}>
                <FontAwesomeIcon icon={faPlus} /> Add Product
              </button>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th><th>Name</th><th>Category</th>
                    <th>Price</th><th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.image} alt={p.name} className="table-img" /></td>
                      <td>
                        <div className="product-name-cell">
                          <strong>{p.name}</strong>
                          <span>{p.description?.slice(0, 50)}...</span>
                        </div>
                      </td>
                      <td><span className="badge badge-success">{p.category}</span></td>
                      <td>
                        <div>{fmt(p.price)}</div>
                        {p.originalPrice > p.price && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray)', textDecoration: 'line-through' }}>{fmt(p.originalPrice)}</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p.id, p.name)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="tab-content card">
            <div className="tab-toolbar">
              <h2>All Orders</h2>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>Customer</th><th>Items</th>
                    <th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><code className="order-code">{o.orderId}</code></td>
                      <td>
                        <div><strong>{o.customerName}</strong></div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{o.customerPhone}</div>
                      </td>
                      <td>{o.items?.length || 0} item(s)</td>
                      <td><strong>{fmt(o.total)}</strong></td>
                      <td>
                        <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : o.paymentStatus === 'COD' ? 'badge-warning' : 'badge-danger'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-warning">{o.orderStatus}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={set('name')} required placeholder="Product name" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')} required rows={3} placeholder="Product description" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={form.price} onChange={set('price')} required min="0.01" step="0.01" />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={set('originalPrice')} min="0" step="0.01" placeholder="For discount display" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={form.stock} onChange={set('stock')} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.image} onChange={set('image')} required placeholder="https://..." />
                {form.image && <img src={form.image} alt="preview" className="img-preview" />}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Order: {selectedOrder.orderId}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="order-detail">
              <div className="order-detail-section">
                <h4>Customer</h4>
                <p><strong>{selectedOrder.customerName}</strong> — {selectedOrder.customerPhone}</p>
                <p>{selectedOrder.customerAddress}, {selectedOrder.customerCity}, {selectedOrder.customerState} — {selectedOrder.customerPincode}</p>
              </div>
              <div className="order-detail-section">
                <h4>Items</h4>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="order-item-detail">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{fmt(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="order-detail-section">
                <h4>Payment</h4>
                <div className="order-item-detail"><span>Subtotal</span><span>{fmt(selectedOrder.subtotal)}</span></div>
                <div className="order-item-detail"><span>Taxes</span><span>{fmt(selectedOrder.taxes)}</span></div>
                <div className="order-item-detail"><span>Delivery</span><span>{selectedOrder.delivery == 0 ? 'Free' : fmt(selectedOrder.delivery)}</span></div>
                <div className="order-item-detail total"><span>Total</span><strong>{fmt(selectedOrder.total)}</strong></div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${selectedOrder.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                  <span className="badge badge-warning">{selectedOrder.orderStatus}</span>
                  <span className="badge badge-success">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
