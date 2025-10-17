import React from 'react';

export interface Props {
  message: string;
  onReset: () => void;
}

const style: React.CSSProperties = {
  fontSize: '1.2em',
};

const buttonStyle: React.CSSProperties = {
  marginLeft: '1em',
  padding: '0.5em 1em',
  fontSize: '0.9em',
  cursor: 'pointer',
};

export function ResultTableError(props: Props) {
  return (
    <div className="wdk-Error" style={style}>
      <p>Error: content could not be loaded ({props.message})</p>
      <p>
        This may be caused by an incompatible column selection. We're working on
        a fix, but in the meantime you can reset to the default columns.
      </p>
      <button style={buttonStyle} onClick={props.onReset}>
        Reset to Default Columns
      </button>
    </div>
  );
}
