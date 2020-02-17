import React, { useCallback, useMemo, useState } from 'react';

import { RadioList } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { MenuChoicesContainer, MenuChoice } from 'wdk-client/Views/Strategy/AddStepUtils';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import { colocationQuestionSuffix } from './ApiBinaryOperations';
import { makeBasketPage, makeNewSearchFormPage, makeStrategyFormPage } from './ColocateStepForm';

import './ColocateStepMenu.scss';

const cx = makeClassNameHelper('ColocateStepMenu');

export const ColocateStepMenu = ({
  inputRecordClass,
  recordClasses,
  strategy,
  recordClassesByUrlSegment,
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

  const inputRecordClasses = useMemo(
    () => [ secondaryInputRecordClass ],
    [ secondaryInputRecordClass ]
  );

  return (
    <div className={cx()}>
      <p>
        Use the relative position of features on the genome between your existing step and the new step to identify features to keep in the final result.
      </p>
      <MenuChoicesContainer containerClassName={cx('--Container')}>
        <MenuChoice>
          <strong>Choose the data type of your new step</strong>
          <RadioList
            name="add-step__feature-type-choice"
            onChange={setSelectedFeatureTypeUrlSegment}
            items={featureTypeItems}
            value={selectedFeatureTypeUrlSegment}
          />
        </MenuChoice>
        <MenuChoice>
          <strong>Choose <em>which</em> {secondaryInputRecordClass.displayNamePlural} to colocate. From...</strong>
          <SearchInputSelector
            onCombineWithNewSearchSelected={onCombineNewSearchSelected}
            onCombineWithStrategySelected={onCombineWithStrategySelected}
            onCombineWithBasketSelected={onCombineWithBasketSelected}
            strategy={strategy}
            inputRecordClasses={inputRecordClasses}
            selectBasketButtonText={`Colocate Step ${stepsCompletedNumber} with your basket`}
          />
        </MenuChoice>
      </MenuChoicesContainer>
    </div>
  );
};
