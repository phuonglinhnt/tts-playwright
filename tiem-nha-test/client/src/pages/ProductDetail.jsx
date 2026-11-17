import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatPrice } from '../format.js';
import ProductArt from '../components/ProductArt.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import Icon from '../components/Icon.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, setCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState('1');
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setProduct).catch((e) => setLoadError(e.message));
    api(`/products/${id}/reviews`).then(setReviews).catch((e) => {
      console.error('Không tải được đánh giá sản phẩm', e);
      setReviews([]);
    });
  }, [id]);

  if (loadError) return <p className="notice error" data-test="error">{loadError}. <Link to="/">Quay lại danh sách sản phẩm</Link></p>;
  if (!product) return <p className="loading">Đang tải…</p>;

  const max = Math.min(10, product.stock);

  async function addToCart() {
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) {
      setMessage({ ok: false, text: 'Số lượng tối thiểu là 1' });
      return;
    }
    if (user.mode === 'problem' && product.slug === 'tai-nghe-bluetooth') return;
    try {
      const cart = await api('/cart/items', { method: 'POST', body: { productId: product.id, quantity: n } });
      setCartCount(cart.itemCount);
      setMessage({ ok: true, text: `Đã thêm ${n} “${product.name}” vào giỏ` });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  return (
    <article className="detail">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <Link to="/" data-test="back-to-products">Sản phẩm</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="detail-grid">
        <ProductArt product={product} size="lg" />
        <div className="detail-info">
          <h1 data-test="product-name">{product.name}</h1>
          <span className="price-tag big" data-test="product-price">{formatPrice(product.price)}</span>
          <p className="description" data-test="product-description">{product.description}</p>
          <p className={`stock ${product.inStock ? (product.stock <= 3 ? 'low' : '') : 'out'}`} data-test="product-stock">
            {product.inStock ? `Còn ${product.stock} sản phẩm trong kho` : 'Hết hàng'}
          </p>
          {product.inStock && (
            <div className="buy-row">
              <QuantityStepper value={qty} max={max} onChange={(v) => setQty(v)} />
              <button type="button" className="btn primary" data-test="add-to-cart" onClick={addToCart}>Thêm vào giỏ</button>
            </div>
          )}
          {product.inStock && <p className="hint">Mỗi lần thêm tối đa 10 sản phẩm.</p>}
          {message && (
            <p className={`notice ${message.ok ? 'ok' : 'error'}`} role="alert" data-test={message.ok ? 'added-message' : 'error'}>
              {message.ok && <Icon name="check" size={18} />} {message.text}{message.ok && <>. <Link to="/cart">Xem giỏ hàng</Link></>}
            </p>
          )}
        </div>
      </div>
      <section className="reviews panel">
        <h2>Đánh giá của khách{reviews.length > 0 && <span className="count">{reviews.length}</span>}</h2>
        {reviews.length === 0 ? (
          <p className="empty" data-test="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <ul>
            {reviews.map((r, i) => (
              <li key={i} data-test="review">
                <span className="avatar small" aria-hidden="true">{r.author[0]}</span>
                <strong>{r.author}</strong> <span className="stars" aria-label={`${r.rating} trên 5 sao`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
