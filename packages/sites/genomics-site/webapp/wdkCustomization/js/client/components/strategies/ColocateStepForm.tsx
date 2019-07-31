import React, { useState, useMemo, useCallback } from 'react';

import { Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import './ColocateStepForm.scss';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { QuestionController } from 'wdk-client/Controllers';
import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import { StrategyInputSelector } from 'wdk-client/Views/Strategy/StrategyInputSelector';
import { number } from 'wdk-client/Utils/Json';
import { useWdkEffect } from 'wdk-client/Service/WdkService';

const cx = makeClassNameHelper('ColocateStepForm');

const colocationQuestionName = 'GenesBySpanLogic';

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
  inputRecordClass,
  recordClasses,
  recordClassUrlSegment
}: AddStepOperationFormProps & { recordClassUrlSegment: string }) => {
  const secondaryInputRecordClass = useMemo(
    () => recordClasses.find(({ urlSegment }) => urlSegment === recordClassUrlSegment) || inputRecordClass,
    [ recordClassUrlSegment ]
  );

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
  inputRecordClass,
  questions,
  recordClassUrlSegment,
  recordClasses,
  setSecondaryStepTree
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }) => {
  const secondaryInputRecordClass = useMemo(
    () => recordClasses.find(({ urlSegment }) => urlSegment === recordClassUrlSegment) || inputRecordClass,
    [ recordClasses, recordClassUrlSegment ]
  );

  const secondaryInputRecordClassSearchSubsegment = secondaryInputRecordClass.fullName.replace('.', '_');
  const basketSearchUrlSegment = `${secondaryInputRecordClassSearchSubsegment}BySnapshotBasket`;
  const basketDatasetParamName = `${secondaryInputRecordClassSearchSubsegment}Dataset`;

  const basketSearchShortDisplayName = useMemo(
    () => {
      const basketSearchQuestion = questions.find(({ urlSegment }) => urlSegment === basketSearchUrlSegment);
      return basketSearchQuestion && basketSearchQuestion.shortDisplayName;
    },
    [ questions, basketSearchUrlSegment ]
  );

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
  inputRecordClass,
  recordClassUrlSegment,
  recordClasses,
  setSecondaryStepTree,
  strategy
}: AddStepOperationFormProps & { recordClassUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }) => {
  const [ selectedStrategyId, setSelectedStrategyId ] = useState<number | undefined>(undefined);

  const secondaryInputRecordClass = useMemo(
    () => recordClasses.find(({ urlSegment }) => urlSegment === recordClassUrlSegment) || inputRecordClass,
    [ inputRecordClass, recordClasses, recordClassUrlSegment ]
  );

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
  inputRecordClass, 
  questions, 
  recordClasses,
  searchUrlSegment, 
  setSecondaryStepTree 
}: AddStepOperationFormProps & { searchUrlSegment: string, setSecondaryStepTree: (stepTree: StepTree) => void }
) => {
  const newSearchQuestion = useMemo(
    () => questions.find(({ urlSegment }) => urlSegment === searchUrlSegment),
    [ questions, searchUrlSegment ]
  );

  const newSearchRecordClass = useMemo(
    () => (
      newSearchQuestion && recordClasses.find(({ urlSegment }) => urlSegment === newSearchQuestion.outputRecordClassName)
    ) || inputRecordClass,
    [ inputRecordClass, recordClasses, newSearchQuestion ]
  );

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
    recordClassUrlSegment,
    secondaryInputStepTree,
    updateStrategy
  }: AddStepOperationFormProps & { recordClassUrlSegment: string, secondaryInputStepTree: StepTree }
) => {
  const onStepAdded = useCallback((colocationStepId: number) => {
    updateStrategy(colocationStepId, secondaryInputStepTree);
  }, [ updateStrategy, secondaryInputStepTree ]);

  const submissionMetadata = useMemo(
    () => ({ type: 'add-custom-step', onStepAdded }) as SubmissionMetadata, 
    [ onStepAdded ]
  );

  return (
    <QuestionController
      recordClass={recordClassUrlSegment}
      question={colocationQuestionName}
      submissionMetadata={submissionMetadata}
    />
  );
};
