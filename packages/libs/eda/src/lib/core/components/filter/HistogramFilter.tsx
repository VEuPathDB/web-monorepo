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
} from '@veupathdb/components/lib/types/general';
import {
  BarLayoutOptions,
  HistogramData,
  HistogramDataSeries,
  OrientationOptions,
} from '@veupathdb/components/lib/types/plots';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { number, partial, TypeOf } from 'io-ts';
import React, { useCallback, useMemo, useState } from 'react';
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

type Props = {
  studyMetadata: StudyMetadata;
  variable: HistogramVariable;
  entity: StudyEntity;
  sessionState: SessionState;
};

type GetDataParams = {
  binWidth?: NumberOrTimeDelta;
  selectedUnit?: string;
};

const UIState = partial({
  binWidth: number,
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
      dataParams?: GetDataParams
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
              { binWidth: background.config.binWidth as NumberOrTimeDelta }
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
      const binWidth = parseInt(String(background.config.binWidth), 10) || 1;
      const { min, max, step } = background.config.binSlider;
      const binWidthRange = (variable.type === 'number'
        ? { min, max }
        : { min, max, unit: 'day' }) as NumberOrTimeDeltaRange;
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
      console.log('new selected range', selectedRange);
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
  getData: (params?: GetDataParams) => Promise<HistogramData>;
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
    ({ binWidth }: { binWidth: NumberOrTimeDelta }) => {
      const newBinWidth = typeof binWidth === 'number' ? binWidth : binWidth[0];
      updateUIState({
        binWidth: newBinWidth,
      });
    },
    [updateUIState]
  );

  // TODO Use UIState
  const [barLayout, setBarLayout] = useState('overlay');
  const [displayLegend, setDisplayLegend] = useState(true);
  const [displayLibraryControls, setDisplayLibraryControls] = useState(false);
  const [opacity, setOpacity] = useState(100);
  const [orientation, setOrientation] = useState<string>(
    histogramProps.orientation
  );
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
      : { min: new Date(filter.min + 'Z'), max: new Date(filter.max + 'Z') };
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
        orientation={orientation as OrientationOptions}
        barLayout={barLayout as BarLayoutOptions}
      />
      <HistogramControls
        label="Histogram Controls"
        valueType={data.valueType}
        barLayout={barLayout}
        onBarLayoutChange={setBarLayout}
        displayLegend={displayLegend}
        toggleDisplayLegend={() => setDisplayLegend((v) => !v)}
        displayLibraryControls={displayLibraryControls}
        toggleLibraryControls={() => setDisplayLibraryControls((v) => !v)}
        opacity={opacity}
        onOpacityChange={setOpacity}
        orientation={orientation as OrientationOptions}
        toggleOrientation={setOrientation}
        binWidth={data.binWidth!}
        onBinWidthChange={handleBinWidthChange}
        binWidthRange={data.binWidthRange!}
        binWidthStep={data.binWidthStep!}
        errorManagement={errorManagement}
        displaySelectedRangeControls
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
          : new Date(data.binStart[index] + 'Z'),
      binEnd:
        type === 'number'
          ? Number(data.binEnd[index])
          : new Date(data.binEnd[index] + 'Z'),
      binLabel: data.binLabel[index],
      count: data.value[index],
    }))
    .sort((a, b) => a.binStart.valueOf() - b.binStart.valueOf());
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
  dataParams?: GetDataParams
): NumericHistogramRequestParams | DateHistogramRequestParams {
  const binOption = dataParams?.binWidth
    ? {
        binWidth:
          variable.type === 'number'
            ? dataParams.binWidth
            : `${dataParams.binWidth} years`,
      }
    : {
        // numBins: 10,
      };
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
  dataParams?: GetDataParams
) {
  return variable.type === 'date'
    ? dataClient.getDateHistogramBinWidth(
        getRequestParams(
          studyId,
          filters,
          entity,
          variable,
          dataParams
        ) as DateHistogramRequestParams
      )
    : dataClient.getNumericHistogramBinWidth(
        getRequestParams(
          studyId,
          filters,
          entity,
          variable,
          dataParams
        ) as NumericHistogramRequestParams
      );
}
