// load scatter plot component
import ScatterPlot, {
  ScatterPlotProps,
} from '@veupathdb/components/lib/plots/ScatterPlot';

import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

// need to set for Scatterplot

import DataClient, { ScatterplotResponse } from '../../../api/DataClient';

import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import {
  findEntityAndDynamicData,
  getTreeNode,
  isVariableCollectionDescriptor,
  isVariableDescriptor,
} from '../../../utils/study-metadata';

import {
  VariableDescriptor,
  VariableCollectionDescriptor,
} from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputSpec, InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import {
  ComputedVariableDetails,
  VisualizationProps,
} from '../VisualizationTypes';
import { HighlightedPointsDetails } from '@veupathdb/components/src/types/general';

import ScatterSVG from './selectorIcons/ScatterSVG';

// use lodash instead of Math.min/max
import {
  min,
  max,
  lte,
  gte,
  gt,
  groupBy,
  size,
  head,
  values,
  mapValues,
  map,
  keys,
  uniqBy,
  filter,
  isEqual,
  omit,
} from 'lodash';
// directly use RadioButtonGroup instead of ScatterPlotControls
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { Toggle } from '@veupathdb/coreui';
// import ScatterPlotData
import {
  ScatterPlotDataSeries,
  ScatterPlotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
// import Computation ts
import { CoverageStatistics } from '../../../types/visualization';
// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import { NumberVariable, Variable, StudyEntity } from '../../../types/study';
import {
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  variablesAreUnique,
  nonUniqueWarning,
  vocabularyWithMissingData,
  hasIncompleteCases,
  fixVarIdLabel,
  getVariableLabel,
  assertValidInputVariables,
  substituteUnselectedToken,
} from '../../../utils/visualization';
import { gray } from '../colors';
import {
  ColorPaletteDefault,
  ColorPaletteDark,
  SequentialGradientColorscale,
  getValueToGradientColorMapper,
  DefaultNonHighlightColor,
  DefaultHighlightMarkerStyle,
} from '@veupathdb/components/lib/types/plots/addOns';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { useRouteMatch } from 'react-router';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { PlotLegendGradientProps } from '@veupathdb/components/lib/components/plotControls/PlotGradientLegend';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import FacetedScatterPlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedScatterPlot';
// for converting rgb() to rgba()
import * as ColorMath from 'color-math';
// R-square table component
import { ScatterplotRsquareTable } from '../../ScatterplotRsquareTable';
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import { NumberOrDateRange } from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  useNeutralPaletteProps,
  useVizConfig,
} from '../../../hooks/visualizations';
// typing computedVariableMetadata for computation apps such as alphadiv and abundance
import {
  ScatterplotRequestParams,
  VariableMapping,
} from '../../../api/DataClient/types';
// use Banner from CoreUI for showing message for no smoothing
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { useOutputEntity } from '../../../hooks/findOutputEntity';

import { LayoutOptions, TitleOptions } from '../../layouts/types';
import { OverlayOptions, RequestOptions } from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';

// add Slider and SliderWidgetProps
import SliderWidget, {
  plotsSliderOpacityGradientColorSpec,
} from '@veupathdb/components/lib/components/widgets/Slider';
import { FloatingScatterplotExtraProps } from '../../../../map/analysis/hooks/plugins/scatterplot';

import { Override } from '../../../types/utility';
import { useCachedPromise } from '../../../hooks/cachedPromise';

const MAXALLOWEDDATAPOINTS = 100000;
const SMOOTHEDMEANTEXT = 'Smoothed mean';
const SMOOTHEDMEANSUFFIX = `, ${SMOOTHEDMEANTEXT}`;
const CI95TEXT = '95% Confidence interval';
const CI95SUFFIX = `, ${CI95TEXT}`;
const BESTFITTEXT = 'Best fit';
const BESTFITSUFFIX = `, ${BESTFITTEXT}`;

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

// slider settings
const markerBodyOpacityContainerStyles = {
  height: '4em',
  width: '20em',
  marginLeft: '1em',
  marginBottom: '0.5em',
};

// define ScatterPlotDataWithCoverage and export
export interface ScatterPlotDataWithCoverage extends CoverageStatistics {
  dataSetProcess: ScatterPlotData | FacetedData<ScatterPlotData>;
  // change these types to be compatible with new axis range
  xMin: number | string | undefined;
  xMinPos: number | string | undefined;
  xMax: number | string | undefined;
  yMin: number | string | undefined;
  yMinPos: number | string | undefined;
  yMax: number | string | undefined;
  overlayValueToColorMapper: ((a: number) => string) | undefined;
  // add computedVariableMetadata for computation apps such as alphadiv and abundance
  computedVariableMetadata?: VariableMapping[];
}

// define ScatterPlotDataResponse
type ScatterPlotDataResponse = ScatterplotResponse;

// define dataSetProcess type used in the processInputData()
// Note that the dataSetProcess here is different from the one used in the outside of the processInputData()
// using pre-existing ScatterPlotDataSeries to override
type DataSetProcessType = Override<
  ScatterPlotDataSeries,
  {
    x: (number | string)[] | null[];
    y: (number | string)[] | null[];
    marker?: {
      color?: string | string[];
      size?: number | number[];
      symbol?: string;
      line?: {
        color?: string | string[];
        width?: number;
      };
    };
    type?: string;
    r2?: number | null;
    pointIds?: string[];
  }
>;

export const scatterplotVisualization = createVisualizationPlugin({
  selectorIcon: ScatterSVG,
  fullscreenComponent: ScatterplotViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): ScatterplotConfig {
  return {
    valueSpecConfig: 'Raw',
    independentAxisLogScale: false,
    dependentAxisLogScale: false,
    independentAxisValueSpec: 'Full',
    dependentAxisValueSpec: 'Full',
    markerBodyOpacity: 0.5,
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
  // for vizconfig.checkedLegendItems
  checkedLegendItems: t.array(t.string),
  // axis range control
  independentAxisRange: NumberOrDateRange,
  dependentAxisRange: NumberOrDateRange,
  independentAxisLogScale: t.boolean,
  dependentAxisLogScale: t.boolean,
  independentAxisValueSpec: t.string,
  dependentAxisValueSpec: t.string,
  markerBodyOpacity: t.number,
});

interface Options
  extends LayoutOptions,
    TitleOptions,
    OverlayOptions,
    RequestOptions<
      ScatterplotConfig,
      FloatingScatterplotExtraProps,
      ScatterplotRequestParams
    > {
  getComputedXAxisDetails?(
    config: unknown
  ): ComputedVariableDetails | undefined;
  getComputedYAxisDetails?(
    config: unknown
  ): ComputedVariableDetails | undefined;
  getComputedOverlayVariable?(
    config: unknown
  ): VariableDescriptor | VariableCollectionDescriptor | undefined;
  hideTrendlines?: boolean;
  hideLogScale?: boolean;
  returnPointIds?: boolean; // Determines whether the backend should return the ids of each point in the scatterplot
}

function ScatterplotViz(props: VisualizationProps<Options>) {
  const {
    options,
    computation,
    copmutationAppOverview,
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
    computeJobStatus,
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
    ScatterplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const [
    computedXAxisDetails,
    computedYAxisDetails,
    computedOverlayVariableDescriptor,
    providedOverlayVariableDescriptor,
  ] = useMemo(
    () => [
      options?.getComputedXAxisDetails?.(computation.descriptor.configuration),
      options?.getComputedYAxisDetails?.(computation.descriptor.configuration),
      options?.getComputedOverlayVariable?.(
        computation.descriptor.configuration
      ),
      options?.getOverlayVariable?.(computation.descriptor.configuration),
    ],
    [computation.descriptor.configuration, options]
  );

  // Create variable descriptors for computed variables, if there are any. These descriptors help the computed vars act
  // just like native vars (for example, in the variable coverage table).
  const computedXAxisDescriptor = computedXAxisDetails
    ? {
        entityId: computedXAxisDetails.entityId,
        variableId:
          computedXAxisDetails.variableId ?? '__NO_COMPUTED_VARIABLE_ID__', // for type safety, unlikely to be user-facing
      }
    : null;

  // When we only have a computed y axis (and no provided overlay) then the y axis var
  // can have a "normal" variable descriptor. See abundance app for the funny case of handeling a computed overlay.
  const computedYAxisDescriptor = computedYAxisDetails
    ? {
        entityId: computedYAxisDetails.entityId,
        variableId:
          computedYAxisDetails.variableId ?? '__NO_COMPUTED_VARIABLE_ID__', // for type safety, unlikely to be user-facing
      }
    : null;

  const selectedVariables = useDeepValue({
    xAxisVariable: vizConfig.xAxisVariable,
    yAxisVariable: vizConfig.yAxisVariable,
    overlayVariable: vizConfig.overlayVariable,
    facetVariable: vizConfig.facetVariable,
  });

  // variablesForConstraints includes selected vars, computed vars, and
  // those collection vars that we want to use in constraining the available
  // variables within a viz. Computed overlay was left out intentionally to retain
  // desired behavior (see PR #38).
  const variablesForConstraints = useDeepValue({
    xAxisVariable: computedXAxisDescriptor ?? vizConfig.xAxisVariable,
    yAxisVariable: computedYAxisDescriptor ?? vizConfig.yAxisVariable,
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
    (options?.getOverlayType?.() === 'continuous'
      ? SequentialGradientColorscale
      : ColorPaletteDefault);
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

  // set the state of truncation warning message
  const [truncatedIndependentAxisWarning, setTruncatedIndependentAxisWarning] =
    useState<string>('');
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      // check xAxisVariable is changed
      const keepIndependentAxisSettings = isEqual(
        selectedVariables.xAxisVariable,
        vizConfig.xAxisVariable
      );
      const keepDependentAxisSettings = isEqual(
        selectedVariables.yAxisVariable,
        vizConfig.yAxisVariable
      );

      const { xAxisVariable, yAxisVariable, overlayVariable, facetVariable } =
        selectedVariables;
      updateVizConfig({
        xAxisVariable,
        yAxisVariable,
        overlayVariable,
        facetVariable,
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig:
          findEntityAndVariable(yAxisVariable)?.variable.type === 'date' ||
          findEntityAndVariable(overlayVariable)?.variable.type === 'number' ||
          findEntityAndVariable(overlayVariable)?.variable.type === 'integer'
            ? 'Raw'
            : vizConfig.valueSpecConfig,
        // set undefined for variable change
        checkedLegendItems: undefined,
        independentAxisRange: keepIndependentAxisSettings
          ? vizConfig.independentAxisRange
          : undefined,
        dependentAxisRange: keepDependentAxisSettings
          ? vizConfig.dependentAxisRange
          : undefined,
        independentAxisLogScale: keepIndependentAxisSettings
          ? vizConfig.independentAxisLogScale
          : false,
        dependentAxisLogScale: keepDependentAxisSettings
          ? vizConfig.dependentAxisLogScale
          : undefined,
        independentAxisValueSpec: keepIndependentAxisSettings
          ? vizConfig.independentAxisValueSpec
          : 'Full',
        dependentAxisValueSpec: keepDependentAxisSettings
          ? vizConfig.dependentAxisValueSpec
          : 'Full',
      });
      // close truncation warnings here
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.valueSpecConfig,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
      updateVizConfig,
      findEntityAndVariable,
    ]
  );

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof ScatterplotConfig,
      resetCheckedLegendItems?: boolean,
      resetAxisLogScale?: boolean,
      resetValueSpecConfig?: boolean,
      resetIndependentAxisRanges?: boolean,
      resetDependentAxisRanges?: boolean,
      ) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
        ...(resetAxisLogScale ? { independentAxisLogScale: false, dependentAxisLogScale: false } : {}),
        ...(resetValueSpecConfig ? { valueSpecConfig: 'Raw' } : {}),
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
    false, // reset both axisLogScale to false if true
    false,
    true,
    true
  );

  const onIndependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'independentAxisValueSpec',
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
    true
  );

  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true,
    false,
    true,
    true
  );

  const onIndependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'independentAxisLogScale',
    true,
    false,
    false, // reset valueSpec to Raw if true
    true,
    false
  );

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale',
    true,
    false,
    false, // reset valueSpec to Raw if true
    false,
    true
  );

  const onMarkerBodyOpacityChange = onChangeHandlerFactory<number>(
    'markerBodyOpacity',
    false,
    false,
    false, // reset valueSpec to Raw if true
    false,
    false
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useOutputEntity(
    dataElementDependencyOrder,
    selectedVariables,
    'yAxisVariable',
    computedYAxisDetails?.entityId
  );

  // set a condition to show log scale/plot mode related banner
  const showLogScaleBanner: boolean =
    vizConfig.valueSpecConfig !== 'Raw' &&
    (vizConfig.independentAxisLogScale || vizConfig.dependentAxisLogScale)
      ? true
      : false;

  // set a condition to show Banner for continuous overlayVariable if plot option is not 'Raw'
  const showContinousOverlayBanner: boolean =
    overlayVariable != null &&
    overlayVariable.dataShape === 'continuous' &&
    (vizConfig.valueSpecConfig === 'Smoothed mean with raw' ||
      vizConfig.valueSpecConfig === 'Best fit line with raw');

  const overlayMin: number | undefined =
    overlayVariable?.type === 'number' || overlayVariable?.type === 'integer'
      ? overlayVariable?.distributionDefaults?.rangeMin
      : 0;
  const overlayMax: number | undefined =
    overlayVariable?.type === 'number' || overlayVariable?.type === 'integer'
      ? overlayVariable?.distributionDefaults?.rangeMax
      : 0;

  const inputsForValidation = useMemo(
    (): InputSpec[] => [
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
        label: 'Overlay',
      },
      {
        name: 'facetVariable',
        label: 'Facet',
      },
    ],
    []
  );

  const dataRequestDeps =
    // If this scatterplot has a computed variable and the compute job is anything but complete, do not proceed with getting data.
    (computedYAxisDetails && computeJobStatus !== 'complete') ||
    // the usual conditions for not showing a plot:
    filteredCounts.pending ||
    filteredCounts.value == null ||
    showLogScaleBanner ||
    showContinousOverlayBanner ||
    // check for required variables when not a compute
    (computedXAxisDetails == null &&
      (vizConfig.xAxisVariable == null || xAxisVariable == null)) ||
    (computedYAxisDetails == null &&
      (vizConfig.yAxisVariable == null || yAxisVariable == null))
      ? undefined
      : {
          vizConfig: omit(
            // same as additional dependencies to useUpdateThumbnailEffect
            vizConfig,
            [
              'checkedLegendItems',
              'independentAxisRange',
              'dependentAxisRange',
              'independentAxisLogScale',
              'dependentAxisLogScale',
              'independentAxisValueSpec',
              'dependentAxisValueSpec',
              'markerBodyOpacity',
            ]
          ),
          filteredCounts: filteredCounts.value,
          providedOverlayVariable,
          computationDescriptor: computation.descriptor,
          hideTrendlines: options?.hideTrendlines,
          overlayMin,
          overlayMax,
          computedOverlayVariableDescriptor,
        };

  const data = useCachedPromise(
    async (): Promise<ScatterPlotDataWithCoverage | undefined> => {
      if (!dataRequestDeps) throw new Error('dataRequestDeps is undefined');

      const {
        vizConfig,
        filteredCounts,
        providedOverlayVariable,
        computationDescriptor,
        hideTrendlines,
        overlayMin,
        overlayMax,
        computedOverlayVariableDescriptor,
      } = dataRequestDeps;

      if (
        !variablesAreUnique([
          xAxisVariable,
          yAxisVariable,
          overlayVariable && (providedOverlayVariable ?? overlayVariable),
          facetVariable,
        ])
      )
        throw new Error(nonUniqueWarning);

      assertValidInputVariables(
        inputsForValidation,
        variablesForConstraints,
        entities,
        dataElementConstraints,
        dataElementDependencyOrder
      );

      if (outputEntity == null) throw new Error('outputEntity is undefined');

      // Convert valueSpecConfig to valueSpecValue for the data client request.
      let valueSpecValue: ScatterplotRequestParams['config']['valueSpec'] =
        'raw';
      if (vizConfig.valueSpecConfig === 'Smoothed mean with raw') {
        valueSpecValue = 'smoothedMeanWithRaw';
      } else if (vizConfig.valueSpecConfig === 'Best fit line with raw') {
        valueSpecValue = 'bestFitLineWithRaw';
      }

      // request params
      const params = options?.getRequestParams?.({
        studyId,
        filters,
        outputEntityId: outputEntity.id,
        vizConfig,
        valueSpec: hideTrendlines ? undefined : valueSpecValue,
      }) ?? {
        studyId,
        filters,
        config: {
          outputEntityId: outputEntity.id,
          valueSpec: hideTrendlines ? undefined : valueSpecValue,
          xAxisVariable: vizConfig.xAxisVariable,
          yAxisVariable: vizConfig.yAxisVariable,
          overlayVariable: vizConfig.overlayVariable,
          facetVariable: vizConfig.facetVariable
            ? [vizConfig.facetVariable]
            : undefined,
          showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
          returnPointIds: options?.returnPointIds ?? true,
        },
        computeConfig: copmutationAppOverview.computeName
          ? computationDescriptor.configuration
          : undefined,
      };

      const response = await dataClient.getVisualizationData(
        computationDescriptor.type,
        visualization.descriptor.type,
        params,
        ScatterplotResponse
      );

      const showMissingOverlay =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          overlayEntity,
          overlayVariable,
          outputEntity,
          filteredCounts,
          response.completeCasesTable
        );
      const showMissingFacet =
        vizConfig.showMissingness &&
        hasIncompleteCases(
          facetEntity,
          facetVariable,
          outputEntity,
          filteredCounts,
          response.completeCasesTable
        );

      const overlayValueToColorMapper: ((a: number) => string) | undefined =
        response.scatterplot.data.every(
          (series) => 'seriesGradientColorscale' in series
        ) &&
        (overlayVariable?.type === 'integer' ||
          overlayVariable?.type === 'number')
          ? getValueToGradientColorMapper(overlayMin, overlayMax)
          : undefined;

      const overlayVocabulary = computedOverlayVariableDescriptor
        ? response.scatterplot.config.variables.find(
            (v) => v.plotReference === 'overlay' && v.vocabulary != null
          )?.vocabulary
        : // TO DO: remove the categorical condition when https://github.com/VEuPathDB/EdaNewIssues/issues/642 is sorted
          (overlayVariable && options?.getOverlayType?.() === 'categorical'
            ? options?.getOverlayVocabulary?.()
            : undefined) ??
          fixLabelsForNumberVariables(
            overlayVariable?.vocabulary,
            overlayVariable
          );

      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      const returnData = scatterplotResponseToData(
        response,
        showMissingOverlay,
        overlayVocabulary,
        overlayVariable,
        overlayValueToColorMapper,
        showMissingFacet,
        facetVocabulary,
        facetVariable,
        computationDescriptor.type,
        entities,
        colorPaletteOverride
      );

      return {
        ...returnData,
        overlayValueToColorMapper,
      };
    },
    [dataRequestDeps],
    60 * 1000 // 60 seconds cache time
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // use hook
  const defaultIndependentAxisRange = useDefaultAxisRange(
    xAxisVariable ??
      data?.value?.computedVariableMetadata?.find(
        (v) => v.plotReference === 'xAxis'
      ),
    data.value?.xMin,
    data.value?.xMinPos,
    data.value?.xMax,
    vizConfig.independentAxisLogScale,
    vizConfig.independentAxisValueSpec
  );

  // use custom hook
  const defaultDependentAxisRange = useDefaultAxisRange(
    yAxisVariable ??
      data?.value?.computedVariableMetadata?.find(
        (v) => v.plotReference === 'yAxis'
      ),
    data.value?.yMin,
    data.value?.yMinPos,
    data.value?.yMax,
    vizConfig.dependentAxisLogScale,
    vizConfig.dependentAxisValueSpec
  );

  // yMinMaxDataRange will be used for truncation to judge whether data has negative value
  const xMinMaxDataRange = useMemo(
    () =>
      data.value != null
        ? ({ min: data.value.xMin, max: data.value?.xMax } as NumberOrDateRange)
        : undefined,
    [data]
  );
  const yMinMaxDataRange = useMemo(
    () =>
      data.value != null
        ? ({ min: data.value.yMin, max: data.value?.yMax } as NumberOrDateRange)
        : undefined,
    [data]
  );

  const { url } = useRouteMatch();

  const legendTitle = useMemo(() => {
    if (computedOverlayVariableDescriptor) {
      return getTreeNode(
        findEntityAndDynamicData(
          entities,
          isVariableDescriptor(computedOverlayVariableDescriptor) ||
            isVariableCollectionDescriptor(computedOverlayVariableDescriptor)
            ? computedOverlayVariableDescriptor
            : undefined
        )
      )?.displayName;
    }
    return variableDisplayWithUnit(overlayVariable);
  }, [entities, overlayVariable, computedOverlayVariableDescriptor]);

  // gradient colorscale legend
  const gradientLegendProps: PlotLegendGradientProps | undefined =
    useMemo(() => {
      if (
        overlayMax != null &&
        overlayMin != null &&
        data.value?.overlayValueToColorMapper != null
      ) {
        return {
          legendMax: overlayMax,
          legendMin: overlayMin,
          valueToColorMapper: data.value?.overlayValueToColorMapper,
          // MUST be odd! Probably should be a clever function of the box size
          // and font or something...
          nTicks: 5,
          showMissingness: vizConfig.showMissingness,
          legendTitle,
        };
      } else {
        return undefined;
      }
    }, [data, vizConfig.showMissingness, legendTitle, overlayMin, overlayMax]);

  // custom legend list
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const palette = neutralPaletteProps.colorPalette ?? ColorPaletteDefault;

    const allData = data.value?.dataSetProcess;

    /**
     * It was found for some faceted data involving Smoothed mean and or Best fit option,
     * each facet does not always have full Smoothed mean and/or Best fit info
     * thus, uniqBy is introduced to find a full list of legend items
     * However, using uniqBy for faceted data does not always guarantee that the Smoothed mean, CI, or Best fit items are correctly ordered
     * for this reason, a new array of objects that is partially sorted is made in the following
     * this may need a revisit in the future for overall improvement/rescheme
     */

    const legendData = !isFaceted(allData)
      ? allData?.series
      : uniqBy(
          allData.facets
            .flatMap((facet) => facet?.data?.series)
            .filter(
              (element): element is ScatterPlotDataSeries => element != null
            ),
          'name'
        );

    // logic for setting markerColor correctly
    // find raw legend label (excluding No data as well)
    const legendLabel =
      legendData != null
        ? legendData
            .filter(
              (data) =>
                !data?.name?.includes(SMOOTHEDMEANSUFFIX) &&
                !data?.name?.includes(CI95SUFFIX) &&
                !data?.name?.includes(BESTFITSUFFIX) &&
                !data?.name?.includes('No data')
            )
            .map((data) => data.name)
        : [];

    // construct a kind of a lookup table
    const legendLabelColor = legendLabel?.map((label, index) => {
      return {
        label: label,
        color: palette[index],
      };
    });

    // find the number Raw legend items considering No data case
    const numberLegendRawItems = vizConfig.showMissingness
      ? legendLabel.length + 1
      : legendLabel.length;

    // count will be used for Smoothed mean option as it consists of a pair of smoothed mean and CI per vocabulary
    let count = 0;

    // new array of objects based on legendData array (a kind of partial sort)
    // raw data is in the correct order, but not always for smoothed mean, CI, and Best fit
    // e.g., showing 'data1' (raw), 'data2' (raw), 'data2, Best fit', 'data1, Best fit' in order
    // needed to have complex conditions for treating Smoothed mean, CI, Best fit, No data, etc.
    const sortedLegendData =
      isFaceted(allData) && vizConfig.valueSpecConfig !== 'Raw'
        ? legendData
            ?.flatMap((dataItem, index) => {
              if (index < numberLegendRawItems) {
                // Raw data is ordered correctly
                return dataItem;
              } else if (
                vizConfig.valueSpecConfig === 'Best fit line with raw'
              ) {
                // Best fit
                return legendData.filter((element) => {
                  // checking No data case
                  if (vizConfig.showMissingness) {
                    if (index < legendData.length - 1) {
                      return element.name?.includes(
                        legendLabel[index - numberLegendRawItems] +
                          BESTFITSUFFIX
                      );
                    } else {
                      // No data case
                      return element.name?.includes('No data' + BESTFITSUFFIX);
                    }
                  } else {
                    return element.name?.includes(
                      legendLabel[index - numberLegendRawItems] + BESTFITSUFFIX
                    );
                  }
                });
                // Smoothed mean and CI
              } else if (
                vizConfig.valueSpecConfig === 'Smoothed mean with raw'
              ) {
                if (
                  vizConfig.showMissingness == null ||
                  !vizConfig.showMissingness
                ) {
                  if (dataItem?.name?.includes(SMOOTHEDMEANSUFFIX)) {
                    return legendData.filter((element) => {
                      return element.name?.includes(
                        legendLabel[index - (numberLegendRawItems + count)] +
                          SMOOTHEDMEANSUFFIX
                      );
                    });
                  } else if (dataItem?.name?.includes(CI95SUFFIX)) {
                    // increase count here
                    ++count;
                    return legendData.filter((element) => {
                      return element.name?.includes(
                        legendLabel[index - (numberLegendRawItems + count)] +
                          CI95SUFFIX
                      );
                    });
                  }
                  // the case No data exists
                } else {
                  if (dataItem?.name?.includes(SMOOTHEDMEANSUFFIX)) {
                    if (index < legendData.length - 2) {
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          legendLabel[index - (numberLegendRawItems + count)] +
                            SMOOTHEDMEANSUFFIX
                        );
                      });
                    } else {
                      // No data case
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          'No data' + SMOOTHEDMEANSUFFIX
                        );
                      });
                    }
                  } else if (dataItem?.name?.includes(CI95SUFFIX)) {
                    // increase count here
                    ++count;
                    if (index < legendData.length - 2) {
                      return legendData.filter((element) => {
                        return element.name?.includes(
                          legendLabel[index - (numberLegendRawItems + count)] +
                            CI95SUFFIX
                        );
                      });
                    } else {
                      return legendData.filter((element) => {
                        return element.name?.includes('No data' + CI95SUFFIX);
                      });
                    }
                  }
                }
              }
              return [];
              // observed No data is often undefined during data loading by toggling showMissingness for large scatter data/graphics
            })
            .filter((element) => element != null)
        : legendData;

    return sortedLegendData != null
      ? // the name 'dataItem' is used inside the map() to distinguish from the global 'data' variable
        sortedLegendData.map(
          (dataItem: ScatterPlotDataSeries, index: number) => {
            return {
              label: dataItem.name ?? '',
              // making marker info appropriately
              marker:
                dataItem.mode != null
                  ? dataItem.name === 'No data'
                    ? 'x'
                    : dataItem.mode === 'markers'
                    ? 'circle'
                    : dataItem.mode === 'lines'
                    ? 'line'
                    : ''
                  : dataItem?.fill === 'tozeroy'
                  ? 'fainted'
                  : '',
              // set marker colors appropriately
              markerColor:
                dataItem.name != null &&
                (dataItem?.name === 'No data' ||
                  dataItem.name?.includes('No data,'))
                  ? '#A6A6A6'
                  : // if there is no overlay variable, then marker colors should be the same for Data, Smoothed mean, 95% CI, and Best fit
                  // with another apps like alphadiv, abundance, etc., this condition needs to be changed: check with data more
                  computedOverlayVariableDescriptor != null ||
                    vizConfig.overlayVariable != null
                  ? dataItem.name != null
                    ? legendLabelColor
                        ?.map((legend) => {
                          // fixed bug and simplified
                          if (
                            dataItem.name != null &&
                            legend.label != null &&
                            (dataItem.name === legend.label ||
                              dataItem.name ===
                                legend.label + SMOOTHEDMEANSUFFIX ||
                              dataItem.name === legend.label + CI95SUFFIX ||
                              dataItem.name === legend.label + BESTFITSUFFIX)
                          )
                            return legend.color;
                          else return '';
                        })
                        .filter((n: string) => n !== '')
                        .toString()
                    : '#ffffff' // just set not to be empty
                  : palette[0], // set first color for no overlay variable selected
              // simplifying the check with the presence of data: be carefule of y:[null] case in Scatter plot
              hasData: !isFaceted(allData)
                ? dataItem.y != null &&
                  dataItem.y.length > 0 &&
                  dataItem.y[0] !== null
                  ? true
                  : false
                : allData.facets
                    .map((facet) => facet.data)
                    .filter((data): data is ScatterPlotData => data != null)
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
          }
        )
      : [];
  }, [
    neutralPaletteProps.colorPalette,
    data.value?.dataSetProcess,
    vizConfig.showMissingness,
    vizConfig.valueSpecConfig,
    vizConfig.overlayVariable,
    computedOverlayVariableDescriptor,
  ]);

  // set checkedLegendItems to either the config-stored items, or all items if
  // nothing stored
  const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
    legendItems,
    vizConfig.overlayVariable
      ? options?.getCheckedLegendItems?.(
          computation.descriptor.configuration
        ) ?? vizConfig.checkedLegendItems
      : vizConfig.checkedLegendItems,
    updateVizConfig
  );

  const independentAxisLabel = getVariableLabel(
    'xAxis',
    data.value?.computedVariableMetadata,
    entities,
    'X-axis'
  );

  // If we're to use a computed variable but no variableId is given for the computed variable,
  // simply use the placeholder display name given by the app.
  // Otherwise, create the dependend axis label as usual.
  const dependentAxisLabel =
    computedYAxisDetails?.placeholderDisplayName &&
    !computedYAxisDetails?.variableId
      ? computedYAxisDetails.placeholderDisplayName
      : getVariableLabel(
          'yAxis',
          data.value?.computedVariableMetadata,
          entities,
          'Y-axis'
        );

  // dataWithoutSmoothedMean returns array of data that does not have smoothed mean
  // Thus, if dataWithoutSmoothedMean.length > 0, then there is at least one data without smoothed mean
  const dataWithoutSmoothedMean = useMemo(
    () =>
      !isFaceted(data?.value?.dataSetProcess)
        ? data?.value?.dataSetProcess.series.filter(
            (data) => data.hasSmoothedMeanData === false
          )
        : data?.value?.dataSetProcess.facets
            .map((facet) => facet.data)
            .filter((data) => data != null)
            .flatMap((data) =>
              data?.series.filter(
                (series) => series.hasSmoothedMeanData === false
              )
            ),
    [data]
  );

  // List variables in a collection one by one in the variable coverage table. Create these extra rows
  // here and then append to the variable coverage table rows array.
  const collectionVariableMetadata = data.value?.computedVariableMetadata?.find(
    (v) => v.plotReference === 'overlay'
  );
  const collectionVariableEntityId =
    collectionVariableMetadata?.variableSpec.entityId;
  const additionalVariableCoverageTableRows =
    collectionVariableEntityId && collectionVariableMetadata?.vocabulary
      ? collectionVariableMetadata.vocabulary.map((label) => ({
          role: '',
          required: true,
          display: fixVarIdLabel(label, collectionVariableEntityId, entities),
          variable: { variableId: label, entityId: collectionVariableEntityId },
        }))
      : [];

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    finalPlotContainerStyles,
    [
      data,
      vizConfig.checkedLegendItems,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
      vizConfig.markerBodyOpacity,
    ]
  );

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
          // truncation overrides for the axis minima for log scale
          // only pass key/values that you want overridden
          // (e.g. false values will override just as much as true)
          ...(vizConfig.independentAxisLogScale &&
          xMinMaxDataRange?.min != null &&
          (xMinMaxDataRange.min as number) <= 0
            ? { truncationConfigIndependentAxisMin: true }
            : {}),
          ...(vizConfig.dependentAxisLogScale &&
          yMinMaxDataRange?.min != null &&
          (yMinMaxDataRange.min as number) <= 0
            ? { truncationConfigDependentAxisMin: true }
            : {}),
        }
      ),
    [xMinMaxDataRange, yMinMaxDataRange, vizConfig]
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

  const scatterplotProps: ScatterPlotProps = {
    interactive: !isFaceted(data.value?.dataSetProcess) ? true : false,
    showSpinner: filteredCounts.pending || data.pending,
    showExportButton: true,
    independentAxisLabel: independentAxisLabel,
    dependentAxisLabel: dependentAxisLabel,
    displayLegend: false,
    independentValueType:
      xAxisVariable == null || NumberVariable.is(xAxisVariable)
        ? 'number'
        : 'date',
    // alphadiv and abundance: simply setting yAxisVariable == null would work
    dependentValueType:
      NumberVariable.is(yAxisVariable) || yAxisVariable == null
        ? 'number'
        : 'date',
    displayLibraryControls: false,
    independentAxisLogScale: vizConfig.independentAxisLogScale,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    independentAxisRange:
      vizConfig.independentAxisRange ?? defaultIndependentAxisRange,
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
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
    containerStyles: !isFaceted(data.value?.dataSetProcess)
      ? finalPlotContainerStyles
      : undefined,
    spacingOptions: !isFaceted(data.value?.dataSetProcess)
      ? plotSpacingOptions
      : undefined,
    // need to define markerColorOpacity for faceted plot
    markerBodyOpacity: vizConfig.markerBodyOpacity ?? 0.5,
    // ...neutralPaletteProps, // no-op. we have to handle colours here.
  };

  const plotNode = (
    <>
      {isFaceted(data.value?.dataSetProcess) ? (
        <FacetedScatterPlot
          data={data.value?.dataSetProcess}
          componentProps={scatterplotProps}
          modalComponentProps={{
            ...scatterplotProps,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <ScatterPlot
          {...scatterplotProps}
          ref={plotRef}
          data={data.value?.dataSetProcess}
          checkedLegendItems={checkedLegendItems}
          markerBodyOpacity={vizConfig.markerBodyOpacity ?? 0.5}
        />
      )}
    </>
  );

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
      dependentAxisValueSpec: 'Full',
    });
    // add reset for truncation message as well
    setTruncatedDependentAxisWarning('');
  }, [updateVizConfig, setTruncatedDependentAxisWarning]);

  const [
    dismissedIndependentAllNegativeWarning,
    setDismissedIndependentAllNegativeWarning,
  ] = useState<boolean>(false);
  const independentAllNegative =
    vizConfig.independentAxisLogScale &&
    xMinMaxDataRange?.max != null &&
    (xMinMaxDataRange.max as number) < 0;

  const [
    dismissedDependentAllNegativeWarning,
    setDismissedDependentAllNegativeWarning,
  ] = useState<boolean>(false);
  const dependentAllNegative =
    vizConfig.dependentAxisLogScale &&
    yMinMaxDataRange?.max != null &&
    (yMinMaxDataRange.max as number) < 0;

  // add showBanner prop in this Viz
  const [showBanner, setShowBanner] = useState(true);

  const controlsNode = (
    <>
      {/* pre-occupied space for banner:  1 line = 2.5em */}
      {/* <div style={{ width: 750, marginLeft: '1em', minHeight: '2.5em' }}> */}
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
        {/* show Banner message if no smoothed mean exists */}
        {!data.pending &&
          vizConfig.valueSpecConfig === 'Smoothed mean with raw' &&
          dataWithoutSmoothedMean != null &&
          dataWithoutSmoothedMean?.length > 0 && (
            <div>
              <Banner
                banner={{
                  type: 'warning',
                  message:
                    'Smoothed mean(s) were not calculated for one or more data series.',
                  pinned: true,
                  intense: false,
                  // additionalMessage is shown next to message when clicking showMoreLinkText.
                  // disappears when clicking showLess link
                  // note that this additionalMessage prop is used to determine show more/less behavior or not
                  // if undefined, then just show normal banner with message
                  additionalMessage:
                    'The sample size might be too small or the data too skewed.',
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
                  showBanner: showBanner,
                  setShowBanner: setShowBanner,
                }}
              />
            </div>
          )}

        {/* show Banner for continuous overlayVariable if plot option is not 'Raw' */}
        {!data.pending && showContinousOverlayBanner && (
          <div>
            <Banner
              banner={{
                type: 'warning',
                message:
                  'Plot modes with fitted lines are not available when continuous overlay variables are selected.',
                pinned: true,
                intense: false,
                // additionalMessage is shown next to message when clicking showMoreLinkText.
                // disappears when clicking showLess link
                // note that this additionalMessage prop is used to determine show more/less behavior or not
                // if undefined, then just show normal banner with message
                additionalMessage:
                  'Continuous overlay variable values are not binned.',
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
                showBanner: showBanner,
                setShowBanner: setShowBanner,
              }}
            />
          </div>
        )}

        {/* show log scale related Banner message unless plot mode of 'Raw' */}
        {showLogScaleBanner && (
          // <div style={{ width: 750, marginLeft: '1em', height: '2.8em' }}>
          <div>
            <Banner
              banner={{
                type: 'warning',
                message:
                  'Log scale is not available for plot modes with fitted lines.',
                pinned: true,
                intense: false,
                // additionalMessage is shown next to message when clicking showMoreLinkText.
                // disappears when clicking showLess link
                // note that this additionalMessage prop is used to determine show more/less behavior or not
                // if undefined, then just show normal banner with message
                additionalMessage:
                  'Lines fitted to non-log transformed raw data cannot be accurately plotted on log scale axes.',
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
                showBanner: showBanner,
                setShowBanner: setShowBanner,
              }}
            />
          </div>
        )}
      </div>

      {!options?.hideTrendlines && (
        // use RadioButtonGroup directly instead of ScatterPlotControls
        <RadioButtonGroup
          label="Plot mode"
          options={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
          selectedOption={vizConfig.valueSpecConfig ?? 'Raw'}
          onOptionSelected={(newValue: string) => {
            onValueSpecChange(newValue);
            // to reuse Banner
            setShowBanner(true);
          }}
          // disabledList prop is used to disable radio options (grayed out)
          disabledList={
            yAxisVariable?.type === 'date'
              ? ['Smoothed mean with raw', 'Best fit line with raw']
              : []
          }
          orientation={'horizontal'}
          labelPlacement={'end'}
          buttonColor={'primary'}
          margins={['0em', '0', '0', '1em']}
          itemMarginRight={50}
        />
      )}

      {/* make a plot slide after plot mode for now */}
      <SliderWidget
        minimum={0}
        maximum={1}
        step={0.1}
        value={vizConfig.markerBodyOpacity ?? 0.5}
        debounceRateMs={250}
        onChange={(newValue: number) => {
          onMarkerBodyOpacityChange(newValue);
        }}
        containerStyles={markerBodyOpacityContainerStyles}
        showLimits={true}
        label={'Marker opacity'}
        colorSpec={plotsSliderOpacityGradientColorSpec}
      />

      {/* axis range control UIs */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* make switch and radiobutton single line with space
                 also marginRight at LabelledGroup is set to 0.5625em: default - 1.5625em*/}
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
                  disabled={false}
                  onPress={handleIndependentAxisSettingsReset}
                />
              </div>
            }
          >
            {!options?.hideLogScale && (
              <div
                style={{
                  marginBottom: '0.8em',
                }}
              >
                <Toggle
                  label={`Log scale ${
                    vizConfig.independentAxisLogScale
                      ? 'on (excludes values \u{2264} 0)'
                      : 'off'
                  }`}
                  value={vizConfig.independentAxisLogScale ?? false}
                  onChange={(newValue: boolean) => {
                    setDismissedIndependentAllNegativeWarning(false);
                    onIndependentAxisLogScaleChange(newValue);
                    // to reuse Banner
                    setShowBanner(true);
                  }}
                  // disable log scale for date variable
                  disabled={scatterplotProps.independentValueType === 'date'}
                  themeRole="primary"
                />
              </div>
            )}
            {independentAllNegative &&
            !dismissedIndependentAllNegativeWarning &&
            !options?.hideLogScale ? (
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
                containerStyles={{ maxWidth: '350px' }}
              />
            ) : null}

            <LabelledGroup
              label="X-axis range"
              containerStyles={{
                fontSize: '0.9em',
                // width: '350px',
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
              />
              <AxisRangeControl
                range={
                  vizConfig.independentAxisRange ?? defaultIndependentAxisRange
                }
                onRangeChange={handleIndependentAxisRangeChange}
                valueType={
                  scatterplotProps.independentValueType === 'date'
                    ? 'date'
                    : 'number'
                }
                // set maxWidth
                containerStyles={{ maxWidth: '350px' }}
                logScale={vizConfig.independentAxisLogScale}
                disabled={
                  vizConfig.independentAxisValueSpec === 'Full' ||
                  vizConfig.independentAxisValueSpec === 'Auto-zoom'
                }
              />
              {/* truncation notification */}
              {truncatedIndependentAxisWarning &&
              !independentAllNegative &&
              data.value != null ? (
                <Notification
                  title={''}
                  text={truncatedIndependentAxisWarning}
                  // this was defined as LIGHT_BLUE
                  color={'#5586BE'}
                  onAcknowledgement={() => {
                    setTruncatedIndependentAxisWarning('');
                  }}
                  showWarningIcon={true}
                  containerStyles={{
                    maxWidth:
                      scatterplotProps.independentValueType === 'date'
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
            height: '13.25em',
            position: 'relative',
            marginLeft: '-1px',
            top: '1.5em',
          }}
        >
          {' '}
        </div>

        {/* Y-axis controls   */}
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
            {!options?.hideLogScale && (
              <div
                style={{
                  marginBottom: '0.8em',
                }}
              >
                <Toggle
                  label={`Log scale ${
                    vizConfig.dependentAxisLogScale
                      ? 'on (excludes values \u{2264} 0)'
                      : 'off'
                  }`}
                  value={vizConfig.dependentAxisLogScale ?? false}
                  onChange={(newValue: boolean) => {
                    setDismissedDependentAllNegativeWarning(false);
                    onDependentAxisLogScaleChange(newValue);
                    // to reuse Banner
                    setShowBanner(true);
                  }}
                  // disable log scale for date variable
                  disabled={scatterplotProps.dependentValueType === 'date'}
                  themeRole="primary"
                />
              </div>
            )}
            {dependentAllNegative &&
            !dismissedDependentAllNegativeWarning &&
            !options?.hideLogScale ? (
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
                containerStyles={{ maxWidth: '350px' }}
              />
            ) : null}

            <LabelledGroup
              label="Y-axis range"
              containerStyles={{
                fontSize: '0.9em',
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
              />
              <AxisRangeControl
                range={
                  vizConfig.dependentAxisRange ?? defaultDependentAxisRange
                }
                valueType={
                  scatterplotProps.dependentValueType === 'date'
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
              {truncatedDependentAxisWarning && !dependentAllNegative ? (
                <Notification
                  title={''}
                  text={truncatedDependentAxisWarning}
                  // this was defined as LIGHT_BLUE
                  color={'#5586BE'}
                  onAcknowledgement={() => {
                    setTruncatedDependentAxisWarning('');
                  }}
                  showWarningIcon={true}
                  containerStyles={{
                    maxWidth:
                      scatterplotProps.independentValueType === 'date'
                        ? '350px'
                        : '350px',
                  }}
                />
              ) : null}
            </LabelledGroup>
          </LabelledGroup>
        </div>
      </div>
    </>
  );

  const showOverlayLegend =
    (computedOverlayVariableDescriptor != null ||
      vizConfig.overlayVariable != null ||
      vizConfig.valueSpecConfig !== 'Raw') &&
    legendItems.length > 0;
  const legendNode =
    !data.pending &&
    data.value != null &&
    (gradientLegendProps ? (
      <PlotLegend type="colorscale" {...gradientLegendProps} />
    ) : (
      <PlotLegend
        type="list"
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        onCheckedLegendItemsChange={setCheckedLegendItems}
        legendTitle={legendTitle}
        showOverlayLegend={showOverlayLegend}
        // pass markerBodyOpacity to PlotLegend to control legend color opacity
        markerBodyOpacity={vizConfig.markerBodyOpacity}
      />
    ));

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
        stratificationIsActive={
          overlayVariable != null || computedOverlayVariableDescriptor != null
        }
        enableSpinner={
          xAxisVariable != null && yAxisVariable != null && !data.error
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
            display: independentAxisLabel,
            variable: computedXAxisDescriptor ?? vizConfig.xAxisVariable,
          },
          {
            role: 'Y-axis',
            required: isVariableDescriptor(computedOverlayVariableDescriptor)
              ? !computedOverlayVariableDescriptor?.variableId
              : isVariableCollectionDescriptor(
                  computedOverlayVariableDescriptor
                )
              ? !computedOverlayVariableDescriptor?.collectionId
              : false,
            display: dependentAxisLabel,
            variable:
              !computedOverlayVariableDescriptor && computedYAxisDescriptor
                ? computedYAxisDescriptor
                : vizConfig.yAxisVariable,
          },
          {
            role: 'Overlay',
            required: !!computedOverlayVariableDescriptor,
            display: legendTitle,
            variable:
              (isVariableDescriptor(computedOverlayVariableDescriptor) ||
                isVariableCollectionDescriptor(
                  computedOverlayVariableDescriptor
                )) &&
              computedOverlayVariableDescriptor != null
                ? computedOverlayVariableDescriptor
                : vizConfig.overlayVariable,
          },
          ...additionalVariableCoverageTableRows,
          {
            role: 'Facet',
            display: variableDisplayWithUnit(facetVariable),
            variable: vizConfig.facetVariable,
          },
        ]}
      />
      {/* R-square table component: only display when overlay and/or facet variable exist */}
      {vizConfig.valueSpecConfig === 'Best fit line with raw' &&
        data.value != null &&
        !data.pending &&
        (vizConfig.overlayVariable != null ||
          vizConfig.facetVariable != null) && (
          <ScatterplotRsquareTable
            typedData={
              !isFaceted(data.value.dataSetProcess)
                ? { isFaceted: false, data: data.value.dataSetProcess.series }
                : { isFaceted: true, data: data.value.dataSetProcess.facets }
            }
            overlayVariable={overlayVariable}
            facetVariable={facetVariable}
          />
        )}
    </>
  );

  // plot subtitle
  const plotSubtitle =
    outputSize != null
      ? options?.getPlotSubtitle?.(computation.descriptor.configuration)
      : undefined;

  const areRequiredInputsSelected = useMemo(() => {
    if (!dataElementConstraints) return false;
    return Object.entries(dataElementConstraints[0])
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!vizConfig[reqdVar[0] as keyof ScatterplotConfig]);
  }, [dataElementConstraints, vizConfig]);

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  const inputs = useMemo(
    (): InputSpec[] => [
      {
        name: 'xAxisVariable',
        label: 'X-axis',
        role: 'axis',
        readonlyValue: computedXAxisDetails ? independentAxisLabel : undefined,
      },
      {
        name: 'yAxisVariable',
        label: 'Y-axis',
        role: 'axis',
        readonlyValue: computedYAxisDetails ? dependentAxisLabel : undefined,
      },
      ...(computedOverlayVariableDescriptor
        ? [
            {
              name: 'overlayVariable',
              label: 'Overlay',
              role: 'stratification',
              readonlyValue: legendTitle,
            } as const,
          ]
        : [
            {
              name: 'overlayVariable',
              label: 'Overlay',
              role: 'stratification',
              providedOptionalVariable: providedOverlayVariableDescriptor,
              readonlyValue:
                options?.getOverlayVariable != null
                  ? providedOverlayVariableDescriptor
                    ? variableDisplayWithUnit(providedOverlayVariable)
                    : 'None. ' + (options?.getOverlayVariableHelp?.() ?? '')
                  : undefined,
            } as const,
          ]),
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
    [
      computedOverlayVariableDescriptor,
      computedXAxisDetails,
      computedYAxisDetails,
      dependentAxisLabel,
      independentAxisLabel,
      legendTitle,
      options,
      providedOverlayVariable,
      providedOverlayVariableDescriptor,
    ]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        {!hideInputsAndControls && (
          <InputVariables
            inputs={inputs}
            entities={entities}
            selectedVariables={selectedVariables}
            variablesForConstraints={variablesForConstraints}
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
            onShowMissingnessChange={
              options?.hideShowMissingnessToggle
                ? undefined
                : onShowMissingnessChange
            }
            outputEntity={outputEntity}
          />
        )}
      </div>

      <PluginError
        error={data.error}
        outputSize={outputSize}
        customCases={[
          (error) => {
            const errorMessage =
              error == null
                ? ''
                : error instanceof Error
                ? error.message
                : String(error);
            return errorMessage.match(/400.+too large/is) ? (
              <span>
                Your plot currently has too many points (&gt;
                {MAXALLOWEDDATAPOINTS.toLocaleString()}) to display in a
                reasonable time. Please either add filters in the{' '}
                <Link replace to={url.replace(/visualizations.+/, 'variables')}>
                  Browse and subset
                </Link>{' '}
                tab to reduce the number, or consider using a summary plot such
                as histogram or boxplot.
              </span>
            ) : undefined;
          },
        ]}
      />

      {!hideInputsAndControls && (
        <OutputEntityTitle
          entity={outputEntity}
          outputSize={outputSize}
          subtitle={plotSubtitle}
        />
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
 * Reformat response from Scatter Plot endpoints into complete ScatterPlotData
 * @param response
 * @returns ScatterPlotData
 */
export function scatterplotResponseToData(
  response: ScatterPlotDataResponse,
  showMissingOverlay: boolean = false,
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  overlayValueToColorMapper?: (a: number) => string,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable,
  computationType?: string,
  entities?: StudyEntity[],
  colorPaletteOverride?: string[],
  highlightedPointsDetails?: HighlightedPointsDetails
): ScatterPlotDataWithCoverage {
  const modeValue = 'markers';

  const hasMissingData =
    response.scatterplot.config.completeCasesAllVars !==
    response.scatterplot.config.completeCasesAxesVars;

  const facetGroupedResponseData = groupBy(response.scatterplot.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  // if the vocabulary is missing (e.g. for numeric variables), we can just use the keys from the
  // groupBy and hope they are in the right order (they seem to be produced in numeric order, even though the values are strings)
  const fallbackFacetVocabulary = keys(facetGroupedResponseData);

  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const { dataSetProcess, xMin, xMinPos, xMax, yMin, yMinPos, yMax } =
      processInputData(
        reorderResponseScatterplotData(
          // reorder by overlay var within each facet
          group,
          vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
          overlayVariable
        ),
        modeValue,
        response.scatterplot.config.variables.find(
          (mapping) => mapping.plotReference === 'xAxis'
        )?.dataType ?? '',
        response.scatterplot.config.variables.find(
          (mapping) => mapping.plotReference === 'yAxis'
        )?.dataType ?? '',
        showMissingOverlay,
        hasMissingData,
        overlayVariable,
        overlayValueToColorMapper,
        // pass facetVariable to determine either scatter or scattergl
        facetVariable,
        // pass computation here to add conditions for apps
        computationType,
        entities,
        colorPaletteOverride,
        highlightedPointsDetails
      );

    return {
      dataSetProcess: substituteUnselectedToken(dataSetProcess),
      xMin,
      xMinPos,
      xMax,
      yMin,
      yMinPos,
      yMax,
    };
  });

  const xMin = min(map(processedData, ({ xMin }) => xMin));
  const xMinPos = minPos(map(processedData, ({ xMinPos }) => xMinPos));
  const xMax = max(map(processedData, ({ xMax }) => xMax));
  const yMin = min(map(processedData, ({ yMin }) => yMin));
  const yMinPos = minPos(map(processedData, ({ yMinPos }) => yMinPos));
  const yMax = max(map(processedData, ({ yMax }) => yMax));

  const dataSetProcess =
    size(processedData) === 1 && head(keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        head(values(processedData))?.dataSetProcess
      : // faceted
        {
          facets: vocabularyWithMissingData(
            facetVocabulary.length ? facetVocabulary : fallbackFacetVocabulary,
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
    xMinPos,
    xMax,
    yMin,
    yMinPos,
    yMax,
    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.scatterplot.config.completeCasesAllVars,
    completeCasesAxesVars: response.scatterplot.config.completeCasesAxesVars,
    // config.computedVariableMetadata should also be returned
    computedVariableMetadata: response.scatterplot.config.variables,
  } as ScatterPlotDataWithCoverage;
}

// making plotly input data
function processInputData(
  responseScatterplotData: ScatterplotResponse['scatterplot']['data'],
  modeValue: 'markers' | 'lines' | 'lines+markers',
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  overlayVariable?: Variable,
  overlayValueToColorMapper?: (a: number) => string,
  // pass facetVariable to determine either scatter or scattergl
  facetVariable?: Variable,
  computationType?: string,
  entities?: StudyEntity[],
  colorPaletteOverride?: string[],
  highlightedPointsDetails?: HighlightedPointsDetails
) {
  // set variables for x- and yaxis ranges: no default values are set
  let xMin: number | string | undefined;
  let xMinPos: number | string | undefined;
  let xMax: number | string | undefined;

  let yMin: number | string | undefined;
  let yMinPos: number | string | undefined;
  let yMax: number | string | undefined;

  // catch the case when the back end has returned valid but completely empty data
  if (
    responseScatterplotData.every(
      (data) => data.seriesX?.length === 0 && data.seriesY?.length === 0
    )
  ) {
    return {
      dataSetProcess: { series: [] }, // BM doesn't think this should be `undefined` for empty facets - the back end doesn't return *any* data for empty facets.
      yMin: undefined,
      yMinPos: undefined,
      yMax: undefined,
      xMin: undefined,
      xMinPos: undefined,
      xMax: undefined,
    };
  }

  // function to return color or gray where needed if showMissingness == true
  const markerColor = (index: number) => {
    const palette = colorPaletteOverride ?? ColorPaletteDefault;
    if (showMissingness && index === responseScatterplotData.length - 1) {
      return gray;
    } else {
      return palette[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // using dark color: function to return color or gray where needed if showMissingness == true
  const markerColorDark = (index: number) => {
    const palette = colorPaletteOverride ?? ColorPaletteDark;
    if (showMissingness && index === responseScatterplotData.length - 1) {
      return gray;
    } else {
      return palette[index] ?? 'black'; // TO DO: decide on overflow behaviour
    }
  };

  // determine conditions for not adding empty "No data" traces
  // we want to stop at the penultimate series if showMissing is active and there is actually no missing data
  // 'break' from the for loops (array.some(...)) if this is true
  const breakAfterThisSeries = (index: number) => {
    return (
      showMissingness &&
      !hasMissingData &&
      index === responseScatterplotData.length - 2
    );
  };

  const markerSymbol = (index: number) =>
    showMissingness && index === responseScatterplotData.length - 1
      ? 'x'
      : 'circle';

  const numDataPoints = responseScatterplotData
    .map((v) => v.seriesX?.length ?? 0)
    .reduce((a, b) => a + b, 0);

  // use type: scatter for faceted plot, otherwise scattergl
  const scatterPlotType =
    facetVariable != null || numDataPoints < 1000 ? 'scatter' : 'scattergl';

  // data array to return
  let dataSetProcess: DataSetProcessType[] = [];

  // Set empty highlightTrace. Will be populated if there are any highlighted points.
  // Currently we import the defalut highlight styling, but in the future the marker styling could
  // also be passed as a prop. Highlighting is currently limited to points, though it could extend
  // similarly to lines, boxes, etc.
  let highlightTrace: any = {
    x: [],
    y: [],
    name: highlightedPointsDetails?.highlightTraceName ?? 'Highlighted Points',
    mode: 'markers',
    type: 'scattergl',
    marker:
      highlightedPointsDetails?.highlightMarkerStyleOverrides ??
      DefaultHighlightMarkerStyle,
    pointIds: [],
  };

  responseScatterplotData.some(function (
    el: ScatterplotResponse['scatterplot']['data'][number],
    index: number
  ) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // initialize gradient colorscale arrays
    let seriesGradientColorscale = [];
    let markerColorsGradient: string[] = [];
    let markerSymbolGradient: string = 'x';

    // Fix overlay variable label. If a numeric var, fix with fixLabelForNumberVariables. If the overlay variable
    // is from the abundance app, it is a var id that needs to be swapped for its display name (fixVarIdLabel)
    const fixedOverlayLabel =
      el.overlayVariableDetails &&
      (computationType === 'abundance' && entities
        ? fixVarIdLabel(
            el.overlayVariableDetails.value,
            el.overlayVariableDetails.entityId,
            entities
          )
        : fixLabelForNumberVariables(
            el.overlayVariableDetails.value,
            overlayVariable
          ));

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

      // compute x/y min/minPos/max
      if (seriesX.length) {
        xMin =
          xMin != null
            ? lte(xMin, minValue(seriesX))
              ? xMin
              : minValue(seriesX)
            : minValue(seriesX);
        xMinPos =
          xMinPos != null
            ? lte(xMinPos, minPos(seriesX))
              ? xMinPos
              : minPos(seriesX)
            : minPos(seriesX);
        xMax =
          xMax != null
            ? gte(xMax, maxValue(seriesX))
              ? xMax
              : maxValue(seriesX)
            : maxValue(seriesX);
      }

      if (seriesY.length) {
        yMin =
          yMin != null
            ? lte(yMin, minValue(seriesY))
              ? yMin
              : minValue(seriesY)
            : minValue(seriesY);
        yMinPos =
          yMinPos != null
            ? lte(yMinPos, minPos(seriesY))
              ? yMinPos
              : minPos(seriesY)
            : minPos(seriesY);
        yMax =
          yMax != null
            ? gte(yMax, maxValue(seriesY))
              ? yMax
              : maxValue(seriesY)
            : maxValue(seriesY);
      }

      // If seriesGradientColorscale column exists, need to use gradient colorscales
      if (el.seriesGradientColorscale && overlayValueToColorMapper) {
        // Assuming only allowing numbers for now - later will add dates
        seriesGradientColorscale = el.seriesGradientColorscale.map(Number);

        // If we have data, use a gradient colorscale. No data series will have all NaN values in seriesGradientColorscale
        if (
          !seriesGradientColorscale.some((element: number) =>
            Number.isNaN(element)
          )
        ) {
          markerColorsGradient = seriesGradientColorscale.map((a: number) =>
            overlayValueToColorMapper(a)
          );
          markerSymbolGradient = 'circle';
        } else {
          // Then this is the no data series. Set marker colors to gray
          markerColorsGradient = [gray];
        }
      }

      // If a point is highlighted, we have to set its y value to null, otherwise it will
      // still have a tooltip (regardless of marker size, color, etc.)
      if (
        el.pointIds &&
        highlightedPointsDetails &&
        highlightedPointsDetails.pointIds.length > 0 &&
        highlightedPointsDetails.pointIds.some((id: string) =>
          el.pointIds?.includes(id)
        )
      ) {
        seriesY.forEach((_value, index: number) => {
          if (
            el.pointIds &&
            highlightedPointsDetails.pointIds.includes(el.pointIds[index])
          ) {
            seriesY[index] = null;
          }
        });
      }

      // add scatter data considering input options
      dataSetProcess.push({
        x: seriesX.length ? seriesX : [null], // [null] hack required to make sure
        y: seriesY.length ? seriesY : [null], // Plotly has a legend entry for empty traces
        // distinguish X/Y Data from Overlay
        name: fixedOverlayLabel ?? 'Data',
        mode: modeValue,
        type: scatterPlotType, // for the raw data of the scatterplot
        marker: {
          color:
            highlightedPointsDetails &&
            highlightedPointsDetails.pointIds.length > 0
              ? DefaultNonHighlightColor
              : seriesGradientColorscale?.length > 0 &&
                markerSymbolGradient === 'circle'
              ? markerColorsGradient
              : markerColor(index),
          symbol:
            seriesGradientColorscale?.length > 0
              ? markerSymbolGradient
              : markerSymbol(index),
          // need to set marker.line for a transparent case (opacity != 1)
          line: {
            color:
              highlightedPointsDetails &&
              highlightedPointsDetails.pointIds.length > 0
                ? DefaultNonHighlightColor
                : seriesGradientColorscale?.length > 0 &&
                  markerSymbolGradient === 'circle'
                ? markerColorsGradient
                : markerColor(index),
            width: 1,
          },
        },
        // this needs to be here for the case of markers with line or lineplot.
        line: { color: markerColor(index), shape: 'linear' },
        pointIds: el.pointIds,
      });

      // If there are any highlihgted points, we need to add those to the highlight trace
      if (
        highlightedPointsDetails &&
        el.pointIds &&
        highlightedPointsDetails.pointIds.some((id: string) =>
          el.pointIds?.includes(id)
        )
      ) {
        // Extract the indices of highlighted points.
        const highlightIndices = el.pointIds
          .map((id: string, index: number) =>
            highlightedPointsDetails.pointIds.includes(id) ? index : -1
          )
          .filter((index: number) => index !== -1);
        if (highlightIndices && highlightIndices.length !== 0) {
          highlightTrace.x.push(
            ...(highlightIndices.map(
              (index: number) => el.seriesX && el.seriesX[index]
            ) || [])
          );
          highlightTrace.y.push(
            ...(highlightIndices.map(
              (index: number) => el.seriesY && el.seriesY[index]
            ) || [])
          );
          highlightTrace.pointIds.push(
            ...(highlightIndices.map(
              (index: number) => el.pointIds && el.pointIds[index]
            ) || [])
          );
        }
      }

      return breakAfterThisSeries(index);
    }
    return false;
  });

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  responseScatterplotData.some(function (
    el: ScatterplotResponse['scatterplot']['data'][number],
    index: number
  ) {
    // responseScatterplotData.some(function (el: ScatterplotResponse['scatterplot']['data'][number], index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xIntervalLineValue = [];
    let yIntervalLineValue: number[] = [];
    let standardErrorValue: number[] = []; // this is for standardError

    let xIntervalBounds = [];
    let yIntervalBounds: number[] = [];

    // initialize smoothedMeanX, bestFitLineX
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // Fix overlay variable label. If a numeric var, fix with fixLabelForNumberVariables. If the overlay variable
    // is from the abundance app, it is a var id that needs to be swapped for its display name (fixVarIdLabel)
    const fixedOverlayLabel =
      el.overlayVariableDetails &&
      (computationType === 'abundance' && entities
        ? fixVarIdLabel(
            el.overlayVariableDetails.value,
            el.overlayVariableDetails.entityId,
            entities
          )
        : fixLabelForNumberVariables(
            el.overlayVariableDetails.value,
            overlayVariable
          ));

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
        yMin = el.seriesY?.length
          ? lte(yMin, min(yIntervalLineValue))
            ? yMin
            : min(yIntervalLineValue)
          : min(yIntervalLineValue);
        yMinPos = el.seriesY?.length
          ? lte(yMin, minPos(yIntervalLineValue))
            ? yMin
            : minPos(yIntervalLineValue)
          : minPos(yIntervalLineValue);
        yMax = el.seriesY?.length
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
        name: fixedOverlayLabel
          ? fixedOverlayLabel + SMOOTHEDMEANSUFFIX
          : SMOOTHEDMEANTEXT,
        mode: 'lines', // no data point is displayed: only line
        line: {
          // use darker color for smoothed mean line
          color: markerColorDark(index),
          shape: 'spline',
          width: 2,
        },
        type: scatterPlotType,
        // check whether smoothed mean exists
        hasSmoothedMeanData:
          xIntervalLineValue.length > 0 && yIntervalLineValue.length > 0,
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
        yMinPos = lte(yMin, minPos(yLowerValues)) ? yMin : minPos(yLowerValues);
        yMax = gte(yMax, max(yUpperValues)) ? yMax : max(yUpperValues);
      }

      // store data for CI/bounds
      dataSetProcess.push({
        x: xIntervalBounds,
        y: yIntervalBounds,
        // name: '95% Confidence interval',
        name: fixedOverlayLabel ? fixedOverlayLabel + CI95SUFFIX : CI95TEXT,
        // this is better to be tozeroy, not tozerox
        fill: 'tozeroy',
        // opacity only works for type: scattergl
        opacity: 0.2,
        // use darker color for smoothed mean's confidence interval
        // when using scatter, fillColor should be rgba() format
        fillcolor:
          scatterPlotType === 'scatter'
            ? ColorMath.evaluate(
                markerColorDark(index) + ' @a 20%'
              ).result.css()
            : markerColorDark(index),
        type: scatterPlotType,
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
        yMinPos = el.seriesY
          ? lte(yMin, minPos(el.bestFitLineY))
            ? yMin
            : minPos(el.bestFitLineY)
          : minPos(el.bestFitLineY);
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
        r2: el.r2,
        // display R-square value at legend for no overlay and facet variable
        name:
          // revisit this overlayVariable == null should be conditional: may not work properly
          (((computationType === 'pass' ||
            computationType === 'alphadiv' ||
            computationType === 'xyrelationships') &&
            overlayVariable == null) || // pass-through & alphadiv & // X-Y relationships
            (computationType === 'abundance' &&
              responseScatterplotData.length === 1)) && // abundance & single data case (revisit)
          facetVariable == null
            ? 'Best fit, R² = ' + el.r2
            : fixedOverlayLabel
            ? fixedOverlayLabel + BESTFITSUFFIX
            : BESTFITTEXT,
        mode: 'lines', // no data point is displayed: only line
        line: {
          // use darker color for best fit line
          color: markerColorDark(index),
          shape: 'spline',
        },
        type: scatterPlotType,
      });
    }
    return breakAfterThisSeries(index);
  });

  // If there are any highlighted points, add that trace to datasetProcess
  if (highlightTrace.x.length > 0) {
    dataSetProcess.push(highlightTrace);
  }

  return {
    dataSetProcess: { series: dataSetProcess },
    xMin,
    xMinPos,
    xMax,
    yMin,
    yMinPos,
    yMax,
  };
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

function reorderResponseScatterplotData(
  data: ScatterPlotDataResponse['scatterplot']['data'],
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable
) {
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = data
      .map((series) => series.overlayVariableDetails?.value)
      .filter((value) => value != null)
      .map((value) => fixLabelForNumberVariables(value!, overlayVariable));
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return overlayIndices.map(
      (i, j) =>
        data[i] ?? {
          // if there is no series, insert a dummy series
          overlayVariableDetails: {
            value: overlayVocabulary[j],
          },
          seriesX: [],
          seriesY: [],
        }
    );
  } else {
    return data;
  }
}

function minPos(array: (number | string | undefined)[]) {
  return min(filter(array, (x) => gt(x, 0)));
}

function minValue(array: (number | string | undefined)[]) {
  return min(array);
}

function maxValue(array: (number | string | undefined)[]) {
  return max(array);
}
