import React from 'react';

export function FloatingDiv(props: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (!props.children) return null;
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        padding: '1em',
        backgroundColor: 'white',
        border: '1px solid black',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}
