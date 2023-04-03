import * as React from 'react';

import Loading from '../../Components/Loading/Loading';
import Error from '../../Components/PageStatus/Error';
import LoadError from '../../Components/PageStatus/LoadError';
import PermissionDenied from '../../Components/PageStatus/PermissionDenied';
import NotFound from '../../Views/NotFound/NotFound';

import ErrorBoundary from '../../Core/Controllers/ErrorBoundary';

/**
 * Base class for all ViewContoller classes in WDK. This base class is
 * responsible for:
 * - providing render hooks based on state predicates
 */
export default class ViewController<
  Props = {},
  State = {}
> extends React.PureComponent<Props, State> {
  /*--------------- Methods to override to display content ---------------*/

  /**
   * Renders the highest page component below the Page tag.
   */
  renderView(): JSX.Element | null {
    return <span>Page for View Controller: {this.constructor.name}</span>;
  }

  /**
   * Renders data load error message
   */
  renderDataLoadError() {
    return <LoadError />;
  }

  /**
   * Renders data not found message
   */
  renderDataNotFound() {
    return <NotFound />;
  }

  /**
   * Renders data permission denied
   */
  renderDataPermissionDenied() {
    return <PermissionDenied />;
  }

  /**
   * Renders data loading message
   */
  renderDataLoading() {
    return (
      <Loading>
        <div className="wdk-LoadingData">Loading data...</div>
      </Loading>
    );
  }

  renderError() {
    return <Error />;
  }

  /*-------- Methods to override to call ACs and load initial data --------*/

  /**
   * This is a good place to perform side-effects, such as calling an action
   * creator to load data for a store.
   *
   * Called when the component is first mounted with the state of the store
   * and the initial props. Also called when new props are received, with the
   * state of the store, the new props, and the old props. On the first call
   * when the component is first mounted, the old props will be undefined.
   */
  loadData(prevProps?: Props): void {
    return undefined;
  }

  /*------------ Methods to override to use placeholder pages ------------*/

  /**
   * Returns whether an initial data load error has occurred which would prevent
   * the page from rendering.
   * @param {Object} state The current state.
   */
  isRenderDataLoadError(): boolean {
    return false;
  }

  /**
   * Returns whether enough data has been loaded into the store to render the
   * page.
   */
  isRenderDataLoaded(): boolean {
    return true;
  }

  /**
   * Returns whether required data resources are not found.
   */
  isRenderDataNotFound(): boolean {
    return false;
  }

  /**
   * Returns whether access to required data resources are forbidden for current user.
   */
  isRenderDataPermissionDenied(): boolean {
    return false;
  }

  /*------------- Methods that should probably not be overridden -------------*/

  componentDidMount(): void {
    this.loadData();
  }

  componentDidUpdate(prevProps: Props): void {
    this.loadData(prevProps);
  }

  /**
   * Renders the page of this controller.  Subclasses may override, but may
   * save effort by overriding renderView() instead.  This method will call that
   * one but only after checking if data required for render has been not yet
   * fully loaded or has erred during loading.
   */
  render() {
    if (this.isRenderDataLoadError()) {
      return this.renderDataLoadError();
    } else if (this.isRenderDataNotFound()) {
      return this.renderDataNotFound();
    } else if (this.isRenderDataPermissionDenied()) {
      return this.renderDataPermissionDenied();
    } else if (!this.isRenderDataLoaded()) {
      return this.renderDataLoading();
    } else {
      return <ErrorBoundary>{this.renderView()}</ErrorBoundary>;
    }
  }
}
