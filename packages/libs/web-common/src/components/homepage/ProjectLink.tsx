import React from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/coreui';

import './ProjectLink.scss';
import { ProjectConstants } from '@veupathdb/wdk-client/lib/Utils/ProjectConstants';

const cx = makeClassNameHelper('ebrc-ProjectLink');

type ProjectLinkProps = {
  project: ProjectConstants;
};

export const ProjectLink = ({
  project: { projectId, displayName, siteUrl },
}: ProjectLinkProps) => (
  <Tooltip title={`${displayName}.org`}>
    <div className={cx()}>
      <a target="_blank" href={siteUrl} className={projectId}>
        {siteUrl}
      </a>
    </div>
  </Tooltip>
);
