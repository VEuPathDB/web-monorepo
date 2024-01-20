import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Filter,
  useAnalysis,
  useGetDefaultVariableDescriptor,
} from '../../core';
import { VariableDescriptor } from '../../core/types/variable';
import { useGetDefaultTimeVariableDescriptor } from './hooks/eztimeslider';
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import { useDeepValue } from '../../core/hooks/immutability';

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

const MarkerType = t.keyof({
  barplot: null,
  pie: null,
  bubble: null,
});

// user-specified selection
export type SelectedValues = t.TypeOf<typeof SelectedValues>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const SelectedValues = t.union([t.array(t.string), t.undefined]);

export type BinningMethod = t.TypeOf<typeof BinningMethod>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BinningMethod = t.union([
  t.literal('equalInterval'),
  t.literal('quantile'),
  t.literal('standardDeviation'),
  t.undefined,
]);

export type SelectedCountsOption = t.TypeOf<typeof SelectedCountsOption>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const SelectedCountsOption = t.union([
  t.literal('filtered'),
  t.literal('visible'),
  t.undefined,
]);

export type MarkerConfiguration = t.TypeOf<typeof MarkerConfiguration>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MarkerConfiguration = t.intersection([
  t.type({
    type: MarkerType,
    selectedVariable: VariableDescriptor,
  }),
  t.partial({
    activeVisualizationId: t.string,
  }),
  t.union([
    t.type({
      type: t.literal('barplot'),
      selectedValues: SelectedValues,
      selectedPlotMode: t.union([t.literal('count'), t.literal('proportion')]),
      binningMethod: BinningMethod,
      dependentAxisLogScale: t.boolean,
      selectedCountsOption: SelectedCountsOption,
    }),
    t.type({
      type: t.literal('pie'),
      selectedValues: SelectedValues,
      binningMethod: BinningMethod,
      selectedCountsOption: SelectedCountsOption,
    }),
    t.intersection([
      t.type({
        type: t.literal('bubble'),
      }),
      t.partial({
        aggregator: t.union([t.literal('mean'), t.literal('median')]),
        numeratorValues: t.union([t.array(t.string), t.undefined]),
        denominatorValues: t.union([t.array(t.string), t.undefined]),
      }),
    ]),
  ]),
]);

export const LittleFilters = t.record(t.string, t.array(Filter));
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LittleFilters = t.TypeOf<typeof LittleFilters>;

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    activeMarkerConfigurationType: MarkerType,
    markerConfigurations: t.array(MarkerConfiguration),
    isSidePanelExpanded: t.boolean,
  }),
  t.partial({
    boundsZoomLevel: t.type({
      zoomLevel: t.number,
      bounds: t.type({
        southWest: LatLngLiteral,
        northEast: LatLngLiteral,
      }),
    }),
    subsetVariableAndEntity: t.partial({
      entityId: t.string,
      variableId: t.string,
    }),
    isSubsetPanelOpen: t.boolean,
    timeSliderConfig: t.type({
      variable: t.union([VariableDescriptor, t.undefined]),
      selectedRange: t.union([
        t.type({
          start: t.string,
          end: t.string,
        }),
        t.undefined,
      ]),
      active: t.boolean,
    }),
    // note: I (BM) tried and failed to provide adequate type-protection on the keys of the record.
    // I couldn't get it to prevent excess keys and so decided there was no use typing it.
    littleFilters: LittleFilters,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppState = t.TypeOf<typeof AppState>;

export function useAppState(
  uiStateKey: string,
  analysisId?: string,
  singleAppMode?: string
) {
  const analysisState = useAnalysis(analysisId, singleAppMode);

  // make some backwards compatability updates to the appstate retrieved from the back end
  const [appStateChecked, setAppStateChecked] = useState(false);

  useEffect(() => {
    // flip bit when analysis id changes
    setAppStateChecked(false);
  }, [analysisId]);

  const { analysis, setVariableUISettings } = analysisState;
  const appState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElseW(() => undefined)
  );

  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const defaultVariable = getDefaultVariableDescriptor();

  const getDefaultTimeVariableDescriptor =
    useGetDefaultTimeVariableDescriptor();
  const defaultTimeVariable = getDefaultTimeVariableDescriptor();

  const defaultAppState: AppState = useMemo(
    () => ({
      viewport: defaultViewport,
      mouseMode: 'default',
      activeMarkerConfigurationType: 'pie',
      isSidePanelExpanded: true,
      timeSliderConfig: {
        variable: defaultTimeVariable,
        active: true,
        selectedRange: undefined,
      },
      littleFilters: {},
      markerConfigurations: [
        {
          type: 'pie',
          selectedVariable: defaultVariable,
          selectedValues: undefined,
          binningMethod: undefined,
          selectedCountsOption: 'filtered',
        },
        {
          type: 'barplot',
          selectedPlotMode: 'count',
          selectedVariable: defaultVariable,
          selectedValues: undefined,
          binningMethod: undefined,
          dependentAxisLogScale: false,
          selectedCountsOption: 'filtered',
        },
        {
          type: 'bubble',
          selectedVariable: defaultVariable,
          aggregator: 'mean',
          numeratorValues: undefined,
          denominatorValues: undefined,
        },
      ],
    }),
    [defaultVariable, defaultTimeVariable]
  );

  useEffect(() => {
    if (appStateChecked) return;
    if (analysis) {
      if (!appState) {
        setVariableUISettings((prev) => ({
          ...prev,
          [uiStateKey]: defaultAppState,
        }));
      } else {
        // Ensures forward compatibility of analyses with new marker types
        const missingMarkerConfigs =
          defaultAppState.markerConfigurations.filter(
            (defaultConfig) =>
              !appState.markerConfigurations.some(
                (config) => config.type === defaultConfig.type
              )
          );

        // refactored these into two calls to setVariableUISettings to be more readable and future-proof
        if (missingMarkerConfigs.length > 0)
          setVariableUISettings((prev) => ({
            ...prev,
            [uiStateKey]: {
              ...appState,
              markerConfigurations: [
                ...appState.markerConfigurations,
                ...missingMarkerConfigs,
              ],
            },
          }));

        const timeSliderConfigIsMissing = appState.timeSliderConfig == null;
        if (timeSliderConfigIsMissing)
          setVariableUISettings((prev) => ({
            ...prev,
            [uiStateKey]: {
              ...appState,
              timeSliderConfig: defaultAppState.timeSliderConfig,
            },
          }));
      }
      setAppStateChecked(true);
    }
  }, [
    analysis,
    appState,
    setVariableUISettings,
    uiStateKey,
    defaultAppState,
    appStateChecked,
  ]);

  function useSetter<T extends keyof AppState>(
    key: T,
    createIfUnsaved = false
  ) {
    return useCallback(
      function setter(value: AppState[T]) {
        setVariableUISettings((prev) => {
          const prevValue = prev[uiStateKey][key];
          if (!isEqual(prevValue, value)) {
            return {
              ...prev,
              [uiStateKey]: {
                ...prev[uiStateKey],
                [key]: value,
              },
            };
          }
          return prev;
        }, createIfUnsaved);
      },
      [key, createIfUnsaved]
    );
  }

  return {
    appState,
    analysisState,
    setActiveMarkerConfigurationType: useSetter(
      'activeMarkerConfigurationType',
      true
    ),
    setMarkerConfigurations: useSetter('markerConfigurations', true),
    setBoundsZoomLevel: useSetter('boundsZoomLevel'),
    setIsSidePanelExpanded: useSetter('isSidePanelExpanded'),
    setSubsetVariableAndEntity: useSetter('subsetVariableAndEntity'),
    setViewport: useSetter('viewport'),
    setTimeSliderConfig: useSetter('timeSliderConfig', true),
    setLittleFilters: useSetter('littleFilters', true),
  };
}

// convenience function concatenate desired little filters
function pickLittleFilters(
  littleFilters: LittleFilters | undefined,
  keys: string[]
): Filter[] {
  return keys.reduce<Filter[]>((accumulator, currentKey) => {
    const currentArray = littleFilters?.[currentKey];
    if (currentArray) {
      return accumulator.concat(currentArray);
    }
    return accumulator;
  }, []);
}

// hook to do basic picking and concatenation of filters and little filters
interface useLittleFiltersProps {
  filters: Filter[] | undefined;
  littleFilters: LittleFilters | undefined;
  filterTypes: string[];
}

export function useLittleFilters(props: useLittleFiltersProps) {
  const littleFilters = useDeepValue(
    pickLittleFilters(props.littleFilters, props.filterTypes)
  );
  const filters = useMemo(
    () => [...(props.filters ?? []), ...littleFilters],
    [props.filters, littleFilters]
  );

  return {
    littleFilters,
    filters,
  };
}
