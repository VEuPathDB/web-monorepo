import { ServiceBaseClass, CLIENT_WDK_VERSION_HEADER, StandardWdkPostResponse } from 'wdk-client/Service/ServiceBase';
import {  UserCommentPostRequest, UserCommentAttachedFileSpec } from 'wdk-client/Utils/WdkUser';

// TODO: this should be defined here or in wdk model or someplace, and imported in the store module
import { CategoryChoice } from 'wdk-client/StoreModules/UserCommentFormStoreModule';


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


export default (base: ServiceBaseClass) => class UserCommentsService extends base {

    getUserCommentCategories(targetType: string): Promise<CategoryChoice[]> {
        return this._fetchJson<{ name: string, value: number }[]>(
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
      postUserComment(userCommentPostRequest: UserCommentPostRequest) : Promise<UserCommentPostResponseData> {
        const data = JSON.stringify(userCommentPostRequest);
        const result = fetch(`${this.serviceUrl}/user-comments`, {
          method: 'POST',
          body: data,
          credentials: 'include',
          headers: new Headers(Object.assign({
            'Content-Type': 'application/json'
          }, this._version && {
            [CLIENT_WDK_VERSION_HEADER]: this._version
          }))
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
    
      deleteUserComment(commentId: number) :Promise<void> {
        return this._fetchJson<void>('delete', `/user-comments/${commentId}`);
      }
    
      // return the new attachment id
      postUserCommentAttachedFile(commentId: number, { file, description }: UserCommentAttachedFileSpec) : Promise<StandardWdkPostResponse> {
        if (file === null) {
          return Promise.reject(`Tried to post an empty attachment to comment with id ${commentId}`);
        }
    
        const formData = new FormData();
        formData.append('description', description);
        formData.append('file', file, file.name);
    
        return fetch(
          `${this.serviceUrl}/user-comments/${commentId}/attachments`, 
          {
            method: 'POST',
            credentials: 'include',
            body: formData
          }
        ).then(response => response.json());
      }
    
      deleteUserCommentAttachedFile(commentId: number, attachmentId: number) :Promise<void> {
        return this._fetchJson<void>('delete', `/user-comments/${commentId}/attachments/${attachmentId}`);
      }
     
}    