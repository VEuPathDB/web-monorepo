import { Loading } from '@veupathdb/wdk-client/lib/Components';
import React, { ReactNode } from 'react';
import { PromiseHookState } from '../hooks/promise';

interface Props<T> {
  state: PromiseHookState<T>;
  children: (t: T) => ReactNode;
}
export function PromiseResult<T>(props: Props<T>) {
  const { state, children } = props;
  return (
    <>
      {state.pending && <Loading />}
      {state.error && <div>Error: {String(state.error)}</div>}
      {state.value !== undefined && children(state.value)}
    </>
  );
}
