import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { PartialUiStepTree } from 'wdk-client/Views/Strategy/Types';

import './AddStepMenuSelection.scss';
import { PreviewStepBoxes } from './StepBoxes';

const cx = makeClassNameHelper('AddStepMenuSelection');

type Props = {
  operationName: string,
  uiStepTree: PartialUiStepTree,
  strategy: StrategyDetails,
  isSelected: boolean,
  onSelectMenuItem: () => void
};

export const AddStepMenuSelection = ({
  isSelected,
  onSelectMenuItem,
  uiStepTree
}: Props) =>
  <button 
    className={cx('', isSelected && 'selected')}
    onClick={onSelectMenuItem}
  >
    <PreviewStepBoxes stepTree={uiStepTree} />
  </button>;
