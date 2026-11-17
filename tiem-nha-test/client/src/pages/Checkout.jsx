import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatPrice } from '../format.js';
import Field from '../components/Field.jsx';
import Steps from '../components/Steps.jsx';

export default function Checkout() {
  const { user, refreshCart } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({ fullname: user.name, phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/cart').then(setCart).catch((e) => setMessage(e.message)); }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function placeOrder() {
    setBusy(true);
    setMessage('');
    try {
      const order = await api('/orders', { method: 'POST', body: form });
      await refreshCart();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setErrors(err.data?.errors || {});
      setMessage(err.data?.errors ? '' : err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart) return <p className="loading">Đang tải…</p>;
  if (cart.items.length === 0) {
    return (
      <div className="empty-box" data-test="empty-cart">
        <p>Giỏ hàng đang trống, chưa thể thanh toán.</p>
        <Link to="/" className="btn primary">Xem sản phẩm</Link>
      </div>
    );
  }

  return (
    <section>
      <div className="page-head"><h1>Thanh toán</h1></div>
      <Steps current={1} />
      <div className="cart-layout">
        <form className="panel" onSubmit={(e) => { e.preventDefault(); placeOrder(); }} noValidate>
          <h2>Thông tin giao hàng</h2>
          <p className="muted form-intro">Đơn hàng sẽ được giao đến địa chỉ dưới đây.</p>
          <Field id="fullname" label="Họ tên người nhận" error={errors.fullname}>
            <input id="fullname" data-test="fullname" value={form.fullname} onChange={set('fullname')} autoComplete="name" />
          </Field>
          <Field id="phone" label="Số điện thoại" error={errors.phone} hint="10 chữ số, ví dụ 0901234567.">
            <input id="phone" type="tel" data-test="phone" value={form.phone} onChange={set('phone')} autoComplete="tel" className="short" />
          </Field>
          <Field id="address" label="Địa chỉ giao hàng" error={errors.address}>
            <textarea id="address" data-test="address" rows="3" value={form.address} onChange={set('address')} autoComplete="street-address" />
          </Field>
          {message && <p className="notice error" role="alert" data-test="error">{message}</p>}
          <button type="button" className="btn primary wide" data-test="place-order" onClick={placeOrder}>
            {busy ? 'Đang xử lý…' : 'Đặt hàng'}
          </button>
        </form>
        <aside className="summary" aria-label="Đơn hàng của bạn">
          <h2>Đơn hàng của bạn</h2>
          <ul className="mini-list">
            {cart.items.map((i) => (
              <li key={i.productId} data-test="checkout-item">
                <span>{i.name} × {i.quantity}</span><span>{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Tạm tính</dt><dd data-test="subtotal">{formatPrice(cart.subtotal)}</dd></div>
            <div><dt>Giảm giá ({cart.discountRate}%)</dt><dd data-test="discount">−{formatPrice(cart.discount)}</dd></div>
            <div className="grand"><dt>Tổng cộng</dt><dd data-test="total">{formatPrice(cart.total)}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
