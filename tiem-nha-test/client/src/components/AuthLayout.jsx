export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside" aria-hidden="true">
        <div className="aside-tags">
          <span className="big-tag t1">199.000đ</span>
          <span className="big-tag t2">−15%</span>
          <span className="big-tag t3">500.000đ</span>
        </div>
        <div className="aside-copy">
          <p className="aside-title">Tiệm Nhà Test</p>
          <p>Cửa hàng mẫu để thực tập sinh luyện kiểm thử: tìm lỗi, báo bug, viết test tự động.</p>
        </div>
      </aside>
      <div className="auth-main">{children}</div>
    </div>
  );
}
