import React, { ReactElement } from 'react';

import { Modal } from "@veupathdb/coreui";
import { Loading } from "@veupathdb/wdk-client/lib/Components";

export interface SubmissionModalProps {
  readonly submitting: boolean;
  readonly uploadProgress: number;
}

export function SubmissionModal(props: SubmissionModalProps): ReactElement {
  return (
    <Modal
      visible={props.submitting && Boolean(props.uploadProgress)}
      toggleVisible={() => null}
      styleOverrides={{
        content: {
          size: {
            height: '100%',
            width: '100%',
          },
          padding: {
            right: 10,
            left: 10,
          },
        },
        size: {
          height: 150,
          width: 'auto',
        },
      }}
    >
      <UploadProgress uploadProgress={props.uploadProgress} />
    </Modal>
  );
}

function UploadProgress({
  uploadProgress,
}: {
  uploadProgress: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1em',
        fontSize: '1.5em',
        height: '100%',
      }}
    >
      {uploadProgress && uploadProgress !== 100 && (
        <>
          <progress id="file" max="100" value={uploadProgress} />
          <label htmlFor="file">Uploading...</label>
        </>
      )}
      {uploadProgress === 100 && (
        <>
          <Loading style={{ padding: '1em' }} />
          <span>Waiting on server response...</span>
        </>
      )}
    </div>
  );
}
