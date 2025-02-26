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
];
