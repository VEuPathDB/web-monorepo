import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import FacetedHistogram from '@veupathdb/components/lib/plots/facetedPlots/FacetedHistogram';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
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
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import * as t from 'io-ts';
import {
  isEqual,
  min,
  max,
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
import { PromiseHookState, usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import {
  DateVariable,
  NumberVariable,
  StudyEntity,
  Variable,
} from '../../../types/study';
import { VariableDescriptor } from '../../../types/variable';
import { CoverageStatistics } from '../../../types/visualization';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { BirdsEyeView } from '../../BirdsEyeView';
import { PlotLayout } from '../../layouts/PlotLayout';
import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import histogram from './selectorIcons/histogram.svg';
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
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
// import variable's metadata-based independent axis range utils
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PluginError from '../PluginError';
// for custom legend
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
import { EntityCounts } from '../../../hooks/entityCounts';
// a custom hook to preserve the status of checked legend items
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';

// concerning axis range control
import {
  NumberOrDateRange,
  NumberRange,
  DateRange,
} from '../../../types/general';
import { padISODateTime } from '../../../utils/date-conversion';
import { NumberRangeInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateRangeInputs';
// use variant
import { truncationConfig } from '../../../utils/truncation-config-utils-viz';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
import Button from '@veupathdb/components/lib/components/widgets/Button';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { UIState } from '../../filter/HistogramFilter';
// change defaultIndependentAxisRange to hook
import { useDefaultIndependentAxisRange } from '../../../hooks/computeDefaultIndependentAxisRange';
import { useDefaultDependentAxisRange } from '../../../hooks/computeDefaultDependentAxisRange';
import { useVizConfig } from '../../../hooks/visualizations';

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

export const histogramVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: HistogramViz,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img
      alt="Histogram"
      style={{ height: '100%', width: '100%' }}
      src={histogram}
    />
  );
}

function createDefaultConfig(): HistogramConfig {
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
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
  }),
]);

function HistogramViz(props: VisualizationProps) {
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
      const keepBin = isEqual(xAxisVariable, vizConfig.xAxisVariable);
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
        binWidth: keepBin ? vizConfig.binWidth : undefined,
        binWidthTimeUnit: keepBin ? vizConfig.binWidthTimeUnit : undefined,
        // set undefined for variable change
        checkedLegendItems: undefined,
        // set independentAxisRange undefined
        independentAxisRange: undefined,
        dependentAxisRange: undefined,
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
    < ValueType,>(key: keyof HistogramConfig, resetCheckedLegendItems?: boolean, resetAxisRanges?: boolean) => (newValue?: ValueType) => {
      const newPartialConfig = {
        [key]: newValue,
        ...(resetCheckedLegendItems ? { checkedLegendItems: undefined } : {}),
      	...(resetAxisRanges ? { independentAxisRange: undefined, dependentAxisRange: undefined } : {}),
      };
      updateVizConfig(newPartialConfig);
      if (resetAxisRanges)
        setTruncatedIndependentAxisWarning('');
	      setTruncatedDependentAxisWarning('');
    },
    [updateVizConfig]
  );

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale'
  );

  const onValueSpecChange = onChangeHandlerFactory<ValueSpec>(
    'valueSpec',
    false,
    true
  );

  // set checkedLegendItems: undefined for the change of showMissingness
  const onShowMissingnessChange = onChangeHandlerFactory<boolean>(
    'showMissingness',
    true,
    true
  );

  // for custom legend: vizconfig.checkedLegendItems
  const onCheckedLegendItemsChange = onChangeHandlerFactory<string[]>(
    'checkedLegendItems'
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);

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

  const {
    overlayVariable,
    overlayEntity,
    facetVariable,
    facetEntity,
  } = useMemo(() => {
    const { variable: overlayVariable, entity: overlayEntity } =
      findEntityAndVariable(vizConfig.overlayVariable) ?? {};
    const { variable: facetVariable, entity: facetEntity } =
      findEntityAndVariable(vizConfig.facetVariable) ?? {};
    return {
      overlayVariable,
      overlayEntity,
      facetVariable,
      facetEntity,
    };
  }, [
    findEntityAndVariable,
    vizConfig.overlayVariable,
    vizConfig.facetVariable,
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
      studyId,
      filters,
      filteredCounts,
      outputEntity,
      dataClient,
      computation.descriptor.type,
      xAxisVariable,
      overlayVariable,
      facetVariable,
      valueType,
      // get data when changing independentAxisRange
      vizConfig.independentAxisRange,
    ])
  );

  // use custom hook
  const defaultIndependentRange = useDefaultIndependentAxisRange(
    xAxisVariable,
    'histogram',
    updateVizConfig
  );

  // use custom hook
  const defaultDependentAxisRange = useDefaultDependentAxisRange(
    data,
    vizConfig,
    updateVizConfig,
    'Histogram'
  );

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

  // set checkedLegendItems
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.checkedLegendItems
  );

  // axis range control
  // get as much default axis range from variable annotations as possible
  const defaultUIState: UIState = useMemo(() => {
    if (xAxisVariable != null) {
      const otherDefaults = {
        dependentAxisLogScale: false,
      };

      if (NumberVariable.is(xAxisVariable)) {
        return {
          binWidth:
            xAxisVariable.binWidthOverride ?? xAxisVariable.binWidth ?? 0.1,
          binWidthTimeUnit: undefined,
          independentAxisRange: defaultIndependentRange as NumberRange,
          ...otherDefaults,
        };
      }
      // else date variable
      const binWidth =
        (xAxisVariable as DateVariable)?.binWidthOverride ??
        (xAxisVariable as DateVariable)?.binWidth;
      const binUnits = (xAxisVariable as DateVariable)?.binUnits;

      return {
        binWidth: binWidth ?? 1,
        binWidthTimeUnit: binUnits ?? (xAxisVariable as DateVariable).binUnits!, // bit nasty!
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'Main',
              role: 'primary',
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
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
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
      <HistogramPlotWithControls
        data={data.value}
        error={data.error}
        onBinWidthChange={onBinWidthChange}
        dependentAxisLogScale={vizConfig.dependentAxisLogScale}
        onDependentAxisLogScaleChange={onDependentAxisLogScaleChange}
        valueSpec={vizConfig.valueSpec}
        onValueSpecChange={onValueSpecChange}
        updateThumbnail={updateThumbnail}
        containerStyles={
          !isFaceted(data.value) ? plotContainerStyles : undefined
        }
        spacingOptions={!isFaceted(data.value) ? spacingOptions : undefined}
        orientation={'vertical'}
        barLayout={'stack'}
        displayLegend={false}
        outputEntity={outputEntity}
        independentAxisVariable={vizConfig.xAxisVariable}
        independentAxisLabel={variableDisplayWithUnit(xAxisVariable) ?? 'Main'}
        interactive={!isFaceted(data.value) ? true : false}
        showSpinner={data.pending || filteredCounts.pending}
        filters={filters}
        outputSize={outputSize}
        completeCases={data.pending ? undefined : data.value?.completeCases}
        completeCasesAllVars={
          data.pending ? undefined : data.value?.completeCasesAllVars
        }
        completeCasesAxesVars={
          data.pending ? undefined : data.value?.completeCasesAxesVars
        }
        showMissingness={vizConfig.showMissingness ?? false}
        overlayVariable={vizConfig.overlayVariable}
        overlayLabel={variableDisplayWithUnit(overlayVariable)}
        facetVariable={vizConfig.facetVariable}
        facetLabel={variableDisplayWithUnit(facetVariable)}
        legendTitle={variableDisplayWithUnit(overlayVariable)}
        dependentAxisLabel={
          vizConfig.valueSpec === 'count' ? 'Count' : 'Proportion'
        }
        // for custom legend passing checked state in the  checkbox to PlotlyPlot
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        onCheckedLegendItemsChange={onCheckedLegendItemsChange}
        totalCounts={totalCounts}
        filteredCounts={filteredCounts}
        // axis range control
        vizConfig={vizConfig}
        updateVizConfig={updateVizConfig}
        valueType={valueType}
        defaultUIState={defaultUIState}
        defaultIndependentRange={defaultIndependentRange}
        // add dependent axis range for better displaying tick labels in log-scale
        defaultDependentAxisRange={defaultDependentAxisRange}
        // pass truncation warning props
        truncatedIndependentAxisWarning={truncatedIndependentAxisWarning}
        setTruncatedIndependentAxisWarning={setTruncatedIndependentAxisWarning}
        truncatedDependentAxisWarning={truncatedDependentAxisWarning}
        setTruncatedDependentAxisWarning={setTruncatedDependentAxisWarning}
      />
    </div>
  );
}

type HistogramPlotWithControlsProps = Omit<HistogramProps, 'data'> & {
  data?: HistogramData | FacetedData<HistogramData>;
  onBinWidthChange: (newBinWidth: NumberOrTimeDelta) => void;
  onDependentAxisLogScaleChange: (newState?: boolean) => void;
  filters?: Filter[];
  outputEntity?: StudyEntity;
  independentAxisVariable?: VariableDescriptor;
  overlayVariable?: VariableDescriptor;
  overlayLabel?: string;
  facetVariable?: VariableDescriptor;
  facetLabel?: string;
  valueSpec: ValueSpec;
  onValueSpecChange: (newValueSpec: ValueSpec) => void;
  showMissingness: boolean;
  updateThumbnail: (src: string) => void;
  error: unknown;
  // add props for custom legend
  legendItems: LegendItemsProps[];
  checkedLegendItems: string[] | undefined;
  onCheckedLegendItemsChange: (checkedLegendItems: string[]) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  // define types for axis range control
  vizConfig: HistogramConfig;
  updateVizConfig: (newConfig: Partial<HistogramConfig>) => void;
  valueType: 'number' | 'date';
  defaultUIState: UIState;
  defaultIndependentRange: NumberOrDateRange | undefined;
  defaultDependentAxisRange: NumberRange | undefined;
  // pass truncation warning props
  truncatedIndependentAxisWarning: string;
  setTruncatedIndependentAxisWarning: (
    truncatedIndependentAxisWarning: string
  ) => void;
  truncatedDependentAxisWarning: string;
  setTruncatedDependentAxisWarning: (
    truncatedDependentAxisWarning: string
  ) => void;
  outputSize?: number;
} & Partial<CoverageStatistics>;

function HistogramPlotWithControls({
  data,
  error,
  onBinWidthChange,
  onDependentAxisLogScaleChange,
  filters,
  completeCases,
  completeCasesAllVars,
  completeCasesAxesVars,
  outputEntity,
  independentAxisVariable,
  overlayVariable,
  overlayLabel,
  facetVariable,
  facetLabel,
  valueSpec,
  onValueSpecChange,
  showMissingness,
  updateThumbnail,
  // add props for custom legend
  legendItems,
  checkedLegendItems,
  onCheckedLegendItemsChange,
  totalCounts,
  filteredCounts,
  // for axis range control
  vizConfig,
  updateVizConfig,
  valueType,
  defaultUIState,
  defaultIndependentRange,
  defaultDependentAxisRange,
  // pass truncation warning props
  truncatedIndependentAxisWarning,
  setTruncatedIndependentAxisWarning,
  truncatedDependentAxisWarning,
  setTruncatedDependentAxisWarning,
  outputSize,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const displayLibraryControls = false;
  const opacity = 100;

  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    plotContainerStyles,
    [
      data,
      checkedLegendItems,
      histogramProps.dependentAxisLogScale,
      vizConfig.dependentAxisRange,
    ]
  );

  const widgetHeight = '4em';

  // controls need the bin info from just one facet (not an empty one)
  const data0 = isFaceted(data)
    ? data.facets.find(({ data }) => data != null && data.series.length > 0)
        ?.data
    : data;

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
      binWidth: defaultUIState.binWidth,
      binWidthTimeUnit: defaultUIState.binWidthTimeUnit,
    });
    // add reset for truncation message: including dependent axis warning as well
    setTruncatedIndependentAxisWarning('');
  }, [
    defaultUIState.binWidth,
    defaultUIState.binWidthTimeUnit,
    defaultUIState.independentAxisRange,
    updateVizConfig,
  ]);

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
        'Data may have been truncated by range selection, as indicated by the light gray shading'
      );
    }
  }, [truncationConfigIndependentAxisMin, truncationConfigIndependentAxisMax]);

  useEffect(() => {
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the light gray shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  // send histogramProps with additional props
  const histogramPlotProps = {
    ...histogramProps,
    // axis range control
    independentAxisRange:
      vizConfig.independentAxisRange ?? defaultIndependentRange,
    dependentAxisRange:
      vizConfig.dependentAxisRange ?? defaultDependentAxisRange,
    // pass axisTruncationConfig props
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

  const plotNode = (
    <>
      {isFaceted(data) ? (
        <FacetedHistogram
          data={data}
          // send histogramProps with additional props
          componentProps={histogramPlotProps}
          modalComponentProps={{
            independentAxisLabel: histogramProps.independentAxisLabel,
            dependentAxisLabel: histogramProps.dependentAxisLabel,
            displayLegend: histogramProps.displayLegend,
            containerStyles: modalPlotContainerStyles,
          }}
          facetedPlotRef={plotRef}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
        />
      ) : (
        <Histogram
          {...histogramProps}
          ref={plotRef}
          data={data}
          opacity={opacity}
          displayLibraryControls={displayLibraryControls}
          showValues={false}
          // for custom legend: pass checkedLegendItems to PlotlyPlot
          checkedLegendItems={checkedLegendItems}
          // axis range control
          independentAxisRange={
            vizConfig.independentAxisRange ?? defaultIndependentRange
          }
          dependentAxisRange={
            vizConfig.dependentAxisRange ?? defaultDependentAxisRange
          }
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

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {/* make switch and radiobutton single line with space
                 also marginRight at LabelledGroup is set to 0.5625em: default - 1.5625em*/}
        <LabelledGroup
          label="Y-axis"
          containerStyles={{
            marginRight: '0.5625em',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              label="Log scale"
              state={histogramProps.dependentAxisLogScale}
              onStateChange={onDependentAxisLogScaleChange}
              containerStyles={{
                minHeight: widgetHeight,
              }}
            />
            <div style={{ width: '4em' }}>{''}</div>
            <RadioButtonGroup
              selectedOption={valueSpec}
              options={['count', 'proportion']}
              onOptionSelected={(newOption) => {
                if (newOption === 'proportion') {
                  onValueSpecChange('proportion');
                } else {
                  onValueSpecChange('count');
                }
              }}
            />
          </div>
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
            text={'Reset to defaults'}
            onClick={handleDependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '50%',
              float: 'right',
            }}
          />
        </LabelledGroup>
        <LabelledGroup
          label="X-axis"
          containerStyles={{
            marginRight: '0em',
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
              maxWidth: valueType === 'date' ? '250px' : '350px',
            }}
          />

          {/* X-Axis range control - temp block to check date  */}
          <AxisRangeControl
            label="Range"
            range={vizConfig.independentAxisRange ?? defaultIndependentRange}
            onRangeChange={handleIndependentAxisRangeChange}
            valueType={valueType}
            // set maxWidth
            containerStyles={{ maxWidth: '350px' }}
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
                maxWidth: valueType === 'date' ? '350px' : '350px',
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
              marginRight: valueType === 'date' ? '-1em' : '',
            }}
          />
        </LabelledGroup>
      </div>
    </>
  );

  const legendNode = legendItems != null &&
    !histogramProps.showSpinner &&
    data != null && (
      <PlotLegend
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        legendTitle={histogramProps.legendTitle}
        onCheckedLegendItemsChange={onCheckedLegendItemsChange}
      />
    );

  const tableGroupNode = (
    <>
      <BirdsEyeView
        completeCasesAllVars={completeCasesAllVars}
        completeCasesAxesVars={completeCasesAxesVars}
        outputEntity={outputEntity}
        stratificationIsActive={
          overlayVariable != null || facetVariable != null
        }
        enableSpinner={independentAxisVariable != null && !error}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      <VariableCoverageTable
        completeCases={completeCases}
        filteredCounts={filteredCounts}
        outputEntityId={independentAxisVariable?.entityId}
        variableSpecs={[
          {
            role: 'Main',
            required: true,
            display: histogramProps.independentAxisLabel,
            variable: independentAxisVariable,
          },
          {
            role: 'Overlay',
            display: overlayLabel,
            variable: overlayVariable,
          },
          {
            role: 'Facet',
            display: facetLabel,
            variable: facetVariable,
          },
        ]}
      />
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <OutputEntityTitle entity={outputEntity} outputSize={outputSize} />
      <PlotLayout
        isFaceted={isFaceted(data)}
        plotNode={plotNode}
        legendNode={legendNode}
        tableGroupNode={tableGroupNode}
      />
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
      ? variable.binWidthOverride ?? variable.binWidth
      : undefined,
    binWidthTimeUnit = variable?.type === 'date'
      ? variable.binUnits
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

  return {
    studyId,
    filters,
    config: {
      outputEntityId: xAxisVariable!.entityId,
      xAxisVariable,
      barMode: 'stack',
      overlayVariable,
      facetVariable: facetVariable ? [facetVariable] : [],
      valueSpec,
      ...binSpec,
      showMissingness: vizConfig.showMissingness ? 'TRUE' : 'FALSE',
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

/**
 * find min and max of the sum of multiple arrays
 * it is because histogram viz uses "stack" option for display
 * Also, each data with overlayVariable has different bins
 * For this purpose, binStart is used as array index to map corresponding count
 * Need to make stacked count array and then max
 */

export function findMinMaxOfStackedArray(data: HistogramDataSeries[]) {
  // calculate the sum of all the counts from bins with the same label
  const sumsByLabel = data
    .flatMap(
      // make an array of [ [ label, count ], [ label, count ], ... ] from all series
      (series) => series.bins.map((bin) => [bin.binLabel, bin.value])
    )
    // then do a sum of counts per label
    .reduce<Record<string, number>>(
      (map, [label, count]) => {
        if (map[label] == null) map[label] = 0;
        map[label] = map[label] + (count as number);
        return map;
      },
      // empty map for reduce to start with
      {}
    );

  return {
    min: min(Object.values(sumsByLabel)),
    max: max(Object.values(sumsByLabel)),
  };
}
