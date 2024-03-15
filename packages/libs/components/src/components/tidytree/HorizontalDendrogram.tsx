import { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react';
import { TidyTree as TidyTreeJS } from 'tidytree';

export interface HorizontalDendrogramProps {
  /// The first set of props are expected to be fairly constant         ///
  /// and when changed, a whole new TidyTreeJS instance will be created ///
  /**
   * tree data in Newick format
   */
  data: string | undefined;
  /**
   * TO DO: add width prop and nail down most of the options to
   * horizontal dendrograms
   */
  options: {
    ruler?: boolean;
    /**
     * supposedly [ top, right, bottom, left ] but in practice not at all
       for now just default to all zero margins (left-most edges 
     */
    margin?: [number, number, number, number];
    interactive?: boolean;
  };

  /// The remaining props are handled with a redraw: ///
  /**
   * how many leaf nodes are in the data string
   * (maybe we can calculate this from the Newick string in future?)
   */
  leafCount: number;
  /**
   * width of tree in pixels
   */
  width: number;
  /**
   * hopefully temporary prop that we can get rid of when we understand the
   * horizontal layout behaviour of the tree (with respect to number of nodes)
   * which will come with testing with more examples. Defaults to 1.0
   * update: possibly wasn't needed in the end!
   */
  hStretch?: number;
  /**
   * number of pixels height taken per leaf
   */
  rowHeight: number;
  /**
   * CSS styles for the container div
   */
  containerStyles?: CSSProperties;
  /**
   * which leaf nodes to highlight
   */
  highlightedNodeIds?: string[];
  /**
   * highlight whole subtrees ('monophyletic') or just leaves ('none')
   */
  highlightMode?: 'monophyletic' | 'none';
}

/**
 * This is hardwired to produce a horizontal, equally spaced, square cornered dendrogram.
 * A more general purpose wrapping of TidyTreeJS will have to come later. It's not trivial
 * due to horizontal/vertical orientation affecting heights and widths. Given that users expect
 * to scroll up/down in a large tree rather than left/right, and because we will be aligning
 * it with a table that also works in up/down space, this seems reasonable.
 */
export function HorizontalDendrogram({
  data,
  leafCount,
  rowHeight,
  width,
  options: { ruler = false, margin = [0, 0, 0, 0], interactive = true },
  highlightedNodeIds,
  highlightMode,
  hStretch = 1.0,
  containerStyles,
}: HorizontalDendrogramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tidyTreeRef = useRef<TidyTreeJS>();

  useEffect(() => {
    if (containerRef.current == null || data == null) {
      // If props.data is nullish and containerRef.current exists, clear its content
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear the container for blank rendering
      }
      return;
    }
    const instance = new TidyTreeJS(data, {
      parent: containerRef.current,
      layout: 'horizontal',
      type: 'dendrogram',
      mode: 'square',
      equidistantLeaves: true,
      ruler,
      margin,
      hStretch,
      animation: 0, // it's naff and it reveals edge lengths/weights momentarily
      interactive,
    });
    tidyTreeRef.current = instance;
    return function cleanup() {
      instance.destroy();
    };
  }, [data, ruler, margin]);

  // redraw when the container size changes
  // useLayoutEffect ensures that the redraw is not called for brand new TidyTreeJS objects
  // look out for potential performance issues (the effect is run synchronously)
  useLayoutEffect(() => {
    if (tidyTreeRef.current) {
      tidyTreeRef.current.redraw();
    }
  }, [leafCount, width, rowHeight, tidyTreeRef]);

  // now handle changes to props that act via tidytree methods
  // which also usually trigger a redraw

  // highlightedNodeIds
  useEffect(() => {
    if (tidyTreeRef.current && highlightedNodeIds) {
      tidyTreeRef.current.setColorOptions({
        nodeColorMode: 'predicate',
        branchColorMode: highlightMode ?? 'none',
        leavesOnly: true,
        predicate: (node) => highlightedNodeIds.includes(node.__data__.data.id),
      });
      // no redraw needed, setColorOptions does it
    }
  }, [highlightedNodeIds, highlightMode, tidyTreeRef]);

  const containerHeight = leafCount * rowHeight;
  return (
    <div
      style={{
        width: width + 'px',
        height: containerHeight + 'px',
        ...containerStyles,
      }}
      ref={containerRef}
    />
  );
}
