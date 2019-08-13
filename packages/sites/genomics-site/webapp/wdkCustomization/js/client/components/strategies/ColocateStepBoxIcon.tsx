import React from 'react';

import { cxStepBoxes } from 'wdk-client/Views/Strategy/ClassNames';

import './ColocateStepBoxIcon.scss';

export const ColocateStepBoxIcon = () =>
  <div className={cxStepBoxes('--SpanOperator')}>
    <div className={cxStepBoxes('--CombinePrimaryInputArrow')}>&#9654;</div>
    <div className={cxStepBoxes('--CombineSecondaryInputArrow')}>&#9660;</div>
  </div>;
