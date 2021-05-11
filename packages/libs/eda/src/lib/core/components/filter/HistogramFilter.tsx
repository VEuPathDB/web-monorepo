import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
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
import { Loading } from '@veupathdb/wdk-client/lib/Components';
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
import { SessionState } from '../../hooks/session';
import { useDataClient } from '../../hooks/workspace';
import { DateRangeFilter, Filter, NumberRangeFilter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { TimeUnit, NumberOrDateRange, NumberRange } from '../../types/general';
import { gray, red } from './colors';
import { HistogramVariable } from './types';
import { padISODateTime } from '../../utils/date-conversion';

type Props = {
  studyMetadata: StudyMetadata;
  variable: HistogramVariable;
  entity: StudyEntity;
  sessionState: SessionState;
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

const defaultUIState: UIState = {
  dependentAxisLogScale: false,
};

export function HistogramFilter(props: Props) {
  const { variable, entity, sessionState, studyMetadata } = props;
  const { id: studyId } = studyMetadata;
  const { setFilters } = sessionState;
  const filters = sessionState.session?.filters;
  const uiStateKey = `${entity.id}/${variable.id}`;
  const uiState = useMemo(() => {
    return pipe(
      UIState.decode(sessionState.session?.variableUISettings[uiStateKey]),
      getOrElse((): UIState => defaultUIState)
    );
  }, [sessionState.session?.variableUISettings, uiStateKey]);
  const dataClient = useDataClient();
  const getData = useCallback(
    async (
      dataParams?: UIState
    ): Promise<
      HistogramData & {
        variableId: string;
        entityId: string;
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
          `Entire dataset`,
          background,
          gray,
          variable.type
        ),
        histogramResponseToDataSeries(
          `Current subset`,
          foreground,
          red,
          variable.type
        ),
      ];
      const binWidth: NumberOrTimeDelta =
        variable.type === 'number'
          ? background.histogram.config.binSpec.value || 1
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

      return {
        valueType: variable.type,
        series,
        binWidth,
        binWidthRange,
        binWidthStep,
        variableId: variable.id,
        entityId: entity.id,
      };
    },
    [dataClient, entity, filters, studyId, variable]
  );
  const data = usePromise(
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
        if (otherFilters.length != filters?.length) setFilters(otherFilters);
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
                  min: padISODateTime((selectedRange as DateRange).min),
                  max: padISODateTime((selectedRange as DateRange).max),
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
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

  // stats from foreground
  const fgSummaryStats = data?.value?.series[1].summary;

  // Note use of `key` used with HistogramPlotWithControls. This is a little hack to force
  // the range to be reset if the filter is removed.
  return (
    <div style={{ position: 'relative' }}>
      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && <pre>{String(data.error)}</pre>}
      {data.value &&
        data.value.variableId === variable.id &&
        data.value.entityId === entity.id &&
        fgSummaryStats && (
          <div>
            <div className="histogram-summary-stats">
              <b>Min:</b> {fgSummaryStats.min} &emsp; <b>Mean:</b>{' '}
              {fgSummaryStats.mean} &emsp;
              <b>Median:</b> {fgSummaryStats.median} &emsp; <b>Max:</b>{' '}
              {fgSummaryStats.max}
            </div>
            <HistogramPlotWithControls
              key={filters?.length ?? 0}
              filter={filter}
              data={data.value}
              getData={getData}
              width="100%"
              height={400}
              spacingOptions={{
                marginTop: 20,
                marginBottom: 20,
              }}
              orientation={'vertical'}
              barLayout={'overlay'}
              updateFilter={updateFilter}
              uiState={uiState}
              updateUIState={updateUIState}
              variableName={variable.displayName}
              entityName={entity.displayName}
            />
          </div>
        )}
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  getData: (params?: UIState) => Promise<HistogramData>; // TO DO: not used - get rid of?
  updateFilter: (selectedRange?: NumberRange | DateRange) => void;
  uiState: UIState;
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
    [data, updateFilter]
  );

  const handleBinWidthChange = useCallback(
    ({ binWidth: newBinWidth }: { binWidth: NumberOrTimeDelta }) => {
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
        independentAxisRange: newRange,
      });
    },
    [updateUIState]
  );

  const handleIndependentAxisSettingsReset = useCallback(() => {
    updateUIState({
      independentAxisRange: undefined,
      binWidth: undefined,
      binWidthTimeUnit: undefined,
    });
  }, [updateUIState]);

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
  }, [updateUIState]);

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

  const xRangeMin = data.series[0].summary?.min;
  const xRangeMax = data.series[0].summary?.max;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...histogramProps}
        data={data}
        selectedRange={selectedRange}
        opacity={opacity}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        onSelectedRangeChange={handleSelectedRangeChange}
        barLayout={barLayout}
        dependentAxisLabel={`Count of ${entityName}`}
        // add independentAxisLabel
        independentAxisLabel={variableName}
        dependentAxisRange={uiState.dependentAxisRange}
        dependentAxisLogScale={uiState.dependentAxisLogScale}
      />
      <HistogramControls
        label="Histogram Controls"
        valueType={data.valueType}
        barLayout={barLayout}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        opacity={opacity}
        orientation={histogramProps.orientation}
        binWidth={data.binWidth!}
        selectedUnit={
          data.binWidth && isTimeDelta(data.binWidth)
            ? data.binWidth.unit
            : undefined
        }
        onBinWidthChange={handleBinWidthChange}
        binWidthRange={data.binWidthRange!}
        binWidthStep={data.binWidthStep!}
        errorManagement={errorManagement}
        selectedRange={selectedRange}
        selectedRangeBounds={
          { min: xRangeMin, max: xRangeMax } as NumberOrDateRange
        }
        onSelectedRangeChange={handleSelectedRangeChange}
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
