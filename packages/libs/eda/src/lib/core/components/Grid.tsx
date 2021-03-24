import React from 'react';

interface Props {
  children: React.ReactNode;
}

export function Grid(props: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(30em, 50%))',
        justifyItems: 'center',
        alignItems: 'center',
        rowGap: '2em',
        padding: '2em',
      }}
    >
      {React.Children.map(props.children, (child) => (
        <div>{child}</div>
      ))}
    </div>
  );
}
