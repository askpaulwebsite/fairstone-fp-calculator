# Fairstone · Financial Protection Calculator

Interactive web version of the *Financial Protection Calculator Tool* (Excel),
rebuilt in React with the Fairstone Ireland Client Portal branding.

Six tabs, all recalculating live from the **Client Details** inputs:

1. **Client Details** — household inputs (1 or 2 holders), state-benefit assumptions.
2. **Income Protection** — max allowable cover + premium illustration.
3. **Specified Illness Cover** — recommended tax-free lump sum (joint policy).
4. **Life Cover** — A−B−C−D−E capital-need breakdown.
5. **Resilience Summary** — combined household resilience value & monthly cost.
6. **Mortgage vs Life Term** — decreasing mortgage balance vs level term (chart).

## Stack
- Vite + React 18 (JavaScript)
- Plain CSS with the portal's design tokens (`src/styles/tokens.css`)
- Recharts (mortgage comparison chart only)

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Where the numbers come from
All formulas are ported 1:1 from the spreadsheet in `src/lib/calc.js`, with guards
so missing data yields blanks/€0 instead of `#DIV/0!`, negative cover or absurd ages.
Each derived value is annotated with its source Excel cell.

Tabs are deep-linkable via URL hash, e.g. `/#life`, `/#mortgage`.

## Notes on faithful quirks
- The spreadsheet applies **Client 1's** State Widow's Pension to both holders in Life
  Cover (a household assumption) — replicated and commented in `computeHolder`.
- The two identical Excel resilience tabs are consolidated into one **Resilience Summary**.
