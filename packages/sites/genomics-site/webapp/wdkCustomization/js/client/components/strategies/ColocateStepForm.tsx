import React, { useState, useMemo, useCallback } from 'react';

import { Loading } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';

import './ColocateStepForm.scss';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { QuestionController } from 'wdk-client/Controllers';

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
  const [prefix, suffix0, suffix1] = untypedPage.split('/');

  return prefix === PageTypes.SelectSearchPage
    ? {
        pageType: PageTypes.SelectSearchPage,
        recordClassUrlSegment: suffix0
      }
    : prefix === PageTypes.BasketPage
    ? {
        pageType: PageTypes.BasketPage,
        recordClassUrlSegment: suffix0
      }
    : prefix === PageTypes.StrategyForm
    ? {
        pageType: PageTypes.StrategyForm,
        recordClassUrlSegment: suffix0
      }
    : prefix === PageTypes.NewSearchForm
    ? {
        pageType: PageTypes.NewSearchForm,
        searchUrlSegment: suffix0
      }
    : prefix === PageTypes.ColocationOperatorForm 
    ? {
        pageType: PageTypes.ColocationOperatorForm,
        recordClassUrlSegment: suffix0
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
  const secondaryInputStepTree = useState<StepTree | undefined>(undefined);

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
            />
          : typedPage.pageType === PageTypes.ColocationOperatorForm && secondaryInputStepTree
          ? <ColocateStepForm {...props} />
          : <NotFound />
      }
    </div>
  ); 
};

const SelectSearchPage = ({
  advanceToPage,
  recordClasses,
  recordClassUrlSegment
}: AddStepOperationFormProps & { recordClassUrlSegment: string }) => {
  const secondaryInputRecordClass = useMemo(
    () => recordClasses.find(({ urlSegment }) => urlSegment === recordClassUrlSegment),
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

  return !secondaryInputRecordClass
    ? <NotFound />
    : <SearchInputSelector
        combinedWithBasketDisabled={false}
        containerClassName={cx('--SearchInputSelector')}
        inputRecordClass={secondaryInputRecordClass}
        onCombineWithBasketClicked={onCombineWithBasketClicked}
        onCombineWithStrategyClicked={onCombineWithStrategyClicked}
        onCombineWithNewSearchClicked={onCombineWithNewSearchClicked}
      />;
};


const BasketPage = ({}: AddStepOperationFormProps) => <div>Basket Page</div>;
const StrategyForm = ({}: AddStepOperationFormProps) => <div>Strategy Form</div>;
const NewSearchForm = ({ advanceToPage, searchUrlSegment }: AddStepOperationFormProps & { searchUrlSegment: string }) =>
  <QuestionController 
    recordClass={'transcript'}
    question={searchUrlSegment}
    submissionMetadata={{
      type: 'add-custom-step',
      onStepAdded: () => {
        console.log('UH LUUUUH');
        advanceToPage(colocationOperatorForm('transcript'));
      }
    }}
  />
const ColocationOperatorForm = ({}: AddStepOperationFormProps) => null;
