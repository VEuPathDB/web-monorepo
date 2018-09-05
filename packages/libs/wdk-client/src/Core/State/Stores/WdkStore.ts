import { ReduceStore } from 'flux/utils';
import { Observable, EMPTY } from 'rxjs';

import WdkDispatcher from '../Dispatcher';
import GlobalDataStore, { GlobalData } from './GlobalDataStore';
import { Action, ActionCreatorServices, ActionObserver, ObserveServices } from '../../../Utils/ActionCreatorUtils';
import { LocatePlugin } from '../../CommonTypes';
import { catchError, map, filter } from 'rxjs/operators';

export interface BaseState {
  globalData: GlobalData;
}

export default class WdkStore<State extends BaseState = BaseState> extends ReduceStore<State, Action> {

  /** The name of the channel on which this store listens to actions. */
  channel: string;

  /** The store that provides global state */
  globalDataStore: GlobalDataStore;

  locatePlugin: LocatePlugin;

  // Makes it possible to access the type of the Store's state via typescript.
  // E.g., Store['state'].
  get state() {
    return this.getState();
  }

  /*--------------- Methods that should probably be overridden ---------------*/

  getInitialState(): State {
    return {
      globalData: {}
    } as State;
  }

  /**
   * Does nothing by default for other actions; subclasses will probably
   * override. This is the store's opportunity to handle channel specific
   * actions.
   */
  handleAction(state: State, action: Action): State {
    return state;
  }


  /*---------- Methods that may be overridden in special cases ----------*/

  /**
   * By default this store will receive the action if the action's channel is
   * undefined (indicating a broadcast action) or the channel matches this
   * store's channel name.  To receive actions on channels intended for other
   * stores, override this method.
   */
  storeShouldReceiveAction(channel?: string): boolean {
    return (channel === undefined /* broadcast */ || channel === this.channel);
  }

  /**
   * Observe actions handled by this store.
   */
  observeActions(actions$: Observable<Action>, services: ObserveServices<this>): Observable<Action> {
    return EMPTY;
  }

  /*------------- Methods that should probably not be overridden -------------*/

  constructor(dispatcher: WdkDispatcher<Action>, channel: string, globalDataStore: GlobalDataStore, services: ActionCreatorServices, locatePlugin: LocatePlugin) {
    super(dispatcher);
    this.channel = channel;
    this.globalDataStore = globalDataStore;
    this.locatePlugin = locatePlugin;
    this.configureObserve(dispatcher, services);
  }

  reduce(state: State, action: Action): State {
    this.getDispatcher().waitFor([ this.globalDataStore.getDispatchToken() ]);
    if (this.globalDataStore.hasChanged()) {
      state = Object.assign({}, state, {
        globalData: this.globalDataStore.getState()
      });
      return this.handleAction(state, action);
    }
    else if (this.storeShouldReceiveAction(action.channel)) {
      return this.handleAction(state, action);
    }
    return state;
  }

  configureObserve(dispatcher: WdkDispatcher<Action>, services: ActionCreatorServices) {
    // Wire up observers.
    const observerServices = { ...services, getState: this.getState.bind(this) };

    const action$ = dispatcher.asObservable().pipe(filter(action =>
      this.storeShouldReceiveAction(action.channel)));

    const logError = (error: Error) => {
      console.error(error);
      services.wdkService.submitError(error);
    };

    const startObserve = (): Observable<Action> =>
      this.observeActions(action$, observerServices).pipe(
        // Assign channel unless action isBroadcast
        map(action => ({ ...action, channel: action.isBroadcast ? undefined : this.channel })),
        catchError((error: Error, caught) => {
          logError(error);
          // restart observe
          return startObserve();
        })
      )

    startObserve().subscribe(
      action => {
        dispatcher.dispatch(action)
      },
      error => {
        logError(error);
      },
      () => {
        console.debug('`observeActions` has completed in store "%s"', this.channel);
      }
    );
  }

}
