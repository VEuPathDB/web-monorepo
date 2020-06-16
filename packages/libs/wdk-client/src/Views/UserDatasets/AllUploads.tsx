import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';
import { Link } from 'wdk-client/Components';
import { UserDatasetUpload } from 'wdk-client/Utils/WdkModel';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import UserDatasetEmptyState from 'wdk-client/Views/UserDatasets/EmptyState';

interface Props {
  uploadList?: Array<UserDatasetUpload>;
  errorMessage?: string;
  actions: {
    clearMessages: (ids: string[]) => void;
    cancelCurrentUpload: (id: string) => void;
  };
}


const ClearAllMessagesButton = (onClickCallback: () => void) => (
  <button type="submit" className="btn" onClick={onClickCallback}>Clear All Messages</button>
);

type HeaderProps = {
  color: string;
  iconType: string;
  date: string;
};
const UploadHeader = ({color, iconType, date}: HeaderProps) => (
  <div style={{color}}>
    <Icon fa={iconType}/>
    <span style={{marginLeft: "0.5em"}}>
      {new Date(date).toLocaleString()}
    </span>
  </div>
);

const OngoingUpload = (upload: UserDatasetUpload, onClickCancel: () => void) => (
  <div>
    <UploadHeader color="orange" iconType="cogs" date={upload.finished || upload.started} />
    <div> 
      Currently uploading: <code>{upload.datasetName}</code>
    </div>
    <div>
      Status: {upload.status + (upload.stepPercent ? " ... " + upload.stepPercent + "%" : "")}
    </div>
    {upload.status === 'awaiting-upload' && <a style={{cursor: "pointer"}} onClick={()=>onClickCancel()}>Cancel upload</a> }
  </div>
);

const SuccessfulUpload = (upload: UserDatasetUpload) => (
  <div>
    <UploadHeader color="green" iconType="check-circle" date={upload.finished || upload.started} />
    Successfully uploaded:  &nbsp;
    <Link to ={upload.datasetId != null ? '/workspace/datasets/'+upload.datasetId : '/workspace/datasets'}>
      <code>{upload.datasetName}</code>
    </Link>
  </div>
);

const InvalidatedUpload = (upload: UserDatasetUpload) => {
  return (
    <div>
      <UploadHeader color="red" iconType="exclamation-triangle" date={upload.finished || upload.started} />
      <div>
        <code>{upload.datasetName}</code> was rejected as it is invalid
        { upload.errors
            ? (
              <span>:
               <code>
                 {
                   upload.errors.map((line,ix) => (<div key={ix}>{line}</div>))
                 }
               </code>
             </span>)
          : (<span>.</span>)
        }
      </div>
    </div>
  );
}

const FailedUpload = (upload: UserDatasetUpload) => (
  <div>
    <UploadHeader color="red" iconType="exclamation-triangle" date={upload.finished || upload.started} />
    <div>
      <code>{upload.datasetName}</code> could not be uploaded. 
    </div>
    <div>Please try again. If the problem persists, please let us know through our	&nbsp;
     <Link to="/contact-us" target="_blank">support form</Link>.
    </div>
  </div>
);

const UploadsTable = (props: {uploads: Array<UserDatasetUpload>, cancelCurrentUpload: (id: string) => void}) => {
  const {uploads, cancelCurrentUpload} = props;
  return (
    <table>
      <tbody>
        { uploads.map((upload, ix) => (
          <tr key={ix + "-" + upload.datasetName} >
            <td style={{fontSize: "large", paddingBottom: "1em"}}>
              { upload.isOngoing
                ? OngoingUpload(upload, () => cancelCurrentUpload(upload.id))
                  : upload.isSuccessful
                  ? SuccessfulUpload(upload)
                  : upload.isUserError
                    ? InvalidatedUpload(upload)
                    : FailedUpload(upload)
               }
            </td>
          </tr>
        ))
        }
      </tbody>
    </table>
  );
};
const RefreshButton = () => (
  <button type="submit" className="btn" onClick={()=>{ location.reload(); }}>Refresh page</button>
);
const ErrorMessage = (message: string) => (
  <div className="ui-state-error" style={{fontSize: "large"}}>
    {message.split("\n").map((line,ix) => (
      <div className="ui-state-error-text" key={ix}>
        {ix == 0 && <Icon fa="exclamation-triangle"/> }
        {line}
      </div>
    ))}
  </div>
);
const AllUploads = (props: Props) => {
  const uploads = props.uploadList || [];
  const ongoingUploads = uploads.filter(u=>u.isOngoing);
  const finishedUploads = uploads.filter(u=>!u.isOngoing);

  return (
    <div>
      {props.errorMessage != null && ErrorMessage(props.errorMessage)}
      {ongoingUploads.length > 0 && RefreshButton()}
      {uploads.length > 0 && <UploadsTable uploads={uploads} cancelCurrentUpload={props.actions.cancelCurrentUpload} />}
      {finishedUploads.length > 0 && ClearAllMessagesButton(() => props.actions.clearMessages(finishedUploads.map(u=>u.id)))}
      {props.errorMessage == null && uploads.length === 0 && <UserDatasetEmptyState message={"There are no messages to be displayed."}/>}
    </div>
  );
};
export default wrappable(AllUploads);

