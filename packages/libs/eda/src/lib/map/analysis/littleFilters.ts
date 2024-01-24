import { AnalysisState, Filter, useFindEntityAndVariable } from '../../core';
import { useMemo } from 'react';
import { AppState } from './appState';
import { UNSELECTED_TOKEN } from '../constants';
import { filtersFromBoundingBox } from '../../core/utils/visualization';
import { GeoConfig } from '../../core/types/geoConfig';
import { useDeepValue } from '../../core/hooks/immutability';

export type LittleFilterTypes = 'time-slider' | 'marker-config' | 'viewport';

interface LittleFilter {
  type: LittleFilterTypes;
  filters: Filter[];
}

interface useLittleFiltersProps {
  filters: Filter[] | undefined;
  appState: AppState;
  geoConfigs: GeoConfig[];
  filterTypes: Set<LittleFilterTypes>;
}

// props:
// regular `filters`, `appState`, `geoConfigs` and the set of `filterTypes` that you want to use
//
// returns:
// filters : Filter[], // main and designated little filters concatenated together, referentially stable
// littleFilters: Filter[], // just the designated little filters, also referentially stable
//
export function useLittleFilters(props: useLittleFiltersProps) {
  const viewportFilter = useViewportFilter(props);
  const timeSliderFilter = useTimeSliderFilter(props);
  const markerConfigFilter = useMarkerConfigFilter(props);

  const littleFilters = useDeepValue(
    useMemo(
      () =>
        [viewportFilter, timeSliderFilter, markerConfigFilter]
          .filter(({ type }) => props.filterTypes.has(type)) // concatenate only the ones we need
          .flatMap(({ filters }) => filters),
      [viewportFilter, timeSliderFilter, markerConfigFilter, props.filterTypes]
    )
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

// TO DO: can we somehow move this marker-mode-specific code to the relevant marker mode sources?
export function useMarkerConfigFilter(
  props: useLittleFiltersProps
): LittleFilter {
  const {
    appState: { markerConfigurations, activeMarkerConfigurationType },
  } = props;

  const findEntityAndVariable = useFindEntityAndVariable(props.filters);

  const activeMarkerConfiguration = markerConfigurations.find(
    (markerConfig) => markerConfig.type === activeMarkerConfigurationType
  );

  const filters = useMemo(() => {
    // This doesn't seem ideal. Do we ever have no active config?
    if (activeMarkerConfiguration == null) return [];
    const { selectedVariable, type } = activeMarkerConfiguration;
    const { variable } = findEntityAndVariable(selectedVariable) ?? {};
    if (variable != null) {
      if (
        (variable.dataShape === 'categorical' ||
          variable.dataShape === 'binary') &&
        variable.vocabulary != null
      ) {
        // are the 'true categorical' modes have no user-selections or are in 'all other values' mode?
        if (
          ((type === 'pie' || type === 'barplot') &&
            (activeMarkerConfiguration.selectedValues == null ||
              activeMarkerConfiguration.selectedValues.includes(
                UNSELECTED_TOKEN
              ))) ||
          (type === 'bubble' &&
            activeMarkerConfiguration.numeratorValues == null &&
            activeMarkerConfiguration.denominatorValues == null)
        ) {
          return [
            {
              type: 'stringSet' as const,
              ...selectedVariable,
              stringSet: variable.vocabulary,
            },
          ];
        } else if (type === 'pie' || type === 'barplot') {
          // we have selected values in pie or barplot mode and no "all other values"
          if (
            activeMarkerConfiguration.selectedValues != null &&
            activeMarkerConfiguration.selectedValues.length > 0
          )
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: activeMarkerConfiguration.selectedValues,
              },
            ];
          // Edge case where all values are deselected in the marker configuration table
          // and we want the back end filters to return nothing.
          // This is hopefully a workable solution. It is not allowed to pass an
          // empty array to a `stringSet` filter.
          else
            return [
              {
                type: 'stringSet' as const,
                ...selectedVariable,
                stringSet: ['avaluewewillhopefullyneversee'],
              },
            ];
        } else {
          // must be bubble with custom proportion configuration
          // use all the selected values from both
          const allSelectedValues = Array.from(
            new Set([
              ...(activeMarkerConfiguration.numeratorValues ?? []),
              ...(activeMarkerConfiguration.denominatorValues ?? []),
            ])
          );

          return [
            {
              type: 'stringSet' as const,
              ...selectedVariable,
              stringSet:
                allSelectedValues.length > 0
                  ? allSelectedValues
                  : ['avaluewewillhopefullyneversee'],
            },
          ];
        }
      } else if (variable.type === 'number' || variable.type === 'integer') {
        return [
          {
            type: 'numberRange' as const,
            ...selectedVariable,
            min: variable.distributionDefaults.rangeMin,
            max: variable.distributionDefaults.rangeMax, // TO DO: check we use this, not display ranges
          },
        ];
      } else if (variable.type === 'date') {
        return [
          {
            type: 'dateRange' as const,
            ...selectedVariable,
            min: variable.distributionDefaults.rangeMin + 'T00:00:00Z',
            max: variable.distributionDefaults.rangeMax + 'T00:00:00Z',
            // TO DO: check we use this, not display ranges
          },
        ];
      } else {
        throw new Error('unknown variable type or missing vocabulary');
      }
    }
    return [];
  }, [activeMarkerConfiguration, findEntityAndVariable]);

  return useMemo(
    () => ({
      type: 'marker-config',
      filters,
    }),
    [filters]
  );
}

export function useViewportFilter(props: useLittleFiltersProps): LittleFilter {
  const {
    appState: { boundsZoomLevel },
    geoConfigs,
  } = props;
  const geoConfig = geoConfigs[0]; // not ideal...
  return useMemo(
    () => ({
      type: 'viewport',
      filters:
        boundsZoomLevel == null
          ? []
          : filtersFromBoundingBox(
              boundsZoomLevel.bounds,
              {
                variableId: geoConfig.latitudeVariableId,
                entityId: geoConfig.entity.id,
              },
              {
                variableId: geoConfig.longitudeVariableId,
                entityId: geoConfig.entity.id,
              }
            ),
    }),
    [boundsZoomLevel, geoConfig]
  );
}

// perhaps this should go with the timeslider code?
export function useTimeSliderFilter(
  props: useLittleFiltersProps
): LittleFilter {
  const { timeSliderConfig } = props.appState;

  const filters = useMemo(() => {
    if (timeSliderConfig != null) {
      const { selectedRange, active, variable } = timeSliderConfig;
      if (variable != null && active && selectedRange != null)
        return [
          {
            type: 'dateRange' as const,
            ...variable,
            min: selectedRange.start + 'T00:00:00Z',
            max: selectedRange.end + 'T00:00:00Z',
          },
        ];
    }
    return [];
  }, [timeSliderConfig]);

  return useMemo(
    () => ({
      type: 'time-slider',
      filters,
    }),
    [filters]
  );
}
