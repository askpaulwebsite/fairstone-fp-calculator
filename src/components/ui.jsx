// Small shared presentational components for the calculator.

export function Card({ title, subtitle, accent, children }) {
  return (
    <section className={`card${accent ? ' card--accent' : ''}`}>
      {title && <h3 className="card__title">{title}</h3>}
      {subtitle && <p className="card__subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

// A read-only label → value row.
export function DataRow({ label, value, pencil, muted, total }) {
  return (
    <div className={`datarow${total ? ' datarow--total' : ''}`}>
      <span className="datarow__label">
        {pencil && <span className="datarow__pencil">✎</span>}
        {label}
      </span>
      <span className={`datarow__value${muted ? ' datarow__value--muted' : ''}`}>{value}</span>
    </div>
  );
}

// Stacked labelled input (uppercase label above control).
export function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

// Inline label → editable input row (used inside cards).
export function InputRow({ label, pencil, children }) {
  return (
    <div className="input-inline">
      <span className="input-inline__label">
        {pencil && <span className="datarow__pencil">✎</span>}
        {label}
      </span>
      {children}
    </div>
  );
}

// Numeric input that keeps empty string as empty (not 0) while typing.
export function NumberInput({ value, onChange, money, step, min, placeholder }) {
  return (
    <input
      type="number"
      className={`input${money ? ' input--money' : ''}`}
      value={value === null || value === undefined ? '' : value}
      step={step}
      min={min}
      placeholder={placeholder ?? '0'}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? '' : Number(v));
      }}
    />
  );
}

export function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      className="input"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      className="input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
