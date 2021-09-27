import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import {
  StudyEntity,
  AnalysisState,
  useStudyMetadata,
  Variable,
  MultiFilterVariable,
  VariableTreeNode,
} from '../core';
import { FilterContainer } from '../core/components/filter/FilterContainer';
import { cx } from './Utils';
// import axis label unit util
import { axisLabelWithUnit } from '../core/utils/axis-label-unit';
import { groupBy } from 'lodash';

interface Props {
  entity: StudyEntity;
  totalEntityCount?: number;
  filteredEntityCount?: number;
  variable: Variable | MultiFilterVariable;
  analysisState: AnalysisState;
}

export function VariableDetails(props: Props) {
  const {
    entity,
    variable,
    filteredEntityCount,
    totalEntityCount,
    analysisState,
  } = props;
  const studyMetadata = useStudyMetadata();
  return (
    <ErrorBoundary>
      <div>
        <h3>{axisLabelWithUnit(variable)}</h3>
        <div className={cx('-ProviderLabel')}>
          <div className={cx('-ProviderLabelPrefix')}>
            Original variable{' '}
            {MultiFilterVariable.is(variable) ? 'names' : 'name'}:
          </div>
          &nbsp;
          {MultiFilterVariable.is(variable)
            ? findMultifilterVariableLeaves(
                variable,
                groupBy(entity.variables, (variable) => variable.parentId)
              ).map((variable) => (
                <div key={variable.id}>
                  {variable.displayName}: {variable.providerLabel};&nbsp;
                </div>
              ))
            : variable.providerLabel}
          &nbsp;
          <HelpIcon>
            The name for this variable as provided with the original study's
            data set. The VEuPathDB team curates variable names and places
            variables into an ontology framework.
          </HelpIcon>
        </div>
        {/* add variable.definition */}
        <div className={cx('-SubsettingVariableDefinition')}>
          {variable?.definition}
        </div>
      </div>
      {totalEntityCount != null && filteredEntityCount != null ? (
        <FilterContainer
          key={variable.id}
          studyMetadata={studyMetadata}
          variable={variable}
          entity={entity}
          analysisState={analysisState}
          totalEntityCount={totalEntityCount}
          filteredEntityCount={filteredEntityCount}
        />
      ) : null}
    </ErrorBoundary>
  );
}

function findMultifilterVariableLeaves(
  variable: MultiFilterVariable,
  variablesByParentId: Record<string, VariableTreeNode[] | undefined>
): Variable[] {
  // Find all children of `variable`
  const variables = variablesByParentId[variable.id] ?? [];
  // For each item in `variables`, find its children and push to `variables`.
  // These items will then be included in the iteration of `variables`, thus
  // we will find all descendents of `variable` provided to this function.
  for (const variable of variables) {
    for (const child of variablesByParentId[variable.id] ?? []) {
      if (child) variables.push(child);
    }
  }
  return variables.filter(
    (variable): variable is Variable => variable.type !== 'category'
  );
}
