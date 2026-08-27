import { useState } from 'react';

// Collapsible per-client section used by the mobile layouts.
export default function MobileSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`m-holder m-holder--collapsible${open ? ' is-open' : ''}`}>
      <button type="button" className="m-holder__toggle" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        {title}
        <span className="m-holder__chevron" aria-hidden="true">▾</span>
      </button>
      {open && children}
    </section>
  );
}
