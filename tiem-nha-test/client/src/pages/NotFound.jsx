import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-box" data-test="not-found">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại hoặc đã bị đổi.</p>
      <Link to="/" className="btn primary">Về trang sản phẩm</Link>
    </div>
  );
}
