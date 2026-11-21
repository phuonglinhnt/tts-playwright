import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate, formatPrice, STATUS_FLOW, STATUS_LABEL } from '../format.js';
import Icon from '../components/Icon.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => { api(`/orders/${id}`).then(setOrder).catch((e) => setError(e.message)); }, [id]);

  async function cancel() {
    setActionError('');
    try {
      setOrder(await api(`/orders/${id}/status`, { method: 'PATCH', body: { status: 'CANCELLED' } }));
      setConfirming(false);
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (error) return <p className="notice error" data-test="error">{error}. <Link to="/orders">Về danh sách đơn hàng</Link></p>;
  if (!order) return <p className="loading">Đang tải…</p>;

  const canCancel = order.userId === user.id && ['NEW', 'CONFIRMED'].includes(order.status);
  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <section>
      {location.state?.justPlaced && (
        <div className="success-box" data-test="order-success">
          <span className="success-icon"><Icon name="check" size={28} /></span>
          <div>
          <h1>Đặt hàng thành công</h1>
          <p>Cảm ơn bạn. Mã đơn hàng của bạn là <strong data-test="order-id">#{order.id}</strong>.</p>
          </div>
        </div>
      )}
      <div className="page-head">
        {location.state?.justPlaced ? <h2>Chi tiết đơn hàng #{order.id}</h2> : <h1>Đơn hàng #{order.id}</h1>}
        <span className={`status s-${order.status}`} data-test="order-status">{order.statusLabel}</span>
      </div>

      {order.status === 'CANCELLED' ? (
        <p className="notice error" data-test="cancelled-note">Đơn hàng này đã bị hủy.</p>
      ) : (
        <ol className="timeline panel" aria-label="Tiến trình đơn hàng">
          {STATUS_FLOW.map((s, i) => (
            <li key={s} className={i <= currentStep ? 'done' : ''} aria-current={i === currentStep ? 'step' : undefined}>
              {STATUS_LABEL[s]}
            </li>
          ))}
        </ol>
      )}

      <div className="cart-layout">
        <div className="panel">
          <h2>Sản phẩm</h2>
          <ul className="mini-list">
            {order.items.map((i) => (
              <li key={i.productId} data-test="order-item">
                <span>{i.name} × {i.quantity}</span><span>{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <h2>Giao đến</h2>
          <p data-test="shipping-info">{order.fullname} · {order.phone}</p>
          <p data-test="shipping-address" dangerouslySetInnerHTML={{ __html: order.address.replace(/\n/g, '<br />') }} />
          <p className="muted">Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
        <aside className="summary">
          <h2>Thanh toán</h2>
          <dl>
            <div><dt>Tạm tính</dt><dd data-test="subtotal">{formatPrice(order.subtotal)}</dd></div>
            <div><dt>Giảm giá</dt><dd data-test="discount">−{formatPrice(order.discount)}</dd></div>
            <div className="grand"><dt>Tổng cộng</dt><dd data-test="total">{formatPrice(order.total)}</dd></div>
          </dl>
          {canCancel && !confirming && (
            <button type="button" className="btn ghost wide" data-test="cancel-order" onClick={() => setConfirming(true)}>Hủy đơn hàng</button>
          )}
          {confirming && (
            <div className="confirm" role="alertdialog" aria-label="Xác nhận hủy đơn">
              <p>Hủy đơn #{order.id}? Bạn không thể hoàn tác.</p>
              <button type="button" className="btn danger" data-test="confirm-cancel" onClick={cancel}>Hủy đơn</button>
              <button type="button" className="btn ghost" data-test="keep-order" onClick={() => setConfirming(false)}>Giữ đơn</button>
            </div>
          )}
          {actionError && <p className="notice error" role="alert" data-test="error">{actionError}</p>}
          <Link to="/orders" className="back"><Icon name="back" size={16} /> Tất cả đơn hàng</Link>
        </aside>
      </div>
    </section>
  );
}
