import React from 'react';
import { clamp, debounce, get } from 'lodash';

import Histogram from '../../Components/AttributeFilter/Histogram';
import FilterLegend from '../../Components/AttributeFilter/FilterLegend';
import UnknownCount from '../../Components/AttributeFilter/UnknownCount';
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
 * Range value type for min/max values
 */
interface RangeValue {
  min?: number | string | null;
  max?: number | string | null;
}

/**
 * Props for the HistogramField component
 */
interface HistogramFieldProps {
  distribution: DistributionEntry[];
  toFilterValue: (value: number) => number | string;
  toHistogramValue: (value: number | string) => number;
  selectByDefault: boolean;
  onChange: (
    activeField: Field,
    range: RangeValue,
    includeUnknown: boolean,
    valueCounts: ValueCounts
  ) => void;
  activeField: Field;
  activeFieldState: {
    summary: OntologyTermSummary;
    [key: string]: any;
  };
  filter?: RangeFilter;
  overview: React.ReactNode;
  displayName: string;
  unknownCount: number;
  timeformat?: string;
  onRangeScaleChange?: (activeField: Field, range: any) => void;
  histogramTruncateYAxisDefault?: boolean;
  histogramScaleYAxisDefault?: boolean;
}

/**
 * State for the HistogramField component
 */
interface HistogramFieldState {
  includeUnknown: boolean;
  minInputValue: number | string | null;
  maxInputValue: number | string | null;
}

/**
 * Generic Histogram field component
 *
 * TODO Add binning
 * TODO Use bin size for x-axis scale <input> step attribute
 * TODO Interval snapping
 */
export default class HistogramField extends React.Component<
  HistogramFieldProps,
  HistogramFieldState
> {
  convertedDistribution: DistributionEntry[] = [];
  convertedDistributionRange: { min: number; max: number } = {
    min: 0,
    max: 0,
  };
  distributionRange: RangeValue = { min: 0, max: 0 };

  updateFilterValueFromSelection!: (range: RangeValue) => void;

  static getHelpContent(props: HistogramFieldProps) {
    return (
      <div>
        Select a range of {props.activeField.display} values with the graph
        below.
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

  constructor(props: HistogramFieldProps) {
    super(props);
    this.updateFilterValueFromSelection = debounce(
      this._updateFilterValueFromSelection.bind(this),
      50
    );
    this.handleMinInputBlur = this.handleMinInputBlur.bind(this);
    this.handleMinInputKeyPress = this.handleMinInputKeyPress.bind(this);
    this.handleMinInputChange = this.handleMinInputChange.bind(this);
    this.handleMaxInputBlur = this.handleMaxInputBlur.bind(this);
    this.handleMaxInputKeyPress = this.handleMaxInputKeyPress.bind(this);
    this.handleMaxInputChange = this.handleMaxInputChange.bind(this);
    this.handleUnknownCheckboxChange =
      this.handleUnknownCheckboxChange.bind(this);
    this.handleRangeScaleChange = this.handleRangeScaleChange.bind(this);
    this.cacheDistributionOperations(this.props);

    this.state = {
      includeUnknown: get(props.filter, 'includeUnknown', false),
      minInputValue: get(props.filter, 'value.min', ''),
      maxInputValue: get(props.filter, 'value.max', ''),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: HistogramFieldProps) {
    let distributionChanged =
      this.props.distribution !== nextProps.distribution;
    let filterChanged = this.props.filter !== nextProps.filter;

    if (distributionChanged) this.cacheDistributionOperations(nextProps);

    if (distributionChanged || filterChanged) {
      this.setState({
        includeUnknown: get(nextProps.filter, 'includeUnknown', false),
        minInputValue: get(nextProps.filter, 'value.min', ''),
        maxInputValue: get(nextProps.filter, 'value.max', ''),
      });
    }
  }

  cacheDistributionOperations(props: HistogramFieldProps) {
    this.convertedDistribution = props.distribution.map((entry) =>
      Object.assign({}, entry, { value: props.toHistogramValue(entry.value) })
    );
    var values = this.convertedDistribution.map(
      (entry) => entry.value
    ) as number[];
    var min = Math.min(...values);
    var max = Math.max(...values);
    this.convertedDistributionRange = { min, max };
    this.distributionRange = {
      min: props.toFilterValue(min),
      max: props.toFilterValue(max),
    };
  }

  formatRangeValue(value: number | string | null): number | string | null {
    const { min, max } = this.convertedDistributionRange;
    return value
      ? this.props.toFilterValue(
          clamp(this.props.toHistogramValue(value), min, max)
        )
      : null;
  }

  handleMinInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ minInputValue: event.target.value });
  }

  handleMinInputBlur() {
    this.updateFilterValueFromState();
  }

  handleMinInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') this.updateFilterValueFromState();
  }

  handleMaxInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ maxInputValue: event.target.value });
  }

  handleMaxInputBlur() {
    this.updateFilterValueFromState();
  }

  handleMaxInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') this.updateFilterValueFromState();
  }

  handleRangeScaleChange(range: any) {
    if (this.props.onRangeScaleChange != null) {
      this.props.onRangeScaleChange(this.props.activeField, range);
    }
  }

  updateFilterValueFromState() {
    const min = this.formatRangeValue(this.state.minInputValue);
    const max = this.formatRangeValue(this.state.maxInputValue);
    this.updateFilterValue({ min, max });
  }

  _updateFilterValueFromSelection(range: RangeValue) {
    const min = this.formatRangeValue(range.min);
    const max = this.formatRangeValue(range.max);
    // XXX Snap to actual values?
    this.updateFilterValue({ min, max });
  }

  updateFilterValue(range: RangeValue) {
    // only emit change if range differs from filter
    if (this.rangeIsDifferent(range)) this.emitChange(range);
  }

  handleUnknownCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    const includeUnknown = event.target.checked;
    this.setState({ includeUnknown });
    this.emitChange(get(this.props, 'filter.value'), includeUnknown);
  }

  rangeIsDifferent(range: RangeValue): boolean {
    if (this.props.filter == null)
      return range.min != null || range.max != null;
    return (
      range.min !== this.props.filter.value.min ||
      range.max !== this.props.filter.value.max
    );
  }

  emitChange(range: any, includeUnknown: boolean = this.state.includeUnknown) {
    this.props.onChange(
      this.props.activeField,
      range,
      includeUnknown,
      this.props.activeFieldState.summary.valueCounts
    );

    this.setState({
      minInputValue: get(range, 'min', ''),
      maxInputValue: get(range, 'max', ''),
    });
  }

  render() {
    var {
      activeField,
      filter,
      displayName,
      unknownCount,
      activeFieldState,
      selectByDefault,
    } = this.props;

    var distMin = this.distributionRange.min;
    var distMax = this.distributionRange.max;

    var filterValue = get(filter, 'value');

    var min =
      filterValue == null
        ? selectByDefault
          ? distMin
          : null
        : filterValue.min;

    var max =
      filterValue == null
        ? selectByDefault
          ? distMax
          : null
        : filterValue.max;

    var includeUnknown = get(
      filter,
      'includeUnknown',
      this.state.includeUnknown
    );

    var selectedMin = min == null ? null : this.props.toHistogramValue(min);
    var selectedMax = max == null ? null : this.props.toHistogramValue(max);

    var selectionTotal =
      filter && filter.selection && (filter.selection as any).length;

    var selection =
      selectionTotal != null ? ' (' + selectionTotal + ' selected) ' : null;

    return (
      <div className="range-filter">
        <div className="head">
          <div>
            <div className="overview">{this.props.overview}</div>

            <div>
              {'Select ' + activeField.display + ' from '}
              <input
                type="text"
                placeholder={String(distMin)}
                value={this.state.minInputValue || ''}
                onChange={this.handleMinInputChange}
                onKeyPress={this.handleMinInputKeyPress}
                onBlur={this.handleMinInputBlur}
              />
              {' to '}
              <input
                type="text"
                placeholder={String(distMax)}
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
                  />{' '}
                  Include {unknownCount} Unknown
                </label>
              )}
              <span className="selection-total">{selection}</span>
            </div>
          </div>
          <div>
            <UnknownCount {...(this.props as any)} />
          </div>
        </div>

        <Histogram
          distribution={this.convertedDistribution}
          onSelected={this.updateFilterValueFromSelection}
          selectedMin={selectedMin}
          selectedMax={selectedMax}
          chartType={activeField.type as 'number' | 'date'}
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
