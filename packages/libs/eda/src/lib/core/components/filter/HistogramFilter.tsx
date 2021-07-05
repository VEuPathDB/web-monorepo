import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import SelectedRangeControl from '@veupathdb/components/lib/components/plotControls/SelectedRangeControl';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import {
  DateRange,
  ErrorManagement,
  TimeDelta,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
} from '@veupathdb/components/lib/types/general';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import UnknownCount from '@veupathdb/wdk-client/lib/Components/AttributeFilter/UnknownCount';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { number, partial, TypeOf, boolean } from 'io-ts';
import React, { useCallback, useMemo } from 'react';
import {
  DataClient,
  HistogramRequestParams,
  HistogramResponse,
} from '../../api/data-api';
import { usePromise } from '../../hooks/promise';
import { AnalysisState } from '../../hooks/analysis';
import { useDataClient } from '../../hooks/workspace';
import { DateRangeFilter, Filter, NumberRangeFilter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { TimeUnit, NumberOrDateRange, NumberRange } from '../../types/general';
import { gray, red } from './colors';
import { HistogramVariable } from './types';
import { parseTimeDelta } from '../../utils/date-conversion';

type Props = {
  studyMetadata: StudyMetadata;
  variable: HistogramVariable;
  entity: StudyEntity;
  totalEntityCount: number;
  analysisState: AnalysisState;
};

type UIState = TypeOf<typeof UIState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const UIState = partial({
  binWidth: number,
  binWidthTimeUnit: TimeUnit,
  independentAxisRange: NumberOrDateRange,
  dependentAxisRange: NumberRange,
  dependentAxisLogScale: boolean,
});

export function HistogramFilter(props: Props) {
  const {
    variable,
    entity,
    analysisState,
    studyMetadata,
    totalEntityCount,
  } = props;
  const { id: studyId } = studyMetadata;
  const { setFilters } = analysisState;
  const filters = analysisState.analysis?.filters;
  const uiStateKey = `${entity.id}/${variable.id}`;

  // get as much default UI state from variable annotations as possible
  const defaultUIState: UIState = useMemo(() => {
    const otherDefaults = {
      dependentAxisLogScale: false,
    };

    if (variable.type === 'number')
      return {
        binWidth: variable.binWidthOverride ?? variable.binWidth,
        binWidthTimeUnit: undefined,
        independentAxisRange:
          variable.displayRangeMin != null && variable.displayRangeMax != null
            ? { min: variable.displayRangeMin, max: variable.displayRangeMax }
            : undefined,
        ...otherDefaults,
      };

    // else date variable
    const binWidthString = variable.binWidthOverride ?? variable.binWidth;
    const binWidth = binWidthString
      ? parseTimeDelta(binWidthString)
      : undefined;

    return {
      binWidth: binWidth?.value,
      binWidthTimeUnit: binWidth?.unit as TimeUnit, // bit nasty!
      independentAxisRange:
        variable.displayRangeMin != null && variable.displayRangeMax != null
          ? { min: variable.displayRangeMin, max: variable.displayRangeMax }
          : undefined,
      ...otherDefaults,
    };
  }, [variable]);

  const uiState = useMemo(() => {
    return pipe(
      UIState.decode(analysisState.analysis?.variableUISettings[uiStateKey]),
      getOrElse((): UIState => defaultUIState)
    );
  }, [analysisState.analysis?.variableUISettings, uiStateKey, defaultUIState]);
  const dataClient = useDataClient();
  const getData = useCallback(
    async (
      dataParams?: UIState
    ): Promise<
      HistogramData & {
        variableId: string;
        entityId: string;
        hasDataEntitiesCount: number;
      }
    > => {
      const foregroundFilters = filters?.filter(
        (f) => f.entityId !== entity.id || f.variableId !== variable.id
      );
      const background = await getHistogram(
        dataClient,
        studyId,
        [],
        entity,
        variable,
        dataParams
      );
      const foreground =
        foregroundFilters && foregroundFilters.length !== 0
          ? await getHistogram(
              dataClient,
              studyId,
              foregroundFilters,
              entity,
              variable,
              dataParams,
              background.histogram.config
            )
          : background;

      const series = [
        histogramResponseToDataSeries(
          `All ${entity.displayName}`,
          background,
          gray,
          variable.type
        ),
        histogramResponseToDataSeries(
          `Subset of ${entity.displayName}`,
          foreground,
          red,
          variable.type
        ),
      ];
      const binWidth: NumberOrTimeDelta =
        variable.type === 'number'
          ? background.histogram.config.binSpec.value || 1 // TO DO: throw error when response doesn't contain binWidth?
          : {
              value: background.histogram.config.binSpec.value || 1,
              unit: background.histogram.config.binSpec.units ?? 'month',
            };
      const { min, max, step } = background.histogram.config.binSlider;
      const binWidthRange = (variable.type === 'number'
        ? { min, max }
        : {
            min,
            max,
            unit: (binWidth as TimeDelta).unit,
          }) as NumberOrTimeDeltaRange;
      const binWidthStep = step || 0.1;

      // {hasDataEntitiesCount} (YY%) of ZZ households have data for this variable
      const completeCases = background.completeCasesTable[0].completeCases;
      const hasDataEntitiesCount = Array.isArray(completeCases)
        ? completeCases[0]
        : completeCases;

      return {
        valueType: variable.type,
        series,
        binWidth,
        binWidthRange,
        binWidthStep,
        variableId: variable.id,
        entityId: entity.id,
        hasDataEntitiesCount: hasDataEntitiesCount ?? 0,
      };
    },
    [dataClient, entity, filters, studyId, variable]
  );
  const data = usePromise(
    // We're tracking specific properties of `uiState`. We should eventually be
    // more explicit about the dependencies. This will require a change to the
    // interface of `getRequestParams`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => getData(uiState), [
      getData,
      uiState.binWidth,
      uiState.binWidthTimeUnit,
      uiState.independentAxisRange,
    ])
    // is there some more concise utility to remove a key or keys from an object?
    // I tried lodash.omit and it created an endless loop of API calls...!
  );

  const filter = filters?.find(
    (f): f is NumberRangeFilter | DateRangeFilter =>
      f.variableId === variable.id &&
      f.entityId === entity.id &&
      (f.type === 'dateRange' || f.type === 'numberRange')
  );

  const updateFilter = useCallback(
    (selectedRange?: NumberRange | DateRange) => {
      const otherFilters = filters?.filter((f) => f !== filter) ?? [];
      if (selectedRange == null) {
        if (otherFilters.length !== filters?.length) setFilters(otherFilters);
      } else {
        if (
          filter &&
          (filter.type === 'dateRange' || filter.type === 'numberRange') &&
          filter.min === selectedRange.min &&
          filter.max === selectedRange.max
        )
          return;
        setFilters(
          otherFilters.concat([
            variable.type === 'date'
              ? {
                  variableId: variable.id,
                  entityId: entity.id,
                  type: 'dateRange',
                  ...(selectedRange as DateRange),
                }
              : {
                  variableId: variable.id,
                  entityId: entity.id,
                  type: 'numberRange',
                  ...(selectedRange as NumberRange),
                },
          ])
        );
      }
    },
    [entity.id, filters, filter, setFilters, variable.id, variable.type]
  );

  const updateUIState = useCallback(
    (newUiState: TypeOf<typeof UIState>) => {
      // if (uiState.binWidth === newUiState.binWidth) return;
      analysisState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      });
    },
    [analysisState, uiStateKey, uiState]
  );

  // stats from foreground
  const fgSummaryStats = data?.value?.series[1].summary;

  // Note use of `key` used with HistogramPlotWithControls. This is a little hack to force
  // the range to be reset if the filter is removed.
  return (
    <div className="filter-param" style={{ position: 'relative' }}>
      {data.error && <pre>{String(data.error)}</pre>}
      <div>
        {fgSummaryStats && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div className="histogram-summary-stats">
              <b>Min:</b> {fgSummaryStats.min} &emsp; <b>Mean:</b>{' '}
              {fgSummaryStats.mean} &emsp;
              <b>Median:</b> {fgSummaryStats.median} &emsp; <b>Max:</b>{' '}
              {fgSummaryStats.max}
            </div>
            <UnknownCount
              activeFieldState={{
                summary: { internalsCount: data.value?.hasDataEntitiesCount },
              }}
              dataCount={totalEntityCount}
              displayName={entity.displayName}
            />
          </div>
        )}
        <HistogramPlotWithControls
          key={filters?.length ?? 0}
          filter={filter}
          data={
            data.value &&
            data.value.variableId === variable.id &&
            data.value.entityId === entity.id
              ? data.value
              : undefined
          }
          getData={getData}
          containerStyles={{
            width: '100%',
            height: '400px',
          }}
          spacingOptions={{
            marginTop: 20,
            marginBottom: 20,
          }}
          orientation={'vertical'}
          barLayout={'overlay'}
          updateFilter={updateFilter}
          uiState={uiState}
          defaultUIState={defaultUIState}
          updateUIState={updateUIState}
          variableName={variable.displayName}
          entityName={entity.displayName}
          showSpinner={data.pending}
        />
      </div>
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  getData: (params?: UIState) => Promise<HistogramData>; // TO DO: not used - get rid of?
  updateFilter: (selectedRange?: NumberRange | DateRange) => void;
  uiState: UIState;
  defaultUIState: UIState;
  updateUIState: (uiState: UIState) => void;
  filter?: DateRangeFilter | NumberRangeFilter;
  // add variableName for independentAxisLabel
  variableName: string;
  entityName: string;
};

function HistogramPlotWithControls({
  data,
  getData,
  updateFilter,
  uiState,
  defaultUIState,
  updateUIState,
  filter,
  // variableName for independentAxisLabel
  variableName,
  entityName,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const handleSelectedRangeChange = useCallback(
    (range?: NumberOrDateRange) => {
      if (range) {
        updateFilter(range);
      } else {
        updateFilter(); // clear the filter if range is undefined
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, updateFilter]
  );

  const handleBinWidthChange = useCallback(
    (newBinWidth: NumberOrTimeDelta) => {
      updateUIState({
        binWidth: isTimeDelta(newBinWidth) ? newBinWidth.value : newBinWidth,
        binWidthTimeUnit: isTimeDelta(newBinWidth)
          ? (newBinWidth.unit as TimeUnit)
          : undefined,
      });
    },
    [updateUIState]
  );

  const handleIndependentAxisRangeChange = useCallback(
    (newRange?: NumberOrDateRange) => {
      console.log(
        `handleIndependentAxisRangeChange newRange: ${newRange?.min} to ${newRange?.max}`
      );
      updateUIState({
        // when the independent axis range is 'zoomed', reset the binWidth
        // so the back end provides a suitable value
        binWidth: undefined,
        binWidthTimeUnit: undefined,
        independentAxisRange: newRange,
      });
    },
    [updateUIState]
  );

  const handleIndependentAxisSettingsReset = useCallback(() => {
    updateUIState({
      independentAxisRange: defaultUIState.independentAxisRange,
      binWidth: defaultUIState.binWidth,
      binWidthTimeUnit: defaultUIState.binWidthTimeUnit,
    });
  }, [defaultUIState]);

  const handleDependentAxisRangeChange = useCallback(
    (newRange?: NumberRange) => {
      console.log(
        `handleDependentAxisRangeChange newRange: ${newRange?.min} to ${newRange?.max}`
      );
      updateUIState({
        dependentAxisRange: newRange,
      });
    },
    [updateUIState]
  );

  const handleDependentAxisSettingsReset = useCallback(() => {
    updateUIState({
      dependentAxisRange: undefined,
      dependentAxisLogScale: defaultUIState.dependentAxisLogScale,
    });
  }, [defaultUIState]);

  const handleDependentAxisLogScale = useCallback(
    (newState?: boolean) => {
      updateUIState({
        dependentAxisLogScale: newState,
      });
    },
    [updateUIState]
  );

  // TODO Use UIState
  const barLayout = 'overlay';
  const displayLegend = true;
  const displayLibraryControls = false;
  const opacity = 100;
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  const selectedRange = useMemo((): NumberOrDateRange | undefined => {
    if (filter == null) return;
    return { min: filter.min, max: filter.max } as NumberOrDateRange;
  }, [filter]);

  const selectedRangeBounds = {
    min: data?.series[0]?.summary?.min,
    max: data?.series[0]?.summary?.max,
  } as NumberOrDateRange;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <SelectedRangeControl
        label={`Subset on ${variableName}`}
        valueType={data?.valueType}
        selectedRange={selectedRange}
        selectedRangeBounds={selectedRangeBounds}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
      <Histogram
        {...histogramProps}
        data={data}
        interactive={true}
        selectedRange={selectedRange}
        selectedRangeBounds={selectedRangeBounds}
        opacity={opacity}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        onSelectedRangeChange={handleSelectedRangeChange}
        barLayout={barLayout}
        dependentAxisLabel={`Count of ${entityName}`}
        // add independentAxisLabel
        independentAxisLabel={variableName}
        isZoomed={uiState.independentAxisRange ? true : false}
        independentAxisRange={uiState.independentAxisRange}
        dependentAxisRange={uiState.dependentAxisRange}
        dependentAxisLogScale={uiState.dependentAxisLogScale}
        legendOptions={{
          verticalPosition: 'top',
          horizontalPosition: 'center',
          orientation: 'horizontal',
          verticalPaddingAdjustment: 20,
        }}
      />
      <HistogramControls
        label={undefined}
        valueType={data?.valueType}
        barLayout={barLayout}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        opacity={opacity}
        orientation={histogramProps.orientation}
        binWidth={data?.binWidth}
        onBinWidthChange={handleBinWidthChange}
        binWidthRange={data?.binWidthRange}
        binWidthStep={data?.binWidthStep}
        errorManagement={errorManagement}
        independentAxisRange={uiState.independentAxisRange}
        onIndependentAxisRangeChange={handleIndependentAxisRangeChange}
        onIndependentAxisSettingsReset={handleIndependentAxisSettingsReset}
        dependentAxisRange={uiState.dependentAxisRange}
        onDependentAxisRangeChange={handleDependentAxisRangeChange}
        onDependentAxisSettingsReset={handleDependentAxisSettingsReset}
        dependentAxisLogScale={uiState.dependentAxisLogScale}
        toggleDependentAxisLogScale={handleDependentAxisLogScale}
      />
    </div>
  );
}

function histogramResponseToDataSeries(
  name: string,
  response: HistogramResponse,
  color: string,
  type: HistogramVariable['type']
): HistogramDataSeries {
  if (response.histogram.data.length !== 1)
    throw Error(
      `Expected a single data series, but got ${response.histogram.data.length}`
    );
  const data = response.histogram.data[0];
  const bins = data.value.map((_, index) => ({
    binStart:
      type === 'number'
        ? Number(data.binStart[index])
        : String(data.binStart[index]),
    binEnd:
      type === 'number'
        ? Number(data.binEnd[index])
        : String(data.binEnd[index]),
    binLabel: data.binLabel[index],
    count: data.value[index],
  }));
  const summary = response.histogram.config.summary;
  return {
    name,
    color,
    bins,
    summary,
  };
}

type Config = Partial<HistogramRequestParams['config']>;

function getRequestParams(
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  dataParams?: UIState,
  rawConfig?: Config
): HistogramRequestParams {
  const binSpec: Config['binSpec'] = rawConfig?.binSpec
    ? rawConfig.binSpec
    : dataParams?.binWidth
    ? {
        type: 'binWidth',
        value: dataParams.binWidth,
        ...(variable.type === 'date'
          ? { units: dataParams.binWidthTimeUnit }
          : {}),
      }
    : { type: 'binWidth' };

  const viewport: Config['viewport'] = rawConfig?.viewport
    ? rawConfig.viewport
    : dataParams?.independentAxisRange &&
      dataParams?.independentAxisRange.min != null &&
      dataParams?.independentAxisRange.max != null
    ? {
        xMin: String(dataParams.independentAxisRange.min),
        xMax: String(dataParams.independentAxisRange.max),
      }
    : undefined;

  return {
    studyId,
    filters,
    config: {
      outputEntityId: entity.id,
      valueSpec: 'count',
      xAxisVariable: {
        entityId: entity.id,
        variableId: variable.id,
      },
      binSpec,
      viewport,
    },
  };
}

async function getHistogram(
  dataClient: DataClient,
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  dataParams?: UIState,
  rawConfig?: Config
) {
  return dataClient.getHistogram(
    'pass',
    getRequestParams(studyId, filters, entity, variable, dataParams, rawConfig)
  );
}
