// load plot component
import LinePlot, {
  LinePlotProps,
} from '@veupathdb/components/lib/plots/LinePlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

import DataClient, {
  LineplotRequestParams,
  LineplotResponse,
} from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';

import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import line from './selectorIcons/line.svg';

// use lodash instead of Math.min/max
import {
  isEqual,
  min,
  max,
  groupBy,
  size,
  head,
  values,
  mapValues,
  map,
  keys,
} from 'lodash';
// directly use RadioButtonGroup instead of LinePlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  NumberOrDateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import {
  LinePlotDataSeries,
  LinePlotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  NumberVariable,
  DateVariable,
  StudyEntity,
  Variable,
  StringVariable,
} from '../../../types/study';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  variablesAreUnique,
  nonUniqueWarning,
  vocabularyWithMissingData,
  hasIncompleteCases,
} from '../../../utils/visualization';
import { gray } from '../colors';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../../utils/default-independent-axis-range';
import { axisRangeMargin } from '../../../utils/axis-range-margin';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
// util to find dependent axis range - changed the name
import { numberDateDefaultDependentAxisRange } from '../../../utils/default-dependent-axis-range';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { isFaceted, isTimeDelta } from '@veupathdb/components/lib/types/guards';
import FacetedLinePlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedLinePlot';
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';
import { BinSpec, BinWidthSlider, TimeUnit } from '../../../types/general';
import { useVizConfig } from '../../../hooks/visualizations';
import { useInputStyles } from '../inputStyles';
import { ValuePicker } from './ValuePicker';
import Tooltip from '@veupathdb/wdk-client/lib/Components/Overlays/Tooltip';

// concerning axis range control
import { NumberOrDateRange as NumberOrDateRangeT } from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils-viz';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import Button from '@veupathdb/components/lib/components/widgets/Button';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { UIState } from '../../filter/HistogramFilter';

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const plotSpacingOptions = {};

const modalPlotContainerStyles = {
  width: '85%',
  height: '100%',
  margin: 'auto',
};

// define LinePlotDataWithCoverage
interface LinePlotDataWithCoverage extends CoverageStatistics {
  dataSetProcess: LinePlotData | FacetedData<LinePlotData>;
  // change these types to be compatible with new axis range
  xMin: number | string | undefined;
  xMax: number | string | undefined;
  yMin: number | string | undefined;
  yMax: number | string | undefined;
}

// define LinePlotDataResponse
type LinePlotDataResponse = LineplotResponse;

export const lineplotVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: LineplotViz,
  createDefaultConfig: createDefaultConfig,
};

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent() {
  const src = line;

  return (
    <img alt="Line plot" style={{ height: '100%', width: '100%' }} src={src} />
  );
}

// Display names to internal names
const valueSpecLookup: Record<
  string,
  LineplotRequestParams['config']['valueSpec']
> = {
  Mean: 'mean',
  Median: 'median',
  Proportion: 'proportion', // used to be 'Ratio or proportion' hence the lookup rather than simple lowercasing
};

const timeUnitLookup: Record<string, TimeUnit> = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

function createDefaultConfig(): LineplotConfig {
  return {
    valueSpecConfig: 'Mean',
    useBinning: false,
  };
}

export type LineplotConfig = t.TypeOf<typeof LineplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LineplotConfig = t.intersection([
  t.type({
    valueSpecConfig: t.keyof(valueSpecLookup),
    useBinning: t.boolean,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    yAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
    binWidth: t.number,
    binWidthTimeUnit: TimeUnit,
    showMissingness: t.boolean,
    checkedLegendItems: t.array(t.string),
    showErrorBars: t.boolean,
    numeratorValues: t.array(t.string),
    denominatorValues: t.array(t.string),
    // axis range control
    independentAxisRange: NumberOrDateRangeT,
    dependentAxisRange: NumberOrDateRangeT,
  }),
]);

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
    totalCounts,
    filteredCounts,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useMemo(
    () =>
      Array.from(preorder(studyMetadata.rootEntity, (e) => e.children || [])),
    [studyMetadata]
  );
  const dataClient: DataClient = useDataClient();

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    LineplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // moved the location of this findEntityAndVariable
  const findEntityAndVariable = useFindEntityAndVariable(entities);

  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    overlayEntity,
    facetVariable,
    facetEntity,
  } = useMemo(() => {
    const { variable: xAxisVariable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    const { variable: yAxisVariable } =
      findEntityAndVariable(vizConfig.yAxisVariable) ?? {};
    const { variable: overlayVariable, entity: overlayEntity } =
      findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    const { variable: facetVariable, entity: facetEntity } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
    };
  }, [
    findEntityAndVariable,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
  ]);

  const categoricalMode = isSuitableCategoricalVariable(yAxisVariable);
  const valuesAreSpecified =
    vizConfig.numeratorValues != null &&
    vizConfig.numeratorValues.length > 0 &&
    vizConfig.denominatorValues != null &&
    vizConfig.denominatorValues.length > 0;

  // axis range control: set the state of truncation warning message
  const [
    truncatedIndependentAxisWarning,
    setTruncatedIndependentAxisWarning,
  ] = useState<string>('');
  const [
    truncatedDependentAxisWarning,
    setTruncatedDependentAxisWarning,
  ] = useState<string>('');

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const keepBin = isEqual(
        selectedVariables.xAxisVariable,
        vizConfig.xAxisVariable
      );
      const keepValues = isEqual(
        selectedVariables.yAxisVariable,
        vizConfig.yAxisVariable
      );

      // need to get the yAxisVariable metadata right here, right now
      // (we can't use the more generally scoped 'yAxisVariable' because it's based on vizConfig and is out of date)
      const { variable: yAxisVar } =
        findEntityAndVariable(selectedVariables.yAxisVariable) ?? {};

      const valueSpec = isSuitableCategoricalVariable(yAxisVar)
        ? 'Proportion'
        : vizConfig.valueSpecConfig === 'Proportion'
        ? createDefaultConfig().valueSpecConfig
        : vizConfig.valueSpecConfig;

      updateVizConfig({
        ...selectedVariables,
        binWidth: keepBin ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig: valueSpec,
        // set undefined for variable change
        checkedLegendItems: undefined,
        // axis range control: set independentAxisRange undefined
        independentAxisRange: undefined,
        dependentAxisRange: undefined,
        ...(keepValues
          ? {}
          : {
              numeratorValues: undefined,
              denominatorValues:
                yAxisVar != null ? yAxisVar.vocabulary : undefined,
            }),
      });
      // axis range control: close truncation warnings here
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [
      updateVizConfig,
      vizConfig.xAxisVariable,
      vizConfig.valueSpecConfig,
      vizConfig.valueSpecConfig,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      findEntityAndVariable,
    ]
  );

  const onBinWidthChange = useCallback(
    (newBinWidth: NumberOrTimeDelta) => {
      if (newBinWidth) {
        updateVizConfig({
          binWidth: isTimeDelta(newBinWidth) ? newBinWidth.value : newBinWidth,
          binWidthTimeUnit: isTimeDelta(newBinWidth)
            ? timeUnitLookup[newBinWidth.unit]
            : undefined,
        });
      }
    },
    [updateVizConfig]
  );

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  // considering axis range control
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof LineplotConfig, resetCheckedLegendItems?: boolean, resetAxisRanges?: boolean) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
      	...(resetAxisRanges ? { independentAxisRange: undefined, dependentAxisRange: undefined } : {}),
      };
      updateVizConfig(newPartialConfig);
      if (resetAxisRanges) {
        setTruncatedIndependentAxisWarning('');
        setTruncatedDependentAxisWarning('');
      }
    },
    [updateVizConfig]
  );

  // set checkedLegendItems: undefined for the change of both plot options and showMissingness
  const onValueSpecChange = onChangeHandlerFactory<string>(
    'valueSpecConfig',
    true,
    // axis range control: resetAxisRange
    true
  );
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    // axis range control: resetAxisRange
    true
  );

  // for vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  const onShowErrorBarsChange = onChangeHandlerFactory<boolean>(
    'showErrorBars',
    true
    // need to consider axis range control: resetAxisRange? seems not
  );

  const onUseBinningChange = onChangeHandlerFactory<boolean>('useBinning');
  const onNumeratorValuesChange = onChangeHandlerFactory<string[]>(
    'numeratorValues'
  );
  const onDenominatorValuesChange = onChangeHandlerFactory<string[]>(
    'denominatorValues'
  );

  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'yAxisVariable',
    entities
  );

  const data = usePromise(
    useCallback(async (): Promise<LinePlotDataWithCoverage | undefined> => {
      if (
        outputEntity == null ||
        xAxisVariable == null ||
        yAxisVariable == null ||
        filteredCounts.pending ||
        filteredCounts.value == null
      )
        return undefined;

      if (
        !variablesAreUnique([
          xAxisVariable,
          yAxisVariable,
          overlayVariable,
          facetVariable,
        ])
      )
        throw new Error(nonUniqueWarning);

      if (categoricalMode && !valuesAreSpecified) return undefined;

      if (categoricalMode && valuesAreSpecified) {
        if (isEqual(vizConfig.numeratorValues, vizConfig.denominatorValues))
          throw new Error(
            'Numerator and denominator value(s) cannot be the same. Numerator values must be a subset of the denominator values.'
          );
        if (
          vizConfig.numeratorValues != null &&
          !vizConfig.numeratorValues.every((value) =>
            vizConfig.denominatorValues?.includes(value)
          )
        )
          throw new Error(
            'To calculate a proportion, all selected numerator values must also be present in the denominator'
          );
      }

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      if (
        !categoricalMode &&
        !(
          dependentValueType === 'number' ||
          dependentValueType === 'integer' ||
          dependentValueType === 'date'
        )
      )
        throw new Error(
          "TEMPORARY ERROR... this variable isn't suitable (perhaps no distinct values) and constraints will handle this soon..."
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig,
        xAxisVariable,
        yAxisVariable,
        outputEntity
      );

      const response = await dataClient.getLineplot(
        computation.descriptor.type,
        params
      );

      const showMissingOverlay =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          overlayEntity,
          overlayVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );
      const showMissingFacet =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          facetEntity,
          facetVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );

      const xAxisVocabulary = fixLabelsForNumberVariables(
        xAxisVariable?.vocabulary,
        xAxisVariable
      );
      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );

      return lineplotResponseToData(
        response,
        categoricalMode,
        visualization.descriptor.type,
        independentValueType,
        dependentValueType,
        showMissingOverlay,
        xAxisVocabulary,
        overlayVocabulary,
        overlayVariable,
        showMissingFacet,
        facetVocabulary,
        facetVariable
      );
    }, [
      studyId,
      filters,
      dataClient,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      facetVariable,
      // simply using vizConfig causes issue with onCheckedLegendItemsChange
      // it is because vizConfig also contains vizConfig.checkedLegendItems
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.valueSpecConfig,
      vizConfig.showMissingness,
      vizConfig.useBinning,
      vizConfig.showErrorBars,
      vizConfig.numeratorValues,
      vizConfig.denominatorValues,
      computation.descriptor.type,
      visualization.descriptor.type,
      outputEntity,
      filteredCounts,
      categoricalMode,
      vizConfig.independentAxisRange,
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
    // extend range due to potential binStart/Ends being outside provided range
    const extendedIndependentRange =
      data.value?.xMin != null &&
      data.value?.xMax != null &&
      defaultIndependentRange != null
        ? ({
            min:
              data.value.xMin < defaultIndependentRange.min
                ? data.value.xMin
                : defaultIndependentRange.min,
            max:
              data.value.xMax > defaultIndependentRange.max
                ? data.value.xMax
                : defaultIndependentRange.max,
          } as NumberOrDateRange)
        : defaultIndependentRange;
    return axisRangeMargin(extendedIndependentRange, xAxisVariable?.type);
  }, [xAxisVariable, data.value]);

  // find deependent axis range and its margin
  const defaultDependentRangeMargin = useMemo(() => {
    //K set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value?.yMin != null && data.value?.yMax != null
        ? ({ min: data.value.yMin, max: data.value.yMax } as NumberOrDateRange)
        : undefined;

    /**
     * Temporarily, two methods, Method 1 & 2, are implemented in the following
     * Simply commenting out each of them would work as designed
     * Currently, Method 1 is used: thus Method 2 is commented out
     */
    // Method 1: considering variable's metadata as well
    const defaultDependentRange = categoricalMode
      ? ({
          // this is where the proportion y-axis starts at zero
          min:
            yMinMaxRange?.min != null
              ? Math.min(0, yMinMaxRange.min as number)
              : undefined,
          max: yMinMaxRange?.max,
        } as NumberOrDateRange)
      : // add conditions to prevent previous yMinMaxRange from calling the function, e.g., date to categorical
      ((yAxisVariable?.type === 'number' ||
          yAxisVariable?.type === 'integer') &&
          typeof yMinMaxRange?.min === 'number' &&
          typeof yMinMaxRange?.max === 'number') ||
        (yAxisVariable?.type === 'date' &&
          typeof yMinMaxRange?.min === 'string' &&
          typeof yMinMaxRange?.max === 'string')
      ? numberDateDefaultDependentAxisRange(
          yAxisVariable,
          'lineplot',
          yMinMaxRange
        )
      : undefined;
    // add conditions to prevent previous defaultDependentRange from calling the function due to categorical
    return yAxisVariable?.type === 'number' ||
      yAxisVariable?.type === 'integer' ||
      yAxisVariable?.type === 'date' ||
      (yAxisVariable?.type === 'string' &&
        categoricalMode &&
        typeof defaultDependentRange?.min === 'number' &&
        typeof defaultDependentRange?.max === 'number')
      ? axisRangeMargin(defaultDependentRange, yAxisVariable?.type)
      : undefined;

    // // Method 2: purely data-based min/max (yMinMaxRange only): this will reduce empty ranges
    // return ((yAxisVariable?.type === 'number' || yAxisVariable?.type === 'integer' || (yAxisVariable?.type === 'string' && categoricalMode)) && typeof yMinMaxRange?.min === 'number' && typeof yMinMaxRange?.max === 'number') ||
    //   (yAxisVariable?.type === 'date' && typeof yMinMaxRange?.min === 'string' && typeof yMinMaxRange?.max === 'string')
    //   ? axisRangeMargin(yMinMaxRange, yAxisVariable?.type)
    //   : undefined;
  }, [data.value, yAxisVariable, categoricalMode]);

  // custom legend list
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const allData = data.value?.dataSetProcess;

    const legendData = !isFaceted(allData)
      ? allData?.series
      : allData?.facets.find(
          ({ data }) => data != null && data.series.length > 0
        )?.data?.series;

    return legendData != null
      ? // the name 'dataItem' is used inside the map() to distinguish from the global 'data' variable
        legendData.map((dataItem: LinePlotDataSeries, index: number) => {
          return {
            label: dataItem.name ?? '',
            // maing marker info appropriately
            marker: 'line',
            // set marker colors appropriately
            markerColor:
              dataItem?.name === 'No data'
                ? '#E8E8E8'
                : ColorPaletteDefault[index], // set first color for no overlay variable selected
            // simplifying the check with the presence of data: be carefule of y:[null] case in Scatter plot
            hasData: !isFaceted(allData)
              ? dataItem.y != null &&
                dataItem.y.length > 0 &&
                dataItem.y[0] !== null
                ? true
                : false
              : allData.facets
                  .map((facet) => facet.data)
                  .filter((data): data is LinePlotData => data != null)
                  .map(
                    (data) =>
                      data.series[index]?.y != null &&
                      data.series[index].y.length > 0 &&
                      data.series[index].y[0] !== null
                  )
                  .includes(true),
            group: 1,
            rank: 1,
          };
        })
      : [];
  }, [
    data,
    vizConfig.overlayVariable,
    vizConfig.showMissingness,
    vizConfig.valueSpecConfig,
  ]);

  // set checkedLegendItems: not working well with plot options
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.checkedLegendItems
  );

  // axis range control
  const defaultUIState = useMemo(() => {
    if (xAxisVariable != null)
      return {
        independentAxisRange: defaultIndependentRangeMargin,
      };
    else
      return {
        independentAxisRange: undefined,
      };
  }, [xAxisVariable, defaultIndependentRangeMargin]);

  const plotNode = (
    <LineplotWithControls
      // data.value
      data={data.value?.dataSetProcess}
      updateThumbnail={updateThumbnail}
      containerStyles={
        !isFaceted(data.value?.dataSetProcess) ? plotContainerStyles : undefined
      }
      spacingOptions={
        !isFaceted(data.value?.dataSetProcess) ? plotSpacingOptions : undefined
      }
      // title={'Line plot'}
      displayLegend={false}
      independentAxisLabel={variableDisplayWithUnit(xAxisVariable) ?? 'X-axis'}
      dependentAxisLabel={variableDisplayWithUnit(yAxisVariable) ?? 'Y-axis'}
      // set valueSpec as Raw when yAxisVariable = date
      onBinWidthChange={onBinWidthChange}
      vizType={visualization.descriptor.type}
      interactive={!isFaceted(data.value) ? true : false}
      showSpinner={filteredCounts.pending || data.pending}
      // axis range control: make default as number format
      independentValueType={
        DateVariable.is(xAxisVariable)
          ? 'date'
          : StringVariable.is(xAxisVariable)
          ? 'string'
          : 'number'
      }
      dependentValueType={DateVariable.is(yAxisVariable) ? 'date' : 'number'}
      legendTitle={variableDisplayWithUnit(overlayVariable)}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
      useBinning={vizConfig.useBinning}
      onUseBinningChange={onUseBinningChange}
      showErrorBars={vizConfig.showErrorBars ?? false}
      onShowErrorBarsChange={onShowErrorBarsChange}
      // axis range control
      vizConfig={vizConfig}
      updateVizConfig={updateVizConfig}
      defaultUIState={defaultUIState}
      defaultIndependentRange={defaultIndependentRangeMargin}
      // add dependent axis range for better displaying tick labels in log-scale
      defaultDependentAxisRange={defaultDependentRangeMargin}
      // pass useState of truncation warnings
      truncatedIndependentAxisWarning={truncatedIndependentAxisWarning}
      setTruncatedIndependentAxisWarning={setTruncatedIndependentAxisWarning}
      truncatedDependentAxisWarning={truncatedDependentAxisWarning}
      setTruncatedDependentAxisWarning={setTruncatedDependentAxisWarning}
    />
  );

  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      legendTitle={variableDisplayWithUnit(overlayVariable)}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
      // add a condition to show legend even for single overlay data
      showOverlayLegend={vizConfig.overlayVariable != null}
    />
  );

  const tableGroupNode = (
    <>
      <BirdsEyeView
        completeCasesAllVars={
          data.pending ? undefined : data.value?.completeCasesAllVars
        }
        completeCasesAxesVars={
          data.pending ? undefined : data.value?.completeCasesAxesVars
        }
        outputEntity={outputEntity}
        stratificationIsActive={overlayVariable != null}
        enableSpinner={
          xAxisVariable != null &&
          yAxisVariable != null &&
          !data.error &&
          (!categoricalMode || valuesAreSpecified)
        }
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={
          data.value && !data.pending ? data.value?.completeCases : undefined
        }
        filteredCounts={filteredCounts}
        outputEntityId={outputEntity?.id}
        variableSpecs={[
          {
            role: 'X-axis',
            required: true,
            display: variableDisplayWithUnit(xAxisVariable),
            variable: vizConfig.xAxisVariable,
          },
          {
            role: 'Y-axis',
            required: true,
            display: variableDisplayWithUnit(yAxisVariable),
            variable: vizConfig.yAxisVariable,
          },
          {
            role: 'Overlay',
            display: variableDisplayWithUnit(overlayVariable),
            variable: vizConfig.overlayVariable,
          },
          {
            role: 'Facet',
            display: variableDisplayWithUnit(facetVariable),
            variable: vizConfig.facetVariable,
          },
        ]}
      />
    </>
  );

  const classes = useInputStyles();

  const disabledValueSpecs =
    yAxisVariable == null
      ? []
      : categoricalMode
      ? ['Mean', 'Median']
      : ['Proportion'];

  const valuesOfInterestLabelStyle = {
    marginLeft: 'auto',
    paddingLeft: '0.5em',
  };

  const aggregationHelp = (
    <div>
      <p>
        “Mean” and “Median” are y-axis aggregation functions that can only be
        used when continuous variables{' '}
        <i className="fa fa-bar-chart-o  wdk-Icon"> </i> are selected for the
        y-axis.
      </p>
      <ul>
        <li>
          Mean = Sum of values for all data points / Number of all data points
        </li>
        <li>
          Median = The middle number in a sorted list of numbers. The median is
          a better measure of central tendency than the mean when data are not
          normally distributed.
        </li>
      </ul>
      <p>
        “Proportion” is the only y-axis aggregation function that can be used
        when categorical variables <i className="fa fa-list  wdk-Icon"> </i> are
        selected for the y-axis.
      </p>
      <ul>
        <li>Proportion = Numerator count / Denominator count</li>
      </ul>
      <p>
        The variable's values that count towards numerator and denominator must
        be selected in the “Proportion specification” drop-downs.
      </p>
    </div>
  );

  const proportionInputs = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <RadioButtonGroup
        options={keys(valueSpecLookup)}
        selectedOption={vizConfig.valueSpecConfig}
        onOptionSelected={onValueSpecChange}
        disabledList={disabledValueSpecs}
        orientation={'horizontal'}
        labelPlacement={'end'}
        buttonColor={'primary'}
        itemMarginRight={20}
      />

      {vizConfig.valueSpecConfig === 'Proportion' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, auto)',
            gridTemplateRows: 'repeat(3, auto)',
          }}
        >
          <div className={classes.label} style={{ gridColumn: 1, gridRow: 2 }}>
            Proportion&nbsp;=
          </div>
          <div
            className={classes.input}
            style={{ gridColumn: 2, gridRow: 1, marginBottom: 0 }}
          >
            <ValuePicker
              allowedValues={yAxisVariable?.vocabulary}
              selectedValues={vizConfig.numeratorValues}
              onSelectedValuesChange={onNumeratorValuesChange}
            />
            <div className={classes.label} style={valuesOfInterestLabelStyle}>
              (numerator)
            </div>
          </div>
          <div style={{ gridColumn: 2, gridRow: 2, marginRight: '2em' }}>
            <hr style={{ marginTop: '0.6em' }} />
          </div>
          <div className={classes.input} style={{ gridColumn: 2, gridRow: 3 }}>
            <ValuePicker
              allowedValues={yAxisVariable?.vocabulary}
              selectedValues={vizConfig.denominatorValues}
              onSelectedValuesChange={onDenominatorValuesChange}
            />
            <div className={classes.label} style={valuesOfInterestLabelStyle}>
              (denominator)
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'X-axis',
              role: 'axis',
            },
            {
              name: 'yAxisVariable',
              label: 'Y-axis',
              role: 'axis',
            },
            {
              name: 'overlayVariable',
              label: 'Overlay',
              role: 'stratification',
            },
            {
              name: 'facetVariable',
              label: 'Facet',
              role: 'stratification',
            },
          ]}
          customSections={[
            {
              title: (
                <>
                  Y-axis aggregation
                  <Tooltip content={aggregationHelp}>
                    <i
                      style={{ marginLeft: '5px' }}
                      className="fa fa-question-circle"
                      aria-hidden="true"
                    ></i>
                  </Tooltip>
                </>
              ),
              order: 75,
              content: proportionInputs,
            },
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
            yAxisVariable: vizConfig.yAxisVariable,
            overlayVariable: vizConfig.overlayVariable,
            facetVariable: vizConfig.facetVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={dataElementConstraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          enableShowMissingnessToggle={
            (overlayVariable != null || facetVariable != null) &&
            data.value?.completeCasesAllVars !==
              data.value?.completeCasesAxesVars
          }
          showMissingness={vizConfig.showMissingness}
          onShowMissingnessChange={onShowMissingnessChange}
          outputEntity={outputEntity}
        />
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <PlotLayout
        isFaceted={isFaceted(data.value?.dataSetProcess)}
        legendNode={legendNode}
        plotNode={plotNode}
        tableGroupNode={tableGroupNode}
      />
    </div>
  );
}

type LineplotWithControlsProps = Omit<LinePlotProps, 'data'> & {
  data?: LinePlotData | FacetedData<LinePlotData>;
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  updateThumbnail: (src: string) => void;
  vizType: string;
  // custom legend
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
  useBinning: boolean;
  onUseBinningChange: (newValue: boolean) => void;
  showErrorBars: boolean;
  onShowErrorBarsChange: (newValue: boolean) => void;
  // define types for axis range control
  vizConfig: LineplotConfig;
  updateVizConfig: (newConfig: Partial<LineplotConfig>) => void;
  defaultUIState: Partial<UIState>;
  defaultIndependentRange: NumberOrDateRange | undefined;
  defaultDependentAxisRange: NumberOrDateRange | undefined;
  // pass useState of truncation warnings
  truncatedIndependentAxisWarning: string;
  setTruncatedIndependentAxisWarning: (
    truncatedIndependentAxisWarning: string
  ) => void;
  truncatedDependentAxisWarning: string;
  setTruncatedDependentAxisWarning: (
    truncatedDependentAxisWarning: string
  ) => void;
};

function LineplotWithControls({
  data,
  // LinePlotControls: set initial value as 'raw' ('Raw')
  onBinWidthChange,
  vizType,
  updateThumbnail,
  // custom legend
  checkedLegendItems,
  onCheckedLegendItemsChange,
  useBinning,
  onUseBinningChange,
  showErrorBars,
  onShowErrorBarsChange,
  // for axis range control
  vizConfig,
  updateVizConfig,
  independentValueType,
  dependentValueType,
  defaultUIState,
  defaultIndependentRange,
  defaultDependentAxisRange,
  truncatedIndependentAxisWarning,
  setTruncatedIndependentAxisWarning,
  truncatedDependentAxisWarning,
  setTruncatedDependentAxisWarning,
  ...lineplotProps
}: LineplotWithControlsProps) {
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      checkedLegendItems,
      // considering axis range control too
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
    ]
  );

  const widgetHeight = '4em';

  // controls need the bin info from just one facet (not an empty one)
  const data0 = isFaceted(data)
    ? data.facets.find(({ data }) => data != null && data.series.length > 0)
        ?.data
    : data;

  const neverUseBinning = data0?.binWidthSlider == null; // for ordinal string x-variables
  // axis range control
  const neverShowErrorBars = dependentValueType === 'date';

  // axis range control
  const handleIndependentAxisRangeChange = useCallback(
    (newRange?: NumberOrDateRange) => {
      updateVizConfig({
        independentAxisRange:
          newRange &&
          ({
            min:
              typeof newRange.min === 'string'
                ? padISODateTime(newRange.min)
                : newRange.min,
            max:
              typeof newRange.max === 'string'
                ? padISODateTime(newRange.max)
                : newRange.max,
          } as NumberOrDateRange),
      });
    },
    [updateVizConfig]
  );

  const handleIndependentAxisSettingsReset = useCallback(() => {
    updateVizConfig({
      independentAxisRange: undefined,
    });
    // add reset for truncation message: including dependent axis warning as well
    setTruncatedIndependentAxisWarning('');
  }, [defaultUIState.independentAxisRange, updateVizConfig]);

  const handleDependentAxisRangeChange = useCallback(
    (newRange?: NumberOrDateRange) => {
      updateVizConfig({
        dependentAxisRange:
          newRange &&
          ({
            min:
              typeof newRange.min === 'string'
                ? padISODateTime(newRange.min)
                : newRange.min,
            max:
              typeof newRange.max === 'string'
                ? padISODateTime(newRange.max)
                : newRange.max,
          } as NumberOrDateRange),
      });
    },
    [updateVizConfig]
  );

  const handleDependentAxisSettingsReset = useCallback(() => {
    updateVizConfig({
      dependentAxisRange: undefined,
    });
    // add reset for truncation message as well
    setTruncatedDependentAxisWarning('');
  }, [updateVizConfig]);

  // set truncation flags: will see if this is reusable with other application
  const {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  } = useMemo(
    () =>
      truncationConfig(defaultUIState, vizConfig, defaultDependentAxisRange),
    [
      defaultUIState.independentAxisRange,
      vizConfig.xAxisVariable,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      defaultDependentAxisRange,
    ]
  );

  // set useEffect for changing truncation warning message
  useEffect(() => {
    if (
      truncationConfigIndependentAxisMin ||
      truncationConfigIndependentAxisMax
    ) {
      setTruncatedIndependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the yellow shading'
      );
    }
  }, [truncationConfigIndependentAxisMin, truncationConfigIndependentAxisMax]);

  useEffect(() => {
    if (
      // (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) &&
      // !scatterplotProps.showSpinner
      truncationConfigDependentAxisMin ||
      truncationConfigDependentAxisMax
    ) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the yellow shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  // send histogramProps with additional props
  const lineplotPlotProps = {
    ...lineplotProps,
    // axis range control
    independentAxisRange:
      vizConfig.independentAxisRange ?? defaultIndependentRange,
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
    // pass valueTypes
    independentValueType: independentValueType,
    dependentValueType: dependentValueType,
    // pass axisTruncationConfig
    axisTruncationConfig: {
      independentAxis: {
        min: truncationConfigIndependentAxisMin,
        max: truncationConfigIndependentAxisMax,
      },
      dependentAxis: {
        min: truncationConfigDependentAxisMin,
        max: truncationConfigDependentAxisMax,
      },
    },
  };

  return (
    <>
      {isFaceted(data) ? (
        <FacetedLinePlot
          data={data}
          // considering axis range control
          componentProps={lineplotPlotProps}
          modalComponentProps={{
            independentAxisLabel: lineplotProps.independentAxisLabel,
            dependentAxisLabel: lineplotProps.dependentAxisLabel,
            displayLegend: lineplotProps.displayLegend,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <LinePlot
          {...lineplotProps}
          ref={plotRef}
          data={data}
          // add controls
          displayLibraryControls={false}
          // custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
          // pass axis range control
          independentAxisRange={
            vizConfig.independentAxisRange ?? defaultIndependentRange
          }
          dependentAxisRange={
            vizConfig.dependentAxisRange ?? defaultDependentAxisRange
          }
          // pass valueTypes
          independentValueType={independentValueType}
          dependentValueType={dependentValueType}
          // pass axisTruncationConfig
          axisTruncationConfig={{
            independentAxis: {
              min: truncationConfigIndependentAxisMin,
              max: truncationConfigIndependentAxisMax,
            },
            dependentAxis: {
              min: truncationConfigDependentAxisMin,
              max: truncationConfigDependentAxisMax,
            },
          }}
        />
      )}

      {/* add axis range control */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup
          label="Y-axis"
          containerStyles={{
            marginRight: '0.5625em',
          }}
        >
          <Switch
            label="Show error bars (95% C.I.)"
            state={showErrorBars}
            onStateChange={onShowErrorBarsChange}
            disabled={neverShowErrorBars}
          />
          {/* Y-axis range control */}
          {/* make some space to match with X-axis range control */}
          <div style={{ height: '4em' }} />
          <AxisRangeControl
            label="Range"
            range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
            valueType={dependentValueType === 'date' ? 'date' : 'number'}
            onRangeChange={(newRange?: NumberOrDateRange) => {
              handleDependentAxisRangeChange(newRange);
            }}
            // set maxWidth
            containerStyles={{ maxWidth: '350px' }}
          />
          {/* truncation notification */}
          {truncatedDependentAxisWarning ? (
            <Notification
              title={''}
              text={truncatedDependentAxisWarning}
              // this was defined as LIGHT_BLUE
              color={'#5586BE'}
              onAcknowledgement={() => {
                setTruncatedDependentAxisWarning('');
              }}
              showWarningIcon={true}
              // change maxWidth
              containerStyles={{ maxWidth: '350px' }}
            />
          ) : null}
          <Button
            type={'outlined'}
            // change text
            text={'Reset to defaults'}
            onClick={handleDependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '50%',
              float: 'right',
              // to match reset button with date range form
              marginRight: dependentValueType === 'date' ? '-1em' : '',
            }}
          />
        </LabelledGroup>
        <LabelledGroup
          label="X-axis"
          containerStyles={{
            marginRight: '0em',
          }}
        >
          <Switch
            label={`Binning ${useBinning ? 'on' : 'off'}`}
            state={useBinning}
            onStateChange={onUseBinningChange}
            disabled={neverUseBinning}
          />
          <BinWidthControl
            binWidth={data0?.binWidthSlider?.binWidth}
            onBinWidthChange={onBinWidthChange}
            binWidthRange={data0?.binWidthSlider?.binWidthRange}
            binWidthStep={data0?.binWidthSlider?.binWidthStep}
            valueType={data0?.binWidthSlider?.valueType}
            binUnit={
              data0?.binWidthSlider?.valueType === 'date'
                ? (data0?.binWidthSlider?.binWidth as TimeDelta).unit
                : undefined
            }
            binUnitOptions={
              data0?.binWidthSlider?.valueType === 'date'
                ? ['day', 'week', 'month', 'year']
                : undefined
            }
            containerStyles={{
              minHeight: widgetHeight,
              // considering axis range control
              maxWidth: independentValueType === 'date' ? '250px' : '350px',
            }}
            disabled={!useBinning}
          />
          {/* X-Axis range control */}
          {/* designed to disable X-axis range control for categorical X */}
          <AxisRangeControl
            // change label for disabled case
            label={
              independentValueType === 'string'
                ? 'Range (not available)'
                : 'Range'
            }
            range={vizConfig.independentAxisRange ?? defaultIndependentRange}
            onRangeChange={handleIndependentAxisRangeChange}
            // will disable for categorical X so this is sufficient
            valueType={independentValueType === 'date' ? 'date' : 'number'}
            // set maxWidth
            containerStyles={{ maxWidth: '350px' }}
            // input forms are diabled for categorical X
            disabled={independentValueType === 'string'}
          />
          {/* truncation notification */}
          {truncatedIndependentAxisWarning ? (
            <Notification
              title={''}
              text={truncatedIndependentAxisWarning}
              // this was defined as LIGHT_BLUE
              color={'#5586BE'}
              onAcknowledgement={() => {
                setTruncatedIndependentAxisWarning('');
              }}
              showWarningIcon={true}
              // set maxWidth per type
              containerStyles={{
                maxWidth: independentValueType === 'date' ? '350px' : '350px',
              }}
            />
          ) : null}
          <Button
            type={'outlined'}
            text={'Reset to defaults'}
            onClick={handleIndependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '50%',
              float: 'right',
              // to match reset button with date range form
              marginRight: independentValueType === 'date' ? '-1em' : '',
            }}
            // reset button is diabled for categorical X
            disabled={independentValueType === 'string'}
          />
        </LabelledGroup>
      </div>
    </>
  );
}

/**
 * Reformat response from Line Plot endpoints into complete LinePlotData
 * @param response
 * @returns LinePlotData
 */
export function lineplotResponseToData(
  response: LinePlotDataResponse,
  categoricalMode: boolean,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string,
  independentValueType: string,
  dependentValueType: string,
  showMissingOverlay: boolean = false,
  xAxisVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable
): LinePlotDataWithCoverage {
  const modeValue: LinePlotDataSeries['mode'] = 'lines+markers';

  const hasMissingData =
    response.lineplot.config.completeCasesAllVars !==
    response.lineplot.config.completeCasesAxesVars;

  const facetGroupedResponseData = groupBy(response.lineplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const { dataSetProcess, yMin, yMax, xMin, xMax } = processInputData(
      reorderResponseLineplotData(
        // reorder by overlay var within each facet
        group,
        categoricalMode,
        xAxisVocabulary,
        vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
        overlayVariable
      ),
      categoricalMode,
      vizType,
      modeValue,
      independentValueType,
      dependentValueType,
      showMissingOverlay,
      hasMissingData,
      response.lineplot.config.binSpec,
      response.lineplot.config.binSlider,
      overlayVariable
    );

    return {
      dataSetProcess: dataSetProcess,
      yMin,
      yMax,
      xMin,
      xMax,
    };
  });

  const xMin = min(map(processedData, ({ xMin }) => xMin));
  const xMax = max(map(processedData, ({ xMax }) => xMax));
  const yMin = min(map(processedData, ({ yMin }) => yMin));
  const yMax = max(map(processedData, ({ yMax }) => yMax));

  const dataSetProcess =
    size(processedData) === 1 && head(keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        head(values(processedData))?.dataSetProcess
      : // faceted
        {
          facets: vocabularyWithMissingData(
            facetVocabulary,
            showMissingFacet
          ).map((facetValue) => ({
            label: facetValue,
            data: processedData[facetValue]?.dataSetProcess ?? undefined,
          })),
        };
  return {
    dataSetProcess,
    // calculated y axis limits
    xMin,
    xMax,
    yMin,
    yMax,
    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.lineplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.lineplot.config.completeCasesAxesVars,
  } as LinePlotDataWithCoverage;
}

type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
};
type ArrayTypes = PickByType<
  LinePlotDataSeries,
  string[] | (number | null | string)[]
>;

/**
 * Where there are nulls in the 'y' array, duplicate them and put a zero in between.
 * This is a way to get Plotly to plot an unconnected point at zero (nulls in y break the line).
 * All the duplications have to apply to ALL arrays in the dataSetProcess object, so we jump
 * through some hoops to iterate over these other arrays rather than name them explicitly.
 *
 * simple example:
 * input:  { x: [1,2,3,4,5], y: [6,1,null,9,11], foo: ['a','b','c','d','e'] }
 * output: { x: [1,2,3,3,3,4,5], y: [ 6,1,null,0,null,9,11, foo: ['a','b','c','c','c','d','e'] ] }
 */
function nullZeroHack(
  dataSetProcess: LinePlotDataSeries[],
  dependentValueType: string
): LinePlotDataSeries[] {
  // make no attempt to process date values
  if (dependentValueType === 'date') return dataSetProcess;

  return dataSetProcess.map((series) => {
    // which are the arrays in the series object?
    // (assumption: the lengths of all arrays are all the same)
    const arrayKeys = Object.keys(series)
      .filter((_): _ is keyof LinePlotDataSeries => true)
      .filter((key): key is keyof ArrayTypes => Array.isArray(series[key]));

    const otherArrayKeys = arrayKeys.filter((key) => key !== 'y');

    // coersce type of y knowing that we're not dealing with dates (as string[])
    const y = series.y as (number | null)[];

    return {
      ...series,
      // What does the reduce do?
      // It goes through the series.y array makes a copy of it into the output (accum.y)
      // However, when a null value is encountered, three values go into the output: null, 0 null.
      // It also copies all the other arrays present in `series`, adding three identical values where
      // the y array had a null value.
      //
      // The final value of accum has x, y, binLabel, yErrorBarUpper etc, and this is
      // spread back into he return value for the map.
      //
      ...y.reduce((accum, current, index) => {
        if (accum.y == null) accum.y = [];

        const newY = accum.y as (number | null)[];

        if (current == null) {
          newY.push(null);
          newY.push(0);
          newY.push(null);
        } else {
          newY.push(current);
        }

        otherArrayKeys.forEach(
          // e.g. x, binLabel etc
          (key) => {
            // initialize empty array if needed
            if (accum[key] == null) accum[key] = [];
            // get the value of, e.g. x[i]
            const value = series[key]![index];
            // figure out if we're going to push one or three identical values
            const oneOrThree = current == null ? 3 : 1;
            // and do it
            [...Array(oneOrThree)].forEach(() =>
              (accum[key] as (number | null | string)[]).push(value)
            );
          }
        );

        return accum;
      }, {} as Partial<LinePlotDataSeries>),
    };
  });
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: LineplotConfig,
  xAxisVariableMetadata: Variable,
  yAxisVariableMetadata: Variable,
  outputEntity: StudyEntity
): LineplotRequestParams {
  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    facetVariable,
    valueSpecConfig,
    showMissingness,
    binWidth = NumberVariable.is(xAxisVariableMetadata) ||
    DateVariable.is(xAxisVariableMetadata)
      ? xAxisVariableMetadata.binWidthOverride ?? xAxisVariableMetadata.binWidth
      : undefined,
    binWidthTimeUnit = xAxisVariableMetadata?.type === 'date'
      ? xAxisVariableMetadata.binUnits
      : undefined,
    useBinning,
    numeratorValues,
    denominatorValues,
  } = vizConfig;

  const binSpec: Pick<LineplotRequestParams['config'], 'binSpec'> = binWidth
    ? {
        binSpec: {
          type: 'binWidth',
          ...(useBinning
            ? {
                value: binWidth,
                ...(xAxisVariableMetadata?.type === 'date'
                  ? { units: binWidthTimeUnit }
                  : {}),
              } // not binning
            : xAxisVariableMetadata?.type === 'date'
            ? { value: 1, units: 'day' }
            : { value: 0 }),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  const valueSpec = valueSpecLookup[valueSpecConfig];

  // define viewport based on independent axis range: need to check undefined case
  const viewport =
    vizConfig?.independentAxisRange?.min != null &&
    vizConfig?.independentAxisRange?.max != null
      ? {
          xMin: String(vizConfig?.independentAxisRange?.min),
          xMax: String(vizConfig?.independentAxisRange?.max),
        }
      : undefined;

  return {
    studyId,
    filters,
    config: {
      outputEntityId: outputEntity?.id,
      valueSpec,
      xAxisVariable: xAxisVariable!, // these will never be undefined because
      yAxisVariable: yAxisVariable!, // data requests are only made when they have been chosen by user
      ...binSpec,
      overlayVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      showMissingness: showMissingness ? 'TRUE' : 'FALSE',
      // no error bars for date variables (error bar toggle switch is also disabled)
      errorBars:
        vizConfig.showErrorBars && yAxisVariableMetadata.type !== 'date'
          ? 'TRUE'
          : 'FALSE',
      ...(valueSpec === 'proportion'
        ? {
            yAxisNumeratorValues: numeratorValues,
            yAxisDenominatorValues: denominatorValues,
          }
        : {}),
      viewport,
    },
  };
}

// making plotly input data
function processInputData(
  responseLineplotData: LineplotResponse['lineplot']['data'],
  categoricalMode: boolean,
  vizType: string,
  // line, marker,
  modeValue: LinePlotDataSeries['mode'],
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  binSpec?: BinSpec,
  binWidthSlider?: BinWidthSlider,
  overlayVariable?: Variable
) {
  // set fillAreaValue for densityplot
  const fillAreaValue: LinePlotDataSeries['fill'] =
    vizType === 'densityplot' ? 'toself' : undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    responseLineplotData.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] },
    };
  }

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number) => {
    if (showMissingness && index === responseLineplotData.length - 1) {
      return gray;
    } else {
      return ColorPaletteDefault[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness &&
      !hasMissingData &&
      index === responseLineplotData.length - 2
    );
  };

  const markerSymbol = (index: number): string =>
    showMissingness && index === responseLineplotData.length - 1
      ? 'x'
      : 'circle';

  const binWidthSliderData =
    binSpec != null && binWidthSlider != null
      ? {
          binWidthSlider: {
            valueType:
              independentValueType === 'integer' ||
              independentValueType === 'number'
                ? 'number'
                : 'date',
            binWidth:
              independentValueType === 'number' ||
              independentValueType === 'integer'
                ? binSpec.value || 1
                : {
                    value: binSpec.value || 1,
                    unit: binSpec.units || 'month',
                  },
            binWidthRange: (independentValueType === 'number' ||
            independentValueType === 'integer'
              ? { min: binWidthSlider.min, max: binWidthSlider.max }
              : {
                  min: binWidthSlider.min,
                  max:
                    // back end seems to fall over with any values >99 but 60 is used in subsetting
                    binWidthSlider?.max != null && binWidthSlider?.max > 60
                      ? 60
                      : binWidthSlider.max,
                  unit: binSpec.units,
                }) as NumberOrTimeDeltaRange,
            binWidthStep: binWidthSlider.step || 0.1,
          },
        }
      : {};

  let dataSetProcess: LinePlotDataSeries[] = [];
  responseLineplotData.some(function (el, index) {
    if (el.seriesX && el.seriesY) {
      if (el.seriesX.length !== el.seriesY.length) {
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      // use seriesX when binning is off or binStart when binned, and decode numbers where necessary
      const xData =
        binSpec == null || binSpec.value === 0 ? el.seriesX : el.binStart;

      if (xData == null)
        throw new Error('response did not contain binStart data');
      const seriesX =
        independentValueType === 'number' || independentValueType === 'integer'
          ? xData.map(Number)
          : xData;

      // decode numbers in y axis where necessary
      const seriesY =
        dependentValueType === 'number' ||
        dependentValueType === 'integer' ||
        categoricalMode
          ? el.seriesY.map((val) => (val == null ? null : Number(val)))
          : (el.seriesY as string[]);

      dataSetProcess.push({
        x: seriesX.length ? seriesX : (([null] as unknown) as number[]), // [null] hack required to make sure
        y: seriesY.length ? seriesY : (([null] as unknown) as number[]), // Plotly has a legend entry for empty traces
        ...(binSpec?.value ? { binLabel: el.seriesX } : {}),
        ...(el.errorBars != null
          ? {
              // TEMPORARY fix for empty arrays coming from back end
              yErrorBarUpper: el.errorBars.map((eb) =>
                Array.isArray(eb.upperBound) ? null : eb.upperBound
              ),
              yErrorBarLower: el.errorBars.map((eb) =>
                Array.isArray(eb.lowerBound) ? null : eb.lowerBound
              ),
            }
          : {}),
        ...(el.binSampleSize != null
          ? {
              extraTooltipText: categoricalMode
                ? el.binSampleSize.map(
                    (bss) =>
                      `n: ${(bss as { numeratorN: number }).numeratorN}/${
                        (bss as { denominatorN: number }).denominatorN
                      }`
                  )
                : el.binSampleSize.map(
                    (bss) => `n: ${(bss as { N: number }).N}`
                  ),
            }
          : {}),
        name:
          el.overlayVariableDetails?.value != null
            ? fixLabelForNumberVariables(
                el.overlayVariableDetails.value,
                overlayVariable
              )
            : 'Data',
        mode: modeValue,
        fill: fillAreaValue,
        opacity: 0.7,
        marker: {
          color: markerColor(index),
          symbol: markerSymbol(index),
        },
        // this needs to be here for the case of markers with line or lineplot.
        line: { color: markerColor(index), shape: 'linear' },
      });

      return breakAfterThisSeries(index);
    }
    return false;
  });

  const xValues = dataSetProcess.flatMap<string | number | null>(
    (series) => series.x
  );
  // get all values of y (including error bars if present) in a kind of clunky way...
  const yValues = dataSetProcess
    .flatMap<string | number | null>((series) => series.y)
    .concat(
      dataSetProcess
        .flatMap((series) => series.yErrorBarLower ?? [])
        .filter((val): val is number | string => val != null)
    )
    .concat(
      dataSetProcess
        .flatMap((series) => series.yErrorBarUpper ?? [])
        .filter((val): val is number | string => val != null)
    );

  return {
    dataSetProcess: {
      series: nullZeroHack(dataSetProcess, dependentValueType),
      ...binWidthSliderData,
    },
    xMin: min(xValues),
    xMax: max(xValues),
    yMin: min(yValues),
    yMax: max(yValues),
  };
}

/*
 * Utility functions for processInputData()
 */

function reorderResponseLineplotData(
  data: LinePlotDataResponse['lineplot']['data'],
  categoricalMode: boolean,
  xAxisVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable
) {
  const xAxisOrderedSeries = data.map((series) => {
    if (xAxisVocabulary.length > 0) {
      // for each label in the vocabulary's correct order,
      // find the index of that label in the provided series' label array
      const labelIndices = xAxisVocabulary.map((label) =>
        series.seriesX.indexOf(label)
      );
      // now return the data from the other array(s) in the same order
      // any missing labels will be mapped to `undefined` (indexing an array with -1)
      // note that series.binStart and series.binEnd are not present when there is an xAxisVocabulary
      // because no binning can be done on these variables
      return {
        ...series,
        seriesX: labelIndices.map(
          (i, j) => series.seriesX[i] ?? xAxisVocabulary[j]
        ),
        seriesY: labelIndices.map((i) => series.seriesY[i]),
        ...(series.errorBars != null
          ? {
              errorBars: labelIndices.map((i) =>
                series.errorBars && series.errorBars[i]
                  ? series.errorBars[i]
                  : { lowerBound: null, upperBound: null, error: 'no data' }
              ),
            }
          : {}),
        ...(series.binSampleSize != null
          ? {
              // it won't ever be a mixed array but TS doesn't know this
              binSampleSize: labelIndices.map((i) =>
                series.binSampleSize && series.binSampleSize[i]
                  ? series.binSampleSize[i]
                  : categoricalMode
                  ? { numeratorN: 0, denominatorN: 0 }
                  : { N: 0 }
              ) as LinePlotDataResponse['lineplot']['data'][number]['binSampleSize'],
            }
          : {}),
      };
    } else {
      return series;
    }
  });

  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = xAxisOrderedSeries
      .map((series) => series.overlayVariableDetails?.value)
      .filter((value) => value != null)
      .map((value) => fixLabelForNumberVariables(value!, overlayVariable));
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return overlayIndices.map(
      (i, j) =>
        xAxisOrderedSeries[i] ?? {
          // if there is no series, insert a dummy series
          overlayVariableDetails: {
            value: overlayVocabulary[j],
          },
          seriesX: [],
          seriesY: [],
        }
    );
  } else {
    return xAxisOrderedSeries;
  }
}

/**
 * TEMPORARY function to determine if we are dealing with a categorical variable
 */
function isSuitableCategoricalVariable(variable?: Variable): boolean {
  return (
    variable?.vocabulary != null &&
    variable?.distinctValuesCount != null &&
    variable?.distinctValuesCount > 1
  );
}
