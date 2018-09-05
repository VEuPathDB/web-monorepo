import React from 'react';

/**
 * Empty field component
 */
export default function EmptyField(props) {
  return (
    <div>
      <h3>You may reduce the selection of {props.displayName} by
        selecting qualities on the left.</h3>
      <p>For each quality, you can choose specific values to include. By
        default, all values are selected.</p>
    </div>
  );
}
