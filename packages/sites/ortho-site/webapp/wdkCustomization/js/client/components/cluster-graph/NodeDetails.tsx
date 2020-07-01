import React, { useMemo } from 'react';

import {
  GraphInformationTabProps,
  layoutAndAccessionToBlastScoreRows,
  layoutAndAccessionToEcNumberRows,
  layoutAndAccessionToSequenceInformation,
  layoutAndAccessionToPfamDomainRows
} from '../../utils/graphInformation';
import { GroupLayout } from '../../utils/groupLayout';

import { GraphAccordion } from './GraphAccordion';

export function NodeDetails({ layout, selectedNode }: GraphInformationTabProps) {
  const nodeDetails = useNodeDetails(layout, selectedNode);

  return (
    <React.Fragment>
      <GraphAccordion title="Sequence Information">
        <pre>
          {JSON.stringify(nodeDetails?.sequenceInformation, null, 2)}
        </pre>
      </GraphAccordion>
      <GraphAccordion title="BLAST Scores">
        <pre>
          {JSON.stringify(nodeDetails?.blastScoreRows, null, 2)}
        </pre>
      </GraphAccordion>
      <GraphAccordion title="PFam Domains">
      <pre>
        {JSON.stringify(nodeDetails?.pfamDomainRows, null, 2)}
      </pre>
      </GraphAccordion>
      <GraphAccordion title="EC Numbers">
      <pre>
        {JSON.stringify(nodeDetails?.ecNumberRows, null, 2)}
      </pre>
      </GraphAccordion>
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
