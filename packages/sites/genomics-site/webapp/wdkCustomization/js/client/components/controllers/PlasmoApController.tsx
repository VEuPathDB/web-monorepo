import React from 'react';

import { PlasmoAp } from '../PlasmoAp';

import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';


export function PlasmoApController() {
  useSetDocumentTitle('PlasmoAP');

  return <PlasmoAp />;
}
