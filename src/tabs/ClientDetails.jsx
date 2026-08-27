import { useCalc } from '../state/CalculatorContext.jsx';
import { Card } from '../components/ui.jsx';
import { eur } from '../lib/format.js';
import { makeExampleInputs, makeDefaultInputs } from '../lib/calc.js';
import useIsMobile from '../lib/useIsMobile.js';

const OCC_CLASSES = ['', 'Class 1', 'Class 2', 'Class 3', 'Class 4'];
const YESNO = ['No', 'Yes'];

// One definition per row, shared by the desktop grid and the mobile stacked layout.
const FIELDS = [
  { key: 'name', label: 'Client Name', type: 'text', pencil: true },
  { key: 'dob', label: 'Date of Birth', type: 'date', pencil: true },
  { label: 'Age', derived: (d) => d.age ?? '—' },
  { key: 'occupationClass', label: 'Occupation Class', type: 'select', options: OCC_CLASSES, pencil: true },
  { key: 'smoker', label: 'Smoker', type: 'select', options: YESNO, pencil: true },
  { key: 'grossAnnualIncome', label: 'Gross Annual Income', pencil: true, combined: (c) => eur(c.grossAnnual) },
  { key: 'netMonthlyIncome', label: 'Net Monthly Income', pencil: true, combined: (c) => eur(c.netMonthly) },
  { label: 'Net Annual Income (× 12)', derived: (d) => eur(d.netAnnual), combined: (c) => eur(c.netAnnual) },
];

// A grid row with a label + one editable cell per active holder + combined.
function Row({ label, pencil, render, combined }) {
  return (
    <div className="holder-row">
      <span className="holder-row__label">
        {pencil && <span className="datarow__pencil">✎</span>}
        {label}
      </span>
      {render}
      <span className="holder-row__cell" style={{ fontWeight: 600, color: 'var(--color-purple)' }}>
        {combined}
      </span>
    </div>
  );
}

export default function ClientDetails() {
  const { inputs, derived, setHolder, setField, setInputs } = useCalc();
  const isMobile = useIsMobile();
  const two = inputs.hasSecondHolder;
  const [h1] = inputs.holders;

  const cell = (idx, f) => {
    const h = inputs.holders[idx];
    const { key, type, options } = f;
    if (type === 'text')
      return (
        <input className="input" value={h[key] ?? ''}
          onChange={(e) => setHolder(idx, key, e.target.value)} />
      );
    if (type === 'date')
      return (
        <input className="input" type="date" value={h[key] ?? ''}
          onChange={(e) => setHolder(idx, key, e.target.value)} />
      );
    if (type === 'select')
      return (
        <select className="select" value={h[key]}
          onChange={(e) => setHolder(idx, key, e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
        </select>
      );
    return (
      <input className="input input--money" type="number" value={h[key] === '' ? '' : h[key]}
        onChange={(e) => setHolder(idx, key, e.target.value === '' ? '' : Number(e.target.value))} />
    );
  };

  const emptyCell = <span className="holder-row__cell datarow__value--muted">—</span>;

  const holderCell = (idx, f) =>
    f.derived
      ? <span className="holder-row__cell" key={idx}>{f.derived(derived.holders[idx])}</span>
      : cell(idx, f);

  return (
    <>
      <div className="page-head page-head--row">
        <div>
          <h1>Client Details</h1>
          <p>Enter the household details below. Every other tab updates automatically.</p>
        </div>
        <div className="page-head__actions">
          <button className="btn-secondary" onClick={() => setInputs(makeExampleInputs())}>Load example data</button>
          <button className="btn-secondary" onClick={() => setInputs(makeDefaultInputs())}>Clear all</button>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--color-slate)' }}>
            <input type="checkbox" checked={two}
              onChange={(e) => setField(['hasSecondHolder'], e.target.checked)} />
            Include a second holder
          </label>
          <span style={{ fontSize: 12, color: 'var(--color-light-purple)' }}>
            Today: {new Date().toLocaleDateString('en-IE')}
          </span>
        </div>

        {isMobile ? (
          <>
            {[0, ...(two ? [1] : [])].map((idx) => (
              <section key={idx} className="m-holder">
                <h3 className="m-holder__title">{inputs.holders[idx].name || `Client ${idx + 1}`}</h3>
                {FIELDS.map((f) => (
                  <div className="m-field" key={f.label}>
                    <span className="m-field__label">
                      {f.pencil && <span className="datarow__pencil">✎</span>}
                      {f.label}
                    </span>
                    {f.derived
                      ? <span className="m-field__value">{f.derived(derived.holders[idx])}</span>
                      : cell(idx, f)}
                  </div>
                ))}
              </section>
            ))}
            {two && (
              <section className="m-holder">
                <h3 className="m-holder__title">Combined</h3>
                {FIELDS.filter((f) => f.combined).map((f) => (
                  <div className="m-field" key={f.label}>
                    <span className="m-field__label">{f.label}</span>
                    <span className="m-field__value">{f.combined(derived.combined)}</span>
                  </div>
                ))}
              </section>
            )}
          </>
        ) : (
          <>
            <div className="holder-head">
              <div>Field</div>
              <div>{h1.name || 'Client 1'}</div>
              <div>{two ? (inputs.holders[1].name || 'Client 2') : ''}</div>
              <div>Combined</div>
            </div>
            {FIELDS.map((f) => (
              <Row key={f.label} label={f.label} pencil={f.pencil}
                combined={f.combined ? f.combined(derived.combined) : ''}
                render={<>
                  {holderCell(0, f)}
                  {two ? holderCell(1, f) : emptyCell}
                </>} />
            ))}
          </>
        )}
      </Card>

      <div className="grid-2">
        <Card title="Household">
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Youngest Child Age</span>
            <input className="input input--money" type="number" value={inputs.household.youngestChildAge}
              onChange={(e) => setField(['household', 'youngestChildAge'], Number(e.target.value || 0))} />
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Mortgage Repayments (monthly)</span>
            <input className="input input--money" type="number" value={inputs.household.mortgageMonthly}
              onChange={(e) => setField(['household', 'mortgageMonthly'], Number(e.target.value || 0))} />
          </div>
          <div className="datarow">
            <span className="datarow__label">Mortgage Repayments p.a. (× 12)</span>
            <span className="datarow__value">{eur(derived.mortgagePa)}</span>
          </div>
        </Card>

        <Card title="State Benefit Assumptions" subtitle="2026 figures — editable">
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Annual State Illness Benefit</span>
            <input className="input input--money" type="number" value={inputs.assumptions.stateIllnessBenefit}
              onChange={(e) => setField(['assumptions', 'stateIllnessBenefit'], Number(e.target.value || 0))} />
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Annual State Widow's Pension</span>
            <input className="input input--money" type="number" value={inputs.assumptions.stateWidowsPension}
              onChange={(e) => setField(['assumptions', 'stateWidowsPension'], Number(e.target.value || 0))} />
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Cease Age</span>
            <input className="input input--money" type="number" value={inputs.assumptions.ceaseAge}
              onChange={(e) => setField(['assumptions', 'ceaseAge'], Number(e.target.value || 0))} />
          </div>
        </Card>
      </div>
    </>
  );
}
