import { useContext, Context } from 'react';

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
