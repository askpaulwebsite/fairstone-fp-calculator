import { useCalc } from '../state/CalculatorContext.jsx';
import { Card } from '../components/ui.jsx';
import { eur, num, years } from '../lib/format.js';

export default function SpecifiedIllness() {
  const { inputs, derived, setHolder, setField } = useCalc();
  const two = inputs.hasSecondHolder;
  const sic = derived.sic;
  const [h1, h2] = inputs.holders;

  const HeadCell = ({ children }) => <div>{children}</div>;
  const empty = <span className="holder-row__cell datarow__value--muted">—</span>;

  const derivedRow = (label, v1, v2) => (
    <div className="holder-row">
      <span className="holder-row__label">{label}</span>
      <span className="holder-row__cell" style={{ fontWeight: 600, color: 'var(--color-purple)' }}>{v1}</span>
      {two ? <span className="holder-row__cell" style={{ fontWeight: 600, color: 'var(--color-purple)' }}>{v2}</span> : empty}
    </div>
  );

  const existingRow = (
    <div className="holder-row">
      <span className="holder-row__label"><span className="datarow__pencil">✎</span> Existing SIC Cover</span>
      <input className="input input--money" type="number" value={h1.sicExistingCover}
        onChange={(e) => setHolder(0, 'sicExistingCover', Number(e.target.value || 0))} />
      {two ? (
        <input className="input input--money" type="number" value={h2.sicExistingCover}
          onChange={(e) => setHolder(1, 'sicExistingCover', Number(e.target.value || 0))} />
      ) : empty}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <h1>Specified Illness Cover</h1>
        <p>Recommended tax-free lump sum for a serious illness.</p>
      </div>

      <Card>
        <div className="holder-head" style={{ gridTemplateColumns: two ? undefined : '1fr minmax(110px,1fr) minmax(110px,1fr)' }}>
          <HeadCell>Field</HeadCell>
          <HeadCell>{h1.name || 'Client 1'}</HeadCell>
          {two && <HeadCell>{h2.name || 'Client 2'}</HeadCell>}
        </div>

        {derivedRow('Current Age', num(sic.c1.age), num(sic.c2.age))}
        {derivedRow('Cease Age', num(inputs.assumptions.ceaseAge), num(inputs.assumptions.ceaseAge))}
        {derivedRow('Net Annual Income', eur(sic.c1.netAnnual), eur(sic.c2.netAnnual))}
        {existingRow}
        {derivedRow('Net Annual Loss', eur(sic.c1.netLoss), eur(sic.c2.netLoss))}
        {derivedRow('Minimum € Cover (Net Loss × 2)', eur(sic.c1.minCover), eur(sic.c2.minCover))}
        {derivedRow('Quotation Lump Sum (→ nearest 500)', eur(sic.c1.quote), eur(sic.c2.quote))}
      </Card>

      <div className="grid-2">
        <Card title="Joint Policy Terms">
          <div className="datarow">
            <span className="datarow__label">Term in Years (to cease age / age 69 conversion)</span>
            <span className="datarow__value">{sic.term === null ? '—' : years(sic.term)}</span>
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Total Monthly Premium</span>
            <input className="input input--money" type="number" value={inputs.sicJointPremium}
              onChange={(e) => setField(['sicJointPremium'], Number(e.target.value || 0))} />
          </div>
        </Card>
        <Card title="Recommendation" accent>
          <div className="datarow datarow--total">
            <span className="datarow__label">{h1.name || 'Client 1'} lump sum</span>
            <span className="datarow__value">{eur(sic.c1.quote)}</span>
          </div>
          {two && (
            <div className="datarow datarow--total">
              <span className="datarow__label">{h2.name || 'Client 2'} lump sum</span>
              <span className="datarow__value">{eur(sic.c2.quote)}</span>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
