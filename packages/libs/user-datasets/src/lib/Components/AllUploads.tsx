import { ReactNode, useCallback, useMemo } from 'react';

import { Checkbox, Link } from '@veupathdb/wdk-client/lib/Components';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import UserDatasetEmptyState from '../Components/EmptyState';
import { useProjectFilter } from '../Hooks/project-filter';
import { UserDatasetUpload } from '../Utils/types';

interface Props {
  baseUrl: string;
  uploadList?: Array<UserDatasetUpload>;
  errorMessage?: string;
  actions: {
    clearMessages: (ids: string[]) => void;
    cancelCurrentUpload: (id: string) => void;
  };
}

const ClearAllMessagesButton = (
  onClickCallback: () => void,
  buttonContent: ReactNode
) => (
  <button type="submit" className="btn" onClick={onClickCallback}>
    {buttonContent}
  </button>
);

type HeaderProps = {
  color: string;
  iconType: string;
  date: string;
};
const UploadHeader = ({ color, iconType, date }: HeaderProps) => (
  <div style={{ color }}>
    <Icon fa={iconType} />
    <span style={{ marginLeft: '0.5em' }}>
      {new Date(date).toLocaleString()}
    </span>
  </div>
);

const OngoingUpload = (
  upload: UserDatasetUpload,
  onClickCancel: () => void
) => (
  <div>
    <UploadHeader
      color="orange"
      iconType="cogs"
      date={upload.finished || upload.started}
    />
    <div>
      Currently uploading: <code>{upload.datasetName}</code>
    </div>
    <div>
      Status:{' '}
      {upload.status +
        (upload.stepPercent ? ' ... ' + upload.stepPercent + '%' : '')}
    </div>
    {upload.isCancellable && (
      <button className="btn" onClick={() => onClickCancel()}>
        Cancel upload
      </button>
    )}
  </div>
);

const SuccessfulUpload = (upload: UserDatasetUpload, baseUrl: string) => (
  <div>
    <UploadHeader
      color="green"
      iconType="check-circle"
      date={upload.finished || upload.started}
    />
    Successfully uploaded: &nbsp;
    <Link
      to={upload.datasetId != null ? `${baseUrl}/${upload.datasetId}` : baseUrl}
    >
      <code>{upload.datasetName}</code>
    </Link>
  </div>
);

const InvalidatedUpload = (upload: UserDatasetUpload) => {
  return (
    <div>
      <UploadHeader
        color="red"
        iconType="exclamation-triangle"
        date={upload.finished || upload.started}
      />
      <div>
        <code>{upload.datasetName}</code> was rejected as it is invalid
        {upload.errors ? (
          <span>
            :
            <code>
              {upload.errors.map((line, ix) => (
                <div key={ix}>{line}</div>
              ))}
            </code>
          </span>
        ) : (
          <span>.</span>
        )}
      </div>
    </div>
  );
};

const FailedUpload = (upload: UserDatasetUpload) => (
  <div>
    <UploadHeader
      color="red"
      iconType="exclamation-triangle"
      date={upload.finished || upload.started}
    />
    <div>
      <code>{upload.datasetName}</code> could not be uploaded.
    </div>
    <div>
      Please try again. If the problem persists, please let us know through our
      &nbsp;
      <Link to="/contact-us" target="_blank">
        support form
      </Link>
      .
    </div>
  </div>
);

const UploadsTable = (props: {
  baseUrl: string;
  uploads: Array<UserDatasetUpload>;
  cancelCurrentUpload: (id: string) => void;
}) => {
  const { baseUrl, uploads, cancelCurrentUpload } = props;
  return (
    <table style={{ margin: '1em 0' }}>
      <tbody>
        {uploads.map((upload, ix) => (
          <tr key={ix + '-' + upload.datasetName}>
            <td style={{ fontSize: 'larger', paddingBottom: '1em' }}>
              {upload.isOngoing
                ? OngoingUpload(upload, () => cancelCurrentUpload(upload.id))
                : upload.isSuccessful
                ? SuccessfulUpload(upload, baseUrl)
                : upload.isUserError
                ? InvalidatedUpload(upload)
                : FailedUpload(upload)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
const RefreshButton = () => (
  <button
    type="submit"
    className="btn"
    onClick={() => {
      window.location.reload();
    }}
  >
    Refresh page
  </button>
);
const ErrorMessage = (message: string) => (
  <div className="ui-state-error" style={{ fontSize: 'large' }}>
    {message.split('\n').map((line, ix) => (
      <div className="ui-state-error-text" key={ix}>
        {ix === 0 && <Icon fa="exclamation-triangle" />}
        {line}
      </div>
    ))}
  </div>
);
const AllUploads = (props: Props) => {
  const uploads = useMemo(() => props.uploadList ?? [], [props.uploadList]);
  const ongoingUploads = useMemo(() => uploads.filter((u) => u.isOngoing), [
    uploads,
  ]);
  const finishedUploads = useMemo(() => uploads.filter((u) => !u.isOngoing), [
    uploads,
  ]);

  const projectInfo = useWdkService(async (wdkService) => {
    const config = await wdkService.getConfig();

    return {
      id: config.projectId,
      name: config.displayName,
    };
  }, []);

  const [projectFilter, setProjectFilter] = useProjectFilter();

  const hasUploadFromAnotherProject = useMemo(
    () =>
      uploads.some((upload) =>
        upload.projects.some((project) => project !== projectInfo?.id)
      ),
    [projectInfo, uploads]
  );

  const projectFilterApplied = projectFilter !== false;

  const uploadFilterPredicate = useCallback(
    (upload: UserDatasetUpload) =>
      projectInfo == null ||
      !projectFilterApplied ||
      upload.projects.includes(projectInfo.id),
    [projectInfo, projectFilterApplied]
  );

  const filteredUploads = useMemo(
    () => uploads.filter(uploadFilterPredicate),
    [uploads, uploadFilterPredicate]
  );
  const filteredFinishedUploads = useMemo(
    () => finishedUploads.filter(uploadFilterPredicate),
    [finishedUploads, uploadFilterPredicate]
  );

  return (
    <div>
      {props.errorMessage != null && ErrorMessage(props.errorMessage)}
      {ongoingUploads.length > 0 && RefreshButton()}
      {projectInfo != null && hasUploadFromAnotherProject && (
        <div style={{ display: 'flex', gap: '0.25em', margin: '0.5em' }}>
          <Checkbox
            id="recent-uploads-project-filter"
            value={projectFilterApplied}
            onChange={() => {
              setProjectFilter((projectFilter) => !projectFilter);
            }}
          />
          <label htmlFor="recent-uploads-project-filter">
            Only show uploads to {projectInfo.name}
          </label>
        </div>
      )}
      {filteredUploads.length > 0 && (
        <UploadsTable
          baseUrl={props.baseUrl}
          uploads={filteredUploads}
          cancelCurrentUpload={props.actions.cancelCurrentUpload}
        />
      )}
      {filteredFinishedUploads.length > 0 &&
        ClearAllMessagesButton(
          () =>
            props.actions.clearMessages(
              filteredFinishedUploads.map((u) => u.id)
            ),
          projectFilterApplied && hasUploadFromAnotherProject
            ? 'Clear These Messages'
            : 'Clear All Messages'
        )}
      {props.errorMessage == null &&
        projectInfo != null &&
        filteredUploads.length === 0 && (
          <UserDatasetEmptyState
            message={
              uploads.length === 0
                ? 'There are no recent uploads to be displayed.'
                : `There are no recent ${projectInfo.name} uploads to be displayed. Uncheck "Only show uploads to ${projectInfo.name}" to see all your recent uploads.`
            }
          />
        )}
    </div>
  );
};
export default AllUploads;
