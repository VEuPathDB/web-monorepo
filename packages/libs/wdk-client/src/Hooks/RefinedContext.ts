import { Context, useContext } from 'react';

/**
 * Ensures the value of React Context is of a specified subtype.
 * This is useful to prevent a consumer from accessing context which
 * has not been properly configured.
 */
export function makeUseRefinedContext<T, U extends T>(
  isRefinedValue: (v: T) => v is U,
  makeMissingContextError: (context: Context<T>) => string
) {
  return function useRefinedContext(context: Context<T>): U {
    const v = useContext(context);

    if (!isRefinedValue(v)) {
      throw new Error(makeMissingContextError(context));
    }

    return v;
  };
}
