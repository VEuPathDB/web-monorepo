import React from 'react';

export interface Props {
  children: React.ReactChild;
}

const style: React.CSSProperties = {
  fontSize: '1.2em',
};

export function ContentError(props: Props) {
  return (
    <div className="wdk-Error" style={style}>
      Content could not be loaded: {props.children}
    </div>
  );
}
