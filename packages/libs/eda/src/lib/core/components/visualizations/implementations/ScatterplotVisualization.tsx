// load scatter plot component
import ScatterAndLinePlotGeneral from '@veupathdb/components/lib/plots/ScatterAndLinePlotGeneral';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

// need to set for Scatterplot
import {
  DataClient,
  ScatterplotRequestParams,
  ScatterplotResponse,
  LineplotRequestParams,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { Variable } from '../../../types/variable';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

// ScatterplotControls
import ScatterplotControls from '@veupathdb/components/lib/components/plotControls/ScatterplotControls';

export const scatterplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

interface ScatterplotData<T extends number | Date> {
  dataSetProcess: Array<{
    /** x/y data */
    x: T[];
    y: T[];
    /** legend text */
    name?: string;
    /** plot style */
    mode?: 'markers' | 'lines' | 'lines+markers';
    /** plot with marker: scatter plot with raw data */
    marker?: {
      /** marker color */
      color?: string;
      /** marker size: no unit */
      size?: number;
      /** marker's perimeter setting */
      line?: {
        /** marker's perimeter color */
        color?: string;
        /** marker's perimeter color: no unit */
        width?: number;
      };
    };
    /** plot with marker: scatter plot with smoothedMean and bestfitline; line and density plots */
    line?: {
      /** line color */
      color?: string;
      /** line style */
      shape?: 'spline' | 'linear';
      /** line width: no unit */
      width?: number;
    };
    /** filling plots: tozerox - scatter plot's confidence interval; toself - density plot */
    fill?: 'tozerox' | 'toself';
    /** filling plots: color */
    fillcolor?: string;
  }>;
  xMin: T;
  xMax: T;
  yMin: T;
  yMax: T;
}

function GridComponent(props: VisualizationProps) {
  const { visualization, computation, filters } = props;
  return (
    <ScatterplotViz
      visualization={visualization}
      computation={computation}
      filters={filters}
      fullscreen={false}
    />
  );
}

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent() {
  return <div>Pick me, I'm a Scatter Plot!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <ScatterplotViz {...props} fullscreen />;
}

function createDefaultConfig(): ScatterplotConfig {
  return {
    enableOverlay: true,
    valueSpecConfig: 'Raw',
  };
}

type ScatterplotConfig = t.TypeOf<typeof ScatterplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ScatterplotConfig = t.intersection([
  t.type({
    enableOverlay: t.boolean,
  }),
  t.partial({
    xAxisVariable: Variable,
    yAxisVariable: Variable,
    overlayVariable: Variable,
    valueSpecConfig: t.string,
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
};

function ScatterplotViz(props: Props) {
  const {
    computation,
    visualization,
    updateVisualization,
    filters,
    fullscreen,
    dataElementConstraints,
    dataElementDependencyOrder,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useMemo(
    () =>
      Array.from(preorder(studyMetadata.rootEntity, (e) => e.children || [])),
    [studyMetadata]
  );
  const dataClient: DataClient = useDataClient();

  const vizConfig = useMemo(() => {
    return pipe(
      ScatterplotConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof ScatterplotConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<ScatterplotConfig>) => {
      if (updateVisualization) {
        updateVisualization({
          ...visualization,
          configuration: {
            ...vizConfig,
            ...newConfig,
          },
        });
      }
    },
    [updateVisualization, visualization, vizConfig]
  );

  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      const { xAxisVariable, yAxisVariable, overlayVariable } = values;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
      });
    },
    [updateVizConfig, vizConfig]
  );

  const findVariable = useCallback(
    (variable?: Variable) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );

  // ScatterplotControls: add valueSpec option
  const onValueSpecChange = useCallback(
    (value: string) => {
      updateVizConfig({
        valueSpecConfig: value,
      });
    },
    [updateVizConfig, vizConfig]
  );

  const data = usePromise(
    // useCallback(async (): Promise<ScatterplotData<number>> => {
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);
      const overlayVariable = findVariable(vizConfig.overlayVariable);

      // check variable inputs
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return Promise.reject(new Error('Please choose a X-axis variable'));
      // isHistogramVariable may be used instead
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return Promise.reject(new Error('Please choose a Y-axis variable'));
      // add a condition to check whether xAxisVariable == yxAxisVariable
      else if (xAxisVariable === yAxisVariable)
        return Promise.reject(
          new Error(
            'Please choose different variables between X- and Y-axis variable'
          )
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined,
        // add visualization.type
        visualization.type,
        //DKDK ScatterplotControls
        vizConfig.valueSpecConfig ? vizConfig.valueSpecConfig : 'Raw'
      );

      // scatterplot, lineplot
      const response =
        visualization.type === 'lineplot'
          ? dataClient.getLineplot(
              computation.type,
              params as LineplotRequestParams
            )
          : // set default as scatterplot/getScatterplot
            dataClient.getScatterplot(
              computation.type,
              params as ScatterplotRequestParams
            );

      // send visualization.type as well
      return scatterplotResponseToData(await response, visualization.type);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      findVariable,
      computation.type,
      visualization.type,
    ])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'x-axis variable',
              },
              {
                name: 'yAxisVariable',
                label: 'y-axis variable',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay variable (Optional)',
              },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              yAxisVariable: vizConfig.yAxisVariable,
              overlayVariable: vizConfig.overlayVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={dataElementConstraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
          />
        </div>
      )}

      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && fullscreen && (
        <div
          style={{
            fontSize: '1.2em',
            padding: '1em',
            background: 'rgb(255, 233, 233) none repeat scroll 0% 0%',
            borderRadius: '.5em',
            margin: '.5em 0',
            color: '#333',
            border: '1px solid #d9cdcd',
            display: 'flex',
          }}
        >
          <i className="fa fa-warning" style={{ marginRight: '1ex' }}></i>{' '}
          {data.error instanceof Error
            ? data.error.message
            : String(data.error)}
        </div>
      )}
      {data.value ? (
        fullscreen ? (
          <ScatterplotWithControls
            // data.value
            data={[...data.value.dataSetProcess]}
            width={1000}
            height={600}
            // title={'Scatter plot'}
            independentAxisLabel={
              findVariable(vizConfig.xAxisVariable)?.displayName
            }
            dependentAxisLabel={
              findVariable(vizConfig.yAxisVariable)?.displayName
            }
            independentAxisRange={[data.value.xMin, data.value.xMax]}
            // block this for now
            dependentAxisRange={[data.value.yMin, data.value.yMax]}
            //DKDK ScatterplotControls valueSpecInitial
            valueSpec={vizConfig.valueSpecConfig}
            // valueSpec={valueSpecInitial}
            onValueSpecChange={onValueSpecChange}
            //DKDK send visualization.type here
            vizType={visualization.type}
          />
        ) : (
          // thumbnail/grid view
          <ScatterAndLinePlotGeneral
            data={[...data.value.dataSetProcess]}
            width={230}
            height={150}
            independentAxisRange={[data.value.xMin, data.value.xMax]}
            // block this for now
            dependentAxisRange={[data.value.yMin, data.value.yMax]}
            // new props for better displaying grid view
            displayLegend={false}
            displayLibraryControls={false}
            staticPlot={true}
            margin={{ l: 30, r: 20, b: 15, t: 20 }}
          />
        )
      ) : (
        //DKDK no data or data error case: with control
        <>
          <ScatterAndLinePlotGeneral
            data={[]}
            width={fullscreen ? 1000 : 230}
            height={fullscreen ? 600 : 150}
            independentAxisLabel={
              fullscreen
                ? findVariable(vizConfig.xAxisVariable)?.displayName
                : undefined
            }
            dependentAxisLabel={
              fullscreen
                ? findVariable(vizConfig.yAxisVariable)?.displayName
                : undefined
            }
            displayLegend={fullscreen ? true : false}
            displayLibraryControls={false}
            staticPlot={fullscreen ? false : true}
            margin={fullscreen ? {} : { l: 30, r: 20, b: 15, t: 20 }}
          />
          {visualization.type === 'scatterplot' && fullscreen && (
            <ScatterplotControls
              // label="Scatter Plot Controls"
              valueSpec={vizConfig.valueSpecConfig}
              onValueSpecChange={onValueSpecChange}
              errorManagement={{
                errors: [],
                addError: (error: Error) => {},
                removeError: (error: Error) => {},
                clearAllErrors: () => {},
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function ScatterplotWithControls({
  data,
  //DKDK ScatterplotControls: set initial value as 'raw' ('Raw')
  valueSpec = 'Raw',
  onValueSpecChange,
  vizType,
  ...ScatterplotProps
}: //
// }: ScatterplotWithControlsProps) {
any) {
  // TODO Use UIState
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ScatterAndLinePlotGeneral
        {...ScatterplotProps}
        data={data}
        // add controls
        displayLegend={data.length > 1}
        displayLibraryControls={false}
      />
      {/* DKDK ScatterplotControls: check vizType (only for scatterplot for now) */}
      {vizType === 'scatterplot' && (
        <ScatterplotControls
          // label="Scatter Plot Controls"
          valueSpec={valueSpec}
          onValueSpecChange={onValueSpecChange}
          errorManagement={errorManagement}
        />
      )}
    </div>
  );
}

/**
 * Reformat response from Scatter Plot endpoints into complete ScatterplotData
 * @param response
 * @returns ScatterplotData
 */
export function scatterplotResponseToData(
  response: PromiseType<
    ReturnType<DataClient['getScatterplot'] | DataClient['getLineplot']>
  >,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string
): any {
  const modeValue = vizType === 'lineplot' ? 'lines' : 'markers'; // for scatterplot

  const { dataSetProcess, xMin, xMax, yMin, yMax } = processInputData(
    response,
    vizType,
    modeValue
  );

  return {
    dataSetProcess: dataSetProcess,
    xMin: xMin,
    xMax: xMax,
    yMin: yMin,
    yMax: yMax,
  };
}

// add an extended type
type getRequestParamsProps =
  | (ScatterplotRequestParams & { vizType?: string })
  | (LineplotRequestParams & { vizType?: string });

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: Variable,
  //DKDK set yAxisVariable as optional for densityplot
  yAxisVariable?: Variable,
  overlayVariable?: Variable,
  // add visualization.type
  vizType?: string,
  //DKDK ScatterplotControls
  valueSpecConfig?: string
): getRequestParamsProps {
  //DKDK valueSpec
  let valueSpecValue = 'raw';
  if (valueSpecConfig === 'Smoothed mean') {
    valueSpecValue = 'smoothedMean';
  } else if (valueSpecConfig === 'Smoothed mean with raw') {
    valueSpecValue = 'smoothedMeanWithRaw';
  } else if (valueSpecConfig === 'Best fit line with raw') {
    valueSpecValue = 'bestFitLineWithRaw';
  }

  if (vizType === 'lineplot') {
    return {
      studyId,
      filters,
      config: {
        // is outputEntityId correct?
        outputEntityId: xAxisVariable.entityId,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
      },
    } as LineplotRequestParams;
  } else {
    // scatterplot
    return {
      studyId,
      filters,
      config: {
        // is outputEntityId correct?
        outputEntityId: xAxisVariable.entityId,
        //DKDK ScatterplotControls
        valueSpec: valueSpecValue,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
      },
    } as ScatterplotRequestParams;
  }
}

// making plotly input data
function processInputData<T extends number | Date>(
  dataSet: ScatterplotResponse,
  vizType: string,
  // line, marker,
  modeValue: string
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = '';

  // distinguish data per Viztype
  const plotDataSet =
    vizType === 'lineplot'
      ? //DKDK backend issue for lineplot returning scatterplot currently
        // dataSet.lineplot
        dataSet.scatterplot
      : dataSet.scatterplot;

  // set variables for x- and yaxis ranges
  let xMin: number | Date = 0;
  let xMax: number | Date = 0;
  let yMin: number | Date = 0;
  let yMax: number | Date = 0;

  //DKDK coloring: using plotly.js default colors
  const markerColors = [
    '31, 119, 180', //'#1f77b4',  // muted blue
    '255, 127, 14', //'#ff7f0e',  // safety orange
    '44, 160, 44', //'#2ca02c',  // cooked asparagus green
    '214, 39, 40', //'#d62728',  // brick red
    '148, 103, 189', //'#9467bd',  // muted purple
    '140, 86, 75', //'#8c564b',  // chestnut brown
    '227, 119, 194', //'#e377c2',  // raspberry yogurt pink
    '127, 127, 127', //'#7f7f7f',  // middle gray
    '188, 189, 34', //'#bcbd22',  // curry yellow-green
    '23, 190, 207', //'#17becf'   // blue-teal
  ];

  let dataSetProcess: Array<{}> = [];
  // dataSet.data.forEach(function (el: any, index: number) {
  plotDataSet.data.forEach(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xSeriesValue: T[] = [];
    let ySeriesValue: T[] = [];
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: T[] = [];
    let standardErrorValue: T[] = []; // this is for standardError
    //DKDK bestFitLineWithRaw
    let xBestFitLineValue: T[] = [];
    let yBestFitLineValue: T[] = [];

    let xIntervalBounds: T[] = [];
    let yIntervalBounds: T[] = [];

    //DKDK initialize seriesX/Y, smoothedMeanX, bestFitLineX
    let seriesX = [];
    let seriesY = [];
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // series is for scatter plot
    if (el.seriesX && el.seriesY) {
      // check the number of x = number of y
      if (el.seriesX.length !== el.seriesY.length) {
        // alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      //DKDK change string array to number array for numeric data
      seriesX = el.seriesX.map(Number);
      seriesY = el.seriesY.map(Number);

      // probably no need to have this for series data, though
      //1) combine the arrays:
      let combinedArray = [];
      for (let j = 0; j < seriesX.length; j++) {
        combinedArray.push({
          //DKDK use seriesX/Y instead of el.seriesX/Y
          xValue: seriesX[j],
          yValue: seriesY[j],
        });
      }
      //2) sort:
      combinedArray.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue === b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArray.length; k++) {
        xSeriesValue[k] = combinedArray[k].xValue;
        ySeriesValue[k] = combinedArray[k].yValue;
      }

      /*
       * Set variables for x-/y-axes ranges including x,y data points: considering Date data for X as well
       * This is for finding global min/max values among data arrays for better display of the plot(s)
       */
      // check if this X array consists of numbers & add type assertion
      if (isArrayOfNumbers(xSeriesValue)) {
        if (index === 0) {
          // need to set initial xMin/xMax
          xMin = xSeriesValue[0];
          xMax = xSeriesValue[xSeriesValue.length - 1];
        } else {
          xMin =
            xMin < Math.min(...(xSeriesValue as number[]))
              ? xMin
              : Math.min(...(xSeriesValue as number[]));
          xMax =
            xMax > Math.max(...(xSeriesValue as number[]))
              ? xMax
              : Math.max(...(xSeriesValue as number[]));
        }
      } else {
        // this array consists of Dates
        if (index === 0) {
          // to set initial min/max Date values for Date[]
          xMin = getMinDate(xSeriesValue as Date[]);
          xMax = getMaxDate(xSeriesValue as Date[]);
        } else {
          xMin =
            xMin <
            Math.min(...xSeriesValue.map((date) => new Date(date).getTime()))
              ? xMin
              : new Date(
                  Math.min(
                    ...xSeriesValue.map((date) => new Date(date).getTime())
                  )
                );
          xMax =
            xMax >
            Math.max(...xSeriesValue.map((date) => new Date(date).getTime()))
              ? xMax
              : new Date(
                  Math.max(
                    ...xSeriesValue.map((date) => new Date(date).getTime())
                  )
                );
        }
      }

      // check if this Y array consists of numbers & add type assertion
      if (isArrayOfNumbers(ySeriesValue)) {
        if (index == 0) {
          yMin = Math.min(...ySeriesValue);
          yMax = Math.max(...ySeriesValue);
        } else {
          yMin =
            yMin < Math.min(...ySeriesValue) ? yMin : Math.min(...ySeriesValue);
          yMax =
            yMax > Math.max(...ySeriesValue) ? yMax : Math.max(...ySeriesValue);
        }
      } else {
        if (index === 0) {
          // to set initial Date value for Date[]
          yMin = getMinDate(ySeriesValue as Date[]);
          yMax = getMaxDate(ySeriesValue as Date[]);
        } else {
          yMin =
            yMin < getMinDate(ySeriesValue as Date[])
              ? yMin
              : getMinDate(ySeriesValue as Date[]);
          yMax =
            yMax > getMaxDate(ySeriesValue as Date[])
              ? yMax
              : getMaxDate(ySeriesValue as Date[]);
        }
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: xSeriesValue,
        y: ySeriesValue,
        // distinguish X/Y Data from Overlay
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value
          : 'Data',
        mode: modeValue,
        // type: 'scattergl',
        // type: 'scatter',
        type:
          vizType === 'lineplot'
            ? 'scatter'
            : vizType === 'densityplot'
            ? 'scatter'
            : 'scattergl', // for the raw data of the scatterplot
        fill: fillAreaValue,
        marker: {
          //DKDK coloring
          color: 'rgba(' + markerColors[index] + ',0)',
          size: 12,
          //DKDK coloring
          line: { color: 'rgba(' + markerColors[index] + ',0.7)', width: 2 },
        },
        // this needs to be here for the case of markers with line or lineplot.
        // always use spline?
        //DKDK coloring
        line: { color: 'rgba(' + markerColors[index] + ',1)', shape: 'spline' },
      });
    }

    // check if smoothedMean prop exists
    if (el.smoothedMeanX && el.smoothedMeanY && el.smoothedMeanSE) {
      // check the number of x = number of y or standardError
      if (el.smoothedMeanX.length !== el.smoothedMeanY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      //DKDK change string array to number array for numeric data
      smoothedMeanX = el.smoothedMeanX.map(Number);

      // sorting function
      //1) combine the arrays: including standardError
      let combinedArrayInterval = [];
      for (let j = 0; j < smoothedMeanX.length; j++) {
        combinedArrayInterval.push({
          xValue: smoothedMeanX[j],
          yValue: el.smoothedMeanY[j],
          zValue: el.smoothedMeanSE[j],
        });
      }
      //2) sort:
      combinedArrayInterval.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue === b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArrayInterval.length; k++) {
        xIntervalLineValue[k] = combinedArrayInterval[k].xValue;
        yIntervalLineValue[k] = combinedArrayInterval[k].yValue;
        standardErrorValue[k] = combinedArrayInterval[k].zValue;
      }

      // set variables for x-/y-axes ranges including fitting line
      if (isArrayOfNumbers(xIntervalLineValue)) {
        // add additional condition for the case of smoothedMean (without series data)
        xMin = el.seriesX
          ? xMin < Math.min(...xIntervalLineValue)
            ? xMin
            : Math.min(...xIntervalLineValue)
          : Math.min(...xIntervalLineValue);
        xMax = el.seriesX
          ? xMax > Math.max(...xIntervalLineValue)
            ? xMax
            : Math.max(...xIntervalLineValue)
          : Math.max(...xIntervalLineValue);
      } else {
        xMin = el.seriesX
          ? xMin < getMinDate(xIntervalLineValue as Date[])
            ? xMin
            : getMinDate(xIntervalLineValue as Date[])
          : getMinDate(xIntervalLineValue as Date[]);
        xMax = el.seriesX
          ? xMax > getMaxDate(xIntervalLineValue as Date[])
            ? xMax
            : getMaxDate(xIntervalLineValue as Date[])
          : getMaxDate(xIntervalLineValue as Date[]);
      }

      if (isArrayOfNumbers(yIntervalLineValue)) {
        // add additional condition for the case of smoothedMean (without series data)
        yMin = el.seriesY
          ? yMin < Math.min(...yIntervalLineValue)
            ? yMin
            : Math.min(...yIntervalLineValue)
          : Math.min(...yIntervalLineValue);
        yMax = el.seriesY
          ? yMax > Math.max(...yIntervalLineValue)
            ? yMax
            : Math.max(...yIntervalLineValue)
          : Math.max(...yIntervalLineValue);
      } else {
        yMin = el.seriesY
          ? yMin < getMinDate(yIntervalLineValue as Date[])
            ? yMin
            : getMinDate(yIntervalLineValue as Date[])
          : getMinDate(yIntervalLineValue as Date[]);
        yMax = el.seriesY
          ? yMax > getMaxDate(yIntervalLineValue as Date[])
            ? yMax
            : getMaxDate(yIntervalLineValue as Date[])
          : getMaxDate(yIntervalLineValue as Date[]);
      }

      // store data for smoothed mean: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        name: 'Smoothed mean',
        mode: 'lines', // no data point is displayed: only line
        line: {
          //DKDK coloring
          color: 'rgba(' + markerColors[index] + ',1)',
          shape: 'spline',
          width: 2,
        },
        type: 'scatter',
      });

      // make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element: any) => element).reverse()
      );

      // need to compare xMin/xMax
      xMin =
        xMin < Math.min(...xIntervalBounds.map(Number))
          ? xMin
          : Math.min(...xIntervalBounds.map(Number));
      xMax =
        xMax > Math.max(...xIntervalBounds.map(Number))
          ? xMax
          : Math.max(...xIntervalBounds.map(Number));

      // finding upper and lower bound values.
      const { yUpperValues, yLowerValues } = getBounds(
        yIntervalLineValue,
        standardErrorValue
      );

      // make upper and lower bounds plotly format
      yIntervalBounds = yUpperValues;
      yIntervalBounds = yIntervalBounds.concat(
        yLowerValues.map((element: any) => element).reverse()
      );

      // set variables for x-/y-axes ranges including CI/bounds: no need for x data as it was compared before
      yMin =
        yMin < Math.min(...yLowerValues.map(Number))
          ? yMin
          : Math.min(...yLowerValues.map(Number));
      yMax =
        yMax > Math.max(...yUpperValues.map(Number))
          ? yMax
          : Math.max(...yUpperValues.map(Number));

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        name: 'Confidence interval',
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        //DKDK coloring
        fillcolor: 'rgba(' + markerColors[index] + ',0.2)',
        type: 'line',
        // here, line means upper and lower bounds
        line: { color: 'transparent', shape: 'spline' },
      });
    }

    // accomodating bestFitLineWithRaw
    // check if bestFitLineX/Y props exist
    if (el.bestFitLineX && el.bestFitLineY) {
      // check the number of x = number of y
      if (el.bestFitLineX.length !== el.bestFitLineY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      //DKDK change string array to number array for numeric data
      bestFitLineX = el.bestFitLineX.map(Number);

      // sorting function
      //1) combine the arrays: including standardError
      let combinedArrayInterval = [];
      for (let j = 0; j < el.bestFitLineX.length; j++) {
        combinedArrayInterval.push({
          xValue: bestFitLineX[j],
          yValue: el.bestFitLineY[j],
        });
      }
      //2) sort:
      combinedArrayInterval.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue === b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArrayInterval.length; k++) {
        xBestFitLineValue[k] = combinedArrayInterval[k].xValue;
        yBestFitLineValue[k] = combinedArrayInterval[k].yValue;
      }

      // set variables for x-/y-axes ranges including fitting line
      if (isArrayOfNumbers(xBestFitLineValue)) {
        // add additional condition for the case of smoothedMean (without series data)
        xMin = el.seriesX
          ? xMin < Math.min(...xBestFitLineValue)
            ? xMin
            : Math.min(...xBestFitLineValue)
          : Math.min(...xBestFitLineValue);
        xMax = el.seriesX
          ? xMax > Math.max(...xBestFitLineValue)
            ? xMax
            : Math.max(...xBestFitLineValue)
          : Math.max(...xBestFitLineValue);
      } else {
        xMin = el.seriesX
          ? xMin < getMinDate(xBestFitLineValue as Date[])
            ? xMin
            : getMinDate(xBestFitLineValue as Date[])
          : getMinDate(xBestFitLineValue as Date[]);
        xMax = el.seriesX
          ? xMax > getMaxDate(xBestFitLineValue as Date[])
            ? xMax
            : getMaxDate(xBestFitLineValue as Date[])
          : getMaxDate(xBestFitLineValue as Date[]);
      }

      if (isArrayOfNumbers(yBestFitLineValue)) {
        // add additional condition for the case of smoothedMean (without series data)
        yMin = el.seriesY
          ? yMin < Math.min(...yBestFitLineValue)
            ? yMin
            : Math.min(...yBestFitLineValue)
          : Math.min(...yBestFitLineValue);
        yMax = el.seriesY
          ? yMax > Math.max(...yBestFitLineValue)
            ? yMax
            : Math.max(...yBestFitLineValue)
          : Math.max(...yBestFitLineValue);
      } else {
        yMin = el.seriesY
          ? yMin < getMinDate(yBestFitLineValue as Date[])
            ? yMin
            : getMinDate(yBestFitLineValue as Date[])
          : getMinDate(yBestFitLineValue as Date[]);
        yMax = el.seriesY
          ? yMax > getMaxDate(yBestFitLineValue as Date[])
            ? yMax
            : getMaxDate(yBestFitLineValue as Date[])
          : getMaxDate(yBestFitLineValue as Date[]);
      }

      // store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xBestFitLineValue,
        y: yBestFitLineValue,
        // display R-square value at legend text(s)
        name: 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        mode: 'lines', // no data point is displayed: only line
        line: {
          //DKDK coloring
          color: 'rgba(' + markerColors[index] + ',1)',
          shape: 'spline',
          width: 2,
        },
        type: 'scatter',
      });
    }

    // make some margin for y-axis range (5% of range for now)
    if (typeof yMin == 'number' && typeof yMax == 'number') {
      yMin = yMin - (yMax - yMin) * 0.05;
      yMax = yMax + (yMax - yMin) * 0.05;
    }
  });

  return { dataSetProcess, xMin, xMax, yMin, yMax };
}

/*
 * Utility functions for processInputData()
 */

// check number array and if empty
function isArrayOfNumbers(value: any): value is number[] {
  // value.length !==0
  return (
    Array.isArray(value) &&
    value.length !== 0 &&
    value.every((item) => typeof item === 'number')
  );
}

function getMinDate(dates: Date[]) {
  return new Date(Math.min(...dates.map(Number)));
}

function getMaxDate(dates: Date[]) {
  return new Date(Math.max(...dates.map(Number)));
}

function getBounds<T extends number | Date>(
  values: T[],
  standardErrors: T[]
): {
  yUpperValues: T[];
  yLowerValues: T[];
} {
  const yUpperValues = values.map((value, idx) => {
    const tmp = Number(value) + 2 * Number(standardErrors[idx]);
    return value instanceof Date ? (new Date(tmp) as T) : (tmp as T);
  });
  const yLowerValues = values.map((value, idx) => {
    const tmp = Number(value) - 2 * Number(standardErrors[idx]);
    return value instanceof Date ? (new Date(tmp) as T) : (tmp as T);
  });

  return { yUpperValues, yLowerValues };
}
