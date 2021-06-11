import { CompleteCasesTable } from '../api/data-api';
import { useVariableCoverageTableRows } from '../hooks/variableCoverage';
import { Variable } from '../types/variable';

export interface Props {
  completeCases?: CompleteCasesTable;
  filteredEntityCounts?: Record<string, number>;
  variables: VariableSpec[];
}

export type VariableSpec = SelectedVariableSpec | UnselectedVariableSpec;

export interface UnselectedVariableSpec {
  selected: false;
  role: VariableRole;
}

export interface SelectedVariableSpec extends Variable {
  selected: true;
  role: VariableRole;
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

export function VariableCoverageTable({
  completeCases,
  filteredEntityCounts,
  variables,
}: Props) {
  const rows = useVariableCoverageTableRows(
    variables,
    completeCases,
    filteredEntityCounts
  );

  return (
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>label</th>
          <th>data</th>
          <th>no data</th>
          <th>total</th>
        </tr>
        {rows.map((row) => (
          <tr key={row.role}>
            <td>{row.role}</td>
            <td>{row.display}</td>
            <td>{row.complete}</td>
            <td>{row.incomplete}</td>
            <td>{row.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
