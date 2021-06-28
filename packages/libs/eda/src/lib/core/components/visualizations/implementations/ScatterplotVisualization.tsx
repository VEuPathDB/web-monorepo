// load scatter plot component
import XYPlot, { XYPlotProps } from '@veupathdb/components/lib/plots/XYPlot';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

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
import {
  SelectorProps,
  VisualizationProps,
  VisualizationType,
} from '../VisualizationTypes';

import density from './selectorIcons/density.svg';
import line from './selectorIcons/line.svg';
import scatter from './selectorIcons/scatter.svg';

// XYPlotControls
import XYPlotControls from '@veupathdb/components/lib/components/plotControls/XYPlotControls';
import { min, max, lte, gte } from 'lodash';

export const scatterplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  return <ScatterplotViz {...props} fullscreen={false} />;
}

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent({ name }: SelectorProps) {
  const src =
    name === 'lineplot' ? line : name === 'densityplot' ? density : scatter;

  return (
    <img
      alt="Scatter plot"
      style={{ height: '100%', width: '100%' }}
      src={src}
    />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <ScatterplotViz {...props} fullscreen />;
}

function createDefaultConfig(): ScatterplotConfig {
  return {
    valueSpecConfig: 'Raw',
  };
}

type ScatterplotConfig = t.TypeOf<typeof ScatterplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ScatterplotConfig = t.partial({
  xAxisVariable: Variable,
  yAxisVariable: Variable,
  overlayVariable: Variable,
  facetVariable: Variable,
  valueSpecConfig: t.string,
});

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
    starredVariables,
    toggleStarredVariable,
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

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      const {
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      } = values;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      });
    },
    [updateVizConfig]
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

  // XYPlotControls: add valueSpec option
  const onValueSpecChange = useCallback(
    (value: string) => {
      updateVizConfig({
        valueSpecConfig: value,
      });
    },
    [updateVizConfig]
  );

  const data = usePromise(
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      const yAxisVariable = findVariable(vizConfig.yAxisVariable);

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      // check variable inputs: this is necessary to prevent from data post
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;
      else if (vizConfig.yAxisVariable == null || yAxisVariable == null)
        return undefined;

      if (xAxisVariable === yAxisVariable)
        throw new Error(
          'The X and Y variables should not be the same. Please choose different variables for X and Y.'
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable,
        vizConfig.yAxisVariable,
        vizConfig.overlayVariable,
        // add visualization.type
        visualization.type,
        // XYPlotControls
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

      // send visualization.type, independentValueType, and dependentValueType as well
      return scatterplotResponseToData(
        await response,
        visualization.type,
        independentValueType,
        dependentValueType
      );
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
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'X-axis',
              },
              {
                name: 'yAxisVariable',
                label: 'Y-axis',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (optional)',
              },
              {
                name: 'facetVariable',
                label: 'Facet (optional)',
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
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
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
      {fullscreen ? (
        <ScatterplotWithControls
          // data.value
          data={
            data.value && !data.pending ? [...data.value.dataSetProcess] : []
          }
          width={1000}
          height={600}
          // title={'Scatter plot'}
          independentAxisLabel={
            findVariable(vizConfig.xAxisVariable)?.displayName
          }
          dependentAxisLabel={
            findVariable(vizConfig.yAxisVariable)?.displayName
          }
          // independentAxisRange={data.value && !data.pending ? [data.value.xMin, data.value.xMax] : []}
          // block this for now
          dependentAxisRange={
            data.value && !data.pending
              ? [data.value.yMin, data.value.yMax]
              : []
          }
          // XYPlotControls valueSpecInitial
          valueSpec={vizConfig.valueSpecConfig}
          // valueSpec={valueSpecInitial}
          onValueSpecChange={onValueSpecChange}
          // send visualization.type here
          vizType={visualization.type}
          showSpinner={data.pending}
          // add plotOptions to control the list of plot options
          plotOptions={
            findVariable(vizConfig.yAxisVariable)?.type === 'date'
              ? ['Raw']
              : ['Raw', 'Smoothed mean with raw', 'Best fit line with raw']
          }
        />
      ) : (
        // thumbnail/grid view
        <XYPlot
          data={
            data.value && !data.pending ? [...data.value.dataSetProcess] : []
          }
          width={230}
          height={150}
          // independentAxisRange={data.value && !data.pending ? [data.value.xMin, data.value.xMax] : []}
          // block this for now
          dependentAxisRange={
            data.value && !data.pending
              ? [data.value.yMin, data.value.yMax]
              : []
          }
          // new props for better displaying grid view
          displayLegend={false}
          displayLibraryControls={false}
          staticPlot={true}
          margin={{ l: 30, r: 20, b: 15, t: 20 }}
          showSpinner={data.pending}
        />
      )}
    </div>
  );
}

type ScatterplotWithControlsProps = XYPlotProps & {
  valueSpec: string | undefined;
  onValueSpecChange: (value: string) => void;
  vizType: string;
  plotOptions: string[];
};

function ScatterplotWithControls({
  data,
  // XYPlotControls: set initial value as 'raw' ('Raw')
  valueSpec = 'Raw',
  onValueSpecChange,
  vizType,
  // add plotOptions
  plotOptions,
  ...ScatterplotProps
}: ScatterplotWithControlsProps) {
  // TODO Use UIState
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (_: Error) => {},
      removeError: (_: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <XYPlot
        {...ScatterplotProps}
        data={data}
        // add controls
        displayLegend={data.length > 1}
        displayLibraryControls={false}
      />
      {/*  XYPlotControls: check vizType (only for scatterplot for now) */}
      {vizType === 'scatterplot' && (
        <XYPlotControls
          // label="Scatter Plot Controls"
          valueSpec={valueSpec}
          onValueSpecChange={onValueSpecChange}
          errorManagement={errorManagement}
          // new radio button
          orientation={'horizontal'}
          labelPlacement={'end'}
          // minWidth is used to set equivalent space per item
          minWidth={210}
          buttonColor={'primary'}
          margins={['0', '0', '0', '5em']}
          itemMarginRight={50}
          // add plotOptions
          plotOptions={plotOptions}
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
  vizType: string,
  independentValueType: string,
  dependentValueType: string
) {
  const modeValue = vizType === 'lineplot' ? 'lines' : 'markers'; // for scatterplot

  const { dataSetProcess, yMin, yMax } = processInputData(
    response,
    vizType,
    modeValue,
    independentValueType,
    dependentValueType
  );

  return {
    dataSetProcess: dataSetProcess,
    // xMin: xMin,
    // xMax: xMax,
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
  // set yAxisVariable as optional for densityplot
  yAxisVariable?: Variable,
  overlayVariable?: Variable,
  // add visualization.type
  vizType?: string,
  // XYPlotControls
  valueSpecConfig?: string
): getRequestParamsProps {
  // valueSpec
  let valueSpecValue = 'raw';
  if (valueSpecConfig === 'Smoothed mean with raw') {
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
        // XYPlotControls
        valueSpec: valueSpecValue,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
      },
    } as ScatterplotRequestParams;
  }
}

// making plotly input data
function processInputData<T extends number | string>(
  dataSet: any,
  vizType: string,
  // line, marker,
  modeValue: string,
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = vizType === 'densityplot' ? 'toself' : '';

  // distinguish data per Viztype
  // currently, lineplot returning scatterplot, not lineplot
  const plotDataSet =
    vizType === 'lineplot'
      ? dataSet.scatterplot
      : vizType === 'densityplot'
      ? dataSet.densityplot
      : dataSet.scatterplot;

  // set variables for x- and yaxis ranges
  let yMin: number | string | undefined = 0;
  let yMax: number | string | undefined = 0;

  // coloring: using plotly.js default colors
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

  // set dataSetProcess as any
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  plotDataSet.data.forEach(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // series is for scatter plot
    if (el.seriesX && el.seriesY) {
      // check the number of x = number of y
      if (el.seriesX.length !== el.seriesY.length) {
        // alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      /*
        For raw data, there are two cases:
          a) X: number string; Y: date string
          b) X: date string; Y: number string
        For the case of b), smoothed mean and best fit line option would get backend response error
      **/
      if (independentValueType === 'date') {
        seriesX = el.seriesX;
      } else {
        seriesX = el.seriesX.map(Number);
      }
      if (dependentValueType === 'date') {
        seriesY = el.seriesY;
      } else {
        seriesY = el.seriesY.map(Number);
      }

      // console.log('seriesX = ', seriesX)

      // check if this Y array consists of numbers & add type assertion
      if (index === 0) {
        // if (seriesY && seriesY !== undefined) {
        yMin = min(seriesY);
        yMax = max(seriesY);
        // }
      } else {
        yMin =
          // (yMin !== undefined && seriesY.length !== 0 && yMin < min(seriesY)) ? yMin : min(seriesY);
          lte(yMin, min(seriesY)) ? yMin : min(seriesY);
        yMax = gte(yMax, max(seriesY)) ? yMax : max(seriesY);
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: seriesX,
        y: seriesY,
        // distinguish X/Y Data from Overlay
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value
          : 'Data',
        mode: modeValue,
        type:
          vizType === 'lineplot'
            ? 'scatter'
            : vizType === 'densityplot'
            ? 'scatter'
            : 'scattergl', // for the raw data of the scatterplot
        fill: fillAreaValue,
        marker: {
          color: 'rgba(' + markerColors[index] + ',0.7)',
          // size: 6,
          // line: { color: 'rgba(' + markerColors[index] + ',0.7)', width: 2 },
        },
        // this needs to be here for the case of markers with line or lineplot.
        // always use spline?
        line: { color: 'rgba(' + markerColors[index] + ',1)', shape: 'spline' },
      });
    }
  });

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  plotDataSet.data.forEach(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: number[] = [];
    let standardErrorValue: number[] = []; // this is for standardError

    let xIntervalBounds: T[] = [];
    let yIntervalBounds: number[] = [];

    // initialize smoothedMeanX, bestFitLineX
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // check if smoothedMean prop exists
    if (el.smoothedMeanX && el.smoothedMeanY && el.smoothedMeanSE) {
      // check the number of x = number of y or standardError
      if (el.smoothedMeanX.length !== el.smoothedMeanY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data or standardError data'
        );
      }

      // change string array to number array for numeric data
      if (independentValueType === 'date') {
        smoothedMeanX = el.smoothedMeanX;
      } else {
        smoothedMeanX = el.smoothedMeanX.map(Number);
      }
      // smoothedMeanY/SE are number[]

      // the date format, yyyy-mm-dd works with sort, so no change in the following is required
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

      // add additional condition for the case of smoothedMean (without series data)
      yMin = el.seriesY
        ? lte(yMin, min(yIntervalLineValue))
          ? yMin
          : min(yIntervalLineValue)
        : min(yIntervalLineValue);
      yMax = el.seriesY
        ? gte(yMax, max(yIntervalLineValue))
          ? yMax
          : max(yIntervalLineValue)
        : max(yIntervalLineValue);

      // store data for smoothed mean: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        // name: 'Smoothed mean',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>Smoothed mean'
          : 'Smoothed mean',
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: 'rgba(' + markerColors[index] + ',1)',
          shape: 'spline',
          width: 2,
        },
        // use scattergl
        type: 'scattergl',
      });

      // make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element: any) => element).reverse()
      );

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
      yMin = lte(yMin, min(yLowerValues)) ? yMin : min(yLowerValues);
      yMax = gte(yMax, max(yLowerValues)) ? yMax : max(yLowerValues);

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        // name: '95% Confidence interval',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>95% Confidence interval'
          : '95% Confidence interval',
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        fillcolor: 'rgba(' + markerColors[index] + ',0.2)',
        // type: 'line',
        type: 'scattergl',
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

      // change string array to number array for numeric data
      if (independentValueType === 'date') {
        bestFitLineX = el.bestFitLineX;
      } else {
        bestFitLineX = el.bestFitLineX.map(Number);
      }

      // add additional condition for the case of smoothedMean (without series data)
      yMin = el.seriesY
        ? lte(yMin, min(el.bestFitLineY))
          ? yMin
          : min(el.bestFitLineY)
        : min(el.bestFitLineY);
      yMax = el.seriesY
        ? gte(yMax, max(el.bestFitLineY))
          ? yMax
          : max(el.bestFitLineY)
        : max(el.bestFitLineY);

      // store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: bestFitLineX,
        y: el.bestFitLineY,
        // display R-square value at legend text(s)
        // name: 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + '<br>R<sup>2</sup> = ' + el.r2
          : 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: 'rgba(' + markerColors[index] + ',1)',
          shape: 'spline',
        },
        // use scattergl
        type: 'scattergl',
      });
    }
  });

  // make some margin for y-axis range (5% of range for now)
  if (typeof yMin == 'number' && typeof yMax == 'number') {
    yMin = yMin - (yMax - yMin) * 0.05;
    yMax = yMax + (yMax - yMin) * 0.05;
  } else {
    // set yMin/yMax to be NaN so that plotly uses autoscale for date type
    yMin = NaN;
    yMax = NaN;
  }

  return { dataSetProcess, yMin, yMax };
}

/*
 * Utility functions for processInputData()
 */

function getBounds<T extends number | string>(
  values: T[],
  standardErrors: T[]
): {
  yUpperValues: T[];
  yLowerValues: T[];
} {
  const yUpperValues = values.map((value, idx) => {
    const tmp = Number(value) + 2 * Number(standardErrors[idx]);
    return tmp as T;
  });
  const yLowerValues = values.map((value, idx) => {
    const tmp = Number(value) - 2 * Number(standardErrors[idx]);
    return tmp as T;
  });

  return { yUpperValues, yLowerValues };
}
