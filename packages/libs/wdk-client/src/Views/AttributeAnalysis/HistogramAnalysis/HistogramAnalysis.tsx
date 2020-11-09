import { range, round } from 'lodash';
import React from 'react';
import { lazy, makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import 'wdk-client/Views/AttributeAnalysis/HistogramAnalysis/HistogramAnalysis.scss';
import { isTypeInt, isTypeCategory } from 'wdk-client/Views/AttributeAnalysis/HistogramAnalysis/HistogramAnalysisUtils';

export type ModuleState = any;

const numberFormat = new Intl.NumberFormat('en-us');

type HistogramProps = {
  attrLabel: string;
  recordCountLabel: string;
  data: Record<string, number>;
  binSize: number;
  avg: number;
  median: number;
  max: number;
  min: number;
  type: 'int' | 'float' | 'category';
  logXAxis: boolean;
  logYAxis: boolean;
  onBinSizeChange: (binSize: number) => void;
  onLogScaleXAxisChange: (scale: boolean) => void;
  onLogScaleYAxisChange: (scale: boolean) => void;
}

const cx = makeClassNameHelper('HistogramAnalysis');

export const Histogram = lazy<HistogramProps>(async () => {
  // @ts-ignore
  await import('!!script-loader!../../../../vendored/flot/jquery.flot');
  await Promise.all([
    // @ts-ignore
    import('!!script-loader!../../../../vendored/flot/jquery.flot.categories'),
    // @ts-ignore
    import('!!script-loader!../../../../vendored/flot/jquery.flot.selection'),
    // @ts-ignore
    import('!!script-loader!../../../../vendored/flot/jquery.flot.time')
  ]);
})(class Histogram extends React.Component<HistogramProps> {

  plotNode: HTMLElement | null = null;

  componentDidMount() {
    this.drawPlot();
  }

  componentDidUpdate() {
    this.drawPlot();
  }

  drawPlot() {
    if (this.plotNode == null) return;

    const { logXAxis, logYAxis, attrLabel, recordCountLabel } = this.props;

    // get data and labels
    const [ data, labels ] = convertData(this.props);
    const plotData = logYAxis
      ? data.map(([ x, y ]) => [ x, Math.log10(y)])
      : data;
    const dagger = '<sup><b>&dagger;</b></sup>';
    const binLabel = attrLabel;
    const sizeLabel = recordCountLabel;
    const options: any = getOptions(binLabel, sizeLabel, labels);

    // draw plot
    const plotCanvas = $(this.plotNode);
    let previousPoint: any = null;
    $.plot(plotCanvas, [ plotData ], options);
    plotCanvas
      .off("plothover")
      .on("plothover", (event: any, pos: any, item: any) => {
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#flot-tooltip").remove();
            const entry = plotData[item.dataIndex];
            const typeValue = numberFormat.format(entry[1]);
            const content = `${sizeLabel} = ${typeValue} ${logYAxis ? dagger : ''} <br/>` +
              `${binLabel} = ${labels[item.dataIndex][1]} ${logXAxis ? dagger : ''} `;
            const logNote = logXAxis || logYAxis ? `<br/><br/>${dagger} <em>log<sub>10</sub> applied to data</em>` : '';
            showTooltip(item.pageX, item.pageY, content + logNote);
          }
        } else {
          $("#flot-tooltip").remove();
          previousPoint = null;
        }
      });
    // rotate label so it can be displayed without overlap.
    plotCanvas.find(".flot-x-axis .flot-tick-label").addClass("rotate45");
  }

  getStep() {
    const { min, max, type, logXAxis } = this.props;
    const isInt = isTypeInt(type) && !logXAxis;
    return isInt ? 1 : round((max - min) / 100, 3);
  }

  render() {
    const { avg, min, max, median, binSize, type, logXAxis, logYAxis, attrLabel, recordCountLabel, onBinSizeChange, onLogScaleYAxisChange } = this.props;
    const minBinSize = Math.min(Math.abs(min), Math.abs(max));
    const maxBinSize = Math.max(Math.abs(min), Math.abs(max));

    return (
      <div className={cx()}>
        <div className={cx('Graph')} ref={node => this.plotNode = node}></div>
        <div className={cx('RecordCountLabel')}>
          {logYAxis
            ? <>{recordCountLabel} (log<sub>10</sub>)</>
            : recordCountLabel
          }
        </div>
        <div className={cx('AttrLabel')}>
          {logXAxis
            ? <>{attrLabel} (log<sub>10</sub>)</>
            : attrLabel
          }
        </div>
        {isTypeCategory(type) ? null : (
          <>
            <div className={cx('Summary')}>
              <dl>
                <dt>Min</dt>
                <dd>{numberFormat.format(min)}</dd>  
                <dt>Mean</dt>
                <dd>{numberFormat.format(avg)}</dd>
                <dt>Median</dt>
                <dd>{numberFormat.format(median)}</dd>
                <dt>Max</dt>
                <dd>{numberFormat.format(max)}</dd>
              </dl>
            </div>
            <div className={cx('Controls')}>
              <label>Size of bins: <input type="number" min={minBinSize} max={maxBinSize} step={this.getStep()} value={binSize} onChange={e => onBinSizeChange(Number(e.target.value))} /></label>
              <input className={cx('Slider')} type="range" min={minBinSize} max={maxBinSize} step={this.getStep()}onChange={e => onBinSizeChange(Number(e.target.value))} value={binSize}/>
            </div>
          </>
        )}
        <div className={cx('Controls')}>
          <div>Apply log<sub>10</sub> scale:</div>
          {/* Need to handle N <= 0 before enabling scaling of x-axis. See https://redmine.apidb.org/issues/30632 */}
          {/*<label><input type="checkbox" name="logXAxis" checked={logXAxis} onChange={e => onLogScaleXAxisChange(e.target.checked)} />  {attrLabel} </label>*/}
          <label><input type="checkbox" name="logYAxis" checked={logYAxis} onChange={e => onLogScaleYAxisChange(e.target.checked)} />  {recordCountLabel} </label>
        </div>
      </div>
    )
  }
})

function convertData(props: HistogramProps) {
  const { type } = props;
  // convert data into bins and/or logarithm display
  return isTypeCategory(type) ? convertCategoryData(props)
    : convertNumericData(props);
}

type Bin = [ number, number ];
type Label = [ number, string ];

type SeriesData = [ Bin[], Label[] ];

function convertCategoryData(props: HistogramProps): SeriesData {
  const { data : dataObject, binSize } = props;

  const data: [string, number][] = Object.entries(dataObject);

  const bins: Bin[] = [];
  const labels: Label[] = [];
  for (let i = 0; i < data.length; i += binSize) {
    const bin = [];
    let count = 0;
    const upper = Math.min(i + binSize, data.length);
    for (let j = i; j < upper; j++) {
      bin.push(data[j][0]);
      count += data[j][1];
    }

    // now compute new label;
    let label = "";
    if (bin.length === 1) {
      label = bin[0];
      if(label.length > 20) {
        label = label.substring(0,20) + "...";
      }
    }
    else {
      for (let k = 0; k < bin.length; k++) {
        label += (k === 0) ? "[" : ", ";
        label += bin[k];
      }
      label += "]";
    }

    // add data into bins
    bins.push([ i, count ]);
    labels.push([ i, label ]);
  }
  return [bins,labels];
}


function convertNumericData(props: HistogramProps): SeriesData {
  const { data: dataObject, binSize, type, min, max, logXAxis } = props;
  const data: [number, number][] = Object.entries(dataObject)
    .map(([x, y]) => [
      logXAxis ? Math.log10(Number(x)) : Number(x),
      y
    ] as [number, number]);
  const isInt = isTypeInt(type) && !logXAxis;


  // create bins
  const tempBins = range(min, isInt ? max + 1 : max, binSize)
    .map(i => [[i, i + binSize], 0] as [ [number,number], number])

  // assign rows into each bin
  for (const [ label, count ] of data) {
    for (const binEntry of tempBins) {
      let bin = binEntry[0];
      if (bin[0] <= label && label < bin[1]) {
        binEntry[1] += count;
        break;
      }
    }
  }

  // now compute new labels
  let bins: Bin[] = [];
  let labels: Label[] = [];
  let counter = 0;
  for (let [ tmpBin, count ] of tempBins) {
    let label: string;
    let bin: [ string, string ] = tmpBin.map(String) as [string, string];;
    if (binSize == 1 && isInt) label = numberFormat.format(tmpBin[0]);
    else {
      if (!isInt) {
        bin[0] = numberFormat.format(tmpBin[0]);
        bin[1] = numberFormat.format(tmpBin[1]);
      }
      const upper = (isInt) ? numberFormat.format((tmpBin[1] - 1)) + "]" : bin[1] + ")";
      label = "[" + bin[0] + ", " + upper;
    }
    let j = counter++;
    bins.push([ j, count ]);
    labels.push([ j, label ]);
  }
  return [ bins, labels ];
}


function getOptions(binLabel: string, sizeLabel: string, labels: Label[]) {
  const options = {
    series: {
      color: "#0044AA",
      bars: { show: true, align: "center", barWidth: 0.9, fill: true, fillColor: { colors: [{ opacity: 0.8 }, { opacity: 0.6 }] } },
      points: { show: true }
    },
    grid: { hoverable: true, clickable: true },
    xaxis: { ticks: labels, axisLabel: binLabel },
    yaxis: { axisLabel: sizeLabel }
  };
  return options;
}


function showTooltip(x: number, y: number, contents: string) {
  $("<div id='flot-tooltip'>" + contents + "</div>").css({
    top: y - 20,
    left: x + 5,
  }).appendTo("body").fadeIn(500);
}
