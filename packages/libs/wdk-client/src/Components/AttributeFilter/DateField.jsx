import React from 'react';
import { partition, sortBy } from 'lodash';

import HistogramField from 'wdk-client/Components/AttributeFilter/HistogramField';
import { getFormatFromDateString, formatDate, parseDate } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';

/**
 * Date field component
 */
export default class DateField extends React.Component {

  static getHelpContent(props) {
    return HistogramField.getHelpContent(props);
  }

  constructor(props) {
    super(props);
    this.toHistogramValue = this.toHistogramValue.bind(this);
    this.toFilterValue = this.toFilterValue.bind(this);
  }

  componentWillMount() {
    this.setDateFormat(this.props.activeFieldState.summary.valueCounts);
  }

  componentWillUpdate(nextProps) {
    this.setDateFormat(nextProps.activeFieldState.summary.valueCounts);
  }

  setDateFormat(distribution) {
    const firstDateEntry = distribution.find(entry => entry.value != null);
    if (firstDateEntry == null) {
      console.warn('Could not determine date format. No non-null distribution entry.', distribution);
    }
    else {
      this.timeformat = getFormatFromDateString(firstDateEntry.value);
    }
  }

  toHistogramValue(value) {
    const date = typeof value === 'string' ? parseDate(value) : new Date(value);
    return date.getTime();
  }

  toFilterValue(value) {
    switch (typeof value) {
      case 'number': return formatDate(this.timeformat, new Date(value));
      default: return value;
    }
  }

  render() {
    var [ knownDist, unknownDist ] = partition(this.props.activeFieldState.summary.valueCounts, function(entry) {
      return entry.value !== null;
    });


    var values = sortBy(knownDist
      .filter(entry => entry.filteredCount > 0)
      .map(entry => entry.value), value => parseDate(value).getTime());
    var distMin = values[0];
    var distMax = values[values.length - 1];

    var dateDist = knownDist.map(function(entry) {
      // convert value to time in ms
      return Object.assign({}, entry, {
        value: parseDate(entry.value).getTime()
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
        {...this.props}
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
