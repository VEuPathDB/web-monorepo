import React, { useState, useMemo, useCallback } from 'react';

import { Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StepTree, NewStepSpec } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import WdkService, { useWdkEffect } from 'wdk-client/Service/WdkService';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { StrategyInputSelector } from 'wdk-client/Views/Strategy/StrategyInputSelector';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { PrimaryInputLabel } from 'wdk-client/Views/Strategy/PrimaryInputLabel';

import { colocationQuestionSuffix } from './ApiBinaryOperations';

import { SpanLogicForm } from '../questions/SpanLogicForm';

import './ColocateStepForm.scss';

const cx = makeClassNameHelper('ColocateStepForm');

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
        typedPage.pageType === PageTypes.SelectSearchPage
          ? <SelectSearchPage
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
            />
          : typedPage.pageType === PageTypes.BasketPage
          ? <BasketPage 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
              setSelectedSecondaryInput={setSelectedSecondaryInput}
            />
          : typedPage.pageType === PageTypes.StrategyForm
          ? <StrategyForm 
              {...props}
              recordClassUrlSegment={typedPage.recordClassUrlSegment}
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

const SelectSearchPage = ({
  advanceToPage,
  inputRecordClass,
  operandStep,
  recordClassesByUrlSegment,
  recordClassUrlSegment,
  strategy
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
    <div className={cx('--SelectSearchPage')}>
      <h2>
        Choose a {secondaryInputRecordClass.displayName} result to combine with your strategy using <em>genomic colocation</em>
      </h2>

      <p>
        Genomic colocation allows you to select members of either result based on their proximity to members of the other set.<br />  
        For example, you can find {inputRecordClass.displayNamePlural} in your strategy that are 100 bp upstream of {secondaryInputRecordClass.displayNamePlural} in the result you are combining.
      </p>

      <p>
        The next step is to choose a set of {secondaryInputRecordClass.displayNamePlural} to combine. 
      </p>

      <div className={cx('--SearchInputSelectorContainer')}>
        <PrimaryInputLabel
          resultSetSize={operandStep.estimatedSize}
          recordClass={inputRecordClass}
        />
        <div className={cx('--ColocationIcon')}></div>
        <SearchInputSelector
          containerClassName={cx('--SearchInputSelector')}
          strategy={strategy}
          inputRecordClass={secondaryInputRecordClass}
          onCombineWithBasketClicked={onCombineWithBasketClicked}
          onCombineWithStrategyClicked={onCombineWithStrategyClicked}
          onCombineWithNewSearchClicked={onCombineWithNewSearchClicked}
        />
      </div>
    </div>
  );
};


const BasketPage = ({
  replacePage,
  questionsByUrlSegment,
  recordClassUrlSegment,
  recordClassesByUrlSegment,
  setSelectedSecondaryInput
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSelectedSecondaryInput: SetSelectedSecondaryInput }) => {
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
        setSelectedSecondaryInput({ stepTree: { stepId: newStepId } });
        replacePage(colocationOperatorForm(recordClassUrlSegment));
      });
  }, [ replacePage, setSelectedSecondaryInput, secondaryInputRecordClass ]);

  return <Loading />;
};

const StrategyForm = ({
  advanceToPage,
  recordClassUrlSegment,
  recordClassesByUrlSegment,
  setSelectedSecondaryInput,
  strategy
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSelectedSecondaryInput: SetSelectedSecondaryInput }) => {
  const [ selectedStrategy, setSelectedStrategy ] = useState<{ id: number, name: string } | undefined>(undefined);

  const secondaryInputRecordClass = recordClassesByUrlSegment[recordClassUrlSegment];
  
  const onStrategySelected = useCallback((id: number, name: string) => {
    setSelectedStrategy({ id, name });
  }, []);

  useWdkEffect(wdkService => {
    if (selectedStrategy !== undefined) {
      wdkService.getDuplicatedStrategyStepTree(selectedStrategy.id).then(stepTree => {
        setSelectedSecondaryInput({ stepTree, expandedName: `Copy of ${selectedStrategy.name}` });
        advanceToPage(colocationOperatorForm(secondaryInputRecordClass.urlSegment));
      });
    }
  }, [ selectedStrategy ]);

  return selectedStrategy !== undefined
    ? <Loading />
    : <StrategyInputSelector
        primaryInput={strategy}
        secondaryInputRecordClass={secondaryInputRecordClass}
        onStrategySelected={onStrategySelected}
      />;
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
        advanceToPage(colocationOperatorForm(newSearchRecordClass.urlSegment));
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
      />;
};
