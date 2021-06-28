import { StudyVariableVariable } from '../../types/study';

export interface HistogramVariable extends StudyVariableVariable {
  type: 'number' | 'date';
  dataShape: 'continuous';
}

export interface TableVariable extends StudyVariableVariable {
  type: 'string' | 'number' | 'date';
  dataShape: 'categorical' | 'binary' | 'ordinal';
}

export interface ScatterplotVariable extends StudyVariableVariable {
  type: 'number' | 'date';
  dataShape: 'continuous';
}

export interface MosaicVariable extends StudyVariableVariable {
  type: 'string' | 'number';
  dataShape: 'categorical' | 'binary' | 'ordinal';
}

export interface TwoByTwoVariable extends MosaicVariable {
  dataShape: 'binary';
}
