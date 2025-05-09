import SelectedRangeControl from '@veupathdb/components/lib/components/plotControls/SelectedRangeControl';
import BinWidthControl from '@veupathdb/components/lib/components/plotControls/BinWidthControl';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { Toggle } from '@veupathdb/coreui';
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
import { useCachedPromise } from '../../hooks/cachedPromise';
import { AnalysisState } from '../../hooks/analysis';
import { useSubsettingClient } from '../../hooks/workspace';
import { DateRangeFilter, NumberRangeFilter } from '../../types/filter';
import { NumberVariable, StudyEntity, StudyMetadata } from '../../types/study';
import { TimeUnit, NumberOrDateRange, NumberRange } from '../../types/general';
import { gray, red } from './colors';
import { HistogramVariable } from './types';
import { fullISODateRange, padISODateTime } from '../../utils/date-conversion';
import { getDistribution } from './util';
import { DistributionResponse } from '../../api/SubsettingClient';
// reusable util for computing truncationConfig
import { truncationConfig } from '../../utils/truncation-config-utils';
// use Notification for truncation warning message
import Notification from '@veupathdb/components/lib/components/widgets//Notification';
// import axis label unit util
import { variableDisplayWithUnit } from '../../utils/variable-display';
import { useDefaultAxisRange } from '../../hooks/computeDefaultAxisRange';
import { min, max, gt, lt } from 'lodash';
import { useDebounce } from '../../hooks/debouncing';
import { useDeepValue } from '../../hooks/immutability';
// reset to defaults button
import { ResetButtonCoreUI } from '../ResetButton';
import { numberSignificantFigures } from '../../utils/number-significant-figures';

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
  const { variable, entity, analysisState, studyMetadata, totalEntityCount } =
    props;
  const { setFilters } = analysisState;
  const filters = analysisState.analysis?.descriptor.subset.descriptor;
  const otherFilters = useDeepValue(
    filters?.filter(
      (f) => f.entityId !== entity.id || f.variableId !== variable.id
    )
  );
  const uiStateKey = `${entity.id}/${variable.id}`;

  // compute default independent range from meta-data based util
  const defaultIndependentRange = useDefaultAxisRange(variable);

  // get as much default UI state from variable annotations as possible
  const defaultUIState: UIState = useMemo(() => {
    const otherDefaults = {
      dependentAxisLogScale: false,
    };

    if (NumberVariable.is(variable))
      return {
        binWidth:
          variable.distributionDefaults.binWidthOverride ??
          numberSignificantFigures(
            variable.distributionDefaults.binWidth ?? 0.1,
            2
          ),
        binWidthTimeUnit: undefined,
        independentAxisRange: defaultIndependentRange as NumberRange,
        ...otherDefaults,
      };

    // else date variable
    const binWidth =
      variable.distributionDefaults.binWidthOverride ??
      variable.distributionDefaults.binWidth;
    const binUnits = variable.distributionDefaults.binUnits;

    return {
      binWidth: binWidth ?? 1,
      binWidthTimeUnit: binUnits ?? variable.distributionDefaults.binUnits!, // bit nasty!
      independentAxisRange: defaultIndependentRange as DateRange,
      ...otherDefaults,
    };
  }, [variable, defaultIndependentRange]);

  const variableUISettings =
    analysisState.analysis?.descriptor.subset.uiSettings;

  const uiState = useMemo(() => {
    return pipe(
      UIState.decode(variableUISettings?.[uiStateKey]),
      getOrElse((): UIState => defaultUIState)
    );
  }, [variableUISettings, uiStateKey, defaultUIState]);
  const dataParams = useDebounce(uiState, 1000);
  const subsettingClient = useSubsettingClient();

  const data = useCachedPromise(
    async (): Promise<
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
          filters: otherFilters,
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

      const binWidth: NumberOrTimeDelta = NumberVariable.is(variable)
        ? dataParams.binWidth
        : {
            value: dataParams.binWidth,
            unit: dataParams.binWidthTimeUnit ?? 'year',
          };
      const { min, max, step } = computeBinSlider(
        variable.type,
        dataParams.independentAxisRange
      );
      const binWidthRange = (
        NumberVariable.is(variable)
          ? { min, max }
          : {
              min,
              max,
              unit: (binWidth as TimeDelta).unit,
            }
      ) as NumberOrTimeDeltaRange;
      const binWidthStep = step || 0.1;

      const hasDataEntitiesCount =
        distribution.background.statistics.numDistinctEntityRecords;

      return {
        series,
        binWidthSlider: {
          valueType: NumberVariable.is(variable) ? 'number' : 'date',
          binWidth,
          binWidthRange,
          binWidthStep,
        },
        variableId: variable.id,
        entityId: entity.id,
        hasDataEntitiesCount: hasDataEntitiesCount ?? 0,
      };
    },
    [
      dataParams,
      otherFilters,
      entity.displayName,
      entity.displayNamePlural,
      entity.id,
      studyMetadata.id,
      variable,
    ] // used to have `subsettingClient`
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
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  // stats from foreground
  const fgSummaryStats = data?.value?.series[1].summary;
  const fgSummaryStatsMin = formatStatValue(fgSummaryStats?.min, variable.type);
  const fgSummaryStatsMean = formatStatValue(
    fgSummaryStats?.mean,
    variable.type
  );
  const fgSummaryStatsMax = formatStatValue(fgSummaryStats?.max, variable.type);

  const minPosVal = useMemo(
    () =>
      min(
        data.value?.series
          .flatMap((data) => data.bins)
          .map((data) => data.value)
          .filter((value) => value > 0)
      ) as number,
    [data]
  );

  const maxVal = useMemo(
    () =>
      max(
        data.value?.series
          .flatMap((data) => data.bins)
          .map((data) => data.value)
      ) as number,
    [data]
  );

  // set defaultDependentAxisRange
  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    minPosVal,
    maxVal,
    uiState.dependentAxisLogScale
  ) as NumberRange;

  // Note use of `key` used with HistogramPlotWithControls. This is a little hack to force
  // the range to be reset if the filter is removed.
  return (
    // set marginTop
    <div
      className="filter-param"
      style={{ position: 'relative', marginTop: '2em' }}
    >
      {data.error != null && <pre>{String(data.error)}</pre>}
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            minHeight: '1.5em',
          }}
        >
          {fgSummaryStats && (
            <div className="histogram-summary-stats">
              {/* display Min, Mean, and Max stats */}
              <DisplayStats title={'Min'} stats={fgSummaryStatsMin} />
              <DisplayStats title={'Mean'} stats={fgSummaryStatsMean} />
              <DisplayStats title={'Max'} stats={fgSummaryStatsMax} />
            </div>
          )}
          {data.value?.hasDataEntitiesCount != null && (
            <UnknownCount
              activeFieldState={{
                summary: { internalsCount: data.value.hasDataEntitiesCount },
              }}
              dataCount={totalEntityCount}
              displayName={entity.displayNamePlural ?? entity.displayName}
            />
          )}
        </div>
        <HistogramPlotWithControls
          key={otherFilters?.length ?? 0}
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
          defaultDependentAxisRange={defaultDependentAxisRange}
          dependentAxisMinPosMaxRange={{ min: minPosVal, max: maxVal }}
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
  defaultDependentAxisRange?: NumberRange | undefined;
  /** truncation detection requires the minPos to max range */
  dependentAxisMinPosMaxRange?: NumberRange | undefined;
};

function HistogramPlotWithControls({
  data,
  updateFilter,
  uiState,
  defaultUIState,
  updateUIState,
  filter,
  variable,
  defaultDependentAxisRange,
  dependentAxisMinPosMaxRange,
  ...histogramProps
}: HistogramPlotWithControlsProps) {
  // set the state of truncation warning message
  const [truncatedIndependentAxisWarning, setTruncatedIndependentAxisWarning] =
    useState<string>('');
  const [truncatedDependentAxisWarning, setTruncatedDependentAxisWarning] =
    useState<string>('');

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

  // For integer variables, the graphical range highlighting needs to extend to (max + 1).
  // This compensates for the (max - 1) adjustment in handleSelectedRangeChange.
  // The (max - 1) logic is necessitated by the both-ends-inclusivity of filters, which is most
  // noticable with integers. This approach does not handle real-valued variables with values
  // that coincide with bin boundaries, and we don't have a plan yet how to deal with it. Subtracting
  // 1e-8 does not seem attractive!
  // Full description in https://github.com/VEuPathDB/web-monorepo/issues/1200
  const selectedRangeForHighlighting = useMemo(():
    | NumberOrDateRange
    | undefined => {
    if (selectedRange == null || variable == null) return;
    if (variable.type === 'integer') {
      return {
        min: selectedRange.min,
        max: (selectedRange.max as number) + 1,
      } as NumberRange;
    } else return selectedRange;
  }, [selectedRange, variable]);

  // selectedRangeBounds is used for auto-filling the start (or end)
  // in the SelectedRangeControl
  const selectedRangeBounds = useMemo((): NumberOrDateRange | undefined => {
    return data?.series[0]?.summary && data?.binWidthSlider?.valueType
      ? fullISODateRange(
          {
            min: data?.series[0].bins[0].binStart,
            max: data?.series[0].bins[data.series[0].bins.length - 1].binEnd,
          } as NumberOrDateRange,
          data.binWidthSlider?.valueType
        )
      : undefined;
  }, [data?.series, data?.binWidthSlider?.valueType]);

  const handleSelectedRangeChangeForHistogram = useRangeChangeHandler({
    selectedRangeBounds,
    variable,
    updateFilter,
    adjustMax: true,
  });
  const handleSelectedRangeChangeForTextInputs = useRangeChangeHandler({
    selectedRangeBounds,
    variable,
    updateFilter,
    adjustMax: false,
  });

  const widgetHeight = '4em';

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
          independentAxisRange: defaultUIState.independentAxisRange,
          dependentAxisRange: dependentAxisMinPosMaxRange,
        },
        uiState,
        {}, // no overrides
        true // use inclusive less than or equal to for min
      ),
    [defaultUIState.independentAxisRange, dependentAxisMinPosMaxRange, uiState]
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
  }, [truncationConfigIndependentAxisMin, truncationConfigIndependentAxisMax]);

  useEffect(() => {
    if (truncationConfigDependentAxisMin || truncationConfigDependentAxisMax) {
      setTruncatedDependentAxisWarning(
        'Data may have been truncated by range selection, as indicated by the yellow shading'
      );
    }
  }, [truncationConfigDependentAxisMin, truncationConfigDependentAxisMax]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <SelectedRangeControl
        label={'Subset on ' + variableDisplayWithUnit(variable)}
        valueType={data?.binWidthSlider?.valueType}
        selectedRange={selectedRange}
        selectedRangeBounds={selectedRangeBounds}
        onSelectedRangeChange={handleSelectedRangeChangeForTextInputs}
        inclusive={true}
      />
      <Histogram
        {...histogramProps}
        data={data}
        binStartType="inclusive"
        binEndType="exclusive"
        interactive={true}
        selectedRange={selectedRangeForHighlighting}
        opacity={opacity}
        displayLegend={displayLegend}
        displayLibraryControls={displayLibraryControls}
        onSelectedRangeChange={handleSelectedRangeChangeForHistogram}
        barLayout={barLayout}
        dependentAxisLabel="Count"
        independentAxisLabel={variableDisplayWithUnit(variable)}
        independentAxisRange={uiState.independentAxisRange}
        // pass defaultDependentAxisRange as a default range
        dependentAxisRange={
          uiState.dependentAxisRange ?? defaultDependentAxisRange
        }
        dependentAxisLogScale={uiState.dependentAxisLogScale}
        legendOptions={{
          verticalPosition: 'top',
          horizontalPosition: 'center',
          orientation: 'horizontal',
          verticalPaddingAdjustment: 20,
          // use traceorder: reversed to show subset legend at first
          traceorder: 'reversed',
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* set Undo icon and its behavior */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LabelledGroup label="X-axis controls"> </LabelledGroup>
            <div style={{ marginLeft: '-1em', width: '50%' }}>
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
              marginLeft: '1em',
              marginTop: '-0.5em',
            }}
          >
            <BinWidthControl
              binWidth={data?.binWidthSlider?.binWidth}
              binWidthStep={data?.binWidthSlider?.binWidthStep}
              binWidthRange={data?.binWidthSlider?.binWidthRange}
              binUnit={uiState.binWidthTimeUnit ?? 'year'}
              binUnitOptions={
                data?.binWidthSlider?.valueType === 'date'
                  ? ['day', 'week', 'month', 'year']
                  : undefined
              }
              onBinWidthChange={handleBinWidthChange}
              valueType={data?.binWidthSlider?.valueType}
              containerStyles={{ minHeight: widgetHeight }}
            />
            <AxisRangeControl
              label="Range"
              range={uiState.independentAxisRange}
              onRangeChange={handleIndependentAxisRangeChange}
              valueType={data?.binWidthSlider?.valueType}
              containerStyles={{ minWidth: '400px' }}
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
                  maxWidth: '36.7em',
                }}
              />
            ) : null}
          </div>
        </div>

        {/* add vertical line in btw Y- and X- controls */}
        <div
          style={{
            display: 'inline-flex',
            borderLeft: '2px solid lightgray',
            height: '10.6em',
            position: 'relative',
            marginLeft: '1.0em',
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
            <div style={{ marginLeft: '-1em', width: '50%' }}>
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
              value={uiState.dependentAxisLogScale}
              onChange={handleDependentAxisLogScale}
              styleOverrides={{
                container: {
                  paddingBottom: '0.3125em',
                  minHeight: widgetHeight,
                },
              }}
              themeRole="primary"
            />
            <NumberRangeInput
              label="Range"
              range={uiState.dependentAxisRange ?? defaultDependentAxisRange}
              onRangeChange={(newRange?: NumberOrDateRange) => {
                handleDependentAxisRangeChange(newRange as NumberRange);
              }}
              allowPartialRange={false}
              containerStyles={{ minWidth: '400px' }}
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
                containerStyles={{ maxWidth: '36.7em' }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function distributionResponseToDataSeries(
  name: string,
  response: DistributionResponse,
  color: string,
  type: HistogramVariable['type']
): HistogramDataSeries {
  const bins = response.histogram.map(
    ({ value, binStart, binEnd, binLabel }) => ({
      binStart: type === 'date' ? binStart : Number(binStart),
      binEnd: type === 'date' ? binEnd : Number(binEnd),
      binLabel: tidyBinLabel(binLabel),
      value: value,
    })
  );
  return {
    name,
    color,
    bins,
    summary: {
      min: response.statistics.subsetMin,
      mean: response.statistics.subsetMean,
      max: response.statistics.subsetMax,
      median: undefined!,
      q1: undefined!,
      q3: undefined!,
    },
  };
}

/**
 * If input matches the following style of non-exponent numbers (integer or floating point)
 * "[71838.4,107757.59999999999)"
 *
 * then shorten the numbers whose string length is
 * greater than 6, to a 3 significant figure version, and return the reconstructed label
 * e.g. "[7.18e+5,10.8e+6)"
 *
 * Fails safe - returns the input if the various patterns don't match.
 */
function tidyBinLabel(
  binLabel: string,
  maxLength: number = 6,
  precision: number = 3
): string {
  const matches = binLabel.match(/^\[(-?\d+(?:\.\d+)),(-?\d+(?:\.\d+))\)$/);
  if (matches != null && matches.length === 3) {
    // matches array starts with full match of pattern
    const [binStart, binEnd] = matches
      .slice(1)
      .map((s) =>
        s.length > maxLength ? Number(s).toPrecision(precision) : s
      );
    return `[${binStart},${binEnd})`;
  }
  return binLabel;
}

// TODO [2021-07-10] - Use variable.precision when avaiable
// UPDATE [2022-08-10] - precision is available but can be 11 for
// 'School-age children in village count' from SCORE Mozambique for example.
//
// TODO [2022-08-10] - Consider using numberSignificantFiguresRoundUp/Down
//                     (but the date exception thing is useful)
// UPDATE [2023-04-04] - Introduced scientific notation, Handling year variable
function formatStatValue(
  value: string | number | undefined,
  type: HistogramVariable['type']
): string | number | string[] {
  if (value == null) return 'N/A';

  let formattedValue: string | number | string[] =
    type === 'date'
      ? String(value).replace(/T.*$/, '')
      : // set conditions similar to plotly
      gt(Number(value), 100000) ||
        (Number(value) !== 0 && lt(Math.abs(Number(value)), 0.0001))
      ? Number(value).toExponential(4)
      : Number.isInteger(value)
      ? Number(value)
      : Number(value).toFixed(4);

  // treating negative exponent
  if (typeof formattedValue === 'string' && formattedValue.includes('e')) {
    formattedValue = formattedValue.includes('e-')
      ? formattedValue.split('e')
      : formattedValue.split('e+');
  }

  return formattedValue;
}

function computeBinSlider(
  type: HistogramVariable['type'],
  range: NumberOrDateRange
) {
  const [minBins, maxBins] = [2, 1000];
  switch (type) {
    case 'date': {
      return { min: 1, max: 60, step: 1 };
    }
    case 'integer': {
      const { min: rangeMin, max: rangeMax } = range as NumberRange;
      const rangeSize = rangeMax - rangeMin;
      const stepSize = Math.floor(rangeSize / maxBins);
      const min = stepSize < 1 ? 1 : stepSize;
      const max = Math.floor(rangeSize / minBins);
      return { min, max, step: min };
    }
    case 'number': {
      const { min: rangeMin, max: rangeMax } = range as NumberRange;
      const rangeSize = rangeMax - rangeMin;
      const max = Number((rangeSize / minBins).toPrecision(2));
      const min = Number((rangeSize / maxBins).toPrecision(2));
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

interface DisplayStatsProps {
  /* title: Min, Mean, Max */
  title: string;
  /* Min, Mean, Max */
  stats: string | number | string[];
}

// component for displaying Min, Mean, and Max stats
const DisplayStats = (props: DisplayStatsProps) => {
  const { title, stats } = props;

  return (
    <>
      <b>{title}:</b> {Array.isArray(stats) ? stats[0] : stats}
      {Array.isArray(stats) ? <span>&#215;10</span> : ''}
      {Array.isArray(stats) ? <sup>{stats[1]}</sup> : ''} &emsp;
    </>
  );
};

// hook to make two flavours of range change handler
function useRangeChangeHandler(props: {
  updateFilter: (selectedRange?: NumberRange | DateRange) => void;
  variable: HistogramVariable | undefined;
  adjustMax: boolean;
  selectedRangeBounds: NumberRange | DateRange | undefined;
}) {
  const { updateFilter, variable, adjustMax, selectedRangeBounds } = props;

  return useCallback(
    (range?: NumberOrDateRange) => {
      if (variable) {
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
                    : variable.type === 'integer' && adjustMax
                    ? range.max - 1
                    : range.max,
              } as NumberOrDateRange,
              selectedRangeBounds
            )
          );
        } else {
          updateFilter(); // clear the filter if range is undefined
        }
      }
    },
    [updateFilter, selectedRangeBounds, variable, adjustMax]
  );
}
