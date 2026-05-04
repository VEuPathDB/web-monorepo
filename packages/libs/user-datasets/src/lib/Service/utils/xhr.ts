export type ProgressHandler = (bytesLoaded: number, totalBytes: number) => void;
export type ResponseHandler<T> = (
  code: number,
  responseType: XMLHttpRequestResponseType,
  response: unknown
) => Promise<T>;

export interface MultipartField {
  readonly fieldName: string;
  readonly content: string | Blob;
  readonly fileName?: string;
}

export interface MultipartConfig<T> {
  readonly url: string | URL;

  readonly method?: 'PATCH' | 'POST' | 'PUT' | string;

  readonly headers?: Record<string, string>;

  readonly fields: MultipartField[];

  readonly onResponse: ResponseHandler<T>;
  readonly onProgress?: ProgressHandler;
}

export function sendMultipartRequest<T>(config: MultipartConfig<T>): Promise<T> {
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

    for (const field of config.fields)
      formData.append(field.fieldName, field.content, field.fileName);

    xhr.open(config.method ?? 'POST', config.url);

    if (config.headers) {
      for (const [name, value] of Object.entries(config.headers))
        xhr.setRequestHeader(name, value);
    }

    xhr.send(formData);
  });
}
