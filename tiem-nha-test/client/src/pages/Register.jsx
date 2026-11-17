import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';

const EMPTY = { name: '', email: '', password: '', confirmPassword: '', age: '' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api('/auth/register', { method: 'POST', body: form });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setErrors(err.data?.errors || {});
      setMessage(err.data?.errors ? '' : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Tạo tài khoản</h1>
        <p className="lead">Tài khoản mới được tính là thành viên và hưởng ưu đãi giảm giá.</p>
        <Field id="name" label="Họ tên" error={errors.name}>
          <input id="name" data-test="name" value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" data-test="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field id="password" label="Mật khẩu" error={errors.password} hint="Từ 8 đến 20 ký tự, có ít nhất 1 chữ hoa và 1 chữ số.">
          <input id="password" type="password" data-test="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <Field id="confirmPassword" label="Nhập lại mật khẩu" error={errors.confirmPassword}>
          <input id="confirmPassword" type="password" data-test="confirm-password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
        </Field>
        <Field id="age" label="Tuổi" error={errors.age} hint="Từ 18 đến 60 tuổi.">
          <input id="age" inputMode="numeric" data-test="age" value={form.age} onChange={set('age')} className="short" />
        </Field>
        {message && <p className="notice error" role="alert" data-test="error">{message}</p>}
        <button type="submit" className="btn primary wide" data-test="register-button" disabled={busy}>
          {busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
        </button>
        <div className="auth-links">
          <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
