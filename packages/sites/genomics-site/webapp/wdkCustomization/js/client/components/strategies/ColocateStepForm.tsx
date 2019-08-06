import React, { useState, useMemo, useCallback } from 'react';

import { Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import { QuestionController } from 'wdk-client/Controllers';
import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { StrategyInputSelector } from 'wdk-client/Views/Strategy/StrategyInputSelector';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { SpanLogicForm } from '../questions/SpanLogicForm';

import './ColocateStepForm.scss';
import { findAppendPoint } from 'wdk-client/Utils/StrategyUtils';


const cx = makeClassNameHelper('ColocateStepForm');

const colocationQuestionSuffix = 'BySpanLogic';

enum PageTypes {
  SelectSearchPage = 'select-search',
  BasketPage = 'basket-page',
  StrategyForm = 'strategy-form',
  NewSearchForm = 'new-search-form',
  ColocationOperatorForm = 'colocation-operator-form',
  PageNotFound = 'not-found'
}

type TypedPage =
  | {
      pageType: PageTypes.SelectSearchPage,
      recordClassUrlSegment: string
    }
  | {
      pageType: PageTypes.BasketPage,
      recordClassUrlSegment: string
    }
  | {
      pageType: PageTypes.StrategyForm,
      recordClassUrlSegment: string
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

const untypedPageFactory = (prefix: string) => (suffix: string) => `${prefix}/${suffix}`;

const toTypedPage = (untypedPage: string): TypedPage => {
  const [prefix, suffix] = untypedPage.split('/');

  return prefix === PageTypes.SelectSearchPage
    ? {
        pageType: PageTypes.SelectSearchPage,
        recordClassUrlSegment: suffix
      }
    : prefix === PageTypes.BasketPage
    ? {
        pageType: PageTypes.BasketPage,
        recordClassUrlSegment: suffix
      }
    : prefix === PageTypes.StrategyForm
    ? {
        pageType: PageTypes.StrategyForm,
        recordClassUrlSegment: suffix
      }
    : prefix === PageTypes.NewSearchForm
    ? {
        pageType: PageTypes.NewSearchForm,
        searchUrlSegment: suffix
      }
    : prefix === PageTypes.ColocationOperatorForm
    ? {
        pageType: PageTypes.ColocationOperatorForm,
        recordClassUrlSegment: suffix
      }
    : {
        pageType: PageTypes.PageNotFound,
        pageName: untypedPage
      };
};

export const selectSearchPage = untypedPageFactory(PageTypes.SelectSearchPage);
const basketPage = untypedPageFactory(PageTypes.BasketPage);
const strategyForm = untypedPageFactory(PageTypes.StrategyForm);
const newSearchForm = untypedPageFactory(PageTypes.NewSearchForm);
const colocationOperatorForm = untypedPageFactory(PageTypes.ColocationOperatorForm);

export const ColocateStepForm = (props: AddStepOperationFormProps) => {
  const [ secondaryInputStepTree, setSecondaryInputStepTree ] = useState<StepTree | undefined>(undefined);

  const typedPage = toTypedPage(props.currentPage);

  return (
    <div className={cx()}>
      {
        typedPage.pageType === PageTypes.SelectSearchPage
          ? <SelectSearchPage
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
            />
          : typedPage.pageType === PageTypes.BasketPage
          ? <BasketPage 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              setSecondaryStepTree={setSecondaryInputStepTree}
            />
          : typedPage.pageType === PageTypes.StrategyForm
          ? <StrategyForm 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              setSecondaryStepTree={setSecondaryInputStepTree}
            />
          : typedPage.pageType === PageTypes.NewSearchForm
          ? <NewSearchForm
              {...props}
              searchUrlSegment={typedPage.searchUrlSegment}
              setSecondaryStepTree={setSecondaryInputStepTree}
            />
          : typedPage.pageType === PageTypes.ColocationOperatorForm && secondaryInputStepTree
          ? <ColocationOperatorForm
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              secondaryInputStepTree={secondaryInputStepTree}
            />
          : <NotFound />
      }
    </div>
  );
};

const SelectSearchPage = ({
  advanceToPage,
  recordClassesByUrlSegment,
  recordClassUrlSegment
}: AddStepOperationFormProps & { recordClassUrlSegment: string }) => {
  const secondaryInputRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];
 
  const onCombineWithBasketClicked = useCallback(() => {
    advanceToPage(basketPage(recordClassUrlSegment));
  }, [ advanceToPage, recordClassUrlSegment ]);

  const onCombineWithStrategyClicked = useCallback(() => {
    advanceToPage(strategyForm(recordClassUrlSegment));
  }, [ advanceToPage, recordClassUrlSegment ]);

  const onCombineWithNewSearchClicked = useCallback((searchUrlSegment: string) => {
    advanceToPage(newSearchForm(searchUrlSegment));
  }, [ advanceToPage ]);

  return (
    <SearchInputSelector
      combinedWithBasketDisabled={false}
      containerClassName={cx('--SearchInputSelector')}
      inputRecordClass={secondaryInputRecordClass}
      onCombineWithBasketClicked={onCombineWithBasketClicked}
      onCombineWithStrategyClicked={onCombineWithStrategyClicked}
      onCombineWithNewSearchClicked={onCombineWithNewSearchClicked}
    />
  );
};


const BasketPage = ({
  advanceToPage,
  questionsByUrlSegment,
  recordClassUrlSegment,
  recordClassesByUrlSegment,
  setSecondaryStepTree
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }) => {
  const secondaryInputRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];
  const secondaryInputRecordClassSearchSubsegment = secondaryInputRecordClass.fullName.replace('.', '_');
  const basketSearchUrlSegment = `${secondaryInputRecordClassSearchSubsegment}BySnapshotBasket`;
  const basketDatasetParamName = `${secondaryInputRecordClassSearchSubsegment}Dataset`;

  const basketSearchQuestion = questionsByUrlSegment[basketSearchUrlSegment];
  const basketSearchShortDisplayName = basketSearchQuestion && basketSearchQuestion.shortDisplayName;

  useWdkEffect(wdkService => {
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
        setSecondaryStepTree({ stepId: newStepId });
        advanceToPage(colocationOperatorForm(recordClassUrlSegment));
      });
  }, [ advanceToPage, setSecondaryStepTree, secondaryInputRecordClass ]);

  return <Loading />;
};

const StrategyForm = ({
  advanceToPage,
  recordClassUrlSegment,
  recordClassesByUrlSegment,
  setSecondaryStepTree,
  strategy
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }) => {
  const [ selectedStrategyId, setSelectedStrategyId ] = useState<number | undefined>(undefined);

  const secondaryInputRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];
  
  useWdkEffect(wdkService => {
    if (selectedStrategyId !== undefined) {
      wdkService.getDuplicatedStrategyStepTree(selectedStrategyId).then(stepTree => {
        setSecondaryStepTree(stepTree);
        advanceToPage(colocationOperatorForm(secondaryInputRecordClass.urlSegment));
      });
    }
  }, [ selectedStrategyId ]);

  return selectedStrategyId !== undefined
    ? <Loading />
    : <StrategyInputSelector
        primaryInput={strategy}
        secondaryInputRecordClass={secondaryInputRecordClass}
        onStrategySelected={setSelectedStrategyId}
      />;
};

const NewSearchForm = ({ 
  advanceToPage, 
  questionsByUrlSegment, 
  recordClassesByUrlSegment,
  searchUrlSegment, 
  setSecondaryStepTree 
}: AddStepOperationFormProps & { searchUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }
) => {
  const newSearchQuestion = questionsByUrlSegment[searchUrlSegment];
  const newSearchRecordClass = newSearchQuestion && recordClassesByUrlSegment[newSearchQuestion.outputRecordClassName];

  const onStepAdded = useCallback((newSearchStepId: number) => {
    setSecondaryStepTree({ stepId: newSearchStepId });
    advanceToPage(colocationOperatorForm(newSearchRecordClass.urlSegment));
  }, [ advanceToPage, newSearchRecordClass, setSecondaryStepTree ]);

  const submissionMetadata = useMemo(
    () => ({ type: 'add-custom-step', onStepAdded }) as SubmissionMetadata, 
    [ onStepAdded ]
  );

  return (
    <QuestionController 
      recordClass={newSearchRecordClass.urlSegment}
      question={searchUrlSegment}
      submissionMetadata={submissionMetadata}
    />
  );
}

const ColocationOperatorForm = (
  { 
    questions,
    recordClassUrlSegment,
    secondaryInputStepTree,
    updateStrategy,
    operandStep,
    addType,
    recordClassesByUrlSegment,
    strategy,
    previousStep
  }: AddStepOperationFormProps & { recordClassUrlSegment: string, secondaryInputStepTree: StepTree }
) => {
  const colocationQuestion = useMemo(
    () => questions.find(
      ({ outputRecordClassName, urlSegment }) =>
        urlSegment.endsWith(colocationQuestionSuffix) &&
        outputRecordClassName === recordClassUrlSegment
      ),
    [ questions, recordClassUrlSegment, colocationQuestionSuffix ]
  );

  const onStepAdded = useCallback((colocationStepId: number) => {
    updateStrategy(colocationStepId, secondaryInputStepTree);
  }, [ updateStrategy, secondaryInputStepTree ]);

  const submissionMetadata = useMemo(
    () => ({ type: 'add-custom-step', onStepAdded }) as SubmissionMetadata, 
    [ onStepAdded ]
  );

  const outputStep = useMemo(
    () => addType.type === 'append' && strategy.stepTree.stepId === addType.primaryInputStepId
      ? undefined
      : addType.type === 'append'
      ? strategy.steps[findAppendPoint(strategy.stepTree, addType.primaryInputStepId).stepId]
      : strategy.steps[addType.outputStepId], 
    [ strategy, addType ]
  );

  const currentStepRecordClass = recordClassesByUrlSegment[operandStep.recordClassName];
  const newStepRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];

  const insertingBeforeFirstStep = !previousStep;

  const typeChangeAllowed = !outputStep;

  const FormComponent = useCallback(
    (props: FormProps) =>
      <SpanLogicForm
        {...props}
        currentStepRecordClass={currentStepRecordClass}
        newStepRecordClass={newStepRecordClass}
        insertingBeforeFirstStep={insertingBeforeFirstStep}
        typeChangeAllowed={typeChangeAllowed}
      />,
    [ recordClassesByUrlSegment, operandStep, recordClassUrlSegment ]
  );

  return !colocationQuestion
    ? <NotFound />
    : <QuestionController
        recordClass={recordClassUrlSegment}
        question={colocationQuestion.urlSegment}
        submissionMetadata={submissionMetadata}
        FormComponent={FormComponent}      
      />;
};
