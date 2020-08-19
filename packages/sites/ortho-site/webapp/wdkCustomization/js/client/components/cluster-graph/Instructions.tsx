import React from 'react';

import { GraphAccordion } from 'ortho-client/components/cluster-graph/GraphAccordion';

import './Instructions.scss';

interface Props {
  groupName: string;
  maxEValueExp: number;
}

export function Instructions({ groupName, maxEValueExp }: Props) {
  return (
    <GraphAccordion containerClassName="Instructions" title="Description">
      <p>This graph shows the clustering of the proteins in ortholog group {groupName}.</p>

      <ul>
        <li>Each node is a protein. Node color represents clade (outer) and organism (inner).</li>
        <li>Each edge is a blast score between two protein sequences (above threshold 1e-{maxEValueExp}).</li>
        <li>Click on a node to view detailed information about the protein in the right panel.</li>
        <li>Mouse over an edge to view the blast score. </li>
      </ul>

      <p>In the left panel:</p>
      <ul>
        <li>Choose an edge type or use the score slider to remove edges from the graph.</li>
        <li>Change the node display from Taxa to EC number or PFam domain.</li>
        <li>In the taxon legend, mouse over a taxon to highlight the proteins from that taxon.</li>
      </ul>

      <p>In the right panel:</p>
      <ul>
        <li>Mouse over a protein to highlight that protein in the graph.</li>
        <li>Mouse over a blast score in the sequence detail to highlight the edge that represents the blast score.</li>
      </ul>
    </GraphAccordion>
  );
}
