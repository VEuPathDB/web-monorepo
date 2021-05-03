//DKDK this may not be needed if import ScatterplotProps from Scatter plot component
import PlotlyPlot, {
  PlotProps,
  ModebarDefault,
} from '@veupathdb/components/lib/plots//PlotlyPlot';
// need to export Scatterplot or add @types/plotly.js
// import { Layout, PlotData } from 'plotly.js';

//DKDK load src for changing, esp. props
import ScatterAndLinePlotGeneral from '@veupathdb/components/lib/plots/ScatterAndLinePlotGeneral';
// import ScatterAndLinePlotGeneral from '@veupathdb/components/src/plots/ScatterAndLinePlotGeneral';

import { ErrorManagement } from '@veupathdb/components/lib/types/general';

//DKDK import it from scatter plot component or may need to make a new ScatterplotData ts
// import { HistogramData } from '@veupathdb/components/lib/types/plots';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo } from 'react';

//DKDK need to set for Scatterplot
import {
  DataClient,
  // ScatterplotResponse,
  ScatterplotRequestParams,
  LineplotRequestParams,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { Variable } from '../../../types/variable';
import { DataElementConstraint } from '../../../types/visualization';
// import {
//   ISODateStringToZuluDate,
//   parseTimeDelta,
// } from '../../../utils/date-conversion';

//DKDK need to make ts for Scatterplot? need to know dataShape and type
import { isScatterplotVariable } from '../../filter/guards';
import { ScatterplotVariable } from '../../filter/types';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const scatterplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

//DKDK copy Scatter Plot props here for now instead of import

// interface ScatterplotProps<T extends keyof PlotData> extends PlotProps {
interface ScatterplotProps<T extends keyof any> extends PlotProps {
  //DKDK temporarily set any before resolving @types/plotly.js
  // data: Pick<PlotData, T>[];
  data: any;
  xLabel: string;
  yLabel: string;
  plotTitle: string;
  //DKDK involving CI, x & y range may need to be set
  xRange?: number[] | Date[];
  yRange?: number[] | Date[];
  showLegend?: boolean;
}

//DKDK from ScatterAndLinePlotGeneral component
interface ScatterPlotData<T extends number | Date> {
  data: Array<{
    series: {
      x: T[]; //DKDK perhaps string[] is better despite Date format, e.g., ISO format?
      y: T[]; //DKDK will y data have a Date?
      // popupContent?: string;
    };
    interval?: {
      x: T[]; //DKDK perhaps string[] is better despite Date format, e.g., ISO format?
      y: T[]; //DKDK will y data have a Date?
      // orientation: string;
      standardError: number[];
    };
    // color?: string;
    // label: string;
    // //DKDK for general scatter component
    // showLines?: boolean;
    // showMarkers?: boolean;
    // fillArea?: boolean;
    // useSpline?: boolean;
  }>;
  // opacity?: number;
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

//DKDK this needs a handling of text for scatter, line, and density plots
function SelectorComponent() {
  return <div>Pick me, I'm a Scatter Plot!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  const {
    visualization,
    updateVisualization,
    computation,
    filters,
    dataElementConstraints,
  } = props;
  return (
    <ScatterplotViz
      visualization={visualization}
      updateVisualization={updateVisualization}
      computation={computation}
      filters={filters}
      fullscreen={true}
      constraints={dataElementConstraints}
    />
  );
}

function createDefaultConfig(): ScatterplotConfig {
  return {
    //DKDK default is true but changed to false for scatterplot
    enableOverlay: false,
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
    //DKDK yAxisVariable
    yAxisVariable: Variable,
    overlayVariable: Variable,
    // binWidth: t.number,
    // binWidthTimeUnit: t.string, // TO DO: constrain to weeks, months etc like Unit from date-arithmetic and/or R
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
  constraints?: Record<string, DataElementConstraint>[];
};

function ScatterplotViz(props: Props) {
  const {
    computation,
    visualization,
    updateVisualization,
    filters,
    fullscreen,
    constraints,
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
      //DKDK yAxisVariable
      const { xAxisVariable, yAxisVariable, overlayVariable } = values;
      updateVizConfig({
        xAxisVariable,
        //DKDK yAxisVariable
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

  const data = usePromise(
    //DKDK set any for now
    // useCallback(async (): Promise<ScatterplotData> => {
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      //DKDK yAxisVariable
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);
      //DKDK yAxisVariable
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return Promise.reject(new Error('Please choose a X-axis variable'));
      else if (!isScatterplotVariable(xAxisVariable))
        return Promise.reject(
          new Error(
            `'${xAxisVariable.displayName}' is not suitable for this plot`
          )
        );
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return Promise.reject(new Error('Please choose a Y-axis variable'));
      else if (!isScatterplotVariable(yAxisVariable))
        return Promise.reject(
          new Error(
            `'${yAxisVariable.displayName}' is not suitable for this plot`
          )
        );

      //DKDK add visualization.type here
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        //DKDK yAxisVariable
        vizConfig.yAxisVariable,
        //DKDK overlay...
        vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined,
        //DKDK add visualization.type
        visualization.type
      );

      // //DKDK
      // console.log('params = ', params)
      // console.log('computation = ', computation)

      // const response = dataClient.getScatterplot(
      //   computation.type,
      //   params as ScatterplotRequestParams
      // );

      //DKDK scatterplot, lineplot
      const response =
        visualization.type === 'lineplot'
          ? dataClient.getLineplot(
              computation.type,
              params as LineplotRequestParams
            )
          : //DKDK set default as scatterplot/getScatterplot
            dataClient.getScatterplot(
              computation.type,
              params as ScatterplotRequestParams
            );

      // console.log('dataClient->response = ', response)

      //DKDK send visualization.type as well
      return scatterplotResponseToData(await response, visualization.type);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      findVariable,
      computation.type,
    ])
  );

  //DKDK
  console.log('const data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* DKDK change page title */}
      {fullscreen &&
        (visualization.type === 'scatterplot' ? (
          <h1>Scatter Plot</h1>
        ) : visualization.type === 'lineplot' ? (
          <h1>Line Plot</h1>
        ) : (
          ''
        ))}
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
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              //DKDK yAxisVariable
              yAxisVariable: vizConfig.yAxisVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={constraints}
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
            //DKDK data.value
            data={[...data.value.dataSetProcess]}
            width={1000}
            height={600}
            xLabel={findVariable(vizConfig.xAxisVariable)?.displayName}
            yLabel={findVariable(vizConfig.yAxisVariable)?.displayName}
            plotTitle={''}
            xRange={[data.value.xMin, data.value.xMax]}
            yRange={[data.value.yMin, data.value.yMax]}
          />
        ) : (
          // thumbnail/grid view
          <ScatterAndLinePlotGeneral
            //DKDK data.value
            data={[...data.value.dataSetProcess]}
            width={350}
            height={280}
            xLabel={'xLabel'}
            yLabel={'yLabel'}
            plotTitle={'plotTitle'}
            xRange={[data.value.xMin, data.value.xMax]}
            yRange={[data.value.yMin, data.value.yMax]}
          />
        )
      ) : (
        <i
          className="fa fa-line-chart"
          style={{
            fontSize: fullscreen ? '34em' : '12em',
            color: '#aaa',
          }}
        ></i>
      )}
    </div>
  );
}

// //DKDK block for now
// type ScatterplotWithControlsProps = ScatterplotProps

function ScatterplotWithControls({
  data,
  ...ScatterplotProps
}: //DKDK
// }: ScatterplotWithControlsProps) {
any) {
  // TODO Use UIState
  const displayLibraryControls = false;
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  //DKDK
  console.log('ScatterplotWithControls.data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ScatterAndLinePlotGeneral
        {...ScatterplotProps}
        data={data}
        displayLibraryControls={displayLibraryControls}
      />
    </div>
  );
  //DKDK making a control later
  // <ScatterplotControls
  //   label="Scatter Plot Controls"
  //   valueType={data.valueType}
  //   displayLegend={false /* should not be a required prop */}
  //   displayLibraryControls={displayLibraryControls}
  //   errorManagement={errorManagement}
  // />
}

/**
 * Reformat response from Scatter Plot endpoints into complete ScatterplotData
 * @param response
 * @returns ScatterplotData
 */
export function scatterplotResponseToData(
  //DKDK getScatterplot may also need to be changed in the future for hosting other plots
  // response: PromiseType<ReturnType<DataClient['getScatterplot']>> | PromiseType<ReturnType<DataClient['getLineplot']>>,
  response: PromiseType<
    ReturnType<DataClient['getScatterplot'] | DataClient['getLineplot']>
  >,
  //DKDK vizType is visualization.type. This may be used for handling other plots in this component like line and density
  vizType: string
): any {
  // if (response.data.length === 0)
  //   throw Error(`Expected one or more data series, but got zero`);
  // else console.log('Im at scatterplotResponseToData');

  console.log('visualization type at scatterplotResponseToData = ', vizType);
  console.log('response.data =', response);

  const modeValue = vizType === 'lineplot' ? 'lines' : 'markers'; //DKDK for scatter plot

  const { dataSetProcess, xMin, xMax, yMin, yMax } = processInputData(
    response,
    vizType,
    modeValue
  );

  console.log('dataSetProcess =', dataSetProcess);
  console.log('xMin, xMax, yMin, yMax =', xMin, xMax, yMin, yMax);

  return {
    dataSetProcess: dataSetProcess,
    xMin: xMin,
    xMax: xMax,
    yMin: yMin,
    yMax: yMax,
  };
}

//DKDK add an extended type
type getRequestParamsProps =
  | (ScatterplotRequestParams & { vizType?: string })
  | (LineplotRequestParams & { vizType?: string });

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: Variable,
  yAxisVariable?: Variable,
  overlayVariable?: Variable,
  //DKDK add visualization.type
  vizType?: string
): getRequestParamsProps {
  if (vizType === 'lineplot') {
    return {
      studyId,
      filters,
      config: {
        //DKDK is outputEntityId correct?
        outputEntityId: xAxisVariable.entityId,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
      },
    } as LineplotRequestParams;
  } else {
    //DKDK scatterplot
    return {
      studyId,
      filters,
      config: {
        //DKDK is outputEntityId correct?
        outputEntityId: xAxisVariable.entityId,
        //DKDK valueSpect may be used in the future
        // valueSpec: 'raw',
        // valueSpec: 'smoothedMean',
        valueSpec: 'smoothedMeanWithRaw',
        // smoothedMean: true,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
      },
    } as ScatterplotRequestParams;
  }
}

//DKDK making plotly input data
function processInputData<T extends number | Date>(
  //DKDK any
  // dataSet: VEuPathDBScatterPlotData<T>
  dataSet: any,
  //DKDK use vizType or perhaps use different argument when calling processInputData?
  vizType: string,
  //DKDK line, marker,
  modeValue: string
) {
  console.log('dataSet =', dataSet);

  //DKDK set fillAreaValue
  const fillAreaValue = '';

  //DKDK distinguish data per Viztype
  const plotDataSet =
    vizType === 'lineplot'
      ? //DKDK lineplot
        dataSet.lineplot
      : dataSet.scatterplot;

  //DKDK set a default color
  const defaultColor: string = '#00b0f6';
  //DKDK set global Opacity value
  const globalOpacity = 1;
  // //DKDK an example data: data are assumed to be number type only
  // const orientationValue = 'y';

  //DKDK set variables for x- and yaxis ranges
  let xMin: number | Date = 0;
  let xMax: number | Date = 0;
  let yMin: number | Date = 0;
  let yMax: number | Date = 0;

  let dataSetProcess: Array<{}> = [];
  // dataSet.data.forEach(function (el: any, index: number) {
  plotDataSet.data.forEach(function (el: any, index: number) {
    //DKDK initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xSeriesValue: T[] = [];
    let ySeriesValue: T[] = [];
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: T[] = [];
    let standardErrorValue: T[] = []; //DKDK this is for standardError
    let xIntervalBounds: T[] = [];
    let yIntervalBounds: T[] = [];

    //DKDK set rgbValue here per dataset with a default color
    let rgbValue: number[] = el.color
      ? hexToRgb(el.color)
      : hexToRgb(defaultColor);
    let scatterPointColor: string = '';
    let fittingLineColor: string = '';
    let intervalColor: string = '';
    //DKDK set line and marker variable - get these as args
    // let modeValue: string = '';
    // let splineValue: string = '';
    // let fillAreaValue: string = '';

    //DKDK series is for scatter plot
    if (el.seriesX && el.seriesY) {
      //DKDK check the number of x = number of y
      if (el.seriesX.length !== el.seriesY.length) {
        console.log(
          'x length=',
          el.seriesX.length,
          '  y length=',
          el.seriesY.length
        );
        alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      //DKDK probably no need to have this for series data, though
      //1) combine the arrays:
      let combinedArray = [];
      for (let j = 0; j < el.seriesX.length; j++) {
        combinedArray.push({
          xValue: el.seriesX[j],
          yValue: el.seriesY[j],
        });
      }
      //2) sort:
      combinedArray.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue == b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArray.length; k++) {
        xSeriesValue[k] = combinedArray[k].xValue;
        ySeriesValue[k] = combinedArray[k].yValue;
      }

      /*
       * DKDK set variables for x-/y-axes ranges including x,y data points: considering Date data for X as well
       * This is for finding global min/max values among data arrays for better display of the plot(s)
       */
      //DKDK check if this X array consists of numbers & add type assertion
      if (isArrayOfNumbers(xSeriesValue)) {
        if (index == 0) {
          //DKDK need to set initial xMin/xMax
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
        //DKDK this array consists of Dates
        if (index == 0) {
          //DKDK to set initial min/max Date values for Date[]
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

      //DKDK check if this Y array consists of numbers & add type assertion
      if (isArrayOfNumbers(ySeriesValue)) {
        yMin =
          yMin < Math.min(...ySeriesValue) ? yMin : Math.min(...ySeriesValue);
        yMax =
          yMax > Math.max(...ySeriesValue) ? yMax : Math.max(...ySeriesValue);
      } else {
        if (index == 0) {
          //DKDK to set initial Date value for Date[]
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

      //DKDK use global opacity for coloring
      scatterPointColor =
        'rgba(' +
        rgbValue[0] +
        ',' +
        rgbValue[1] +
        ',' +
        rgbValue[2] +
        ',' +
        globalOpacity +
        ')'; //DKDK set alpha/opacity as 0.2 for CI

      //DKDK add scatter data considering input options
      dataSetProcess.push({
        x: xSeriesValue,
        y: ySeriesValue,
        //DKDK set name as a string
        name: 'data',
        // mode: 'markers',
        // mode: 'lines+markers',
        mode: modeValue,
        // type: 'scattergl',
        type: 'scatter',
        fill: fillAreaValue,
        marker: { color: scatterPointColor, size: 12 },
        //DKDK always use spline
        line: { color: scatterPointColor, shape: 'spline' },
      });
    }

    //DKDK check if interval prop exists
    if (el.intervalX && el.intervalY && el.intervalSE) {
      //DKDK check the number of x = number of y or standardError
      if (el.intervalX.length !== el.intervalY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }
      //DKDK sorting function
      //1) combine the arrays: including standardError
      let combinedArrayInterval = [];
      for (let j = 0; j < el.intervalX.length; j++) {
        combinedArrayInterval.push({
          xValue: el.intervalX[j],
          yValue: el.intervalY[j],
          zValue: el.intervalSE[j],
        });
      }
      //2) sort:
      combinedArrayInterval.sort(function (a, b) {
        return a.xValue < b.xValue ? -1 : a.xValue == b.xValue ? 0 : 1;
      });
      //3) separate them back out:
      for (let k = 0; k < combinedArrayInterval.length; k++) {
        xIntervalLineValue[k] = combinedArrayInterval[k].xValue;
        yIntervalLineValue[k] = combinedArrayInterval[k].yValue;
        standardErrorValue[k] = combinedArrayInterval[k].zValue;
      }

      //DKDK set variables for x-/y-axes ranges including fitting line
      if (isArrayOfNumbers(xIntervalLineValue)) {
        //DKDK add additional condition for the case of smoothedMean (without series data)
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
        //DKDK add additional condition for the case of smoothedMean (without series data)
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

      const xMinCheck = isArrayOfNumbers(xIntervalLineValue)
        ? Math.min(...xIntervalLineValue)
        : null;
      const xMaxCheck = isArrayOfNumbers(xIntervalLineValue)
        ? Math.max(...xIntervalLineValue)
        : null;
      console.log('xMin xMax at process function =', xMinCheck, xMinCheck);

      //DKDK use global opacity for coloring
      // fittingLineColor =
      //   'rgba(' +
      //   rgbValue[0] +
      //   ',' +
      //   rgbValue[1] +
      //   ',' +
      //   rgbValue[2] +
      //   ',' +
      //   globalOpacity +
      //   ')';
      fittingLineColor = 'rgba(144,12,63,' + globalOpacity + ')';

      //DKDK store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        name: 'fitted line',
        // mode: 'lines+markers',
        mode: 'lines', //DKDK no data point is displayed: only line
        // type: 'line',
        // line: {color: el.color, shape: 'spline',  width: 5 },
        //DKDK line width
        line: { color: fittingLineColor, shape: 'spline', width: 2 },
        // line: { shape: 'spline', width: 2 },
      });

      //DKDK make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element: any) => element).reverse()
      );

      console.log('xMin xMax =', xMin, xMax);

      //DKDK need to compare xMin/xMax
      xMin =
        xMin < Math.min(...xIntervalBounds.map(Number))
          ? xMin
          : Math.min(...xIntervalBounds.map(Number));
      xMax =
        xMax > Math.max(...xIntervalBounds.map(Number))
          ? xMax
          : Math.max(...xIntervalBounds.map(Number));

      //DKDK finding upper and lower bound values.
      const { yUpperValues, yLowerValues } = getBounds(
        //DKDK scatterplot - use yIntervalLineValue
        // el.interval.orientation === 'x'
        // ? xIntervalLineValue
        // : yIntervalLineValue,
        yIntervalLineValue,
        standardErrorValue
      );

      //DKDK make upper and lower bounds plotly format
      yIntervalBounds = yUpperValues;
      yIntervalBounds = yIntervalBounds.concat(
        yLowerValues.map((element: any) => element).reverse()
      );

      //DKDK set alpha/opacity as 0.2 for CI
      // intervalColor =
      //   'rgba(' + rgbValue[0] + ',' + rgbValue[1] + ',' + rgbValue[2] + ',0.2)';
      intervalColor = 'rgba(144,12,63,0.2)';

      //DKDK set variables for x-/y-axes ranges including CI/bounds: no need for x data as it was compared before
      yMin =
        yMin < Math.min(...yLowerValues.map(Number))
          ? yMin
          : Math.min(...yLowerValues.map(Number));
      yMax =
        yMax > Math.max(...yUpperValues.map(Number))
          ? yMax
          : Math.max(...yUpperValues.map(Number));

      //DKDK store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        name: 'Confidence interval',
        fill: 'tozerox',
        fillcolor: intervalColor,
        // opacity: 0.4,  //DKDK this works
        type: 'line',
        line: { color: 'transparent', shape: 'spline' }, //DKDK here, line means upper and lower bounds
      });
    }

    //DKDK determine y-axis range for numbers only: x-axis should be in the range of [xMin,xMax] due to CI plot
    if (typeof yMin == 'number' && typeof yMax == 'number') {
      yMin = yMin < 0 ? Math.floor(yMin) : Math.ceil(yMin);
      yMax = yMax < 0 ? Math.floor(yMax) : Math.ceil(yMax);
    }
  });

  return { dataSetProcess, xMin, xMax, yMin, yMax };
}

//DKDK util functions for processInputData()
//DKDK change HTML hex code to rgb array
const hexToRgb = (hex?: string): [number, number, number] => {
  if (!hex) return [0, 0, 0];
  const fullHex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (m: string, r: string, g: string, b: string): string =>
      '#' + r + r + g + g + b + b
  );
  const hexDigits = fullHex.substring(1);
  const matches = hexDigits.match(/.{2}/g);
  if (matches == null) return [0, 0, 0];
  return matches.map((x: string) => parseInt(x, 16)) as [
    number,
    number,
    number
  ];
};

//DKDK check number array and if empty
function isArrayOfNumbers(value: any): value is number[] {
  //DKDK value.length !==0
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
