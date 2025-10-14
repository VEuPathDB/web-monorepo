import React from "react";
import { Loading } from "@veupathdb/wdk-client/lib/Components";

export function UploadProgress({ uploadProgress }: { uploadProgress?: number | null }): React.ReactElement {
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
