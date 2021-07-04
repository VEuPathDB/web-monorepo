import {
  DateVariable,
  NumberVariable,
  StringVariable,
} from '../../types/study';

export type HistogramVariable = (NumberVariable | DateVariable) & {
  dataShape: 'continuous';
};

export type TableVariable = (StringVariable | NumberVariable | DateVariable) & {
  dataShape: 'categorical' | 'binary' | 'ordinal';
};

export type ScatterplotVariable = (NumberVariable | DateVariable) & {
  dataShape: 'continuous';
};

export type MosaicVariable = (StringVariable | NumberVariable) & {
  dataShape: 'categorical' | 'binary' | 'ordinal';
};

export type TwoByTwoVariable = MosaicVariable & {
  dataShape: 'binary';
};
