import React from 'react';

import {
  defaultActions,
  StepAction,
} from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetailsDialog';

const orthologIndex = defaultActions.findIndex(
  (action) => action.key === 'insertBefore'
);

export const apiActions: StepAction[] = [
  ...defaultActions.filter((_, i) => i <= orthologIndex),
  {
    key: 'orthologs',
    display: () => <React.Fragment>Orthologs</React.Fragment>,
    onClick: ({ insertStepAfter }) =>
      insertStepAfter('convert', ['GenesByOrthologs']),
    isHidden: (props) => props.stepTree.recordClass.urlSegment !== 'transcript',
    tooltip: () =>
      'Add an ortholog transform to this step: obtain the ortholog genes to the genes in this result',
  },
  ...defaultActions.filter((_, i) => i > orthologIndex),
];
