import { CompleteCasesTable } from '../api/data-api';
import { useVariableCoverageTableRows } from '../hooks/variableCoverage';
import { Filter } from '../types/filter';
import { VariableDescriptor } from '../types/variable';

export interface Props {
  containerClassName?: string;
  completeCases?: CompleteCasesTable;
  filters?: Filter[];
  variableSpecs: VariableSpec[];
  outputEntityId?: string;
}

export interface VariableSpec {
  role: VariableRole;
  required?: boolean;
  display?: VariableDisplay;
  variable?: VariableDescriptor;
}

/* A short description of the variable's role; e.g., "X-axis", "Y-axis", "Overlay" */
export type VariableRole = string;

/* A display string for the variable; e.g., "floor material" */
export type VariableDisplay = string;

export interface VariableCoverageTableRow {
  role: VariableRole;
  display?: VariableDisplay;
  /* whether this row should always appear in the table; false by default */
  required?: boolean;
  /* absolute count of entities which have the variable */
  completeCount?: number;
  /* absolute count of entities which are missing the variable */
  incompleteCount?: number;
  /* percent of subset entities which have the variable: allowing string like '< 1', '> 99' */
  completePercent?: number | string;
  /* percent of subset entities which are missing the variable: allowing string like '< 1', '> 99' */
  incompletePercent?: number | string;
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
            <th>Variable</th>
            <th className="numeric">Data</th>
            <th className="numeric">No data</th>
          </tr>
          {rows
            .filter((row) => row.required || row.display != null)
            .map((row) => (
              <tr key={row.role}>
                <th>{row.role}</th>
                <td>{row.display}</td>
                <td>
                  {row.completeCount?.toLocaleString()}
                  {row.completePercent != null && (
                    <span className="percentage">
                      {/* check number or string like '< 1', '> 99' */}
                      {typeof row.completePercent === 'number'
                        ? '(' + row.completePercent.toFixed(2) + '%)'
                        : '(' + row.completePercent + '%)'}
                    </span>
                  )}
                </td>
                <td>
                  {row.incompleteCount?.toLocaleString()}
                  {row.incompletePercent != null && (
                    <span className="percentage">
                      {/* check number or string like '< 1', '> 99' */}
                      {typeof row.incompletePercent === 'number'
                        ? '(' + row.incompletePercent.toFixed(2) + '%)'
                        : '(' + row.incompletePercent + '%)'}
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
