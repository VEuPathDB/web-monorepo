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
  const { alwaysShowCount = false, selectedCount } = props;
  const { minSelectedCount, maxSelectedCount } = props.parameter;
  const hasMin = minSelectedCount > 0;
  const hasMax = maxSelectedCount > 0;

  const message = hasMin && hasMax
    ? `between ${minSelectedCount} and ${maxSelectedCount} values required`
    : (hasMin && selectedCount > 0) ? `at least ${minSelectedCount} ${valueDescription(minSelectedCount)} required`
    : hasMax ? `at most ${maxSelectedCount} ${valueDescription(maxSelectedCount)} required`
    : null;

  const isCountInBounds = countInBounds(selectedCount, Math.max(minSelectedCount,1), maxSelectedCount);

  // This is usd in TreeBoxParam (eg organism): red if 0 selected
  const countColor = isCountInBounds
    ? 'black'
    : 'red';

  if (hasMin == false && hasMax == false && alwaysShowCount == false) return null;

  return (
    <div className="treeCount">
      <span className={countColor}>{props.selectedCount} selected</span>, out of {props.allCount}
      {
        !isCountInBounds && message &&
        <>
          {' '}
          <span className="mediumgray-text">({message})</span>
        </>
      }
    </div>
  );
}

function valueDescription(count: number) {
  return count === 1
    ? 'value'
    : 'values';
}
