import { ServiceBase, CLIENT_WDK_VERSION_HEADER, StandardWdkPostResponse } from '@veupathdb/wdk-client/lib/Service/ServiceBase';
import {
  UserCommentPostRequest,
  UserCommentAttachedFileSpec,
  PubmedPreview,
  UserCommentGetResponse
} from '../types/userCommentTypes';

// TODO: this should be defined here or in wdk model or someplace, and imported in the store module
import { CategoryChoice } from '../storeModules/UserCommentFormStoreModule';


export type UserCommentPostResponseData =
  | {
    type: 'success',
    id: number
  }
  | {
    type: 'validation-error',
    errors: string[]
  }
  | {
    type: 'internal-error',
    error: string
  };


export default (base: ServiceBase) => {

  function getUserComment(id: number) {
    return base._fetchJson<UserCommentGetResponse>('get', `/user-comments/${id}`)
  }

  function getPubmedPreview(pubMedIds: number[]) : Promise<PubmedPreview> {
    let ids = pubMedIds.join(',');
    return base._fetchJson<PubmedPreview>('get', `/cgi-bin/pmid2json?pmids=${ids}`, undefined, true);
  }

  function getUserComments(targetType: string, targetId: string) : Promise<UserCommentGetResponse[]> {
    return base._fetchJson<UserCommentGetResponse[]>(
      'get',
      `/user-comments?target-type=${targetType}&target-id=${targetId}`
    );
  }

  function getUserCommentCategories(targetType: string): Promise<CategoryChoice[]> {
    return base._fetchJson<{ name: string, value: number }[]>(
      'get',
      `/user-comments/category-list?target-type=${targetType}`
    ).then(categories => categories.map(
      ({ name, value }) => ({
        display: name,
        value: `${value}`
      })
    )
    );
  }

  // TODO: could this use the fetchJson method?
  function postUserComment(userCommentPostRequest: UserCommentPostRequest): Promise<UserCommentPostResponseData> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (base._version) headers.append(CLIENT_WDK_VERSION_HEADER, String(base._version));
    const data = JSON.stringify(userCommentPostRequest);
    const result = fetch(`${base.serviceUrl}/user-comments`, {
      headers,
      method: 'POST',
      body: data,
      credentials: 'include',
    })
      .then(response =>
        response.text().then(
          text => {
            if (response.ok) {
              return {
                type: 'success',
                id: +JSON.parse(text).id
              };
            } else if (response.status === 400) {
              return {
                type: 'validation-error',
                errors: JSON.parse(text)
              };
            } else {
              return {
                type: 'internal-error',
                error: text
              }
            }
          }
        )
      ) as Promise<UserCommentPostResponseData>;

    return result;
  }

  function deleteUserComment(commentId: number): Promise<void> {
    return base._fetchJson<void>('delete', `/user-comments/${commentId}`);
  }

  // return the new attachment id
  function postUserCommentAttachedFile(commentId: number, { file, description }: UserCommentAttachedFileSpec): Promise<StandardWdkPostResponse> {
    if (file === null) {
      return Promise.reject(`Tried to post an empty attachment to comment with id ${commentId}`);
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('file', file, file.name);

    return fetch(
      `${base.serviceUrl}/user-comments/${commentId}/attachments`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData
      }
    ).then(response => response.json());
  }

  function deleteUserCommentAttachedFile(commentId: number, attachmentId: number): Promise<void> {
    return base._fetchJson<void>('delete', `/user-comments/${commentId}/attachments/${attachmentId}`);
  }

  return {
    getUserComment,
    getPubmedPreview,
    getUserComments,
    getUserCommentCategories,
    postUserComment,
    deleteUserComment,
    postUserCommentAttachedFile,
    deleteUserCommentAttachedFile
  }
}    