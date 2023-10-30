import * as React from 'react';
import {
  IconAlt as Icon,
  Link,
  Tooltip,
} from '@veupathdb/wdk-client/lib/Components';

import { DataNoun, UserDataset } from '../Utils/types';

interface Props {
  baseUrl: string;
  userDataset: UserDataset;
  projectId: string;
  displayName: string;
  linkToDataset: boolean;
  useTooltip: boolean;
  dataNoun: DataNoun;
}

export default function UserDatasetStatus(props: Props) {
  const { baseUrl, userDataset, projectId, displayName, dataNoun } = props;
  const { projects, status } = userDataset;
  const lowercaseSingularDataNoun = dataNoun.singular.toLowerCase();
  const projectSpecificInstallStatus = status?.install?.find(
    (d) => d.projectId === projectId
  );
  const isInstallable = projects.includes(projectId);
  const isInstalled =
    status?.import === 'complete' &&
    projectSpecificInstallStatus?.dataStatus === 'complete';
  const isQueued =
    status?.import === 'queued' ||
    (status?.import === 'complete' &&
      !projectSpecificInstallStatus?.dataStatus);
  const hasFailed =
    status?.import === 'failed' ||
    status?.import === 'invalid' ||
    ['failed-installation', 'failed-validation', 'missing-dependency'].includes(
      projectSpecificInstallStatus?.dataStatus ?? ''
    );
  const phase = status?.import !== 'complete' ? '1' : '2';
  const link = `${baseUrl}/${userDataset.id}`;
  const content = !isInstallable ? (
    <span>
      This {lowercaseSingularDataNoun} is not compatible with {displayName}.
    </span>
  ) : isInstalled ? (
    <span>
      This {lowercaseSingularDataNoun} is installed and ready for use in{' '}
      {displayName}.
    </span>
  ) : isQueued ? (
    <span>Queued (for phase {phase}). Please check again soon.</span>
  ) : hasFailed ? (
    <span>
      Failed (phase {phase}): {projectSpecificInstallStatus?.dataMessage}
    </span>
  ) : (
    <span>
      <span>In progress (phase {phase}). Please check again soon.</span>
    </span>
  );
  const faIcon = !isInstallable
    ? 'minus-circle'
    : isInstalled
    ? 'check-circle'
    : isQueued
    ? 'clock-o'
    : hasFailed
    ? 'minus-circle'
    : 'clock-o';
  const children = <Icon className="StatusIcon" fa={faIcon} />;
  const visibleContent = props.useTooltip ? (
    <Tooltip content={content}>{children}</Tooltip>
  ) : (
    <React.Fragment>
      {children} {content}
    </React.Fragment>
  );
  return props.linkToDataset ? (
    <Link to={link}>{visibleContent}</Link>
  ) : (
    visibleContent
  );
}
