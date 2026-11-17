import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatPrice } from '../format.js';
import ProductArt from '../components/ProductArt.jsx';
import Icon from '../components/Icon.jsx';

const SORT_OPTIONS = [
  ['name_asc', 'Tên (A-Z)'],
  ['name_desc', 'Tên (Z-A)'],
  ['price_asc', 'Giá thấp đến cao'],
  ['price_desc', 'Giá cao đến thấp'],
];

export default function Products() {
  const { user, setCartCount } = useAuth();
  const [products, setProducts] = useState(null);
  const [sort, setSort] = useState('name_asc');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    let sortParam = sort;
    if (user.mode === 'problem' && sort === 'price_asc') sortParam = 'price_desc';
    const params = new URLSearchParams({ sort: sortParam });
    if (query.trim()) params.set('q', query.trim());
    api(`/products?${params}`).then(setProducts).catch((e) => setError(e.message));
  }, [sort, query, user.mode]);

  async function addToCart(product) {
    if (user.mode === 'problem' && product.slug === 'tai-nghe-bluetooth') return;
    setError('');
    try {
      const cart = await api('/cart/items', { method: 'POST', body: { productId: product.id, quantity: 1 } });
      setCartCount(cart.itemCount);
      setFlash(`Đã thêm “${product.name}” vào giỏ`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="promo">
        <div className="promo-copy">
          <h1>Ưu đãi cho thành viên</h1>
          <p>Đơn từ 500.000đ: thành viên giảm 15%, khách thường giảm 10%. Đơn nhỏ hơn: thành viên vẫn giảm 5%.</p>
        </div>
        <div className="promo-tags" aria-hidden="true">
          <span className="big-tag">−15%</span>
          <span className="big-tag alt">−5%</span>
        </div>
      </div>

      <div className="list-head">
        <h2 className="list-title">
          Tất cả sản phẩm
          {products && <span className="count">{products.length} sản phẩm</span>}
        </h2>
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={18} />
            <label className="visually-hidden" htmlFor="search">Tìm sản phẩm</label>
            <input id="search" type="search" data-test="search" placeholder="Tìm theo tên sản phẩm"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label className="visually-hidden" htmlFor="sort">Sắp xếp</label>
          <select id="sort" data-test="product-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div aria-live="polite">
        {flash && (
          <p className="notice ok" data-test="added-message">
            <Icon name="check" size={18} /> {flash}. <Link to="/cart">Xem giỏ hàng</Link>
          </p>
        )}
        {error && <p className="notice error" role="alert" data-test="error">{error}</p>}
      </div>

      {products && products.length === 0 && (
        <div className="empty-box" data-test="empty-result">
          <p className="empty-title">Không có sản phẩm nào khớp với “{query.trim()}”</p>
          <p className="muted">Thử từ khóa ngắn hơn hoặc kiểm tra lại chính tả.</p>
        </div>
      )}

      <ul className="product-grid">
        {products?.map((p) => (
          <li key={p.id} className="product-card" data-test="product-card">
            <Link to={`/products/${p.id}`} className="product-link" data-test={`product-link-${p.slug}`}>
              <ProductArt product={p} />
              <span className="product-name" data-test="product-name">{p.name}</span>
            </Link>
            <p className={`stock ${p.inStock ? (p.stock <= 3 ? 'low' : '') : 'out'}`} data-test="product-stock">
              {p.inStock ? (p.stock <= 3 ? `Chỉ còn ${p.stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
            </p>
            <div className="card-foot">
              <span className="price-tag" data-test="product-price">{formatPrice(p.price)}</span>
              <button type="button" className="btn small" data-test={`add-to-cart-${p.slug}`}
                disabled={!p.inStock} onClick={() => addToCart(p)}>
                {p.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
