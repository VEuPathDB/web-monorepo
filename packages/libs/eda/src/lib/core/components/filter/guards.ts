import { StudyVariable } from '../../types/study';
import { HistogramVariable, TableVariable, MosaicVariable } from './types';

export function isHistogramVariable(
  variable: StudyVariable
): variable is HistogramVariable {
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

export function isMosaicVariable(
  variable: StudyVariable
): variable is MosaicVariable {
  switch (variable.dataShape) {
    case 'categorical':
    case 'binary':
    case 'ordinal':
      switch (variable.type) {
        case 'number':
        case 'category':
        case 'string':
          return true;
      }
  }
  return false;
}
