import { StudyVariable } from '../../types/study';
import {
  HistogramVariable,
  TableVariable,
  ScatterplotVariable,
  MosaicVariable,
  TwoByTwoVariable,
} from './types';

export function isHistogramVariable(
  variable: StudyVariable
): variable is HistogramVariable {
  if (variable.type === 'category') return false;
  switch (variable.dataShape) {
    case 'continuous':
      switch (variable.type) {
        case 'date':
        case 'number':
          return true;
      }
  }
  return false;
}

export function isTableVariable(
  variable: StudyVariable
): variable is TableVariable {
  if (variable.type === 'category') return false;
  switch (variable.dataShape) {
    case 'binary':
    case 'categorical':
    case 'ordinal':
      switch (variable.type) {
        case 'date':
        case 'number':
        case 'string':
          return true;
      }
  }
  return false;
}

export function isScatterplotVariable(
  variable: StudyVariable
): variable is ScatterplotVariable {
  if (variable.type === 'category') return false;
  switch (variable.dataShape) {
    case 'continuous':
      switch (variable.type) {
        case 'date':
        case 'number':
          return true;
      }
  }
  return false;
}

export function isMosaicVariable(
  variable: StudyVariable
): variable is MosaicVariable {
  if (variable.type === 'category') return false;
  switch (variable.dataShape) {
    case 'categorical':
    case 'binary':
    case 'ordinal':
      switch (variable.type) {
        case 'number':
        case 'string':
          return true;
      }
  }
  return false;
}

export function isTwoByTwoVariable(
  variable: StudyVariable
): variable is TwoByTwoVariable {
  return isMosaicVariable(variable) && variable.dataShape === 'binary';
}
