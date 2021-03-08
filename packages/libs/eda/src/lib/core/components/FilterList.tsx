import { partial } from 'lodash';
import React from 'react';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import IconAlt from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  getFilterValueDisplay,
  getOperationDisplay,
  shouldAddFilter,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { postorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { Filter } from '../types/filter';
import { Variable } from '../types/variable';
import { useSession } from '../hooks/session';
import FilterChip from './FilterChip';

interface Props {
  sessionId: string;
  onActiveVariableChange: (variable: string) => void;
  onFiltersChange: (filters: Filter[]) => void;
  variableTree: {};
  filters: Filter[];
  displayName: string;
  dataCount?: number;
  filteredDataCount?: number;
  hideGlobalCounts: boolean;
  loadingFilteredCount?: boolean;
  activeVariable?: Variable;
  minSelectedCount?: number;
}

/**
 * List of filters configured by the user.
 *
 * Each filter can be used to update the active variable
 * or to remove a filter.
 */
export default function FilterList(props: Props) {
  /**
   * @param {Filter} filter
   * @param {Event} event
   */
  const handleFilterSelectClick = (
    filter: Filter,
    containerFilter = filter,
    event: any
  ) => {
    event.preventDefault();
    props.onActiveVariableChange(containerFilter.variableId);
  };

  /**
   * @param {Filter} filter
   * @param {Event} event
   */
  const handleFilterRemoveClick = (
    filter: Filter,
    containerFilter = filter,
    event: any
  ) => {
    event.preventDefault();
    if (containerFilter != null) {
      const otherFilters = props.filters.filter((f) => f !== containerFilter);
      const nextContainerFilter = {
        ...containerFilter,
        value: {
          ...containerFilter.value,
          filters: containerFilter.value.filters.filter(
            (f: Filter) => f !== filter
          ),
        },
      };
      props.onFiltersChange(
        otherFilters.concat(
          shouldAddFilter(nextContainerFilter) ? [nextContainerFilter] : []
        )
      );
    } else {
      props.onFiltersChange(props.filters.filter((f) => f !== filter));
    }
  };

  const renderFilterItem = (filter: Filter, containerFilter: any) => {
    var { variableTree } = props;
    var handleSelectClick = partial(
      handleFilterSelectClick,
      filter,
      containerFilter
    );
    var handleRemoveClick = partial(
      handleFilterRemoveClick,
      filter,
      containerFilter
    );
    var variable: Variable = postorderSeq(variableTree)
      .map((node: any) => node.variable)
      .find((variable: Variable) => variable.variableId === filter.variableId);
    var filterDisplay = getFilterValueDisplay(filter);

    return (
      // <div className="filter-item">
      //   <a
      //     className="select"
      //     onClick={handleSelectClick}
      //     href={'#' + filter.variableId}
      //     title={filterDisplay}
      //   >
      //     {variable == null ? filter.variableId : variable.display}
      //   </a>
      //   {/* Use String.fromCharCode to avoid conflicts with
      //       character ecoding. Other methods detailed at
      //       http://facebook.github.io/react/docs/jsx-gotchas.html#html-entities
      //       cause JSX to encode. String.fromCharCode ensures that
      //       the encoding is done in the browser */}
      //   <span
      //     className="remove"
      //     onClick={handleRemoveClick}
      //     title="remove restriction"
      //   >
      //     {String.fromCharCode(215)}
      //   </span>
      // </div>
      <FilterChip
        text={variable ? variable.display : filter.variableId}
        tooltipText={filterDisplay}
        active={false}
        onClick={handleSelectClick}
        onDelete={handleRemoveClick}
      />
    );
  };

  const {
    sessionId,
    activeVariable,
    variableTree,
    filters,
    filteredDataCount,
    dataCount,
    displayName,
    loadingFilteredCount,
    hideGlobalCounts,
    minSelectedCount,
  } = props;

  const sessionState = useSession(sessionId);
  // const filters = sessionState.session?.filters ?? [];

  const filteredCount = hideGlobalCounts ? null : loadingFilteredCount ? (
    <React.Fragment>
      <i className="fa fa-circle-o-notch fa-spin fa-fw margin-bottom"></i>
      <span className="sr-only">Loading...</span>
    </React.Fragment>
  ) : (
    filteredDataCount && filteredDataCount.toLocaleString()
  );

  const total = hideGlobalCounts ? null : (
    <span>
      {dataCount && dataCount.toLocaleString()} {displayName} Total
    </span>
  );

  const needsMoreCount = minSelectedCount > filteredDataCount;

  const filtered = hideGlobalCounts ? null : (
    <span
      style={{ marginRight: '1em', color: needsMoreCount ? '#b40000' : '' }}
      title={
        needsMoreCount
          ? `At least ${minSelectedCount} ${displayName} must be selected.`
          : ''
      }
    >
      {needsMoreCount ? (
        <React.Fragment>
          <IconAlt fa="warning" />
          &nbsp;
        </React.Fragment>
      ) : null}
      {filteredCount} of {dataCount && dataCount.toLocaleString()} {displayName}{' '}
      selected
    </span>
  );

  return (
    <div className="filter-items-wrapper">
      <div className="filter-list-total">{total}</div>
      {filters.length === 0 ? null : (
        <div className="filter-list-selected">{filtered}</div>
      )}
      {filters.length === 0 ? (
        hideGlobalCounts ? null : (
          <strong>
            <em>No filters applied</em>
          </strong>
        )
      ) : (
        <ul className="filter-items">
          {Seq.from(filters).map((filter: Filter) => {
            const className =
              activeVariable && activeVariable.variableId === filter.variableId
                ? `selected ${filter.type}`
                : filter.type;
            const variable: Variable = postorderSeq(variableTree)
              .map((node: any) => node.variable)
              .find(
                (variable: Variable) =>
                  variable.variableId === filter.variableId
              );
            return (
              <li key={filter.variableId} className={className}>
                {filter.type !== 'multiFilter' ? (
                  renderFilterItem(filter)
                ) : (
                  <React.Fragment>
                    <sup className="multiFilter-operation">
                      {getOperationDisplay(
                        filter.value.operation
                      ).toUpperCase()}{' '}
                      {variable == null ? filter.variableId : variable.display}{' '}
                      filters
                    </sup>
                    <ul className="filter-items">
                      {filter.value.filters.map((leaf: any) => (
                        <li key={leaf.variable}>
                          {renderFilterItem(leaf, filter)}
                        </li>
                      ))}
                    </ul>
                  </React.Fragment>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
