import React from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';

export function PageLoading() {
  return (
    <Loading>
      <div className="wdk-LoadingData">Loading data...</div>
    </Loading>
  );
};
