import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import React, { Suspense } from 'react';

interface Props {
  documentName: string;
}

export function Documentation(props: Props) {
  const Component = React.lazy(() =>
    import(
      /* webpackInclude: /\.(js|jsx|ts|tsx)$/ */
      /* webpackExclude: /\.d\.ts$/ */
      './' + props.documentName
    ).catch((error) => {
      console.error(error);
      return import('@veupathdb/wdk-client/lib/Components/PageStatus/Error');
    })
  );
  return (
    <ErrorBoundary>
      <Suspense fallback="Loading...">
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}
