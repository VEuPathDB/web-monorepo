import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import FacetedHistogram from '@veupathdb/components/lib/plots/facetedPlots/FacetedHistogram';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { Toggle } from '@veupathdb/coreui';
import {
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import { isFaceted, isTimeDelta } from '@veupathdb/components/lib/types/guards';
import {
  FacetedData,
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import * as t from 'io-ts';
import {
  isEqual,
  groupBy,
  mapValues,
  size,
  head,
  values,
  map,
  keys,
} from 'lodash';
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  HistogramRequestParams,
  HistogramResponse,
} from '../../../api/DataClient';
import DataClient from '../../../api/DataClient';
import { usePromise } from '../../../hooks/promise';
import {
  useDataClient,
  useStudyMetadata,
  useFindEntityAndVariable,
  useStudyEntities,
} from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { DateVariable, NumberVariable, Variable } from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps } from '../VisualizationTypes';
import HistogramSVG from './selectorIcons/HistogramSVG';
// import axis label unit util
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import {
  vocabularyWithMissingData,
  grayOutLastSeries,
  hasIncompleteCases,
  fixLabelForNumberVariables,
  fixLabelsForNumberVariables,
  variablesAreUnique,
  nonUniqueWarning,
} from '../../../utils/visualization';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
// import variable's metadata-based independent axis range utils
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import {
  NumberOrDateRange,
  NumberRange,
  DateRange,
} from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
import { NumberRangeInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateRangeInputs';
// use variant
import { truncationConfig } from '../../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { UIState } from '../../filter/HistogramFilter';
// change defaultIndependentAxisRange to hook
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';
import {
  useFilteredConstraints,
  useNeutralPaletteProps,
  useProvidedOptionalVariable,
  useVizConfig,
} from '../../../hooks/visualizations';
import { createVisualizationPlugin } from '../VisualizationPlugin';
import {
  histogramDefaultIndependentAxisMinMax,
  histogramDefaultDependentAxisMinMax,
} from '../../../utils/axis-range-calculations';
import { LayoutOptions } from '../../layouts/types';
import { OverlayOptions } from '../options/types';
import { useDeepValue } from '../../../hooks/immutability';

// reset to defaults button
import { ResetButtonCoreUI } from '../../ResetButton';

export type HistogramDataWithCoverageStatistics = (
  | HistogramData
  | FacetedData<HistogramData>
) &
  CoverageStatistics;

const plotContainerStyles = {
  width: 750,
  height: 450,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};

const spacingOptions = {
  marginTop: 50,
};

const modalPlotContainerStyles = {
  width: '85%',
  height: '100%',
  margin: 'auto',
};

export const histogramVisualization = createVisualizationPlugin({
  selectorIcon: HistogramSVG,
  fullscreenComponent: HistogramViz,
  createDefaultConfig: createDefaultConfig,
});

function createDefaultConfig(): HistogramConfig {
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
    independentAxisValueSpec: 'Full',
    dependentAxisValueSpec: 'Full',
  };
}

type ValueSpec = t.TypeOf<typeof ValueSpec>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const ValueSpec = t.keyof({ count: null, proportion: null });

export type HistogramConfig = t.TypeOf<typeof HistogramConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HistogramConfig = t.intersection([
  t.type({
    dependentAxisLogScale: t.boolean,
    valueSpec: ValueSpec,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
    binWidth: t.number,
    binWidthTimeUnit: t.string, // TO DO: constrain to weeks, months etc like Unit from date-arithmetic and/or R
    showMissingness: t.boolean,
    // for custom legend: vizconfig.checkedLegendItems
    checkedLegendItems: t.array(t.string),
    // axis range control
    independentAxisRange: NumberOrDateRange,
    dependentAxisRange: NumberRange,
    independentAxisValueSpec: t.string,
    dependentAxisValueSpec: t.string,
  }),
]);

interface Options extends LayoutOptions, OverlayOptions {}

function HistogramViz(props: VisualizationProps<Options>) {
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
    HistogramConfig,
    createDefaultConfig,
    updateConfiguration
  );

  // set the state of truncation warning message here
  const [
    truncatedIndependentAxisWarning,
    setTruncatedIndependentAxisWarning,
  ] = useState<string>('');
  const [
    truncatedDependentAxisWarning,
    setTruncatedDependentAxisWarning,
  ] = useState<string>('');

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (selectedVariables: VariablesByInputName) => {
      const {
        xAxisVariable,
        overlayVariable,
        facetVariable,
      } = selectedVariables;
      const keepIndependentAxisSettings = isEqual(
        xAxisVariable,
        vizConfig.xAxisVariable
      );

      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
        binWidth: keepIndependentAxisSettings ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepIndependentAxisSettings
          ? vizConfig.binWidthTimeUnit
          : undefined,
        // set undefined for variable change
        checkedLegendItems: undefined,
        independentAxisRange: keepIndependentAxisSettings
          ? vizConfig.independentAxisRange
          : undefined,
        dependentAxisRange: undefined,
        dependentAxisLogScale: false,
        independentAxisValueSpec: keepIndependentAxisSettings
          ? vizConfig.independentAxisValueSpec
          : 'Full',
        dependentAxisValueSpec: 'Full',
      });
      // close truncation warnings if exists
      setTruncatedIndependentAxisWarning('');
      setTruncatedDependentAxisWarning('');
    },
    [updateVizConfig, vizConfig]
  );

  const onBinWidthChange = useCallback(
    (newBinWidth: NumberOrTimeDelta) => {
      if (newBinWidth) {
        updateVizConfig({
          binWidth: isTimeDelta(newBinWidth) ? newBinWidth.value : newBinWidth,
          binWidthTimeUnit: isTimeDelta(newBinWidth)
            ? newBinWidth.unit
            : undefined,
        });
      }
    },
    [updateVizConfig]
  );

  // prettier-ignore
  // allow 2nd parameter of resetCheckedLegendItems for checking legend status
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof HistogramConfig,
      resetCheckedLegendItems?: boolean,
      resetIndependentAxisRanges?: boolean,
      resetDependentAxisRanges?: boolean,
      ) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
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

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale',
    false,
    false,
    true
  );

  const onValueSpecChange = onChangeHandlerFactory<ValueSpec>(
    'valueSpec',
    false,
    true,
    true
  );

  const onIndependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'independentAxisValueSpec',
    false,
    true,
    false
  );
  const onDependentAxisValueSpecChange = onChangeHandlerFactory<string>(
    'dependentAxisValueSpec',
    false,
    false,
    true
  );

  // set checkedLegendItems: undefined for the change of showMissingness
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true,
    true
  );

  const findEntityAndVariable = useFindEntityAndVariable();

  const { xAxisVariable, outputEntity, valueType } = useMemo(() => {
    const { entity, variable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};
    const valueType: 'number' | 'date' =
      variable?.type === 'date' ? 'date' : 'number';
    return {
      outputEntity: entity,
      xAxisVariable: variable,
      valueType,
    };
  }, [findEntityAndVariable, vizConfig.xAxisVariable]);

  const providedOverlayVariableDescriptor = useMemo(
    () => options?.getOverlayVariable?.(computation.descriptor.configuration),
    [options?.getOverlayVariable, computation.descriptor.configuration]
  );

  const selectedVariables = useDeepValue({
    xAxisVariable: vizConfig.xAxisVariable,
    overlayVariable: vizConfig.overlayVariable,
    facetVariable: vizConfig.facetVariable,
  });

  const filteredConstraints = useFilteredConstraints(
    dataElementConstraints,
    selectedVariables,
    entities,
    'overlayVariable'
  );

  useProvidedOptionalVariable<HistogramConfig>(
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

  const {
    overlayVariable,
    providedOverlayVariable,
    overlayEntity,
    facetVariable,
    facetEntity,
  } = useMemo(() => {
    const { variable: overlayVariable, entity: overlayEntity } =
      findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    const { variable: providedOverlayVariable } =
      findEntityAndVariable(providedOverlayVariableDescriptor) ?? {};
    const { variable: facetVariable, entity: facetEntity } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      overlayVariable,
      providedOverlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
    };
  }, [
    findEntityAndVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
    providedOverlayVariableDescriptor,
  ]);

  const data = usePromise(
    useCallback(async (): Promise<
      HistogramDataWithCoverageStatistics | undefined
    > => {
      if (
        vizConfig.xAxisVariable == null ||
        xAxisVariable == null ||
        outputEntity == null ||
        filteredCounts.pending ||
        filteredCounts.value == null
      )
        return undefined;

      if (!variablesAreUnique([xAxisVariable, overlayVariable, facetVariable]))
        throw new Error(nonUniqueWarning);

      const params = getRequestParams(
        studyId,
        filters ?? [],
        valueType,
        vizConfig,
        xAxisVariable
      );
      const response = await dataClient.getHistogram(
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

      const overlayVocabulary = fixLabelsForNumberVariables(
        overlayVariable?.vocabulary,
        overlayVariable
      );
      const facetVocabulary = fixLabelsForNumberVariables(
        facetVariable?.vocabulary,
        facetVariable
      );
      return grayOutLastSeries(
        reorderData(
          histogramResponseToData(
            response,
            xAxisVariable,
            overlayVariable,
            facetVariable
          ),
          vocabularyWithMissingData(overlayVocabulary, showMissingOverlay),
          vocabularyWithMissingData(facetVocabulary, showMissingFacet)
        ),
        showMissingOverlay
      );
    }, [
      // using vizConfig only causes issue with onCheckedLegendItemsChange
      vizConfig.xAxisVariable,
      vizConfig.binWidth,
      vizConfig.binWidthTimeUnit,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpec,
      vizConfig.showMissingness,
      vizConfig.independentAxisRange,
      vizConfig.independentAxisValueSpec === 'Full',
      studyId,
      filters,
      filteredCounts,
      outputEntity,
      dataClient,
      computation.descriptor.type,
      xAxisVariable,
      overlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
      valueType,
    ])
  );

  const independentAxisMinMax = useMemo(
    () => histogramDefaultIndependentAxisMinMax(data),
    [data]
  );

  const defaultIndependentRange = useDefaultAxisRange(
    xAxisVariable,
    vizConfig.independentAxisValueSpec === 'Full'
      ? undefined
      : independentAxisMinMax?.min,
    undefined,
    vizConfig.independentAxisValueSpec === 'Full'
      ? undefined
      : independentAxisMinMax?.max,
    undefined,
    vizConfig.independentAxisValueSpec
  );

  // separate minPosMax from dependentMinPosMax
  const minPosMax = useMemo(() => histogramDefaultDependentAxisMinMax(data), [
    data,
  ]);
  const dependentMinPosMax = useMemo(() => {
    return minPosMax != null && minPosMax.min != null && minPosMax.max != null
      ? {
          min: minPosMax.min,
          // override max to be exactly 1 in proportion mode (rounding errors can make it slightly greater than 1)
          max:
            vizConfig.valueSpec === 'proportion' &&
            vizConfig.dependentAxisValueSpec === 'Full'
              ? 1
              : minPosMax.max,
        }
      : undefined;
  }, [data, vizConfig.valueSpec, vizConfig.dependentAxisValueSpec]);

  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    dependentMinPosMax?.min,
    dependentMinPosMax?.max,
    vizConfig.dependentAxisLogScale,
    vizConfig.dependentAxisValueSpec
  ) as NumberRange;

  // custom legend items for checkbox
  const legendItems: LegendItemsProps[] = useMemo(() => {
    const legendData = !isFaceted(data.value)
      ? data.value?.series
      : data.value?.facets.find(
          ({ data }) => data != null && data.series.length > 0
        )?.data?.series;

    return legendData != null
      ? legendData
          .map((dataItem: HistogramDataSeries, index: number) => {
            return {
              label: dataItem.name,
              // histogram plot does not have mode, so set to square for now
              marker: 'square',
              markerColor:
                dataItem.name === 'No data'
                  ? '#E8E8E8'
                  : ColorPaletteDefault[index],
              // deep comparison is required for faceted plot
              hasData: !isFaceted(data.value) // no faceted plot
                ? dataItem.bins != null && dataItem.bins.length > 0
                  ? true
                  : false
                : data.value?.facets // faceted plot: here data.value is full data
                    .map(
                      (el: { label: string; data?: HistogramData }) =>
                        el.data?.series[index]?.bins != null &&
                        el.data?.series[index].bins.length > 0
                    )
                    .includes(true),
              group: 1,
              rank: 1,
            };
            // histogram viz uses stack option so reverse the legend order!
          })
          .reverse()
      : [];
  }, [data]);

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

  // axis range control
  // get as much default axis range from variable annotations as possible

  // NOTE: tech debt - defaultUIState is not really used in its entirity
  // for example, the binWidth isn't used anywhere any more - we should remove
  // unused data from it, or remove it entirely (other viz's manage without it)
  const defaultUIState: UIState = useMemo(() => {
    if (xAxisVariable != null) {
      const otherDefaults = {
        dependentAxisLogScale: false,
      };

      if (NumberVariable.is(xAxisVariable)) {
        return {
          binWidth:
            xAxisVariable.distributionDefaults.binWidthOverride ??
            xAxisVariable.distributionDefaults.binWidth ??
            0.1,
          binWidthTimeUnit: undefined,
          independentAxisRange: defaultIndependentRange as NumberRange,
          ...otherDefaults,
        };
      }
      // else date variable
      const binWidth =
        (xAxisVariable as DateVariable)?.distributionDefaults
          .binWidthOverride ??
        (xAxisVariable as DateVariable)?.distributionDefaults.binWidth;
      const binUnits = (xAxisVariable as DateVariable)?.distributionDefaults
        .binUnits;

      return {
        binWidth: binWidth ?? 1,
        binWidthTimeUnit:
          binUnits ??
          (xAxisVariable as DateVariable).distributionDefaults.binUnits!, // bit nasty!
        independentAxisRange: defaultIndependentRange as DateRange,
        ...otherDefaults,
      };
    } else {
      return {
        binWidth: 0,
        binWidthTimeUnit: undefined,
        independentAxisRange: { min: 0, max: 0 },
        dependentAxisLogScale: false,
      };
    }
  }, [xAxisVariable, defaultIndependentRange]);

  const outputSize =
    (overlayVariable != null || facetVariable != null) &&
    !vizConfig.showMissingness
      ? data.value?.completeCasesAllVars
      : data.value?.completeCasesAxesVars;

  const areRequiredInputsSelected = useMemo(() => {
    if (!dataElementConstraints) return false;
    return Object.entries(dataElementConstraints[0])
      .filter((variable) => variable[1].isRequired)
      .every((reqdVar) => !!(vizConfig as any)[reqdVar[0]]);
  }, [dataElementConstraints, vizConfig.xAxisVariable]);

  const widgetHeight = '4em';

  // controls need the bin info from just one facet (not an empty one)
  const data0 = isFaceted(data.value)
    ? data.value.facets.find(
        ({ data }) => data != null && data.series.length > 0
      )?.data
    : data.value;

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
          ...defaultUIState, // using annotated range, NOT the actual data
          ...(minPosMax != null &&
          minPosMax.min != null &&
          minPosMax.max != null
            ? { dependentAxisRange: minPosMax }
            : {}),
        },
        vizConfig,
        {}, // no overrides
        true // use inclusive less than equal for the range min
      ),
    [
      defaultUIState,
      dependentMinPosMax,
      vizConfig.independentAxisRange,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
    ]
  );

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
      binWidth: undefined,
      binWidthTimeUnit: undefined,
      independentAxisValueSpec: 'Full',
    });
    // add reset for truncation message: including dependent axis warning as well
    setTruncatedIndependentAxisWarning('');
  }, [updateVizConfig, setTruncatedIndependentAxisWarning]);

  const handleDependentAxisRangeChange = useCallback(
    (newRange?: NumberRange) => {
      updateVizConfig({
        dependentAxisRange: newRange,
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
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the yellow shading'
      );
    }
  }, [
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
    setTruncatedDependentAxisWarning,
  ]);

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      vizConfig.checkedLegendItems,
      vizConfig.dependentAxisLogScale,
      vizConfig.dependentAxisRange,
      vizConfig.independentAxisValueSpec,
      vizConfig.dependentAxisValueSpec,
    ]
  );

  const overlayLabel = variableDisplayWithUnit(overlayVariable);
  const neutralPaletteProps = useNeutralPaletteProps(
    vizConfig.overlayVariable,
    providedOverlayVariableDescriptor
  );

  const histogramProps: HistogramProps = {
    containerStyles: !isFaceted(data.value) ? plotContainerStyles : undefined,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    independentAxisLabel: variableDisplayWithUnit(xAxisVariable) ?? 'Main',
    dependentAxisLabel:
      vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion',
    showSpinner: data.pending || filteredCounts.pending,
    displayLegend: false,
    displayLibraryControls: false,
    legendTitle: overlayLabel,
    spacingOptions: !isFaceted(data.value) ? spacingOptions : undefined,
    interactive: !isFaceted(data.value) ? true : false,
    opacity: 100,
    showValues: false,
    barLayout: 'stack',
    orientation: 'vertical',
    independentAxisRange:
      vizConfig.independentAxisRange ?? defaultIndependentRange,
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
    ...neutralPaletteProps,
  };

  const plotNode = (
    <>
      {isFaceted(data.value) ? (
        <FacetedHistogram
          data={data.value}
          componentProps={histogramProps}
          modalComponentProps={{
            ...histogramProps,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <Histogram
          {...histogramProps}
          ref={plotRef}
          data={data.value}
          checkedLegendItems={checkedLegendItems}
        />
      )}
    </>
  );

  const controlsNode = (
    <>
      {/* pre-occupied space for banner */}
      <div style={{ width: 750, marginLeft: '1em', height: '5.1em' }} />
      {/* Plot mode */}
      <RadioButtonGroup
        label="Plot mode"
        selectedOption={vizConfig.valueSpec}
        options={['count', 'proportion']}
        optionLabels={['Count', 'Proportion']}
        buttonColor={'primary'}
        margins={['0em', '0', '0', '1em']}
        onOptionSelected={(newOption) => {
          if (newOption === 'proportion') {
            onValueSpecChange('proportion');
          } else {
            onValueSpecChange('count');
          }
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* make switch and radiobutton single line with space
                  also marginRight at LabelledGroup is set to 0.5625em: default - 1.5625em*/}

          {/* set Undo icon and its behavior */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LabelledGroup label="X-axis controls"> </LabelledGroup>
            <div style={{ marginLeft: '-2.6em', width: '50%' }}>
              <ResetButtonCoreUI
                size={'medium'}
                text={''}
                themeRole={'primary'}
                tooltip={'Reset to defaults'}
                disabled={false}
                onPress={handleIndependentAxisSettingsReset}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '1em',
              marginTop: '-0.5em',
            }}
          >
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
                // set maxWidth
                maxWidth: valueType === 'date' ? '215px' : '315px',
              }}
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
            />
            {/* X-Axis range control */}
            <AxisRangeControl
              label="Range"
              range={vizConfig.independentAxisRange ?? defaultIndependentRange}
              onRangeChange={handleIndependentAxisRangeChange}
              valueType={valueType}
              // set maxWidth
              containerStyles={{
                maxWidth: '350px',
              }}
              disabled={
                vizConfig.independentAxisValueSpec === 'Full' ||
                vizConfig.independentAxisValueSpec === 'Auto-zoom'
              }
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
                  // maxWidth: valueType === 'date' ? '362px': '350px',
                  maxWidth: '350px',
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
            height: '16em',
            position: 'relative',
            marginLeft: '-1px',
            top: '1.5em',
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

          <div style={{ marginLeft: '1em', marginTop: '-0.6em' }}>
            <Toggle
              label={'Log scale'}
              value={histogramProps.dependentAxisLogScale ?? false}
              onChange={onDependentAxisLogScaleChange}
              styleOverrides={{
                container: {
                  minHeight: widgetHeight,
                },
              }}
              themeRole="primary"
            />
          </div>

          <LabelledGroup
            label="Y-axis range"
            containerStyles={{
              fontSize: '0.9em',
              // width: '350px',
              marginTop: '-0.8em',
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
            {/* Y-axis range control */}
            <NumberRangeInput
              label="Range"
              range={vizConfig.dependentAxisRange ?? defaultDependentAxisRange}
              onRangeChange={(newRange?: NumberOrDateRange) => {
                handleDependentAxisRangeChange(newRange as NumberRange);
              }}
              allowPartialRange={false}
              // set maxWidth
              containerStyles={{ maxWidth: '350px' }}
              disabled={
                vizConfig.dependentAxisValueSpec === 'Full' ||
                vizConfig.dependentAxisValueSpec === 'Auto-zoom'
              }
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
          </LabelledGroup>
        </div>
      </div>
    </>
  );

  const showOverlayLegend =
    vizConfig.overlayVariable != null && legendItems.length > 0;
  const legendNode = legendItems != null &&
    !histogramProps.showSpinner &&
    data != null && (
      <PlotLegend
        type="list"
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        onCheckedLegendItemsChange={setCheckedLegendItems}
        legendTitle={histogramProps.legendTitle}
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
        stratificationIsActive={
          overlayVariable != null || facetVariable != null
        }
        enableSpinner={vizConfig.xAxisVariable != null && !data.error}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={data.pending ? undefined : data.value?.completeCases}
        filteredCounts={filteredCounts}
        outputEntityId={outputEntity?.id}
        variableSpecs={[
          {
            role: 'Main',
            required: true,
            display: histogramProps.independentAxisLabel,
            variable: vizConfig.xAxisVariable,
          },
          {
            role: 'Overlay',
            display: overlayLabel,
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

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'Main',
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

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
        <LayoutComponent
          isFaceted={isFaceted(data.value)}
          plotNode={plotNode}
          controlsNode={controlsNode}
          legendNode={showOverlayLegend ? legendNode : null}
          tableGroupNode={tableGroupNode}
          showRequiredInputsPrompt={!areRequiredInputsSelected}
        />
      </div>
    </div>
  );
}

/**
 * Reformat response from histogram endpoints into complete HistogramData
 * @param response
 * @param main variable
 * @returns HistogramDataWithCoverageStatistics
 */
export function histogramResponseToData(
  response: HistogramResponse,
  { type }: Variable,
  overlayVariable?: Variable,
  facetVariable?: Variable
): HistogramDataWithCoverageStatistics {
  if (response.histogram.data.length === 0)
    throw Error(`Expected one or more data series, but got zero`);

  const facetGroupedResponseData = groupBy(response.histogram.data, (data) =>
    data.facetVariableDetails && data.facetVariableDetails.length === 1
      ? fixLabelForNumberVariables(
          data.facetVariableDetails[0].value,
          facetVariable
        )
      : '__NO_FACET__'
  );

  const binWidth =
    type === 'number' || type === 'integer'
      ? response.histogram.config.binSpec.value || 1
      : {
          value: response.histogram.config.binSpec.value || 1,
          unit: response.histogram.config.binSpec.units || 'month',
        };
  const { min, max, step } = response.histogram.config.binSlider;
  const binWidthRange = (type === 'number' || type === 'integer'
    ? { min, max }
    : {
        min,
        max: max != null && max > 60 ? 60 : max, // back end seems to fall over with any values >99 but 60 is used in subsetting
        unit: (binWidth as TimeDelta).unit,
      }) as NumberOrTimeDeltaRange;
  const binWidthStep = step || 0.1;

  // process data and overlay value within each facet grouping
  const processedData = mapValues(facetGroupedResponseData, (group) => {
    const facetIsEmpty = group.every(
      (data) => data.binStart.length === 0 && data.value.length === 0
    );
    return facetIsEmpty
      ? { series: [] }
      : {
          series: group.map((data) => ({
            name:
              data.overlayVariableDetails?.value != null
                ? fixLabelForNumberVariables(
                    data.overlayVariableDetails.value,
                    overlayVariable
                  )
                : '',
            bins: data.value.map((_, index) => ({
              binStart:
                type === 'number' || type === 'integer'
                  ? Number(data.binStart[index])
                  : String(data.binStart[index]),
              binEnd:
                type === 'number' || type === 'integer'
                  ? Number(data.binEnd[index])
                  : String(data.binEnd[index]),
              binLabel: data.binLabel[index],
              value: data.value[index],
            })),
          })),
          binWidthSlider: {
            valueType:
              type === 'integer' || type === 'number' ? 'number' : 'date',
            binWidth,
            binWidthRange,
            binWidthStep,
          },
        };
  });

  return {
    // data
    ...(size(processedData) === 1 &&
    head(keys(processedData)) === '__NO_FACET__'
      ? // unfaceted
        head(values(processedData))
      : // faceted
        {
          facets: map(processedData, (value, key) => ({
            label: key,
            data: value,
          })),
        }),

    // CoverageStatistics
    completeCases: response.completeCasesTable,
    completeCasesAllVars: response.histogram.config.completeCasesAllVars,
    completeCasesAxesVars: response.histogram.config.completeCasesAxesVars,
  } as HistogramDataWithCoverageStatistics;
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  valueType: 'number' | 'date',
  vizConfig: HistogramConfig,
  variable?: Variable
): HistogramRequestParams {
  const {
    binWidth = NumberVariable.is(variable) || DateVariable.is(variable)
      ? vizConfig.independentAxisValueSpec === 'Full'
        ? variable.distributionDefaults.binWidthOverride ??
          variable.distributionDefaults.binWidth
        : undefined
      : undefined,
    binWidthTimeUnit = variable?.type === 'date'
      ? variable.distributionDefaults.binUnits
      : undefined,
    valueSpec,
    overlayVariable,
    facetVariable,
    xAxisVariable,
  } = vizConfig;

  const binSpec = binWidth
    ? {
        binSpec: {
          type: 'binWidth',
          value: binWidth,
          ...(valueType === 'date' ? { units: binWidthTimeUnit } : {}),
        },
      }
    : { binSpec: { type: 'binWidth' } };

  // define viewport based on independent axis range: need to check undefined case
  // also no viewport change regardless of the change of overlayVariable
  const viewport =
    vizConfig?.independentAxisRange?.min != null &&
    vizConfig?.independentAxisRange?.max != null
      ? {
          xMin: vizConfig?.independentAxisRange?.min,
          xMax: vizConfig?.independentAxisRange?.max,
        }
      : undefined;

  return {
    studyId,
    filters,
    config: {
      outputEntityId: xAxisVariable!.entityId,
      xAxisVariable,
      barMode: 'stack',
      overlayVariable: overlayVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      valueSpec,
      ...binSpec,
      showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
      // pass viewport to get appropriate display range
      viewport: viewport,
    },
  } as HistogramRequestParams;
}

function reorderData(
  data: HistogramDataWithCoverageStatistics | HistogramData,
  overlayVocabulary: string[] = [],
  facetVocabulary: string[] = []
): HistogramDataWithCoverageStatistics | HistogramData {
  if (isFaceted(data)) {
    if (facetVocabulary.length === 0) return data; // FIX-ME stop-gap for vocabulary-less numeric variables

    // for each value in the facet vocabulary's correct order
    // find the index in the series where series.name equals that value
    const facetValues = data.facets.map((facet) => facet.label);
    const facetIndices = facetVocabulary.map((name) =>
      facetValues.indexOf(name)
    );

    return {
      ...data,
      facets: facetIndices.map((i, j) => {
        const facetData = data.facets[i]?.data;
        return {
          label: facetVocabulary[j],
          data:
            facetData != null
              ? (reorderData(facetData, overlayVocabulary) as HistogramData)
              : undefined,
        };
      }),
    };
  }

  // otherwise handle non-faceted data
  if (overlayVocabulary.length > 0) {
    // for each value in the overlay vocabulary's correct order
    // find the index in the series where series.name equals that value
    const overlayValues = data.series.map((series) => series.name);
    const overlayIndices = overlayVocabulary.map((name) =>
      overlayValues.indexOf(name)
    );
    return {
      ...data,
      // return the series in overlay vocabulary order
      series: overlayIndices.map(
        (i, j) =>
          data.series[i] ?? {
            // if there is no series, insert a dummy series
            name: overlayVocabulary[j],
            bins: [],
          }
      ),
    };
  } else {
    return data;
  }
}
