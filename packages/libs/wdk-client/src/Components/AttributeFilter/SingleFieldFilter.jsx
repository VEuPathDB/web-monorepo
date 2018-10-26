import { omit } from 'lodash';
import React from 'react';

import DateField from 'wdk-client/Components/AttributeFilter/DateField';
import EmptyValues from 'wdk-client/Components/AttributeFilter/EmptyValues';
import MembershipField from 'wdk-client/Components/AttributeFilter/MembershipField';
import NumberField from 'wdk-client/Components/AttributeFilter/NumberField';
import { isRange, shouldAddFilter } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';

export default class SingleFieldFilter extends React.Component {
  constructor(props) {
    super(props);
    this.handleFieldFilterChange = this.handleFieldFilterChange.bind(this);
  }

  /**
   * @param {Field} field Field term id
   * @param {any} value Filter value
   * @param {boolean} includeUnknown Indicate if items with an unknown value for the field should be included.
   */
  handleFieldFilterChange(field, value, includeUnknown, valueCounts) {
    const filter = { field: field.term, type: field.type, isRange: isRange(field), value, includeUnknown };
    const filters = this.props.filters.filter(f => f.field !== field.term);
    this.props.onFiltersChange(shouldAddFilter(filter, valueCounts, this.props.selectByDefault)
      ? filters.concat(filter)
      : filters
    );
  }

  render() {
    const { activeField, activeFieldState, filters } = this.props;

    const FieldDetail = activeField == null ? null
      : activeFieldState.summary.valueCounts.length === 0 ? EmptyValues
      : isRange(activeField) == false ? MembershipField
      : activeField.type == 'string' ? MembershipField
      : activeField.type == 'number' ? NumberField
      : activeField.type == 'date' ? DateField
      : null;

    const filter = (
      activeField &&
      filters &&
      filters.find(filter => filter.field === activeField.term)
    );

    const restProps = omit(this.props, ['filters']);

    return (
      <React.Fragment>
        <FieldDetail
          filter={filter}
          onChange={this.handleFieldFilterChange}
          {...restProps}
         />
      </React.Fragment>
    );

  }

}
