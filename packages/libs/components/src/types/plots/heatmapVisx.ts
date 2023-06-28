export type HeatmapCell = {
  // column value
  // calling it a number for now for sake of POC. But really should be string | number
  y: number;
  // What is the numberic value of the cell? Count or float. Mapped to color
  value: number;
  // Optional radius for correllograms.
  radius: number;
};

export type HeatmapColumn = {
  // like y above, should be string | number eventually
  x: number;
  // All the data for this column
  column: HeatmapCell[];
};

export type HeatmapDataVisx = Array<HeatmapColumn>;
