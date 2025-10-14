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
      Content could not be loaded: {props.message}
      <button style={buttonStyle} onClick={props.onReset}>
        Reset to Default Columns and Retry
      </button>
    </div>
  );
}
