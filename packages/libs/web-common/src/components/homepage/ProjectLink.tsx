import React from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/coreui';

import './ProjectLink.scss';

const cx = makeClassNameHelper('ebrc-ProjectLink');

type ProjectLinkProps = {
  projectId: string;
};

export const ProjectLink = ({ projectId }: ProjectLinkProps) => (
  <Tooltip title={`${projectId}.org`}>
    <div className={cx()}>
      <a
        target="_blank"
        href={`https://${projectId.toLowerCase()}.org`}
        className={projectId}
      >
        https://{projectId.toLowerCase()}.org
      </a>
    </div>
  </Tooltip>
);
