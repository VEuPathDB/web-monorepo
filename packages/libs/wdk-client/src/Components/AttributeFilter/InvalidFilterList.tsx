import React from 'react';
import { isEmpty, map, pick } from 'lodash';
import { Filter } from './Types';

interface Props {
  filters: Filter[];
}

/**
 * List of filters with invalid fields and/or values
 */
export default function InvalidFilterList({ filters }: Props) {
  if (isEmpty(filters)) return null;

  return (
    <div className="invalid-values">
      <p>
        Some of the options you previously selected are no longer available:
      </p>
      <ul>
        {map(filters, (filter) => (
          <li
            className="invalid"
            key={`${filter.field}-${JSON.stringify(filter.value)}`}
          >
            {JSON.stringify(pick(filter, 'field', 'value', 'includeUnknown'))}
          </li>
        ))}
      </ul>
    </div>
  );
}
