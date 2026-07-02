import {
  DateVariable,
  LongitudeVariable,
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

/** a latitude variable is a regular number variable annotated
 * with displayType 'latitude' */
export type LatitudeVariable = NumberVariable & {
  displayType: 'latitude';
};

/** the pair of variables filtered by the GeoCoordFilter */
export type GeoCoordVariable = LatitudeVariable | LongitudeVariable;
