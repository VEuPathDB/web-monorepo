import { useContext, Context } from 'react';

/**
 * Ensures the value of React Context has been initialize and is not null.
 * This is useful to prevent a consumer from accessing context before it is
 * initialized with a value. 
 */
export function useNonNullableContext<T>(context: Context<T>): NonNullable<T> {
  const v = useContext(context);
  if (v == null)
    throw new Error(
      'Context has not be initialized: ' +
        (context.displayName ?? 'unknown') +
        ' context.'
    );
  return v as NonNullable<T>;
}
