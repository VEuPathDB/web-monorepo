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
          ? <BasketPage {...props} />
          : typedPage.pageType === PageTypes.StrategyForm
          ? <StrategyForm {...props} />
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


const BasketPage = ({}: AddStepOperationFormProps) => <div>Basket Page</div>;
const StrategyForm = ({}: AddStepOperationFormProps) => <div>Strategy Form</div>;
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
    [ recordClasses, newSearchQuestion ]
  );

  const onStepAdded = useCallback((newSearchStepId: number) => {
    setSecondaryStepTree({ stepId: newSearchStepId });
    advanceToPage(colocationOperatorForm(newSearchRecordClass.urlSegment));
  }, [ advanceToPage, newSearchRecordClass, setSecondaryStepTree ]);

  return (
    <QuestionController 
      recordClass={newSearchRecordClass.urlSegment}
      question={searchUrlSegment}
      submissionMetadata={{
        type: 'add-custom-step',
        onStepAdded
      }}
    />
  );
}

const ColocationOperatorForm = (
  { recordClassUrlSegment }: AddStepOperationFormProps & { recordClassUrlSegment: string, secondaryInputStepTree: StepTree }) => 
  <div>{recordClassUrlSegment}</div>;
