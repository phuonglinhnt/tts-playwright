import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatPrice } from '../format.js';
import ProductArt from '../components/ProductArt.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import Icon from '../components/Icon.jsx';
import Steps from '../components/Steps.jsx';

function CartRow({ item, onUpdated, onRemoved, problem }) {
  const [qty, setQty] = useState(String(item.quantity));
  const [error, setError] = useState('');

  useEffect(() => setQty(String(item.quantity)), [item.quantity]);

  async function save(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) {
      setError('Số lượng tối thiểu là 1');
      setQty(String(item.quantity));
      return;
    }
    if (n === item.quantity) return;
    setError('');
    try {
      const cart = await api(`/cart/items/${item.productId}`, { method: 'PATCH', body: { quantity: n } });
      if (problem && n > item.quantity) setQty(String(n));
      else onUpdated(cart);
    } catch (err) {
      setError(err.message);
      setQty(String(item.quantity));
    }
  }

  async function remove() {
    try {
      await api(`/cart/items/${item.productId}`, { method: 'DELETE' });
      onRemoved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <li className="cart-row" data-test="cart-item">
      <ProductArt product={item} size="sm" />
      <div className="cart-name">
        <Link to={`/products/${item.productId}`} data-test="cart-item-name">{item.name}</Link>
        <span className="muted" data-test="unit-price">{formatPrice(item.price)}</span>
      </div>
      <QuantityStepper value={qty} max={Math.min(10, item.stock)}
        onChange={(v, commitNow) => { setQty(v); if (commitNow) save(v); }}
        onCommit={() => save(qty)} />
      <strong className="line-total" data-test="line-total">{formatPrice(item.lineTotal)}</strong>
      <button type="button" className="link-btn danger" data-test="remove-item" onClick={remove}>
        <Icon name="trash" size={16} /> Xóa
      </button>
      {error && <p className="row-error" role="alert" data-test="item-error">{error}</p>}
    </li>
  );
}

export default function Cart() {
  const { user, setCartCount } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/cart').then((c) => { setCart(c); setCartCount(c.itemCount); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <p className="notice error" data-test="error">{error}</p>;
  if (!cart) return <p className="loading">Đang tải…</p>;

  const update = (c) => { setCart(c); setCartCount(c.itemCount); };

  return (
    <section>
      <div className="page-head">
        <h1>Giỏ hàng{cart.itemCount > 0 && <span className="count">{cart.itemCount} sản phẩm</span>}</h1>
      </div>
      {cart.items.length > 0 && <Steps current={0} />}
      {cart.items.length === 0 ? (
        <div className="empty-box" data-test="empty-cart">
          <span className="empty-icon"><Icon name="cart" size={32} /></span>
          <p className="empty-title">Giỏ hàng đang trống.</p>
          <p className="muted">Chọn vài món ở trang sản phẩm rồi quay lại đây.</p>
          <Link to="/" className="btn primary">Xem sản phẩm</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list panel">
            {cart.items.map((item) => (
              <CartRow key={item.productId} item={item} onUpdated={update} onRemoved={load} problem={user.mode === 'problem'} />
            ))}
          </ul>
          <aside className="summary" aria-label="Tóm tắt đơn hàng">
            <h2>Tóm tắt</h2>
            <dl>
              <div><dt>Tạm tính</dt><dd data-test="subtotal">{formatPrice(cart.subtotal)}</dd></div>
              <div><dt>Giảm giá ({cart.discountRate}%)</dt><dd data-test="discount">−{formatPrice(cart.discount)}</dd></div>
              <div className="grand"><dt>Tổng cộng</dt><dd data-test="total">{formatPrice(cart.total)}</dd></div>
            </dl>
            <p className="hint" data-test="member-note">
              {user.isMember ? 'Bạn là thành viên.' : 'Bạn chưa là thành viên.'} Đơn từ 500.000đ được giảm nhiều hơn.
            </p>
            <button type="button" className="btn primary wide" data-test="checkout" onClick={() => navigate('/checkout')}>Thanh toán</button>
            <Link to="/" className="btn ghost wide" data-test="continue-shopping">Tiếp tục mua sắm</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
