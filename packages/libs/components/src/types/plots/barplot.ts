export type BarplotData = {
  series: {
    /** The name of the data. e.g. 'male' or 'female' */
    name: string;
    /** The color of the data. Optional. */
    color?: string;
    value: number[];
    label: string[]; // e.g. India, Pakistan, Mali
  }[];
};
