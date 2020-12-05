import React from 'react';
import PropTypes from 'prop-types';
import { clamp, debounce, get } from 'lodash';

import Histogram from 'wdk-client/Components/AttributeFilter/Histogram';
import FilterLegend from 'wdk-client/Components/AttributeFilter/FilterLegend';
import UnknownCount from 'wdk-client/Components/AttributeFilter/UnknownCount';

/**
 * Generic Histogram field component
 *
 * TODO Add binning
 * TODO Use bin size for x-axis scale <input> step attribute
 * TODO Interval snapping
 */
export default class HistogramField extends React.Component {

  static getHelpContent(props) {
    return (
      <div>
        Select a range of {props.activeField.display} values with the graph below.
      </div>
    );
   /*
   return (
      <div>
        <div>
          The graph below shows the distribution of {props.activeField.display} values.
          The red bar indicates the number of {props.displayName} that have the
          {props.activeField.display} value and your other selection criteria.
        </div>
        <div>
          The slider to the left of the graph can be used to scale the Y-axis.
        </div>
      </div>
    )
    */
  }

  constructor(props) {
    super(props);
    this.updateFilterValueFromSelection = debounce(this.updateFilterValueFromSelection.bind(this), 50);
    this.handleMinInputBlur = this.handleMinInputBlur.bind(this);
    this.handleMinInputKeyPress = this.handleMinInputKeyPress.bind(this);
    this.handleMinInputChange = this.handleMinInputChange.bind(this)
    this.handleMaxInputBlur = this.handleMaxInputBlur.bind(this);
    this.handleMaxInputKeyPress = this.handleMaxInputKeyPress.bind(this);
    this.handleMaxInputChange = this.handleMaxInputChange.bind(this)
    this.handleUnknownCheckboxChange = this.handleUnknownCheckboxChange.bind(this)
    this.handleRangeScaleChange = this.handleRangeScaleChange.bind(this);
    this.cacheDistributionOperations(this.props);

    this.state = {
      includeUnknown: get(props.filter, 'includeUnknown', false),
      minInputValue: get(props.filter, 'value.min', ''),
      maxInputValue: get(props.filter, 'value.max', '')
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let distributionChanged = this.props.distribution !== nextProps.distribution;
    let filterChanged = this.props.filter !== nextProps.filter;

    if (distributionChanged) this.cacheDistributionOperations(nextProps);

    if (distributionChanged || filterChanged) {
      this.setState({
        includeUnknown: get(nextProps.filter, 'includeUnknown', false),
        minInputValue: get(nextProps.filter, 'value.min', ''),
        maxInputValue: get(nextProps.filter, 'value.max', '')
      });
    }
  }

  cacheDistributionOperations(props) {
    this.convertedDistribution = props.distribution.map(entry =>
      Object.assign({}, entry, { value: props.toHistogramValue(entry.value)}));
    var values = this.convertedDistribution.map(entry => entry.value);
    var min = Math.min(...values);
    var max = Math.max(...values);
    this.convertedDistributionRange = { min, max };
    this.distributionRange = { min: props.toFilterValue(min), max: props.toFilterValue(max) };
  }

  formatRangeValue(value) {
    const { min, max } = this.convertedDistributionRange;
    return value ? this.props.toFilterValue(clamp(this.props.toHistogramValue(value), min, max)) : null;
  }

  handleMinInputChange(event) {
    this.setState({ minInputValue: event.target.value });
  }

  handleMinInputBlur() {
    this.updateFilterValueFromState();
  }

  handleMinInputKeyPress(event) {
    if (event.key === 'Enter') this.updateFilterValueFromState();
  }

  handleMaxInputChange(event) {
    this.setState({ maxInputValue: event.target.value });
  }

  handleMaxInputBlur() {
    this.updateFilterValueFromState();
  }

  handleMaxInputKeyPress(event) {
    if (event.key === 'Enter') this.updateFilterValueFromState();
  }

  handleRangeScaleChange(range) {
    if (this.props.onRangeScaleChange != null) {
      this.props.onRangeScaleChange(this.props.activeField, range);
    }
  }

  updateFilterValueFromState() {
    const min = this.formatRangeValue(this.state.minInputValue);
    const max = this.formatRangeValue(this.state.maxInputValue);
    this.updateFilterValue({ min, max });
  }

  updateFilterValueFromSelection(range) {
    const min = this.formatRangeValue(range.min);
    const max = this.formatRangeValue(range.max);
    // XXX Snap to actual values?
    this.updateFilterValue({ min, max });
  }

  updateFilterValue(range) {
    // only emit change if range differs from filter
    if (this.rangeIsDifferent(range)) this.emitChange(range);
  }

  /**
   * @param {React.ChangeEvent.<HTMLInputElement>} event
   */
  handleUnknownCheckboxChange(event) {
    const includeUnknown = event.target.checked;
    this.setState({ includeUnknown });
    this.emitChange(get(this.props, 'filter.value'), includeUnknown);
  }

  rangeIsDifferent({ min, max }) {
    if (this.props.filter == null) return min != null || max != null;
    return (
      min !== this.props.filter.value.min ||
      max !== this.props.filter.value.max
    );
  }

  emitChange(range, includeUnknown = this.state.includeUnknown) {
    this.props.onChange(this.props.activeField, range, includeUnknown,
      this.props.activeFieldState.summary.valueCounts);

    this.setState({
      minInputValue: get(range, 'min', ''),
      maxInputValue: get(range, 'max', '')
    });
  }

  render() {
    var {
      activeField,
      filter,
      displayName,
      unknownCount,
      activeFieldState,
      selectByDefault
    } = this.props;

    var distMin = this.distributionRange.min;
    var distMax = this.distributionRange.max;

    var filterValue = get(filter, 'value');

    var min = filterValue == null
      ? (selectByDefault ? distMin : null)
      : filterValue.min;

    var max = filterValue == null
      ? (selectByDefault ? distMax : null)
      : filterValue.max;

    var includeUnknown = get(filter, 'includeUnknown', this.state.includeUnknown);

    var selectedMin = min == null ? null : this.props.toHistogramValue(min);
    var selectedMax = max == null ? null : this.props.toHistogramValue(max);

    var selectionTotal = filter && filter.selection && filter.selection.length;

    var selection = selectionTotal != null
      ? " (" + selectionTotal + " selected) "
      : null;

    return (
      <div className="range-filter">

        <div className="head">
          <div>
            <div className="overview">
              {this.props.overview}
            </div>

            <div>
              {'Select ' + activeField.display + ' from '}
              <input
                type="text"
                placeholder={distMin}
                value={this.state.minInputValue || ''}
                onChange={this.handleMinInputChange}
                onKeyPress={this.handleMinInputKeyPress}
                onBlur={this.handleMinInputBlur}
              />
              {' to '}
              <input
                type="text"
                placeholder={distMax}
                value={this.state.maxInputValue || ''}
                onChange={this.handleMaxInputChange}
                onKeyPress={this.handleMaxInputKeyPress}
                onBlur={this.handleMaxInputBlur}
              />
              {unknownCount > 0 && (
                <label className="include-unknown">
                  {' '}
                  <input
                    type="checkbox"
                    checked={includeUnknown}
                    onChange={this.handleUnknownCheckboxChange}
                  /> Include {unknownCount} Unknown
                </label>
              )}
              <span className="selection-total">{selection}</span>
            </div>
          </div>
          <div>
            <UnknownCount {...this.props} />
          </div>
        </div>

        <Histogram
          distribution={this.convertedDistribution}
          onSelected={this.updateFilterValueFromSelection}
          selectedMin={selectedMin}
          selectedMax={selectedMax}
          chartType={activeField.type}
          timeformat={this.props.timeformat}
          xaxisLabel={activeField.display}
          yaxisLabel={displayName}
          uiState={activeFieldState}
          onUiStateChange={this.handleRangeScaleChange}
          truncateYAxis={this.props.histogramTruncateYAxisDefault}
          defaultScaleYAxis={this.props.histogramScaleYAxisDefault}
        />

        <FilterLegend {...this.props} />

      </div>
    );
  }

}

HistogramField.propTypes = {
  distribution: PropTypes.array.isRequired,
  toFilterValue: PropTypes.func.isRequired,
  toHistogramValue: PropTypes.func.isRequired,
  selectByDefault: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  activeField: PropTypes.object.isRequired,
  activeFieldState: PropTypes.object.isRequired,
  filter: PropTypes.object,
  overview: PropTypes.node.isRequired,
  displayName: PropTypes.string.isRequired,
  unknownCount: PropTypes.number.isRequired,
  timeformat: PropTypes.string,
  onRangeScaleChange: PropTypes.func
};
