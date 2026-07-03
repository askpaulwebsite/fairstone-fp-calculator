import { useCalc } from '../state/CalculatorContext.jsx';
import { Card, DataRow } from '../components/ui.jsx';
import { eur, eur2, pct, years, num } from '../lib/format.js';

function HolderBlock({ idx }) {
  const { inputs, derived, setHolder, setIpRow } = useCalc();
  const h = inputs.holders[idx];
  const d = derived.holders[idx];
  const ip = d.ip;

  return (
    <Card title={`${h.name || `Client ${idx + 1}`} — Quotation Summary`}>
      <div className="grid-2">
        <div>
          <DataRow label="Gross Annual Income" value={eur(d.gross)} muted />
          <DataRow label="75% of Gross Annual Income" value={eur(ip.p75)} />
          <DataRow label="Annual State Illness Benefit" value={eur(ip.stateBenefit)} muted />
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Existing Cover in place</span>
            <input className="input input--money" type="number" value={h.ipExistingCover}
              onChange={(e) => setHolder(idx, 'ipExistingCover', Number(e.target.value || 0))} />
          </div>
          <DataRow label="Maximum Allowable Cover" value={eur(ip.maxCover)} total />
          <DataRow label="After Tax Estimate (70%)" value={eur(ip.afterTax)} />
        </div>
        <div>
          <DataRow label="Deferred Period (Private Sector)" value="13 Weeks" muted />
          <DataRow label="Deferred Period (Public Sector)" value="26 Weeks" muted />
          <DataRow label="Cease Age" value={num(inputs.assumptions.ceaseAge)} muted />
          <DataRow label="Term to Cease Age" value={ip.termToCease === null ? '—' : years(ip.termToCease)} />
          <DataRow label="Monthly Gross Income Payable" value={eur2(ip.monthlyGross)} />
          <DataRow label="Potential earnings to cease age" value={eur(ip.potentialEarnings)} muted />
        </div>
      </div>

      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-purple)', margin: '20px 0 8px' }}>
        Premium illustration
      </h4>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Monthly Gross Income Payable</th>
              <th>Monthly Premium</th>
              <th>Discount %</th>
              <th>Less Discount</th>
              <th>Tax Relief %</th>
              <th>Net Premium</th>
              <th>% of Take-Home</th>
            </tr>
          </thead>
          <tbody>
            {ip.rows.map((r, ri) => (
              <tr key={ri} className={ri === 0 ? 'highlight' : ''}>
                <td className="strong">
                  {ri === 0 ? (
                    eur2(r.grossPayable)
                  ) : (
                    <input className="input input--money" style={{ maxWidth: 120 }} type="number"
                      value={h.ipRows[ri].grossPayable}
                      onChange={(e) => setIpRow(idx, ri, 'grossPayable', Number(e.target.value || 0))} />
                  )}
                </td>
                <td>
                  <input className="input input--money" style={{ maxWidth: 110 }} type="number"
                    value={h.ipRows[ri].premium}
                    onChange={(e) => setIpRow(idx, ri, 'premium', Number(e.target.value || 0))} />
                </td>
                <td>
                  <input className="input input--money" style={{ maxWidth: 80 }} type="number" step="0.05"
                    value={h.ipRows[ri].discount}
                    onChange={(e) => setIpRow(idx, ri, 'discount', Number(e.target.value || 0))} />
                </td>
                <td>{eur2(r.afterDiscount)}</td>
                <td>{pct(r.taxRelief, 0)}</td>
                <td className="strong">{eur2(r.netPremium)}</td>
                <td>{pct(r.netCostPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="card__subtitle" style={{ margin: '8px 0 0' }}>
        Row 1 (highlighted) is the recommended maximum cover and feeds the Resilience Summary.
      </p>
    </Card>
  );
}

export default function IncomeProtection() {
  const { inputs } = useCalc();
  return (
    <>
      <div className="page-head">
        <h1>Income Protection</h1>
        <p>Calculations and quotation summary.</p>
      </div>
      <HolderBlock idx={0} />
      {inputs.hasSecondHolder && <HolderBlock idx={1} />}
    </>
  );
}
