import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    if (!email) return setError('Vui lòng nhập email');
    if (!password) return setError('Vui lòng nhập mật khẩu');
    setError('');
    setBusy(true);
    try {
      await login(email, password, remember);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Đăng nhập</h1>
        <p className="lead">Chào mừng quay lại. Dùng một tài khoản thử nghiệm trong README để bắt đầu.</p>
        {location.state?.registered && (
          <p className="notice ok" data-test="register-success">Đăng ký thành công. Mời bạn đăng nhập.</p>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-test="email" placeholder="ten@vidu.com" autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <div className="password-box">
            <input id="password" type={showPassword ? 'text' : 'password'} data-test="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="link-btn" data-test="toggle-password" aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Ẩn' : 'Hiện'}</button>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" data-test="remember-me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Ghi nhớ đăng nhập
        </label>
        {error && <p className="notice error" role="alert" data-test="error">{error}</p>}
        <button type="submit" className="btn primary wide" data-test="login-button" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <div className="auth-links">
          <Link to="/forgot-password" data-test="forgot-password-link">Quên mật khẩu?</Link>
          <Link to="/register" data-test="register-link">Tạo tài khoản mới</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
