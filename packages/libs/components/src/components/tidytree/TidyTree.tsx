import React, { useEffect, useRef } from 'react';
import { TidyTree as TidyTreeJS } from 'tidytree';

export interface TidyTreeProps {
  data: string;
}

export function TidyTree(props: TidyTreeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null) return;
    if (props.data == null) return;
    new TidyTreeJS(props.data, { parent: ref.current });
  }, [props.data]);
  return (
    <div
      style={{
        height: '70vh',
        width: '80vh',
        margin: 'auto',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '1800px',
          height: '8000px',
          overflow: 'hidden',
        }}
        ref={ref}
      />
    </div>
  );
}
