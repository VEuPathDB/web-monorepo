import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './ProjectLink.scss';

const cx = makeClassNameHelper('ebrc-ProjectLink');

type ProjectLinkProps = {
  projectId: string
};

export const ProjectLink = ({ projectId }: ProjectLinkProps) =>
  <div title={`${projectId}.org`} className={cx()}>
    <a target="_blank" href={`https://${projectId.toLowerCase()}.org`} className={projectId}>
      https://{projectId.toLowerCase()}.org
    </a>
  </div>;
