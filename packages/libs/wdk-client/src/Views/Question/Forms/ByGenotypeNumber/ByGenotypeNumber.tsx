import React from 'react';

import { Link } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import {
  changeGroupVisibility,
  updateParamValue,
  submitQuestion
} from 'wdk-client/Actions/QuestionActions';
import 'wdk-client/Views/Question/DefaultQuestionForm.scss';
import { memoize } from 'lodash';

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
};

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
  parameterElements: Record<string, React.ReactNode>;
};

const cx = makeClassNameHelper('wdk-QuestionForm');

const onSubmit = memoize((dispatchAction: DispatchAction, urlSegment: string) => (e: React.FormEvent) => {
  e.preventDefault();
  dispatchAction(submitQuestion({ searchName: urlSegment }));
});

export const ByGenotypeNumber: React.FunctionComponent<Props> = ({
  dispatchAction,
  state: {
    question: {
      urlSegment
    }
  },
  parameterElements
}) =>
  <div className={`${cx()} ${cx('ByGenotypeNumber')}`}>
    <h1>Identify RFLP Genotype Isolates based on RFLP Genotype Number</h1>
    <form onSubmit={onSubmit(dispatchAction, urlSegment)}>
      {parameterElements.genotype}
      <div className={cx('SubmitSection')}>
        <button type="submit" className="btn">
          Get Answer
        </button>
      </div>
      <hr />
      <b>Data Sets used by this search</b>
      <Link to="/record/dataset/DS_5dfd0d0bb2">
        <i>T. gondii</i> RFLP genotypes (Chunlei Su lab)
      </Link>
    </form>
  </div>;
