import React from 'react';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { UserDatasetUpload } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import UserDatasetEmptyState from '../Components/EmptyState';

interface Props {
  uploadList?: Array<UserDatasetUpload>;
  errorMessage?: string;
  actions: {
    clearMessages: (ids: string[]) => void;
    cancelCurrentUpload: (id: string) => void;
  };
}

const ClearAllMessagesButton = (onClickCallback: () => void) => (
  <button type="submit" className="btn" onClick={onClickCallback}>
    Clear All Messages
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

const SuccessfulUpload = (upload: UserDatasetUpload) => (
  <div>
    <UploadHeader
      color="green"
      iconType="check-circle"
      date={upload.finished || upload.started}
    />
    Successfully uploaded: &nbsp;
    <Link
      to={
        upload.datasetId != null
          ? '/workspace/datasets/' + upload.datasetId
          : '/workspace/datasets'
      }
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
  uploads: Array<UserDatasetUpload>;
  cancelCurrentUpload: (id: string) => void;
}) => {
  const { uploads, cancelCurrentUpload } = props;
  return (
    <table style={{ margin: '1em 0' }}>
      <tbody>
        {uploads.map((upload, ix) => (
          <tr key={ix + '-' + upload.datasetName}>
            <td style={{ fontSize: 'larger', paddingBottom: '1em' }}>
              {upload.isOngoing
                ? OngoingUpload(upload, () => cancelCurrentUpload(upload.id))
                : upload.isSuccessful
                ? SuccessfulUpload(upload)
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
        {ix == 0 && <Icon fa="exclamation-triangle" />}
        {line}
      </div>
    ))}
  </div>
);
const AllUploads = (props: Props) => {
  const uploads = props.uploadList || [];
  const ongoingUploads = uploads.filter((u) => u.isOngoing);
  const finishedUploads = uploads.filter((u) => !u.isOngoing);

  return (
    <div>
      {props.errorMessage != null && ErrorMessage(props.errorMessage)}
      {ongoingUploads.length > 0 && RefreshButton()}
      {uploads.length > 0 && (
        <UploadsTable
          uploads={uploads}
          cancelCurrentUpload={props.actions.cancelCurrentUpload}
        />
      )}
      {finishedUploads.length > 0 &&
        ClearAllMessagesButton(() =>
          props.actions.clearMessages(finishedUploads.map((u) => u.id))
        )}
      {props.errorMessage == null && uploads.length === 0 && (
        <UserDatasetEmptyState
          message={'There are no recent uploads to be displayed.'}
        />
      )}
    </div>
  );
};
export default wrappable(AllUploads);
