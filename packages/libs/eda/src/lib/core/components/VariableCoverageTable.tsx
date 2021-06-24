import { CompleteCasesTable } from '../api/data-api';
import { useVariableCoverageTableRows } from '../hooks/variableCoverage';
import { Filter } from '../types/filter';
import { Variable } from '../types/variable';

export interface Props {
  containerClassName?: string;
  completeCases?: CompleteCasesTable;
  filters: Filter[];
  variableSpecs: VariableSpec[];
  outputEntityId?: string;
}

export interface VariableSpec {
  role: VariableRole;
  display?: VariableDisplay;
  variable?: Variable;
}

/* A short description of the variable's role; e.g., "X-axis", "Y-axis", "Overlay" */
export type VariableRole = string;

/* A display string for the variable; e.g., "floor material" */
export type VariableDisplay = string;

export interface VariableCoverageTableRow {
  role: VariableRole;
  display?: VariableDisplay;
  /* count of entities which have the variable */
  complete?: number;
  /* count of entities which are missing the variable */
  incomplete?: number;
}

export function VariableCoverageTable({
  containerClassName,
  completeCases,
  filters,
  outputEntityId,
  variableSpecs,
}: Props) {
  const rows = useVariableCoverageTableRows(
    variableSpecs,
    filters,
    completeCases,
    outputEntityId
  );

  const className =
    containerClassName == null
      ? 'VariableCoverageTable'
      : `${containerClassName} VariableCoverageTable`;

  return (
    <div className={className}>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Label</th>
            <th>Data</th>
            <th>No data</th>
          </tr>
          {rows.map((row) => (
            <tr key={row.role}>
              <th>{row.role}</th>
              <td>{row.display}</td>
              <td>{row.complete?.toLocaleString()}</td>
              <td>{row.incomplete?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
