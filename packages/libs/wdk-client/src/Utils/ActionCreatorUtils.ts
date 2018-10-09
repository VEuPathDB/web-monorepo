import { PageTransitioner } from './PageTransitioner';
import WdkService from './WdkService';


export interface Action {
  type: string | symbol;
  payload?: string | number | object | boolean;
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
    return payload !== undefined ? { type, payload } : { type }
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
