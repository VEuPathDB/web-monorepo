import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, map, pick } from 'lodash';

/**
 * List of filters with invalid fields and/or values
 */
export default function InvalidFilterList(props) {
  var { filters } = props;

  if (isEmpty(filters)) return null;

  return (
    <div className="invalid-values">
      <p>
        Some of the options you previously selected are no longer available:
      </p>
      <ul>
        {map(filters, (filter) => (
          <li className="invalid">
            {JSON.stringify(pick(filter, 'field', 'value', 'includeUnknown'))}
          </li>
        ))}
      </ul>
    </div>
  );
}

InvalidFilterList.propTypes = {
  filters: PropTypes.array,
};
