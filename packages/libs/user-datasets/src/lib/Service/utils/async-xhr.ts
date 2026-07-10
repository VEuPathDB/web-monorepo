import { BiConsumer, Consumer } from '../../Utils';

export type XHRMethod = 'POST' | 'PUT' | 'PATCH';

export interface XHRConfig {
  readonly url: string;
  readonly method: XHRMethod;

  /**
   * Body content type.
   *
   * If unset, one of the following will be used:
   *
   * 1. If the body is a file, then the MIME type of the file as assumed by the
   *    browser.
   * 2. If the body is a string, then 'text/plain' will be used.
   * 3. If the body is null, no content-type will be set.
   * 3. Else, 'application/octet-stream' will be used.
   */
  readonly contentType?: string;

  /**
   * Request body to send.
   */
  readonly body: Document | XMLHttpRequestBodyInit | null;

  /**
   * Optional callback to be executed on progress event from the request.
   */
  readonly onProgress?: BiConsumer<number, number>;

  /**
   * Optional headers to include with the request.
   *
   * A content-type header set here will be ignored.
   */
  readonly headers?: Record<string, string>;
}

export enum XHRResponseType {
  Blob,
  Buffer,
  Document,
  JSON,
  Text,
}

export type XHRResponse = {
  readonly responseCode: number;
  readonly headers: Record<string, string>;
} & (
  | {
      readonly responseType: typeof XHRResponseType.Blob;
      readonly response: Blob;
    }
  | {
      readonly responseType: typeof XHRResponseType.Buffer;
      readonly response: ArrayBuffer;
    }
  | {
      readonly responseType: typeof XHRResponseType.Document;
      readonly response: Document;
    }
  | {
      readonly responseType: typeof XHRResponseType.JSON;
      readonly responseBody: any;
    }
  | {
      readonly responseType: typeof XHRResponseType.Text;
      readonly responseBody: string;
    }
);

export enum XHRErrorType {
  Abort,
  Error,
  Timeout,
}

export interface XHRError {
  readonly url: string;
  readonly method: XHRMethod;
  readonly type: XHRErrorType;
}

/**
 * Executes an XHMLHttpRequest as a promise.
 *
 * If an error is encountered while attempting to send the request, the
 * rejection type will be an `XHRError` instance.
 *
 * IMPORTANT: Non-success HTTP response codes do _not_ count as errors, and will
 * be passed as a success result.
 */
export async function asyncXHR(config: XHRConfig): Promise<XHRResponse> {
  const xhr = new XMLHttpRequest();

  const makeError = (type: XHRErrorType): XHRError => ({
    url: config.url,
    method: config.method,
    type,
  });

  return new Promise((good, bad) => {
    xhr.addEventListener('abort', (_) => bad(makeError(XHRErrorType.Abort)));
    xhr.addEventListener('error', (_) => bad(makeError(XHRErrorType.Error)));
    xhr.addEventListener('timeout', (_) =>
      bad(makeError(XHRErrorType.Timeout))
    );
    xhr.addEventListener('load', buildSuccessHandler(xhr, good));

    if (config.onProgress) {
      xhr.upload.addEventListener('progress', (e) =>
        config.onProgress!(e.loaded, e.total)
      );
    }

    xhr.open(config.method, config.url);

    const headers = config.headers ?? {};

    if (!config.body) {
      applyHeaders(xhr, headers);
      xhr.send();
      return;
    }

    let contentType: string | null;

    if (config.contentType) {
      contentType =
        config.contentType === 'multipart/form-data'
          ? null
          : config.contentType;
    } else if (typeof config.body === 'string') {
      contentType = 'text/plain';
    } else if (resemblesFile(config.body)) {
      contentType = config.body.type;
    } else {
      contentType = 'application/octet-stream';
    }

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    applyHeaders(xhr, headers);
    xhr.send(config.body);
  });
}

function buildSuccessHandler(
  xhr: XMLHttpRequest,
  cb: Consumer<XHRResponse>
): Consumer<unknown> {
  const convertType = (type: string) => {
    switch (type) {
      case 'arraybuffer':
        return XHRResponseType.Buffer;
      case 'blob':
        return XHRResponseType.Blob;
      case 'document':
        return XHRResponseType.Document;
      case 'json':
        return XHRResponseType.JSON;
      default:
        return XHRResponseType.Text;
    }
  };

  return (_) => {
    const headers: Record<string, string> = {};

    xhr
      .getAllResponseHeaders()
      .split('\r\n')
      .map((v) => v.split(':', 2))
      .forEach((v) => {
        headers[v[0]] = v.length < 2 ? '' : v[1];
      });

    cb({
      responseCode: xhr.status,
      responseType: convertType(xhr.responseType),
      responseBody: xhr.response,
      headers,
    } as XHRResponse);
  };
}

function applyHeaders(xhr: XMLHttpRequest, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    xhr.setRequestHeader(key, value);
  }
}

function resemblesFile(body: any): body is File {
  return (
    typeof body === 'object' &&
    Object.hasOwn(body, 'type') &&
    Object.hasOwn(body, 'name') &&
    Object.hasOwn(body, 'size') &&
    Object.hasOwn(body, 'lastModified')
  );
}
