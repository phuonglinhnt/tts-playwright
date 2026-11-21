import { useAuth } from '../auth.jsx';

export default function ProductArt({ product, size = 'md' }) {
  const { user } = useAuth();
  const odd = user?.mode === 'problem';
  const color = odd ? '#9AA3B5' : product.color;
  const icon = odd ? '📦' : product.icon;
  return (
    <div className={`art art-${size}`} style={{ '--art': color }} data-test="product-image" aria-hidden="true">
      <span>{icon}</span>
    </div>
  );
}
