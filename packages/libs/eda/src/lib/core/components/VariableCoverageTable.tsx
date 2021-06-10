import { CompleteCasesTable } from '../api/data-api';
import { Variable } from '../types/variable';

interface Props {
  completeCases?: CompleteCasesTable;
  filteredEntityCounts?: Record<string, number>;
  variables: VariableSpec[];
}

type VariableSpec =
  | { selected: true; spec: SelectedVariableSpec }
  | { selected: false; spec: UnselectedVariableSpec };

interface UnselectedVariableSpec {
  role: VariableRole;
}

interface SelectedVariableSpec extends UnselectedVariableSpec, Variable {
  display: VariableDisplay;
}

export interface VariableCoverageTableRow {
  type: VariableRole;
  display?: VariableDisplay;
  /* count of entities which have the variable */
  complete?: number;
  /* count of entities which are missing the variable */
  incomplete?: number;
  /* total count of entities */
  total?: number;
}

/* A short description of the variable's role; e.g., "x-axis", "y-axis", "overlay" */
type VariableRole = string;

/* A descriptive string for the variable; e.g., "floor material" */
type VariableDisplay = string;

export function VariableCoverageTable(_: Props) {
  return null;
}
