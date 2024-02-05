import React, { useEffect, useRef } from 'react';
import { TidyTree as TidyTreeJS } from 'tidytree';

export interface TidyTreeProps {
  data: string | undefined;
  options: {
    layout?: 'horizontal' | 'vertical' | 'circular';
    type?: 'tree' | 'weighted' | 'dendrogram';
    mode?: 'square' | 'smooth' | 'straight';
    equidistantLeaves?: boolean;
    ruler?: boolean;
  };
}

export function TidyTree({
  data,
  options: {
    layout = 'horizontal',
    type = 'dendrogram',
    mode = 'square',
    equidistantLeaves = true,
    ruler = false,
  },
}: TidyTreeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current == null || data == null) {
      // If props.data is nullish and ref.current exists, clear its content
      if (ref.current) {
        ref.current.innerHTML = ''; // Clear the container for blank rendering
      }
      return;
    }
    const instance = new TidyTreeJS(data, {
      parent: ref.current,
      layout,
      type,
      mode,
      equidistantLeaves,
      ruler,
    });
    return function cleanup() {
      instance.destroy();
    };
  }, [data, layout, type, mode, equidistantLeaves, ruler]);
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
