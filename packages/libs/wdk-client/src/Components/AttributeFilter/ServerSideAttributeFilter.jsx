import React from 'react';
import PropTypes from 'prop-types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

import FieldList from 'wdk-client/Components/AttributeFilter/FieldList';
import FilterList from 'wdk-client/Components/AttributeFilter/FilterList';
import FieldFilter from 'wdk-client/Components/AttributeFilter/FieldFilter';

/**
 * Filtering UI for server-side filtering.
 */
function ServerSideAttributeFilter (props) {
  var { displayName, fieldTree, hideFilterPanel, hideFieldPanel } = props;

  if (fieldTree == null) {
    return (
      <h3>Data is not available for {displayName}.</h3>
    );
  }

  return (
    <div style={{overflowX: 'auto', marginRight: '1em'}}>
      {hideFilterPanel || <FilterList {...props} /> }

      {/* Main selection UI */}
      <div className="filters ui-helper-clearfix">
        { hideFieldPanel || (
          <FieldList
            autoFocus={props.autoFocus}
            fieldTree={props.fieldTree}
            onActiveFieldChange={props.onActiveFieldChange}
            activeField={props.activeField}
            valuesMap={props.valuesMap}
          />
        )}
        <FieldFilter {...props } />
      </div>
    </div>
  );
}

const fieldTreePropType = PropTypes.shape({
  field: FieldFilter.propTypes.activeField.isRequired,
  // use a function below to allow for recursive prop type
  children: PropTypes.arrayOf((...args) => fieldTreePropType(...args)).isRequired
})

ServerSideAttributeFilter.propTypes = {

  // options
  displayName: PropTypes.string,
  autoFocus: PropTypes.bool,
  hideFilterPanel: PropTypes.bool,
  hideFieldPanel: PropTypes.bool,
  hideGlobalCounts: PropTypes.bool,
  selectByDefault: PropTypes.bool, // affects UI state for when no filter is applied
  minSelectedCount: PropTypes.number,
  histogramScaleYAxisDefault: PropTypes.bool,
  histogramTruncateYAxisDefault: PropTypes.bool,

  // state
  fieldTree: fieldTreePropType,
  filters: PropTypes.array.isRequired,
  valuesMap: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string).isRequired).isRequired,
  dataCount: PropTypes.number,
  filteredDataCount: PropTypes.number,
  loadingFilteredCount: PropTypes.bool,

  activeField: FieldFilter.propTypes.activeField,
  activeFieldState: FieldFilter.propTypes.activeFieldState,

  // not sure if these belong here
  isLoading: PropTypes.bool,

  // event handlers
  onActiveFieldChange: PropTypes.func.isRequired,
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
  selectByDefault: false,
  histogramScaleYAxisDefault: true,
  histogramTruncateYAxisDefault: false,
};

export default wrappable(ServerSideAttributeFilter);

export function withOptions(options) {
  return function ServerSideAttributeFilterWithOptions(props) {
    return <ServerSideAttributeFilter {...options} {...props}/>
  }
}
