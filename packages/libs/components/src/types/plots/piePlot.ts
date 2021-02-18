// Pie Plot Type Definitions
export type PiePlotData = Array<PiePlotDatum>;
export type PiePlotDatum = {
  value: number;
  label: string;
  color?: string;
};
