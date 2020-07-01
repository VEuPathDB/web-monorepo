import React, { useMemo } from 'react';

import {
  GraphInformationTabProps,
  layoutAndAccessionToBlastScoreRows,
  layoutAndAccessionToEcNumberRows,
  layoutAndAccessionToSequenceInformation,
  layoutAndAccessionToPfamDomainRows
} from '../../utils/graphInformation';
import { GroupLayout } from '../../utils/groupLayout';

export function NodeDetails({ layout, selectedNode }: GraphInformationTabProps) {
  const nodeDetails = useNodeDetails(layout, selectedNode);

  return (
    <React.Fragment>
      <pre>
        {JSON.stringify(nodeDetails?.sequenceInformation, null, 2)}
      </pre>
      <pre>
        {JSON.stringify(nodeDetails?.blastScoreRows, null, 2)}
      </pre>
      <pre>
        {JSON.stringify(nodeDetails?.pfamDomainRows, null, 2)}
      </pre>
      <pre>
        {JSON.stringify(nodeDetails?.ecNumberRows, null, 2)}
      </pre>
    </React.Fragment>
  );
}

function useNodeDetails(layout: GroupLayout, accession: string | undefined) {
  return useMemo(
    () => accession == null
      ? undefined
      : ({
          sequenceInformation: layoutAndAccessionToSequenceInformation(layout, accession),
          blastScoreRows: layoutAndAccessionToBlastScoreRows(layout, accession),
          pfamDomainRows: layoutAndAccessionToPfamDomainRows(layout, accession),
          ecNumberRows: layoutAndAccessionToEcNumberRows(layout, accession),
        }),
    [ layout, accession ]
  );
}
