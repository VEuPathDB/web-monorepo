import React, { useMemo } from 'react';

import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { RecordClass } from '../../Utils/WdkModel';
import { PreviewStepBoxes } from '../../Views/Strategy/StepBoxes';
import { PartialUiStepTree, AddType } from '../../Views/Strategy/Types';
import { AddStepMenuConfig } from '../../Utils/Operations';
import { findSlotNumber } from '../../Utils/StrategyUtils';

import './AddStepMenuSelection.scss';

const cx = makeClassNameHelper('AddStepMenuSelection');

type Props = {
  uiStepTree: PartialUiStepTree;
  inputRecordClass: RecordClass;
  isSelected: boolean;
  onSelectMenuItem: () => void;
  addType: AddType;
  AddStepHeaderComponent: AddStepMenuConfig['AddStepHeaderComponent'];
  AddStepNewInputComponent: AddStepMenuConfig['AddStepNewInputComponent'];
  AddStepNewOperationComponent: AddStepMenuConfig['AddStepNewOperationComponent'];
};

export const AddStepMenuSelection = ({
  isSelected,
  onSelectMenuItem,
  inputRecordClass,
  uiStepTree,
  addType,
  AddStepHeaderComponent,
  AddStepNewInputComponent,
  AddStepNewOperationComponent,
}: Props) => {
  const targetSlotNumber = useMemo(
    () => findSlotNumber(uiStepTree, addType.stepId),
    [uiStepTree, addType]
  );

  return (
    <button
      className={cx('', isSelected && 'selected')}
      onClick={onSelectMenuItem}
    >
      <h3>
        <AddStepHeaderComponent inputRecordClass={inputRecordClass} />
      </h3>
      <PreviewStepBoxes
        stepTree={uiStepTree}
        fromSlot={
          addType.type === 'insert-before'
            ? Math.max(targetSlotNumber - 1, 1)
            : targetSlotNumber
        }
        toSlot={targetSlotNumber}
        insertAtSlot={targetSlotNumber}
        insertType={addType.type}
        newOperationStepBox={<AddStepNewOperationComponent />}
        newInputStepBox={<AddStepNewInputComponent />}
      />
    </button>
  );
};
