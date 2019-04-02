import React from 'react';

interface UserCommentUploadedFileEntry {
  id: number;
  name: string;
  description: string;
  preview?: string;
}

interface UserCommentUploadedFileProps {
  uploadedFiles: UserCommentUploadedFileEntry[];
  headerClassName?: string;
  entryClassName?: string;
}

export const UserCommentUploadedFiles: React.SFC<UserCommentUploadedFileProps> = ({
  uploadedFiles,
  headerClassName,
  entryClassName
}) => (
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
              ({ id, name, description, preview }, index) => (
                <tr key={id} className={entryClassName}>
                  <td>{index + 1}</td>
                  <td>{name}</td>
                  <td>{description}</td>
                  <td>{preview ? <a href={preview}><img src={preview} /></a> : null}</td>
                </tr>
              )
            )
          }
        </tbody>
      </table>
    )
    : null
);
