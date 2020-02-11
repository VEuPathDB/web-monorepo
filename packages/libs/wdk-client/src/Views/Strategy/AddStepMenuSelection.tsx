import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { PreviewStepBoxes } from 'wdk-client/Views/Strategy/StepBoxes';
import { PartialUiStepTree } from 'wdk-client/Views/Strategy/Types';

import './AddStepMenuSelection.scss';

const cx = makeClassNameHelper('AddStepMenuSelection');

type Props = {
  operationName: string,
  uiStepTree: PartialUiStepTree,
  inputRecordClass: RecordClass,
  strategy: StrategyDetails,
  isSelected: boolean,
  onSelectMenuItem: () => void
};

export const AddStepMenuSelection = ({
  isSelected,
  onSelectMenuItem,
  operationName,
  inputRecordClass,
  uiStepTree
}: Props) =>
  <button 
    className={cx('', isSelected && 'selected')}
    onClick={onSelectMenuItem}
  >
    {/* FIXME Remove this hardcoding by updating the AddStepMenuConfig type */}
    {
      operationName === 'combine' &&
      <React.Fragment>
        <h3>
          <strong>Combine</strong> with other {inputRecordClass.displayNamePlural}
        </h3>
      </React.Fragment>
    }
    {
      operationName === 'convert' &&
      <React.Fragment>
        <h3>
          <strong>Transform</strong> into related records
        </h3>
      </React.Fragment>
    }
    {
      operationName === 'colocate' &&
      <React.Fragment>
        <h3>
          Use <strong>Genomic Colocation</strong> to combine with other genomic features
        </h3>
      </React.Fragment>
    }
  </button>;
