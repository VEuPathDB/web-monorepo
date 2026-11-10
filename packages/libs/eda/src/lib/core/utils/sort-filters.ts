import { Filter } from '../types/filter';

/**
 * Sort the value arrays inside set-type filters so that the serialized JSON
 * is deterministic regardless of the order in which a user selected values.
 * This improves cache-hit rates on both the backend (hash of config JSON)
 * and the client (react-query serialised keys).
 *
 * The filters array itself is also sorted by entityId + variableId + type
 * to further stabilise the JSON representation.
 *
 * Returns a new array; the input is not mutated.
 */
export function sortFilters(filters: Filter[]): Filter[] {
  return filters
    .map((filter): Filter => {
      switch (filter.type) {
        case 'stringSet':
          return {
            ...filter,
            stringSet: [...filter.stringSet].sort(),
          };
        case 'numberSet':
          return {
            ...filter,
            numberSet: [...filter.numberSet].sort((a, b) => a - b),
          };
        case 'dateSet':
          return {
            ...filter,
            dateSet: [...filter.dateSet].sort(),
          };
        case 'multiFilter':
          return {
            ...filter,
            subFilters: filter.subFilters.map((sf) => ({
              ...sf,
              stringSet: [...sf.stringSet].sort(),
            })),
          };
        // Range filters (numberRange, longitudeRange, dateRange) have no
        // set-valued fields — pass through unchanged.
        default:
          return filter;
      }
    })
    .sort((a, b) => {
      const cmp =
        a.entityId.localeCompare(b.entityId) ||
        a.variableId.localeCompare(b.variableId) ||
        a.type.localeCompare(b.type);
      return cmp;
    });
}
