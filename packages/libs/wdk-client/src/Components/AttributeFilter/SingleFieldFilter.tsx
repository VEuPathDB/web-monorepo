import { omit } from 'lodash';
import React from 'react';

import DateField from '../../Components/AttributeFilter/DateField';
import EmptyValues from '../../Components/AttributeFilter/EmptyValues';
import MembershipField from '../../Components/AttributeFilter/MembershipField';
import NumberField from '../../Components/AttributeFilter/NumberField';
import {
  isRange,
  shouldAddFilter,
} from '../../Components/AttributeFilter/AttributeFilterUtils';
import {
  Field,
  Filter,
  OntologyTermSummary,
  ValueCounts,
} from '../../Components/AttributeFilter/Types';

/**
 * Props for the SingleFieldFilter component
 */
interface SingleFieldFilterProps {
  activeField?: Field | null;
  activeFieldState?: {
    summary: OntologyTermSummary;
    [key: string]: any;
  } | null;
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  selectByDefault: boolean;
  [key: string]: any; // Allow additional props to be passed through
}

/**
 * Component for filtering a single field with appropriate filter UI
 * Selects the right filter component based on field type and range
 */
export default class SingleFieldFilter extends React.Component<SingleFieldFilterProps> {
  constructor(props: SingleFieldFilterProps) {
    super(props);
    this.handleFieldFilterChange = this.handleFieldFilterChange.bind(this);
  }

  /**
   * @param {Field} field Field term id
   * @param {any} value Filter value
   * @param {boolean} includeUnknown Indicate if items with an unknown value for the field should be included.
   */
  handleFieldFilterChange(
    field: Field,
    value: any,
    includeUnknown: boolean,
    valueCounts: ValueCounts
  ): void {
    const filter: Filter = {
      field: field.term,
      type: field.type || '',
      isRange: isRange(field),
      value,
      includeUnknown,
    } as Filter;
    const filters = this.props.filters.filter((f) => f.field !== field.term);
    this.props.onFiltersChange(
      shouldAddFilter(filter, valueCounts, this.props.selectByDefault)
        ? filters.concat(filter)
        : filters
    );
  }

  render(): React.ReactNode {
    const { activeField, activeFieldState, filters } = this.props;

    const FieldDetail =
      activeField == null || activeFieldState == null
        ? null
        : activeFieldState.summary.valueCounts.length === 0
        ? EmptyValues
        : isRange(activeField) == false
        ? MembershipField
        : activeField.type == 'string'
        ? MembershipField
        : activeField.type == 'number'
        ? NumberField
        : activeField.type == 'date'
        ? DateField
        : null;

    const filter =
      activeField &&
      filters &&
      filters.find((filter) => filter.field === activeField.term);

    const restProps = omit(this.props, ['filters']);

    return (
      FieldDetail && (
        <React.Fragment>
          <FieldDetail
            filter={filter as any}
            onChange={this.handleFieldFilterChange}
            {...restProps}
          />
        </React.Fragment>
      )
    );
  }
}
