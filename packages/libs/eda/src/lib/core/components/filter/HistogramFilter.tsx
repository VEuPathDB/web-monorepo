import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import {
  DateRange,
  ErrorManagement,
  NumberOrDateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  NumberRange,
  TimeDelta,
} from '@veupathdb/components/lib/types/general';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { number, string, partial, TypeOf } from 'io-ts';
import React, { useCallback, useMemo } from 'react';
import {
  DataClient,
  DateHistogramRequestParams,
  NumericHistogramRequestParams,
} from '../../api/data-api';
import { usePromise } from '../../hooks/promise';
import { SessionState } from '../../hooks/session';
import { useDataClient } from '../../hooks/workspace';
import { DateRangeFilter, Filter, NumberRangeFilter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { PromiseType } from '../../types/utility';
import { gray, red } from './colors';
import { HistogramVariable } from './types';
import {
  ISODateStringToZuluDate,
  parseTimeDelta,
} from '../../utils/date-conversion';
import { isTimeDelta } from '@veupathdb/components/lib/types/guards';

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
  binWidthTimeUnit: string,
});

export function HistogramFilter(props: Props) {
  const { variable, entity, sessionState, studyMetadata } = props;
  const { id: studyId } = studyMetadata;
  const { setFilters } = sessionState;
  const filters = sessionState.session?.filters;
  const uiStateKey = `${entity.id}/${variable.id}`;
  const uiState = useMemo(() => {
    return pipe(
      UIState.decode(sessionState.session?.variableUISettings[uiStateKey]),
      getOrElse((): TypeOf<typeof UIState> => ({}))
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
              {},
              background.config.binWidth
            )
          : background;

      const series = [
        histogramResponseToDataSeries(
          `All ${variable.displayName}`,
          background,
          gray,
          variable.type
        ),
        histogramResponseToDataSeries(
          `Remaining ${variable.displayName}`,
          foreground,
          red,
          variable.type
        ),
      ];
      const binWidth =
        variable.type === 'number'
          ? parseFloat(background.config.binWidth as string) || 1
          : parseTimeDelta(background.config.binWidth as string);
      const { min, max, step } = background.config.binSlider;
      const binWidthRange = (variable.type === 'number'
        ? { min, max }
        : {
            min,
            max,
            unit: (binWidth as TimeDelta)[1],
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
    useCallback(() => getData(uiState), [getData, uiState])
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
        if (otherFilters.length === 0 || filter == null) return;
        setFilters(otherFilters);
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
                  min: (selectedRange as DateRange).min
                    .toISOString()
                    .slice(0, 19),
                  max: (selectedRange as DateRange).max
                    .toISOString()
                    .slice(0, 19),
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
      if (uiState.binWidth === newUiState.binWidth) return;
      sessionState.setVariableUISettings({
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      });
    },
    [sessionState, uiStateKey, uiState]
  );

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
        data.value.entityId === entity.id && (
          <HistogramPlotWithControls
            key={filters?.length ?? 0}
            filter={filter}
            data={data.value}
            getData={getData}
            width={1000}
            height={400}
            orientation={'vertical'}
            barLayout={'overlay'}
            updateFilter={updateFilter}
            updateUIState={updateUIState}
          />
        )}
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  getData: (params?: UIState) => Promise<HistogramData>;
  updateFilter: (selectedRange?: NumberRange | DateRange) => void;
  updateUIState: (uiState: TypeOf<typeof UIState>) => void;
  filter?: DateRangeFilter | NumberRangeFilter;
};

function HistogramPlotWithControls({
  data,
  getData,
  updateFilter,
  updateUIState,
  filter,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  const handleSelectedRangeChange = useCallback(
    (range: NumberOrDateRange) => {
      if (range) {
        // FIXME Compare selection to data min/max
        const bins = data.series[0].bins;
        const min = bins[0].binStart;
        const max = bins[bins.length - 1].binEnd;
        if (range.min <= min && range.max >= max) {
          updateFilter();
        } else {
          updateFilter(range);
        }
      }
    },
    [data, updateFilter]
  );

  const handleBinWidthChange = useCallback(
    ({ binWidth: newBinWidth }: { binWidth: NumberOrTimeDelta }) => {
      updateUIState({
        binWidth: isTimeDelta(newBinWidth) ? newBinWidth[0] : newBinWidth,
        binWidthTimeUnit: isTimeDelta(newBinWidth) ? newBinWidth[1] : undefined,
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
    return filter.type === 'numberRange'
      ? { min: filter.min, max: filter.max }
      : {
          min: ISODateStringToZuluDate(filter.min),
          max: ISODateStringToZuluDate(filter.max),
        };
  }, [filter]);

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
            ? data.binWidth[1]
            : undefined
        }
        onBinWidthChange={handleBinWidthChange}
        binWidthRange={data.binWidthRange!}
        binWidthStep={data.binWidthStep!}
        errorManagement={errorManagement}
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
    </div>
  );
}

function histogramResponseToDataSeries(
  name: string,
  response: PromiseType<
    ReturnType<
      DataClient['getDateHistogramBinWidth' | 'getNumericHistogramBinWidth']
    >
  >,
  color: string,
  type: HistogramVariable['type']
): HistogramDataSeries {
  if (response.data.length !== 1)
    throw Error(
      `Expected a single data series, but got ${response.data.length}`
    );
  const data = response.data[0];
  const bins = data.value
    // FIXME Handle Dates properly
    .map((_, index) => ({
      binStart:
        type === 'number'
          ? Number(data.binStart[index])
          : ISODateStringToZuluDate(data.binStart[index]),
      binEnd:
        type === 'number'
          ? Number(data.binEnd[index])
          : ISODateStringToZuluDate(data.binEnd[index]),
      binLabel: data.binLabel[index],
      count: data.value[index],
    }))
    .sort((a, b) => a.binStart.valueOf() - b.binStart.valueOf()); // TO DO: review necessity of sort if back end (or plot component) does sorting?
  return {
    name,
    color,
    bins,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  dataParams?: UIState,
  rawBinWidth?: string | number
): NumericHistogramRequestParams | DateHistogramRequestParams {
  const binOption = rawBinWidth
    ? { binWidth: rawBinWidth }
    : dataParams?.binWidth
    ? {
        binWidth:
          variable.type === 'number'
            ? dataParams.binWidth
            : `${dataParams.binWidth} ${dataParams.binWidthTimeUnit}`,
      }
    : {};
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
      ...binOption,
    },
  } as NumericHistogramRequestParams | DateHistogramRequestParams;
}

async function getHistogram(
  dataClient: DataClient,
  studyId: string,
  filters: Filter[],
  entity: StudyEntity,
  variable: HistogramVariable,
  dataParams?: UIState,
  rawBinWidth?: string | number
) {
  return variable.type === 'date'
    ? dataClient.getDateHistogramBinWidth(
        'pass',
        getRequestParams(
          studyId,
          filters,
          entity,
          variable,
          dataParams,
          rawBinWidth
        ) as DateHistogramRequestParams
      )
    : dataClient.getNumericHistogramBinWidth(
        'pass',
        getRequestParams(
          studyId,
          filters,
          entity,
          variable,
          dataParams,
          rawBinWidth
        ) as NumericHistogramRequestParams
      );
}
