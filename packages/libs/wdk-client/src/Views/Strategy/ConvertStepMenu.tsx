import { Question } from 'wdk-client/Utils/WdkModel';

import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';

export const ConvertStepMenu = (_: AddStepOperationMenuProps) => null;

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
