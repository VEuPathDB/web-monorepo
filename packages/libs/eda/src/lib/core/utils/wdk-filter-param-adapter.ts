import { Filter as EdaFilter } from '../types/filter';
import {
  DateMemberFilter,
  DateRangeFilter,
  Filter as WdkFilter,
  NumberRangeFilter,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { DistributionResponse } from '../api/eda-api';
import { StudyVariable } from '../types/study';

/*
 * These adapters can be used to convert filter objects between EDA and WDK
 * types. Note that the generated WDK filter object includes a rogue property
 * named `__entityId`. This information is needed for EDA.
 */

/** Convert a WDK Filter to an EDA Filter */
export function toEdaFilter(filter: WdkFilter, entityId: string): EdaFilter {
  const variableId = filter.field;
  if ('__entityId' in filter) entityId = (filter as any).__entityId;
  const type: EdaFilter['type'] = filter.isRange
    ? filter.type === 'number'
      ? 'numberRange'
      : 'dateRange'
    : filter.type === 'string'
    ? 'stringSet'
    : filter.type === 'number'
    ? 'numberSet'
    : 'dateSet';
  return (type === 'dateSet'
    ? {
        entityId,
        variableId,
        type,
        dateSet: (filter as DateMemberFilter).value.map((d) => d + 'T00:00:00'),
      }
    : type === 'numberSet'
    ? {
        entityId,
        variableId,
        type,
        numberSet: filter.value,
      }
    : type === 'stringSet'
    ? {
        entityId,
        variableId,
        type,
        stringSet: filter.value,
      }
    : type === 'dateRange'
    ? {
        entityId,
        variableId,
        type,
        min: (filter as DateRangeFilter).value.min + 'T00:00:00',
        max: (filter as DateRangeFilter).value.max + 'T00:00:00',
      }
    : {
        entityId,
        variableId,
        type,
        min: (filter as NumberRangeFilter).value.min,
        max: (filter as NumberRangeFilter).value.max,
      }) as EdaFilter;
}

/** Convert an EDA Filter to a WDK Filter */
export function fromEdaFilter(filter: EdaFilter): WdkFilter {
  return {
    field: filter.variableId,
    isRange: filter.type.endsWith('Range'),
    includeUnknown: false,
    type: filter.type.replace(/(Set|Range)/, ''),
    value:
      filter.type === 'dateRange'
        ? {
            min: filter.min.replace('T00:00:00', ''),
            max: filter.max.replace('T00:00:00', ''),
          }
        : filter.type === 'numberRange'
        ? {
            min: filter.min,
            max: filter.max,
          }
        : filter.type === 'dateSet'
        ? filter[filter.type].map((d) => d.replace('T00:00:00', ''))
        : filter.type === 'stringSet'
        ? filter[filter.type]
        : filter[filter.type],
    __entityId: filter.entityId,
  } as WdkFilter;
}

export function toWdkVariableSummary(
  foreground: DistributionResponse,
  background: DistributionResponse,
  variable: StudyVariable
) {
  const activeField = {
    display: variable.displayName,
    isRange: variable.dataShape === 'continuous',
    parent: variable.parentId,
    precision: 1,
    term: variable.id,
    type: variable.type,
    variableName: variable.providerLabel,
  };
  return {
    distribution: Object.entries(background.distribution).map(
      ([value, count]) => ({
        count,
        filteredCount: foreground.distribution[value],
        value,
      })
    ),
    entitiesCount: background.entitiesCount,
    filteredEntitiesCount: foreground.entitiesCount,
    activeField,
  };
}
