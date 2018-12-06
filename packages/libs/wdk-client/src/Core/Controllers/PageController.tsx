import { mapValues, isEqual } from 'lodash';
import { parse } from 'querystring';
import React from 'react';

import Page from 'wdk-client/Components/Layout/Page';
import ViewController, { ViewControllerProps } from 'wdk-client/Core/Controllers/ViewController';
import { RouteComponentProps } from 'react-router';

/**
 * A ViewController that is intended to render a UI on an entire screen.
 */
export default class PageController<Props = {}, State = {}> extends ViewController<Props & RouteComponentProps<any>, State> {

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
    window.scroll(0, 0);
  }

  componentDidUpdate(prevProps: Props & ViewControllerProps & RouteComponentProps<any>): void {
    // only call loadData if router props have changed
    const prevLocation = prevProps.location || {};
    const nextLocation = this.props.location || {};
    if (
      (prevLocation.pathname !== nextLocation.pathname) ||
      (prevLocation.search !== nextLocation.search)
    ) {
      this.loadData(prevProps);
      window.scroll(0, 0);
    }
    this.setDocumentTitle();
  }

  render() {
    return (
      <Page>{super.render()}</Page>
    );
  }

}
