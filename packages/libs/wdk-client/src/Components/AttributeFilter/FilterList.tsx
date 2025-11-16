import { partial } from 'lodash';
import React from 'react';
import { Seq } from '../../Utils/IterableUtils';
import IconAlt from '../../Components/Icon/IconAlt';
import {
  getFilterValueDisplay,
  getOperationDisplay,
  shouldAddFilter,
} from '../../Components/AttributeFilter/AttributeFilterUtils';
import { postorderSeq } from '../../Utils/TreeUtils';
import { Filter, FieldTreeNode, Field, MultiFilterValue } from './Types';

interface FilterListProps {
  onActiveFieldChange: (field: string) => void;
  onFiltersChange: (filters: Filter[]) => void;
  fieldTree: FieldTreeNode;
  filters: Filter[];
  displayName: string;
  dataCount?: number;
  filteredDataCount?: number;
  hideGlobalCounts: boolean;
  loadingFilteredCount?: boolean;
  activeField?: Field;
  minSelectedCount?: number;
}

/**
 * List of filters configured by the user.
 *
 * Each filter can be used to update the active field
 * or to remove a filter.
 */
export default class FilterList extends React.Component<FilterListProps, {}> {
  /**
   * @param {FilterListProps} props
   * @return {React.Component<FilterListProps, void>}
   */
  constructor(props: FilterListProps) {
    super(props);
    this.handleFilterSelectClick = this.handleFilterSelectClick.bind(this);
    this.handleFilterRemoveClick = this.handleFilterRemoveClick.bind(this);
  }

  /**
   * @param {Filter} filter
   * @param {Event} event
   */
  handleFilterSelectClick = (
    filter: Filter,
    containerFilter: Filter = filter,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    this.props.onActiveFieldChange(containerFilter.field);
  };

  /**
   * @param {Filter} filter
   * @param {Event} event
   */
  handleFilterRemoveClick = (
    filter: Filter,
    containerFilter: Filter | undefined,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    event.preventDefault();
    if (containerFilter != null) {
      const otherFilters = this.props.filters.filter(
        (f) => f !== containerFilter
      );
      const containerValue = containerFilter.value as MultiFilterValue;
      const nextContainerFilter = {
        ...containerFilter,
        value: {
          ...containerValue,
          filters: containerValue.filters.filter((f: any) => f !== filter),
        },
      } as Filter;
      this.props.onFiltersChange(
        shouldAddFilter(nextContainerFilter, [], false)
          ? otherFilters.concat(nextContainerFilter)
          : otherFilters
      );
    } else {
      this.props.onFiltersChange(
        this.props.filters.filter((f) => f !== filter)
      );
    }
  };

  renderFilterItem(filter: Filter, containerFilter?: Filter): JSX.Element {
    const { fieldTree } = this.props;
    const handleSelectClick = partial(
      this.handleFilterSelectClick,
      filter,
      containerFilter
    );
    const handleRemoveClick = partial(
      this.handleFilterRemoveClick,
      filter,
      containerFilter
    );
    const field = postorderSeq(fieldTree)
      .map((node) => node.field)
      .find((field) => field.term === filter.field);
    const filterDisplay = getFilterValueDisplay(filter);

    return (
      <div className="filter-item">
        <a
          className="select"
          onClick={handleSelectClick}
          href={'#' + filter.field}
          title={filterDisplay}
        >
          {field == null ? filter.field : field.display}
        </a>
        {/* Use String.fromCharCode to avoid conflicts with
            character ecoding. Other methods detailed at
            http://facebook.github.io/react/docs/jsx-gotchas.html#html-entities
            cause JSX to encode. String.fromCharCode ensures that
            the encoding is done in the browser */}
        <span
          className="remove"
          onClick={handleRemoveClick}
          title="remove restriction"
        >
          {String.fromCharCode(215)}
        </span>
      </div>
    );
  }

  render(): JSX.Element {
    const {
      activeField,
      fieldTree,
      filters,
      filteredDataCount,
      dataCount,
      displayName,
      loadingFilteredCount,
      hideGlobalCounts,
      minSelectedCount,
    } = this.props;

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

    const needsMoreCount = minSelectedCount
      ? minSelectedCount > (filteredDataCount || 0)
      : false;

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
        {filteredCount} of {dataCount && dataCount.toLocaleString()}{' '}
        {displayName} selected
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
            {Seq.from(filters).map((filter) => {
              const className =
                activeField && activeField.term === filter.field
                  ? `selected ${filter.type}`
                  : filter.type;
              const field = postorderSeq(fieldTree)
                .map((node) => node.field)
                .find((field) => field.term === filter.field);
              return (
                <li key={filter.field} className={className}>
                  {filter.type === 'multiFilter' ? (
                    <React.Fragment>
                      <sup className="multiFilter-operation">
                        {getOperationDisplay(
                          filter.value.operation
                        ).toUpperCase()}{' '}
                        {field == null ? filter.field : field.display} filters
                      </sup>
                      <ul className="filter-items">
                        {filter.value.filters.map((leaf: Filter) => (
                          <li key={leaf.field}>
                            {this.renderFilterItem(leaf, filter)}
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  ) : (
                    this.renderFilterItem(filter)
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
}
