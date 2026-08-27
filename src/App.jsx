import { useEffect, useState } from 'react';
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

const NAV_ITEMS = [
  { tab: 'client' },
  { tab: 'income' },
  { tab: 'sic' },
  { tab: 'life' },
  {
    group: 'Resilience Strategy',
    items: [
      { id: 'resilience', label: 'Financial' },
      { id: 'revised', label: 'Revised' },
    ],
  },
  { tab: 'mortgage' },
  { tab: 'documents' },
];

const initialTab = () => {
  const h = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === h) ? h : 'client';
};

export default function App() {
  const [authed, setAuthed] = useState(isAuthed);
  const [active, setActive] = useState(initialTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const selectTab = (id) => {
    setActive(id);
    setMenuOpen(false);
    window.location.hash = id;
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);
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
            <button
              className={`topbar__burger${menuOpen ? ' is-open' : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span /><span />
            </button>
          </div>
        </header>

        <div className={`drawer${menuOpen ? ' drawer--open' : ''}`} aria-hidden={!menuOpen}>
          <div className="drawer__backdrop" onClick={() => setMenuOpen(false)} />
          <nav className="drawer__panel" aria-label="Sections">
            <div className="drawer__eyebrow">Financial Protection Calculator</div>
            {NAV_ITEMS.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              if (item.group) {
                return (
                  <div key={item.group} className="drawer__section" style={{ '--i': i }}>
                    <div className="drawer__section-label">
                      <span className="drawer__num">{num}</span>
                      {item.group}
                    </div>
                    {item.items.map((s) => (
                      <button
                        key={s.id}
                        className={`drawer__link drawer__link--sub${active === s.id ? ' is-active' : ''}`}
                        onClick={() => selectTab(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                );
              }
              const t = TABS.find((x) => x.id === item.tab);
              return (
                <button
                  key={t.id}
                  className={`drawer__link${active === t.id ? ' is-active' : ''}`}
                  style={{ '--i': i }}
                  onClick={() => selectTab(t.id)}
                >
                  <span className="drawer__num">{num}</span>
                  {t.label}
                </button>
              );
            })}
            <button className="drawer__signout" onClick={() => { logout(); setAuthed(false); }}>
              Sign out
            </button>
          </nav>
        </div>

        <main className="main">
          <nav className="tabs" role="tablist">
            {NAV_ITEMS.map((item) => {
              if (item.group) {
                const groupActive = item.items.some((s) => s.id === active);
                return (
                  <div
                    key={item.group}
                    className={`tab tab--group${groupActive ? ' tab--active' : ''}`}
                    tabIndex={0}
                  >
                    {item.group}
                    <span className="tab__caret" aria-hidden="true">▾</span>
                    <div className="tab__menu" role="menu">
                      {item.items.map((s) => (
                        <button
                          key={s.id}
                          role="tab"
                          aria-selected={active === s.id}
                          className={`tab__menu-item${active === s.id ? ' tab__menu-item--active' : ''}`}
                          onClick={() => selectTab(s.id)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              const t = TABS.find((x) => x.id === item.tab);
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active === t.id}
                  className={`tab${active === t.id ? ' tab--active' : ''}`}
                  onClick={() => selectTab(t.id)}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          <ActiveComp {...(activeTab.props || {})} />
        </main>
      </div>
    </CalculatorProvider>
  );
}
