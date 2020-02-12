import React, { useMemo } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { PreviewStepBoxes, BooleanPreview, TransformPreview, ColocatePreview, LeafPreview } from 'wdk-client/Views/Strategy/StepBoxes';
import { PartialUiStepTree, AddType } from 'wdk-client/Views/Strategy/Types';

import './AddStepMenuSelection.scss';
import { findSlotNumber } from 'wdk-client/Utils/StrategyUtils';

const cx = makeClassNameHelper('AddStepMenuSelection');

type Props = {
  operationName: string,
  uiStepTree: PartialUiStepTree,
  inputRecordClass: RecordClass,
  strategy: StrategyDetails,
  isSelected: boolean,
  onSelectMenuItem: () => void,
  addType: AddType
};

export const AddStepMenuSelection = ({
  isSelected,
  onSelectMenuItem,
  operationName,
  inputRecordClass,
  uiStepTree,
  addType,
}: Props) => {
  // FIXME: Remove this hardcoding by updating the AddStepMenuConfig
  const [ headerContent, operationStepBox, newInputStepBox ] = operationName === 'combine'
    ? [
        <React.Fragment>
          <strong>Combine</strong> with other {inputRecordClass.displayNamePlural}
        </React.Fragment>,
        <BooleanPreview />,
        <LeafPreview />
      ]
    : operationName === 'convert'
    ? [
        <React.Fragment>
          <strong>Transform</strong> into related records
        </React.Fragment>,
        <TransformPreview />,
        null
      ]
    : [
        <React.Fragment>
          Use <strong>Genomic Colocation</strong> to combine with other genomic features
        </React.Fragment>,
        <ColocatePreview />,
        <LeafPreview />
      ];

  const targetSlotNumber = useMemo(
    () => findSlotNumber(uiStepTree, addType.stepId),
    [ uiStepTree, addType ]
  );

  return (
    <button
      className={cx('', isSelected && 'selected')}
      onClick={onSelectMenuItem}
    >
      <h3>{headerContent}</h3>
      <PreviewStepBoxes
        stepTree={uiStepTree}
        fromSlot={addType.type === 'insert-before'
          ? Math.max(targetSlotNumber - 1, 1)
          : targetSlotNumber
        }
        toSlot={targetSlotNumber}
        insertAtSlot={targetSlotNumber}
        insertType={addType.type}
        newOperationStepBox={operationStepBox}
        newInputStepBox={newInputStepBox}
      />
    </button>
  );
};


