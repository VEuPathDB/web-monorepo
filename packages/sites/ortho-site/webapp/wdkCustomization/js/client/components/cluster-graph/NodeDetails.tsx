import React, { useMemo } from 'react';

import {
  GraphInformationTabProps,
  SequenceInformation,
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
    <div className="NodeDetails">
      {
        nodeDetails == null
          ? <h2 className="NoNodeSelected">Click a node to see details</h2>
          : <React.Fragment>
              <div className="NodeDetailsHeader">
                {selectedNode}
              </div>
              <GraphAccordion title="Sequence Information">
                <SequenceInformationTable {...nodeDetails.sequenceInformation} />
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
      }
    </div>
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

function SequenceInformationTable(props: SequenceInformation) {
  return (
    <table className="SequenceInformation">
      <tbody>
        <tr>
          <th>Source ID:</th>
          <td>{props.sourceId}</td>
          <th>Length:</th>
          <td>{props.length}</td>
        </tr>
        <tr>
          <th>Organism:</th>
          <td>{props.organism}</td>
          <th>Taxon:</th>
          <td>{props.taxon}</td>
        </tr>
        <tr>
          <th>Description:</th>
          <td colSpan={3}>{props.description}</td>
        </tr>
      </tbody>
    </table>
  );
}
