import { useCalc } from '../state/CalculatorContext.jsx';
import { Card } from '../components/ui.jsx';
import { eur, eur2, pct } from '../lib/format.js';

export default function ResilienceSummary({
  title = 'Financial Resilience Strategy',
  subtitle = 'Combined household protection summary.',
}) {
  const { inputs, derived } = useCalc();
  const two = inputs.hasSecondHolder;
  const r = derived.resilience;
  const [h1, h2] = inputs.holders;

  return (
    <>
      <div className="page-head">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="metric-band">
        <div className="metric metric--green">
          <div className="metric__label">Combined Household Financial Resilience Value</div>
          <div className="metric__value">{eur(r.combinedHousehold)}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Total Net Monthly Cost</div>
          <div className="metric__value">{eur2(r.netMonthlyCost)}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Premium as % of Net Take-Home</div>
          <div className="metric__value">{pct(r.premiumPctNet)}</div>
        </div>
      </div>

      <Card>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Protection Type</th>
                <th>Cover Until</th>
                <th>{h1.name || 'Client 1'} Cover</th>
                <th>{h1.name || 'Client 1'} Resilience Value</th>
                {two && <th>{h2.name || 'Client 2'} Cover</th>}
                {two && <th>{h2.name || 'Client 2'} Resilience Value</th>}
                <th>Net Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="strong">Income Protection</td>
                <td>Cease Age</td>
                <td>{eur(r.rows.ip.annual1)}</td>
                <td>{eur(r.rows.ip.res1)}</td>
                {two && <td>{eur(r.rows.ip.annual2)}</td>}
                {two && <td>{eur(r.rows.ip.res2)}</td>}
                <td>{eur2(r.rows.ip.cost1 + (two ? r.rows.ip.cost2 : 0))}</td>
              </tr>
              <tr>
                <td className="strong">Specified Illness Cover</td>
                <td>Term</td>
                <td>{eur(r.rows.sic.res1)}</td>
                <td>{eur(r.rows.sic.res1)}</td>
                {two && <td>{eur(r.rows.sic.res2)}</td>}
                {two && <td>{eur(r.rows.sic.res2)}</td>}
                <td>{eur2(r.rows.sic.cost)}</td>
              </tr>
              <tr>
                <td className="strong">Life Cover</td>
                <td>Term</td>
                <td>{eur(r.rows.life.res1)}</td>
                <td>{eur(r.rows.life.res1)}</td>
                {two && <td>{eur(r.rows.life.res2)}</td>}
                {two && <td>{eur(r.rows.life.res2)}</td>}
                <td>{eur2(r.rows.life.cost)}</td>
              </tr>
              <tr className="highlight">
                <td className="strong">Total</td>
                <td></td>
                <td></td>
                <td className="strong">{eur(r.total1)}</td>
                {two && <td></td>}
                {two && <td className="strong">{eur(r.total2)}</td>}
                <td className="strong">{eur2(r.netMonthlyCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="note">
          *Any premiums quoted are indicative for illustration only. Premiums are subject to a completed
          application form and the provider may require additional health screening information. This further
          information and assessment may increase the cost of cover.
        </p>
      </Card>
    </>
  );
}
