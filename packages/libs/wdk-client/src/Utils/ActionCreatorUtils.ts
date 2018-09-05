import WdkStore from '../Core/State/Stores/WdkStore';
import { merge, Observable } from 'rxjs';
import { PageTransitioner } from './PageTransitioner';
import WdkService from './WdkService';


export interface Action {
  type: string | symbol;
  payload?: string | number | object;
  channel?: string;
  isBroadcast?: boolean;
};

export interface ActionCreatorServices {
  wdkService: WdkService;
  transitioner: PageTransitioner;
}

export type ActionCreatorResult<T extends Action> = T
                                           | ActionThunk<T>
                                           | ActionCreatorResultArray<T>
                                           | ActionCreatorResultPromise<T>;

interface ActionCreatorResultArray<T extends Action> extends Array<ActionCreatorResult<T>> {}

interface ActionCreatorResultPromise<T extends Action> extends Promise<ActionCreatorResult<T>> {}

export interface ActionThunk<T extends Action> {
  (services: ActionCreatorServices): ActionCreatorResult<T>;
}

export const emptyType = Symbol('empty');

export type EmptyAction = {
  type: typeof emptyType
}

export const emptyAction: EmptyAction = {
  type: emptyType
}

/**
 * The ActionCreator type describes the type of function that
 * DispatchAction accepts.
 */
export interface ActionCreator<T extends Action> {
  (...args: any[]): ActionCreatorResult<T>;
}

export type ActionCreatorRecord<T extends Action> = Record<string, ActionCreator<T>>

type Type = string | symbol;
type Payload = Action['payload']

/**
 * An Action that carries the type of its `type` and `payload` properties
 */
export interface TypedAction<T extends Type, S extends Payload> {
  type: T;
  payload: S;
}

export interface TypedActionCreator<T extends Type, S extends Payload> {

  /** String used to identify action type. */
  type: T;

  /** Predicate function for testing if an action is of this type. */
  test(action: Action): action is TypedAction<T, S>;

  /** Create an action with a specified payload. */
  create(payload: S): TypedAction<T, S>;
}

export interface EmptyTypedActionCreator<T extends Type> {

  /** String used to identify action type. */
  type: T;

  /** Predicate function for testing if an action is of this type. */
  test(action: Action): action is TypedAction<T, undefined>;

  /** Create an action with a specified payload. */
  create(): TypedAction<T, undefined>;
}

// TODO Remove type argument `T`. We can probably infer this now.
/**
 * Returns a module that can be used to create Actions. This provides many useful
 * properties to reduce boilerplate while retaining maximum type safety.
 */
export function makeActionCreator<T extends Type>(type: T): EmptyTypedActionCreator<T>
export function makeActionCreator<S extends Payload, T extends Type>(type: T): TypedActionCreator<T, S>
export function makeActionCreator(type: Type) {
  return { type, create, test };

  function create(payload?: any) {
    return payload ? { type, payload } : { type }
  }

  function test(action: Action) {
    return action.type === type;
  }
}

export function isOneOf<T extends Type, S extends Payload>(...actionCreators: TypedActionCreator<T, S>[]) {
  return function isType(action: Action): action is TypedAction<T, S> {
    return actionCreators.some(ac => ac.test(action));
  }
}

export type ActionType<T extends TypedActionCreator<any, any>> =
  T extends TypedActionCreator<infer S, infer U> ? TypedAction<S, U> : never;

export interface ObserveServices<T extends WdkStore = WdkStore> extends ActionCreatorServices {
  getState: T['getState'];
}

/**
 * An ActionObserver can be thought of as a listener that reacts to specific
 * Actions that get dispatched, by creating more actions. This is useful for
 * creating actions that require asynchronous work (such as loading data from a
 * server).
 *
 * The basic shape of an ActionObserver is that it is a function that consumes a
 * stream of Actions, and it returns a stream of new Actions. The Actions it
 * consumes are those that have already been handled by the store. The Actions
 * it produces are handled by the Store as they are emitted (more on that
 * later). Note that it can return an empty stream, which might happen if an
 * Action it expects is never emitted.
 *
 * For convenience, ActionObservers in WDK will also have configured services
 * passed to them.
 *
 * ActionObservers are also scoped to a store. This means that an ActionObserver
 * will only receive Actions for which WdkStore#storeShouldReceiveAction(channel)
 * returns true, and all Actions produced by the ActionObserver will contain the
 * Store's channel (unless the `broadcast()` action decorator is used).
 */
export interface ActionObserver<T extends WdkStore = WdkStore>{
  (action$: Observable<Action>, services: ObserveServices<T>): Observable<Action>;
}

/**
 * Creates an ActionObserver that emits the Actions of all input ActionObservers.
 * Actions are emitted in the order that the input ActionObservers emit actions
 * (e.g., they are interleaved).
 */
export function combineObserve<T extends WdkStore>(...observer: ActionObserver<T>[]): ActionObserver<T> {
  return <ActionObserver<T>>((action$, services) =>
    merge(...observer.map(observe => observe(action$, services))))
}
