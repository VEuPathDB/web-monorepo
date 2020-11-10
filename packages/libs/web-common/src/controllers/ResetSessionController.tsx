import React from 'react';

import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { ResetSession } from 'ebrc-client/components/ResetSession';

export function ResetSessionController() {
  useSetDocumentTitle('Reset Session');

  return <ResetSession />;
}
