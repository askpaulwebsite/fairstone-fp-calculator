import { useState } from 'react';
import { CalculatorProvider } from './state/CalculatorContext.jsx';
import ClientDetails from './tabs/ClientDetails.jsx';
import IncomeProtection from './tabs/IncomeProtection.jsx';
import SpecifiedIllness from './tabs/SpecifiedIllness.jsx';
import LifeCover from './tabs/LifeCover.jsx';
import ResilienceSummary from './tabs/ResilienceSummary.jsx';
import MortgageVsLifeTerm from './tabs/MortgageVsLifeTerm.jsx';

const TABS = [
  { id: 'client', label: 'Client Details', Comp: ClientDetails },
  { id: 'income', label: 'Income Protection', Comp: IncomeProtection },
  { id: 'sic', label: 'Specified Illness Cover', Comp: SpecifiedIllness },
  { id: 'life', label: 'Life Cover', Comp: LifeCover },
  { id: 'resilience', label: 'Resilience Summary', Comp: ResilienceSummary },
  { id: 'mortgage', label: 'Mortgage vs Life Term', Comp: MortgageVsLifeTerm },
];

const initialTab = () => {
  const h = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === h) ? h : 'client';
};

export default function App() {
  const [active, setActive] = useState(initialTab);
  const selectTab = (id) => {
    setActive(id);
    window.location.hash = id;
  };
  const ActiveComp = TABS.find((t) => t.id === active).Comp;

  return (
    <CalculatorProvider>
      <div className="app">
        <header className="topbar">
          <img className="topbar__logo" src={`${import.meta.env.BASE_URL}Logo_FairstoneIreland_White.svg`} alt="Fairstone Ireland" />
          <span className="topbar__title">Financial Protection Calculator</span>
        </header>

        <main className="main">
          <nav className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={active === t.id}
                className={`tab${active === t.id ? ' tab--active' : ''}`}
                onClick={() => selectTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <ActiveComp />
        </main>
      </div>
    </CalculatorProvider>
  );
}
