// Note that this is violating "separation of concerns" because this is io-ts stuff here
// in components

// Alternatively, define ts interfaces here. Then when we need io-ts, define the io-ts types in the types.ts file
// but reference the types here to make sure that they match. (can actually declare volcano data plot io-ts const
// from the typescript type). Will get typescript error right there!
// want errors to happen as close to the source as possible.
// we probably have examples.

// Can remove the | undefined from most of these after some other backend work is merged
export type VolcanoPlotDataPoint = {
  // log2foldChange becomes the x axis. Also used for coloring points
  log2foldChange: string | undefined;
  // pValue will be negative log transformed for the y axis. Also
  // needed as is (untransformed) in the tooltip and when coloring points
  pValue: string | undefined;
  // Used for thresholding and tooltip
  adjustedPValue: string | undefined;
  // Used for tooltip
  pointID: string | undefined;
};

export type VolcanoPlotData = Array<VolcanoPlotDataPoint>;

// export const VolcanoPlotData = array(
//   type({
//     log2foldChange: union([string, undefined]),
//     pValue: union([string, undefined]),
//     adjustedPValue: union([string, undefined]),
//     pointID: union([string, undefined]),
//   })
// );

// export type VolcanoPlotData = TypeOf<typeof VolcanoPlotData>;
