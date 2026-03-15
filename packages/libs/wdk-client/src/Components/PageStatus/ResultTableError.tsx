import React from 'react';
import { Link } from 'react-router-dom';
import { DELAYED_RESULT_MESSAGE } from '../../Service/DelayedResultError';

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
  let isDelayedResult = props.message === DELAYED_RESULT_MESSAGE;
  let content = isDelayedResult ? (
    <p>{props.message}</p>
  ) : (
    <>
      <p>Error: content could not be loaded ({props.message})</p>
      <p>
        This may be caused by an incompatible column selection, please reset to
        the default columns. If that does not help, please take a screenshot
        (including the browser URL bar) and{' '}
        <Link to="/contact-us">contact us</Link>.
      </p>
      <button style={buttonStyle} onClick={props.onReset}>
        Reset to Default Columns
      </button>
    </>
  );
  return (
    <div className="wdk-Error" style={style}>
      {content}
    </div>
  );
}
