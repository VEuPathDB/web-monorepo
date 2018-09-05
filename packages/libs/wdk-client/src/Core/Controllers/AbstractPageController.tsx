import { mapValues, isEqual } from 'lodash';
import { parse } from 'querystring';
import React from 'react';

import Page from '../../Components/Layout/Page';
import { PageControllerProps } from '../../Core/CommonTypes';
import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { Action, ActionCreatorRecord } from '../../Utils/ActionCreatorUtils';
import AbstractViewController from './AbstractViewController';

/**
 * A ViewController that is intended to render a UI on an entire screen.
 */
export default abstract class AbstractPageController <
  State extends {} = BaseState,
  Store extends WdkStore = WdkStore,
  ActionCreators extends ActionCreatorRecord<Action> = {}
> extends AbstractViewController<State, Store, ActionCreators, PageControllerProps<Store>> {

  /*--------------- Methods to override to display content ---------------*/

  /**
   * Returns the title of this page
   */
  getTitle(): string {
    return "WDK";
  }

  getQueryParams() {
    return mapValues(parse(this.props.location.search.slice(1)), String);
  }

  setDocumentTitle(): void {
    if (this.isRenderDataLoadError()) {
      document.title = "Error";
    }
    else if (this.isRenderDataNotFound()) {
      document.title = "Page not found";
    }
    else if (this.isRenderDataPermissionDenied()) {
      document.title = "Permission denied";
    }
    else if (!this.isRenderDataLoaded()) {
      document.title = "Loading...";
    }
    else {
      document.title = this.getTitle();
    }
  }

  componentDidMount(): void {
    super.componentDidMount()
    this.setDocumentTitle();
  }

  componentDidUpdate(prevProps: PageControllerProps<Store>, state: State): void {
    // only call loadData if router props have changed
    if (!isEqual(prevProps.location, this.props.location)) this.loadData(prevProps);
    this.setDocumentTitle();
  }

  render() {
    return (
      <Page>{super.render()}</Page>
    );
  }

}
