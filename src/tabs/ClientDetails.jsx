import { useCalc } from '../state/CalculatorContext.jsx';
import { Card } from '../components/ui.jsx';
import { eur } from '../lib/format.js';
import { makeExampleInputs, makeDefaultInputs } from '../lib/calc.js';

const OCC_CLASSES = ['', 'Class 1', 'Class 2', 'Class 3', 'Class 4'];
const YESNO = ['No', 'Yes'];

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
  const two = inputs.hasSecondHolder;
  const [h1, h2] = inputs.holders;
  const [d1, d2] = derived.holders;

  const cell = (idx, key, type = 'number', opts = {}) => {
    const h = inputs.holders[idx];
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
          {opts.options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
        </select>
      );
    return (
      <input className="input input--money" type="number" value={h[key] === '' ? '' : h[key]}
        onChange={(e) => setHolder(idx, key, e.target.value === '' ? '' : Number(e.target.value))} />
    );
  };

  const emptyCell = <span className="holder-row__cell datarow__value--muted">—</span>;

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--color-slate)' }}>
            <input type="checkbox" checked={two}
              onChange={(e) => setField(['hasSecondHolder'], e.target.checked)} />
            Include a second holder
          </label>
          <span style={{ fontSize: 12, color: 'var(--color-light-purple)' }}>
            Today: {new Date().toLocaleDateString('en-IE')}
          </span>
        </div>

        <div className="holder-head">
          <div>Field</div>
          <div>{h1.name || 'Client 1'}</div>
          <div>{two ? (h2.name || 'Client 2') : ''}</div>
          <div>Combined</div>
        </div>

        <Row label="Client Name" pencil combined="" render={<>
          {cell(0, 'name', 'text')}
          {two ? cell(1, 'name', 'text') : emptyCell}
        </>} />

        <Row label="Date of Birth" pencil combined="" render={<>
          {cell(0, 'dob', 'date')}
          {two ? cell(1, 'dob', 'date') : emptyCell}
        </>} />

        <Row label="Age" combined="" render={<>
          <span className="holder-row__cell">{d1.age ?? '—'}</span>
          {two ? <span className="holder-row__cell">{d2.age ?? '—'}</span> : emptyCell}
        </>} />

        <Row label="Occupation Class" pencil combined="" render={<>
          {cell(0, 'occupationClass', 'select', { options: OCC_CLASSES })}
          {two ? cell(1, 'occupationClass', 'select', { options: OCC_CLASSES }) : emptyCell}
        </>} />

        <Row label="Smoker" pencil combined="" render={<>
          {cell(0, 'smoker', 'select', { options: YESNO })}
          {two ? cell(1, 'smoker', 'select', { options: YESNO }) : emptyCell}
        </>} />

        <Row label="Gross Annual Income" pencil combined={eur(derived.combined.grossAnnual)} render={<>
          {cell(0, 'grossAnnualIncome')}
          {two ? cell(1, 'grossAnnualIncome') : emptyCell}
        </>} />

        <Row label="Net Monthly Income" pencil combined={eur(derived.combined.netMonthly)} render={<>
          {cell(0, 'netMonthlyIncome')}
          {two ? cell(1, 'netMonthlyIncome') : emptyCell}
        </>} />

        <Row label="Net Annual Income (× 12)" combined={eur(derived.combined.netAnnual)} render={<>
          <span className="holder-row__cell">{eur(d1.netAnnual)}</span>
          {two ? <span className="holder-row__cell">{eur(d2.netAnnual)}</span> : emptyCell}
        </>} />
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
