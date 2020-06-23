import React from 'react';

import { GroupLayout } from '../../utils/groupLayout';

import { ClusterGraphCanvas } from './ClusterGraphCanvas';
import { GraphControls } from './GraphControls';
import { GraphInformation } from './GraphInformation';
import { Instructions } from './Instructions';

interface Props {
  layout: GroupLayout;
}

export function ClusterGraphDisplay(props: Props) {
  return (
    <div>
      <Instructions />
      <GraphControls />
      <ClusterGraphCanvas />
      <GraphInformation />
    </div>
  );
}
