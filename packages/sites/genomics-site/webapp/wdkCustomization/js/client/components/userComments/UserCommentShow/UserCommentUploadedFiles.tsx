import React from 'react';

import { UserCommentAttachedFile } from '../../../types/userCommentTypes';
import { UploadedFileRow } from './UploadedFileRow';

interface UploadedFileEntry extends UserCommentAttachedFile {
  url: string;
}

interface UserCommentUploadedFilesProps {
  uploadedFiles: UploadedFileEntry[];
  headerClassName?: string;
  entryClassName?: string;
}

export const UserCommentUploadedFiles = ({
  uploadedFiles,
  headerClassName,
  entryClassName
}: UserCommentUploadedFilesProps) => (
  uploadedFiles.length > 0 
    ? (
      <table className="wdk-UserCommentUploadedFiles">
        <tbody>
          <tr className={headerClassName}>
            <th>#</th>
            <th>Name/Link</th>
            <th>Description</th>
            <th>Preview<br /><span>(only if image)</span></th>
          </tr>
          {
            uploadedFiles.map(
              (uploadedFile, index) => (
                <UploadedFileRow
                  key={uploadedFile.id}
                  entryClassName={entryClassName}
                  rowNumber={index + 1}
                  {...uploadedFile}
                />
              )
            )
          }
        </tbody>
      </table>
    )
    : null
);
