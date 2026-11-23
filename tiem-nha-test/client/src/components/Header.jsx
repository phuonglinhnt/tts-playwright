import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Icon from './Icon.jsx';

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[parts.length - 1][0] : parts[0][0]).toUpperCase();
}

export default function Header() {
  const { user, cartCount, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" data-test="brand">
          <span className="brand-mark"><Icon name="tag" size={18} /></span>
          <span>Tiệm Nhà Test</span>
        </Link>
        {user && (
          <>
            <nav className="main-nav" aria-label="Điều hướng chính">
              <NavLink to="/" end data-test="nav-products">Sản phẩm</NavLink>
              <NavLink to="/orders" data-test="nav-orders">Đơn hàng</NavLink>
              {user.role === 'admin' && <NavLink to="/admin/orders" data-test="nav-admin">Quản lý đơn</NavLink>}
            </nav>
            <div className="header-right">
              <Link to="/cart" className="cart-link" data-test="cart-link" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}>
                <Icon name="cart" size={22} />
                <span className="cart-label">Giỏ hàng</span>
                {cartCount > 0 && <span className="cart-badge" data-test="cart-badge">{cartCount}</span>}
              </Link>
              <span className="user-chip" title={user.email}>
                <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
                <span className="user-name" data-test="user-name">{user.name}</span>
              </span>
              <button type="button" className="icon-btn" onClick={onLogout} data-test="logout">
                <Icon name="logout" size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
