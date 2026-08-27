import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useCalc } from '../state/CalculatorContext.jsx';
import { Card, Field } from '../components/ui.jsx';
import { computeMortgageSeries } from '../lib/calc.js';
import { eur } from '../lib/format.js';
import useIsMobile from '../lib/useIsMobile.js';

export default function MortgageVsLifeTerm() {
  const { inputs, setField } = useCalc();
  const isMobile = useIsMobile();
  const { years, amount } = inputs.mortgage;
  const data = computeMortgageSeries(years, amount);

  return (
    <>
      <div className="page-head">
        <h1>Mortgage Protection vs Life / Convertible Term</h1>
        <p>How level term cover holds its value as a decreasing mortgage balance falls away.</p>
      </div>

      <Card>
        <div className="chart-controls">
          <Field label="Term (Years)">
            <input className="input input--money" type="number" value={years}
              onChange={(e) => setField(['mortgage', 'years'], Number(e.target.value || 0))} />
          </Field>
          <Field label="Mortgage Amount (€)">
            <input className="input input--money" type="number" value={amount}
              onChange={(e) => setField(['mortgage', 'amount'], Number(e.target.value || 0))} />
          </Field>
        </div>

        <div style={{ width: '100%', height: isMobile ? 320 : 420 }}>
          <ResponsiveContainer>
            <LineChart data={data}
              margin={isMobile
                ? { top: 12, right: 8, left: 0, bottom: 4 }
                : { top: 16, right: 24, left: 24, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,23,76,0.10)" />
              <XAxis dataKey="year" tick={{ fill: '#7C6992', fontSize: isMobile ? 11 : 12 }}
                label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: '#7C6992', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#7C6992', fontSize: isMobile ? 11 : 12 }} width={isMobile ? 48 : 70} />
              <Tooltip formatter={(v) => eur(v)} labelFormatter={(l) => `Year ${l}`}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(36,23,76,0.10)', fontFamily: 'Open Sans' }} />
              <Legend />
              <Line type="monotone" dataKey="mortgageProtection" name="Mortgage Protection"
                stroke="#F02D6E" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="lifeTerm" name="Life / Convertible Term"
                stroke="#29BB89" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="note">
          Mortgage protection reduces in line with the outstanding loan, whereas a level Life / Convertible
          term policy maintains {eur(amount)} of cover throughout the {years}-year term — leaving a growing
          surplus available to the family.
        </p>
      </Card>
    </>
  );
}
