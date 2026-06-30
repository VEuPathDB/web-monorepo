import React from 'react';

import { PlasmoFast } from '../PlasmoFast';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export function PlasmoFastController() {
  useSetDocumentTitle('plasmoFAST');

  return <PlasmoFast />;
}
