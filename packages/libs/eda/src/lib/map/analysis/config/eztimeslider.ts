import { DataElementConstraintRecord } from '../../../core/utils/data-element-constraints';

export const timeSliderVariableConstraints: DataElementConstraintRecord[] = [
  {
    overlayVariable: {
      isRequired: true,
      minNumVars: 1,
      maxNumVars: 1,
      // TODO: testing with SCORE S. mansoni Cluster Randomized Trial study
      // however, this study does not have date variable, thus temporarily use below for test purpose
      // i.e., additionally allowing 'integer'
      // allowedTypes: ['date', 'integer'],
      // TODO: below two are correct ones
      allowedTypes: ['date'],
      //      isTemporal: true,
    },
  },
];
