import React from 'react';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';
import { Tooltip } from '@veupathdb/coreui';

import { DataNoun } from '../Utils/types';
import {
  DatasetGetResponseBody,
  DatasetListEntry,
  DatasetStatusInfo,
  DatasetUploadStatusInfo,
  VdiReconcilerConfig,
  VdiServiceConfig,
} from '../Service';

export interface Props {
  baseUrl: string;
  userDataset: DatasetListEntry | DatasetGetResponseBody;
  projectId: string;
  displayName: string;
  linkToDataset: boolean;
  useTooltip: boolean;
  dataNoun: DataNoun;
  readonly vdiConfig: VdiServiceConfig;
  /**
   * When true, the status icon spins to show the view is watching for changes.
   * Only the detail page polls, so the listing leaves this unset and keeps the
   * static clock — a spinning icon there would imply an update that never comes.
   */
  readonly isPolling?: boolean;
}

const orderedStatuses = [
  'failed-validation',
  'missing-dependency',
  'failed-installation',
  'ready-for-reinstall',
  'running',
  'complete',
];

/**
 * This is a mapping of import and install statuses received from VDI response
 *  import queued                 clock "queued"
 *  import in-progress	          clock "queued"
 *  import complete               clock "queued"
 *  import invalid			          yellow: "validation error on import; this is why"
 *  import failed 			          grey: "error on import (a bug); please let us know"
 *  install running		            clock: "in progress"
 *  install complete		          green: "complete"
 *  install failed-validation     yellow: "validation error on install; this is why"
 *  install failed-installation   grey: "error on install (a bug); pls let us know"
 *  install ready-for-reinstall   grey: "error on install (a bug); pls let us know"
 *  install missing-dependency    yellow: "incompatible, why"
 **/

function getStatus(
  status: DatasetStatusInfo,
  projectId: string,
  dataNoun: string,
  projectDisplayName: string,
  projects: string[],
  vdiConfig: VdiReconcilerConfig
): { content: React.ReactNode; icon: string } {
  const isTargetingCurrentSite = projects.includes(projectId);

  if (!isTargetingCurrentSite) {
    return {
      content: `This ${dataNoun} was uploaded and installed in a different VEuPathDB project.`,
      icon: 'minus-circle',
    };
  }

  if (status.upload.status !== 'success')
    return getUploadStatus(status.upload, dataNoun);
  else
    return getPostUploadStatus(
      status,
      projectId,
      dataNoun,
      projectDisplayName,
      vdiConfig
    );
}

const queuedStatus = (dataNoun: string) => ({
  content: `This ${dataNoun} is queued.`,
  icon: 'clock-o',
});

function getUploadStatus(
  details: DatasetUploadStatusInfo,
  dataNoun: string
): { content: React.ReactNode; icon: string } {
  switch (details.status) {
    case 'running':
      return queuedStatus(dataNoun);

    case 'rejected':
      return {
        content: (
          <>
            This {dataNoun} was rejected during initial upload processing:
            <br />
            {details.message?.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </>
        ),
        icon: 'exclamation-circle',
      };

    case 'failed':
      return {
        content: (
          <>
            Initial processing of your uploaded {dataNoun} failed. Please try
            uploading your {dataNoun} again. If the problem persists, please let
            us know through our{' '}
            <Link to="/contact-us" target="_blank">
              support form
            </Link>
            .
          </>
        ),
        icon: 'times-circle',
      };

    default:
      return {
        content: `This ${dataNoun} is queued.`,
        icon: 'clock-o',
      };
  }
}

/**
 * Build dataset status details from information that is only available after
 * the target dataset upload has been successfully processed.
 *
 * This info consists of the "import phase" data preprocessing step, and the
 * data install step for all install target projects.
 */
function getPostUploadStatus(
  status: DatasetStatusInfo,
  projectId: string,
  dataNoun: string,
  projectDisplayName: string,
  vdiConfig: VdiReconcilerConfig
): { content: React.ReactNode; icon: string } {
  const importStatus = status.import?.status;
  switch (importStatus) {
    case null:
    case 'queued':
    case 'in-progress':
      return {
        content: `This ${dataNoun} is being processed.`,
        icon: 'clock-o',
      };
    case 'invalid':
      return {
        content: (
          <>
            This {dataNoun} was rejected as invalid during the import phase:
            {renderErrorMessages(status.import!.messages || [])}
          </>
        ),
        icon: 'exclamation-circle',
      };
    case 'failed':
      return {
        content: (
          <>
            Failed during the import phase. If the problem persists, please let
            us know through our{' '}
            <Link to="/contact-us" target="_blank">
              support form
            </Link>
            .
          </>
        ),
        icon: 'times-circle',
      };
  }

  if (importStatus !== 'complete') {
    return {
      content: `This ${dataNoun} is queued.`,
      icon: 'clock-o',
    };
  } else {
    const installData = status.install?.find(
      (d) => d.installTarget === projectId
    );
    const metaStatus = installData?.meta.status;
    const metaMessages = installData?.meta.messages || [];
    const dataStatus = installData?.data?.status;
    const dataMessages = installData?.data?.messages || [];

    // Returns the "least" status between metaStatus and dataStatus
    const combinedStatus = orderedStatuses.find(
      (status) => metaStatus === status || dataStatus === status
    );

    switch (combinedStatus) {
      case 'running':
        return {
          content: 'In progress.',
          icon: 'clock-o',
        };
      case 'complete':
        return {
          content: `This ${dataNoun} is installed and ready to use in ${projectDisplayName}.`,
          icon: 'check-circle',
        };
      case 'failed-validation':
        return {
          content: (
            <>
              This {dataNoun} was rejected as invalid during the install phase:
              {renderErrorMessages([...metaMessages, ...dataMessages])}
            </>
          ),
          icon: 'exclamation-circle',
        };
      case 'failed-installation':
        return {
          content: (
            <>
              Failed during the install phase. If the problem persists, please
              let us know through our{' '}
              <Link to="/contact-us" target="_blank">
                support form
              </Link>
              .
            </>
          ),
          icon: 'times-circle',
        };
      case 'ready-for-reinstall':
        return {
          content: (
            <>
              This {dataNoun} will be reinstalled within{' '}
              {vdiConfig.fullRunInterval}.
            </>
          ),
          icon: 'minus-circle',
        };
      case 'missing-dependency':
        return {
          content: (
            <>
              This {dataNoun} is incompatible:
              {renderErrorMessages([...metaMessages, ...dataMessages])}
            </>
          ),
          icon: 'exclamation-circle',
        };
      default:
        return {
          content: 'Status unknown at this time.',
          icon: 'clock-o',
        };
    }
  }
}

/**
 * Helper function to render error messages as a bulleted list.
 * Replaces newlines with <br> tags in each message.
 */
function renderErrorMessages(messages: string[]): React.ReactNode {
  if (!messages || messages.length === 0) return null;

  // Always render as bulleted list with newlines as <br>
  return (
    <ul className="status-messages">
      {messages.map((message, index) => (
        <li key={index}>
          {message.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </li>
      ))}
    </ul>
  );
}

export default function UserDatasetStatus(props: Props) {
  const { baseUrl, userDataset, projectId, displayName, dataNoun } = props;
  const { installTargets, status } = userDataset;
  const lowercaseSingularDataNoun = dataNoun.singular.toLowerCase();

  const { content, icon: faIcon } = getStatus(
    status,
    projectId,
    lowercaseSingularDataNoun,
    displayName,
    installTargets,
    props.vdiConfig.daemons.reconciler
  );

  const link = `${baseUrl}/${userDataset.datasetId}`;
  // While polling, the clock gives way to a spinner: the clock says "this
  // dataset is waiting", the spinner says "and this page is watching it".
  const children = props.isPolling ? (
    <Icon className="StatusIcon StatusIcon--polling" fa="circle-o-notch" />
  ) : (
    <Icon className="StatusIcon" fa={faIcon} />
  );
  if (props.useTooltip && props.linkToDataset) {
    return (
      <Tooltip title={content ?? ''}>
        <Link to={link}>{children}</Link>
      </Tooltip>
    );
  } else if (props.useTooltip && !props.linkToDataset) {
    return <Tooltip title={content ?? ''}>{children}</Tooltip>;
  } else if (!props.useTooltip && props.linkToDataset) {
    return (
      <Link to={link}>
        <React.Fragment>
          {children} {content}
        </React.Fragment>
      </Link>
    );
  } else {
    return (
      <React.Fragment>
        {children} {content}
      </React.Fragment>
    );
  }
}
