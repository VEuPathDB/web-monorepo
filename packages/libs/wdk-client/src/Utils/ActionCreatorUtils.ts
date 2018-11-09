interface Action<Type extends string, Payload> {
  readonly type: Type;
  readonly payload: Payload;
}

interface ActionCreator<Type extends string, Args extends any[], Payload> {
  readonly type: Type;
  (...args: Args): Action<Type, Payload>;
  isOfType: (action: { type: string }) => action is Action<Type, Payload>;
}

// Utility type to infer the Action type from the ActionCreator
export type InferAction<T extends ActionCreator<string, [], any>> =
  T extends ActionCreator<infer Type, any, infer Payload>
    ? Action<Type, Payload>
    : never;

// This is the main utility function
export function makeActionCreator<Type extends string>(
  type: Type
) : ActionCreator<Type, [], undefined>;
export function makeActionCreator<Type extends string, Args extends any[], Payload>(
  type: Type,
  createPayload: (...args: Args) => Payload
) : ActionCreator<Type, Args, Payload>
export function makeActionCreator<Type extends string, Args extends any[], Payload>(
  type: Type,
  createPayload?: (...args: Args) => Payload
) {

  function createAction(...args: Args) {
    return {
      type,
      payload: createPayload && createPayload(...args)
    };
  }

  function isOfType(otherAction: { type: string }): otherAction is Action<Type, Payload> {
    return otherAction.type === type;
  }

  return Object.assign(createAction, { type, isOfType });
}
