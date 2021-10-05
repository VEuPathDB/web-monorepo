import React, { useState } from 'react';
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

  // set showMore state
  const [showMore, setShowMore] = useState(false);

  // find the number of variables for multifilter case
  const numberOfProviderLabel = MultiFilterVariable.is(variable)
    ? findMultifilterVariableLeaves(
        variable,
        groupBy(entity.variables, (variable) => variable.parentId)
      ).length
    : 1;

  // show the first three if multifilter variable
  const threeProviderLabel = MultiFilterVariable.is(variable)
    ? findMultifilterVariableLeaves(
        variable,
        groupBy(entity.variables, (variable) => variable.parentId)
      ).map((variable, i) => {
        if (i < 3) {
          return (
            <div key={variable.id}>
              {variable.displayName}:{' '}
              {variable.providerLabel
                .replace(/[[\]"]/g, '')
                .replace(/[,]/g, ', ')}
              ;&nbsp;
            </div>
          );
        }
        return null;
      })
    : // : variable.providerLabel.replace(/[\[\]"]/g, '').replace(/[,]/g, ', ');
      variable.providerLabel.replace(/[[\]"]/g, '').replace(/[,]/g, ', ');

  // make variables for after the first three
  const providerLabelLeftover = MultiFilterVariable.is(variable)
    ? findMultifilterVariableLeaves(
        variable,
        groupBy(entity.variables, (variable) => variable.parentId)
      ).map((variable, i) => {
        if (i > 2) {
          return (
            <div key={variable.id}>
              {variable.displayName}:{' '}
              {variable.providerLabel
                .replace(/[[\]"]/g, '')
                .replace(/[,]/g, ', ')}
              ;&nbsp;
            </div>
          );
        }
        return null;
      })
    : '';

  // define show more link
  const showMoreLink = showMore ? 'Show Less << ' : 'Show More >> ';

  return (
    <ErrorBoundary>
      <div>
        <h3>{axisLabelWithUnit(variable)}</h3>
        <div className={cx('-ProviderLabel')}>
          <div className={cx('-ProviderLabelPrefix')}>
            <i>
              Original variable{' '}
              {MultiFilterVariable.is(variable) ? 'names' : 'name'}:
            </i>
          </div>
          {/* showing three variables for multifilter or single variable */}
          &nbsp; {threeProviderLabel} &nbsp;
          <HelpIcon>
            The name of this variable in the data files that were integrated
            into ClinEpiDB
          </HelpIcon>
          &nbsp;&nbsp;
          {MultiFilterVariable.is(variable) && numberOfProviderLabel > 3 ? (
            <>
              <button
                className="variable-show-more-link link"
                onClick={() => {
                  setShowMore(!showMore);
                }}
              >
                {showMoreLink}
              </button>
              <br />
              {showMore && providerLabelLeftover}
            </>
          ) : (
            ''
          )}
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
