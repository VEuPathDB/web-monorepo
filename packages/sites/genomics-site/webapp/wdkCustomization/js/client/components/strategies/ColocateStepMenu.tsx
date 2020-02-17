import React, { useCallback, useMemo } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import { colocationQuestionSuffix } from './ApiBinaryOperations';
import { makeBasketPage, makeNewSearchFormPage, makeStrategyFormPage } from './ColocateStepForm';

import './ColocateStepMenu.scss';

const cx = makeClassNameHelper('ColocateStepMenu');

export const ColocateStepMenu = ({
  inputRecordClass,
  recordClasses,
  strategy,
  startOperationForm,
  stepsCompletedNumber
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

  const secondaryInputRecordClass = colocationRecordClasses[0];

  const onCombineNewSearchSelected = useCallback((searchUrlSegment: string) => {
    startOperationForm(
      'colocate',
      makeNewSearchFormPage(searchUrlSegment)
    );
  }, [ startOperationForm ]);

  const onCombineWithStrategySelected = useCallback((strategyId: number, name: string) => {
    startOperationForm(
      'colocate',
      makeStrategyFormPage(secondaryInputRecordClass.urlSegment, strategyId, name)
    );
  }, [ startOperationForm, secondaryInputRecordClass ]);

  const onCombineWithBasketSelected = useCallback(() => {
    startOperationForm(
      'colocate',
      makeBasketPage(secondaryInputRecordClass.urlSegment)
    );
  }, [ startOperationForm, secondaryInputRecordClass ]);

  return (
    <div className={cx()}>
      <p>
        Use the relative position of features on the genome between your existing step and the new step to identify features to keep in the final result.
      </p>
      <strong>Choose <em>which</em> features to colocate. From...</strong>
      <SearchInputSelector
        onCombineWithNewSearchSelected={onCombineNewSearchSelected}
        onCombineWithStrategySelected={onCombineWithStrategySelected}
        onCombineWithBasketSelected={onCombineWithBasketSelected}
        strategy={strategy}
        inputRecordClasses={colocationRecordClasses}
        selectBasketButtonText={`Colocate Step ${stepsCompletedNumber} with your basket`}
      />
    </div>
  );
};
