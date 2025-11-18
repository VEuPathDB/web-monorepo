import React from 'react';
import { partition, sortBy } from 'lodash';

import HistogramField from '../../Components/AttributeFilter/HistogramField';
import {
  getFormatFromDateString,
  formatDate,
  parseDate,
} from '../../Components/AttributeFilter/AttributeFilterUtils';
import {
  Field,
  RangeFilter,
  OntologyTermSummary,
  ValueCounts,
} from '../../Components/AttributeFilter/Types';

/**
 * Distribution entry type for histogram data
 */
interface DistributionEntry {
  value: number | string | null;
  count: number;
  filteredCount: number;
}

/**
 * Props for the DateField component
 */
interface DateFieldProps {
  distribution: DistributionEntry[];
  toFilterValue: (value: number) => number | string;
  toHistogramValue: (value: number | string) => number;
  selectByDefault: boolean;
  onChange: (
    activeField: Field,
    range: { min?: number | string | null; max?: number | string | null },
    includeUnknown: boolean,
    valueCounts: ValueCounts
  ) => void;
  activeField: Field;
  activeFieldState: {
    summary: OntologyTermSummary;
    [key: string]: any;
  };
  filter?: RangeFilter;
  overview?: React.ReactNode;
  displayName: string;
  unknownCount: number;
  timeformat?: string;
  onRangeScaleChange?: (activeField: Field, range: any) => void;
  histogramTruncateYAxisDefault?: boolean;
  histogramScaleYAxisDefault?: boolean;
}

/**
 * Date field component
 */
export default class DateField extends React.Component<DateFieldProps> {
  timeformat?: string;

  static getHelpContent(props: DateFieldProps) {
    return (
      <div>
        Select a range of {props.activeField.display} values with the graph
        below.
      </div>
    );
  }

  constructor(props: DateFieldProps) {
    super(props);
    this.toHistogramValue = this.toHistogramValue.bind(this);
    this.toFilterValue = this.toFilterValue.bind(this);
  }

  componentWillMount() {
    this.setDateFormat(this.props.activeFieldState.summary.valueCounts);
  }

  componentWillUpdate(nextProps: DateFieldProps) {
    this.setDateFormat(nextProps.activeFieldState.summary.valueCounts);
  }

  setDateFormat(distribution: ValueCounts) {
    const firstDateEntry = distribution.find((entry) => entry.value != null);
    if (firstDateEntry == null) {
      console.warn(
        'Could not determine date format. No non-null distribution entry.',
        distribution
      );
    } else {
      this.timeformat = getFormatFromDateString(firstDateEntry.value as string);
    }
  }

  toHistogramValue(value: number | string): number {
    const date = typeof value === 'string' ? parseDate(value) : new Date(value);
    return date.getTime();
  }

  toFilterValue(value: number): number | string {
    switch (typeof value) {
      case 'number':
        return formatDate(this.timeformat || 'yyyy-MM-dd', new Date(value));
      default:
        return value;
    }
  }

  render() {
    var [knownDist, unknownDist] = partition(
      this.props.activeFieldState.summary.valueCounts,
      function (entry) {
        return entry.value !== null;
      }
    );

    var values = sortBy(
      knownDist
        .filter((entry) => entry.filteredCount > 0)
        .map((entry) => entry.value),
      (value) => parseDate(value as string | number).getTime()
    );
    var distMin = values[0];
    var distMax = values[values.length - 1];

    var dateDist = knownDist.map(function (entry) {
      // convert value to time in ms
      return Object.assign({}, entry, {
        value: parseDate(entry.value as string | number).getTime(),
      });
    });

    var unknownCount = unknownDist.reduce((sum, entry) => sum + entry.count, 0);

    var overview = (
      <dl className="ui-helper-clearfix">
        <dt>Min</dt>
        <dd>{distMin}</dd>
        <dt>Max</dt>
        <dd>{distMax}</dd>
      </dl>
    );

    return (
      <HistogramField
        {...(this.props as any)}
        timeformat={this.timeformat}
        distribution={dateDist}
        unknownCount={unknownCount}
        toFilterValue={this.toFilterValue}
        toHistogramValue={this.toHistogramValue}
        overview={overview}
      />
    );
  }
}
