import { LongitudeVariable, VariableTreeNode } from '../../types/study';
import {
  HistogramVariable,
  TableVariable,
  ScatterplotVariable,
  MosaicVariable,
  TwoByTwoVariable,
  LatitudeVariable,
  GeoCoordVariable,
} from './types';

export function isHistogramVariable(
  variable: VariableTreeNode
): variable is HistogramVariable {
  if (variable.type !== 'category') {
    switch (variable.dataShape) {
      case 'continuous':
        switch (variable.type) {
          case 'date':
          case 'number':
          case 'integer':
            return true;
        }
    }
  }
  return false;
}

export function isTableVariable(
  variable: VariableTreeNode
): variable is TableVariable {
  if (variable.type !== 'category') {
    switch (variable.dataShape) {
      case 'binary':
      case 'categorical':
      case 'ordinal':
        switch (variable.type) {
          case 'date':
          case 'number':
          case 'integer':
          case 'string':
            return true;
        }
    }
  }
  return false;
}

export function isScatterplotVariable(
  variable: VariableTreeNode
): variable is ScatterplotVariable {
  if (variable.type !== 'category') {
    switch (variable.dataShape) {
      case 'continuous':
        switch (variable.type) {
          case 'date':
          case 'number':
          case 'integer':
            return true;
        }
    }
  }
  return false;
}

export function isMosaicVariable(
  variable: VariableTreeNode
): variable is MosaicVariable {
  if (variable.type !== 'category') {
    switch (variable.dataShape) {
      case 'categorical':
      case 'binary':
      case 'ordinal':
        switch (variable.type) {
          case 'number':
          case 'integer':
          case 'string':
            return true;
        }
    }
  }
  return false;
}

export function isTwoByTwoVariable(
  variable: VariableTreeNode
): variable is TwoByTwoVariable {
  return isMosaicVariable(variable) && variable.dataShape === 'binary';
}

export function isLatitudeVariable(
  variable: VariableTreeNode
): variable is LatitudeVariable {
  return (
    variable.displayType === 'latitude' &&
    (variable.type === 'number' || variable.type === 'integer')
  );
}

export function isLongitudeVariable(
  variable: VariableTreeNode
): variable is LongitudeVariable {
  return variable.type === 'longitude';
}

export function isGeoCoordVariable(
  variable: VariableTreeNode
): variable is GeoCoordVariable {
  return isLatitudeVariable(variable) || isLongitudeVariable(variable);
}
