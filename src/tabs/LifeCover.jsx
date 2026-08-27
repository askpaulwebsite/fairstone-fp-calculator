import { useCalc } from '../state/CalculatorContext.jsx';
import { Card, DataRow } from '../components/ui.jsx';
import { eur, eur2, years } from '../lib/format.js';
import useIsMobile from '../lib/useIsMobile.js';
import MobileSection from '../components/MobileSection.jsx';

function HolderBlock({ idx }) {
  const { inputs, derived, setHolder } = useCalc();
  const isMobile = useIsMobile();
  const h = inputs.holders[idx];
  const L = derived.holders[idx].life;

  const moneyInput = (key) => (
    <input className="input input--money" type="number" value={h[key]}
      onChange={(e) => setHolder(idx, key, Number(e.target.value || 0))} />
  );

  const body = (
    <>
      <div className="grid-2">
        <div>
          <DataRow label="Net Annual After-Tax Income (A)" value={eur(L.A)} />
          <p className="card__subtitle" style={{ margin: '12px 0 4px' }}>Annual income gains on death</p>
          <DataRow label="State Widow's Pension (60%)" value={eur(L.widows)} muted />
          <DataRow label="Savings in Mortgage Repayments" value={eur(L.mortgageSaving)} muted />
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Savings in Loan Repayments (p.a.)</span>
            {moneyInput('lifeLoanSaving')}
          </div>
          <DataRow label="Savings in Future Living Expenses (20%)" value={eur(L.futureLiving)} muted />
          <DataRow label="Total Gross Gain (B)" value={eur(L.B)} total />
          <DataRow label="Net Income to Replace (A − B = C)" value={eur(L.C)} />
        </div>
        <div>
          <DataRow label="Years until youngest child reaches 25 (D)" value={years(L.D)} />
          <DataRow label="Capital to Replace Income (C × D = E)" value={eur(L.E)} />
          <DataRow label="Additional Lump Sum (max 5% or €20k)" value={eur(L.addLump)} />
          <DataRow label="Total Life Cover Required" value={eur(L.totalRequired)} total />
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Existing Death in Service</span>
            {moneyInput('lifeDeathInService')}
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Other Personal Life Cover</span>
            {moneyInput('lifeOtherCover')}
          </div>
          <DataRow label="Total Existing Cover (F)" value={eur(L.existing)} muted />
          <DataRow label="Shortfall / Recommendation (E − F = G)" value={eur(L.shortfall)} total />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <Card accent>
          <DataRow label="Quotation Lump Sum (→ nearest 500)" value={eur(L.quote)} />
          <DataRow label="Minimum Term" value={years(L.term)} />
        </Card>
        <Card>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Total Monthly Premium</span>
            {moneyInput('lifePremium')}
          </div>
          <div className="input-inline">
            <span className="input-inline__label"><span className="datarow__pencil">✎</span> Discount</span>
            <input className="input input--money" type="number" step="0.05" value={h.lifeDiscount}
              onChange={(e) => setHolder(idx, 'lifeDiscount', Number(e.target.value || 0))} />
          </div>
          <DataRow label="Premium after Discount" value={eur2(L.premiumAfterDiscount)} total />
        </Card>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Card>
        <MobileSection title={h.name || `Client ${idx + 1}`} defaultOpen={idx === 0}>
          {body}
        </MobileSection>
      </Card>
    );
  }
  return <Card title={`${h.name || `Client ${idx + 1}`} — Life Cover Calculation`}>{body}</Card>;
}

export default function LifeCover() {
  const { inputs } = useCalc();
  return (
    <>
      <div className="page-head">
        <h1>Life Cover</h1>
        <p>Capital required to replace income and clear liabilities on death.</p>
      </div>
      <HolderBlock idx={0} />
      {inputs.hasSecondHolder && <HolderBlock idx={1} />}
    </>
  );
}
