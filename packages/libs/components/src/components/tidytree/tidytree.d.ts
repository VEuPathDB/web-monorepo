// this is just the subset of props we are dealing with
interface Node {
  __data__: {
    data: {
      id: string; // the display label provided in the Newick file
      length: number;
    };
  };
}

interface ColorOptions {
  predicate: (node: Node) => boolean;
  leavesOnly: boolean;
  nodeColorMode: 'predicate' | 'none';
  branchColorMode: 'monophyletic' | 'none';
  highlightColor?: string;
  defaultNodeColor?: string;
}

declare module 'tidytree' {
  export declare class TidyTree {
    constructor(data: any, options: any);
    destroy(): void;
    redraw(): void;
    setColorOptions(newColorOptions: ColorOptions): void;
  }
}
