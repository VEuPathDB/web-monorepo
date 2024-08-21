import React, { useState, useMemo } from 'react';
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
import { variableDisplayWithUnit } from '../core/utils/variable-display';
import { groupBy } from 'lodash';

interface Props {
  entity: StudyEntity;
  totalEntityCount?: number;
  filteredEntityCount?: number;
  variable: Variable | MultiFilterVariable;
  analysisState: AnalysisState;
}

// TEMP: matches string returned for variables without provider labels;
// used to check whether or not to render the provider label info
const NO_PROVIDER_LABEL_STRING = 'No Provider Label available';

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

  // find all label
  const providerLabel = useMemo(() => {
    return MultiFilterVariable.is(variable)
      ? findMultifilterVariableLeaves(
          variable,
          groupBy(entity.variables, (variable) => variable.parentId)
        )
      : isJsonString(variable.providerLabel)
      ? JSON.parse(variable.providerLabel)
      : variable.providerLabel;
  }, [entity, variable]);

  // show the first three if multifilter variable
  const threeProviderLabel = truncateProviderLabel(
    providerLabel,
    MultiFilterVariable.is(variable),
    true
  );

  // make variable list after the first three variables
  const providerLabelLeftover = truncateProviderLabel(
    providerLabel,
    MultiFilterVariable.is(variable),
    false
  );

  // define show more link
  const showMoreLink = showMore ? 'Show Less << ' : 'Show More >> ';

  return (
    <ErrorBoundary>
      <div>
        <h3>{variableDisplayWithUnit(variable)}</h3>
        {/* only show provider label info if a meaningful label exists */}
        {providerLabel !== NO_PROVIDER_LABEL_STRING && (
          <div className={cx('-ProviderLabel')}>
            <div className={cx('-ProviderLabelPrefix')}>
              <i>
                Original variable{' '}
                {MultiFilterVariable.is(variable) ? 'names' : 'name'}:
              </i>
            </div>
            {/* showing three variables for multifilter or single variable */}
            <>&nbsp;{threeProviderLabel}</>
            {/* generalize Show/Hide more: there is a case that providerLabel is string */}
            {Array.isArray(providerLabel) && providerLabel.length > 3 ? (
              <>
                {showMore && providerLabelLeftover}
                &nbsp;
                <HelpIcon>
                  The name of this variable in the original data files
                </HelpIcon>
                &nbsp;&nbsp;
                <button
                  className="variable-show-more-link link"
                  onClick={() => {
                    setShowMore(!showMore);
                  }}
                >
                  {showMoreLink}
                </button>
              </>
            ) : (
              <>
                &nbsp;
                <HelpIcon>
                  The name of this variable in the original data files
                </HelpIcon>
              </>
            )}
          </div>
        )}
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

// function to check if valid JSON string
function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// function to return proper labels
function truncateProviderLabel(
  /* this contained all label, but it can be a string, e.g., No Provider Label available */
  providerLabel: MultiFilterVariable | string[] | string,
  /* whether variable is multifilter or not */
  isMultiFilterVariable: boolean,
  /* whether keeping the first three labels or the leftover except the first three */
  isThreeLabel: boolean
) {
  // if string, then just show providerLabel
  if (!isMultiFilterVariable && !Array.isArray(providerLabel) && isThreeLabel)
    return providerLabel;
  else if (
    !isMultiFilterVariable &&
    !Array.isArray(providerLabel) &&
    !isThreeLabel
  )
    return '';
  else
    return (providerLabel as string[])
      .slice(
        isThreeLabel ? 0 : 3,
        isThreeLabel ? 3 : (providerLabel as string[]).length + 1
      )
      .map((variable: Variable | string, i: number) => {
        if (isMultiFilterVariable) {
          return (
            <div key={(variable as Variable).id}>
              {(variable as Variable).displayName}:{' '}
              {(variable as Variable).providerLabel
                .replace(/[[\]"]/g, '')
                .replace(/[,]/g, ', ')}
              &nbsp;
            </div>
          );
        } else {
          return (
            <div key={variable as string}>
              <>
                {variable}
                {isThreeLabel &&
                  ((providerLabel as string[]).length > 3
                    ? i === 2
                      ? ''
                      : ','
                    : i === (providerLabel as string[]).length - 1
                    ? ''
                    : ',')}
                {!isThreeLabel &&
                  (i === (providerLabel as string[]).length - 4 ? '' : ',')}
                &nbsp;
              </>
            </div>
          );
        }
      });
}
