import { makeUseRefinedContext } from 'wdk-client/Hooks/RefinedContext';

const isNonNullable = <T>(t: T): t is NonNullable<T> => t != null;

/**
 * Ensures the value of React Context has been initialized and is not null.
 * This is useful to prevent a consumer from accessing context before it is
 * initialized with a value. 
 */
export const useNonNullableContext = makeUseRefinedContext(
  isNonNullable,
  context => (
    'Context has not been initialized: ' +
    (context.displayName ?? 'unknown') +
    ' context.'
  )
);
