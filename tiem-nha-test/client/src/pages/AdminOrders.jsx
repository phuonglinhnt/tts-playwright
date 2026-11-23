import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatPrice, NEXT_ACTIONS, STATUS_LABEL } from '../format.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = () => api(`/orders${filter ? `?status=${filter}` : ''}`).then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [filter]);

  async function setStatus(order, status) {
    setError('');
    try {
      await api(`/orders/${order.id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (err) {
      setError(`Đơn #${order.id}: ${err.message}`);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Quản lý đơn hàng</h1>
        <div className="toolbar">
          <label htmlFor="status-filter" className="visually-hidden">Lọc theo trạng thái</label>
          <select id="status-filter" data-test="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="notice error" role="alert" data-test="error">{error}</p>}
      {!orders ? <p className="loading">Đang tải…</p> : (
        <div className="table-wrap panel">
          <table className="orders-table">
            <thead>
              <tr><th scope="col">Mã đơn</th><th scope="col">Khách hàng</th><th scope="col">Ngày đặt</th><th scope="col" className="num">Tổng tiền</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} data-test="admin-order-row">
                  <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
                  <td>{o.customerEmail}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td className="num">{formatPrice(o.total)}</td>
                  <td><span className={`status s-${o.status}`} data-test="order-status">{o.statusLabel}</span></td>
                  <td><div className="actions">
                    {NEXT_ACTIONS[o.status].map(([s, label]) => (
                      <button key={s} type="button" className={`btn small ${s === 'CANCELLED' ? 'ghost' : ''}`}
                        data-test={`set-status-${s}`} onClick={() => setStatus(o, s)}>{label}</button>
                    ))}
                    {NEXT_ACTIONS[o.status].length === 0 && <span className="muted">Không còn thao tác</span>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
