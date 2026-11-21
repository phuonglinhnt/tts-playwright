export default function QuantityStepper({ value, onChange, onCommit, min = 1, max = 10, disabled, label = 'Số lượng' }) {
  const num = Number(value);
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" data-test="qty-minus" aria-label="Giảm số lượng"
        disabled={disabled || !(num > min)} onClick={() => onChange(String(num - 1), true)}>−</button>
      <input type="text" inputMode="numeric" data-test="qty-input" aria-label={label}
        value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value, false)}
        onBlur={() => onCommit && onCommit()}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onCommit && onCommit(); } }} />
      <button type="button" data-test="qty-plus" aria-label="Tăng số lượng"
        disabled={disabled || !(num < max)} onClick={() => onChange(String(num + 1), true)}>+</button>
    </div>
  );
}
