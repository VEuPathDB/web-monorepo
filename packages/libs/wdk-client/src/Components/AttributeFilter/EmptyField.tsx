import React from 'react';

interface EmptyFieldProps {
  displayName: string;
}

export default function EmptyField(props: EmptyFieldProps) {
  return (
    <div>
      <h3>
        You may reduce the selection of {props.displayName} by selecting
        variables on the left.
      </h3>
      <p>
        For each variable, you can choose specific values to include. By
        default, all values are selected.
      </p>
    </div>
  );
}
