import { DataElementConstraintRecord } from '../../../core/utils/data-element-constraints';

export const timeSliderVariableConstraints: DataElementConstraintRecord[] = [
  {
    overlayVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      allowedTypes: ['date'],
    },
  },
  // #761 add two new constraints to this array
  // 1. allowedTypes: number or integer, isTemporal: true
  // 2. allowedShapes: ordinal, isTemporal: true
];
