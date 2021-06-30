import {
  StudyVariableDate,
  StudyVariableNumber,
  StudyVariableString,
} from '../../types/study';

export type HistogramVariable = (StudyVariableNumber | StudyVariableDate) & {
  dataShape: 'continuous';
};

type X = HistogramVariable['type'];

export type TableVariable = (
  | StudyVariableString
  | StudyVariableNumber
  | StudyVariableDate
) & {
  dataShape: 'categorical' | 'binary' | 'ordinal';
};

export type ScatterplotVariable = (StudyVariableNumber | StudyVariableDate) & {
  dataShape: 'continuous';
};

export type MosaicVariable = (StudyVariableString | StudyVariableNumber) & {
  dataShape: 'categorical' | 'binary' | 'ordinal';
};

export type TwoByTwoVariable = MosaicVariable & {
  dataShape: 'binary';
};
