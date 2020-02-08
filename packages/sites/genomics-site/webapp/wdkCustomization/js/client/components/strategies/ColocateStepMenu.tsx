import React, { useMemo, useState } from 'react';

import { RadioList } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { MenuChoicesContainer, MenuChoice, inputResultSetDescription } from 'wdk-client/Views/Strategy/AddStepUtils';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import { colocationQuestionSuffix } from './ApiBinaryOperations';

import './ColocateStepMenu.scss';

const cx = makeClassNameHelper('ColocateStepMenu');

export const ColocateStepMenu = ({
  inputRecordClass,
  operandStep,
  recordClasses,
  strategy,
  recordClassesByUrlSegment
}: AddStepOperationMenuProps) => {
  const colocationRecordClasses = useMemo(
    () => recordClasses.filter(
      ({ searches }) =>
        searches.some(
          ({ urlSegment, allowedPrimaryInputRecordClassNames }) => (
            urlSegment.endsWith(colocationQuestionSuffix) &&
            !!allowedPrimaryInputRecordClassNames &&
            allowedPrimaryInputRecordClassNames.includes(inputRecordClass.urlSegment) &&
            inputRecordClass.searches.some(({ urlSegment }) => urlSegment.endsWith(colocationQuestionSuffix))
          )
        )
      ),
    [ inputRecordClass, recordClasses, colocationQuestionSuffix ]
  );

  const [ selectedFeatureTypeUrlSegment, setSelectedFeatureTypeUrlSegment ] = useState<string>(colocationRecordClasses[0].urlSegment);

  const secondaryInputRecordClass = useMemo(
    () => recordClassesByUrlSegment[selectedFeatureTypeUrlSegment],
    [ selectedFeatureTypeUrlSegment ]
  );

  const featureTypeItems = useMemo(
    () => colocationRecordClasses.map(
      ({ displayNamePlural, urlSegment }) => ({
        value: urlSegment,
        display: displayNamePlural
      })
    ),
    [ colocationRecordClasses ]
  );

  return (
    <div className={cx()}>
      <MenuChoicesContainer containerClassName={cx('--Container')}>
        <MenuChoice>
          <strong>Choose <em>which</em> type of feature to use in your new step's result</strong>
          <RadioList
            name="add-step__feature-type-choice"
            onChange={setSelectedFeatureTypeUrlSegment}
            items={featureTypeItems}
            value={selectedFeatureTypeUrlSegment}
          />
        </MenuChoice>
        <MenuChoice>
          <strong>Choose <em>where</em> to obtain the {secondaryInputRecordClass.displayNamePlural} for your new step</strong>
          <SearchInputSelector
            onCombineWithBasketSelected={console.log}
            onCombineWithNewSearchSelected={console.log}
            onCombineWithStrategySelected={console.log}
            strategy={strategy}
            inputRecordClass={secondaryInputRecordClass}
            selectBasketButtonText={`Colocate ${inputResultSetDescription(operandStep.estimatedSize, inputRecordClass) } with your basket`}
          />
        </MenuChoice>
      </MenuChoicesContainer>
    </div>
  );
};
