import * as React from 'react';
import AbstractPageController from '../../Core/Controllers/AbstractPageController';
import { wrappable } from '../../Utils/ComponentUtils';
import {isEqual} from 'lodash';
import {
  loadAnswer,
  updateFilter,
  moveColumn,
  changeAttributes,
  sort,
  Sorting
} from './AnswerViewActionCreators';
import Answer from './Answer';
import Loading from '../../Components/Loading/Loading';
import { State, default as AnswerViewStore } from "./AnswerViewStore";
import NotFound from '../NotFound/NotFound';

const ActionCreators = {
  loadAnswer,
  updateFilter,
  moveColumn,
  changeAttributes,
  sort
};

// FIXME Remove this when Answer is converted to Typescript
const CastAnswer: any = Answer;

class AnswerController extends AbstractPageController<State, AnswerViewStore, typeof ActionCreators> {

  getStateFromStore() {
    return this.store.getState();
  }

  getStoreClass() {
    return AnswerViewStore;
  }

  getActionCreators() {
    return ActionCreators
  }

  loadData() {
    // incoming values from the router
    let { question, recordClass: recordClassName } = this.props.match.params;
    let [ , questionName, customName ] = question.match(/([^:]+):?(.*)/);
    let parameters = this.getQueryParams();

    // decide whether new answer needs to be loaded (may not need to be loaded
    //   if user goes someplace else and hits 'back' to here- store already correct)
    if (
      this.state.question == null ||
      this.state.question.urlSegment !== questionName ||
      !isEqual(this.state.parameters, parameters)
    ) {

      // (re)initialize the page
      let pagination = { numRecords: 1000, offset: 0 };
      let sorting = [{ attributeName: 'primary_key', direction: 'ASC' } as Sorting];
      let displayInfo = { pagination, sorting, customName };
      let opts = { displayInfo, parameters };
      this.eventHandlers.loadAnswer(questionName, recordClassName, opts);
    }
  }

  isRenderDataLoaded() {
    return this.state.records != null;
  }

  isRenderDataLoadError() {
    return (
      this.state.error != null &&
      ( 'status' in this.state.error
        ? this.state.error.status !== 404
        : true )
    )
  }

  isRenderDataNotFound() {
    return (
      this.state.error != null &&
      'status' in this.state.error &&
      this.state.error.status === 404
    )
  }

  getTitle() {
    return this.state.error ? 'Error loading results'
         : this.state.records ? this.state.displayInfo.customName || this.state.question.displayName
         : 'Loading...';
  }

  renderLoading() {
    return this.state.isLoading && <Loading/>;
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
      recordClass
    } = this.state;

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
        onSort={this.eventHandlers.sort}
        onMoveColumn={this.eventHandlers.moveColumn}
        onChangeColumns={this.eventHandlers.changeAttributes}
        onFilter={this.eventHandlers.updateFilter}
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

export default wrappable(AnswerController);
