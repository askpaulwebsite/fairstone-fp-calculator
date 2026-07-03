// ---------------------------------------------------------------------------
// Financial Protection Calculator — calculation engine
// Ported 1:1 from "Financial Protection Calculator Tool FINAL.xlsx", with
// guards so missing data yields blanks/0 instead of #DIV/0!, negative cover
// or absurd ages. Every derived field notes its source Excel cell.
// ---------------------------------------------------------------------------
import { datedifY, ceilingTo, toNum } from './format.js';

const TAX_RELIEF = 0.40; // Income Protection tax relief (Excel G20/G41)

// A blank holder template (used for holder 1 = Jack and holder 2).
function makeHolder(name = '') {
  return {
    name,
    dob: '',              // Client Details F9 / H9
    occupationClass: '',  // F11 / H11
    smoker: 'No',         // F13 / H13
    grossAnnualIncome: 0, // F14 / H14
    netMonthlyIncome: 0,  // F16 / H16

    // Income Protection
    ipExistingCover: 0,   // G10 / G32
    ipRows: [
      // Row 1 (primary): gross payable is derived from maxCover/12 → grossPayable=null
      { grossPayable: null, premium: 0, discount: 0.10 },
      // Row 2 (illustration scenario): gross payable editable
      { grossPayable: 0, premium: 0, discount: 0.10 },
    ],

    // Specified Illness Cover
    sicExistingCover: 0,  // K16 / M16

    // Life Cover
    lifeLoanSaving: 0,     // K13 / M13 (annual)
    lifeDeathInService: 0, // K33 / M33
    lifeOtherCover: 0,     // K34 / M34
    lifePremium: 0,        // K45
    lifeDiscount: 0.10,    // K46
  };
}

export function makeDefaultInputs() {
  return {
    assumptions: {
      stateIllnessBenefit: 13208, // Client Details F20
      stateWidowsPension: 13494,  // Client Details F21
      ceaseAge: 66,               // Income Protection D13
    },
    household: {
      youngestChildAge: 0, // Client Details F12
      mortgageMonthly: 0,  // Client Details F17
    },
    holders: [makeHolder('Client 1'), makeHolder('Client 2')],
    sicJointPremium: 0,   // Specified Illness K29 (single joint premium)
    mortgage: { years: 30, amount: 380000 }, // Mortgage p. vs life term B4 / C4
    hasSecondHolder: false,
  };
}

// --------------------------- per-holder derivations ------------------------
function computeHolder(h, a, household, today) {
  const gross = toNum(h.grossAnnualIncome);
  const netMonthly = toNum(h.netMonthlyIncome);
  const netAnnual = netMonthly * 12;                 // F15 = F16*12
  const age = datedifY(h.dob, today);                // F10 = DATEDIF(F9,TODAY,"Y")
  const mortgagePa = toNum(household.mortgageMonthly) * 12; // F18 = F17*12

  // ---- Income Protection ----
  const p75 = gross * 0.75;                          // G8 = G7*75%
  const maxCoverRaw = p75 - a.stateIllnessBenefit - toNum(h.ipExistingCover); // G11
  const ipMaxCover = Math.max(0, maxCoverRaw);       // guard: no negative cover
  const ipAfterTax = ipMaxCover * 0.70;              // G12 = G11*70%
  const ipTermToCease = age === null ? null : Math.max(0, a.ceaseAge - age); // D14 = D13-age
  const ipMonthlyGross = ipMaxCover / 12;            // C20 = G11/12
  const ipPotentialEarnings =
    age === null ? null : gross * Math.max(0, a.ceaseAge - age); // E16

  const ipRows = h.ipRows.map((r, i) => {
    const grossPayable = i === 0 ? ipMonthlyGross : toNum(r.grossPayable);
    const premium = toNum(r.premium);
    const discount = toNum(r.discount);
    const afterDiscount = premium * (1 - discount);            // F = D*(1-E)
    const netPremium = afterDiscount * (1 - TAX_RELIEF);       // H = F*(1-G)
    const netCostPct = netMonthly > 0 ? netPremium / netMonthly : null; // I = H/F16 (guard)
    return { grossPayable, premium, discount, taxRelief: TAX_RELIEF, afterDiscount, netPremium, netCostPct };
  });
  const ipPrimaryNet = ipRows[0].netPremium; // H20 → used by Resilience summary

  // ---- Life Cover ----
  const A = netAnnual;                                    // K7
  const widows = a.stateWidowsPension * 0.60;             // K11 = F21*60%
  const mortgageSaving = mortgagePa;                      // K12 = F18
  const loanSaving = toNum(h.lifeLoanSaving);             // K13
  const futureLiving = A * 0.20;                          // K15 = K7*20%
  const B = widows + mortgageSaving + loanSaving + futureLiving; // K17
  const C = A - B;                                        // K19 = K7-K17
  const D = Math.max(0, 25 - toNum(household.youngestChildAge)); // K24 = 25-F12
  const E = Math.max(0, C * D);                           // K26 = K19*K24 (guard >= 0)
  const addLump = Math.max(E * 0.05, 20000);             // K28 = MAX(E*5%,20000)
  const totalRequired = E + addLump;                     // K30
  const lifeExisting = toNum(h.lifeDeathInService) + toNum(h.lifeOtherCover); // K35
  const shortfallRaw = totalRequired - lifeExisting;
  const lifeShortfall = shortfallRaw <= 0 ? 0 : Math.max(shortfallRaw, 12000); // K38
  const lifeQuote = ceilingTo(lifeShortfall, 500);       // K42 = CEILING(K38,500)
  const lifeTerm = D;                                    // K40/K43
  const lifePremium = toNum(h.lifePremium);              // K45
  const lifeDiscount = toNum(h.lifeDiscount);            // K46
  const lifePremiumAfterDiscount = lifePremium * (1 - lifeDiscount); // K47

  return {
    gross, netMonthly, netAnnual, age, mortgagePa,
    ip: {
      p75, maxCover: ipMaxCover, afterTax: ipAfterTax, termToCease: ipTermToCease,
      monthlyGross: ipMonthlyGross, potentialEarnings: ipPotentialEarnings,
      stateBenefit: a.stateIllnessBenefit, existingCover: toNum(h.ipExistingCover),
      rows: ipRows, primaryNet: ipPrimaryNet,
    },
    life: {
      A, widows, mortgageSaving, loanSaving, futureLiving, B, C, D, E,
      addLump, totalRequired, existing: lifeExisting, shortfall: lifeShortfall,
      quote: lifeQuote, term: lifeTerm,
      premium: lifePremium, discount: lifeDiscount, premiumAfterDiscount: lifePremiumAfterDiscount,
    },
  };
}

// --------------------------- Specified Illness (joint) ---------------------
function computeSIC(inputs, holders) {
  const a = inputs.assumptions;
  const rowFor = (h, hd) => {
    const netLoss = Math.max(0, h.netAnnual - toNum(hd.sicExistingCover)); // K18 = K11-K16
    const minCover = netLoss * 2;                                          // K21 = K18*2
    const quote = ceilingTo(minCover, 500);                                // K26
    return { age: h.age, netAnnual: h.netAnnual, existing: toNum(hd.sicExistingCover), netLoss, minCover, quote };
  };
  const c1 = rowFor(holders[0], inputs.holders[0]);
  const c2 = rowFor(holders[1], inputs.holders[1]);

  // Joint term: MAX(0, MIN(cease-min(age), 69-max(age)))  (Excel K27)
  const ages = [c1.age, c2.age].filter((x) => x !== null);
  let term = null;
  if (inputs.hasSecondHolder && ages.length === 2) {
    term = Math.max(0, Math.min(a.ceaseAge - Math.min(...ages), 69 - Math.max(...ages)));
  } else if (ages.length >= 1) {
    const age = ages[0];
    term = Math.max(0, Math.min(a.ceaseAge - age, 69 - age));
  }
  return { c1, c2, term, jointPremium: toNum(inputs.sicJointPremium) };
}

// --------------------------- Resilience summary ----------------------------
function computeResilience(inputs, holders, sic) {
  const a = inputs.assumptions;
  const resValueIP = (h) =>
    h.age === null ? 0 : h.ip.maxCover * (a.ceaseAge - h.age) - h.ip.maxCover; // K8

  const c1 = holders[0];
  const c2 = holders[1];

  const rows = {
    ip: {
      annual1: c1.ip.maxCover, res1: resValueIP(c1), cost1: c1.ip.primaryNet,       // J8/K8/L8
      annual2: c2.ip.maxCover, res2: resValueIP(c2), cost2: c2.ip.primaryNet,       // N8/P8/Q8
    },
    sic: {
      res1: sic.c1.quote, res2: sic.c2.quote,                                        // K9/P9
      cost: sic.jointPremium,                                                        // S9
    },
    life: {
      res1: c1.life.quote, res2: c2.life.quote,                                      // K10/P10
      cost: c1.life.premiumAfterDiscount,                                            // S10 (holder1)
    },
  };

  const total1 = rows.ip.res1 + rows.sic.res1 + rows.life.res1;                      // K12
  const total2 = inputs.hasSecondHolder ? rows.ip.res2 + rows.sic.res2 + rows.life.res2 : 0; // P12
  const netMonthlyCost =
    (rows.ip.cost1 + (inputs.hasSecondHolder ? rows.ip.cost2 : 0)) +
    rows.sic.cost + rows.life.cost;                                                  // S12
  const combinedHousehold = total1 + total2;                                         // L16

  const householdNetMonthly = c1.netMonthly + (inputs.hasSecondHolder ? c2.netMonthly : 0); // J16
  const premiumPctNet = householdNetMonthly > 0 ? netMonthlyCost / householdNetMonthly : null; // L19

  return { rows, total1, total2, netMonthlyCost, combinedHousehold, premiumPctNet };
}

// --------------------------- Mortgage vs life term -------------------------
export function computeMortgageSeries(years, amount) {
  const yrs = Math.max(1, Math.round(toNum(years)));
  const amt = toNum(amount);
  const series = [];
  for (let n = 0; n <= yrs; n++) {
    // Excel: (-C4/B4^2)*n^2 + C4  → parabolic decay to 0 at year `years`
    const mortgageProtection = Math.max(0, (-amt / (yrs * yrs)) * n * n + amt);
    series.push({ year: n, mortgageProtection, lifeTerm: amt });
  }
  return series;
}

// --------------------------- top-level ------------------------------------
export function computeAll(inputs, today = new Date()) {
  const a = inputs.assumptions;
  const holders = inputs.holders.map((h) =>
    computeHolder(h, a, inputs.household, today)
  );
  const sic = computeSIC(inputs, holders);
  const resilience = computeResilience(inputs, holders, sic);

  // Client Details combined totals (J14/J15/J16)
  const combined = {
    grossAnnual: holders[0].gross + (inputs.hasSecondHolder ? holders[1].gross : 0),
    netAnnual: holders[0].netAnnual + (inputs.hasSecondHolder ? holders[1].netAnnual : 0),
    netMonthly: holders[0].netMonthly + (inputs.hasSecondHolder ? holders[1].netMonthly : 0),
  };

  return { holders, sic, resilience, combined, mortgagePa: holders[0].mortgagePa };
}
