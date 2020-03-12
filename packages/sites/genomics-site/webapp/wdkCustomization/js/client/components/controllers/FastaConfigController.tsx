import React from 'react';

import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { Srt } from '../Srt';

export default function FastaConfigController() {
  useSetDocumentTitle('Retrieve Sequences');

  return <Srt />;
}
