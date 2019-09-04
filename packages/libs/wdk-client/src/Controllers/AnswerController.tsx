import * as React from 'react';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import {isEqual} from 'lodash';
import {
  loadAnswer,
  changeFilter,
  changeColumnPosition,
  changeVisibleColumns,
  changeSorting,
  Sorting
} from 'wdk-client/Actions/AnswerActions';
import Answer from 'wdk-client/Views/Answer/Answer';
import Loading from 'wdk-client/Components/Loading/Loading';
import { State } from 'wdk-client/StoreModules/AnswerViewStoreModule';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { AttributeField, TableField } from 'wdk-client/Utils/WdkModel';

const ActionCreators = {
  loadAnswer,
  changeFilter,
  changeColumnPosition,
  changeVisibleColumns,
  changeSorting,
};

// FIXME Remove this when Answer is converted to Typescript
const CastAnswer: any = Answer;

type StateProps = State;
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  recordClass: string;
  question: string;
  parameters: Record<string, string>;
}

type Props = {
  stateProps: StateProps,
  dispatchProps: DispatchProps
  ownProps: OwnProps;
};

class AnswerController extends PageController<Props> {

  loadData(prevProps?: Props) {

    // decide whether new answer needs to be loaded (may not need to be loaded
    //   if user goes someplace else and hits 'back' to here- store already correct)
    if (prevProps && isEqual(prevProps.ownProps, this.props.ownProps)) return;

    // incoming values from the router
    let { question, recordClass: recordClassName, parameters } = this.props.ownProps;
    let [ , searchName, customName ] = question.match(/([^:]+):?(.*)/) || ['', question, ''];

    const { dispatchProps } = this.props;

    // (re)initialize the page
    let pagination = { numRecords: 1000, offset: 0 };
    let sorting = [{ attributeName: 'primary_key', direction: 'ASC' } as Sorting];
    let displayInfo = { pagination, sorting, customName };
    let opts = { displayInfo, parameters };
    dispatchProps.loadAnswer(searchName, recordClassName, opts);
  }

  isRenderDataLoaded() {
    const {
      stateProps: { records }
    } = this.props;

    return records != null;
  }

  isRenderDataLoadError() {
    const {
      stateProps: { error }
    } = this.props;

    return (
      error != null &&
      ( 'status' in error
        ? error.status !== 404
        : true )
    )
  }

  isRenderDataNotFound() {
    const {
      stateProps: { error }
    } = this.props;

    return (
      error != null &&
      'status' in error &&
      error.status === 404
    )
  }

  getTitle() {
    const {
      stateProps: { 
        displayInfo = { customName: '' }, 
        error, 
        question = { displayName: '' }, 
        records 
      }
    } = this.props;

    return error ? 'Error loading results'
         : records ? displayInfo.customName || question.displayName
         : 'Loading...';
  }

  renderLoading() {
    const {
      isLoading
    } = this.props.stateProps;

    return isLoading && <Loading/>;
  }

  renderDataNotFound() {
    return (
      <NotFound>
        <p>The search you requested does not exist.</p>
      </NotFound>
    )
  }

  renderAnswer() {
    let {
      meta,
      records,
      displayInfo,
      allAttributes,
      visibleAttributes,
      filterTerm,
      filterAttributes = [],
      filterTables = [],
      question,
      recordClass = { 
        attributes: [] as AttributeField[],
        tables: [] as TableField[]
      }
    } = this.props.stateProps;

    const {
      changeSorting,
      changeColumnPosition,
      changeVisibleColumns,
      changeFilter
    } = this.props.dispatchProps;

    if (filterAttributes.length === 0 && filterTables.length === 0) {
      filterAttributes = recordClass.attributes.map(a => a.name);
      filterTables = recordClass.tables.map(t => t.name);
    }
    return (
      <CastAnswer
        meta={meta}
        records={records}
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
        onFilter={changeFilter}
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

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
  stateProps,
  dispatchProps,
  ownProps
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(AnswerController));
