import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { UserDatasetUpload, NewUserDataset } from 'wdk-client/Utils/WdkModel';
import * as Decode from 'wdk-client/Utils/Json';

const serviceUrl = '/dataset-import';

/*
 * The authentication method uses an 'Auth_Key' header, not the cookie like in WDK
 */
function fetchWithCredentials(path: string, method: string, body: any, contentType?: string){
  const wdkCheckAuth = document.cookie.split("; ").find(x => x.startsWith("wdk_check_auth=")) || "";
  const authKey = wdkCheckAuth.replace("wdk_check_auth=", "");
  const authO = {
        'Auth_Key': authKey
  };
  const contentTypeO = contentType != null ? {'Content-Type': contentType } : {};
  return fetch(serviceUrl + path,
    {
      method: method.toUpperCase(),
      body: body,
      credentials: 'include',
      headers: new Headers(Object.assign({}, authO, contentTypeO))
    }
  );
}

/*
 * The successful payload is decoded as a <Resource>, failure is a text that is acceptable to display
 *
 * The service communicates failures in JSON,
 * with 'message' and 'status' as keys
 * See doc: /api#type:err.ErrorResponse
 */
function fetchDecodedJsonOrThrowMessage<Resource> (decoder: Decode.Decoder<Resource>, options: {path: string; method: string; body?:any; }): Promise<Resource> {
  let { method, path, body } = options;
  return fetchWithCredentials(
      path, method, body, 'application/json; charset=utf-8'
    ).then(async response => {
      const responseBody = await response.json();
      if (response.ok) {
        return responseBody;
      }
      console.log(response);

      const message = responseBody.message;
      if (!message){
        throw "Unexpected error: " + response.status;
      }
      if (response.status != 422){
        throw "Error type "+ responseBody.status + ": " + responseBody.message;
      }
      let errorLines = [];
      errorLines.push("Validation failed:");
      if(responseBody.errors.general && responseBody.errors.general.length){
        errorLines.push(...responseBody.errors.general);
      }
      errorLines.push(Object.entries(responseBody.errors.byKey).map(p => p[0] + ": " + p[1]));

      throw errorLines.join("\n<br>\n");

    }).then(responseBody => {
      const result = decoder(responseBody);
      if (result.status === 'ok') return result.value;

      let errorMessage = `Could not decode resource from ${options.path}:`;
      if (result.context) {
        errorMessage += '\n\n' + `  Problem at _${result.context}:`;
      }
      errorMessage += '\n\n' + `    Expected ${result.expected}, but got ${JSON.stringify(result.value)}.`;
      throw errorMessage;
    });
}

export default (base: ServiceBase) => {
  function addDataset(newUserDataset: NewUserDataset): Promise<void> {
    const metaBody = JSON.stringify({
      datasetName: newUserDataset.name,
      datasetType: newUserDataset.datasetType,
      description: newUserDataset.description,
      summary: newUserDataset.summary,
      projects: newUserDataset.projects,
      origin: "DIRECT_UPLOAD"
    });

    const fileBody = new FormData();
    fileBody.append('file', newUserDataset.file);

    return fetchDecodedJsonOrThrowMessage(
      Decode.field("jobId", Decode.string),
      {
        path: '/user-datasets',
        method: 'POST',
        body: metaBody
      }
    ).then(({jobId}) => {
      fetchWithCredentials(
          '/user-datasets/'+jobId,
          'POST',
           fileBody
      );
    });
  }
  function listStatusDetails():  Promise<Array<UserDatasetUpload>> {
    return fetchDecodedJsonOrThrowMessage(
      Decode.arrayOf(Decode.combine(
        Decode.field("id", Decode.string),
        Decode.field("datasetId", Decode.optional(Decode.number)),
        Decode.field("datasetName", Decode.string),
        Decode.field("summary", Decode.string),
        Decode.field("projects", Decode.arrayOf(Decode.string)),
        Decode.field("status", Decode.string),
        Decode.field("statusDetails", Decode.optional(Decode.combine(
          Decode.field("errors", Decode.optional(Decode.combine(
            Decode.field("general", Decode.arrayOf(Decode.string)),
            Decode.field("byKey", Decode.objectOf(Decode.string))
          ))),
        ))),
        Decode.field("stepPercent", Decode.optional(Decode.number)),
        Decode.field("started", Decode.string),
        Decode.field("finished", Decode.optional(Decode.string))
      )),
      {
        path: '/user-datasets',
        method: 'GET'
      }
    ).then(uploads => uploads.map(upload => {
      let errorLines = [];
			
      if( upload.statusDetails && upload.statusDetails.errors && upload.statusDetails.errors.general ){
        let line;
        for(line of upload.statusDetails.errors.general ){
          errorLines.push(line);
        }
      }
      if( upload.statusDetails && upload.statusDetails.errors && upload.statusDetails.errors.byKey ){
        let p;
        for(p of Object.entries(upload.statusDetails.errors.byKey)){ 
      	  errorLines.push(p[0] + ": " + p[1]);
        }
			}
			delete upload.statusDetails;

      return (
				{
				...upload,
				errors: errorLines,
				isOngoing: ! upload.status.match(/success|rejected|errored/),
				isSuccessful: !! upload.status.match(/success/),
				isUserError: !! upload.status.match(/rejected/)
			 });
			}
    ));
  }
  function issueDeleteCommand(jobId: string) : Promise<void> {
    return fetchWithCredentials('/user-datasets/'+jobId, 'DELETE', undefined, 'text/plain;').then(x=>{});
  }
  // Currently only works for jobs whose status is awaiting-upload
  function cancelOngoingUpload(jobId: string) {
    return issueDeleteCommand(jobId);
  }
  function clearMessages(jobIds: string[]) : Promise<void> {
    return Promise.all(jobIds.map(issueDeleteCommand)).then(x=>{});
  }
  return {
    addDataset,
    listStatusDetails,
    cancelOngoingUpload,
    clearMessages
  };
}
