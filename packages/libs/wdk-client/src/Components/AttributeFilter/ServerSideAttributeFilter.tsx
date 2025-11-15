import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

import FieldList from '../../Components/AttributeFilter/FieldList';
import FilterList from '../../Components/AttributeFilter/FilterList';
import FieldFilter from '../../Components/AttributeFilter/FieldFilter';
import {
  FieldTreeNode,
  Filter,
  Field,
} from '../../Components/AttributeFilter/Types';

/**
 * Props for the ServerSideAttributeFilter component
 */
type ServerSideAttributeFilterProps = {
  // options
  displayName?: string;
  autoFocus?: boolean;
  hideFilterPanel?: boolean;
  hideFieldPanel?: boolean;
  hideGlobalCounts?: boolean;
  selectByDefault?: boolean; // affects UI state for when no filter is applied
  minSelectedCount?: number;
  histogramScaleYAxisDefault?: boolean;
  histogramTruncateYAxisDefault?: boolean;

  // state
  fieldTree?: FieldTreeNode;
  filters: Filter[];
  valuesMap: Record<string, string[]>;
  dataCount?: number;
  filteredDataCount?: number;
  loadingFilteredCount?: boolean;

  activeField?: Field | null;
  activeFieldState?: {
    loading?: boolean;
    summary?: any;
    leafSummaries?: any[];
    errorMessage?: string;
    [key: string]: any;
  };

  // not sure if these belong here
  isLoading?: boolean;

  // event handlers
  onActiveFieldChange: (fieldTerm: string) => void;
  onFiltersChange: (filters: Filter[]) => void;
  onMemberSort: (sortBy: string) => void;
  onMemberSearch: (searchTerm: string) => void;
  onRangeScaleChange: (scale: string) => void;
};

/**
 * Filtering UI for server-side filtering.
 */
function ServerSideAttributeFilter(props: ServerSideAttributeFilterProps) {
  const { displayName, fieldTree, hideFilterPanel, hideFieldPanel } = props;

  if (fieldTree == null) {
    return <h3>Data is not available for {displayName}.</h3>;
  }

  return (
    <div style={{ overflowX: 'auto', marginRight: '1em' }}>
      {hideFilterPanel || <FilterList {...props} fieldTree={fieldTree!} />}

      {/* Main selection UI */}
      <div className="filters ui-helper-clearfix">
        {hideFieldPanel || (
          <FieldList
            autoFocus={props.autoFocus}
            fieldTree={fieldTree!}
            onActiveFieldChange={props.onActiveFieldChange}
            activeField={props.activeField}
            valuesMap={props.valuesMap}
          />
        )}
        <FieldFilter
          {...props}
          selectByDefault={props.selectByDefault ?? false}
        />
      </div>
    </div>
  );
}

ServerSideAttributeFilter.defaultProps = {
  displayName: 'Items',
  hideFilterPanel: false,
  hideFieldPanel: false,
  hideGlobalCounts: false,
  selectByDefault: false,
  histogramScaleYAxisDefault: true,
  histogramTruncateYAxisDefault: false,
};

export default wrappable(ServerSideAttributeFilter);

export function withOptions(options: Partial<ServerSideAttributeFilterProps>) {
  return function ServerSideAttributeFilterWithOptions(
    props: ServerSideAttributeFilterProps
  ) {
    return <ServerSideAttributeFilter {...options} {...props} />;
  };
}
