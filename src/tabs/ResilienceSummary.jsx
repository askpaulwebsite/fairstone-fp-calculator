import { useCalc } from '../state/CalculatorContext.jsx';
import { shapeResilience } from '../lib/calc.js';
import { eur, eur2, pct } from '../lib/format.js';

// Editable override cell: shows the advisor's raw entry (blank = use recommended),
// with the recommended figure as the placeholder. Kept as a text/decimal input so
// intermediate values like "85." and decimals like "79.14" are not clobbered.
function EditCell({ raw, placeholder, onChange }) {
  return (
    <input
      className="input input--money rtable__input"
      type="text"
      inputMode="decimal"
      value={raw === null || raw === undefined ? '' : raw}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function ResilienceSummary({
  variant = 'recommended',
  title = 'Financial Resilience Strategy',
  subtitle = 'Combined household protection summary.',
}) {
  const { inputs, derived, setField } = useCalc();
  const two = inputs.hasSecondHolder;
  const revisedMode = variant === 'revised';
  const res = revisedMode ? derived.revisedResilience : derived.resilience;
  const shape = shapeResilience(res, two);
  const rec = shapeResilience(derived.resilience, two); // recommended → used as placeholders
  const rev = inputs.revised;
  const [h1, h2] = inputs.holders;
  const names = [h1.name || 'Client 1', h2.name || 'Client 2'];

  const setRev = (path, v) => setField(['revised', ...path], v);
  const resetRevised = () => setField(['revised'], {
    ipAnnual: [null, null], ipNetCost: [null, null],
    sicLump: [null, null], sicNetCost: null,
    lifeLump: [null, null], lifeNetCost: null,
  });

  // Render one client's 3 sub-cells for a product row.
  const clientCells = (row, ri, ci) => {
    const c = row.cells[ci];
    const recCell = rec.rows[ri].cells[ci];

    // Annual Cover — editable only for IP
    let annualCell = '';
    if (ri === 0) {
      annualCell = revisedMode
        ? <EditCell raw={rev.ipAnnual[ci]} placeholder={eur(recCell.annual)} onChange={(v) => setRev(['ipAnnual', ci], v)} />
        : eur(c.annual);
    }

    // Financial Resilience Value — derived for IP, editable lump for SIC/Life
    let resCell;
    if (ri === 0) {
      resCell = eur(c.res); // recomputed from annual cover
    } else if (revisedMode) {
      const path = ri === 1 ? ['sicLump', ci] : ['lifeLump', ci];
      const rawVal = ri === 1 ? rev.sicLump[ci] : rev.lifeLump[ci];
      resCell = <EditCell raw={rawVal} placeholder={eur(recCell.res)} onChange={(v) => setRev(path, v)} />;
    } else {
      resCell = eur(c.res);
    }

    // Net Cost — editable only for IP
    let costCell = '';
    if (ri === 0) {
      costCell = revisedMode
        ? <EditCell raw={rev.ipNetCost[ci]} placeholder={eur2(recCell.cost)} onChange={(v) => setRev(['ipNetCost', ci], v)} />
        : eur2(c.cost);
    }

    return (
      <>
        <td className="rtable__annual">{annualCell}</td>
        <td className="rtable__resval strong">{resCell}</td>
        <td className="rtable__cost">{costCell}</td>
      </>
    );
  };

  // Combined Premium cell — derived for IP, editable joint cost for SIC/Life.
  const combinedCell = (row, ri) => {
    if (!revisedMode || ri === 0) return eur2(row.combined);
    const path = ri === 1 ? ['sicNetCost'] : ['lifeNetCost'];
    const rawVal = ri === 1 ? rev.sicNetCost : rev.lifeNetCost;
    return <EditCell raw={rawVal} placeholder={eur2(rec.rows[ri].combined)} onChange={(v) => setRev(path, v)} />;
  };

  return (
    <>
      <div className="page-head">
        <h1 className={revisedMode ? 'title-revised' : undefined}>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {revisedMode && (
        <div className="revised-bar">
          <span>Enter the <strong>lower cover the client has chosen</strong>. Blank cells use the recommended figure (shown as a placeholder).</span>
          <button className="btn-secondary" onClick={resetRevised}>Reset to recommended</button>
        </div>
      )}

      <div className="metric-band">
        <div className={`metric ${revisedMode ? 'metric--red' : 'metric--green'}`}>
          <div className="metric__label">Combined Household Financial Resilience Value</div>
          <div className="metric__value">{eur(shape.combinedHousehold)}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Total Net Monthly Cost</div>
          <div className="metric__value">{eur2(shape.totalCombined)}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Premium as % of Net Take-Home</div>
          <div className="metric__value">{pct(shape.premiumPctNet)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="rtable">
            <thead>
              <tr>
                <th rowSpan={2} className="rtable__type">Financial Protection Type</th>
                <th rowSpan={2}>Cover Until</th>
                <th rowSpan={2}>Benefit</th>
                <th colSpan={3} className="rtable__client">{names[0]}</th>
                {two && <th colSpan={3} className="rtable__client">{names[1]}</th>}
                <th className="rtable__combined">Combined Premium</th>
              </tr>
              <tr>
                <th>Annual Cover</th><th>Financial Resilience Value</th><th>Net Cost</th>
                {two && <><th>Annual Cover</th><th>Financial Resilience Value</th><th>Net Cost</th></>}
                <th className="rtable__combined">Total Net monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {shape.rows.map((row, ri) => (
                <tr key={row.key}>
                  <td className="rtable__type strong">{row.type}</td>
                  <td>{row.coverLabel} <strong>{row.coverValue ?? '—'}</strong></td>
                  <td>{row.benefit}</td>
                  {clientCells(row, ri, 0)}
                  {two && clientCells(row, ri, 1)}
                  <td className="rtable__combined strong">{combinedCell(row, ri)}</td>
                </tr>
              ))}
              <tr className="rtable__total">
                <td colSpan={3}>Total</td>
                <td></td><td className="strong">{eur(shape.totalsPerClient[0])}</td><td></td>
                {two && <><td></td><td className="strong">{eur(shape.totalsPerClient[1])}</td><td></td></>}
                <td className="strong">{eur2(shape.totalCombined)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rtable__figures">
          <div className="rtable__figure">
            <span className="rtable__figure-label">Combined Household Financial Resilience Value</span>
            <span className={`rtable__figure-value ${revisedMode ? 'is-red' : ''}`}>{eur(shape.combinedHousehold)}</span>
          </div>
          <div className="rtable__figure">
            <span className="rtable__figure-label">Actual premium cost as a % of net take home income</span>
            <span className="rtable__figure-value">{pct(shape.premiumPctNet, 2)}</span>
          </div>
        </div>

        <p className="note">
          *Any premiums quoted are indicative for the purposes of illustration only. Premiums are subject to a
          completed application form and the provider may require additional health screening information. This
          further information and assessment may increase the cost of cover.
        </p>
      </div>
    </>
  );
}
