// TODO When in "embed mode", disable coallpsing, hiding, and TOC
import { isEqual } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import * as UserActionCreators from '../Actions/UserActions';
import * as UserSessionActions from '../Actions/UserSessionActions';
import PageController from '../Core/Controllers/PageController';
import { wrappable } from '../Utils/ComponentUtils';
import RecordUI from '../Views/Records/RecordUI';
import {
  loadRecordData,
  RecordRequestOptions,
  updateAllFieldVisibility,
  updateNavigationCategoryExpansion,
  updateNavigationQuery,
  updateNavigationVisibility,
  updateSectionVisibility,
  requestPartialRecord,
} from '../Actions/RecordActions';

import {
  CategoryTreeNode,
  getNodeId,
  getRecordClassName,
  getScopes,
} from '../Utils/CategoryUtils';
import { stripHTML } from '../Utils/DomUtils';
import { RecordClass } from '../Utils/WdkModel';
import {
  PartialRecordRequest,
  getAttributeNames,
  getTableNames,
} from '../Views/Records/RecordUtils';
import { RootState } from '../Core/State/Types';
import { preorderSeq } from '../Utils/TreeUtils';
import { RecordNotFoundPage } from '../Views/Records/RecordNotFoundPage';

const ActionCreators = {
  ...UserActionCreators,
  ...UserSessionActions,
  loadRecordData,
  updateSectionVisibility,
  updateNavigationQuery,
  updateAllFieldVisibility,
  updateNavigationCategoryExpansion,
  updateNavigationVisibility,
  requestPartialRecord,
};

type StateProps = RootState['record'];
type DispatchProps = typeof ActionCreators;
type OwnProps = {
  recordClass: string;
  primaryKey: string;
  attributes?: string[];
  tables?: string[];
  compressedUI?: boolean;
};
type Props = { ownProps: OwnProps } & StateProps & DispatchProps;

// FIXME Remove when RecordUI is converted to Typescript
const CastRecordUI: any = RecordUI;

/** View Controller for record page */
class RecordController extends PageController<Props> {
  requestPartialRecord = ({ attributes, tables }: PartialRecordRequest) => {
    // Important! Use info from ownProps to prevent cache misses when record is is aliased
    this.props.requestPartialRecord(
      this.props.requestId,
      this.props.ownProps.recordClass,
      this.props.ownProps.primaryKey.split('/'),
      attributes,
      tables
    );
  };

  /**
   * Declare what fields of the record are needed. All requests are made in
   * parallel, but the first requests is required to render the page.
   *
   * By default, two elements are returned. The first includes all attributes,
   * and the second includes all tables. In some cases, more granular control
   * might be required, which this function hook provides.
   */
  getRecordRequestOptions(
    recordClass: RecordClass,
    categoryTree: CategoryTreeNode
  ): RecordRequestOptions[] {
    return [
      // all attributes
      {
        attributes: getAttributeNames(categoryTree),
        tables: getTableNames(categoryTree),
      },
    ];
  }

  pruneCategoryTree(
    recordClass: RecordClass,
    categoryTree: CategoryTreeNode
  ): CategoryTreeNode {
    const { attributes, tables } = this.props.ownProps;
    if (attributes || tables) {
      const nodes = preorderSeq(categoryTree)
        .filter((node) => {
          const recordClassName = getRecordClassName(node);
          const id = getNodeId(node);
          const scopes = getScopes(node);
          if (recordClassName !== recordClass.fullName) return false;
          return (
            attributes?.includes(id) ||
            tables?.includes(id) ||
            scopes.includes('record-internal') // do we need to handle 'record-collapsed'?
          );
        })
        .toArray();
      const root: CategoryTreeNode = {
        properties: {},
        children: nodes,
      };
      return root;
    }
    return categoryTree;
  }

  isRenderDataLoaded() {
    return (
      this.props.recordClass != null &&
      this.props.record != null &&
      !this.props.isLoading &&
      this.props.ownProps.recordClass === this.props.recordClass.urlSegment
    );
  }

  isRenderDataLoadError() {
    return (
      this.props.error != null &&
      this.props.error.status !== 404 &&
      this.props.record == null
    );
  }

  isRenderDataNotFound() {
    return this.props.error != null && this.props.error.status === 404;
  }

  renderDataNotFound() {
    const sourceID = this.props.ownProps.primaryKey.split('/')[0];
    return <RecordNotFoundPage sourceID={sourceID} />;
  }

  getTitle() {
    return (
      this.props.recordClass.displayName +
      ' ' +
      stripHTML(this.props.record.displayName)
    );
  }

  getErrorMessage(status: number) {
    return (
      'The requested record ' +
      (status === 404 ? 'does not exist.' : 'could not be loaded.')
    );
  }

  loadData(previousProps?: this['props']) {
    const { ownProps } = this.props;
    const { ownProps: prevOwnProps = undefined } = previousProps || {};
    // load data if params have changed
    if (previousProps == null || !isEqual(prevOwnProps, ownProps)) {
      let { recordClass, primaryKey } = ownProps;
      let pkValues = primaryKey.split('/');
      this.props.loadRecordData(
        recordClass,
        pkValues,
        this.getRecordRequestOptions.bind(this),
        this.pruneCategoryTree.bind(this)
      );
    }
  }

  renderStateError() {
    if (this.props.error == null) return;

    return (
      <div
        style={{
          padding: '1.5em',
          fontSize: '2em',
          color: 'darkred',
          textAlign: 'center',
        }}
      >
        {this.getErrorMessage(this.props.error.status)}
      </div>
    );
  }

  renderRecord() {
    if (this.props.record == null) return null;

    let {
      record,
      recordClass,
      inBasket,
      favoriteId,
      loadingBasketStatus,
      loadingFavoritesStatus,
    } = this.props;
    let loadingClassName = 'fa fa-circle-o-notch fa-spin';
    let headerActions = [];
    if (recordClass.useBasket) {
      headerActions.push({
        label: inBasket ? 'Remove from basket' : 'Add to basket',
        className: ' basket ',
        iconClassName: loadingBasketStatus
          ? loadingClassName
          : 'fa fa-shopping-basket',
        onClick: (event: Event) => {
          event.preventDefault();
          this.props.updateBasketStatus(
            record,
            recordClass.urlSegment,
            !inBasket
          );
        },
      });
    }
    headerActions.push({
      label: favoriteId ? 'Remove from favorites' : 'Add to favorites',
      className: ' favorites ',
      iconClassName: loadingFavoritesStatus
        ? loadingClassName
        : 'fa fa-lg fa-star',
      onClick: (event: Event) => {
        event.preventDefault();
        if (favoriteId) {
          this.props.removeFavorite(record, favoriteId);
        } else {
          this.props.addFavorite(record, recordClass.urlSegment);
        }
      },
    });

    if (
      recordClass.formats.some((format) => format.scopes.includes('record'))
    ) {
      headerActions.push({
        label: 'Download ' + recordClass.displayName,
        iconClassName: 'fa fa-lg fa-download',
        href:
          '/record/' +
          recordClass.urlSegment +
          '/download/' +
          record.id.map((pk) => pk.value).join('/'),
      });
    }

    return (
      <CastRecordUI
        {...this.props}
        requestPartialRecord={this.requestPartialRecord}
        headerActions={headerActions}
      />
    );
  }

  renderView() {
    return (
      <div>
        {this.renderStateError()}
        {this.renderRecord()}
      </div>
    );
  }
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state) => state.record,
  ActionCreators,
  (stateProps, dispatchProps, ownProps) => ({
    ownProps,
    ...dispatchProps,
    ...stateProps,
  })
);

export default enhance(wrappable(RecordController));
