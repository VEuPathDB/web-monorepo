import PropTypes from 'prop-types';
import * as React from 'react';

import Loading from '../../Components/Loading/Loading';
import Error from '../../Components/PageStatus/Error';
import LoadError from '../../Components/PageStatus/LoadError';
import PermissionDenied from '../../Components/PageStatus/PermissionDenied';
import { DispatchAction, MakeDispatchAction, StoreConstructor, ViewControllerProps } from '../../Core/CommonTypes';
import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { Action, ActionCreator } from '../../Utils/ActionCreatorUtils';
import { wrapActions } from '../../Utils/ComponentUtils';
import NotFound from '../../Views/NotFound/NotFound';

import ErrorBoundary from './ErrorBoundary';

/**
 * Abstract base class for all ViewContoller classes in WDK. This base class is
 * responsible for:
 *  - managing store subscription
 *  - binding action creators to dispatcher
 *  - exposing store, dispatcher, and bound action creators on context
 *
 * It is also a type-safe abstraction over some constraints of WDK ViewControllers:
 *  - All ViewControllers must provide a `Store`.
 *  - The `Store` must be a subclass of `WdkStore`.
 *  - The state of the ViewController must be a transformation of the `Store`'s state.
 *
 */
export default abstract class AbstractViewController<
  State extends {} = BaseState,
  Store extends WdkStore = WdkStore,
  ActionCreators extends Record<any, ActionCreator<Action>> = {},
  Props = {}
> extends React.PureComponent<ViewControllerProps<Store> & Props, State> {

  store: Store;

  storeSubscription?: {
    remove(): void;
  }

  dispatchAction: DispatchAction;

  eventHandlers: ActionCreators;

  // TODO Remove makeDispatchAction and eventHandlers from context.
  static childContextTypes = {
    store: PropTypes.object,
    makeDispatchAction: PropTypes.func,
    dispatchAction: PropTypes.func,
    eventHandlers: PropTypes.object
  };

  childContext: {
    store: WdkStore;
    makeDispatchAction: MakeDispatchAction;
    dispatchAction: DispatchAction;
    eventHandlers: ActionCreators
  };

  /*-------------- Abstract methods to implement to receive store data --------------*/

  // These are methods are abstract, rather than concrete with a default
  // implementation, because the type system cannot ensure that the generic
  // type argument `State` is compatible with `BaseState`. Since this aims to
  // be type safe, we leave these to the implementor to define.

  /**
   * Returns this controller's `Store` class.
   */
  abstract getStoreClass(): StoreConstructor<Store>;

  /**
   * Transforms the `Store`'s state into the `ViewController`'s state.
   */
  abstract getStateFromStore(): State;


  /*--------------- Methods to override to display content ---------------*/

  /**
   * Renders the highest page component below the Page tag.
   */
  renderView(): JSX.Element | null {
    return ( <span>Page for View Controller: {this.constructor.name}</span> );
  }

  /**
   * Renders data load error message
   */
  renderDataLoadError() {
    return ( <LoadError/> );
  }

  /**
   * Renders data not found message
   */
  renderDataNotFound() {
    return ( <NotFound/> );
  }

  /**
   * Renders data permission denied
   */
  renderDataPermissionDenied() {
    return ( <PermissionDenied/> );
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
    return ( <Error/> );
  }


  /*-------- Methods to override to call ACs and load initial data --------*/

  /**
   * Returns an object containing named event action creators.  These
   * functions can refer to 'this' and will be bound to the child view
   * controller instance before being passed to renderView().
   */
  getActionCreators(): ActionCreators {
    return {} as ActionCreators;
  }

  /**
   * This is a good place to perform side-effects, such as calling an action
   * creator to load data for a store.
   *
   * Called when the component is first mounted with the state of the store
   * and the initial props. Also called when new props are received, with the
   * state of the store, the new props, and the old props. On the first call
   * when the component is first mounted, the old props will be undefined.
   */
  loadData(prevProps?: Readonly<ViewControllerProps<Store> & Props>): void {
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

  getChildContext() {
    return this.childContext;
  }

  /**
   * Registers with this controller's store if it has one and sets initial state
   */
  constructor(props: ViewControllerProps<Store> & Props) {
    super(props);
    const StoreClass = this.getStoreClass();
    this.store = this.props.stores.get(StoreClass);
    this.state = this.getStateFromStore();
    this.dispatchAction = this.props.makeDispatchAction(this.getChannelName());
    this.eventHandlers = wrapActions(this.dispatchAction, this.getActionCreators()) as ActionCreators;
    this.childContext = {
      store: this.store,
      makeDispatchAction: this.props.makeDispatchAction,
      dispatchAction: this.dispatchAction,
      eventHandlers: this.eventHandlers
    };
  }

  componentDidMount(): void {
    if (this.store != null) {
      this.storeSubscription = this.store.addListener(() => {
        this.setState(this.getStateFromStore());
      });
    }
    this.loadData();
  }

  componentDidUpdate(prevProps: Readonly<ViewControllerProps<Store> & Props>, state: State): void {
    this.loadData(prevProps);
  }


  /**
   * Removes subscription to this controller's store
   */
  componentWillUnmount(): void {
    if (this.storeSubscription != null) {
      this.storeSubscription.remove();
    }
  }

  /**
   * Returns the channel name.  If not overridden, this function returns the
   * store name.  Channels control which store's receive actions from ACs called
   * from this VC.  Typically, ACs send actions either on the channel passed
   * to them, or they send broadcast actions (which are received by all stores).
   * You probably need a pretty good reason to do something different.
   */
  getChannelName(): string {
    return this.store.channel;
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
    }
    else if (this.isRenderDataNotFound()) {
      return this.renderDataNotFound();
    }
    else if (this.isRenderDataPermissionDenied()) {
      return this.renderDataPermissionDenied();
    }
    else if (!this.isRenderDataLoaded()) {
      return this.renderDataLoading();
    }
    else {
      return (
        <ErrorBoundary>
          {this.renderView()}
        </ErrorBoundary>
      );
    }
  }
}
