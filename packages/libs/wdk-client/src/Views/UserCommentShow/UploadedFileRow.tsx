import React from 'react';

import { usePromise } from 'wdk-client/Hooks/PromiseHook';

export interface UserCommentUploadedFileEntry {
  id: number;
  name: string;
  description: string;
  url: string;
}

interface Props extends UserCommentUploadedFileEntry {
  entryClassName?: string;
  rowNumber: number;
}

export const UploadedFileRow = ({
  name,
  description,
  url,
  entryClassName,
  rowNumber
}: Props) => {
  const { loading, value } = useContentType(url);

  const isAvailable = (
    !loading &&
    value?.isAvailable
  );
  
  const isImage = (
    !loading &&
    value?.isAvailable &&
    value.contentType?.startsWith('image')
  );

  return (
    <tr className={entryClassName}>
      <td>{rowNumber}</td>
      <td>{
        !isAvailable
          ? name
          : <a href={url}>{name}</a>
      }</td>
      <td>{description}</td>
      <td>{
        !isImage
          ? null
          : <a href={url}>
              <img 
                src={url}
                width={80}
                height={80} 
              />
            </a> 
      }</td>
    </tr>
  );
}

type ContentType =
  | { isAvailable: false }
  | { isAvailable: true, contentType: string | null }

function useContentType(url: string | undefined) {
  return usePromise(async (): Promise<ContentType> => {
    if (url == null) {
      return {
        isAvailable: false
      };
    }

    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isSuccess = (
        response.status >= 200 && response.status < 300 ||
        response.status === 304
      );
      const contentType = response.headers.get('Content-Type');

      return isSuccess
        ? {
            isAvailable: true,
            contentType
          }
        : {
            isAvailable: false
          };
    } catch {
      return {
        isAvailable: false
      };
    }
  }, [ url ]);
}
