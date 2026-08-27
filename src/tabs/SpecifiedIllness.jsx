import { useCalc } from '../state/CalculatorContext.jsx';
import { Card } from '../components/ui.jsx';
import { eur, num, years } from '../lib/format.js';
import useIsMobile from '../lib/useIsMobile.js';
import MobileSection from '../components/MobileSection.jsx';

export default function SpecifiedIllness() {
  const { inputs, derived, setHolder, setField } = useCalc();
  const isMobile = useIsMobile();
  const two = inputs.hasSecondHolder;
  const sic = derived.sic;
  const [h1, h2] = inputs.holders;

  // One definition per row, shared by the desktop grid and the mobile stacked layout.
  const ROWS = [
    { label: 'Current Age', val: (c) => num(c.age) },
    { label: 'Cease Age', val: () => num(inputs.assumptions.ceaseAge) },
    { label: 'Net Annual Income', val: (c) => eur(c.netAnnual) },
    { label: 'Existing SIC Cover', input: true },
    { label: 'Net Annual Loss', val: (c) => eur(c.netLoss) },
    { label: 'Minimum € Cover (Net Loss × 2)', val: (c) => eur(c.minCover) },
    { label: 'Quotation Lump Sum (→ nearest 500)', val: (c) => eur(c.quote) },
  ];

  const coverInput = (idx) => (
    <input className="input input--money" type="number" value={inputs.holders[idx].sicExistingCover}
      onChange={(e) => setHolder(idx, 'sicExistingCover', Number(e.target.value || 0))} />
  );

  const HeadCell = ({ children }) => <div>{children}</div>;
  const empty = <span className="holder-row__cell datarow__value--muted">—</span>;

  return (
    <>
      <div className="page-head">
        <h1>Specified Illness Cover</h1>
        <p>Recommended tax-free lump sum for a serious illness.</p>
      </div>

      <Card>
        {isMobile ? (
          [0, ...(two ? [1] : [])].map((idx) => {
            const c = idx === 0 ? sic.c1 : sic.c2;
            const h = inputs.holders[idx];
            return (
              <MobileSection key={idx} defaultOpen={idx === 0} title={h.name || `Client ${idx + 1}`}>
                {ROWS.map((r) => (
                  <div className="m-field" key={r.label}>
                    <span className="m-field__label">
                      {r.input && <span className="datarow__pencil">✎</span>}
                      {r.label}
                    </span>
                    {r.input
                      ? coverInput(idx)
                      : <span className="m-field__value">{r.val(c)}</span>}
                  </div>
                ))}
              </MobileSection>
            );
          })
        ) : (
          <>
            <div className="holder-head" style={{ gridTemplateColumns: two ? undefined : '1fr minmax(110px,1fr) minmax(110px,1fr)' }}>
              <HeadCell>Field</HeadCell>
              <HeadCell>{h1.name || 'Client 1'}</HeadCell>
              {two && <HeadCell>{h2.name || 'Client 2'}</HeadCell>}
            </div>
            {ROWS.map((r) => (
              <div className="holder-row" key={r.label}>
                <span className="holder-row__label">
                  {r.input && <span className="datarow__pencil">✎</span>}
                  {r.label}
                </span>
                {r.input ? coverInput(0) : (
                  <span className="holder-row__cell" style={{ fontWeight: 600, color: 'var(--color-purple)' }}>{r.val(sic.c1)}</span>
                )}
                {two
                  ? (r.input ? coverInput(1) : (
                      <span className="holder-row__cell" style={{ fontWeight: 600, color: 'var(--color-purple)' }}>{r.val(sic.c2)}</span>
                    ))
                  : empty}
              </div>
            ))}
          </>
        )}
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
