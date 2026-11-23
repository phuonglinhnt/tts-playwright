import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatPrice } from '../format.js';
import Icon from '../components/Icon.jsx';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    const qs = submitted ? `?q=${encodeURIComponent(submitted)}` : '';
    api(`/orders${qs}`).then(setOrders).catch((e) => setError(e.message));
  }, [submitted]);

  return (
    <section>
      <div className="page-head">
        <h1>Đơn hàng của tôi</h1>
        <form className="toolbar" role="search" onSubmit={(e) => { e.preventDefault(); setSubmitted(query.trim()); }}>
          <label htmlFor="order-search" className="visually-hidden">Tìm đơn theo tên sản phẩm</label>
          <div className="search-box">
            <Icon name="search" size={18} />
            <input id="order-search" type="search" data-test="order-search" placeholder="Tìm theo tên sản phẩm"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="btn" data-test="order-search-button">Tìm</button>
        </form>
      </div>
      {error && <p className="notice error" role="alert" data-test="error">{error}</p>}
      {!orders ? (!error && <p className="loading">Đang tải…</p>) : orders.length === 0 ? (
        submitted ? (
          <p className="empty" data-test="no-orders">Không có đơn hàng nào chứa sản phẩm “{submitted}”.</p>
        ) : (
          <div className="empty-box" data-test="no-orders">
            <p className="empty-title">Bạn chưa có đơn hàng nào.</p>
            <Link to="/" className="btn primary">Bắt đầu mua sắm</Link>
          </div>
        )
      ) : (
        <div className="table-wrap panel">
          <table className="orders-table">
            <thead>
              <tr><th scope="col">Mã đơn</th><th scope="col">Ngày đặt</th><th scope="col">Sản phẩm</th><th scope="col" className="num">Tổng tiền</th><th scope="col">Trạng thái</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} data-test="order-row">
                  <td><Link to={`/orders/${o.id}`} data-test="order-link">#{o.id}</Link></td>
                  <td data-test="order-date">{formatDate(o.createdAt)}</td>
                  <td>{o.items.map((i) => i.name).join(', ')}</td>
                  <td className="num" data-test="order-total">{formatPrice(o.total)}</td>
                  <td><span className={`status s-${o.status}`} data-test="order-status">{o.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
