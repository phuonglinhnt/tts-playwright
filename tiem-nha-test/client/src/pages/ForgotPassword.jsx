import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await api('/auth/forgot-password', { method: 'POST', body: { email } });
      setResult({ ok: true, text: r.message });
    } catch (err) {
      setResult({ ok: false, text: err.message });
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Quên mật khẩu</h1>
        <p className="lead">Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" data-test="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {result && (
          <p className={`notice ${result.ok ? 'ok' : 'error'}`} role="alert" data-test={result.ok ? 'success' : 'error'}>{result.text}</p>
        )}
        <button type="submit" className="btn primary wide" data-test="send-button">Gửi hướng dẫn</button>
        <div className="auth-links"><Link to="/login">Quay lại đăng nhập</Link></div>
      </form>
    </AuthLayout>
  );
}
