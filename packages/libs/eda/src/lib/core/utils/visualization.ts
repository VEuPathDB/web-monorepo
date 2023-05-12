import {
  HistogramData,
  BarplotData,
  BoxplotData,
  FacetedData,
  LinePlotData,
} from '@veupathdb/components/lib/types/plots';
import { StudyEntity, Variable } from '../types/study';
import { CoverageStatistics } from '../types/visualization';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import { EntityCounts } from '../hooks/entityCounts';
import {
  CompleteCasesTable,
  PlotReferenceValue,
  VariableMapping,
} from '../api/DataClient';
import { Bounds } from '@veupathdb/components/lib/map/Types';
import { Filter } from '../types/filter';
import { VariableDescriptor } from '../types/variable';
import { findEntityAndVariable } from './study-metadata';
import { variableDisplayWithUnit } from './variable-display';
import { InputSpec } from '../components/visualizations/InputVariables';
import {
  DataElementConstraintRecord,
  disabledVariablesForInput,
  VariablesByInputName,
} from './data-element-constraints';
import { isEqual } from 'lodash';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../map';

// was: BarplotData | HistogramData | { series: BoxplotData };
type SeriesWithStatistics<T> = T & CoverageStatistics;
type MaybeFacetedSeries<T> = T | FacetedData<T>;
type MaybeFacetedSeriesWithStatistics<T> = MaybeFacetedSeries<T> &
  CoverageStatistics;

export function grayOutLastSeries<
  T extends { series: BoxplotData } | BarplotData | HistogramData
>(
  data: T | MaybeFacetedSeriesWithStatistics<T>,
  showMissingness: boolean = false,
  borderColor: string | undefined = undefined
): MaybeFacetedSeriesWithStatistics<T> {
  if (isFaceted(data)) {
    return {
      ...data,
      facets: data.facets.map(({ label, data }) => ({
        label,
        data:
          data != null
            ? (grayOutLastSeries(data, showMissingness, borderColor) as T)
            : undefined,
      })),
    };
  }

  return {
    ...data,
    series: data.series.map((series, index) =>
      showMissingness && index === data.series.length - 1
        ? {
            ...series,
            color: '#e8e8e8',
            outlierSymbol: 'x',
            borderColor,
          }
        : series
    ),
  } as SeriesWithStatistics<T>;
}

/**
 * replace "__UNSELECTED__" with "All other values" in the `name` prop
 *
 */

type NamedSeries = {
  series: {
    name?: string;
  }[];
};

export function fixUnselectedBoxplot<T extends NamedSeries>(
  data: T | MaybeFacetedSeriesWithStatistics<T>
): T | MaybeFacetedSeriesWithStatistics<T> {
  if (isFaceted(data)) {
    return {
      ...data,
      facets: data.facets.map((facet) => ({
        ...facet,
        data: fixUnselectedBoxplot(data) as T,
      })),
    };
  } else {
    return {
      ...data,
      series: data.series.map((s) => ({
        ...s,
        name: s.name === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : s.name,
      })),
    };
  }
}

export function fixUnselectedLineplot<T extends NamedSeries>(
  data: T | FacetedData<T>
): T | FacetedData<T> {
  if (isFaceted(data)) {
    return {
      ...data,
      facets: data.facets.map((facet) => ({
        ...facet,
        data: fixUnselectedLineplot(data) as T,
      })),
    };
  } else {
    return {
      ...data,
      series: data.series.map((s) => ({
        ...s,
        name: s.name === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : s.name,
      })),
    };
  }
}

/**
 * Calculates if there are any incomplete cases for the given variable
 * (usually overlay or facet variable)
 */
export function hasIncompleteCases(
  entity: StudyEntity | undefined,
  variable: Variable | undefined,
  outputEntity: StudyEntity | undefined,
  filteredCounts: EntityCounts,
  completeCasesTable: CompleteCasesTable | undefined
): boolean {
  const completeCases =
    entity != null && variable != null
      ? completeCasesTable?.find(
          (row) =>
            row.variableDetails?.entityId === entity.id &&
            row.variableDetails?.variableId === variable.id
        )?.completeCases
      : undefined;
  return (
    outputEntity != null &&
    completeCases != null &&
    completeCases < filteredCounts[outputEntity.id]
  );
}

/**
 * Convert pvalue number into '< 0.001' or '< 0.01' or single digit precision string.
 *
 * If provided a string, just return the string, no questions asked.
 *
 */
export function quantizePvalue(pvalue: number | string): string {
  if (typeof pvalue === 'string') {
    return pvalue;
  } else if (pvalue < 0.001) {
    return '< 0.001';
  } else if (pvalue < 0.01) {
    return '< 0.01';
  } else {
    return pvalue.toPrecision(1);
  }
}

/**
 * See web-eda issue 508
 *
 * Number variable values come from back end as strings when used as labels;
 * converting through number solves the problem in
 * issue 508 where "40.0" from back end doesn't match variable vocabulary's "40"
 *
 */
export function fixLabelsForNumberVariables(
  labels: string[] = [],
  variable?: Variable
): string[] {
  return variable != null && variable.type === 'number'
    ? labels.map((n) => String(Number(n)))
    : labels;
}

/**
 * non-array version of fixLabelsForNumberVariables
 *
 * However, unlike fixLabelsForNumberVariables it will pass through any non-number strings.
 * This is because this is used to clean up overlayVariable values, which can be 'No data'
 */
export function fixLabelForNumberVariables(
  label: string,
  variable?: Variable
): string {
  return variable != null && variable.type === 'number'
    ? String(isNaN(Number(label)) ? label : Number(label))
    : label;
}

/**
 *
 * In the abundance app, var ids show up like normal variable values. This function
 * takes these ids (labels) and returns that variable's display name, if it exists.
 *
 * Assumes that they all belong to the same entity!
 *
 * If no variable is found with that id, the original label is returned.
 */
export function fixVarIdLabels(
  labels: string[] = [],
  entityId: string,
  entities: StudyEntity[]
): string[] {
  return labels.map((label) => fixVarIdLabel(label, entityId, entities));
}

/**
 *
 * non-array version of fixVarIdLabels
 *
 * If no variable is found with that id, the original label is returned.
 */
export function fixVarIdLabel(
  label: string,
  entityId: string,
  entities: StudyEntity[]
): string {
  const variableDescriptor = { entityId, variableId: label };
  const retrievedVariable = findEntityAndVariable(entities, variableDescriptor);
  const displayName: string = retrievedVariable?.variable.displayName || label;
  return displayName;
}

export const nonUniqueWarning =
  'Variables must be unique. Please choose different variables.';

export function vocabularyWithMissingData(
  vocabulary: string[] = [],
  includeMissingData: boolean = false
): string[] {
  return includeMissingData && vocabulary.length
    ? [...vocabulary, 'No data']
    : vocabulary;
}

export function variablesAreUnique(vars: (Variable | undefined)[]): boolean {
  const defined = vars.filter((item) => item != null);
  const unique = defined.filter((item, i, ar) => ar.indexOf(item) === i);
  return defined.length === unique.length;
}

/**
 * If any inputs are invalid, throw an error indication as much.
 *
 * Validation is determined by solely considering constraints, ignoring
 * entity relationships between inputs. This should be fixed, eventually
 */
export function assertValidInputVariables(
  inputs: InputSpec[],
  selectedVariables: VariablesByInputName,
  entities: StudyEntity[],
  constraints: DataElementConstraintRecord[] | undefined
) {
  const invalidInputs = inputs.filter((input) => {
    const inputSelection = selectedVariables[input.name];
    const disabledVariables = disabledVariablesForInput(
      input.name,
      entities,
      constraints,
      undefined,
      selectedVariables
    );
    return (
      inputSelection &&
      disabledVariables.some((disabledVariable) =>
        isEqual(disabledVariable, inputSelection)
      )
    );
  });
  if (invalidInputs.length) {
    throw new Error(
      `The following variables are invalid and must be changed: ${invalidInputs
        .map((input) => input.label)
        .join(', ')}`
    );
  }
}

/**
 * convert viewport bounding box into two EDA filters
 *
 * @param bounds : Bounds
 * @param latitudeVariableDetails : { entityId: string, variableId: string }
 * @param longitudeVariableDetails : { entityId: string, variableId: string }
 *
 * @return filters : Array<Filter>
 **/

export function filtersFromBoundingBox(
  bounds: Bounds,
  latitudeVariableDetails: VariableDescriptor,
  longitudeVariableDetails: VariableDescriptor
): Filter[] {
  return [
    {
      type: 'numberRange',
      ...latitudeVariableDetails,
      min: bounds.southWest.lat,
      max: bounds.northEast.lat,
    },
    {
      type: 'longitudeRange',
      ...longitudeVariableDetails,
      left: bounds.southWest.lng,
      right: bounds.northEast.lng,
    },
  ];
}

export function leafletZoomLevelToGeohashLevel(
  leafletZoomLevel: number
): number {
  switch (leafletZoomLevel) {
    case 1:
    case 2:
      return 1;
    case 3:
    case 4:
    case 5:
      return 2;
    case 6:
    case 7:
    case 8:
      return 3;
    case 9:
    case 10:
    case 11:
      return 4;
    case 12:
    case 13:
    case 14:
      return 5;
    case 15:
    case 16:
    case 17:
      return 6;
    default:
      return 6;
  }
}

/**
 * DEPRECATED since using geoConfig
 *
 **/

export function geohashLevelToVariableId(geohashLevel: number): string {
  switch (geohashLevel) {
    case 1:
      return 'EUPATH_0043203'; // geohash_1
    case 2:
      return 'EUPATH_0043204'; // geohash_2
    case 3:
      return 'EUPATH_0043205'; // geohash_3
    case 4:
      return 'EUPATH_0043206'; // geohash_4
    case 5:
      return 'EUPATH_0043207'; // geohash_5
    case 6:
      return 'EUPATH_0043208'; // geohash_6
    default:
      return 'EUPATH_0043208'; // geohash_6
  }
}

export function getVariableLabel(
  plotReference: PlotReferenceValue,
  variableMappings: VariableMapping[] | undefined,
  entities: StudyEntity[],
  fallbackLabel: string
): string | undefined {
  const mapping = variableMappings?.find(
    (mapping) => mapping.plotReference === plotReference
  );

  if (mapping == null) return fallbackLabel;

  // TODO Will derived variables have a displayName?
  if (mapping.variableClass === 'native') {
    const nativeVariable = findEntityAndVariable(
      entities,
      mapping.variableSpec
    );
    return variableDisplayWithUnit(nativeVariable?.variable) ?? fallbackLabel;
  }

  return mapping.displayName ?? fallbackLabel;
}
