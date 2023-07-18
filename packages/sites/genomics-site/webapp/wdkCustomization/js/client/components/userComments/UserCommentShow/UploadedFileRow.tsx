import React from 'react';

import { UserCommentAttachedFile } from '../../../types/userCommentTypes';

interface Props extends UserCommentAttachedFile {
  entryClassName?: string;
  url: string;
  rowNumber: number;
}

export const UploadedFileRow = ({
  name,
  description,
  mimeType,
  url,
  entryClassName,
  rowNumber,
}: Props) => {
  const isImage = mimeType.startsWith('image');

  return (
    <tr className={entryClassName}>
      <td>{rowNumber}</td>
      <td>
        <a href={url}>{name}</a>
      </td>
      <td>{description}</td>
      <td>
        {!isImage ? null : (
          <a href={url}>
            <img src={url} width={80} height={80} />
          </a>
        )}
      </td>
    </tr>
  );
};
