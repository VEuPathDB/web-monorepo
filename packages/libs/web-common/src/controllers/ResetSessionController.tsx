import React from 'react';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { ResetSession } from 'ebrc-client/components/ResetSession';

export function ResetSessionController() {
  useSetDocumentTitle('Reset Session');

  return <ResetSession />;
}
