// Formatting + math helpers shared across the calculator.
// Empty / missing values render as an em-dash instead of NaN or #DIV/0!.

const EUR = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const EUR2 = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 });

export function isBlank(v) {
  return v === null || v === undefined || v === '' || Number.isNaN(v);
}

export function eur(v) {
  return isBlank(v) ? '—' : EUR.format(v);
}

export function eur2(v) {
  return isBlank(v) ? '—' : EUR2.format(v);
}

export function num(v) {
  return isBlank(v) ? '—' : NUM.format(v);
}

export function pct(v, digits = 1) {
  if (isBlank(v)) return '—';
  return `${(v * 100).toFixed(digits)}%`;
}

export function years(v) {
  return isBlank(v) ? '—' : `${NUM.format(v)} ${v === 1 ? 'year' : 'years'}`;
}

// Round up to nearest `step` (Excel CEILING).
export function ceilingTo(x, step) {
  if (isBlank(x) || !step) return x;
  return Math.ceil(x / step) * step;
}

// Whole-year difference between two dates (Excel DATEDIF(...,"Y")).
export function datedifY(fromISO, toDate = new Date()) {
  if (!fromISO) return null;
  const from = new Date(fromISO);
  if (Number.isNaN(from.getTime())) return null;
  let age = toDate.getFullYear() - from.getFullYear();
  const m = toDate.getMonth() - from.getMonth();
  if (m < 0 || (m === 0 && toDate.getDate() < from.getDate())) age -= 1;
  if (age < 0 || age > 120) return null; // guard against unrealistic / empty dates
  return age;
}

// Parse a numeric input; blank string -> 0 (matches spreadsheet blank = 0).
export function toNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
