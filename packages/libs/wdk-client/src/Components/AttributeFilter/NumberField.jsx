import React from 'react';
import { partition } from 'lodash';

import { formatNumber } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import HistogramField from 'wdk-client/Components/AttributeFilter/HistogramField';

// the data distribution is stored in knownDist, an array of n objects (n distinctive values)
// each object has 3 properties { count, filteredCount, value }
//  eg: [ {25,25,1}, {12,12,3}, {9,9,6}, {2,2,12} ]
//  --- range = 12 - 1 = 11
//  --- mean is 2.9 = (1x25 + 3x12 + 6x9 + 12x2 ) / (25+12+9+2)
//  --- median is 1: there are 48 entry points: average values at mid positions 24 and 25: (1+1)/2

const MAX_DECIMALS = 3;

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
    // The following code causes some data to be not included in a range.
    // If this proves to have a negative impact on the UI, we will need
    // to find a more sophisticated way to do this.
    // const scaleFactor = 10**MAX_DECIMALS;
    // const numValue = Number(value);
    // const integerPart = Math.floor(numValue);
    // const decimalPart = Math.ceil((numValue - integerPart) * scaleFactor) / scaleFactor;
    // return integerPart + decimalPart;
  }

  toFilterValue(value) {
    return value;
  }

  numericDataMedian(arr) {
      let mid = Math.floor(arr.length / 2);
      let nums = [...arr].sort((a, b) => a - b);
      return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
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
    var distAvg = sum / size;
    var median = this.numericDataMedian(knownDist.flatMap(x => Array(x.filteredCount).fill(x.value))); 
    var unknownCount = unknownDist.reduce((sum, entry) => sum + entry.count, 0);
    var overview = (
      <dl className="ui-helper-clearfix">
        <dt>Min</dt>
        <dd>{formatNumber(distMin)}</dd>
        <dt>Mean</dt>
        <dd>{formatNumber(distAvg)}</dd>
        <dt>Median</dt>
        <dd>{formatNumber(median)}</dd>
        <dt>Max</dt>
        <dd>{formatNumber(distMax)}</dd>
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
