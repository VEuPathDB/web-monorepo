import { useEffect, useRef } from 'react';
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
  /**
   * number of pixels height taken per leaf
   */
  rowHeight: number;
  /**
   * TO DO: add width prop and nail down most of the options to
   * horizontal dendrograms
   */
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
  rowHeight,
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
      animation: 0, // it's naff and it reveals edge lengths/weights momentarily
    });
    return function cleanup() {
      instance.destroy();
    };
  }, [
    data,
    layout,
    type,
    mode,
    equidistantLeaves,
    ruler,
    margin,
    leafCount,
    rowHeight,
  ]);
  // Included `leafCount` and `rowHeight` in the dependency array to ensure the TidyTree
  // instance is recreated when the size of its container div changes. Although these
  // variables are not directly used in the effect, their changes affect the calculated
  // height of the container, below, which in turn requires reinitialization of the TidyTree
  // to adapt to the new size.

  // calculate height
  const heightInPx = leafCount * rowHeight;

  return (
    <div
      style={{
        width: '400px',
        height: heightInPx + 'px',
      }}
      ref={ref}
    />
  );
}
