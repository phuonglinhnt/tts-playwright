import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Header from './components/Header.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children, admin }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <p className="loading">Đang tải…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { ready } = useAuth();
  return (
    <>
      <p className="practice-note">Website luyện tập kiểm thử. Dữ liệu có thể được đặt lại bất cứ lúc nào.</p>
      <Header />
      <main className="page">
        {ready && (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<RequireAuth><Products /></RequireAuth>} />
            <Route path="/products/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth admin><AdminOrders /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <footer className="site-footer">
        <p>Tiệm Nhà Test là website luyện tập kiểm thử, không phải cửa hàng thật. Không nhập thông tin cá nhân thật.</p>
      </footer>
    </>
  );
}
