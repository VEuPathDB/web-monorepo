import React, { useState, useMemo, useCallback } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { StepTree, NewStepSpec } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { AddStepOperationFormProps } from '@veupathdb/wdk-client/lib/Views/Strategy/AddStepPanel';

import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import WdkService, { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { DEFAULT_STRATEGY_NAME } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { colocationQuestionSuffix } from './ApiBinaryOperations';

import { SpanLogicForm } from '../questions/SpanLogicForm';

import './ColocateStepForm.scss';

const cx = makeClassNameHelper('ColocateStepForm');

enum PageTypes {
  BasketPage = 'basket-page',
  StrategyForm = 'strategy-form',
  NewSearchForm = 'new-search-form',
  ColocationOperatorForm = 'colocation-operator-form',
  PageNotFound = 'not-found'
}

type TypedPage =
  | {
      pageType: PageTypes.BasketPage,
      recordClassUrlSegment: string
    }
  | {
      pageType: PageTypes.StrategyForm,
      recordClassUrlSegment: string,
      strategyId: number,
      name: string
    }
  | {
      pageType: PageTypes.NewSearchForm,
      searchUrlSegment: string
    }
  | {
      pageType: PageTypes.ColocationOperatorForm,
      recordClassUrlSegment: string
    }
  | {
      pageType: PageTypes.PageNotFound,
      pageName: string
    };

const toTypedPage = (untypedPage: string): TypedPage => {
  const [ , prefix, suffix ] = untypedPage.match(/([^/]*)\/((.|\s)*)/) || [];

  if (prefix === PageTypes.BasketPage) {
    return {
      pageType: PageTypes.BasketPage,
      recordClassUrlSegment: suffix
    };
  } else if (prefix === PageTypes.StrategyForm) {
    const [ , recordClassUrlSegment, strategyIdStr, name ] = suffix.match(/([^/]*)\/([^/]*)\/((.|\s)*)/) || [];

    return {
      pageType: PageTypes.StrategyForm,
      recordClassUrlSegment,
      strategyId: parseInt(strategyIdStr, 10),
      name
    };
  } else if (prefix === PageTypes.NewSearchForm) {
    return {
      pageType: PageTypes.NewSearchForm,
      searchUrlSegment: suffix
    };
  } else if (prefix === PageTypes.ColocationOperatorForm) {
    return {
      pageType: PageTypes.ColocationOperatorForm,
      recordClassUrlSegment: suffix
    };
  } else {
    return {
      pageType: PageTypes.PageNotFound,
      pageName: untypedPage
    };
  }
};

export const makeBasketPage = (recordClassUrlSegment: string) =>
  `${PageTypes.BasketPage}/${recordClassUrlSegment}`;

export const makeStrategyFormPage = (recordClassUrlSegment: string, strategyId: number, name: string) =>
  `${PageTypes.StrategyForm}/${recordClassUrlSegment}/${strategyId}/${name}`;

export const makeNewSearchFormPage = (searchUrlSegment: string) =>
  `${PageTypes.NewSearchForm}/${searchUrlSegment}`;

const makeColocationOperatorFormPage = (recordClassUrlSegment: string) =>
  `${PageTypes.ColocationOperatorForm}/${recordClassUrlSegment}`;

type SelectedSecondaryInput = {
  stepTree: StepTree,
  expandedName?: string
};

type SetSelectedSecondaryInput = React.Dispatch<React.SetStateAction<SelectedSecondaryInput | undefined>>;

export const ColocateStepForm = (props: AddStepOperationFormProps) => {
  const [ selectedSecondaryInput, setSelectedSecondaryInput ] = useState<SelectedSecondaryInput | undefined>(undefined);

  const typedPage = toTypedPage(props.currentPage);

  return (
    <div className={cx()}>
      {
        typedPage.pageType === PageTypes.BasketPage
          ? <BasketPage 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              setSelectedSecondaryInput={setSelectedSecondaryInput}
            />
          : typedPage.pageType === PageTypes.StrategyForm
          ? <StrategyForm 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              strategyId={typedPage.strategyId}
              name={typedPage.name}
              setSelectedSecondaryInput={setSelectedSecondaryInput}
            />
          : typedPage.pageType === PageTypes.NewSearchForm
          ? <NewSearchForm
              {...props}
              searchUrlSegment={typedPage.searchUrlSegment}
              setSelectedSecondaryInput={setSelectedSecondaryInput}
            />
          : typedPage.pageType === PageTypes.ColocationOperatorForm && selectedSecondaryInput
          ? <ColocationOperatorForm
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              secondaryInputStepTree={selectedSecondaryInput.stepTree}
              expandedName={selectedSecondaryInput.expandedName}
            />
          : <NotFound />
      }
    </div>
  );
};

const BasketPage = ({
  replacePage,
  questionsByUrlSegment,
  recordClassUrlSegment,
  recordClassesByUrlSegment,
  setSelectedSecondaryInput,
  onHideInsertStep
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSelectedSecondaryInput: SetSelectedSecondaryInput }) => {
  const secondaryInputRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];
  const secondaryInputRecordClassSearchSubsegment = secondaryInputRecordClass.fullName.replace('.', '_');
  const basketSearchUrlSegment = `${secondaryInputRecordClassSearchSubsegment}BySnapshotBasket`;
  const basketDatasetParamName = `${secondaryInputRecordClassSearchSubsegment}Dataset`;

  const basketSearchQuestion = questionsByUrlSegment[basketSearchUrlSegment];
  const basketSearchShortDisplayName = basketSearchQuestion && basketSearchQuestion.shortDisplayName;

  useWdkEffect(wdkService => {
    let shouldCancel = false;

    wdkService.createDataset({
      sourceType: 'basket',
      sourceContent: {
        basketName: recordClassUrlSegment
      }
    })
      .then(datasetId => wdkService.createStep({
          searchName: basketSearchUrlSegment,
          searchConfig: {
            parameters: {
              [basketDatasetParamName]: `${datasetId}`
            }
          },
          customName: basketSearchShortDisplayName
        })
      )
      .then(({ id: newStepId }) => {
        if (!shouldCancel) {
          setSelectedSecondaryInput({ stepTree: { stepId: newStepId } });
          replacePage(makeColocationOperatorFormPage(recordClassUrlSegment));
        }
      });

    return () => {
      shouldCancel = true;
    };
  }, [ replacePage, setSelectedSecondaryInput, secondaryInputRecordClass ]);

  return <Loading />;
};

const StrategyForm = ({
  strategyId,
  name,
  setSelectedSecondaryInput,
  recordClassUrlSegment,
  replacePage
}: AddStepOperationFormProps & { strategyId: number, name: string, recordClassUrlSegment: string, setSelectedSecondaryInput: SetSelectedSecondaryInput }) => {
  useWdkEffect(wdkService => {
    let shouldCancel = false;

    wdkService
      .getDuplicatedStrategyStepTree(strategyId)
      .then(stepTree => {
        if (!shouldCancel) {
          setSelectedSecondaryInput({ stepTree, expandedName: `Copy of ${name || DEFAULT_STRATEGY_NAME}` });
          replacePage(makeColocationOperatorFormPage(recordClassUrlSegment));
        }
      });

    return () => {
      shouldCancel = true;
    };
  }, [ strategyId ]);

  return <Loading />;
};

const NewSearchForm = ({ 
  advanceToPage, 
  reportSubmissionError,
  questionsByUrlSegment, 
  recordClassesByUrlSegment,
  searchUrlSegment, 
  setSelectedSecondaryInput
}: AddStepOperationFormProps & { searchUrlSegment: string, setSelectedSecondaryInput: SetSelectedSecondaryInput }
) => {
  const newSearchQuestion = questionsByUrlSegment[searchUrlSegment];
  const newSearchRecordClass = newSearchQuestion && recordClassesByUrlSegment[newSearchQuestion.outputRecordClassName];

  const onStepSubmitted = useCallback((wdkService: WdkService, newSearchStepSpec: NewStepSpec) => {
    wdkService
      .createStep(newSearchStepSpec)
      .then(({ id }) => {
        setSelectedSecondaryInput({ stepTree: { stepId: id }});
        advanceToPage(makeColocationOperatorFormPage(newSearchRecordClass.urlSegment));
      })
      .catch(error => reportSubmissionError(searchUrlSegment, error, wdkService));
  }, [ advanceToPage, newSearchRecordClass, setSelectedSecondaryInput, searchUrlSegment, reportSubmissionError ]);

  const submissionMetadata = useMemo(
    () => ({ type: 'submit-custom-form', onStepSubmitted }) as SubmissionMetadata, 
    [ onStepSubmitted ]
  );

  return (
    <Plugin
      context={{
        type: 'questionController',
        searchName: searchUrlSegment,
        recordClassName: newSearchRecordClass.urlSegment
      }}
      pluginProps={{
        recordClass: newSearchRecordClass.urlSegment,
        question: searchUrlSegment,
        submissionMetadata: submissionMetadata,
        submitButtonText: 'Continue...'
      }}
      fallback={<Loading />}
    />
  );
}

const ColocationOperatorForm = (
  { 
    questions,
    inputRecordClass,
    recordClassUrlSegment,
    secondaryInputStepTree,
    expandedName,
    updateStrategy,
    operandStep,
    recordClassesByUrlSegment,
    previousStep,
    outputStep,
    reportSubmissionError
  }: AddStepOperationFormProps & { recordClassUrlSegment: string, secondaryInputStepTree: StepTree, expandedName?: string }
) => {
  const colocationQuestionPrimaryInput = useMemo(
    () => questions.find(
      ({ outputRecordClassName, urlSegment }) =>
        urlSegment.endsWith(colocationQuestionSuffix) &&
        outputRecordClassName === inputRecordClass.urlSegment
      ),
    [ questions, inputRecordClass, colocationQuestionSuffix ]
  );

  const colocationQuestionSecondaryInput = useMemo(
    () => questions.find(
      ({ outputRecordClassName, urlSegment }) =>
        urlSegment.endsWith(colocationQuestionSuffix) &&
        outputRecordClassName === recordClassUrlSegment
      ),
    [ questions, recordClassUrlSegment, colocationQuestionSuffix ]
  );

  const currentStepRecordClass = recordClassesByUrlSegment[operandStep.recordClassName];
  const newStepRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];

  const insertingBeforeFirstStep = !previousStep;
  
  const typeChangeAllowed = !outputStep;

  const onStepSubmitted = useCallback((wdkService: WdkService, colocationStepSpec: NewStepSpec) => {
    if (!colocationQuestionPrimaryInput || !colocationQuestionSecondaryInput) {
      throw new Error(`Could not find the necessary questions to perform span logic operation '${JSON.stringify(colocationStepSpec)}'`);
    }

    const shouldUsePrimaryInputQuestion = 
      (colocationStepSpec.searchConfig.parameters['span_output'] === 'a' && !insertingBeforeFirstStep) ||
      (colocationStepSpec.searchConfig.parameters['span_output'] === 'b' && insertingBeforeFirstStep);

      const { urlSegment: searchName, shortDisplayName: customName } = shouldUsePrimaryInputQuestion
        ? colocationQuestionPrimaryInput
        : colocationQuestionSecondaryInput;

    wdkService
      .createStep({
        ...colocationStepSpec,
        searchName,
        customName,
        expandedName
      })
      .then(({ id }) => {
        updateStrategy(id, secondaryInputStepTree);
      })
      .catch(error => reportSubmissionError(colocationStepSpec.searchName, error, wdkService));
  }, [ updateStrategy, insertingBeforeFirstStep, secondaryInputStepTree, expandedName, colocationQuestionPrimaryInput, colocationQuestionSecondaryInput, reportSubmissionError ]);

  const submissionMetadata = useMemo(
    () => ({ type: 'submit-custom-form', onStepSubmitted }) as SubmissionMetadata, 
    [ onStepSubmitted ]
  );

  const FormComponent = useCallback(
    (props: FormProps) =>
      <SpanLogicForm
        {...props}
        currentStepRecordClass={currentStepRecordClass}
        newStepRecordClass={newStepRecordClass}
        insertingBeforeFirstStep={insertingBeforeFirstStep}
        typeChangeAllowed={typeChangeAllowed}
      />,
    [ currentStepRecordClass, newStepRecordClass, insertingBeforeFirstStep, typeChangeAllowed, questions ]
  );

  return (
    !colocationQuestionPrimaryInput || !colocationQuestionSecondaryInput
  )
    ? <NotFound />
    : <Plugin
        context={{
          type: 'questionController',
          searchName: colocationQuestionPrimaryInput.urlSegment,
          recordClassName: recordClassUrlSegment
        }}
        pluginProps={{
          recordClass: recordClassUrlSegment,
          question: colocationQuestionPrimaryInput.urlSegment,
          submissionMetadata: submissionMetadata,
          FormComponent: FormComponent
        }}
        fallback={<Loading />}
      />;
};
