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

import { InputVariables, requiredInputLabelStyle } from '../InputVariables';
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
} from '../../../utils/visualization';
import { gray } from '../colors';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
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
  useFilteredConstraints,
  useNeutralPaletteProps,
  useProvidedOptionalVariable,
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

import useSnackbar from '@veupathdb/coreui/dist/components/notifications/useSnackbar';
import SingleSelect from '@veupathdb/coreui/dist/components/inputs/SingleSelect';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { LayoutOptions } from '../../layouts/types';
import { OverlayOptions } from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

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

interface Options extends LayoutOptions, OverlayOptions {}

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
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities();
  const dataClient: DataClient = useDataClient();

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    LineplotConfig,
    createDefaultConfig,
    updateConfiguration
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

  const filteredConstraints = useFilteredConstraints(
    dataElementConstraints,
    selectedVariables,
    entities,
    'overlayVariable'
  );

  useProvidedOptionalVariable<LineplotConfig>(
    options?.getOverlayVariable,
    'overlayVariable',
    providedOverlayVariableDescriptor,
    vizConfig.overlayVariable,
    entities,
    filteredConstraints,
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
      const keepIndependentAxisSettings = isEqual(
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
        dependentAxisRange: undefined,
        ...(keepValues
          ? {}
          : {
              numeratorValues: undefined,
              denominatorValues:
                yAxisVar != null ? yAxisVar.vocabulary : undefined,
            }),
        independentAxisLogScale: false,
        dependentAxisLogScale: false,
        independentAxisValueSpec: keepIndependentAxisSettings
          ? vizConfig.independentAxisValueSpec
          : 'Full',
        dependentAxisValueSpec:
          yAxisVar != null
            ? isSuitableCategoricalVariable(yAxisVar)
              ? 'Full'
              : 'Auto-zoom'
            : 'Full',
      });
      // axis range control: close truncation warnings here
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [
      updateVizConfig,
      vizConfig.xAxisVariable,
      vizConfig.yAxisVariable,
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

  const onNumeratorValuesChange = onChangeHandlerFactory<string[]>(
    'numeratorValues'
  );
  const onDenominatorValuesChange = onChangeHandlerFactory<string[]>(
    'denominatorValues'
  );

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
        facetVariable,
        neutralPaletteProps.colorPalette
      );
    }, [
      studyId,
      filters,
      dataClient,
      xAxisVariable,
      yAxisVariable,
      overlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
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
      // the following looks nasty but it seems to work
      // the back end only makes use of the x-axis viewport (aka independentAxisRange)
      // when binning is in force, so no need to trigger a new request unless binning
      vizConfig.useBinning ? vizConfig.independentAxisRange : undefined,
      // same goes for changing from full to auto-zoom/custom
      vizConfig.useBinning
        ? vizConfig.independentAxisValueSpec === 'Full'
        : undefined,
      valuesAreSpecified,
      providedOverlayVariable,
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
    [data, vizConfig.useBinning]
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
              dataItem?.name === 'No data' ? '#E8E8E8' : palette[index], // set first color for no overlay variable selected
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
  }, [
    dataElementConstraints,
    vizConfig.xAxisVariable,
    vizConfig.yAxisVariable,
    vizConfig.valueSpecConfig,
    vizConfig.denominatorValues,
    vizConfig.numeratorValues,
  ]);

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
    [
      xMinMaxDataRange,
      yMinMaxDataRange,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisLogScale,
      vizConfig.dependentAxisLogScale,
    ]
  );

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
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
    containerStyles: !isFaceted(data.value?.dataSetProcess)
      ? plotContainerStyles
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
  };

  // set four useState to handle Banner
  const [
    showIndependentLogScaleBanner,
    setShowIndependentLogScaleBanner,
  ] = useState(false);
  const [showBinningBanner, setShowBinningBanner] = useState(false);
  const [
    showDependentLogScaleBanner,
    setShowDependentLogScaleBanner,
  ] = useState(false);
  const [showErrorBarBanner, setShowErrorBarBanner] = useState(false);

  const plotNode = (
    <>
      {isFaceted(data.value?.dataSetProcess) ? (
        <FacetedLinePlot
          data={
            (vizConfig.independentAxisLogScale && vizConfig.useBinning) ||
            (vizConfig.dependentAxisLogScale && vizConfig.showErrorBars)
              ? undefined
              : data.value?.dataSetProcess
          }
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
          data={
            (vizConfig.independentAxisLogScale && vizConfig.useBinning) ||
            (vizConfig.dependentAxisLogScale && vizConfig.showErrorBars)
              ? undefined
              : data.value?.dataSetProcess
          }
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

  const neverUseBinning = data0?.binWidthSlider == null; // for ordinal string x-variables
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
      useBinning: false,
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
  }, [updateVizConfig, setTruncatedDependentAxisWarning]);

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
        {(showIndependentLogScaleBanner ||
          showBinningBanner ||
          (vizConfig.independentAxisLogScale && vizConfig.useBinning)) && (
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
        {(showDependentLogScaleBanner ||
          showErrorBarBanner ||
          (vizConfig.dependentAxisLogScale && vizConfig.showErrorBars)) && (
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: '-1em',
            }}
          >
            <LabelledGroup label="X-axis controls"> </LabelledGroup>
            <div style={{ marginLeft: '-2.6em', width: '50%' }}>
              <ResetButtonCoreUI
                size={'medium'}
                text={''}
                themeRole={'primary'}
                tooltip={'Reset to defaults'}
                disabled={lineplotProps.independentValueType === 'string'}
                onPress={handleIndependentAxisSettingsReset}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '-0.3em',
              marginBottom: '0.8em',
              marginLeft: '1em',
            }}
          >
            <Toggle
              label={'Log scale (excludes values \u{2264} 0)'}
              value={vizConfig.independentAxisLogScale ?? false}
              onChange={(newValue: boolean) => {
                setDismissedIndependentAllNegativeWarning(false);
                onIndependentAxisLogScaleChange(newValue);
                if (newValue && vizConfig.useBinning) {
                  setShowIndependentLogScaleBanner(true);
                  setShowBinningBanner(false);
                } else {
                  setShowIndependentLogScaleBanner(false);
                  setShowBinningBanner(false);
                }
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
              marginLeft: '1em',
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
            <Toggle
              label={'Binning'}
              value={vizConfig.useBinning}
              onChange={(newValue: boolean) => {
                onUseBinningChange(newValue);
                if (newValue && vizConfig.independentAxisLogScale) {
                  setShowBinningBanner(true);
                  setShowIndependentLogScaleBanner(false);
                } else {
                  setShowBinningBanner(false);
                  setShowIndependentLogScaleBanner(false);
                }
              }}
              disabled={neverUseBinning}
              themeRole="primary"
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
                maxWidth:
                  lineplotProps.independentValueType === 'date'
                    ? '250px'
                    : '350px',
              }}
              disabled={!vizConfig.useBinning || neverUseBinning}
            />
          </div>

          <LabelledGroup
            label="X-axis range"
            containerStyles={{
              fontSize: '0.9em',
              // width: '350px',
              marginTop: '-0.8em',
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
            marginTop: '-1em',
          }}
        >
          {' '}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* set Undo icon and its behavior */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: '-1em',
            }}
          >
            <LabelledGroup label="Y-axis controls"> </LabelledGroup>
            <div style={{ marginLeft: '-2.6em', width: '50%' }}>
              <ResetButtonCoreUI
                size={'medium'}
                text={''}
                themeRole={'primary'}
                tooltip={'Reset to defaults'}
                disabled={false}
                onPress={handleDependentAxisSettingsReset}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '-0.3em',
              marginBottom: '0.8em',
              marginLeft: '1em',
            }}
          >
            <Toggle
              label={'Log scale (excludes values \u{2264} 0)'}
              value={vizConfig.dependentAxisLogScale ?? false}
              onChange={(newValue: boolean) => {
                setDismissedDependentAllNegativeWarning(false);
                onDependentAxisLogScaleChange(newValue);
                if (newValue && vizConfig.showErrorBars) {
                  setShowDependentLogScaleBanner(true);
                  setShowErrorBarBanner(false);
                } else {
                  setShowDependentLogScaleBanner(false);
                  setShowErrorBarBanner(false);
                }
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
              marginLeft: '1em',
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
                if (newValue && vizConfig.dependentAxisLogScale) {
                  setShowErrorBarBanner(true);
                  setShowDependentLogScaleBanner(false);
                } else {
                  setShowErrorBarBanner(false);
                  setShowDependentLogScaleBanner(false);
                }
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
              range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
              valueType={
                lineplotProps.dependentValueType === 'date' ? 'date' : 'number'
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
        </div>
      </div>
    </>
  );

  const legendTitle = variableDisplayWithUnit(overlayVariable);
  const showOverlayLegend =
    vizConfig.overlayVariable != null && legendItems.length > 0;
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

  const classes = useInputStyles();

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
        The y-axis variable's values that count towards numerator and
        denominator must be selected in the two drop-downs.
      </p>
    </div>
  );

  const aggregationInputs = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {vizConfig.valueSpecConfig !== 'Proportion' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Tooltip title={'Required parameter'}>
            <div className={classes.label}>
              Function<sup>*</sup>
            </div>
          </Tooltip>
          <SingleSelect
            onSelect={onValueSpecChange}
            value={vizConfig.valueSpecConfig}
            buttonDisplayContent={vizConfig.valueSpecConfig}
            items={keys(valueSpecLookup)
              .filter((option) => option !== 'Proportion')
              .map((option) => ({ value: option, display: option }))}
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
                  vizConfig.numeratorValues?.length &&
                  vizConfig.denominatorValues?.length
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
              allowedValues={yAxisVariable?.vocabulary}
              selectedValues={vizConfig.numeratorValues}
              onSelectedValuesChange={onNumeratorValuesChange}
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
              allowedValues={yAxisVariable?.vocabulary}
              selectedValues={vizConfig.denominatorValues}
              onSelectedValuesChange={onDenominatorValuesChange}
            />
          </div>
        </div>
      )}
    </div>
  );

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
          ]}
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
      </div>

      <PluginError error={data.error} outputSize={outputSize} />
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
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
  facetVariable?: Variable,
  colorPaletteOverride?: string[]
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
    const {
      dataSetProcess,
      yMin,
      yMinPos,
      yMax,
      xMin,
      xMinPos,
      xMax,
    } = processInputData(
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
      overlayVariable,
      colorPaletteOverride
    );

    return {
      dataSetProcess: dataSetProcess,
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
  vizConfig: Omit<LineplotConfig, 'dependentAxisRange' | 'checkedLegendItems'>,
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
      ? vizConfig.independentAxisValueSpec === 'Full' // only use 'annotated' binwidth when fully zoomed out
        ? xAxisVariableMetadata.distributionDefaults.binWidthOverride ??
          xAxisVariableMetadata.distributionDefaults.binWidth
        : undefined
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
            : { value: 0 }),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  const valueSpec = valueSpecLookup[valueSpecConfig];

  // define viewport based on independent axis range: need to check undefined case
  // also no viewport change regardless of the change of overlayVariable
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
      overlayVariable: overlayVariable,
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
  overlayVariable?: Variable,
  colorPaletteOverride?: string[]
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
    const palette = colorPaletteOverride ?? ColorPaletteDefault;
    if (showMissingness && index === responseLineplotData.length - 1) {
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
        ...(el.binSampleSize != null
          ? {
              extraTooltipText: categoricalMode
                ? el.binSampleSize.map(
                    (bss) =>
                      `n: ${(bss as { denominatorN: number }).denominatorN}`
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
      // Let's not show no data: nullZeroHack is not used
      series: dataSetProcess,
      ...binWidthSliderData,
    },
    xMin: min(xValues),
    xMinPos: min(xValues.filter((value) => value != null && value > 0)),
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
