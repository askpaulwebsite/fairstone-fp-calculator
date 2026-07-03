import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { makeDefaultInputs, computeAll } from '../lib/calc.js';

const CalculatorContext = createContext(null);

export function CalculatorProvider({ children }) {
  const [inputs, setInputs] = useState(makeDefaultInputs);

  // Generic path setter, e.g. setField(['holders', 0, 'grossAnnualIncome'], 60000)
  const setField = useCallback((path, value) => {
    setInputs((prev) => {
      const next = structuredClone(prev);
      let node = next;
      for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  }, []);

  const setHolder = useCallback((idx, key, value) => {
    setField(['holders', idx, key], value);
  }, [setField]);

  const setIpRow = useCallback((holderIdx, rowIdx, key, value) => {
    setField(['holders', holderIdx, 'ipRows', rowIdx, key], value);
  }, [setField]);

  const derived = useMemo(() => computeAll(inputs), [inputs]);

  const value = useMemo(
    () => ({ inputs, derived, setField, setHolder, setIpRow, setInputs }),
    [inputs, derived, setField, setHolder, setIpRow]
  );

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalc() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalc must be used within CalculatorProvider');
  return ctx;
}
