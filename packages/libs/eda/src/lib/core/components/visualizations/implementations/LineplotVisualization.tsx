// load plot component
import LinePlot, {
  LinePlotProps,
} from '@veupathdb/components/lib/plots/LinePlot';

import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

import DataClient, {
  LineplotRequestParams,
  LineplotResponse,
} from '../../../api/DataClient';

import { usePromise, PromiseHookState } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useStudyMetadata,
  useFindEntityAndVariable,
  useStudyEntities,
} from '../../../hooks/workspace';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';
import { Filter } from '../../../types/filter';

import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import {
  InputSpec,
  InputVariables,
  requiredInputLabelStyle,
} from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps } from '../VisualizationTypes';

import { Toggle } from '@veupathdb/coreui';
import LineSVG from './selectorIcons/LineSVG';

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
  omit,
} from 'lodash';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  NumberOrDateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
  NumberRange,
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
  assertValidInputVariables,
  substituteUnselectedToken,
} from '../../../utils/visualization';
import { gray } from '../colors';
import {
  AvailableUnitsAddon,
  ColorPaletteDefault,
  SequentialGradientColorscale,
} from '@veupathdb/components/lib/types/plots/addOns';
// import variable's metadata-based independent axis range utils
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PluginError from '../PluginError';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { isFaceted, isTimeDelta } from '@veupathdb/components/lib/types/guards';
import FacetedLinePlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedLinePlot';
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';
import { BinSpec, BinWidthSlider, TimeUnit } from '../../../types/general';
import {
  useNeutralPaletteProps,
  useVizConfig,
} from '../../../hooks/visualizations';
import { useInputStyles } from '../inputStyles';
import { ValuePicker } from './ValuePicker';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';

// concerning axis range control
import { NumberOrDateRange as NumberOrDateRangeT } from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';

import SingleSelect from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { LayoutOptions } from '../../layouts/types';
import {
  OverlayOptions,
  RequestOptionProps,
  RequestOptions,
} from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { FloatingLineplotExtraProps } from '../../../../map/analysis/hooks/plugins/lineplot';

import * as DateMath from 'date-arithmetic';
import {
  invalidProportionText,
  validateProportionValues,
} from '../../../../map/analysis/utils/defaultOverlayConfig';

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

type LinePlotDataSeriesWithType = LinePlotDataSeries & {
  seriesType?: 'standard' | 'zeroOverZero';
  hideFromLegend?: boolean;
  // add props for marginal historgram
  width?: number[];
  type?: string;
  offset?: number;
  xaxis?: string;
  yaxis?: string;
};

type LinePlotDataWithType = Omit<LinePlotData, 'series'> & {
  series: LinePlotDataSeriesWithType[];
} & AvailableUnitsAddon;
// Not ideal to add AvailableUnitsAddon again above, despite the fact that it's
// present in LinePlotData, however we get a type error if it's not there

// define LinePlotDataWithCoverage
interface LinePlotDataWithCoverage extends CoverageStatistics {
  dataSetProcess: LinePlotDataWithType | FacetedData<LinePlotDataWithType>;
  // change these types to be compatible with new axis range
  xMin: number | string | undefined;
  xMinPos: number | string | undefined;
  xMax: number | string | undefined;
  yMin: number | string | undefined;
  yMinPos: number | string | undefined;
  yMax: number | string | undefined;
}

// define LinePlotDataResponse
type LinePlotDataResponse = LineplotResponse;

export const lineplotVisualization = createVisualizationPlugin({
  selectorIcon: LineSVG,
  fullscreenComponent: LineplotViz,
  createDefaultConfig: createDefaultConfig,
});

// Display names to internal names
const valueSpecLookup: Record<
  string,
  LineplotRequestParams['config']['valueSpec']
> = {
  'Arithmetic mean': 'mean',
  Median: 'median',
  'Geometric mean': 'geometricMean',
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
    valueSpecConfig: 'Arithmetic mean',
    useBinning: false,
    showErrorBars: true,
    independentAxisLogScale: false,
    dependentAxisLogScale: false,
    independentAxisValueSpec: 'Full',
    dependentAxisValueSpec: 'Full',
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
    showErrorBars: t.boolean, // now has a default value, could move out of partial/optionals but this will break old saved visualizations
    numeratorValues: t.array(t.string),
    denominatorValues: t.array(t.string),
    // axis range control
    independentAxisRange: NumberOrDateRangeT,
    dependentAxisRange: NumberOrDateRangeT,
    independentAxisLogScale: t.boolean,
    dependentAxisLogScale: t.boolean,
    independentAxisValueSpec: t.string,
    dependentAxisValueSpec: t.string,
  }),
]);

interface Options
  extends LayoutOptions,
    OverlayOptions,
    RequestOptions<
      LineplotConfig,
      FloatingLineplotExtraProps,
      LineplotRequestParams
    > {}

function LineplotViz(props: VisualizationProps<Options>) {
  const {
    options,
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
    hideInputsAndControls,
    plotContainerStyleOverrides,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities(filters);
  const dataClient: DataClient = useDataClient();
  const finalPlotContainerStyles = useMemo(
    () => ({
      ...plotContainerStyles,
      ...plotContainerStyleOverrides,
    }),
    [plotContainerStyleOverrides]
  );

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    LineplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const providedOverlayVariableDescriptor = useMemo(
    () => options?.getOverlayVariable?.(computation.descriptor.configuration),
    [options, computation.descriptor.configuration]
  );

  const selectedVariables = useDeepValue({
    xAxisVariable: vizConfig.xAxisVariable,
    yAxisVariable: vizConfig.yAxisVariable,
    overlayVariable:
      vizConfig.overlayVariable &&
      (providedOverlayVariableDescriptor ?? vizConfig.overlayVariable),
    facetVariable: vizConfig.facetVariable,
  });

  const neutralPaletteProps = useNeutralPaletteProps(
    vizConfig.overlayVariable,
    providedOverlayVariableDescriptor
  );

  const colorPaletteOverride =
    neutralPaletteProps.colorPalette ??
    options?.getOverlayType?.() === 'continuous'
      ? SequentialGradientColorscale
      : undefined;

  const findEntityAndVariable = useFindEntityAndVariable(filters);

  const {
    xAxisVariable,
    yAxisVariable,
    overlayVariable,
    providedOverlayVariable,
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
    const { variable: providedOverlayVariable } =
      findEntityAndVariable(providedOverlayVariableDescriptor) ?? {};
    const { variable: facetVariable, entity: facetEntity } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      providedOverlayVariable,
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
    providedOverlayVariableDescriptor,
  ]);

  const categoricalMode = isSuitableCategoricalVariable(yAxisVariable);
  const valuesAreSpecified =
    vizConfig.numeratorValues != null &&
    vizConfig.numeratorValues.length > 0 &&
    vizConfig.denominatorValues != null &&
    vizConfig.denominatorValues.length > 0;

  // axis range control: set the state of truncation warning message
  const [truncatedIndependentAxisWarning, setTruncatedIndependentAxisWarning] =
    useState<string>('');
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

  // for checking if this is lineplot or timeline plot
  const showMarginalHistogram = options?.showMarginalHistogram ?? false;

  // always enable useBinning for timeline Viz
  const alwaysEnableUseBinning =
    showMarginalHistogram && xAxisVariable?.dataShape === 'continuous';

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const keepIndependentAxisSettings = isEqual(
        selectedVariables.xAxisVariable,
        vizConfig.xAxisVariable
      );
      const keepDependentAxisSettings = isEqual(
        selectedVariables.yAxisVariable,
        vizConfig.yAxisVariable
      );

      // need to get xAxisVariable based on vizConfig.xAxisVariable and selectedVariables
      const { variable: xAxisVar } =
        findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
      const { variable: selectedXAxisVar } =
        findEntityAndVariable(selectedVariables.xAxisVariable) ?? {};

      // check useBinning condition for independent axis
      const keepIndependentAxisUseBinning =
        xAxisVar?.dataShape === 'continuous' &&
        selectedXAxisVar?.dataShape === 'continuous';

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
        binWidth: keepIndependentAxisSettings ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepIndependentAxisSettings
          ? vizConfig.binWidthTimeUnit
          : undefined,
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig: valueSpec,
        // set undefined for variable change
        checkedLegendItems: undefined,
        // axis range control: set independentAxisRange undefined
        independentAxisRange: keepIndependentAxisSettings
          ? vizConfig.independentAxisRange
          : undefined,
        dependentAxisRange: keepDependentAxisSettings
          ? vizConfig.dependentAxisRange
          : undefined,
        ...(keepDependentAxisSettings
          ? {}
          : {
              numeratorValues: undefined,
              denominatorValues:
                yAxisVar != null ? yAxisVar.vocabulary : undefined,
            }),
        independentAxisLogScale: false,
        dependentAxisLogScale: keepDependentAxisSettings
          ? vizConfig.dependentAxisLogScale
          : undefined,
        independentAxisValueSpec: keepIndependentAxisSettings
          ? vizConfig.independentAxisValueSpec
          : 'Full',
        dependentAxisValueSpec: keepDependentAxisSettings
          ? vizConfig.dependentAxisValueSpec
          : yAxisVar != null
          ? isSuitableCategoricalVariable(yAxisVar)
            ? 'Full'
            : 'Auto-zoom'
          : 'Full',
        // udpate useBinning with conditions
        useBinning: keepIndependentAxisUseBinning
          ? vizConfig.useBinning
          : showMarginalHistogram &&
            selectedXAxisVar?.dataShape === 'continuous',
      });
      // axis range control: close truncation warnings here
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.valueSpecConfig,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.dependentAxisLogScale,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
      findEntityAndVariable,
      updateVizConfig,
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
    < ValueType,>(key: keyof LineplotConfig,
		  resetCheckedLegendItems?: boolean,
      resetIndependentAxisLogScale?: boolean,
      resetDependentAxisLogScale?: boolean,
      resetBinningControl?: boolean,
      resetErrorBarControl?: boolean,
      resetIndependentAxisRanges?: boolean,
      resetDependentAxisRanges?: boolean,
      ) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
        ...(resetIndependentAxisLogScale ? { independentAxisLogScale: false } : {}),
        ...(resetDependentAxisLogScale ? { dependentAxisLogScale: false } : {}),
        ...(resetBinningControl ? { useBinning: false } : {}),
        ...(resetErrorBarControl ? { showErrorBars: false } : {}),
        ...(resetIndependentAxisRanges ? { independentAxisRange: undefined } : {}),
        ...(resetDependentAxisRanges ? { dependentAxisRange: undefined } : {}),
      };
      updateVizConfig(newPartialConfig);
      if (resetIndependentAxisRanges) {
        setTruncatedIndependentAxisWarning('');
      }
      if (resetDependentAxisRanges) {
        setTruncatedDependentAxisWarning('');
      }
    },
    [updateVizConfig]
  );

  // set checkedLegendItems: undefined for the change of both plot options and showMissingness
  const onValueSpecChange = onChangeHandlerFactory<string>(
    'valueSpecConfig',
    true,
    false,
    false,
    false,
    false,
    true,
    true
  );

  const onIndependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'independentAxisValueSpec',
    false,
    false,
    false,
    false,
    false,
    true,
    false
  );
  const onDependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'dependentAxisValueSpec',
    false,
    false,
    false,
    false,
    false,
    false,
    true
  );

  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    false,
    false,
    false,
    false,
    true,
    true
  );

  const onShowErrorBarsChange = onChangeHandlerFactory<boolean>(
    'showErrorBars',
    true,
    false,
    false, // reset dependentAxisLogScale
    false,
    false,
    false,
    false
  );

  const onUseBinningChange = onChangeHandlerFactory<boolean>(
    'useBinning',
    false,
    false, // reset independentAxisLogScale
    false,
    false,
    false,
    false,
    false
  );

  const onNumeratorValuesChange =
    onChangeHandlerFactory<string[]>('numeratorValues');
  const onDenominatorValuesChange =
    onChangeHandlerFactory<string[]>('denominatorValues');

  const onIndependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'independentAxisLogScale',
    false,
    false,
    false,
    false, // reset useBinning
    false,
    true,
    false
  );

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale',
    false,
    false,
    false,
    false,
    false, // reset showErrorBars
    false,
    true
  );

  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'yAxisVariable'
  );

  const dataRequestConfig: DataRequestConfig = useDeepValue({
    // excluding dependencies for data request
    ...omit(vizConfig, [
      'dependentAxisRange',
      'checkedLegendItems',
      'dependentAxisValueSpec',
      'dependentAxisLogScale',
    ]),
    // the following looks nasty but it seems to work
    // the back end only makes use of the x-axis viewport (aka independentAxisRange)
    // when binning is in force, so no need to trigger a new request unless binning
    independentAxisRange: vizConfig.useBinning
      ? vizConfig.independentAxisRange
      : undefined,
    // same goes for changing from full to auto-zoom/custom
    independentAxisValueSpec:
      vizConfig.useBinning && vizConfig.independentAxisValueSpec === 'Full'
        ? vizConfig.independentAxisValueSpec
        : undefined,
  });

  const inputs = useMemo(
    (): InputSpec[] => [
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
        providedOptionalVariable: providedOverlayVariableDescriptor,
        readonlyValue:
          options?.getOverlayVariable != null
            ? providedOverlayVariableDescriptor
              ? variableDisplayWithUnit(providedOverlayVariable)
              : 'None. ' + options?.getOverlayVariableHelp?.() ?? ''
            : undefined,
      },
      ...(options?.hideFacetInputs
        ? []
        : [
            {
              name: 'facetVariable',
              label: 'Facet',
              role: 'stratification',
            } as const,
          ]),
    ],
    [options, providedOverlayVariable, providedOverlayVariableDescriptor]
  );

  // check banner condition
  const showIndependentAxisBanner =
    vizConfig.independentAxisLogScale && vizConfig.useBinning;
  const showDependentAxisBanner =
    vizConfig.dependentAxisLogScale && vizConfig.showErrorBars;

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
          overlayVariable && (providedOverlayVariable ?? overlayVariable),
          facetVariable,
        ])
      )
        throw new Error(nonUniqueWarning);

      if (categoricalMode && !valuesAreSpecified) return undefined;

      if (
        categoricalMode &&
        !validateProportionValues(
          dataRequestConfig.numeratorValues,
          dataRequestConfig.denominatorValues,
          yAxisVariable?.vocabulary
        )
      )
        throw new Error(invalidProportionText);

      // no data request if banner should be shown
      if (showIndependentAxisBanner || showDependentAxisBanner)
        return undefined;

      assertValidInputVariables(
        inputs,
        selectedVariables,
        entities,
        dataElementConstraints,
        dataElementDependencyOrder
      );

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        dataRequestConfig,
        xAxisVariable,
        yAxisVariable,
        outputEntity,
        options?.getRequestParams
      );

      const response = await dataClient.getLineplot(
        computation.descriptor.type,
        params
      );

      const showMissingOverlay =
        dataRequestConfig.showMissingness &&
        hasIncompleteCases(
          overlayEntity,
          overlayVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );
      const showMissingFacet =
        dataRequestConfig.showMissingness &&
        hasIncompleteCases(
          facetEntity,
          facetVariable,
          outputEntity,
          filteredCounts.value,
          response.completeCasesTable
        );

      // This is used for reordering series data.
      // We don't want to do this for non-continuous variables.
      const xAxisVocabulary =
        xAxisVariable.dataShape === 'continuous'
          ? []
          : fixLabelsForNumberVariables(
              xAxisVariable?.vocabulary,
              xAxisVariable
            );
      const overlayVocabulary =
        (overlayVariable && options?.getOverlayVocabulary?.()) ??
        fixLabelsForNumberVariables(
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
        params.config.valueSpec === 'proportion',
        showMissingOverlay,
        xAxisVocabulary,
        overlayVocabulary,
        overlayVariable,
        showMissingFacet,
        facetVocabulary,
        facetVariable,
        colorPaletteOverride,
        // pass showmarginalHistogram
        showMarginalHistogram
      );
    }, [
      outputEntity,
      xAxisVariable,
      yAxisVariable,
      filteredCounts.pending,
      filteredCounts.value,
      overlayVariable,
      facetVariable,
      categoricalMode,
      valuesAreSpecified,
      inputs,
      selectedVariables,
      entities,
      dataElementConstraints,
      dataElementDependencyOrder,
      filters,
      studyId,
      dataRequestConfig,
      dataClient,
      computation.descriptor.type,
      overlayEntity,
      facetEntity,
      visualization.descriptor.type,
      neutralPaletteProps.colorPalette,
      showIndependentAxisBanner,
      showDependentAxisBanner,
    ])
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  const defaultIndependentAxisRange = useDefaultAxisRange(
    xAxisVariable,
    data.value?.xMin,
    data.value?.xMinPos,
    data.value?.xMax,
    vizConfig.independentAxisLogScale,
    vizConfig.independentAxisValueSpec
  );

  const xMinMaxDataRange = useMemo(
    () =>
      // This useBinning edge case handling is a bit of kludge.
      // The same situation affects the histogram independent axis (all the time).
      // The problem is if you make a data request for an x-axis viewport (aka zoom to range), then
      // the xMin and xMax are calculated from the response, which is just for the requested
      // viewport.  Using the data-derived xMin and xMax works great for client-side zooming,
      // because the data doesn't change. But for server-side zooming we can't use xMin and xMax from
      // the response.
      // Two possible solutions I can think of:
      // 1. Client makes a request for unzoomed data to get the xMin and xMax, and remembers this.
      // 2. Server returns the truncation flags for us, somehow.
      vizConfig.useBinning
        ? defaultIndependentAxisRange
        : data.value != null
        ? ({ min: data.value.xMin, max: data.value?.xMax } as NumberOrDateRange)
        : undefined,
    [data.value, defaultIndependentAxisRange, vizConfig.useBinning]
  );
  const yMinMaxDataRange = useMemo(
    () =>
      data.value != null
        ? ({ min: data.value.yMin, max: data.value?.yMax } as NumberOrDateRange)
        : undefined,
    [data]
  );

  // use a hook to handle default dependent axis range for Lineplot Viz Proportion
  const defaultDependentAxisRange = useDefaultDependentAxisRangeProportion(
    data,
    yAxisVariable,
    vizConfig.dependentAxisLogScale,
    vizConfig.valueSpecConfig,
    vizConfig.dependentAxisValueSpec
  );

  // custom legend list
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const allData = data.value?.dataSetProcess;
    const palette = neutralPaletteProps.colorPalette ?? ColorPaletteDefault;

    // use lineplot data only for legend
    const legendData = !isFaceted(allData)
      ? allData?.series.filter((data) => data.mode === 'lines+markers')
      : allData?.facets
          .find(({ data }) => data != null && data.series.length > 0)
          ?.data?.series.filter((data) => data.mode === 'lines+markers');

    return legendData != null
      ? // the name 'dataItem' is used inside the map() to distinguish from the global 'data' variable
        legendData.map(
          (dataItem: LinePlotDataSeriesWithType, index: number) => ({
            hideFromLegend: dataItem.hideFromLegend,
            label: dataItem.name ?? '',
            italicizeLabel: dataItem.seriesType === 'zeroOverZero',
            // maing marker info appropriately
            marker:
              dataItem.seriesType === 'zeroOverZero'
                ? 'circleOutline'
                : 'lineWithCircle',
            // set marker colors appropriately
            markerColor:
              dataItem.name === 'No data'
                ? '#E8E8E8'
                : dataItem.marker?.color ?? palette[index], // set first color for no overlay variable selected
            // simplifying the check with the presence of data: be carefule of y:[null] case in Scatter plot
            hasData: !isFaceted(allData)
              ? // fix legend bug
                dataItem.y.length > 0 &&
                dataItem.y.some((element) => element != null)
              : allData.facets
                  .map((facet) => facet.data)
                  .filter((data): data is LinePlotData => data != null)
                  .some(
                    (data) =>
                      data.series[index].y.length > 0 &&
                      data.series[index].y.some((element) => element != null)
                  ),
            group: 1,
            rank: 1,
          })
        )
      : [];
  }, [data, neutralPaletteProps]);

  // set checkedLegendItems to either the config-stored items, or all items if
  // nothing stored (or if no overlay locally configured)
  const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
    legendItems,
    vizConfig.overlayVariable
      ? options?.getCheckedLegendItems?.(
          computation.descriptor.configuration
        ) ?? vizConfig.checkedLegendItems
      : undefined,
    updateVizConfig
  );

  const areRequiredInputsSelected = useMemo(() => {
    if (!dataElementConstraints) return false;
    if (
      vizConfig.valueSpecConfig === 'Proportion' &&
      (!vizConfig.numeratorValues ||
        !vizConfig.numeratorValues.length ||
        !vizConfig.denominatorValues ||
        !vizConfig.denominatorValues.length)
    ) {
      return false;
    }
    return Object.entries(dataElementConstraints[0])
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);
  }, [dataElementConstraints, vizConfig]);

  // set truncation flags: will see if this is reusable with other application
  const {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  } = useMemo(
    () =>
      truncationConfig(
        {
          independentAxisRange: xMinMaxDataRange,
          dependentAxisRange: yMinMaxDataRange,
        },
        vizConfig,
        {
          // overrides for logscale when values go zero or negative
          ...(vizConfig.independentAxisLogScale &&
          xMinMaxDataRange?.min != null &&
          xMinMaxDataRange.min <= 0
            ? { truncationConfigIndependentAxisMin: true }
            : {}),
          ...(vizConfig.dependentAxisLogScale &&
          yMinMaxDataRange?.min != null &&
          yMinMaxDataRange.min <= 0
            ? { truncationConfigDependentAxisMin: true }
            : {}),
        }
      ),
    [xMinMaxDataRange, yMinMaxDataRange, vizConfig]
  );

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    finalPlotContainerStyles,
    [
      data,
      vizConfig.checkedLegendItems,
      // considering axis range control too
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
    ]
  );

  const lineplotProps: LinePlotProps = {
    independentAxisLabel: variableDisplayWithUnit(xAxisVariable) ?? 'X-axis',
    dependentAxisLabel:
      vizConfig.valueSpecConfig === 'Proportion'
        ? 'Proportion'
        : variableDisplayWithUnit(yAxisVariable)
        ? vizConfig.valueSpecConfig === 'Arithmetic mean'
          ? '<b>Arithmetic mean:</b><br> ' +
            variableDisplayWithUnit(yAxisVariable)
          : vizConfig.valueSpecConfig === 'Median'
          ? '<b>Median:</b><br> ' + variableDisplayWithUnit(yAxisVariable)
          : vizConfig.valueSpecConfig === 'Geometric mean'
          ? '<b>Geometric mean:</b><br> ' +
            variableDisplayWithUnit(yAxisVariable)
          : 'Y-axis'
        : 'Y-axis',
    displayLegend: false,
    showExportButton: true,
    containerStyles: !isFaceted(data.value?.dataSetProcess)
      ? finalPlotContainerStyles
      : undefined,
    spacingOptions: !isFaceted(data.value?.dataSetProcess)
      ? plotSpacingOptions
      : undefined,
    interactive: !isFaceted(data.value?.dataSetProcess) ? true : false,
    showSpinner: filteredCounts.pending || data.pending,

    independentValueType: DateVariable.is(xAxisVariable)
      ? 'date'
      : StringVariable.is(xAxisVariable)
      ? 'string'
      : 'number',
    dependentValueType: DateVariable.is(yAxisVariable) ? 'date' : 'number',

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
    independentAxisLogScale: vizConfig.independentAxisLogScale,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    independentAxisRange:
      vizConfig.independentAxisRange ?? defaultIndependentAxisRange,
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
    // display marginal histogram
    showMarginalHistogram:
      xAxisVariable?.dataShape === 'continuous' && showMarginalHistogram,
    // marginal histogram size [0, 1]: default is 0.2 (20 %)
    marginalHistogramSize: 0.2,
  };

  const plotNode = (
    <>
      {isFaceted(data.value?.dataSetProcess) ? (
        <FacetedLinePlot
          data={data.value?.dataSetProcess}
          // considering axis range control
          componentProps={lineplotProps}
          modalComponentProps={{
            ...lineplotProps,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <LinePlot
          {...lineplotProps}
          ref={plotRef}
          data={data.value?.dataSetProcess}
          // add controls
          displayLibraryControls={false}
          // custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />
      )}
    </>
  );

  const [
    dismissedIndependentAllNegativeWarning,
    setDismissedIndependentAllNegativeWarning,
  ] = useState<boolean>(false);
  const independentAllNegative = // or zero
    vizConfig.independentAxisLogScale &&
    xMinMaxDataRange?.max != null &&
    xMinMaxDataRange.max <= 0;

  const [
    dismissedDependentAllNegativeWarning,
    setDismissedDependentAllNegativeWarning,
  ] = useState<boolean>(false);
  const dependentAllNegative = // or zero
    vizConfig.dependentAxisLogScale &&
    yMinMaxDataRange?.max != null &&
    yMinMaxDataRange.max <= 0;

  // const { enqueueSnackbar } = useSnackbar();

  const widgetHeight = '4em';

  // controls need the bin info from just one facet (not an empty one)
  const data0 = isFaceted(data.value?.dataSetProcess)
    ? data.value?.dataSetProcess.facets.find(
        ({ data }) => data != null && data.series.length > 0
      )?.data
    : data.value?.dataSetProcess;

  // add banner condition to avoid unnecessary disabled
  const neverUseBinning =
    !showIndependentAxisBanner &&
    !showDependentAxisBanner &&
    data0?.binWidthSlider == null; // for ordinal string x-variables

  // axis range control
  const neverShowErrorBars = lineplotProps.dependentValueType === 'date';

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
      independentAxisLogScale: false,
      independentAxisValueSpec: 'Full',
      useBinning: alwaysEnableUseBinning,
      binWidth: undefined,
      binWidthTimeUnit: undefined,
    });
    // add reset for truncation message: including dependent axis warning as well
    setTruncatedIndependentAxisWarning('');
  }, [updateVizConfig, setTruncatedIndependentAxisWarning]);

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
      dependentAxisLogScale: false,
      dependentAxisValueSpec: categoricalMode ? 'Full' : 'Auto-zoom',
      showErrorBars: true,
    });
    // add reset for truncation message as well
    setTruncatedDependentAxisWarning('');
  }, [updateVizConfig, categoricalMode]);

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
  }, [
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    setTruncatedIndependentAxisWarning,
  ]);

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
  }, [
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
    setTruncatedDependentAxisWarning,
  ]);

  const controlsNode = (
    <>
      {/* pre-occupied space for Banner: 1 line = 2.5em */}
      {/* <div style={{ width: 750, marginLeft: '1em', minHeight: '5em' }}> */}
      <div
        style={{
          width: 750,
          marginLeft: '1em',
          minHeight: '5.1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* independent axis banner */}
        {vizConfig.independentAxisLogScale && vizConfig.useBinning && (
          <Banner
            banner={{
              type: 'warning',
              message: 'Log scale and binning are not available concurrently.',
              pinned: true,
              intense: false,
              additionalMessage:
                'Binning of non-log transformed raw data cannot be accurately plotted on log scale axes.',
              // text for showMore link
              showMoreLinkText: 'Why?',
              // text for showless link
              showLessLinkText: 'Read less',
              // color for show more links
              showMoreLinkColor: '#006699',
              spacing: {
                margin: '0.3125em 0 0 0',
                padding: '0.3125em 0.625em',
              },
              fontSize: '1em',
            }}
          />
        )}
        {/* dependent axis banner */}
        {vizConfig.dependentAxisLogScale && vizConfig.showErrorBars && (
          <Banner
            banner={{
              type: 'warning',
              message:
                'Y-axis log scale and error bars are not available concurrently.',
              pinned: true,
              intense: false,
              additionalMessage:
                'Error bars for non-log transformed raw data cannot be accurately plotted on log scale y-axis.',
              // text for showMore link
              showMoreLinkText: 'Why?',
              // text for showless link
              showLessLinkText: 'Read less',
              // color for show more links
              showMoreLinkColor: '#006699',
              spacing: {
                margin: '0.3125em 0 0 0',
                padding: '0.3125em 0.625em',
              },
              fontSize: '1em',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* X-axis controls   */}
          {/* set Undo icon and its behavior */}
          <LabelledGroup
            label={
              <div css={{ display: 'flex', alignItems: 'center' }}>
                X-axis controls
                <ResetButtonCoreUI
                  size={'medium'}
                  text={''}
                  themeRole={'primary'}
                  tooltip={'Reset to defaults'}
                  disabled={lineplotProps.independentValueType === 'string'}
                  onPress={handleIndependentAxisSettingsReset}
                />
              </div>
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '0.8em',
              }}
            >
              <Toggle
                label={'Log scale (excludes values \u{2264} 0)'}
                value={vizConfig.independentAxisLogScale ?? false}
                onChange={(newValue: boolean) => {
                  setDismissedIndependentAllNegativeWarning(false);
                  onIndependentAxisLogScaleChange(newValue);
                }}
                disabled={
                  lineplotProps.independentValueType === 'date' ||
                  lineplotProps.independentValueType === 'string'
                }
                themeRole="primary"
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                // marginTop: '-0.3em',
                marginBottom: '0.8em',
              }}
            >
              {independentAllNegative &&
              !dismissedIndependentAllNegativeWarning &&
              !(vizConfig.independentAxisLogScale && vizConfig.useBinning) &&
              !(vizConfig.dependentAxisLogScale && vizConfig.showErrorBars) ? (
                <Notification
                  title={''}
                  text={
                    'Nothing can be plotted with log scale because all values are zero or negative'
                  }
                  color={'#5586BE'}
                  onAcknowledgement={() =>
                    setDismissedIndependentAllNegativeWarning(true)
                  }
                  showWarningIcon={true}
                  containerStyles={{ maxWidth: '350px', marginBottom: '1em' }}
                />
              ) : null}
              {/* hide Binning toggle for timeline Viz */}
              {!alwaysEnableUseBinning ? (
                <Toggle
                  label={'Binning'}
                  value={vizConfig.useBinning}
                  onChange={(newValue: boolean) => {
                    onUseBinningChange(newValue);
                  }}
                  disabled={neverUseBinning}
                  themeRole="primary"
                />
              ) : null}
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
                  maxWidth:
                    lineplotProps.independentValueType === 'date'
                      ? '250px'
                      : '350px',
                }}
                // always enable binning for timeline Viz
                disabled={
                  alwaysEnableUseBinning
                    ? undefined
                    : !vizConfig.useBinning || neverUseBinning
                }
              />
            </div>

            <LabelledGroup
              label="X-axis range"
              containerStyles={{
                fontSize: '0.9em',
                // width: '350px',
                marginTop: '-0.8em',
                padding: '1em 0',
              }}
            >
              <RadioButtonGroup
                options={['Full', 'Auto-zoom', 'Custom']}
                selectedOption={vizConfig.independentAxisValueSpec ?? 'Full'}
                onOptionSelected={(newAxisRangeOption: string) => {
                  onIndependentAxisValueSpecChange(newAxisRangeOption);
                }}
                orientation={'horizontal'}
                labelPlacement={'end'}
                buttonColor={'primary'}
                margins={['0em', '0', '0', '0em']}
                itemMarginRight={25}
                // add disabled list
                disabledList={
                  lineplotProps.independentValueType === 'string'
                    ? ['Full', 'Auto-zoom', 'Custom']
                    : []
                }
              />
              {/* X-Axis range control */}
              {/* designed to disable X-axis range control for categorical X */}
              <AxisRangeControl
                // change label for disabled case
                label={
                  lineplotProps.independentValueType === 'string'
                    ? 'Range (not available)'
                    : 'Range'
                }
                range={
                  vizConfig.independentAxisRange ?? defaultIndependentAxisRange
                }
                onRangeChange={handleIndependentAxisRangeChange}
                // will disable for categorical X so this is sufficient
                valueType={
                  lineplotProps.independentValueType === 'date'
                    ? 'date'
                    : 'number'
                }
                // set maxWidth
                containerStyles={{ maxWidth: '350px' }}
                // input forms are diabled for categorical X
                disabled={
                  lineplotProps.independentValueType === 'string' ||
                  vizConfig.independentAxisValueSpec === 'Full' ||
                  vizConfig.independentAxisValueSpec === 'Auto-zoom'
                }
              />
              {/* truncation notification */}
              {truncatedIndependentAxisWarning &&
              !independentAllNegative &&
              !(vizConfig.independentAxisLogScale && vizConfig.useBinning) &&
              !(vizConfig.dependentAxisLogScale && vizConfig.showErrorBars) ? (
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
                    maxWidth:
                      lineplotProps.independentValueType === 'date'
                        ? '350px'
                        : '350px',
                  }}
                />
              ) : null}
            </LabelledGroup>
          </LabelledGroup>
        </div>

        {/* add vertical line in btw Y- and X- controls */}
        <div
          style={{
            display: 'inline-flex',
            borderLeft: '2px solid lightgray',
            height: '20.3em',
            position: 'relative',
            marginLeft: '-1px',
            top: '1.5em',
          }}
        >
          {' '}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* set Undo icon and its behavior */}
          <LabelledGroup
            label={
              <div css={{ display: 'flex', alignItems: 'center' }}>
                Y-axis controls
                <ResetButtonCoreUI
                  size={'medium'}
                  text={''}
                  themeRole={'primary'}
                  tooltip={'Reset to defaults'}
                  disabled={false}
                  onPress={handleDependentAxisSettingsReset}
                />
              </div>
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '0.8em',
              }}
            >
              <Toggle
                label={'Log scale (excludes values \u{2264} 0)'}
                value={vizConfig.dependentAxisLogScale ?? false}
                onChange={(newValue: boolean) => {
                  setDismissedDependentAllNegativeWarning(false);
                  onDependentAxisLogScaleChange(newValue);
                }}
                disabled={lineplotProps.dependentValueType === 'date'}
                themeRole="primary"
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '0.8em',
              }}
            >
              {dependentAllNegative &&
              !dismissedDependentAllNegativeWarning &&
              !(vizConfig.independentAxisLogScale && vizConfig.useBinning) &&
              !(vizConfig.dependentAxisLogScale && vizConfig.showErrorBars) ? (
                <Notification
                  title={''}
                  text={
                    'Nothing can be plotted with log scale because all values are zero or negative'
                  }
                  color={'#5586BE'}
                  onAcknowledgement={() =>
                    setDismissedDependentAllNegativeWarning(true)
                  }
                  showWarningIcon={true}
                  containerStyles={{ maxWidth: '350px', marginBottom: '1em' }}
                />
              ) : null}
              <Toggle
                label={'Error bars (95% C.I.)'}
                value={vizConfig.showErrorBars ?? true}
                onChange={(newValue: boolean) => {
                  onShowErrorBarsChange(newValue);
                }}
                disabled={neverShowErrorBars}
                themeRole="primary"
              />
            </div>
            {/* Y-axis range control */}
            {/* make some space to match with X-axis range control */}
            <div style={{ height: '4em' }} />
            <LabelledGroup
              label="Y-axis range"
              containerStyles={{
                fontSize: '0.9em',
                marginTop: '-0.8em',
                // width: '350px',
                padding: '1em 0',
              }}
            >
              <RadioButtonGroup
                options={['Full', 'Auto-zoom', 'Custom']}
                selectedOption={vizConfig.dependentAxisValueSpec ?? 'Full'}
                onOptionSelected={(newAxisRangeOption: string) => {
                  onDependentAxisValueSpecChange(newAxisRangeOption);
                }}
                orientation={'horizontal'}
                labelPlacement={'end'}
                buttonColor={'primary'}
                margins={['0em', '0', '0', '0em']}
                itemMarginRight={25}
                disabledList={
                  !categoricalMode && vizConfig.yAxisVariable != null
                    ? ['Full']
                    : []
                }
              />
              <AxisRangeControl
                label="Range"
                range={
                  vizConfig.dependentAxisRange ?? defaultDependentAxisRange
                }
                valueType={
                  lineplotProps.dependentValueType === 'date'
                    ? 'date'
                    : 'number'
                }
                onRangeChange={(newRange?: NumberOrDateRange) => {
                  handleDependentAxisRangeChange(newRange);
                }}
                // set maxWidth
                containerStyles={{ maxWidth: '350px' }}
                logScale={vizConfig.dependentAxisLogScale}
                disabled={
                  vizConfig.dependentAxisValueSpec === 'Full' ||
                  vizConfig.dependentAxisValueSpec === 'Auto-zoom'
                }
              />
              {/* truncation notification */}
              {truncatedDependentAxisWarning &&
              !dependentAllNegative &&
              !(vizConfig.independentAxisLogScale && vizConfig.useBinning) &&
              !(vizConfig.dependentAxisLogScale && vizConfig.showErrorBars) ? (
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
            </LabelledGroup>
          </LabelledGroup>
        </div>
      </div>
    </>
  );

  const legendTitle = variableDisplayWithUnit(overlayVariable);
  const isZeroOverZeroSeries = (series: LinePlotDataSeriesWithType) =>
    series.seriesType === 'zeroOverZero';
  const zeroSeriesAdded = !isFaceted(data.value?.dataSetProcess)
    ? data.value?.dataSetProcess.series.some(isZeroOverZeroSeries)
    : data.value?.dataSetProcess.facets.some((facet) =>
        facet.data?.series.some(isZeroOverZeroSeries)
      );
  const showOverlayLegend =
    legendItems.length > 0 &&
    (vizConfig.overlayVariable != null || zeroSeriesAdded);
  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      type="list"
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={setCheckedLegendItems}
      legendTitle={legendTitle}
      // add a condition to show legend even for single overlay data and check legendItems exist
      showOverlayLegend={showOverlayLegend}
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
            display: legendTitle,
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

  const { vocabulary, fullVocabulary } = yAxisVariable ?? {};

  const aggregationInputs = (
    <AggregationInputs
      {...(vizConfig.valueSpecConfig !== 'Proportion'
        ? {
            aggregationType: 'function',
            options: keys(valueSpecLookup).filter(
              (option) => option !== 'Proportion'
            ),
            aggregationFunction: vizConfig.valueSpecConfig,
            onFunctionChange: onValueSpecChange,
          }
        : {
            aggregationType: 'proportion',
            options: fullVocabulary ?? vocabulary ?? [],
            disabledOptions: fullVocabulary
              ? fullVocabulary.filter((value) => vocabulary?.includes(value))
              : [],
            numeratorValues: vizConfig.numeratorValues ?? [],
            denominatorValues: vizConfig.denominatorValues ?? [],
            // onChange handlers now ensure the available options belong to the vocabulary (which can change due to direct filters)
            onNumeratorChange: (values) =>
              onNumeratorValuesChange(
                values.filter((value) => vocabulary?.includes(value))
              ),
            onDenominatorChange: (values) =>
              onDenominatorValuesChange(
                values.filter((value) => vocabulary?.includes(value))
              ),
          })}
    />
  );

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        {!hideInputsAndControls && (
          <InputVariables
            inputs={inputs}
            customSections={[
              {
                title: (
                  <>
                    <span style={{ marginRight: '0.5em' }}>
                      Y-axis aggregation{' '}
                      {vizConfig.yAxisVariable
                        ? categoricalMode
                          ? '(categorical Y)'
                          : '(continuous Y)'
                        : ''}
                    </span>
                    <HelpIcon children={aggregationHelp} />
                  </>
                ),
                order: 75,
                content: vizConfig.yAxisVariable ? (
                  aggregationInputs
                ) : (
                  <span style={{ color: '#969696', fontWeight: 500 }}>
                    First choose a Y-axis variable.
                  </span>
                ),
              },
            ]}
            entities={entities}
            selectedVariables={selectedVariables}
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
            // this can be used to show and hide no data control
            onShowMissingnessChange={
              computation.descriptor.type === 'pass'
                ? onShowMissingnessChange
                : undefined
            }
            outputEntity={outputEntity}
          />
        )}
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      {!hideInputsAndControls && (
        <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      )}
      <LayoutComponent
        isFaceted={isFaceted(data.value?.dataSetProcess)}
        legendNode={showOverlayLegend ? legendNode : null}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={!areRequiredInputsSelected}
        hideControls={hideInputsAndControls}
      />
    </div>
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
  dependentIsProportion: boolean,
  showMissingOverlay: boolean = false,
  xAxisVocabulary: string[] = [],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable,
  colorPaletteOverride?: string[],
  showMarginalHistogram?: boolean
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
    const { dataSetProcess, yMin, yMinPos, yMax, xMin, xMinPos, xMax } =
      processInputData(
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
        dependentIsProportion,
        response.lineplot.config.binSpec,
        response.lineplot.config.binSlider,
        overlayVariable,
        colorPaletteOverride,
        showMarginalHistogram
      );

    return {
      dataSetProcess,
      yMin,
      yMinPos,
      yMax,
      xMin,
      xMinPos,
      xMax,
    };
  });

  const xMin = min(map(processedData, ({ xMin }) => xMin));
  const xMinPos = min(map(processedData, ({ xMinPos }) => xMinPos));
  const xMax = max(map(processedData, ({ xMax }) => xMax));
  const yMin = min(map(processedData, ({ yMin }) => yMin));
  const yMinPos = min(map(processedData, ({ yMinPos }) => yMinPos));
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
    dataSetProcess: substituteUnselectedToken(dataSetProcess!),
    // calculated y axis limits
    xMin,
    xMinPos,
    xMax,
    yMin,
    yMinPos,
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
  dataSetProcess: LinePlotDataSeriesWithType[],
  dependentValueType: string
): LinePlotDataSeriesWithType[] {
  // make no attempt to process date values
  if (dependentValueType === 'date') return dataSetProcess;

  return dataSetProcess.map((series) => {
    if (!(series.seriesType === 'zeroOverZero')) {
      return series;
    } else {
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
        }, {} as Partial<LinePlotDataSeriesWithType>),
      };
    }
  });
}

type DataRequestConfig = Omit<
  LineplotConfig,
  'dependentAxisRange' | 'checkedLegendItems'
>;

/**
 * Passing the whole of `vizConfig` creates a problem with the TypeScript compiler warnings
 * for the dependencies of the `data = usePromise(...)` that calls this function. It warns
 * that `vizConfig` is a missing dependency because it see it being used (passed to `getRequestParams()`)
 * We can't use the whole of `vizConfig` as a dependency because then data will be re-requested
 * when only client-side configs are changed. There should probably be two sub-objects of `vizConfig`,
 * for client and server-side configs.
 */
function getRequestParams(
  studyId: string,
  filters: Filter[],
  vizConfig: DataRequestConfig,
  xAxisVariableMetadata: Variable,
  yAxisVariableMetadata: Variable,
  outputEntity: StudyEntity,
  customMakeRequestParams?: (
    props: RequestOptionProps<LineplotConfig> & FloatingLineplotExtraProps
  ) => LineplotRequestParams
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
      ? xAxisVariableMetadata.distributionDefaults.binWidthOverride ??
        xAxisVariableMetadata.distributionDefaults.binWidth
      : undefined,
    binWidthTimeUnit = xAxisVariableMetadata?.type === 'date'
      ? xAxisVariableMetadata.distributionDefaults.binUnits
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
            : { value: 1 }),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  const valueSpec = valueSpecLookup[valueSpecConfig];
  // no error bars for date variables (error bar toggle switch is also disabled)
  const errorBars =
    vizConfig.showErrorBars && yAxisVariableMetadata.type !== 'date'
      ? 'TRUE'
      : 'FALSE';

  return (
    customMakeRequestParams?.({
      studyId,
      filters,
      vizConfig,
      outputEntityId: outputEntity?.id,
      valueSpec,
      binSpec,
      errorBars,
    }) ?? {
      studyId,
      filters,
      config: {
        outputEntityId: outputEntity?.id,
        valueSpec,
        xAxisVariable: xAxisVariable!, // these will never be undefined because
        yAxisVariable: yAxisVariable!, // data requests are only made when they have been chosen by user
        ...binSpec,
        overlayVariable: overlayVariable,
        facetVariable: facetVariable ? [facetVariable] : [],
        showMissingness: showMissingness ? 'TRUE' : 'FALSE',
        errorBars,
        ...(valueSpec === 'proportion'
          ? {
              yAxisNumeratorValues: numeratorValues,
              yAxisDenominatorValues: denominatorValues,
            }
          : {}),
      },
    }
  );
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
  dependentIsProportion: boolean,
  binSpec?: BinSpec,
  binWidthSlider?: BinWidthSlider,
  overlayVariable?: Variable,
  colorPaletteOverride?: string[],
  showMarginalHistogram?: boolean
) {
  // define separate types for union type of BinSampleSize
  type BinSampleSizeNumber = {
    N: number;
  };

  type BinSampleSizeProportion = {
    numeratorN: number;
    denominatorN: number;
  };

  const zeroProcessedData = processZeroOverZeroData(
    responseLineplotData,
    dependentIsProportion,
    overlayVariable !== undefined,
    hasMissingData
  );

  // set fillAreaValue for densityplot
  const fillAreaValue: LinePlotDataSeries['fill'] =
    vizType === 'densityplot' ? 'toself' : undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    zeroProcessedData.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] },
    };
  }

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number, el: ZeroOverZeroData[number]) => {
    const palette = colorPaletteOverride ?? ColorPaletteDefault;
    // TO DO: decide on overflow behaviour
    const fallbackColor = 'black';

    if (showMissingness && index === zeroProcessedData.length - 1) {
      // This is the no data series
      return gray;
    } else if (el?.seriesType !== 'zeroOverZero') {
      // It's a standard series. Choose the corresponding palette color
      return palette[index] ?? fallbackColor;
    } else {
      // It's a 0/0 series
      const zeroSeriesOverlayValue = el.overlayVariableDetails?.value;

      if (!zeroSeriesOverlayValue) {
        // There's no overlay variable, so this is the only series (other than
        // 'no data', maybe) that will be shown in the legend
        return palette[0];
      } else {
        // Give it the same color as its corresponding standard series
        const standardSeriesIndex = zeroProcessedData.findIndex(
          (series) =>
            series.seriesType === 'standard' &&
            series.overlayVariableDetails?.value === zeroSeriesOverlayValue
        );
        return palette[standardSeriesIndex] ?? fallbackColor;
      }
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness &&
      !hasMissingData &&
      index === zeroProcessedData.length - 2
    );
  };

  const markerSymbol = (
    index: number,
    el: ZeroOverZeroData[number]
  ): string => {
    return showMissingness && index === zeroProcessedData.length - 1
      ? 'x'
      : el?.seriesType === 'zeroOverZero'
      ? 'circle-open'
      : 'circle';
  };

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

  const dataSetProcessed: LinePlotDataSeriesWithType[] = [];

  zeroProcessedData.some(function (el, index) {
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

      const color = markerColor(index, el);

      // for dataSetProcessed.name
      const dataSetProcessedName =
        (el.overlayVariableDetails?.value != null
          ? fixLabelForNumberVariables(
              el.overlayVariableDetails.value,
              overlayVariable
            )
          : el.seriesType !== 'zeroOverZero'
          ? 'Data'
          : '') +
        (el.seriesType === 'zeroOverZero'
          ? (overlayVariable !== undefined ? ', ' : '') +
            'Undefined Y (denominator of 0)'
          : '');

      dataSetProcessed.push({
        x: seriesX,
        y: seriesY,
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
        binSampleSize: el.binSampleSize,
        name: dataSetProcessedName,
        hideFromLegend: el.hideFromLegend,
        mode: modeValue,
        fill: fillAreaValue,
        opacity: 0.7,
        marker: { color, symbol: markerSymbol(index, el) },
        // this needs to be here for the case of markers with line or lineplot.
        line: { color, shape: 'linear' },
        seriesType: el.seriesType,
        // for connecting points regardless of missing data
        connectgaps: el.seriesType === 'standard' ? true : undefined,
      });

      // for marginal histogram dataset: add showMarginalHistogram condition
      if (
        el.binStart &&
        el.binStart.length > 0 &&
        el.binEnd &&
        el.binEnd.length > 0 &&
        el.binSampleSize &&
        el.binSampleSize.length > 0 &&
        showMarginalHistogram
      ) {
        // compute binSampleSize one
        const binSampleSize = categoricalMode
          ? el.binSampleSize.map((val) =>
              val == null
                ? null
                : // just use denominatorN
                  (val as BinSampleSizeProportion).denominatorN
            )
          : el.binSampleSize.map((val) =>
              val == null ? null : (val as BinSampleSizeNumber).N
            );

        // calculate binWidths for marginal historgram
        const marginalHistogramBinWidths = el.binStart.map((val, index) => {
          if (
            independentValueType === 'integer' ||
            independentValueType === 'number'
          ) {
            // binStart and binEnd from the backend are string
            return el.binStart != null && el.binEnd != null
              ? (Number(el.binEnd[index]) as number) -
                  (Number(el.binStart[index]) as number)
              : 0;
          } else {
            // date type in milliseconds
            return el.binStart != null && el.binEnd != null
              ? DateMath.diff(
                  new Date(el.binStart[index] as string),
                  new Date(el.binEnd[index] as string),
                  'seconds',
                  false
                ) * 1000
              : 0;
          }
        });

        // add marginal histogram data
        dataSetProcessed.push({
          x: seriesX,
          y: binSampleSize,
          width: marginalHistogramBinWidths,
          // use the same name with lineplot data for legend control
          name: dataSetProcessedName,
          hideFromLegend: el.hideFromLegend,
          type: 'bar',
          offset: 0,
          marker: { color },
          seriesType: el.seriesType,
          // set mode to be undefined for marginal histogram dataset
          // to avoid having unnecessary tooltip content
          mode: undefined,
          // this indicates that marginal histogram will use different yaxis
          yaxis: 'y2',
        });
      }
      return breakAfterThisSeries(index);
    }
    return false;
  });

  // only use lineplot data to correctly compute min/max
  const lineplotDataSetProcessed = dataSetProcessed.filter(
    (data) => data.mode === modeValue
  );

  // use lineplotDataSetProcessed instead of dataSetProcessed for computing min/max correctly
  const xValues = lineplotDataSetProcessed
    .flatMap<string | number | null>((series) =>
      series.x.map((xValue, index) =>
        series.y[index] !== null ? xValue : null
      )
    )
    .filter((xValue) => xValue !== null) as (string | number)[];
  // get all values of y (including error bars if present) in a kind of clunky way...
  const yValues = lineplotDataSetProcessed
    .flatMap<string | number | null>((series) => series.y)
    .concat(
      lineplotDataSetProcessed
        .flatMap((series) => series.yErrorBarLower ?? [])
        .filter((val): val is number | string => val != null)
    )
    .concat(
      lineplotDataSetProcessed
        .flatMap((series) => series.yErrorBarUpper ?? [])
        .filter((val): val is number | string => val != null)
    );

  return {
    dataSetProcess: {
      series: nullZeroHack(dataSetProcessed, dependentValueType),
      ...binWidthSliderData,
    },
    xMin: min(xValues),
    xMinPos: min(xValues.filter((value) => value > 0)),
    xMax: max(xValues),
    yMin: min(yValues),
    yMinPos: min(yValues.filter((value) => value != null && value > 0)),
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
          binStart: [],
        }
    );
  } else {
    return xAxisOrderedSeries;
  }
}

type ZeroOverZeroData = (LineplotResponse['lineplot']['data'][number] & {
  seriesType?: 'standard' | 'zeroOverZero';
  hideFromLegend?: boolean;
})[];

type BinSampleSize = {
  numeratorN: number;
  denominatorN: number;
};

// If the dependent variable is a proportion, find all data points whose
// dependent value is 0/0, and make a new series containing only these points.
// There will be one new 0/0 series for each original series.
function processZeroOverZeroData(
  lineplotData: LineplotResponse['lineplot']['data'],
  dependentIsProportion: boolean,
  hasOverlayVariable: boolean,
  hasMissingData: boolean
): ZeroOverZeroData {
  if (!dependentIsProportion) return lineplotData;

  // Check to see whether this data has any 0/0 points, so that we know whether
  // we need to make new 0/0 series
  const addZeroSeries = lineplotData.some((series, index) => {
    if (hasMissingData && index === lineplotData.length - 1) return false;
    return series.binSampleSize?.some(
      (binSampleSize) => (binSampleSize as BinSampleSize).denominatorN === 0
    );
  });

  if (!addZeroSeries) {
    return lineplotData;
  } else {
    // Arrays that we'll add all the new series to as we create them
    const allZeroSeries: Array<LineplotResponse['lineplot']['data'][number]> =
      [];
    const allStandardSeries: typeof allZeroSeries = [];

    // Keys of LinePlotData that are arrays (but NOT tuples). The size of these
    // arrays SHOULD be identical, indicating the number of data points in the
    // series. Add any new properties either here or in the array after it.
    const arrayKeys = [
      'seriesX',
      'seriesY',
      'binStart',
      'binEnd',
      'errorBars',
      'binSampleSize',
    ] as const;

    // All other keys
    const otherKeys = [
      'overlayVariableDetails',
      'facetVariableDetails',
    ] as const;

    const stopIndex = hasMissingData
      ? lineplotData.length - 1
      : lineplotData.length;

    for (let seriesIndex = 0; seriesIndex < stopIndex; seriesIndex++) {
      const series = lineplotData[seriesIndex];

      Object.keys(series).forEach((key) => {
        // The odd key typecasting here is necessary because of a quirk of the
        // Array.includes function type
        if (
          !arrayKeys.includes(key as typeof arrayKeys[number]) &&
          !otherKeys.includes(key as typeof otherKeys[number])
        )
          throw new Error(
            'Unexpected key in linePlotData series. If this is a new valid key, add it to one of the two key arrays in the code where this error is thrown.'
          );
      });

      const binSampleSizes = series.binSampleSize as
        | BinSampleSize[]
        | undefined;

      if (binSampleSizes) {
        const standardSeries = {
          ...series,
          seriesType: 'standard',
          // With no overlay variable, we only want to show the 0/0 legend entry
          hideFromLegend: !hasOverlayVariable,
        };
        const zeroSeries = {
          seriesType: 'zeroOverZero',
          ...series,
          // Empty all of the arrays
          ...arrayKeys.reduce((newObj, arrayKey) => {
            newObj[arrayKey] = [];
            return newObj;
          }, {} as Pick<LineplotResponse['lineplot']['data'][number], typeof arrayKeys[number]>),
        };
        // We don't want error bars on 0/0 points
        delete zeroSeries['errorBars'];

        binSampleSizes.forEach((binSampleSize, dataPointIndex) => {
          if (binSampleSize.denominatorN === 0) {
            arrayKeys.forEach((key) => {
              const array = series[key];
              const destinationArray = zeroSeries[key];

              if (array !== undefined && destinationArray !== undefined) {
                const value = array[dataPointIndex];
                (destinationArray as typeof value[]).push(value);
              }
            });
          }
        });

        allStandardSeries.push(standardSeries);
        allZeroSeries.push(zeroSeries);
      }
    }

    const newLineplotData = [...allStandardSeries, ...allZeroSeries];
    if (hasMissingData) newLineplotData.push(...lineplotData.slice(-1));

    return newLineplotData;
  }
}

/**
 * determine if we are dealing with a categorical variable
 */
function isSuitableCategoricalVariable(variable?: Variable): boolean {
  return (
    variable != null &&
    variable.dataShape !== 'continuous' &&
    variable.vocabulary != null &&
    variable.distinctValuesCount != null
  );
}

/**
 *  A hook to handle default dependent axis range for Lineplot Viz Proportion
 */
function useDefaultDependentAxisRangeProportion(
  data: PromiseHookState<LinePlotDataWithCoverage | undefined>,
  yAxisVariable?: Variable,
  dependentAxisLogScale?: boolean,
  valueSpecConfig?: string,
  dependentAxisValueSpec?: string
) {
  let defaultDependentAxisRange = useDefaultAxisRange(
    yAxisVariable,
    data.value?.yMin,
    data.value?.yMinPos,
    data.value?.yMax,
    dependentAxisLogScale,
    dependentAxisValueSpec
  );

  // include min origin: 0 (linear) or minPos (logscale)
  if (data.value != null && valueSpecConfig === 'Proportion')
    if (dependentAxisLogScale)
      defaultDependentAxisRange = {
        min: data.value?.yMinPos,
        // in case data.value.yMinPos === 1, then use 1.0001 for max range for better display
        max:
          data.value.yMinPos === 1
            ? 1.0001
            : dependentAxisValueSpec === 'Full'
            ? 1
            : data.value?.yMax,
      } as NumberRange;
    else
      defaultDependentAxisRange = {
        min: 0,
        max: dependentAxisValueSpec === 'Full' ? 1 : data.value?.yMax,
      } as NumberRange;

  return defaultDependentAxisRange;
}

type AggregationConfig<F extends string, P extends Array<string>> =
  | {
      aggregationType: 'function';
      aggregationFunction: F;
      onFunctionChange: (value: F) => void;
      options: Array<F>;
    }
  | {
      aggregationType: 'proportion';
      numeratorValues: Array<P[number]>;
      onNumeratorChange: (value: Array<P[number]>) => void;
      denominatorValues: Array<P[number]>;
      onDenominatorChange: (value: Array<P[number]>) => void;
      options: P;
      disabledOptions: P;
    };

export function AggregationInputs<F extends string, P extends Array<string>>(
  props: AggregationConfig<F, P>
) {
  const classes = useInputStyles();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {props.aggregationType === 'function' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className={classes.label}>Function</div>
          <SingleSelect
            onSelect={props.onFunctionChange}
            value={props.aggregationFunction}
            buttonDisplayContent={props.aggregationFunction}
            items={props.options.map((option) => ({
              value: option,
              display: option,
            }))}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, auto)',
            gridTemplateRows: 'repeat(3, auto)',
          }}
        >
          <Tooltip title={'Required parameter'}>
            <div
              className={classes.label}
              style={{
                gridColumn: 1,
                gridRow: 2,
                color:
                  props.numeratorValues.length && props.denominatorValues.length
                    ? undefined
                    : requiredInputLabelStyle.color,
              }}
            >
              Proportion<sup>*</sup>&nbsp;=
            </div>
          </Tooltip>
          <div
            className={classes.input}
            style={{
              gridColumn: 2,
              gridRow: 1,
              marginBottom: 0,
              justifyContent: 'center',
            }}
          >
            <ValuePicker
              allowedValues={props.options}
              disabledValues={props.disabledOptions}
              selectedValues={props.numeratorValues}
              onSelectedValuesChange={props.onNumeratorChange}
            />
          </div>
          <div style={{ gridColumn: 2, gridRow: 2, marginRight: '2em' }}>
            <hr style={{ marginTop: '0.6em' }} />
          </div>
          <div
            className={classes.input}
            style={{ gridColumn: 2, gridRow: 3, justifyContent: 'center' }}
          >
            <ValuePicker
              allowedValues={props.options}
              disabledValues={props.disabledOptions}
              selectedValues={props.denominatorValues}
              onSelectedValuesChange={props.onDenominatorChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const aggregationHelp = (
  <div>
    <p>
      “Mean” and “Median” are y-axis aggregation functions that can only be used
      when continuous variables <i className="fa fa-bar-chart-o  wdk-Icon"> </i>{' '}
      are selected for the y-axis.
    </p>
    <ul>
      <li>
        Mean = Sum of values for all data points / Number of all data points
      </li>
      <li>
        Median = The middle number in a sorted list of numbers. The median is a
        better measure of central tendency than the mean when data are not
        normally distributed.
      </li>
    </ul>
    <p>
      “Proportion” is the only y-axis aggregation function that can be used when
      categorical variables <i className="fa fa-list  wdk-Icon"> </i> are
      selected for the y-axis.
    </p>
    <ul>
      <li>Proportion = Numerator count / Denominator count</li>
    </ul>
    <p>
      The y-axis variable's values that count towards numerator and denominator
      must be selected in the two drop-downs.
    </p>
  </div>
);
