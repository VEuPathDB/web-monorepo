import { Fragment, ReactNode } from 'react';
import { Filter } from '../types/filter';
import { StudyEntity } from '../types/study';
import { findEntityAndVariable } from './study-metadata';

/**
 * Formats a filter's value as a ReactNode, resolving variable display names
 * from the provided entities array. Used in both FilterChipList tooltips and
 * read-only review summaries.
 */
export function formatFilterValue(
  filter: Filter,
  entities: StudyEntity[]
): ReactNode {
  switch (filter.type) {
    case 'stringSet':
      return filter.stringSet.join(' | ');
    case 'numberSet':
      return filter.numberSet.join(' | ');
    case 'dateSet':
      return filter.dateSet.join(' | ');
    case 'numberRange':
      return `from ${filter.min} to ${filter.max}, inclusive`;
    case 'dateRange':
      return `from ${filter.min.split('T')[0]} to ${
        filter.max.split('T')[0]
      }, inclusive`;
    case 'multiFilter':
      return (
        <>
          {filter.subFilters.map((subFilter, index) => {
            const entAndVar = findEntityAndVariable(entities, {
              entityId: filter.entityId,
              variableId: subFilter.variableId,
            });
            const label =
              entAndVar?.variable.displayName ?? subFilter.variableId;
            const value = subFilter.stringSet.join(' | ');
            return (
              <Fragment key={subFilter.variableId}>
                {index > 0 && <br />}
                {label} = {value}
              </Fragment>
            );
          })}
        </>
      );
    default:
      return '';
  }
}
