import HistogramControls from '@veupathdb/components/lib/components/plotControls/HistogramControls';
import usePlotControls from '@veupathdb/components/lib/hooks/usePlotControls';
import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import {
  DateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  NumberRange,
} from '@veupathdb/components/lib/types/general';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { number, partial, TypeOf } from 'io-ts';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  DataClient,
  DateHistogramBinWidthResponse,
  DateHistogramRequestParams,
  NumericHistogramBinWidthResponse,
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
import { getDistribution } from './util';

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
      const distribution = await getDistribution<
        DateHistogramBinWidthResponse | NumericHistogramBinWidthResponse
      >(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters,
        },
        (filters) => {
          const params = getRequestParams(
            studyId,
            filters,
            entity,
            variable,
            dataParams
          );
          return variable.type === 'date'
            ? dataClient.getDateHistogramBinWidth(
                params as DateHistogramRequestParams
              )
            : dataClient.getNumericHistogramBinWidth(
                params as NumericHistogramRequestParams
              );
        }
      );
      const series = [
        histogramResponseToDataSeries(
          `All ${variable.displayName}`,
          distribution.background,
          gray
        ),
        histogramResponseToDataSeries(
          `Remaining ${variable.displayName}`,
          distribution.foreground,
          red
        ),
      ];
      const binWidth = parseInt(
        String(distribution.foreground.config.binWidth),
        10
      );
      const { min, max, step } = distribution.foreground.config.binSlider;
      const binWidthRange = (variable.type === 'number'
        ? ([min, max] as [number, number])
        : { min, max, unit: 'day' }) as NumberOrTimeDeltaRange;
      const binWidthStep = step;
      return {
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
                  min: (selectedRange as DateRange).min.toISOString(),
                  max: (selectedRange as DateRange).max.toISOString(),
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
            orientation={'horizontal'}
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
  const plotControls = usePlotControls<HistogramData>({
    data: data,
    histogram: {
      binWidthRange: data.binWidthRange,
      binWidthStep: data.binWidthStep,
      onBinWidthChange: getData,
      displaySelectedRangeControls: true,
      selectedRange:
        filter &&
        (filter.type === 'dateRange'
          ? {
              min: new Date(filter.min),
              max: new Date(filter.max),
            }
          : {
              min: filter.min,
              max: filter.max,
            }),
    },
    // onSelectedUnitChange: getData
  });

  useEffect(() => {
    if (
      plotControls.histogram.selectedRange &&
      plotControls.histogram.selectedRangeBounds
    ) {
      if (
        plotControls.histogram.selectedRangeBounds.min ===
          plotControls.histogram.selectedRange.min &&
        plotControls.histogram.selectedRangeBounds.max ===
          plotControls.histogram.selectedRange.max
      ) {
        updateFilter();
      } else {
        updateFilter(plotControls.histogram.selectedRange);
      }
    }
  }, [
    plotControls.histogram.selectedRange,
    plotControls.histogram.selectedRangeBounds,
    updateFilter,
  ]);

  useEffect(() => {
    if (data.binWidth == null) return;
    const newBinWidth =
      typeof data.binWidth === 'number' ? data.binWidth : data.binWidth[0];
    updateUIState({
      binWidth: newBinWidth,
    });
  }, [data.binWidth, updateUIState]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...histogramProps}
        {...plotControls}
        {...plotControls.histogram}
      />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
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
  color: string
): HistogramDataSeries {
  if (response.data.length !== 1)
    throw Error(
      `Expected a single data series, but got ${response.data.length}`
    );
  const data = response.data[0];
  const bins = data.value.map((_, index) => ({
    binStart: Number(data.binStart[index]),
    binEnd: Number(data.binStart[index]) + Number(response.config.binWidth),
    binLabel: data.binLabel[index],
    count: data.value[index],
  }));
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
