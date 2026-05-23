export type ProgressHandler = (bytesLoaded: number, totalBytes: number) => void;
export type ResponseHandler<T> = (
  code: number,
  responseType: XMLHttpRequestResponseType,
  response: unknown
) => Promise<T>;

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

export interface MultipartConfig<T> {
  readonly url: string | URL;

  readonly method?: 'PATCH' | 'POST' | 'PUT' | string;

  readonly headers?: Record<string, string>;

  readonly fields: MultipartField[];

  readonly onResponse: ResponseHandler<T>;
  readonly onProgress?: ProgressHandler;
}

export function sendMultipartRequest<T>(
  config: MultipartConfig<T>
): Promise<T> {
  return new Promise<T>((good, bad) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;

      good(config.onResponse(xhr.status, xhr.responseType, xhr.response));
    });

    xhr.addEventListener('error', bad);
    xhr.addEventListener('abort', bad);

    if (config.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        config.onProgress!(e.loaded, e.total);
      });
    }

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

    xhr.open(config.method ?? 'POST', config.url);

    if (config.headers) {
      for (const [name, value] of Object.entries(config.headers))
        xhr.setRequestHeader(name, value);
    }

    xhr.send(formData);
  });
}
