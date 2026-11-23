export default function Steps({ current }) {
  const steps = ['Giỏ hàng', 'Thông tin giao hàng', 'Hoàn tất'];
  return (
    <ol className="steps" aria-label="Các bước đặt hàng">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="step-dot">{i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}
