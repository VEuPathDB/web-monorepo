import { DispatchAction } from '../../../Core/CommonTypes';
import { memoize, range } from 'lodash';
import React from 'react';
import { lazy, makeClassNameHelper } from '../../../Utils/ComponentUtils';
import { AttributeAnalysis } from '../BaseAttributeAnalysis/BaseAttributeAnalysis';
import { DisplayType, SetBinSize, SetDisplayType } from './HistogramActions';
import './HistogramAnalysis.scss';
import { State } from './HistogramState';




export type ModuleState = State;

type ModuleProps = {
  state: ModuleState;
  dispatch: DispatchAction;
}

export default class HistogramAnalysis extends React.PureComponent<ModuleProps> {

  getData = memoize((data: Record<string,number>, type: string) =>
    Object.entries(data).map(([ attrValue, recordCount]) => ({
      attrValue: type === 'category' ? String(attrValue) : Number(attrValue),
      recordCount: recordCount
    })))

  setBinSize = (binSize: number) =>
    this.props.dispatch(SetBinSize.create(binSize));

  setDisplayType = (displayType: DisplayType) =>
    this.props.dispatch(SetDisplayType.create(displayType));

  render() {
    if (this.props.state.data.status !== 'success') return null;

    const { data: { report }, visualization } = this.props.state;
    
    const columns = [
      { key: 'attrValue', display: report.attrLabel },
      { key: 'recordCount', display: report.recordCountLabel }
    ];

    return (
      <AttributeAnalysis
        {...this.props}
        tableConfig={{
          columns,
          data: this.getData(report.data, report.type)
        }}
        visualizationConfig={{
          display: 'Histogram',
          content: <Histogram
            {...report}
            {...visualization}
            onBinSizeChange={this.setBinSize}
            onDisplayTypeChange={this.setDisplayType}
          />
        }}
      />
    )
  }
}

type HistogramProps = {
  attrLabel: string;
  recordCountLabel: string;
  avg: number;
  binCount: number;
  binSize: number;
  data: Record<string, number>;
  max: number;
  maxBinCount: number;
  min: number;
  type: 'int' | 'float' | 'category';
  displayType: DisplayType;
  onBinSizeChange: (binSize: number) => void;
  onDisplayTypeChange: (displayType: DisplayType) => void;
}

const cx = makeClassNameHelper('HistogramAnalysis');

const Histogram = lazy<HistogramProps>(async () => {
  await Promise.all([
    import('lib/jquery-flot'),
    import('lib/jquery-flot-categories'),
    import('lib/jquery-flot-selection'),
    import('lib/jquery-flot-time')
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

    const { binSize, displayType, attrLabel, recordCountLabel } = this.props;
    const logarithm = displayType === 'logarithm';

    // get data and labels
    const [ data, labels ] = convertData(this.props);
    // apply log10 to data for plotting
    const plotData = logarithm ? data.map(entry => [ entry[0], Math.log10(entry[1]) ]) : data;

    const binLabel = attrLabel;
    const sizeLabel = recordCountLabel;
    const options: any = getOptions(binLabel, sizeLabel, labels);

    // draw plot
    const plotCanvas = $(this.plotNode);
    let previousPoint: any = null;
    $.plot(plotCanvas, [ plotData ], options);
    plotCanvas
      .off("plothover")
      .on("plothover", (event, pos, item) => {
        if (item) {
          if (previousPoint != item.dataIndex) {
            previousPoint = item.dataIndex;
            $("#flot-tooltip").remove();
            const entry = data[item.dataIndex];
            const typeValue = entry[1];
            const content = sizeLabel + " = " + typeValue + ", in " + binLabel + " = " + labels[item.dataIndex][1];
            const logNote = logarithm ? `<br/><br/><em>log10(${typeValue}) = ${plotData[item.dataIndex][1].toFixed(2)}</em>` : '';
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

  render() {
    const { avg, min, max, binSize, type, displayType, attrLabel, recordCountLabel, onBinSizeChange, onDisplayTypeChange } = this.props;

    return (
      <div className={cx()}>
        <div className={cx('Graph')} ref={node => this.plotNode = node}></div>
        <div className={cx('RecordCountLabel')}>
          {displayType === 'logarithm' ? `log10(${recordCountLabel})` : recordCountLabel}
        </div>
        <div className={cx('AttrLabel')}>{attrLabel}</div>
        {type === 'category' ? null : (
          <>
            <div className={cx('Summary')}>
              <dl>
                <dt>Mean</dt>
                <dd>{avg}</dd>
                <dt>Min</dt>
                <dd>{min}</dd>
                <dt>Max</dt>
                <dd>{max}</dd>
              </dl>
            </div>
            <div className={cx('Controls')}>
              <label>Size of bins: <input type="number" min={min} max={max} value={binSize} onChange={e => onBinSizeChange(Number(e.target.value))} /></label>
              <input className={cx('Slider')} type="range" min={min} max={max} onChange={e => onBinSizeChange(Number(e.target.value))} value={binSize}/>
            </div>
          </>
        )}
        <div className={cx('Controls')}>
          <div>Choose column display:</div>
          <label><input type="radio" name="logarithm" value="normal" checked={displayType === 'normal'} onChange={() => onDisplayTypeChange('normal')} /> Normal </label>
          <label><input type="radio" name="logarithm" value="logarithm" checked={displayType === 'logarithm'} onChange={() => onDisplayTypeChange('logarithm')} /> Logarithm </label>
        </div>
      </div>
    )
  }
})

function convertData(props: HistogramProps) {
  const { type } = props;
  // convert data into bins and/or logarithm display
  return type === 'category' ? convertCategoryData(props)
    : convertNumericData(props);
}

type Bin = [ number, number ];
type Label = [ number, string ];

type SeriesData = [ Bin[], Label[] ];

function convertCategoryData(props: HistogramProps): SeriesData {
  //if (binSize == 1 && !logarithm) return data; // no need to convert
  const { data : dataObject, binSize, displayType } = props;

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
    // if (displayType === 'logarithm') count = Math.log10(count);
    bins.push([ i, count ]);
    labels.push([ i, label ]);
  }
  return [bins,labels];
}


function convertNumericData(props: HistogramProps): SeriesData {
  const numberFormat = new Intl.NumberFormat('en-us');
  const { data: dataObject, binSize, type, displayType, min, max } = props;
  const data: [number, number][] = Object.entries(dataObject).map(([k, v]) => [ Number(k), v ] as [number, number]);


  // create bins
  const tempBins = range(min, max + 1, binSize)
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
    if (binSize == 1 && type == "int") label = numberFormat.format(tmpBin[0]);
    else {
      if (type == "float") {
        bin[0] = numberFormat.format(tmpBin[0]);
        bin[1] = numberFormat.format(tmpBin[1]);
      }
      const upper = (type == "int") ? numberFormat.format((tmpBin[1] - 1)) + "]" : bin[1] + ")";
      label = "[" + bin[0] + ", " + upper;
    }
    // if (displayType === 'logarithm') count = Math.log10(count);
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
