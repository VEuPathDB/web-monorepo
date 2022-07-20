import { CompleteCasesTable } from '../api/DataClient';
import { EntityCounts } from '../hooks/entityCounts';
import { PromiseHookState } from '../hooks/promise';
import { useVariableCoverageTableRows } from '../hooks/variableCoverage';
import { VariableDescriptor } from '../types/variable';

export interface Props {
  containerClassName?: string;
  completeCases?: CompleteCasesTable;
  filteredCounts: PromiseHookState<EntityCounts>;
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
  filteredCounts,
  outputEntityId,
  variableSpecs,
}: Props) {
  const rows = useVariableCoverageTableRows(
    variableSpecs,
    filteredCounts,
    completeCases,
    outputEntityId
  );

  const className =
    containerClassName == null
      ? 'VariableCoverageTable'
      : `${containerClassName} VariableCoverageTable`;

  return completeCases ? (
    <div className={className}>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Variable</th>
            <th className="numeric-header">Data</th>
            <th className="numeric-header">No data</th>
          </tr>
          {rows
            .filter((row) => row.required || row.display != null)
            .map((row) => (
              <tr key={row.role}>
                <th>{row.role}</th>
                <td>{row.display}</td>
                <td className="numeric">
                  {row.completeCount?.toLocaleString()}
                  <br />
                  {row.completePercent != null && (
                    <span className="percentage">
                      {/* check number or string like '< 1', '> 99' */}
                      {typeof row.completePercent === 'number'
                        ? '(' + row.completePercent.toFixed(2) + '%)'
                        : '(' + row.completePercent + '%)'}
                    </span>
                  )}
                </td>
                <td className="numeric">
                  {row.incompleteCount?.toLocaleString()}
                  <br />
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
  ) : null;
}
