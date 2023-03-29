import { isEqual } from 'lodash';
import QueryString from 'querystring';
import * as React from 'react';
import PageController from '../Core/Controllers/PageController';
import { RootState } from '../Core/State/Types';
import { wrappable } from '../Utils/ComponentUtils';
import { isEmpty, ListIteratee } from 'lodash';
import {
  loadAnswer,
  changeColumnPosition,
  changeVisibleColumns,
  changeSorting,
  Sorting,
} from '../Actions/AnswerActions';
import Answer from '../Views/Answer/Answer';
import Loading from '../Components/Loading/Loading';
import { State } from '../StoreModules/AnswerViewStoreModule';
import NotFound from '../Views/NotFound/NotFound';
import { connect } from 'react-redux';
import {
  AttributeField,
  TableField,
  AttributeValue,
  RecordInstance,
  RecordClass,
} from '../Utils/WdkModel';
import { History } from 'history';
import { filterRecords } from '../Views/Records/RecordUtils';

const MAXROWS = 4000;

const ActionCreators = {
  loadAnswer,
  changeColumnPosition,
  changeVisibleColumns,
  changeSorting,
};

// FIXME Remove this when Answer is converted to Typescript
const CastAnswer: any = Answer;

type StateProps = State;

type DispatchProps = typeof ActionCreators;

interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}

interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}

interface RowClassNameProps {
  record: RecordInstance;
  recordClass: RecordClass;
}

interface TableAction {
  key: string;
  display: React.ReactNode;
}

type Options = {
  // optional overrides
  renderCellContent?: (props: RenderCellProps) => React.ReactNode;
  deriveRowClassName?: (props: RowClassNameProps) => string | undefined;
  customSortBys?: Record<string, ListIteratee<RecordInstance>[]>;
  additionalActions?: TableAction[];
};

type OwnProps = {
  recordClass: string;
  question: string;
  parameters?: Record<string, string>;
  filterTerm?: string;
  filterAttributes?: string[];
  filterTables?: string[];
  history: History;
};

export type Props = {
  stateProps: StateProps;
  dispatchProps: DispatchProps;
  ownProps: OwnProps;
} & Options;

export const DEFAULT_PAGINATION = { numRecords: MAXROWS, offset: 0 };
export const DEFAULT_SORTING = [
  { attributeName: 'primary_key', direction: 'ASC' } as Sorting,
];

class AnswerController extends PageController<Props> {
  changeFilter = (
    filterTerm: string,
    filterAttributes?: string[],
    filterTables?: string[]
  ) => {
    const { history } = this.props.ownProps;
    const currentParams = QueryString.parse(history.location.search.slice(1));

    // remove current filter query params
    delete currentParams.filterTerm;
    delete currentParams.filterAttributes;
    delete currentParams.filterTables;

    if (!filterTerm) {
      const queryString = QueryString.stringify(currentParams);
      history.replace(`?${queryString}`);
      return;
    }

    const queryParams: {
      filterTerm: string;
      filterAttributes?: string[];
      filterTables?: string[];
    } = { ...currentParams, filterTerm };
    if (!isEmpty(filterAttributes))
      queryParams.filterAttributes = filterAttributes;
    if (!isEmpty(filterTables)) queryParams.filterTables = filterTables;
    const queryString = QueryString.stringify(queryParams);
    this.props.ownProps.history.replace(`?${queryString}`);
  };

  loadData(prevProps?: Props) {
    // incoming values from the router
    let {
      question,
      recordClass: recordClassName,
      parameters,
      filterTerm,
      filterAttributes,
      filterTables,
    } = this.props.ownProps;
    let [, searchName, customName] = question.match(/([^:]+):?(.*)/) || [
      '',
      question,
      '',
    ];

    const { dispatchProps } = this.props;

    // (re)initialize the page, if question, recordClass, or parameters changes
    if (
      question !== prevProps?.ownProps.question ||
      recordClassName !== prevProps?.ownProps.recordClass ||
      !isEqual(parameters, prevProps?.ownProps.parameters)
    ) {
      let pagination = DEFAULT_PAGINATION;
      let sorting = DEFAULT_SORTING;
      let displayInfo = {
        pagination,
        sorting,
        customName,
        attributes: [],
        tables: [],
      };
      let opts = {
        displayInfo,
        parameters,
        filterTerm,
        filterAttributes,
        filterTables,
      };
      dispatchProps.loadAnswer(searchName, recordClassName, opts);
    }
  }

  isRenderDataLoaded() {
    const {
      stateProps: { isLoading },
    } = this.props;

    return isLoading === false;
  }

  isRenderDataLoadError() {
    const {
      stateProps: { error },
    } = this.props;

    return error != null && ('status' in error ? error.status !== 404 : true);
  }

  isRenderDataNotFound() {
    const {
      stateProps: { error },
    } = this.props;

    return error != null && 'status' in error && error.status === 404;
  }

  getTitle() {
    const {
      stateProps: {
        displayInfo = { customName: '' },
        error,
        question = { displayName: '' },
        records,
      },
    } = this.props;

    return error
      ? 'Error loading results'
      : records
      ? displayInfo.customName || question.displayName
      : 'Loading...';
  }

  renderLoading() {
    const { isLoading } = this.props.stateProps;

    return isLoading && <Loading />;
  }

  renderDataNotFound() {
    return (
      <NotFound>
        <p>The search you requested does not exist.</p>
      </NotFound>
    );
  }

  renderAnswer() {
    let {
      meta,
      records,
      displayInfo,
      allAttributes,
      visibleAttributes,
      question,
      recordClass = {
        attributes: [] as AttributeField[],
        tables: [] as TableField[],
      },
    } = this.props.stateProps;

    let {
      filterTerm,
      filterAttributes = [],
      filterTables = [],
    } = this.props.ownProps;

    const { changeSorting, changeColumnPosition, changeVisibleColumns } =
      this.props.dispatchProps;

    const filteredRecords =
      records && filterTerm
        ? filterRecords(records, { filterTerm, filterAttributes, filterTables })
        : records;

    return (
      <CastAnswer
        meta={meta}
        records={filteredRecords}
        question={question}
        recordClass={recordClass}
        displayInfo={displayInfo}
        allAttributes={allAttributes}
        visibleAttributes={visibleAttributes}
        filterTerm={filterTerm}
        filterAttributes={filterAttributes}
        filterTables={filterTables}
        format="table"
        onSort={changeSorting}
        onMoveColumn={changeColumnPosition}
        onChangeColumns={changeVisibleColumns}
        onFilter={this.changeFilter}
        renderCellContent={this.props.renderCellContent}
        deriveRowClassName={this.props.deriveRowClassName}
        customSortBys={this.props.customSortBys}
        additionalActions={this.props.additionalActions}
      />
    );
  }

  renderView() {
    return (
      <div>
        {this.renderLoading()}
        {this.renderAnswer()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => state.answerView;

const mapDispatchToProps = ActionCreators;

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => ({
  stateProps,
  dispatchProps,
  ownProps,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(AnswerController));
