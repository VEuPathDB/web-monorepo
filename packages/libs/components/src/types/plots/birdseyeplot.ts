import { BarplotData } from './barplot';

export type BirdsEyePlotData = {
  brackets: {
    value: number;
    label: string;
  }[];
  bars: BarplotData['series'];
};
