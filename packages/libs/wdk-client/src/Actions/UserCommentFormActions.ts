import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { UserComment, UserCommentPostRequest, UserCommentFormFields, UserCommentAttachedFileSpec, UserCommentAttachedFile, PubmedPreview } from "wdk-client/Utils/WdkUser";

// we open the form in one of two modes:
//  new comment:  we receive some initial comment values from the URL used to call the route
//  edit a comment:  we receive the previous comment ID, and can get all the values from that comment
interface OpenNewCommentPayload {
    isNew: true;
    initialValues: UserCommentPostRequest;
  }
  
  interface OpenExistingCommentPayload {
    isNew: false;
    commentId: number;
  }
  
  type OpenCommentPayload =
    | OpenNewCommentPayload
    | OpenExistingCommentPayload;
  
/*
if creating a comment, this will include a partially filled in UserCommentPostRequest, 
containing the info provided on the route.  (This is info that the Gene page has handy, 
and is needed to ultimately post the request).
if editing a comment, this will include the comment id of the comment we're editing.  (it will
become the previousCommentId in the new comment we submit holding the edits)
    */
export const openUserCommentForm = makeActionCreator(
    'user-comment/open',
    (idOrInitValues: number | UserCommentPostRequest): OpenCommentPayload =>
        typeof idOrInitValues === 'number'
            ? { isNew: false, commentId: idOrInitValues }
            : { isNew: true, initialValues: idOrInitValues },
);

export const closeUserCommentForm = makeActionCreator (
    'userCommentForm/close',
    () => ({})
);

// provide an initialized user comment to show in the form.  in create mode, it will contain
// values from the route.  in edit mode, from the previous comment
export const fulfillUserComment = makeActionCreator (
    'userCommentForm/fulfillPreviousUserComment',
    (userComment: UserComment ) => ({ userComment })
);

// the user has updated one or more fields in the form.  the state in this action will replace
// the existing form state
export const updateFormFields  = makeActionCreator (
    'userCommentForm/updateFields',
    (newFormFields: UserCommentFormFields ) => ({ newFormFields })
);

// the user wants to open the pubmed preview.   the pubmed IDs to preview will be in the state 
export const requestPubmedPreview = makeActionCreator (
    'userCommentForm/openPubmedIdPreview',
    (pubmedIds: number[]) => ({pubmedIds })
);

// the user wants to close the pubmed preview
export const fulfillPubmedPreview = makeActionCreator (
    'userCommentForm/fulfillPubmedIdPreview',
    (pubmedIds: number[], pubmedPreview: PubmedPreview) => ({pubmedIds, pubmedPreview })
);

export const closePubmedPreview = makeActionCreator (
    'userCommentForm/closePubmedIdPreview',
    (userCommentId: number) => ({ userCommentId})
);

// the user has clicked the Browse Files button
export const requestLocalFile = makeActionCreator (
    'userCommentForm/requestLocalFile',
    () => ({ })
);

// the user has selected a local file
export const fulfillLocalFile = makeActionCreator (
    'userCommentForm/fulfillLocalFile',
    (filePath: string) => ({ filePath})
);

// (edit only) user wants to remove a file already attached (on the server) to the comment they are editing.  this just updates state in store, not the backend.
export const removeAttachedFile = makeActionCreator (
    'userCommentForm/removeAttachedFile',
    (userCommentId: number, attachmentId: number) => ({userCommentId, attachmentId })
);

// (edit and create) remove a file from the list of those to be attached (backend) after the comment
// is submitted.  this only updates state in store, not the backend.
// index is a 0-based index into the list maintained in state
export const removeFileToAttach  = makeActionCreator (
    'userCommentForm/removeFileToAttach',
    (userCommentId: number, index: number) => ({userCommentId, index })
);

// (edit and create) add a file to the list of those to be attached (backend) after the comment is submitted.  this only updates state in store, not the backend
export const addFileToAttach  = makeActionCreator (
    'userCommentForm/addFileToAttach',
    (userCommentId: number, fileToAttach: UserCommentAttachedFileSpec) => ({userCommentId, fileToAttach })
);


export const requestSubmitComment = makeActionCreator (
    'userCommentForm/requestSubmitComment',
    (userCommentPostRequest: UserCommentPostRequest) => ({userCommentPostRequest })
);

export const fulfillSubmitComment = makeActionCreator (
    'userCommentForm/fulfillSubmitComment',
    (userCommentPostRequest: UserCommentPostRequest, userCommentId: number) => ({userCommentPostRequest, userCommentId })
);

// after the comment is submitted, attach (edit and create) and remove files (edit only) as specified
export const requestUpdateAttachedFiles = makeActionCreator (
    'userCommentForm/requestAttachFiles',
    (userCommentId: number, filesToAttach: UserCommentAttachedFileSpec[], fileIdsToRemove: number[]) => ({ userCommentId, filesToAttach, fileIdsToRemove })
);

// attaching of these files is complete.  TODO: indicate errors
export const fulfillUpdateAttachedFiles = makeActionCreator (
    'userCommentForm/fulfillAttachFiles',
    (userCommentId: number, filesToAttach: UserCommentAttachedFileSpec[], fileIdsToRemove: number[]) => ({ userCommentId, filesToAttach, fileIdsToRemove })
);

export type Action =
    | InferAction<typeof openUserCommentForm>
    | InferAction<typeof closeUserCommentForm>
    | InferAction<typeof fulfillUserComment>
    | InferAction<typeof updateFormFields>
    | InferAction<typeof requestPubmedPreview>
    | InferAction<typeof fulfillPubmedPreview>
    | InferAction<typeof closePubmedPreview>
    | InferAction<typeof requestLocalFile>
    | InferAction<typeof fulfillLocalFile>
    | InferAction<typeof removeAttachedFile>
    | InferAction<typeof addFileToAttach>
    | InferAction<typeof removeFileToAttach>
    | InferAction<typeof requestSubmitComment>
    | InferAction<typeof fulfillSubmitComment>
    | InferAction<typeof requestUpdateAttachedFiles>
    | InferAction<typeof fulfillUpdateAttachedFiles>


