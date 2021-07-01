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
  /* absolute count of entities which have the variable */
  completeCount?: number;
  /* absolute count of entities which are missing the variable */
  incompleteCount?: number;
  /* percent of subset entities which have the variable */
  completePercent?: number;
  /* percent of subset entities which are missing the variable */
  incompletePercent?: number;
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
            <th className="numeric">Data</th>
            <th className="numeric">No data</th>
          </tr>
          {rows.map((row) => (
            <tr key={row.role}>
              <th>{row.role}</th>
              <td>{row.display}</td>
              <td>
                {row.completeCount?.toLocaleString()}
                {row.completePercent != null && (
                  <span className="percentage">
                    {row.completePercent.toFixed(2)}%
                  </span>
                )}
              </td>
              <td>
                {row.incompleteCount?.toLocaleString()}
                {row.incompletePercent != null && (
                  <span className="percentage">
                    ({row.incompletePercent.toFixed(2)}%)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
