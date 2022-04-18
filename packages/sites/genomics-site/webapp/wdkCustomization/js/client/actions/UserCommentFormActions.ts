import { makeActionCreator, InferAction } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import {
    UserCommentPostRequest,
    UserCommentFormFields,
    UserCommentAttachedFileSpec,
    PubmedPreview,
    UserCommentGetResponse,
    UserCommentRawFormFields
} from "../types/userCommentTypes";
import { CategoryChoice } from '../storeModules/UserCommentFormStoreModule';

// we open the form in one of two modes:
//  new comment:  we receive some initial comment values from the URL used to call the route
//  edit a comment:  we receive the previous comment ID, and can get all the values from that comment
interface OpenNewCommentPayload {
    isNew: true;
    initialValues: UserCommentPostRequest;
    initialRawFields: Partial<UserCommentRawFormFields>;
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
    (idOrInitValues: number | UserCommentPostRequest, initialRawFields: Partial<UserCommentRawFormFields>): OpenCommentPayload =>
        typeof idOrInitValues === 'number'
            ? { isNew: false, commentId: idOrInitValues }
            : { isNew: true, initialValues: idOrInitValues, initialRawFields },
);

export const closeUserCommentForm = makeActionCreator (
    'userCommentForm/close',
    () => ({})
);

// provide an initialized user comment to show in the form.  in create mode, it will contain
// values from the route.  in edit mode, from the previous comment
export const fulfillUserComment = makeActionCreator (
    'userCommentForm/fulfillPreviousUserComment',
    (userComment: 
        | { 
            editMode: false, 
            formValues: UserCommentPostRequest, 
            initialRawFields: Partial<UserCommentRawFormFields>,
            categoryIdOptions: CategoryChoice[]
        } 
        | { 
            editMode: true, 
            formValues: UserCommentGetResponse,
            categoryIdOptions: CategoryChoice[]
        }
    ) => 
        ({ userComment })
);

// the user has updated one or more fields in the form.  the state in this action will replace
// the existing form state
export const updateFormFields  = makeActionCreator (
    'userCommentForm/updateFields',
    (newFormFields: UserCommentFormFields) => ({ newFormFields })
);

// the user has updated one or more multivalued textbox fields in the form.  the state in this action will replace
// the existing form state
export const updateRawFormFields  = makeActionCreator (
    'userCommentForm/updateRawFields',
    (newRawFormFields: Partial<UserCommentRawFormFields>) => ({ newRawFormFields })
);

// the user wants to open the pubmed preview.   the pubmed IDs to preview will be in the state 
export const requestPubmedPreview = makeActionCreator (
    'userCommentForm/openPubmedIdPreview',
    (pubMedIds: number[]) => ({ pubMedIds })
);

export const fulfillPubmedPreview = makeActionCreator (
    'userCommentForm/fulfillPubmedIdPreview',
    (pubMedIds: number[], pubmedPreview: PubmedPreview) => ({pubMedIds, pubmedPreview })
);

// the user wants to close the pubmed preview
export const closePubmedPreview = makeActionCreator (
    'userCommentForm/closePubmedIdPreview',
    () => ({ })
);

// the user edits their pubmed id search query
export const changePubmedIdSearchQuery = makeActionCreator (
    'userCommentForm/changePubmedIdSearchQuery',
    (newQuery: string) => ({ newQuery })
);

// (edit only) user wants to remove a file already attached (on the server) to the comment they are editing.  this just updates state in store, not the backend.
export const removeAttachedFile = makeActionCreator (
    'userCommentForm/removeAttachedFile',
    (attachmentId: number) => ({ attachmentId })
);

// (edit and create) remove a file from the list of those to be attached (backend) after the comment
// is submitted.  this only updates state in store, not the backend.
// index is a 0-based index into the list maintained in state
export const removeFileToAttach  = makeActionCreator (
    'userCommentForm/removeFileToAttach',
    (index: number) => ({ index })
);

// (edit and create) modify a file from the list of those to be attached (backend) after the comment
// is submitted.  this only updates state in store, not the backend.
// index is a 0-based index into the list maintained in state
export const modifyFileToAttach  = makeActionCreator (
    'userCommentForm/modifyFileToAttach',
    (newFileSpec: Partial<UserCommentAttachedFileSpec>, index: number) => ({ newFileSpec, index })
);

// (edit and create) add a file to the list of those to be attached (backend) after the comment is submitted.  this only updates state in store, not the backend
export const addFileToAttach  = makeActionCreator (
    'userCommentForm/addFileToAttach',
    (fileSpecToAttach: UserCommentAttachedFileSpec) => ({ fileSpecToAttach })
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

export const reportBackendValidationErrors = makeActionCreator (
    'userCommentForm/reportBackendValidationErrors',
    (backendValidationErrors: string[]) => ({ backendValidationErrors })
);

export const reportInternalError = makeActionCreator (
    'userCommentForm/reportInternalError',
    (internalError: string) => ({ internalError })
)

export type Action =
    | InferAction<typeof openUserCommentForm>
    | InferAction<typeof closeUserCommentForm>
    | InferAction<typeof fulfillUserComment>
    | InferAction<typeof updateFormFields>
    | InferAction<typeof updateRawFormFields>
    | InferAction<typeof requestPubmedPreview>
    | InferAction<typeof fulfillPubmedPreview>
    | InferAction<typeof closePubmedPreview>
    | InferAction<typeof changePubmedIdSearchQuery>
    | InferAction<typeof removeAttachedFile>
    | InferAction<typeof addFileToAttach>
    | InferAction<typeof modifyFileToAttach>
    | InferAction<typeof removeFileToAttach>
    | InferAction<typeof requestSubmitComment>
    | InferAction<typeof fulfillSubmitComment>
    | InferAction<typeof requestUpdateAttachedFiles>
    | InferAction<typeof fulfillUpdateAttachedFiles>
    | InferAction<typeof reportBackendValidationErrors>
    | InferAction<typeof reportInternalError>;
