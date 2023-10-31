import * as React from 'react';
import {
  IconAlt as Icon,
  Link,
  Tooltip,
} from '@veupathdb/wdk-client/lib/Components';

import {
  DataNoun,
  UserDataset,
  UserDatasetVDI,
  UserDatasetInstallDetailsByProject,
} from '../Utils/types';

interface Props {
  baseUrl: string;
  userDataset: UserDataset;
  projectId: string;
  displayName: string;
  linkToDataset: boolean;
  useTooltip: boolean;
  dataNoun: DataNoun;
}

export function getDatasetStatusInfo(
  projects: UserDatasetVDI['projectIds'],
  projectId: string,
  importStatus: UserDatasetVDI['status']['import'],
  installStatus?: UserDatasetInstallDetailsByProject
): {
  isInstallable: boolean;
  isInstalled: boolean;
  isQueued: boolean;
  hasFailed: boolean;
} {
  const isInstallable = projects.includes(projectId);
  const isInstalled =
    importStatus === 'complete' && installStatus?.dataStatus === 'complete';
  const isQueued =
    importStatus === 'queued' ||
    (importStatus === 'complete' && !installStatus?.dataStatus);
  const hasFailed =
    importStatus === 'failed' ||
    importStatus === 'invalid' ||
    ['failed-installation', 'failed-validation', 'missing-dependency'].includes(
      installStatus?.dataStatus ?? ''
    );
  return {
    isInstallable,
    isInstalled,
    isQueued,
    hasFailed,
  };
}

export default function UserDatasetStatus(props: Props) {
  const { baseUrl, userDataset, projectId, displayName, dataNoun } = props;
  const { projects, status } = userDataset;
  const lowercaseSingularDataNoun = dataNoun.singular.toLowerCase();
  const installStatusByProject = status?.install?.find(
    (d) => d.projectId === projectId
  );
  const { isInstallable, isInstalled, isQueued, hasFailed } =
    getDatasetStatusInfo(
      projects,
      projectId,
      status.import,
      installStatusByProject
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
      Failed (phase {phase}): {installStatusByProject?.dataMessage}
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
