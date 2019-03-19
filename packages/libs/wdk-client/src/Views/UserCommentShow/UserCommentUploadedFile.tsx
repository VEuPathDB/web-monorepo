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

export const UserCommentUploadedFile: React.SFC<UserCommentUploadedFileProps> = ({
  uploadedFiles,
  headerClassName,
  entryClassName
}) => (
  <table>
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
  </table>
);
