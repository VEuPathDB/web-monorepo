// load scatter plot component
import ScatterPlot, {
  ScatterPlotProps,
} from '@veupathdb/components/lib/plots/ScatterPlot';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import * as t from 'io-ts';
import { useCallback, useMemo, useState, useEffect } from 'react';

// need to set for Scatterplot

import DataClient, { ScatterplotResponse } from '../../../api/DataClient';

import { usePromise } from '../../../hooks/promise';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { findEntityAndVariable as findCollectionVariableEntityAndVariable } from '../../../utils/study-metadata';

import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import {
  ComputedVariableDetails,
  VisualizationProps,
} from '../VisualizationTypes';

import scatter from './selectorIcons/scatter.svg';

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
import { CoverageStatistics, Computation } from '../../../types/visualization';
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
} from '../../../utils/visualization';
import { gray } from '../colors';
import {
  ColorPaletteDefault,
  ColorPaletteDark,
} from '@veupathdb/components/lib/types/plots/addOns';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import { useRouteMatch } from 'react-router';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import FacetedScatterPlot from '@veupathdb/components/lib/plots/facetedPlots/FacetedScatterPlot';
// for converting rgb() to rgba()
import * as ColorMath from 'color-math';
// R-square table component
import { ScatterplotRsquareTable } from '../../ScatterplotRsquareTable';
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import { NumberOrDateRange } from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import Button from '@veupathdb/components/lib/components/widgets/Button';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import {
  useFlattenedConstraints,
  useNeutralPaletteProps,
  useProvidedOptionalVariable,
  useVizConfig,
} from '../../../hooks/visualizations';
// typing computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../../../api/DataClient/types';
// use Banner from CoreUI for showing message for no smoothing
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import { useFindOutputEntity } from '../../../hooks/findOutputEntity';

import useSnackbar from '@veupathdb/coreui/dist/components/notifications/useSnackbar';
import { LayoutOptions, TitleOptions } from '../../layouts/types';
import { OverlayOptions } from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

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
  // add computedVariableMetadata for computation apps such as alphadiv and abundance
  computedVariableMetadata?: ComputedVariableMetadata;
}

// define ScatterPlotDataResponse
type ScatterPlotDataResponse = ScatterplotResponse;

export const scatterplotVisualization = createVisualizationPlugin({
  selectorIcon: scatter,
  fullscreenComponent: ScatterplotViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): ScatterplotConfig {
  return {
    valueSpecConfig: 'Raw',
    independentAxisLogScale: false,
    dependentAxisLogScale: false,
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
});

interface Options extends LayoutOptions, TitleOptions, OverlayOptions {
  getComputedYAxisDetails?(
    config: unknown
  ): ComputedVariableDetails | undefined;
  getComputedOverlayVariable?(config: unknown): VariableDescriptor | undefined;
  hideTrendlines?: boolean;
}

function ScatterplotViz(props: VisualizationProps<Options>) {
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
    ScatterplotConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const computedYAxisDetails = options?.getComputedYAxisDetails?.(
    computation.descriptor.configuration
  );
  const computedOverlayVariableDescriptor = options?.getComputedOverlayVariable?.(
    computation.descriptor.configuration
  );

  const providedOverlayVariableDescriptor = useMemo(
    () => options?.getOverlayVariable?.(computation.descriptor.configuration),
    [options?.getOverlayVariable, computation.descriptor.configuration]
  );

  const selectedVariables = useDeepValue({
    xAxisVariable: vizConfig.xAxisVariable,
    yAxisVariable: vizConfig.yAxisVariable,
    overlayVariable: vizConfig.overlayVariable,
    facetVariable: vizConfig.facetVariable,
  });

  const flattenedConstraints = useFlattenedConstraints(
    dataElementConstraints,
    selectedVariables,
    entities
  );

  useProvidedOptionalVariable<ScatterplotConfig>(
    options?.getOverlayVariable,
    'overlayVariable',
    providedOverlayVariableDescriptor,
    vizConfig.overlayVariable,
    entities,
    flattenedConstraints,
    dataElementDependencyOrder,
    selectedVariables,
    updateVizConfig,
    /** snackbar message */
    'The new overlay variable is not compatible with this visualization and has been disabled.'
  );

  const neutralPaletteProps = useNeutralPaletteProps(
    vizConfig.overlayVariable,
    providedOverlayVariableDescriptor
  );

  const findEntityAndVariable = useFindEntityAndVariable();

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
        // set valueSpec as Raw when yAxisVariable = date
        valueSpecConfig:
          findEntityAndVariable(yAxisVariable)?.variable.type === 'date'
            ? 'Raw'
            : vizConfig.valueSpecConfig,
        // set undefined for variable change
        checkedLegendItems: undefined,
        // set independentAxisRange undefined
        independentAxisRange: undefined,
        dependentAxisRange: undefined,
        independentAxisLogScale: false,
        dependentAxisLogScale: false,
      });
      // close truncation warnings here
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [updateVizConfig, findEntityAndVariable, vizConfig.valueSpecConfig]
  );

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof ScatterplotConfig,
      resetCheckedLegendItems?: boolean,
      resetAxisRanges?: boolean,
      resetAxisLogScale?: boolean,
      resetValueSpecConfig?: boolean) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
      	...(resetAxisRanges ? { independentAxisRange: undefined, dependentAxisRange: undefined } : {}),
        ...(resetAxisLogScale ? { independentAxisLogScale: false, dependentAxisLogScale: false } : {}),
        ...(resetValueSpecConfig ? { valueSpecConfig: 'Raw' } : {}),
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
    true,
    true, // reset both axisLogScale to false
    false
  );
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true
  );

  // for vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  const onIndependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'independentAxisLogScale',
    true,
    true,
    false,
    true // reset valueSpec to Raw
  );

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale',
    true,
    true,
    false,
    true // reset valueSpec to Raw
  );

  // outputEntity for OutputEntityTitle's outputEntity prop and outputEntityId at getRequestParams
  const outputEntity = useFindOutputEntity(
    dataElementDependencyOrder,
    vizConfig,
    'yAxisVariable',
    computedYAxisDetails?.entityId
  );

  const data = usePromise(
    useCallback(async (): Promise<ScatterPlotDataWithCoverage | undefined> => {
      if (
        outputEntity == null ||
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

      // check independentValueType/dependentValueType
      const independentValueType = xAxisVariable?.type
        ? xAxisVariable.type
        : '';
      const dependentValueType = yAxisVariable?.type ? yAxisVariable.type : '';

      // check variable inputs: this is necessary to prevent from data post
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;
      else if (
        computedYAxisDetails == null &&
        (vizConfig.yAxisVariable == null || yAxisVariable == null)
      )
        return undefined;

      const vars = [xAxisVariable, yAxisVariable, overlayVariable];
      const unique = vars.filter((item, i, ar) =>
        item == null ? true : ar.indexOf(item) === i
      );
      if (vars.length !== unique.length)
        throw new Error(
          'Variables must be unique. Please choose different variables.'
        );

      // Convert valueSpecConfig to valueSpecValue for the data client request.
      let valueSpecValue = 'raw';
      if (vizConfig.valueSpecConfig === 'Smoothed mean with raw') {
        valueSpecValue = 'smoothedMeanWithRaw';
      } else if (vizConfig.valueSpecConfig === 'Best fit line with raw') {
        valueSpecValue = 'bestFitLineWithRaw';
      }

      // request params
      const params = {
        studyId,
        filters,
        config: {
          outputEntityId: outputEntity.id,
          valueSpec: valueSpecValue,
          xAxisVariable: vizConfig.xAxisVariable,
          yAxisVariable: vizConfig.yAxisVariable,
          overlayVariable: vizConfig.overlayVariable,
          facetVariable: vizConfig.facetVariable
            ? [vizConfig.facetVariable]
            : [],
          showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
        },
        computeConfig: computation.descriptor.configuration,
      };

      const response = await dataClient.getVisualizationData(
        computation.descriptor.type,
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

      const overlayVocabulary = computedOverlayVariableDescriptor
        ? response.scatterplot.config.computedVariableMetadata?.collectionVariable?.collectionVariableDetails?.map(
            (variableDetails) => variableDetails.variableId
          )
        : fixLabelsForNumberVariables(
            overlayVariable?.vocabulary,
            overlayVariable
          );

      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      return scatterplotResponseToData(
        response,
        independentValueType,
        dependentValueType,
        showMissingOverlay,
        overlayVocabulary,
        overlayVariable,
        showMissingFacet,
        facetVocabulary,
        facetVariable,
        // pass computation
        computation,
        entities,
        neutralPaletteProps.colorPalette
      );
    }, [
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpecConfig,
      vizConfig.showMissingness,
      xAxisVariable,
      yAxisVariable,
      outputEntity,
      overlayVariable,
      facetVariable,
      studyId,
      filters,
      dataClient,
      visualization.descriptor.type,
      overlayEntity,
      facetEntity,
      filteredCounts,
      computation.descriptor.configuration,
      computation.descriptor.type,
      providedOverlayVariable,
      // // get data when changing independentAxisRange
      // vizConfig.independentAxisRange,
    ])
  );

  const outputSize =
    overlayVariable != null && !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  // use hook
  const defaultIndependentAxisRange = useDefaultAxisRange(
    xAxisVariable,
    data.value?.xMin,
    data.value?.xMinPos,
    data.value?.xMax,
    vizConfig.independentAxisLogScale
  );

  // use custom hook
  const defaultDependentAxisRange = useDefaultAxisRange(
    yAxisVariable ?? data?.value?.computedVariableMetadata,
    data.value?.yMin,
    data.value?.yMinPos,
    data.value?.yMax,
    vizConfig.dependentAxisLogScale
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
    data,
    vizConfig.overlayVariable,
    vizConfig.showMissingness,
    vizConfig.valueSpecConfig,
    neutralPaletteProps,
  ]);

  // set checkedLegendItems to either the config-stored items, or all items if nothing stored (or if no overlay locally configured)
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.overlayVariable
      ? options?.getCheckedLegendItems?.(
          computation.descriptor.configuration
        ) ?? vizConfig.checkedLegendItems
      : undefined
  );

  const legendTitle = useMemo(() => {
    if (computedOverlayVariableDescriptor) {
      return findCollectionVariableEntityAndVariable(
        entities,
        computedOverlayVariableDescriptor
      )?.variable.displayName;
    }
    return variableDisplayWithUnit(overlayVariable);
  }, [entities, overlayVariable, computedOverlayVariableDescriptor]);

  const dependentAxisLabel =
    data?.value?.computedVariableMetadata?.displayName?.[0] ??
    computedYAxisDetails?.placeholderDisplayName ??
    variableDisplayWithUnit(yAxisVariable) ??
    'Y-axis';

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

  // When we only have a computed y axis (and no provided x axis) then the y axis var
  // can have a "normal" variable descriptor. In this case we want the computed y var to act just
  // like any other continuous variable.
  const computedYAxisDescriptor =
    !computedOverlayVariableDescriptor && computedYAxisDetails
      ? ({
          entityId: computedYAxisDetails?.entityId,
          variableId: computedYAxisDetails?.variableId,
          displayName: data.value?.computedVariableMetadata?.displayName?.[0],
        } as VariableDescriptor)
      : null;

  // List variables in a collection one by one in the variable coverage table. Create these extra rows
  // here and then append to the variable coverage table rows array.
  const additionalVariableCoverageTableRows = data.value
    ?.computedVariableMetadata?.collectionVariable?.collectionVariableDetails
    ? data.value?.computedVariableMetadata?.collectionVariable?.collectionVariableDetails.map(
        (varDetails) => ({
          role: '',
          display: findEntityAndVariable(varDetails)?.variable.displayName,
          variable: varDetails,
        })
      )
    : [];

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      vizConfig.checkedLegendItems,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
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
    [
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      xMinMaxDataRange,
      yMinMaxDataRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
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
    independentAxisLabel: variableDisplayWithUnit(xAxisVariable) ?? 'X-axis',
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
      ? plotContainerStyles
      : undefined,
    spacingOptions: !isFaceted(data.value?.dataSetProcess)
      ? plotSpacingOptions
      : undefined,
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
    xMinMaxDataRange.max < 0;

  const [
    dismissedDependentAllNegativeWarning,
    setDismissedDependentAllNegativeWarning,
  ] = useState<boolean>(false);
  const dependentAllNegative =
    vizConfig.dependentAxisLogScale &&
    yMinMaxDataRange?.max != null &&
    yMinMaxDataRange.max < 0;

  const { enqueueSnackbar } = useSnackbar();

  const controlsNode = (
    <>
      {!options?.hideTrendlines && (
        // use RadioButtonGroup directly instead of ScatterPlotControls
        <RadioButtonGroup
          label="Plot mode"
          options={['Raw', 'Smoothed mean with raw', 'Best fit line with raw']}
          selectedOption={vizConfig.valueSpecConfig ?? 'Raw'}
          onOptionSelected={(newValue: string) => {
            onValueSpecChange(newValue);
            if (
              newValue !== 'Raw' &&
              (vizConfig.independentAxisLogScale ||
                vizConfig.dependentAxisLogScale)
            )
              enqueueSnackbar('Log scale is not available for this plot mode');
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
          margins={['1em', '0', '0', '1em']}
          itemMarginRight={50}
        />
      )}

      {/* axis range control UIs */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* make switch and radiobutton single line with space
                 also marginRight at LabelledGroup is set to 0.5625em: default - 1.5625em*/}
        <LabelledGroup
          label="X-axis controls"
          containerStyles={{
            marginRight: '1em',
          }}
        >
          {/* X-Axis range control */}
          <div
            style={{
              display: 'flex',
              marginTop: '0.8em',
              marginBottom: '0.8em',
            }}
          >
            <Toggle
              label="Log scale (will exclude values &le; 0):"
              value={vizConfig.independentAxisLogScale ?? false}
              onChange={(newValue: boolean) => {
                setDismissedIndependentAllNegativeWarning(false);
                onIndependentAxisLogScaleChange(newValue);
                if (newValue && vizConfig.valueSpecConfig !== 'Raw')
                  enqueueSnackbar(
                    'Log scale is only available for Raw plot mode'
                  );
              }}
              // disable log scale for date variable
              disabled={scatterplotProps.independentValueType === 'date'}
              themeRole="primary"
            />
          </div>
          {independentAllNegative && !dismissedIndependentAllNegativeWarning ? (
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
          <AxisRangeControl
            label="Range"
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
          />
          {/* truncation notification */}
          {truncatedIndependentAxisWarning && !independentAllNegative ? (
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
          <Button
            type={'outlined'}
            // change text
            text={'Reset to defaults'}
            onClick={handleIndependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '50%',
              float: 'right',
              // to match reset button with date range form
              marginRight:
                scatterplotProps.independentValueType === 'date' ? '-1em' : '',
            }}
          />
        </LabelledGroup>

        {/* add vertical line in btw Y- and X- controls */}
        <div
          style={{
            display: 'inline-flex',
            borderLeft: '2px solid lightgray',
            height: '13.5em',
            position: 'relative',
            marginLeft: '-1px',
            top: '1.5em',
          }}
        >
          {' '}
        </div>

        <LabelledGroup
          label="Y-axis controls"
          containerStyles={{
            marginRight: '0em',
          }}
        >
          {/* Y-axis range control */}
          <div
            style={{
              display: 'flex',
              marginTop: '0.8em',
              marginBottom: '0.8em',
            }}
          >
            <Toggle
              label="Log scale (will exclude values &le; 0):"
              value={vizConfig.dependentAxisLogScale ?? false}
              onChange={(newValue: boolean) => {
                setDismissedDependentAllNegativeWarning(false);
                onDependentAxisLogScaleChange(newValue);
                if (newValue && vizConfig.valueSpecConfig !== 'Raw')
                  enqueueSnackbar(
                    'Log scale is only available for Raw plot mode'
                  );
              }}
              // disable log scale for date variable
              disabled={scatterplotProps.dependentValueType === 'date'}
              themeRole="primary"
            />
          </div>
          {dependentAllNegative && !dismissedDependentAllNegativeWarning ? (
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
          <AxisRangeControl
            label="Range"
            range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
            valueType={
              scatterplotProps.dependentValueType === 'date' ? 'date' : 'number'
            }
            onRangeChange={(newRange?: NumberOrDateRange) => {
              handleDependentAxisRangeChange(newRange);
            }}
            // set maxWidth
            containerStyles={{ maxWidth: '350px' }}
            logScale={vizConfig.dependentAxisLogScale}
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
              marginRight:
                scatterplotProps.dependentValueType === 'date' ? '-1em' : '',
            }}
          />
        </LabelledGroup>
      </div>
    </>
  );

  const showOverlayLegend =
    (computedOverlayVariableDescriptor != null ||
      vizConfig.overlayVariable != null ||
      vizConfig.valueSpecConfig !== 'Raw') &&
    legendItems.length > 0;
  const legendNode = !data.pending && data.value != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      legendTitle={legendTitle}
      onCheckedLegendItemsChange={onCheckedLegendItemsChange}
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
            display: variableDisplayWithUnit(xAxisVariable),
            variable: vizConfig.xAxisVariable,
          },
          {
            role: 'Y-axis',
            required: !computedOverlayVariableDescriptor?.variableId,
            display: dependentAxisLabel,
            variable: computedYAxisDescriptor ?? vizConfig.yAxisVariable,
          },
          {
            role: 'Overlay',
            required: !!computedOverlayVariableDescriptor,
            display: legendTitle,
            variable:
              computedOverlayVariableDescriptor ?? vizConfig.overlayVariable,
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
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);
  }, [
    dataElementConstraints,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
  ]);

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

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
              readonlyValue: computedYAxisDetails
                ? dependentAxisLabel
                : undefined,
            },
            ...(computedOverlayVariableDescriptor
              ? []
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
                          : 'None. ' + options?.getOverlayVariableHelp?.() ?? ''
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
          onShowMissingnessChange={
            options?.hideShowMissingnessToggle
              ? undefined
              : onShowMissingnessChange
          }
          outputEntity={outputEntity}
        />
      </div>

      <PluginError
        error={data.error}
        outputSize={outputSize}
        customCases={[
          (errorString) =>
            errorString.match(/400.+too large/is) ? (
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
            ) : undefined,
        ]}
      />

      {/* show Banner message if no smoothed mean exists */}
      {!data.pending &&
        vizConfig.valueSpecConfig === 'Smoothed mean with raw' &&
        dataWithoutSmoothedMean != null &&
        dataWithoutSmoothedMean?.length > 0 && (
          <Banner
            banner={{
              type: 'info',
              message:
                'A smoothed mean could not be calculated for one or more data series. Likely the sample is too small or the data too highly skewed. Smoothed mean and confidence interval items for these traces have been disabled in the legend and marked with light gray checkboxes.',
              pinned: true,
              intense: false,
            }}
          />
        )}

      <OutputEntityTitle
        entity={outputEntity}
        outputSize={outputSize}
        subtitle={plotSubtitle}
      />
      <LayoutComponent
        isFaceted={isFaceted(data.value?.dataSetProcess)}
        legendNode={showOverlayLegend ? legendNode : null}
        plotNode={plotNode}
        controlsNode={controlsNode}
        tableGroupNode={tableGroupNode}
        showRequiredInputsPrompt={!areRequiredInputsSelected}
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
  independentValueType: string,
  dependentValueType: string,
  showMissingOverlay: boolean = false,
  overlayVocabulary: string[] = [],
  overlayVariable?: Variable,
  showMissingFacet: boolean = false,
  facetVocabulary: string[] = [],
  facetVariable?: Variable,
  computation?: Computation,
  entities?: StudyEntity[],
  colorPaletteOverride?: string[]
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
    const {
      dataSetProcess,
      xMin,
      xMinPos,
      xMax,
      yMin,
      yMinPos,
      yMax,
    } = processInputData(
      reorderResponseScatterplotData(
        // reorder by overlay var within each facet
        group,
        vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
        overlayVariable
      ),
      modeValue,
      independentValueType,
      dependentValueType,
      showMissingOverlay,
      hasMissingData,
      overlayVariable,
      // pass facetVariable to determine either scatter or scattergl
      facetVariable,
      // pass computation here to add conditions for apps
      computation,
      response.scatterplot.config.computedVariableMetadata,
      entities,
      colorPaletteOverride
    );

    return {
      dataSetProcess: dataSetProcess,
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
    computedVariableMetadata:
      response.scatterplot.config.computedVariableMetadata,
  } as ScatterPlotDataWithCoverage;
}

// making plotly input data
function processInputData<T extends number | string>(
  responseScatterplotData: ScatterplotResponse['scatterplot']['data'],
  // line, marker,
  modeValue: string,
  // use independentValueType & dependentValueType to distinguish btw number and date string
  independentValueType: string,
  dependentValueType: string,
  showMissingness: boolean,
  hasMissingData: boolean,
  overlayVariable?: Variable,
  // pass facetVariable to determine either scatter or scattergl
  facetVariable?: Variable,
  computation?: Computation,
  computedVariableMetadata?: ComputedVariableMetadata,
  entities?: StudyEntity[],
  colorPaletteOverride?: string[]
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
      : 'circle-open';

  // use type: scatter for faceted plot, otherwise scattergl
  const scatterPlotType = facetVariable != null ? 'scatter' : 'scattergl';

  // set dataSetProcess as any for now
  let dataSetProcess: any = [];

  // drawing raw data (markers) at first
  responseScatterplotData.some(function (el: any, index: number) {
    // initialize seriesX/Y
    let seriesX = [];
    let seriesY = [];

    // Fix overlay variable label. If a numeric var, fix with fixLabelForNumberVariables. If the overlay variable
    // is from the abundance app, it is a var id that needs to be swapped for it's display name (fixVarIdLabel)
    const fixedOverlayLabel =
      el.overlayVariableDetails &&
      (computation?.descriptor.type === 'abundance' &&
      entities &&
      computedVariableMetadata?.collectionVariable?.collectionVariableDetails
        ? fixVarIdLabel(
            el.overlayVariableDetails.value,
            computedVariableMetadata.collectionVariable
              .collectionVariableDetails,
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
            ? lte(xMin, min(seriesX))
              ? xMin
              : min(seriesX)
            : min(seriesX);
        xMinPos =
          xMinPos != null
            ? lte(xMinPos, minPos(seriesX))
              ? xMinPos
              : minPos(seriesX)
            : minPos(seriesX);
        xMax =
          xMax != null
            ? gte(xMax, max(seriesX))
              ? xMax
              : max(seriesX)
            : max(seriesX);
      }

      if (seriesY.length) {
        yMin =
          yMin != null
            ? lte(yMin, min(seriesY))
              ? yMin
              : min(seriesY)
            : min(seriesY);
        yMinPos =
          yMinPos != null
            ? lte(yMinPos, minPos(seriesY))
              ? yMinPos
              : minPos(seriesY)
            : minPos(seriesY);
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
        name: fixedOverlayLabel ?? 'Data',
        mode: modeValue,
        type: scatterPlotType, // for the raw data of the scatterplot
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

  // after drawing raw data, smoothedMean and bestfitline plots are displayed
  responseScatterplotData.some(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xIntervalLineValue: T[] = [];
    let yIntervalLineValue: number[] = [];
    let standardErrorValue: number[] = []; // this is for standardError

    let xIntervalBounds: T[] = [];
    let yIntervalBounds: number[] = [];

    // initialize smoothedMeanX, bestFitLineX
    let smoothedMeanX = [];
    let bestFitLineX = [];

    // Fix overlay variable label. If a numeric var, fix with fixLabelForNumberVariables. If the overlay variable
    // is from the abundance app, it is a var id that needs to be swapped for it's display name (fixVarIdLabel)
    const fixedOverlayLabel =
      el.overlayVariableDetails &&
      (computation?.descriptor.type === 'abundance' &&
      entities &&
      computedVariableMetadata?.collectionVariable?.collectionVariableDetails
        ? fixVarIdLabel(
            el.overlayVariableDetails.value,
            computedVariableMetadata.collectionVariable
              .collectionVariableDetails,
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
        yMin = el.seriesY.length
          ? lte(yMin, min(yIntervalLineValue))
            ? yMin
            : min(yIntervalLineValue)
          : min(yIntervalLineValue);
        yMinPos = el.seriesY.length
          ? lte(yMin, minPos(yIntervalLineValue))
            ? yMin
            : minPos(yIntervalLineValue)
          : minPos(yIntervalLineValue);
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
          facetVariable != null
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
          (((computation?.descriptor.type === 'pass' ||
            computation?.descriptor.type === 'alphadiv' ||
            computation?.descriptor.type === 'xyrelationships') &&
            overlayVariable == null) || // pass-through & alphadiv & // X-Y relationships
            (computation?.descriptor.type === 'abundance' &&
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
