import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Question } from 'wdk-client/Utils/WdkModel';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel'

const cx = makeClassNameHelper('ConvertStepMenu');

import 'wdk-client/Views/Strategy/ConvertStepMenu.scss';

export const ConvertStepMenu = ({
  inputRecordClass,
  operandStep
}: AddStepOperationMenuProps) => (
  <div className={cx()}>
    <div className={cx('--Container')}>
      <div className={cx('--Header')}>
        <h3>
          Convert it
        </h3>
          into a related set of:
      </div>
      <div className={cx('--Body')}>
        <div className={cx('--PrimaryInputLabel')}>
          {operandStep.estimatedSize} {operandStep.estimatedSize === 1 ? inputRecordClass.shortDisplayName : inputRecordClass.shortDisplayNamePlural}
        </div>
        <div className={cx('--TransformIcon')}>
          ->
        </div>
        <div className={cx('--OperatorSelector')}>
          No conversions available.
        </div>
      </div>
    </div>
  </div>
);

// A search specifies a valid transform <=>
//   (1) it has a primary input and NO seconary input
//   (2) its primary input is compatible with the current record class
const isValidTransform = (
  { allowedPrimaryInputRecordClassNames, allowedSecondaryInputRecordClassNames }: Question,
  recordClassFullName: string
) => 
  (
    !allowedPrimaryInputRecordClassNames ||
    allowedSecondaryInputRecordClassNames
  )
    ? false
    : allowedPrimaryInputRecordClassNames.includes(recordClassFullName);
