import React from 'react';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { Srt } from '../Srt';

export default function FastaConfigController() {
  useSetDocumentTitle('Retrieve Sequences');

  return <Srt />;
}
