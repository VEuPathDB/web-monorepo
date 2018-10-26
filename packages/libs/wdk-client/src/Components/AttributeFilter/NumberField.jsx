import React from 'react';
import { partition } from 'lodash';

import HistogramField from 'wdk-client/Components/AttributeFilter/HistogramField';

/**
 * Number field component
 */
export default class NumberField extends React.Component {

  static getHelpContent(props) {
    return HistogramField.getHelpContent(props);
  }

  constructor(props) {
    super(props);
    this.toHistogramValue = this.toHistogramValue.bind(this);
    this.toFilterValue = this.toFilterValue.bind(this);
  }

  // FIXME Handle intermediate strings S where Number(S) => NaN
  // E.g., S = '-'
  // A potential solution is to use strings for state and to
  // convert to Number when needed
  parseValue(value) {
    switch (typeof value) {
      case 'string': return Number(value);
      default: return value;
    }
  }

  toHistogramValue(value) {
    return Number(value);
  }

  toFilterValue(value) {
    return value;
  }

  render() {
    var [ knownDist, unknownDist ] = partition(this.props.activeFieldState.summary.valueCounts, function(entry) {
      return entry.value !== null;
    });

    var size = knownDist.reduce(function(sum, entry) {
      return entry.filteredCount + sum;
    }, 0);

    var sum = knownDist.reduce(function(sum, entry) {
      return entry.value * entry.filteredCount + sum;
    }, 0);

    var values = knownDist
      .filter(entry => entry.filteredCount > 0)
      .map(entry => entry.value);
    var distMin = Math.min(...values);
    var distMax = Math.max(...values);
    var distAvg = (sum / size).toFixed(2);
    var unknownCount = unknownDist.reduce((sum, entry) => sum + entry.count, 0);
    var overview = (
      <dl className="ui-helper-clearfix">
        <dt>Mean</dt>
        <dd>{distAvg}</dd>
        <dt>Min</dt>
        <dd>{distMin}</dd>
        <dt>Max</dt>
        <dd>{distMax}</dd>
      </dl>
    );

    return (
      <HistogramField
        {...this.props}
        distribution={knownDist}
        unknownCount={unknownCount}
        toFilterValue={this.toFilterValue}
        toHistogramValue={this.toHistogramValue}
        overview={overview}
      />
    );
  }

}
