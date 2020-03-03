import $ from 'jquery';
import { debounce, isEqual, memoize, noop, orderBy, throttle, get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { lazy } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import DateRangeSelector from 'wdk-client/Components/InputControls/DateRangeSelector';
import NumberRangeSelector from 'wdk-client/Components/InputControls/NumberRangeSelector';
import { formatDate, formatNumber, parseDate } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { CollapsibleSection } from 'wdk-client/Components';

const DAY = 1000 * 60 * 60 * 24;

var distributionEntryPropType = PropTypes.shape({
  value: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  filteredCount: PropTypes.number.isRequired
});

const transforms = {
  none: {
    display: 'None',
    xform: v => v,
    inverse: v => v
  },
  e: {
    display: 'log',
    xform: v => Math.log(v + 1),
    inverse: v => Math.exp(v) - 1
  },
  2: {
    display: 'log2',
    xform: v => Math.log2(v + 1),
    inverse: v => Math.pow(2, v) - 1
  },
  10: {
    display: 'log10',
    xform: v => Math.log10(v + 1),
    inverse: v => Math.pow(10, v) - 1
  }
}

const PLOT_SETTINGS_OPEN_KEY = 'wdk/filterParam/plotSettingsOpen';

var Histogram = (function() {

  /** Common histogram component */
  class LazyHistogram extends React.Component {

    constructor(props) {
      super(props);
      this.handleResize = throttle(this.handleResize.bind(this), 100);
      this.emitStateChange = debounce(this.emitStateChange, 100);
      this.state = {
        uiState: this.getStateFromProps(props),
        showSettings: sessionStorage.getItem(PLOT_SETTINGS_OPEN_KEY) !== 'false'
      };
      this.getRange = memoize(this.getRange);
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

    UNSAFE_componentWillReceiveProps(nextProps) {
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
    componentDidUpdate(prevProps) {
      if (
        !isEqual(this.props.distribution, prevProps.distribution) ||
        this.props.uiState !== prevProps.uiState
      ) {
        this.createPlot();
        this.drawPlotSelection();
      }

      if (
        prevProps.selectedMin !== this.props.selectedMin ||
        prevProps.selectedMax !== this.props.selectedMax
      ) {
        this.drawPlotSelection();
      }
    }

    componentWillUnmount() {
      $(window).off('resize', this.handleResize);
      if (this.plot) this.plot.destroy();
      if (this.tooltip) this.tooltip.qtip('destroy');
    }

    getStateFromProps(props) {
      // Set default yAxis max based on distribution
      var yaxisMax = props.uiState.yaxisMax != null ? props.uiState.yaxisMax : this.getYAxisMax(props);
      var { xaxisMin, xaxisMax } = this.getXAxisMinMax(props);
      var { scaleYAxis = false, binSize = 0, binStart = Math.min(xaxisMin, 0), yaxisMin = 0 } = props.uiState;
      return { yaxisMax, xaxisMin, xaxisMax, scaleYAxis, binSize, binStart, yaxisMin };
    }

    getRange(distribution) {
      return distribution.reduce(({ min, max }, entry) => ({
        min: Math.min(min, entry.value),
        max: Math.max(max, entry.value)
      }), { min: Infinity, max: -Infinity });
    }

    getXAxisMinMax(props) {
      const { min, max } = this.getRange(props.distribution);
      var { xaxisMin, xaxisMax } = props.uiState;
      if (xaxisMin == null) xaxisMin = min;
      if (xaxisMax == null) xaxisMax = max;
      return { xaxisMin, xaxisMax };
    }

    getYAxisMax(props) {
      var counts = props.distribution.map(entry => entry.count);
      // Reverse sort, then pull out first and second highest values
      var [ max, nextMax ] = counts.sort((a, b) => a < b ? 1 : -1);
      // If max is more than twice the size of nextMax, assume it is
      // an outlier and use nextMax as the max
      var yaxisMax = max >= nextMax * 2 ? nextMax : max;
      return yaxisMax;
    }

    getClampedDistribution(distribution, uiState) {
      const { xaxisMin, xaxisMax } = uiState;
      return xaxisMin == null && xaxisMax == null ? distribution
        : xaxisMax == null ? distribution.filter(entry => entry.value >= xaxisMin)
        : xaxisMin == null ? distribution.filter(entry => entry.value <= xaxisMax)
        : distribution.filter(entry => entry.value >= xaxisMin && entry.value <= xaxisMax);
    }

    getBarWidth(distribution) {
      // padding factor
      const padding = 0.75;
      const { min, max } = this.getRange(distribution);
      const minWidth = (max - min) * 0.00075
      // For dates, use one day as width
      if (this.props.chartType === 'date') return Math.max((1000 * 60 * 60 * 24) * padding, minWidth);

      // Find min distance between two points
      const sortedDistribution = orderBy(distribution, d => d.value, 'asc');
      const { minDistance } = sortedDistribution.reduce(({ prevValue, minDistance }, entry) => ({
        prevValue: entry.value,
        minDistance: prevValue == null ? minDistance : Math.min(entry.value - prevValue, minDistance)
      }), { prev: null, minDistance: Infinity });
      return Math.max(minDistance * padding, minWidth);
    }
    
    getBinnedDistribution(binSize, binStart, distribution) {
      return createBinnedDistribution(
        this.props.chartType === 'date' ? binSize * DAY : binSize,
        this.props.chartType === 'date' ? binStart * DAY : binStart,
        distribution
      );
    }

    getSeriesData(distribution) {
      return [{
        data: distribution.map(entry => [ entry.value, entry.count ]),
      },{
        data: distribution.map(entry => [ entry.value, entry.filteredCount ]),
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
      const currentSelection = unwrapXaxisRange(this.plot.getSelection());
      const { selectedMin, selectedMax } = this.props;
      const { min, max } = this.getRange(this.props.distribution);

      // Selection already matches current state
      if (selectedMin === currentSelection.min && selectedMax === currentSelection.max) {
        return;
      }

      if (selectedMin === null && selectedMax === null) {
        this.plot.clearSelection(true);
      } else {
        this.plot.setSelection({
          xaxis: {
            from: (selectedMin === null ? min : selectedMin)/*  - (barWidth / 2) */,
            to: (selectedMax === null ? max : selectedMax)/*  + (barWidth / 2) */
          }
        }, true);
      }
    }

    createPlot() {
      var { chartType, timeformat } = this.props;
      var { uiState } = this.state;
      var { binSize, binStart } = uiState;
      const distribution = binSize ? this.getBinnedDistribution(binSize, binStart, this.props.distribution) : this.props.distribution;
      const clampedDistribution = binSize ? distribution : this.getClampedDistribution(distribution, uiState);

      var barWidth = binSize
        ? (
          chartType === 'date'
            ? binSize * DAY
            : binSize
        )
        : this.getBarWidth(clampedDistribution);

      var xaxisBaseOptions = chartType === 'date'
        ? { mode: 'time', timeformat: timeformat }
        : {
          tickFormatter: value => formatNumber(value, { useScientificNotation: true })
        };


      var seriesData = this.getSeriesData(clampedDistribution);

      var yTransform = this.state.uiState.scaleYAxis ? transforms['10'] : transforms.none;

      const opacity = binSize ? 0.75 : 1;
      const lineWidth = binSize ? 1 : 0;

      var plotOptions = {
        series: {
          bars: {
            show: true,
            barWidth: barWidth,
            fill: true,
            fillColor: { colors: [{ opacity }, { opacity }] },
            lineWidth,
            align: binSize ? 'left' : 'center'
          }
        },
        colors: [ '#AAAAAA', '#DA7272' ],
        xaxis: Object.assign({
          tickLength: 0,
          min: binSize ? uiState.xaxisMin : uiState.xaxisMin - barWidth,
          max: binSize ? uiState.xaxisMax  : uiState.xaxisMax + barWidth
        }, xaxisBaseOptions),
        yaxis: {
          min: uiState.yaxisMin,
          max: uiState.yaxisMax,
          transform: yTransform.xform,
          inverseTransform: yTransform.inverse,
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
            target: this.$chart,
            viewport: 'window',
            my: 'bottom center',
            at: 'top left',
          },
          show: false,
          hide: {
            delay: 2000,
            fixed: true,
          },
          style: {
            classes: 'qtip-wdk'
          }
        })

    }

    handlePlotHover(event, pos, item) {
      var qtipApi = this.tooltip.qtip('api');

      if (!item) {
        qtipApi.cache.point = false;
        return;
      }
      
      if (qtipApi.cache.point !== item.dataIndex) {
        qtipApi.cache.point = item.dataIndex;
        const [
          { data: unfilteredData },
          { data: filteredData }
        ] = this.plot.getData();
        const [ value, unfilteredCount ] = unfilteredData[item.dataIndex];
        const [ , filteredCount ] = filteredData[item.dataIndex];
        const pointToPixelFactor = item.series.xaxis.box.width / (item.series.xaxis.max - item.series.xaxis.min);
        const barWidthPx = item.series.bars.barWidth / 2 * pointToPixelFactor;
        var formattedValue = this.props.chartType === 'date'
          ? formatDate(this.props.timeformat, value)
          : formatNumber(value, { useScientificNotation: false });
        var formattedBinEnd = this.props.chartType === 'date'
          ? formatDate(this.props.timeformat, value + (this.state.uiState.binSize || 0) * DAY)
          : formatNumber(value + (this.state.uiState.binSize || 0), { useScientificNotation: false });
        var binRange = `[${formattedValue}, ${formattedBinEnd})`;
        var valueDisplay = this.state.uiState.binSize ? binRange : formattedValue;
        qtipApi.set('content.text',
          this.props.xaxisLabel + ': ' + valueDisplay +
          '<br/>All ' + this.props.yaxisLabel + ': ' + unfilteredCount +
          '<br/>Remaining ' + this.props.yaxisLabel + ': ' + filteredCount);
        const offset = this.$chart.offset();
        qtipApi.set('position.adjust.x', item.pageX - offset.left + (this.state.uiState.binSize ? barWidthPx : 0));
        qtipApi.set('position.adjust.y', Math.max(item.pageY - offset.top, 0));
        qtipApi.show(item);
      }
    }

    updateUIState(updater) {
      this.setState(
        ({ uiState }) => ({ uiState: updater(uiState) }),
        () => this.emitStateChange(this.state.uiState)
      );
    }

    emitStateChange(uiState) {
      this.props.onUiStateChange(uiState);
    }

    // x-axis settings
    // ---------------

    setXAxisRange(xaxisMin, xaxisMax) {
      this.updateUIState(uiState => ({ ...uiState, xaxisMin, xaxisMax }));
    }

    setXAxisBinSize(binSize) {
      this.setXAxisBinState(this.state.uiState.binStart, binSize);
    }

    setXAxisBinStart(binStart) {
      this.setXAxisBinState(binStart, this.state.uiState.binSize);
    }

    setXAxisBinState(binStart, binSize) {
      const distribution = binSize ? this.getBinnedDistribution(binSize, binStart, this.props.distribution) : this.props.distribution;
      const yaxisMax = binSize
        ? Math.max(...distribution.map(entry => entry.count))
        : this.getYAxisMax(this.props)
      this.updateUIState(uiState => ({ ...uiState, binStart, binSize, yaxisMax }));
    }

    resetXAxisState() {
      const { min: xaxisMin, max: xaxisMax } = this.getRange(this.props.distribution);
      this.setXAxisRange(xaxisMin, xaxisMax);
      this.setXAxisBinState(Math.min(0, xaxisMin), 0);
    }

    // y-axis settings
    // ---------------

    setYAxisRange(yaxisMin, yaxisMax) {
      this.updateUIState(uiState => ({ ...uiState, yaxisMin, yaxisMax }));
    }

    setScaleYAxis(scaleYAxis) {
      this.updateUIState(uiState => ({ ...uiState, scaleYAxis }));
    }

    resetYAxisState() {
      const { binStart, binSize } = this.state.uiState;
      this.setXAxisBinState(binStart, binSize);
      this.setScaleYAxis(false);
      this.updateUIState(uiState => ({ ...uiState, yaxisMin: 0 }));
    }

    setSettingsOpen(showSettings) {
      sessionStorage.setItem(PLOT_SETTINGS_OPEN_KEY, JSON.stringify(Boolean(showSettings)));
      this.setState({ showSettings })
    }

    resetUiState() {
      this.resetXAxisState();
      this.resetYAxisState();
    }

    render() {
      var { xaxisLabel, yaxisLabel, chartType, timeformat, distribution } = this.props;
      var { showSettings } = this.state;
      var { yaxisMin, yaxisMax, xaxisMin, xaxisMax } = this.state.uiState;

      var numFixedDigits = this.getNumFixedDigits(distribution);
      var step = 1 * Math.pow(10, numFixedDigits * -1);

      var values = distribution.map(entry => entry.value);
      var valuesMin = Math.min(...values);
      var valuesMax = Math.max(...values);

      var xaxisScaleSelector = chartType === 'date' ? (
        <DateRangeSelector
          inline
          hideReset
          value={{ min: formatDate(timeformat, xaxisMin), max: formatDate(timeformat, xaxisMax) }}
          start={formatDate(timeformat, valuesMin)}
          end={formatDate(timeformat, valuesMax)}
          onChange={value => this.setXAxisRange(parseDate(value.min).getTime(), parseDate(value.max).getTime())}
        />
      ) : (
        <React.Fragment>
          <NumberRangeSelector
            value={{ min: Number(xaxisMin.toFixed(numFixedDigits)), max: Number(xaxisMax.toFixed(numFixedDigits)) }}
            start={-Infinity}
            end={Infinity}
            step={step}
            onChange={value => this.setXAxisRange(Number(value.min), Number(value.max))}
          />
        </React.Fragment>
      );

      var yAxisScaleSelector = (
        <NumberRangeSelector
          value={{ min: yaxisMin, max: yaxisMax }}
          start={0}
          end={Infinity}
          onChange={value => this.setYAxisRange(Number(value.min), Number(value.max))}
        />
      );

      return (
        <div className="chart-container">
          <div className="chart"></div>
            <div className="chart-title y-axis">
              <div>
                {yaxisLabel}
              </div>
            </div>
          <div className="chart-title x-axis">{xaxisLabel}</div>
          <CollapsibleSection
            isCollapsed={!showSettings}
            onCollapsedChange={isCollasped => this.setSettingsOpen(!isCollasped)}
            headerContent={<div><Icon fa="gear"/>&nbsp;&nbsp;Plot Settings</div>}
            className="chart-controls"
          >
            <fieldset>
              <legend>x-axis{/*xaxisLabel*/}</legend>
              <div>
                <div>Range: {xaxisScaleSelector}</div>
              </div>
              {chartType !== 'date' && <div>Bin start: <input type="number" max={valuesMin} value={this.state.uiState.binStart} onFocus={autoSelectOnFocus} onChange={e => this.setXAxisBinStart(eventToNumber(e))}/></div>}
              <div>Bin width: <input type="number" min={0} value={this.state.uiState.binSize} onFocus={autoSelectOnFocus} onChange={e => this.setXAxisBinSize(eventToNumber(e))}/>
                <em style={{ color: '#444444', marginLeft: '1em' }}> When bin size = 0, the count of discrete values is shown</em>
              </div>
              <div><button type="button" onClick={() => this.resetXAxisState()}>Reset to defaults</button></div>
            </fieldset>
            <fieldset>
              <legend>y-axis{/*yaxisLabel*/}</legend>
              <div>Range: {yAxisScaleSelector}&nbsp;&nbsp;</div>
              <div>Scale counts:&nbsp;&nbsp;
                <label>
                  <input type="radio" checked={!this.state.uiState.scaleYAxis} onFocus={autoSelectOnFocus} onChange={() => this.setScaleYAxis(false)}/>
                  &nbsp;linear
                </label>
                &nbsp;&nbsp;&nbsp;
                <label>
                  <input type="radio" checked={this.state.uiState.scaleYAxis} onFocus={autoSelectOnFocus} onChange={() => this.setScaleYAxis(true)}/>
                  &nbsp;log<sub>10</sub>
                </label>
              </div>
              <div><button type="button" onClick={() => this.resetYAxisState()}>Reset to defaults</button></div>
            </fieldset>
            {/* <div><button type="button" onClick={() => this.resetUiState()}>Reset to defaults</button></div> */}
          </CollapsibleSection>
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
      yaxisMin: PropTypes.number,
      yaxisMax: PropTypes.number,
      binSize: PropTypes.number,
      binStart: PropTypes.number,
      scaleYAxis: PropTypes.bool,
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
    await import('lib/jquery-flot');
    await Promise.all([
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

// # Notes on binning
//
// - Bins will be left-inclusive, right-exclusive. E.g., [1-3)
// - There are two controls: binSize and binStart.
// - Binning will be done by transforming datapoints into
//   the start value of the bin in which it will be assigned.
// - Bar width will be determined by binSize.
//

function assignBin(binSize, binStart, value) {
  if (value < binStart) return;
  const shift = binStart % binSize;
  const shiftedValue = value - shift;
  const multiplier = Math.floor(shiftedValue / binSize);
  const bin = binSize * multiplier;
  return bin + shift
}

function createBinnedDistribution(binSize, binStart, distribution) {
  const binnedObject = distribution.reduce((binnedDist, entry) => {
    const bin = assignBin(binSize, binStart, entry.value);
    if (bin == null) return binnedDist;
    const count = get(binnedDist, [bin, 'count'], 0) + entry.count;
    const filteredCount = get(binnedDist, [bin, 'filteredCount'], 0) + entry.filteredCount;
    return Object.assign(binnedDist, { [bin]: { count, filteredCount }});
  }, {});
  return Object.entries(binnedObject).map(entry => ({
    value: Number(entry[0]),
    ...entry[1]
  }));
}

function eventToNumber(event) {
  const value = event.target.value.trim();
  return value === '' ? undefined : Number(value);
}

function autoSelectOnFocus(event) {
  event.target.select();
}
