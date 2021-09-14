import SelectedRangeControl from '@veupathdb/components/lib/components/plotControls/SelectedRangeControl';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import Button from '@veupathdb/components/lib/components/widgets/Button';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { NumberRangeInput } from '@veupathdb/components/lib/components/widgets/NumberAndDateRangeInputs';

import Histogram, {
  HistogramProps,
} from '@veupathdb/components/lib/plots/Histogram';
import {
  DateRange,
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
import { number, partial, TypeOf, boolean, type, intersection } from 'io-ts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePromise } from '../../hooks/promise';
import { AnalysisState } from '../../hooks/analysis';
import { useSubsettingClient } from '../../hooks/workspace';
import { DateRangeFilter, NumberRangeFilter } from '../../types/filter';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { TimeUnit, NumberOrDateRange, NumberRange } from '../../types/general';
import { gray, red } from './colors';
import { HistogramVariable } from './types';
import { fullISODateRange, padISODateTime } from '../../utils/date-conversion';
import { getDistribution } from './util';
import { DistributionResponse } from '../../api/subsetting-api';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
// import axis label unit util
import { axisLabelWithUnit } from '../../utils/axis-label-unit';
// import variable's metadata-based independent axis range utils
import { defaultIndependentAxisRange } from '../../utils/default-independent-axis-range';

type Props = {
  studyMetadata: StudyMetadata;
  variable: HistogramVariable;
  entity: StudyEntity;
  totalEntityCount: number;
  analysisState: AnalysisState;
};

// export UIState
export type UIState = TypeOf<typeof UIState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UIState = intersection([
  type({
    binWidth: number,
    independentAxisRange: NumberOrDateRange,
    dependentAxisLogScale: boolean,
  }),
  partial({
    binWidthTimeUnit: TimeUnit,
    dependentAxisRange: NumberRange,
  }),
]);

export function HistogramFilter(props: Props) {
  const {
    variable,
    entity,
    analysisState,
    studyMetadata,
    totalEntityCount,
  } = props;
  const { setFilters } = analysisState;
  const filters = analysisState.analysis?.filters;
  const uiStateKey = `${entity.id}/${variable.id}`;

  // compute default independent range from meta-data based util
  const defaultIndependentRange: NumberOrDateRange | undefined = useMemo(
    () => defaultIndependentAxisRange(variable, 'histogram'),
    [variable]
  );

  // get as much default UI state from variable annotations as possible
  const defaultUIState: UIState = useMemo(() => {
    const otherDefaults = {
      dependentAxisLogScale: false,
    };

    if (variable.type === 'number')
      return {
        binWidth: variable.binWidthOverride ?? variable.binWidth ?? 0.1,
        binWidthTimeUnit: undefined,
        independentAxisRange: defaultIndependentRange as NumberRange,
        ...otherDefaults,
      };

    // else date variable
    const binWidth = variable.binWidthOverride ?? variable.binWidth;
    const binUnits = variable.binUnits;

    return {
      binWidth: binWidth ?? 1,
      binWidthTimeUnit: binUnits ?? variable.binUnits!, // bit nasty!
      independentAxisRange: defaultIndependentRange as DateRange,
      ...otherDefaults,
    };
  }, [variable]);

  const uiState = useMemo(() => {
    return pipe(
      UIState.decode(analysisState.analysis?.variableUISettings[uiStateKey]),
      getOrElse((): UIState => defaultUIState)
    );
  }, [analysisState.analysis?.variableUISettings, uiStateKey, defaultUIState]);
  const subsettingClient = useSubsettingClient();
  const getData = useCallback(
    async (
      dataParams: UIState
    ): Promise<
      HistogramData & {
        variableId: string;
        entityId: string;
        hasDataEntitiesCount: number;
      }
    > => {
      const distribution = await getDistribution<DistributionResponse>(
        {
          entityId: entity.id,
          variableId: variable.id,
          filters: analysisState.analysis?.filters,
        },
        (filters) => {
          return subsettingClient.getDistribution(
            studyMetadata.id,
            entity.id,
            variable.id,
            {
              valueSpec: 'count',
              filters,
              binSpec: {
                displayRangeMin: dataParams.independentAxisRange.min,
                displayRangeMax: dataParams.independentAxisRange.max,
                binWidth: dataParams.binWidth,
                binUnits: dataParams.binWidthTimeUnit,
              },
            }
          );
        }
      );

      const entityDisplayNamePlural =
        entity.displayNamePlural ?? entity.displayName;

      const series = [
        distributionResponseToDataSeries(
          `All ${entityDisplayNamePlural}`,
          distribution.background,
          gray,
          variable.type
        ),
        distributionResponseToDataSeries(
          `Subset of ${entityDisplayNamePlural}`,
          distribution.foreground,
          red,
          variable.type
        ),
      ];
      const binWidth: NumberOrTimeDelta =
        variable.type === 'number'
          ? dataParams.binWidth
          : {
              value: dataParams.binWidth,
              unit: dataParams.binWidthTimeUnit ?? 'year',
            };
      const { min, max, step } = computeBinSlider(
        variable.type,
        dataParams.independentAxisRange
      );
      const binWidthRange = (variable.type === 'number'
        ? { min, max }
        : {
            min,
            max,
            unit: (binWidth as TimeDelta).unit,
          }) as NumberOrTimeDeltaRange;
      const binWidthStep = step || 0.1;

      const hasDataEntitiesCount =
        distribution.background.statistics.numDistinctEntityRecords;

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
    [
      analysisState.analysis?.filters,
      entity.displayName,
      entity.displayNamePlural,
      entity.id,
      studyMetadata.id,
      subsettingClient,
      variable.id,
      variable.type,
    ]
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
    (newUiState: Partial<UIState>) => {
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
              {fgSummaryStats.min != null && (
                <>
                  <b>Min:</b>{' '}
                  {formatStatValue(fgSummaryStats.min, variable.type)} &emsp;
                </>
              )}
              {fgSummaryStats.mean != null && (
                <>
                  <b>Mean:</b>{' '}
                  {formatStatValue(fgSummaryStats.mean, variable.type)} &emsp;
                </>
              )}
              {fgSummaryStats.median != null && (
                <>
                  <b>Median:</b>{' '}
                  {formatStatValue(fgSummaryStats.median, variable.type)} &emsp;
                </>
              )}
              {fgSummaryStats.max != null && (
                <>
                  <b>Max:</b>{' '}
                  {formatStatValue(fgSummaryStats.max, variable.type)} &emsp;
                </>
              )}
            </div>
            <UnknownCount
              activeFieldState={{
                summary: { internalsCount: data.value?.hasDataEntitiesCount },
              }}
              dataCount={totalEntityCount}
              displayName={entity.displayNamePlural ?? entity.displayName}
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
          showSpinner={data.pending}
          variable={variable}
        />
      </div>
    </div>
  );
}

type HistogramPlotWithControlsProps = HistogramProps & {
  updateFilter: (selectedRange?: NumberRange | DateRange) => void;
  uiState: UIState;
  defaultUIState: UIState;
  updateUIState: (uiState: Partial<UIState>) => void;
  filter?: DateRangeFilter | NumberRangeFilter;
  variable?: HistogramVariable;
};

function HistogramPlotWithControls({
  data,
  updateFilter,
  uiState,
  defaultUIState,
  updateUIState,
  filter,
  variable,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  // set the state of truncation warning message
  const [
    truncatedIndependentAxisWarning,
    setTruncatedIndependentAxisWarning,
  ] = useState<string>('');
  const [
    truncatedDependentAxisWarning,
    setTruncatedDependentAxisWarning,
  ] = useState<string>('');

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
      updateUIState({
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
    [updateUIState]
  );

  const handleIndependentAxisSettingsReset = useCallback(() => {
    updateUIState({
      independentAxisRange: defaultUIState.independentAxisRange,
      binWidth: defaultUIState.binWidth,
      binWidthTimeUnit: defaultUIState.binWidthTimeUnit,
    });
    // add reset for truncation message as well
    setTruncatedIndependentAxisWarning('');
  }, [
    defaultUIState.binWidth,
    defaultUIState.binWidthTimeUnit,
    defaultUIState.independentAxisRange,
    updateUIState,
  ]);

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
    // add reset for truncation message as well
    setTruncatedDependentAxisWarning('');
  }, [defaultUIState.dependentAxisLogScale, updateUIState]);

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

  const selectedRange = useMemo((): NumberOrDateRange | undefined => {
    if (filter == null) return;
    return { min: filter.min, max: filter.max } as NumberOrDateRange;
  }, [filter]);

  // selectedRangeBounds is used for auto-filling the start (or end)
  // in the SelectedRangeControl
  const selectedRangeBounds = useMemo((): NumberOrDateRange | undefined => {
    return data?.series[0]?.summary && data?.valueType
      ? fullISODateRange(
          {
            min: data.series[0].summary.min,
            max: data.series[0].summary.max,
          } as NumberOrDateRange,
          data.valueType
        )
      : undefined;
  }, [data?.series, data?.valueType]);

  const handleSelectedRangeChange = useCallback(
    (range?: NumberOrDateRange) => {
      if (range) {
        updateFilter(
          enforceBounds(
            {
              min:
                typeof range.min === 'string'
                  ? padISODateTime(range.min)
                  : range.min,
              max:
                typeof range.max === 'string'
                  ? padISODateTime(range.max)
                  : range.max,
            } as NumberOrDateRange,
            selectedRangeBounds
          )
        );
      } else {
        updateFilter(); // clear the filter if range is undefined
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateFilter, selectedRangeBounds]
  );

  const widgetHeight = '4em';

  // set truncation flags: will see if this is reusable with other application
  const {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  } = useMemo(() => truncationConfig(defaultUIState, uiState), [
    defaultUIState,
    uiState,
  ]);

  // set useEffect for changing truncation warning message
  useEffect(() => {
    if (
      truncationConfigIndependentAxisMin ||
      truncationConfigIndependentAxisMax
    ) {
      setTruncatedIndependentAxisWarning(
        'Data has been truncated by range selection, as indicated by the light gray shading'
      );
    }
  }, [truncationConfigIndependentAxisMin, truncationConfigIndependentAxisMax]);

  useEffect(() => {
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data has been truncated by range selection, as indicated by the light gray shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <SelectedRangeControl
        label={'Subset on ' + axisLabelWithUnit(variable)}
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
        opacity={opacity}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        onSelectedRangeChange={handleSelectedRangeChange}
        barLayout={barLayout}
        dependentAxisLabel="Count"
        independentAxisLabel={axisLabelWithUnit(variable)}
        independentAxisRange={uiState.independentAxisRange}
        dependentAxisRange={uiState.dependentAxisRange}
        dependentAxisLogScale={uiState.dependentAxisLogScale}
        legendOptions={{
          verticalPosition: 'top',
          horizontalPosition: 'center',
          orientation: 'horizontal',
          verticalPaddingAdjustment: 20,
        }}
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

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis" containerStyles={{}}>
          <Switch
            label="Log Scale:"
            state={uiState.dependentAxisLogScale}
            onStateChange={handleDependentAxisLogScale}
            containerStyles={{
              paddingBottom: '0.3125em',
              minHeight: widgetHeight,
            }}
          />

          <NumberRangeInput
            label="Range:"
            range={uiState.dependentAxisRange}
            onRangeChange={(newRange?: NumberOrDateRange) => {
              handleDependentAxisRangeChange(newRange as NumberRange);
            }}
            allowPartialRange={false}
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
              containerStyles={{ maxWidth: '38.5em' }}
            />
          ) : null}
          <Button
            type={'outlined'}
            text={'Reset Y-axis to defaults'}
            onClick={handleDependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '60%',
              float: 'right',
            }}
          />
        </LabelledGroup>

        <LabelledGroup label="X-axis" containerStyles={{}}>
          <BinWidthControl
            binWidth={data?.binWidth}
            binWidthStep={data?.binWidthStep}
            binWidthRange={data?.binWidthRange}
            binUnit={uiState.binWidthTimeUnit ?? 'year'}
            binUnitOptions={
              data?.valueType === 'date'
                ? ['day', 'week', 'month', 'year']
                : undefined
            }
            onBinWidthChange={handleBinWidthChange}
            valueType={data?.valueType}
            containerStyles={{ minHeight: widgetHeight }}
          />

          <AxisRangeControl
            label="Range:"
            range={uiState.independentAxisRange}
            onRangeChange={handleIndependentAxisRangeChange}
            valueType={data?.valueType}
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
              containerStyles={{
                maxWidth: data?.valueType === 'date' ? '34.5em' : '38.5em',
              }}
            />
          ) : null}
          <Button
            type={'outlined'}
            text={'Reset X-axis to defaults'}
            onClick={handleIndependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '60%',
              float: 'right',
            }}
          />
        </LabelledGroup>
      </div>
    </div>
  );
}

function distributionResponseToDataSeries(
  name: string,
  response: DistributionResponse,
  color: string,
  type: HistogramVariable['type']
): HistogramDataSeries {
  const bins = response.histogram.map(
    ({ value, binStart, binEnd, binLabel }) => ({
      binStart: type === 'date' ? binStart : Number(binStart),
      binEnd: type === 'date' ? binEnd : Number(binEnd),
      binLabel,
      count: value,
    })
  );
  return {
    name,
    color,
    bins,
    summary: {
      min: response.statistics.subsetMin!,
      mean: response.statistics.subsetMean!,
      max: response.statistics.subsetMax!,
      q1: undefined!,
      q3: undefined!,
      median: undefined!,
    },
  };
}

// TODO [2021-07-10] - Use variable.precision when avaiable
function formatStatValue(
  value: string | number,
  type: HistogramVariable['type']
) {
  return type === 'date'
    ? String(value).replace(/T.*$/, '')
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      });
}

function computeBinSlider(
  type: HistogramVariable['type'],
  range: NumberOrDateRange
) {
  switch (type) {
    case 'date': {
      return { min: 1, max: 60, step: 1 };
    }
    case 'number': {
      const { min: rangeMin, max: rangeMax } = range as NumberRange;
      const rangeSize = Math.round((rangeMax - rangeMin) * 100) / 100;
      const max = rangeSize;
      const min = rangeSize / 1000;
      return { min, max, step: min };
    }
  }
}

function enforceBounds(
  range: NumberOrDateRange,
  bounds: NumberOrDateRange | undefined
) {
  if (bounds) {
    return {
      min: range.min < bounds.min ? bounds.min : range.min,
      max: range.max > bounds.max ? bounds.max : range.max,
    } as NumberOrDateRange;
  } else {
    return range;
  }
}
