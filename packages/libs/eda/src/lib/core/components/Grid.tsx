import React from 'react';

import './Grid.scss';

interface Props {
  children: React.ReactNode;
}

export function Grid(props: Props) {
  return (
    <div className="Grid">
      {React.Children.map(props.children, (child) => (
        <div>{child}</div>
      ))}
    </div>
  );
}
