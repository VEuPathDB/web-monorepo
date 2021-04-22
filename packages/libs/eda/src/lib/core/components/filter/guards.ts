import { StudyVariable } from '../../types/study';
import { HistogramVariable, TableVariable, ScatterplotVariable } from './types';

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

export function isScatterplotVariable(
  variable: StudyVariable
): variable is ScatterplotVariable {
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
