import React from 'react';
import { EnumParam } from 'wdk-client/Utils/WdkModel';

import { countInBounds } from 'wdk-client/Views/Question/Params/EnumParamUtils';

type Props = {
  parameter: EnumParam;
  selectedCount: number;
  allCount: number;
  alwaysShowCount?: boolean;
};

export default function SelectionInfo(props: Props) {
  const { alwaysShowCount = false } = props;
  const { minSelectedCount, maxSelectedCount } = props.parameter;
  const hasMin = minSelectedCount > 0;
  const hasMax = maxSelectedCount > 0;
  const message = hasMin && hasMax
    ? `You may only selected between ${minSelectedCount} and ${maxSelectedCount} values for this parameter.`
    : hasMin ? `You must select at least ${minSelectedCount} values for this parameter.`
    : hasMax ? `You may select up to ${maxSelectedCount} values for this parameter.`
    : null;
  // This is usd in TreeBoxParam (eg organism): red if 0 selected
  const countColor = countInBounds(props.selectedCount, Math.max(minSelectedCount,1), maxSelectedCount)
    ? 'black'
    : 'red';

  if (hasMin == false && hasMax == false && alwaysShowCount == false) return null;

  return (
    <div className="treeCount">
      {message && <div>Note: {message}</div>}
      <div><span className={countColor}>{props.selectedCount} selected</span>, out of {props.allCount}</div>
    </div>
  );
}
