import React from 'react';

import { PlasmoAp } from '../PlasmoAp';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';


export function PlasmoApController() {
  useSetDocumentTitle('PlasmoAP');

  return <PlasmoAp />;
}
