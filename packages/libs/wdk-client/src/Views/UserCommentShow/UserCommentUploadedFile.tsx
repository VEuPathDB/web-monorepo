import React from 'react';

interface UserCommentUploadedFileProps {
  index: number;
  name: string;
  description: string
  preview?: string,
  headerClassName?: string;
  dataClassName?: string;
}

export const UserCommentUploadedFile: React.SFC<UserCommentUploadedFileProps> = ({
  index,
  name,
  description,
  preview,
  headerClassName,
  dataClassName
}) => (
  <>
    <div className={headerClassName}>
      <div>#</div>
      <div>Name/Link</div>
      <div>Description</div>
      <div>Preview<br /><span>(only if image)</span></div>
    </div>
    <div className={dataClassName}>
      <div>{index}</div>
      <div>{name}</div>
      <div>{description}</div>
      <div>{preview ? <a href={preview}><img src={preview} /></a> : null}</div>
    </div>
  </>
);
