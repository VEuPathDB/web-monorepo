// load scatter plot component
import XYPlot, { XYPlotProps } from '@veupathdb/components/lib/plots/XYPlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

// need to set for Scatterplot
import {
  DataClient,
  ScatterplotRequestParams,
  LineplotRequestParams,
  ScatterplotResponse,
  LineplotResponse,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';
// import { StudyEntity } from '../../../types/study';
import { PromiseType } from '../../../types/utility';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import {
  SelectorProps,
  VisualizationProps,
  VisualizationType,
} from '../VisualizationTypes';

import density from './selectorIcons/density.svg';
import line from './selectorIcons/line.svg';
import scatter from './selectorIcons/scatter.svg';

// use lodash instead of Math.min/max
import { min, max, lte, gte } from 'lodash';
// directly use RadioButtonGroup instead of XYPlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
// import XYPlotData
import { XYPlotData } from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import { StudyEntity } from '../../../types/study';
import { vocabularyWithMissingData } from '../../../utils/analysis';
import { gray } from '../colors';

// define PromiseXYPlotData
interface PromiseXYPlotData extends CoverageStatistics {
  dataSetProcess: XYPlotData;
  yMin: number;
  yMax: number;
}

// define XYPlotDataResponse
type XYPlotDataResponse = ScatterplotResponse | LineplotResponse;

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

export type ScatterplotConfig = t.TypeOf<typeof ScatterplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScatterplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  valueSpecConfig: t.string,
  showMissingness: t.boolean,
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

  // moved the location of this findEntityAndVariable
  const findEntityAndVariable = useFindEntityAndVariable(entities);

  const { xAxisVariable, yAxisVariable, overlayVariable } = useMemo(() => {
    const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);
    const yAxisVariable = findEntityAndVariable(vizConfig.yAxisVariable);
    const overlayVariable = findEntityAndVariable(vizConfig.overlayVariable);

    return {
      xAxisVariable: xAxisVariable ? xAxisVariable.variable : undefined,
      yAxisVariable: yAxisVariable ? yAxisVariable.variable : undefined,
      overlayVariable: overlayVariable ? overlayVariable.variable : undefined,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.overlayVariable,
  ]);

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
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig:
          findEntityAndVariable(yAxisVariable)?.variable.type === 'date'
            ? 'Raw'
            : vizConfig.valueSpecConfig,
      });
    },
    [updateVizConfig, findEntityAndVariable, vizConfig.valueSpecConfig]
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

  const onShowMissingnessChange = useCallback(
    (newState?: boolean) => {
      updateVizConfig({
        showMissingness: newState,
      });
    },
    [updateVizConfig]
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'xAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<PromiseXYPlotData | undefined> => {
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
        vizConfig,
        outputEntity,
        visualization.type
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
        reorderResponse(
          await response,
          vocabularyWithMissingData(
            overlayVariable?.vocabulary,
            vizConfig.showMissingness
          )
        ),
        visualization.type,
        independentValueType,
        dependentValueType,
        vizConfig.showMissingness && overlayVariable != null
      );
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
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
                role: 'primary',
              },
              {
                name: 'yAxisVariable',
                label: 'Y-axis',
                role: 'primary',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (optional)',
                role: 'stratification',
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
            showMissingness={vizConfig.showMissingness}
            onShowMissingnessChange={onShowMissingnessChange}
            outputEntity={outputEntity}
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
        <>
          <OutputEntityTitle
            entity={outputEntity}
            outputSize={data.pending ? undefined : data.value?.outputSize}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <ScatterplotWithControls
              // data.value
              data={
                data.value && !data.pending
                  ? data.value.dataSetProcess
                  : undefined
              }
              containerStyles={{
                width: '750px',
                height: '450px',
              }}
              // title={'Scatter plot'}
              displayLegend={
                data.value &&
                (data.value.dataSetProcess.series.length > 1 ||
                  vizConfig.overlayVariable != null)
              }
              independentAxisLabel={
                axisLabelWithUnit(xAxisVariable) ?? 'X-Axis'
              }
              dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-Axis'}
              dependentAxisRange={
                data.value && !data.pending
                  ? { min: data.value.yMin, max: data.value.yMax }
                  : undefined
              }
              // set valueSpec as Raw when yAxisVariable = date
              valueSpec={
                yAxisVariable?.type === 'date'
                  ? 'Raw'
                  : vizConfig.valueSpecConfig
              }
              onValueSpecChange={onValueSpecChange}
              // send visualization.type here
              vizType={visualization.type}
              interactive={true}
              showSpinner={data.pending}
              // add plotOptions to control the list of plot options
              plotOptions={[
                'Raw',
                'Smoothed mean with raw',
                'Best fit line with raw',
              ]}
              // disabledList prop is used to disable radio options (grayed out)
              disabledList={
                yAxisVariable?.type === 'date'
                  ? ['Smoothed mean with raw', 'Best fit line with raw']
                  : []
              }
              independentValueType={xAxisVariable?.type}
              dependentValueType={yAxisVariable?.type}
              legendTitle={overlayVariable?.displayName}
            />
            <VariableCoverageTable
              completeCases={
                data.value && !data.pending
                  ? data.value?.completeCases
                  : undefined
              }
              filters={filters}
              outputEntityId={outputEntity?.id}
              variableSpecs={[
                {
                  role: 'X-axis',
                  required: true,
                  display: xAxisVariable?.displayName,
                  variable: vizConfig.xAxisVariable,
                },
                {
                  role: 'Y-axis',
                  required: true,
                  display: yAxisVariable?.displayName,
                  variable: vizConfig.yAxisVariable,
                },
                {
                  role: 'Overlay',
                  display: overlayVariable?.displayName,
                  variable: vizConfig.overlayVariable,
                },
              ]}
            />
          </div>
        </>
      ) : (
        // thumbnail/grid view
        <XYPlot
          data={
            data.value && !data.pending ? data.value.dataSetProcess : undefined
          }
          containerStyles={{
            width: '230px',
            height: '150px',
          }}
          dependentAxisRange={
            data.value && !data.pending
              ? { min: data.value.yMin, max: data.value.yMax }
              : undefined
          }
          // new props for better displaying grid view
          displayLegend={false}
          displayLibraryControls={false}
          interactive={false}
          // margin is replaced with spacingOptions
          spacingOptions={{
            marginTop: 20,
            marginRight: 20,
            marginBottom: 20,
            marginLeft: 30,
          }}
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
  // add disabledList
  disabledList: string[];
};

function ScatterplotWithControls({
  data,
  // XYPlotControls: set initial value as 'raw' ('Raw')
  valueSpec = 'Raw',
  onValueSpecChange,
  vizType,
  // add plotOptions
  plotOptions,
  // add disabledList
  disabledList,
  ...scatterplotProps
}: ScatterplotWithControlsProps) {
  // TODO Use UIState
  // const errorManagement = useMemo((): ErrorManagement => {
  //   return {
  //     errors: [],
  //     addError: (_: Error) => {},
  //     removeError: (_: Error) => {},
  //     clearAllErrors: () => {},
  //   };
  // }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <XYPlot
        {...scatterplotProps}
        data={data}
        // add controls
        displayLibraryControls={false}
      />
      {/*  XYPlotControls: check vizType (only for scatterplot for now) */}
      {vizType === 'scatterplot' && (
        // use RadioButtonGroup directly instead of XYPlotControls
        <RadioButtonGroup
          label="Plot Modes"
          options={plotOptions}
          selectedOption={valueSpec}
          onOptionSelected={onValueSpecChange}
          // disabledList prop is used to disable radio options (grayed out)
          disabledList={disabledList}
          orientation={'horizontal'}
          labelPlacement={'end'}
          buttonColor={'primary'}
          margins={['1em', '0', '0', '6em']}
          itemMarginRight={50}
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
  dependentValueType: string,
  showMissingness: boolean = false
): PromiseXYPlotData {
  const modeValue = vizType === 'lineplot' ? 'lines' : 'markers'; // for scatterplot

  const { dataSetProcess, yMin, yMax } = processInputData(
    response,
    vizType,
    modeValue,
    independentValueType,
    dependentValueType,
    showMissingness
  );

  return {
    dataSetProcess: dataSetProcess,
    yMin: yMin,
    yMax: yMax,
    completeCases: response.completeCasesTable,
    outputSize: response.scatterplot.config.completeCases, // TO DO: won't work with densityplot response, when that's implemented
  };
}

// add an extended type including dataElementDependencyOrder
type getRequestParamsProps =
  | (ScatterplotRequestParams & {
      vizType?: string;
    })
  | (LineplotRequestParams & {
      vizType?: string;
    });

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: ScatterplotConfig,
  outputEntity?: StudyEntity,
  vizType?: string
): getRequestParamsProps {
  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    valueSpecConfig,
    showMissingness,
  } = vizConfig;

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
        // add outputEntityId
        outputEntityId: outputEntity?.id,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
        showMissingness: showMissingness ? 'TRUE' : 'FALSE',
      },
    } as LineplotRequestParams;
  } else {
    // scatterplot
    return {
      studyId,
      filters,
      config: {
        // add outputEntityId
        outputEntityId: outputEntity?.id,
        // XYPlotControls
        valueSpec: valueSpecValue,
        xAxisVariable: xAxisVariable,
        yAxisVariable: yAxisVariable,
        overlayVariable: overlayVariable,
        showMissingness: showMissingness ? 'TRUE' : 'FALSE',
      },
    } as ScatterplotRequestParams;
  }
}

// making plotly input data
function processInputData<T extends number | string>(
  dataSet: XYPlotDataResponse,
  vizType: string,
  // line, marker,
  modeValue: string,
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = vizType === 'densityplot' ? 'toself' : '';

  // distinguish data per Viztype
  // currently, lineplot returning scatterplot, not lineplot
  const plotDataSet =
    vizType === 'lineplot'
      ? dataSet.scatterplot
      : vizType === 'densityplot'
      ? dataSet.scatterplot // TO DO: it will have to be dataSet.densityplot
      : dataSet.scatterplot;

  // set variables for x- and yaxis ranges: no default values are set
  let yMin: number | string | undefined;
  let yMax: number | string | undefined;

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

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number) => {
    if (showMissingness && index === plotDataSet.data.length - 1) {
      return gray;
    } else {
      return `rgb(${markerColors[index]})`;
    }
  };

  // set dataSetProcess as any for now
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  plotDataSet?.data.forEach(function (el: any, index: number) {
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

      // compute yMin/yMax
      if (seriesY.length) {
        yMin =
          yMin != null
            ? lte(yMin, min(seriesY))
              ? yMin
              : min(seriesY)
            : min(seriesY);
        yMax =
          yMax != null
            ? gte(yMax, max(seriesY))
              ? yMax
              : max(seriesY)
            : max(seriesY);
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: seriesX.length ? seriesX : [null], // [null] hack required to make sure
        y: seriesY.length ? seriesY : [null], // Plotly has a legend entry for empty traces
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
        opacity: 0.7,
        marker: {
          color: markerColor(index),
        },
        // this needs to be here for the case of markers with line or lineplot.
        // always use spline?
        line: { color: markerColor(index), shape: 'spline' },
      });
    }
  });

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  plotDataSet?.data.forEach(function (el: any, index: number) {
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
      // need to check whether data is empty
      if (yIntervalLineValue.length) {
        yMin = el.seriesY.length
          ? lte(yMin, min(yIntervalLineValue))
            ? yMin
            : min(yIntervalLineValue)
          : min(yIntervalLineValue);
        yMax = el.seriesY.length
          ? gte(yMax, max(yIntervalLineValue))
            ? yMax
            : max(yIntervalLineValue)
          : max(yIntervalLineValue);
      }

      // store data for smoothed mean: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: xIntervalLineValue,
        y: yIntervalLineValue,
        // name: 'Smoothed mean',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + ', Smoothed mean'
          : 'Smoothed mean',
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: markerColor(index),
          shape: 'spline',
          width: 2,
        },
        // use scattergl
        type: 'scattergl',
      });

      // make Confidence Interval (CI) or Bounds (filled area)
      xIntervalBounds = xIntervalLineValue;
      xIntervalBounds = xIntervalBounds.concat(
        xIntervalLineValue.map((element) => element).reverse()
      );

      // finding upper and lower bound values.
      const { yUpperValues, yLowerValues } = getBounds(
        yIntervalLineValue,
        standardErrorValue
      );

      // make upper and lower bounds plotly format
      yIntervalBounds = yUpperValues;
      yIntervalBounds = yIntervalBounds.concat(
        yLowerValues.map((element) => element).reverse()
      );

      // set variables for y-axes ranges including CI/bounds
      if (yLowerValues.length) {
        yMin = lte(yMin, min(yLowerValues)) ? yMin : min(yLowerValues);
        yMax = gte(yMax, max(yUpperValues)) ? yMax : max(yUpperValues);
      }

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        // name: '95% Confidence interval',
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + ', 95% Confidence interval'
          : '95% Confidence interval',
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        opacity: 0.2,
        fillcolor: markerColor(index),
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
      if (el.bestFitLineY.length) {
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
      }

      // store data for fitting line: this is not affected by plot options (e.g., showLine etc.)
      dataSetProcess.push({
        x: bestFitLineX,
        y: el.bestFitLineY,
        // display R-square value at legend text(s)
        // name: 'Best fit<br>R<sup>2</sup> = ' + el.r2,
        name: el.overlayVariableDetails
          ? el.overlayVariableDetails.value + ', R² = ' + el.r2
          : 'Best fit, R² = ' + el.r2,
        mode: 'lines', // no data point is displayed: only line
        line: {
          color: markerColor(index),
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

  return { dataSetProcess: { series: dataSetProcess }, yMin, yMax };
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

function reorderResponse(
  response: XYPlotDataResponse,
  overlayVocabulary: string[] = []
) {
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = response.scatterplot.data.map(
      (series) => series.overlayVariableDetails?.value
    );
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return {
      ...response,
      scatterplot: {
        ...response.scatterplot,
        data: overlayIndices.map(
          (i, j) =>
            response.scatterplot.data[i] ?? {
              // if there is no series, insert a dummy series
              overlayVariableDetails: {
                value: overlayVocabulary[j],
              },
              seriesX: [],
              seriesY: [],
            }
        ),
      },
    };
  } else {
    return response;
  }
}
