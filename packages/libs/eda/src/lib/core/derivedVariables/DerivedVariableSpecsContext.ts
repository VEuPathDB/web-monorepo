import { createContext } from 'react';
import { DerivedVariableSpec } from '../types/analysis';

/** The current supported derived variable specs, provided by DerivedVariablesProvider. */
export const DerivedVariableSpecsContext = createContext<DerivedVariableSpec[]>(
  []
);
