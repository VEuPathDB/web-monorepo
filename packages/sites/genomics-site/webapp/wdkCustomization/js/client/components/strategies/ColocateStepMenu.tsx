import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { PrimaryInputLabel } from 'wdk-client/Views/Strategy/PrimaryInputLabel';

import { selectSearchPage } from './ColocateStepForm';

import './ColocateStepMenu.scss';

const cx = makeClassNameHelper('ColocateStepMenu');

const colocationQuestionName = 'GenesBySpanLogic';

export const ColocateStepMenu = ({
  developmentMode,
  inputRecordClass,
  operandStep,
  questions,
  recordClasses,
  startOperationForm
}: AddStepOperationMenuProps) => {
  const colocationQuestionSecondaryInputUrlSegments = useMemo(
    () => {
      const colocationQuestion = questions.find(question => question.urlSegment === colocationQuestionName);

      return colocationQuestion && new Set(colocationQuestion.allowedSecondaryInputRecordClassNames);
    }, 
    [ questions ]
  );

  const colocationSecondaryInputClasses = useMemo(
    () => (
      colocationQuestionSecondaryInputUrlSegments && 
      recordClasses.filter(recordClass => colocationQuestionSecondaryInputUrlSegments.has(recordClass.urlSegment))
    ), 
    [ recordClasses, colocationQuestionSecondaryInputUrlSegments ]
  );

  return !colocationSecondaryInputClasses
    ? <Loading />
    : (
      <div className={cx()}>
        <div className={cx('--Header')}>
          <h3>
            Use Genomic Colocation
          </h3>
            to combine it with:
        </div>
        <div className={cx('--Body')}>
          <PrimaryInputLabel
            className={cx('--PrimaryInputLabel')}
            resultSetSize={operandStep.estimatedSize}
            recordClass={inputRecordClass}
          />
          <div className={cx('--ColocationIcon')}>
            X
          </div>
          <div className={cx('--RecordClassSelector')}>
            {
              colocationSecondaryInputClasses.map(
                ({ shortDisplayNamePlural, urlSegment }) =>
                  <button key={urlSegment} onClick={e => {
                    e.preventDefault();

                    developmentMode
                      ? startOperationForm('colocate', selectSearchPage(urlSegment))
                      : alert('Under construction');
                  }}>
                    {shortDisplayNamePlural}
                  </button>
              )
            }
          </div>
        </div>
      </div>
    );
};
