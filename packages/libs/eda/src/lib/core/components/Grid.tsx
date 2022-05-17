import React, { useMemo } from 'react';

import './Grid.scss';

interface Props {
  children: React.ReactNode;
}

export function Grid(props: Props) {
  const children = useMemo(() => {
    if (Array.isArray(props.children)) {
      return props.children.filter((child) => !!child);
    } else {
      return props.children;
    }
  }, [props.children]);
  return (
    <div className="Grid">
      {React.Children.map(children, (child) => (
        <div>{child}</div>
      ))}
    </div>
  );
}
