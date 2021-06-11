import { CompleteCasesTable } from '../api/data-api';
import { Variable } from '../types/variable';

export interface Props {
  completeCases?: CompleteCasesTable;
  filteredEntityCounts?: Record<string, number>;
  variables: VariableSpec[];
}

export type VariableSpec =
  | { selected: true; spec: SelectedVariableSpec }
  | { selected: false; spec: UnselectedVariableSpec };

export interface UnselectedVariableSpec {
  role: VariableRole;
}

export interface SelectedVariableSpec extends UnselectedVariableSpec, Variable {
  display: VariableDisplay;
}

export interface VariableCoverageTableRow {
  role: VariableRole;
  display?: VariableDisplay;
  /* count of entities which have the variable */
  complete?: number;
  /* count of entities which are missing the variable */
  incomplete?: number;
  /* total count of entities */
  total?: number;
}

/* A short description of the variable's role; e.g., "x-axis", "y-axis", "overlay" */
export type VariableRole = string;

/* A descriptive string for the variable; e.g., "floor material" */
export type VariableDisplay = string;

export function VariableCoverageTable(_: Props) {
  return null;
}
