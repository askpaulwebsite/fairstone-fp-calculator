import { useState } from 'react';
import Login, { isAuthed, logout } from './components/Login.jsx';
import { CalculatorProvider } from './state/CalculatorContext.jsx';
import ClientDetails from './tabs/ClientDetails.jsx';
import IncomeProtection from './tabs/IncomeProtection.jsx';
import SpecifiedIllness from './tabs/SpecifiedIllness.jsx';
import LifeCover from './tabs/LifeCover.jsx';
import ResilienceSummary from './tabs/ResilienceSummary.jsx';
import MortgageVsLifeTerm from './tabs/MortgageVsLifeTerm.jsx';
import AdvisorDocuments from './tabs/AdvisorDocuments.jsx';

const TABS = [
  { id: 'client', label: 'Client Details', Comp: ClientDetails },
  { id: 'income', label: 'Income Protection', Comp: IncomeProtection },
  { id: 'sic', label: 'Specified Illness Cover', Comp: SpecifiedIllness },
  { id: 'life', label: 'Life Cover', Comp: LifeCover },
  {
    id: 'resilience',
    label: 'Financial Resilience Strategy',
    Comp: ResilienceSummary,
    props: {
      variant: 'recommended',
      title: 'Financial Resilience Strategy',
      subtitle: 'Recommended combined household protection summary.',
    },
  },
  {
    id: 'revised',
    label: 'Revised Resilience Strategy',
    Comp: ResilienceSummary,
    props: {
      variant: 'revised',
      title: 'Revised Financial Resilience Strategy',
      subtitle: 'Cover the client has chosen to proceed with (lower than recommended).',
    },
  },
  { id: 'mortgage', label: 'Mortgage vs Life Term', Comp: MortgageVsLifeTerm },
  { id: 'documents', label: 'Advisor Documents', Comp: AdvisorDocuments },
];

const initialTab = () => {
  const h = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === h) ? h : 'client';
};

export default function App() {
  const [authed, setAuthed] = useState(isAuthed);
  const [active, setActive] = useState(initialTab);
  const selectTab = (id) => {
    setActive(id);
    window.location.hash = id;
  };
  const activeTab = TABS.find((t) => t.id === active);
  const ActiveComp = activeTab.Comp;

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <CalculatorProvider>
      <div className="app">
        <header className="topbar">
          <img className="topbar__logo" src={`${import.meta.env.BASE_URL}Logo_FairstoneIreland_White.svg`} alt="Fairstone Ireland" />
          <div className="topbar__right">
            <span className="topbar__title">Financial Protection Calculator</span>
            <button className="topbar__logout" onClick={() => { logout(); setAuthed(false); }}>
              Sign out
            </button>
          </div>
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

          <ActiveComp {...(activeTab.props || {})} />
        </main>
      </div>
    </CalculatorProvider>
  );
}
