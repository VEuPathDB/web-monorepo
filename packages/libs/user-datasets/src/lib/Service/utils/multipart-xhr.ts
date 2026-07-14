import { asyncXHR, XHRConfig, XHRMethod, XHRResponse } from './async-xhr';

export type MultipartField = {
  readonly fieldName: string;
} & (
  | {
      readonly type: 'json';
      readonly content: any;
    }
  | {
      readonly type: 'url';
      readonly content: string;
    }
  | {
      readonly type: 'file';
      readonly content: Blob;
      readonly fileName?: string;
    }
);

export interface MultipartConfig extends Omit<XHRConfig, 'method' | 'body'> {
  readonly method?: XHRMethod;

  readonly fields: MultipartField[];
}

export function sendMultipartRequest(
  config: MultipartConfig
): Promise<XHRResponse> {
  const formData = new FormData();

  for (const field of config.fields) {
    let content: Blob;
    let fileName: string | undefined;

    switch (field.type) {
      case 'json':
        content = new Blob([JSON.stringify(field.content)], {
          type: 'application/json',
        });
        break;
      case 'url':
        content = new Blob([field.content], { type: 'text/plain' });
        break;
      case 'file':
        content = field.content;
        fileName = field.fileName;
        break;
    }

    formData.append(field.fieldName, content, fileName);
  }

  return asyncXHR({
    url: config.url,
    method: config.method ?? 'POST',
    headers: config.headers,
    body: formData,
    contentType: 'multipart/form-data',
    onProgress: config.onProgress,
  });
}
