import { useEffect, useLayoutEffect, useRef } from 'react';
import { TidyTree as TidyTreeJS } from 'tidytree';

export interface TidyTreeProps {
  /**
   * The first set of props are expected to be fairly constant
   * and when changed, a whole new TidyTreeJS instance will be created
   */
  /**
   * tree data in Newick format
   */
  data: string | undefined;
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
  /**
   * The remaining props are handled with a redraw:
   */
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
   * which nodes to highlight
   */
  highlightedNodes?: string[];
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
  const tidyTreeRef = useRef<TidyTreeJS>();

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
    tidyTreeRef.current = instance;
    return function cleanup() {
      instance.destroy();
    };
  }, [data, layout, type, mode, equidistantLeaves, ruler, margin]);

  // redraw when the container size changes
  // useLayoutEffect ensures that the redraw is not called for brand new TidyTreeJS objects
  // look out for potential performance issues (the effect is run synchronously)
  useLayoutEffect(() => {
    if (tidyTreeRef.current) {
      console.log('I did a redraw');
      tidyTreeRef.current.redraw();
    }
  }, [leafCount, rowHeight, tidyTreeRef]);

  // now handle changes to 'redraw props'
  // TO DO

  const containerHeight = leafCount * rowHeight;
  return (
    <div
      style={{
        width: '400px',
        height: containerHeight + 'px',
      }}
      ref={ref}
    />
  );
}
