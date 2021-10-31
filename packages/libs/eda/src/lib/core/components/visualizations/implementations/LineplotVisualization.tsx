// load plot component
import XYPlot, { XYPlotProps } from '@veupathdb/components/lib/plots/XYPlot';
import { PlotRef } from '@veupathdb/components/lib/plots/PlotlyPlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useEffect, useMemo, useRef } from 'react';

// need to set for lineplot
import {
  DataClient,
  LineplotRequestParams,
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
import { BirdsEyeView } from '../../BirdsEyeView';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import {
  SelectorProps,
  VisualizationProps,
  VisualizationType,
} from '../VisualizationTypes';

import density from './selectorIcons/density.svg';
import line from './selectorIcons/line.svg';

// use lodash instead of Math.min/max
import { min, max, lte, gte } from 'lodash';
// directly use RadioButtonGroup instead of XYPlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
// import XYPlotData
import { XYPlotData } from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { axisLabelWithUnit } from '../../../utils/axis-label-unit';
import { NumberVariable, StudyEntity, Variable } from '../../../types/study';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  vocabularyWithMissingData,
} from '../../../utils/analysis';
import { gray } from '../colors';
import {
  ColorPaletteDefault,
  ColorPaletteDark,
} from '@veupathdb/components/lib/types/plots/addOns';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { axisRangeMargin } from '../../../utils/axis-range-margin';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// util to find dependent axis range
import { defaultDependentAxisRange } from '../../../utils/default-dependent-axis-range';
import { useRouteMatch } from 'react-router';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import PluginError from '../PluginError';

const plotDimensions = {
  width: 750,
  height: 450,
};

// define PromiseXYPlotData
interface PromiseXYPlotData extends CoverageStatistics {
  dataSetProcess: XYPlotData;
  // change these types to be compatible with new axis range
  yMin: number | string | undefined;
  yMax: number | string | undefined;
}

// define XYPlotDataResponse
type XYPlotDataResponse = LineplotResponse;

export const lineplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: LineplotViz,
  createDefaultConfig: createDefaultConfig,
};

// this needs a handling of text/image for line, and density plots
function SelectorComponent({ name }: SelectorProps) {
  const src = name === 'lineplot' || name === 'timeseries' ? line : density;

  return (
    <img alt="Line plot" style={{ height: '100%', width: '100%' }} src={src} />
  );
}

function createDefaultConfig(): LineplotConfig {
  return {
    valueSpecConfig: 'Median',
  };
}

export type LineplotConfig = t.TypeOf<typeof LineplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LineplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  yAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
  valueSpecConfig: t.string,
  showMissingness: t.boolean,
});

function LineplotViz(props: VisualizationProps) {
  const {
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
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
      LineplotConfig.decode(visualization.descriptor.configuration),
      getOrElse((): t.TypeOf<typeof LineplotConfig> => createDefaultConfig())
    );
  }, [visualization.descriptor.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<LineplotConfig>) => {
      updateConfiguration({ ...vizConfig, ...newConfig });
    },
    [updateConfiguration, vizConfig]
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
    (selectedVariables: VariablesByInputName) => {
      const {
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
      } = selectedVariables;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
        valueSpecConfig: vizConfig.valueSpecConfig,
      });
    },
    [updateVizConfig, findEntityAndVariable, vizConfig.valueSpecConfig]
  );

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof LineplotConfig) => (newValue?: ValueType) => {
      updateVizConfig({
        [key]: newValue,
      });
    },
    [updateVizConfig]
  );
  const onValueSpecChange = onChangeHandlerFactory<string>('valueSpecConfig');
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness'
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

      const vars = [xAxisVariable, yAxisVariable, overlayVariable];
      const unique = vars.filter((item, i, ar) => ar.indexOf(item) === i);
      if (vars.length !== unique.length)
        throw new Error(
          'Variables must be unique. Please choose different variables.'
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig,
        outputEntity,
        visualization.descriptor.type
      );

      // lineplot
      const response =
        visualization.descriptor.type === 'lineplot'
          ? dataClient.getLineplot(
              computation.descriptor.type,
              params as LineplotRequestParams
            )
          : dataClient.getTimeseries(
              computation.descriptor.type,
              params as LineplotRequestParams
            );

      const showMissing = vizConfig.showMissingness && overlayVariable != null;
      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );

      const plotResponseData = lineplotResponseToData(
        reorderResponse(
          await response,
          vocabularyWithMissingData(overlayVocabulary, showMissing),
          overlayVariable
        ),
        visualization.descriptor.type,
        independentValueType,
        dependentValueType,
        showMissing,
        overlayVariable
      );
      return plotResponseData;
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      computation.descriptor.type,
      visualization.descriptor.type,
    ])
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // variable's metadata-based independent axis range with margin
  const defaultIndependentRangeMargin = useMemo(() => {
    const defaultIndependentRange = defaultIndependentAxisRange(
      xAxisVariable,
      'lineplot'
    );
    return axisRangeMargin(defaultIndependentRange, xAxisVariable?.type);
  }, [xAxisVariable]);

  // find deependent axis range and its margin
  const defaultDependentRangeMargin = useMemo(() => {
    //K set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value != null
        ? { min: data.value.yMin, max: data.value?.yMax }
        : undefined;

    const defaultDependentRange = defaultDependentAxisRange(
      yAxisVariable,
      'lineplot',
      yMinMaxRange
    );

    return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
  }, [data, yAxisVariable]);

  const { url } = useRouteMatch();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              label: 'Overlay',
              role: 'stratification',
            },
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
            overlayVariable: vizConfig.overlayVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            overlayVariable != null &&
            data.value?.completeCasesAllVars !==
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <LineplotWithControls
          // data.value
          data={data.value?.dataSetProcess}
          updateThumbnail={updateThumbnail}
          containerStyles={plotDimensions}
          displayLegend={
            data.value &&
            (data.value.dataSetProcess.series.length > 1 ||
              vizConfig.overlayVariable != null)
          }
          independentAxisLabel={axisLabelWithUnit(xAxisVariable) ?? 'X-axis'}
          dependentAxisLabel={axisLabelWithUnit(yAxisVariable) ?? 'Y-axis'}
          // variable's metadata-based independent axis range with margin
          independentAxisRange={defaultIndependentRangeMargin}
          // new dependent axis range
          dependentAxisRange={
            data.value && !data.pending
              ? defaultDependentRangeMargin
              : undefined
          }
          valueSpec={vizConfig.valueSpecConfig}
          onValueSpecChange={onValueSpecChange}
          // send visualization.type here
          vizType={visualization.descriptor.type}
          interactive={true}
          showSpinner={data.pending}
          // add plotOptions to control the list of plot options
          plotOptions={['Median', 'Mean']}
          independentValueType={
            NumberVariable.is(xAxisVariable) ? 'number' : 'date'
          }
          dependentValueType={
            NumberVariable.is(yAxisVariable) ? 'number' : 'date'
          }
          legendTitle={axisLabelWithUnit(overlayVariable)}
        />
        <div className="viz-plot-info">
          <BirdsEyeView
            completeCasesAllVars={
              data.pending ? undefined : data.value?.completeCasesAllVars
            }
            completeCasesAxesVars={
              data.pending ? undefined : data.value?.completeCasesAxesVars
            }
            filters={filters}
            outputEntity={outputEntity}
            stratificationIsActive={overlayVariable != null}
            enableSpinner={
              xAxisVariable != null && yAxisVariable != null && !data.error
            }
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
                display: axisLabelWithUnit(xAxisVariable),
                variable: vizConfig.xAxisVariable,
              },
              {
                role: 'Y-axis',
                required: true,
                display: axisLabelWithUnit(yAxisVariable),
                variable: vizConfig.yAxisVariable,
              },
              {
                role: 'Overlay',
                display: axisLabelWithUnit(overlayVariable),
                variable: vizConfig.overlayVariable,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

type LineplotWithControlsProps = XYPlotProps & {
  valueSpec: string | undefined;
  onValueSpecChange: (value: string) => void;
  updateThumbnail: (src: string) => void;
  vizType: string;
  plotOptions: string[];
};

function LineplotWithControls({
  data,
  // set initial value as 'median' ('Median')
  valueSpec = 'Median',
  onValueSpecChange,
  vizType,
  // add plotOptions
  plotOptions,
  updateThumbnail,
  ...lineplotProps
}: LineplotWithControlsProps) {
  // TODO Use UIState
  // const errorManagement = useMemo((): ErrorManagement => {
  //   return {
  //     errors: [],
  //     addError: (_: Error) => {},
  //     removeError: (_: Error) => {},
  //     clearAllErrors: () => {},
  //   };
  // }, []);

  const plotRef = useRef<PlotRef>(null);

  const updateThumbnailRef = useRef(updateThumbnail);
  useEffect(() => {
    updateThumbnailRef.current = updateThumbnail;
  });

  useEffect(() => {
    plotRef.current
      ?.toImage({ format: 'svg', ...plotDimensions })
      .then(updateThumbnailRef.current);
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <XYPlot
        {...lineplotProps}
        ref={plotRef}
        data={data}
        // add controls
        displayLibraryControls={false}
      />
      {
        // use RadioButtonGroup directly instead of XYPlotControls
        <RadioButtonGroup
          label="Plot Modes"
          options={plotOptions}
          selectedOption={valueSpec}
          onOptionSelected={onValueSpecChange}
          orientation={'horizontal'}
          labelPlacement={'end'}
          buttonColor={'primary'}
          margins={['1em', '0', '0', '6em']}
          itemMarginRight={50}
        />
      }
    </div>
  );
}

/**
 * Reformat response from Line Plot endpoints into complete XYplotData
 * @param response
 * @returns XYplotData
 */
export function lineplotResponseToData(
  response: PromiseType<
    ReturnType<DataClient['getLineplot'] | DataClient['getTimeseries']>
  >,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string,
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean = false,
  overlayVariable?: Variable
): PromiseXYPlotData {
  const modeValue = 'lines';

  const { dataSetProcess, yMin, yMax } = processInputData(
    response,
    vizType,
    modeValue,
    independentValueType,
    dependentValueType,
    showMissingness,
    overlayVariable
  );

  return {
    dataSetProcess: dataSetProcess,
    yMin: yMin,
    yMax: yMax,
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.lineplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.lineplot.config.completeCasesAxesVars,
  };
}

// add an extended type including dataElementDependencyOrder
type getRequestParamsProps = LineplotRequestParams & { vizType?: string };

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: LineplotConfig,
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
  let valueSpecValue = 'median';
  if (valueSpecConfig === 'Mean') {
    valueSpecValue = 'mean';
  }

  return {
    studyId,
    filters,
    config: {
      // add outputEntityId
      outputEntityId: outputEntity?.id,
      valueSpec: valueSpecValue,
      xAxisVariable: xAxisVariable,
      yAxisVariable: yAxisVariable,
      overlayVariable: overlayVariable,
      showMissingness: showMissingness ? 'TRUE' : 'FALSE',
    },
  } as LineplotRequestParams;
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
  showMissingness: boolean,
  overlayVariable?: Variable
) {
  // set fillAreaValue for densityplot
  const fillAreaValue = vizType === 'densityplot' ? 'toself' : '';

  // distinguish data per Viztype
  const plotDataSet = dataSet.lineplot;

  // set variables for x- and yaxis ranges: no default values are set
  let yMin: number | string | undefined;
  let yMax: number | string | undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    plotDataSet?.data.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] },
      yMin,
      yMax,
    };
  }

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number) => {
    if (showMissingness && index === plotDataSet.data.length - 1) {
      return gray;
    } else {
      return ColorPaletteDefault[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // using dark color: function to return color or gray where needed if showMissingness == true
  const markerColorDark = (index: number) => {
    if (showMissingness && index === plotDataSet.data.length - 1) {
      return gray;
    } else {
      return ColorPaletteDark[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  const noMissingData =
    dataSet.lineplot.config.completeCasesAllVars ===
    dataSet.lineplot.config.completeCasesAxesVars;
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness && noMissingData && index === plotDataSet.data.length - 2
    );
  };

  // set dataSetProcess as any for now
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  plotDataSet?.data.some(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // series is for points
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

      // add data considering input options
      dataSetProcess.push({
        x: seriesX.length ? seriesX : [null], // [null] hack required to make sure
        y: seriesY.length ? seriesY : [null], // Plotly has a legend entry for empty traces
        // distinguish X/Y Data from Overlay
        name:
          el.overlayVariableDetails?.value != null
            ? fixLabelForNumberVariables(
                el.overlayVariableDetails.value,
                overlayVariable
              )
            : 'Data',
        mode: modeValue,
        type: 'scatter',
        fill: fillAreaValue,
        opacity: 0.7,
        line: { color: markerColor(index), shape: 'linear' },
      });
      return breakAfterThisSeries(index);
    }
    return false;
  });

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
    const tmp = Number(value) + 2;
    return tmp as T;
  });
  const yLowerValues = values.map((value, idx) => {
    const tmp = Number(value) - 2;
    return tmp as T;
  });

  return { yUpperValues, yLowerValues };
}

function reorderResponse(
  response: XYPlotDataResponse,
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable
) {
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = response.lineplot.data
      .map((series) => series.overlayVariableDetails?.value)
      .filter((value) => value != null)
      .map((value) => fixLabelForNumberVariables(value!, overlayVariable));
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return {
      ...response,
      lineplot: {
        ...response.lineplot,
        data: overlayIndices.map(
          (i, j) =>
            response.lineplot.data[i] ?? {
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
