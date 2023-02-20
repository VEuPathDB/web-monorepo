import { v4 as uuid } from 'uuid';
import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import { appendUrlAndRethrow, makeTraceid } from '../ServiceUtils';

export default (base: ServiceBase) => {

  function createTemporaryFile(file: File): Promise<string> {
    const formData = new FormData();
    const path = '/temporary-files';
    formData.append('file', file, file.name);
    return fetch(base.serviceUrl + path, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      headers: {
        traceid: makeTraceid(),
      }
    }).then(response => {
      if (response.ok) {
        const id = response.headers.get('ID');
        if (id == null) throw new Error("Expected response headers to include `ID`, but it was not.");
        return Promise.resolve(id);
      }
      return response.text().then(text => {
        // FIXME Get uuid from response header when available
        throw new ServiceError(
          `Cannot POST ${path} (${response.status})`,
          text,
          response.status,
          uuid()
        );
      })
    }).catch(appendUrlAndRethrow(base.serviceUrl + path))
  }

  return {
    createTemporaryFile
  }
}
