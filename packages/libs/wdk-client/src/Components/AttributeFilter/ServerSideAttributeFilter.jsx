import React from 'react';
import PropTypes from 'prop-types';

import FieldList from './FieldList';
import FilterList from './FilterList';
import FieldFilter from './FieldFilter';

/**
 * Filtering UI for server-side filtering.
 */
export default function ServerSideAttributeFilter (props) {
  var { displayName, fields, hideFilterPanel, hideFieldPanel } = props;

  if (fields.size === 0) {
    return (
      <h3>Data is not available for {displayName}.</h3>
    );
  }

  return (
    <div>
      {hideFilterPanel || <FilterList {...props} /> }

      {/* Main selection UI */}
      <div className="filters ui-helper-clearfix">
        { hideFieldPanel || (
          <FieldList
            autoFocus={props.autoFocus}
            fields={props.fields}
            onActiveFieldChange={props.onActiveFieldChange}
            activeField={props.activeField}
          />
        )}
        <FieldFilter {...props } />
      </div>
    </div>
  );
}

ServerSideAttributeFilter.propTypes = {

  // options
  displayName: PropTypes.string,
  autoFocus: PropTypes.bool,
  hideFilterPanel: PropTypes.bool,
  hideFieldPanel: PropTypes.bool,
  hideGlobalCounts: PropTypes.bool,
  selectByDefault: PropTypes.bool, // affects UI state for when no filter is applied
  minSelectedCount: PropTypes.number,

  // state
  fields: PropTypes.instanceOf(Map).isRequired,
  filters: PropTypes.array.isRequired,
  dataCount: PropTypes.number,
  filteredDataCount: PropTypes.number,
  loadingFilteredCount: PropTypes.bool,

  activeField: FieldFilter.propTypes.activeField,
  activeFieldState: FieldFilter.propTypes.activeFieldState,

  // not sure if these belong here
  isLoading: PropTypes.bool,

  // event handlers
  onActiveFieldChange: PropTypes.func.isRequired,
  onFieldCountUpdateRequest: PropTypes.func.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  onMemberSort: PropTypes.func.isRequired,
  onMemberSearch: PropTypes.func.isRequired,
  onRangeScaleChange: PropTypes.func.isRequired

};

ServerSideAttributeFilter.defaultProps = {
  displayName: 'Items',
  hideFilterPanel: false,
  hideFieldPanel: false,
  hideGlobalCounts: false,
  selectByDefault: false
};
