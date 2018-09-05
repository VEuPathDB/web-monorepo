import $ from 'jquery';
import { debounce, isEqual, memoize, noop, throttle } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { lazy } from '../../Utils/ComponentUtils';
import { Seq } from '../../Utils/IterableUtils';
import DateSelector from '../InputControls/DateSelector';
import { formatDate } from './Utils';


var distributionEntryPropType = PropTypes.shape({
  value: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired
});

var Histogram = (function() {

  /** Common histogram component */
  class LazyHistogram extends React.Component {

    constructor(props) {
      super(props);
      this.handleResize = throttle(this.handleResize.bind(this), 100);
      this.emitStateChange = debounce(this.emitStateChange, 100);
      this.state = {
        uiState: this.getStateFromProps(props)
      };
      this.getRange = memoize(this.getRange);
      this.getSeriesData = memoize(this.getSeriesData);
      this.getNumFixedDigits = memoize(this.getNumFixedDigits);
    }

    componentDidMount() {
      $(window).on('resize', this.handleResize);
      $(ReactDOM.findDOMNode(this))
        .on('plotselected .chart', this.handlePlotSelected.bind(this))
        .on('plotselecting .chart', this.handlePlotSelecting.bind(this))
        .on('plotunselected .chart', this.handlePlotUnselected.bind(this))
        .on('plothover .chart', this.handlePlotHover.bind(this));

      this.createPlot();
      this.createTooltip();
      this.drawPlotSelection();
    }

    componentWillReceiveProps(nextProps) {
      if (
        nextProps.uiState.yaxisMax !== this.state.uiState.yaxisMax ||
        nextProps.uiState.xaxisMin !== this.state.uiState.xaxisMin ||
        nextProps.uiState.xaxisMax !== this.state.uiState.xaxisMax
      ) {
        this.setState({ uiState: this.getStateFromProps(nextProps) });
      }
    }

    /**
     * Conditionally update plot and selection based on props and state.
     */
    componentDidUpdate(prevProps, prevState) {
      if (!isEqual(this.props.distribution, prevProps.distribution)) {
        this.createPlot();
        this.drawPlotSelection();
      }

      if (
        prevProps.selectedMin !== this.props.selectedMin ||
        prevProps.selectedMax !== this.props.selectedMax
      ) {
        this.drawPlotSelection();
      }

      if (this.state.uiState !== prevState.uiState) {
        this.updatePlotScale(this.state.uiState);
      }
    }

    componentWillUnmount() {
      $(window).off('resize', this.handleResize);
    }

    getStateFromProps(props) {
      // Set default yAxis max based on distribution
      var yaxisMax = this.getYAxisMax(props);
      var { xaxisMin, xaxisMax } = this.getXAxisMinMax(props);
      return { yaxisMax, xaxisMin, xaxisMax };
    }

    getRange(distribution) {
      const values = distribution.map(entry => entry.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { min, max };
    }

    getXAxisMinMax(props) {
      const { min, max } = this.getRange(props.distribution);
      const barWidth = this.getBarWidth(props.distribution);

      var { xaxisMin, xaxisMax } = props.uiState;
      if (xaxisMin == null) xaxisMin = min;
      if (xaxisMax == null) xaxisMax = max + barWidth;
      return { xaxisMin, xaxisMax };
    }

    getYAxisMax(props) {
      if (props.uiState.yaxisMax != null) return props.uiState.yaxisMax;

      var counts = props.distribution.map(entry => entry.count);
      // Reverse sort, then pull out first and second highest values
      var [ max, nextMax ] = counts.sort((a, b) => a < b ? 1 : -1);
      // If max is more than twice the size of nextMax, assume it is
      // an outlier and use nextMax as the max
      var yaxisMax = max >= nextMax * 2 ? nextMax : max;
      return yaxisMax + yaxisMax * 0.1;
    }

    getBarWidth(distribution) {
      const { min, max } = this.getRange(distribution);
      return (max - min) * 0.005;
    }

    getSeriesData(distribution) {
      return [{
        data: distribution.map(entry => [ entry.value, entry.count ]),
        color: '#AAAAAA'
      },{
        data: distribution.map(entry => [ entry.value, entry.filteredCount ]),
        color: '#DA7272',
        hoverable: false,
        // points: { show: true }
      }];
    }

    getNumFixedDigits(distribution) {
      return Seq.from(distribution)
        .map(entry => getNumFixedDigits(entry.value))
        .reduce(Math.max, 0);
    }

    handleResize() {
      this.plot.resize();
      this.plot.setupGrid();
      this.plot.draw();
      this.drawPlotSelection();
    }

    handlePlotSelected(event, ranges) {
      var range = unwrapXaxisRange(ranges);
      this.props.onSelected(range);
    }

    handlePlotSelecting(event, ranges) {
      if (!ranges) return;
      var range = unwrapXaxisRange(ranges);
      this.props.onSelecting(range);
    }

    handlePlotUnselected() {
      var range = { min: null, max: null };
      this.props.onSelected(range);
    }

    drawPlotSelection() {
      var currentSelection = unwrapXaxisRange(this.plot.getSelection());
      var { selectedMin, selectedMax } = this.props;
      var { min, max } = this.getRange(this.props.distribution);

      // Selection already matches current state
      if (selectedMin === currentSelection.min && selectedMax === currentSelection.max) {
        return;
      }

      if (selectedMin === null && selectedMax === null) {
        this.plot.clearSelection(true);
      } else {
        this.plot.setSelection({
          xaxis: {
            from: selectedMin === null ? min : selectedMin,
            to: selectedMax === null ? max : selectedMax
          }
        }, true);
      }
    }

    createPlot() {
      var { distribution, chartType, timeformat } = this.props;
      var { uiState } = this.state;

      var barWidth = this.getBarWidth(distribution);

      var xaxisBaseOptions = chartType === 'date'
        ? { mode: 'time', timeformat: timeformat }
        : {};


      var seriesData = this.getSeriesData(distribution);

      var plotOptions = {
        series: {
          bars: {
            show: true,
            fillColor: { colors: [{ opacity: 1 }, { opacity: 1 }] },
            barWidth: barWidth,
            lineWidth: 0,
            align: 'left'
          }
        },
        xaxis: Object.assign({
          tickLength: 0,
          min: uiState.xaxisMin,
          max: uiState.xaxisMax
        }, xaxisBaseOptions),
        yaxis: {
          min: 0,
          max: uiState.yaxisMax
        },
        grid: {
          clickable: true,
          hoverable: true,
          autoHighlight: false,
          borderWidth: 0
        },
        selection: {
          mode: 'x',
          color: '#66A4E7'
        }
      };

      if (this.plot) this.plot.destroy();

      this.$chart = $(ReactDOM.findDOMNode(this)).find('.chart');
      this.plot = $.plot(this.$chart, seriesData, plotOptions);
    }

    createTooltip() {
      this.tooltip = this.$chart
        .qtip({
          prerender: true,
          content: ' ',
          position: {
            target: 'mouse',
            viewport: this.$el,
            my: 'bottom center'
          },
          show: false,
          hide: {
            event: false,
            fixed: true
          },
          style: {
            classes: 'qtip-wdk'
          }
        });
    }

    handlePlotHover(event, pos, item) {
      var qtipApi = this.tooltip.qtip('api'),
        previousPoint;

      if (!item) {
        qtipApi.cache.point = false;
        return qtipApi.hide(item);
      }

      previousPoint = qtipApi.cache.point;

      if (previousPoint !== item.dataIndex) {
        qtipApi.cache.point = item.dataIndex;
        var entry = this.props.distribution[item.dataIndex];
        var formattedValue = this.props.chartType === 'date'
          ? formatDate(this.props.timeformat, entry.value)
          : entry.value;

        // FIXME Format date
        qtipApi.set('content.text',
          this.props.xaxisLabel + ': ' + formattedValue +
          '<br/>All ' + this.props.yaxisLabel + ': ' + entry.count +
          '<br/>Matching ' + this.props.yaxisLabel + ': ' + entry.filteredCount);
        qtipApi.elements.tooltip.stop(1, 1);
        qtipApi.show(item);
      }
    }

    updatePlotScale(partialUiState) {
      const { yaxisMax, xaxisMin, xaxisMax } = partialUiState;

      if (yaxisMax == null && xaxisMin == null && xaxisMax == null) return;

      const plotOptions = this.plot.getOptions();

      const {
        yaxes: { 0: { max: currYaxisMax } },
        xaxes: { 0: { min: currXaxisMin, max: currXaxisMax } }
      } = plotOptions;

      if (
        (yaxisMax != null && yaxisMax !== currYaxisMax) ||
        (xaxisMin != null && xaxisMin !== currXaxisMin) ||
        (xaxisMax != null && xaxisMax !== currXaxisMax)
      ) {
        if (yaxisMax != null) plotOptions.yaxes[0].max = yaxisMax;
        if (xaxisMin != null) plotOptions.xaxes[0].min = xaxisMin;
        if (xaxisMax != null) plotOptions.xaxes[0].max = xaxisMax;
        this.plot.setupGrid();
        this.drawPlotSelection();
        this.plot.draw();
      }
    }

    updateUIState(uiState) {
      this.setState({ uiState });
      this.emitStateChange(uiState);
    }

    emitStateChange(uiState) {
      this.props.onUiStateChange(uiState);
    }

    setYAxisMax(yaxisMax) {
      this.updateUIState(Object.assign({}, this.state.uiState, { yaxisMax }));
    }

    setXAxisScale(xaxisMin, xaxisMax) {
      this.updateUIState(Object.assign({}, this.state.uiState, { xaxisMin, xaxisMax }));
    }

    render() {
      var { xaxisLabel, yaxisLabel, chartType, timeformat, distribution } = this.props;
      var { yaxisMax, xaxisMin, xaxisMax } = this.state.uiState;

      var numFixedDigits = this.getNumFixedDigits(distribution);
      var barWidth = this.getBarWidth(distribution);
      var step = 1 * Math.pow(10, numFixedDigits * -1);

      var counts = distribution.map(entry => entry.count);
      var countsMin = Math.min(...counts);
      var countsMax = Math.max(...counts);

      var values = distribution.map(entry => entry.value);
      var valuesMin = Math.min(...values);
      var valuesMax = Math.max(...values) + barWidth;

      var xaxisMinSelector = chartType === 'date' ? (
        <DateSelector
          value={formatDate(timeformat, xaxisMin)}
          start={formatDate(timeformat, valuesMin)}
          end={formatDate(timeformat, xaxisMax)}
          onChange={value => this.setXAxisScale(new Date(value).getTime(), xaxisMax)}
        />
      ) : (
        <input
          type="number"
          value={xaxisMin.toFixed(numFixedDigits)}
          min={valuesMin.toFixed(numFixedDigits)}
          max={xaxisMax.toFixed(numFixedDigits)}
          step={step}
          onChange={e => this.setXAxisScale(Number(e.target.value), xaxisMax)}
        />
      );

      var xaxisMaxSelector = chartType === 'date' ? (
        <DateSelector
          value={formatDate(timeformat, xaxisMax)}
          start={formatDate(timeformat, xaxisMin)}
          end={formatDate(timeformat, valuesMax)}
          onChange={value => this.setXAxisScale(xaxisMin, new Date(value).getTime())}
        />
      ) : (
        <input
          type="number"
          value={xaxisMax.toFixed(numFixedDigits)}
          min={xaxisMin.toFixed(numFixedDigits)}
          max={valuesMax.toFixed(numFixedDigits)}
          step={step}
          onChange={e => this.setXAxisScale(xaxisMin, Number(e.target.value))}
        />
      );

      return (
        <div className="chart-container">
          <div className="chart"></div>
          <div className="chart-title x-axis">{xaxisLabel}</div>
          <div>
            Zoom: {xaxisMinSelector} to {xaxisMaxSelector} &nbsp; <button
              type="button"
              onClick={() => this.setXAxisScale(valuesMin, valuesMax)}
            >reset</button>
          </div>
          <div className="chart-title y-axis">
            <div>{yaxisLabel}</div>
            <div>
              <input
                style={{width: '90%'}}
                type="range"
                min={Math.max(countsMin, 1)}
                max={countsMax + countsMax * 0.1}
                title={yaxisMax}
                value={yaxisMax}
                onChange={e => this.setYAxisMax(Number(e.target.value))}/>
            </div>
          </div>
        </div>
      );
    }

  }

  LazyHistogram.propTypes = {
    distribution: PropTypes.arrayOf(distributionEntryPropType).isRequired,
    selectedMin: PropTypes.number,
    selectedMax: PropTypes.number,
    chartType: PropTypes.oneOf([ 'number', 'date' ]).isRequired,
    timeformat: PropTypes.string,
    xaxisLabel: PropTypes.string,
    yaxisLabel: PropTypes.string,

    uiState: PropTypes.shape({
      xaxisMin: PropTypes.number,
      xaxisMax: PropTypes.number,
      yaxisMax: PropTypes.number
    }),

    onUiStateChange: PropTypes.func,

    onSelected: PropTypes.func,
    onSelecting: PropTypes.func,
    onUnselected: PropTypes.func
  };

  LazyHistogram.defaultProps = {
    xaxisLabel: 'X-Axis',
    yaxisLabel: 'Y-Axis',
    selectedMin: null,
    selectedMax: null,
    uiState: {},
    onSelected: noop,
    onSelecting: noop,
    onUnselected: noop
  };

  return lazy(async () => {
    await Promise.all([
      import('lib/jquery-flot'),
      import('lib/jquery-flot-categories'),
      import('lib/jquery-flot-selection'),
      import('lib/jquery-flot-time')
    ]);
  })(LazyHistogram);
})();

export default Histogram;

/**
 * Reusable histogram field component. The parent component is responsible for
 * preparing the data.
 */
function unwrapXaxisRange(flotRanges) {
  if (flotRanges == null) {
    return { min: null, max: null };
  }

  var { from: min, to: max } = flotRanges.xaxis;
  return { min, max };
}

const FIXED_DIGITS_RE = /^(\d*)\.?(\d*)$/;
function getNumFixedDigits(num) {
  const matches = FIXED_DIGITS_RE.exec(String(num));
  return matches == null ? 0 : matches[2].length;
}
