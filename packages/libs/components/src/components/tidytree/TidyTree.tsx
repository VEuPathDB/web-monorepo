import React, { useEffect, useRef } from 'react';
import { TidyTree as TidyTreeJS } from 'tidytree';

export interface TidyTreeProps {
  /**
   * tree data in Newick format
   */
  data: string | undefined;
  /**
   * how many leaf nodes are in the data string
   * (maybe we can calculate this from the Newick string in future?)
   */
  leafCount: number;
  options: {
    layout?: 'horizontal' | 'vertical' | 'circular';
    type?: 'tree' | 'weighted' | 'dendrogram';
    mode?: 'square' | 'smooth' | 'straight';
    equidistantLeaves?: boolean;
    ruler?: boolean;
    /**
     * supposedly [ top, right, bottom, left ] but in practice not at all
       for now just default to all zero margins (left-most edges 
     */
    margin?: [number, number, number, number];
  };
}

export function TidyTree({
  data,
  leafCount,
  options: {
    layout = 'horizontal',
    type = 'dendrogram',
    mode = 'square',
    equidistantLeaves = true,
    ruler = false,
    margin = [0, 0, 0, 0],
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
      margin,
    });
    return function cleanup() {
      instance.destroy();
    };
  }, [data, layout, type, mode, equidistantLeaves, ruler]);

  // calculate height

  const heightInPx = leafCount * 50;

  return (
    <div
      style={{
        width: '800px',
        height: heightInPx + 'px',
        overflow: 'hidden',
        background: 'yellow',
      }}
      ref={ref}
    />
  );
}
