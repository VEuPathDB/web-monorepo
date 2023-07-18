import React from 'react';

import { cxStepBoxes } from '@veupathdb/wdk-client/lib/Views/Strategy/ClassNames';

import './ColocateStepBoxIcon.scss';

export const ColocateStepBoxIcon = () => (
  <div className={cxStepBoxes('--SpanOperator')}>
    <div className={cxStepBoxes('--CombinePrimaryInputArrow')}></div>
    <div className={cxStepBoxes('--CombineSecondaryInputArrow')}></div>
  </div>
);
