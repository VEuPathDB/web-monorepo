import {
    openUserCommentForm,
    fulfillUserComment,
    updateFormFields,
    requestPubmedPreview,
    fulfillPubmedPreview,
    closePubmedPreview,
    removeAttachedFile,
    addFileToAttach,
    removeFileToAttach,
    requestSubmitComment,
    fulfillSubmitComment,
    requestUpdateAttachedFiles,
    fulfillUpdateAttachedFiles,
    closeUserCommentForm,
    modifyFileToAttach,
    changePubmedIdSearchQuery
} from 'wdk-client/Actions/UserCommentFormActions';
import { UserCommentPostRequest, UserCommentAttachedFileSpec, KeyedUserCommentAttachedFileSpec, UserCommentAttachedFile, PubmedPreview, UserCommentGetResponse } from "wdk-client/Utils/WdkUser";
import {StandardWdkPostResponse} from "wdk-client/Utils/WdkService";
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { combineEpics, StateObservable } from 'redux-observable';
import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { allDataLoaded } from 'wdk-client/Actions/StaticDataActions';
import { RootState } from 'wdk-client/Core/State/Types';

export const key = 'userCommentForm';

const openUCF = openUserCommentForm;
const ATTACHED_FILES_KEY = 'attachedFiles';

export type UserCommentFormState = {
    userCommentPostRequest?: UserCommentPostRequest; // will include previous comment id if editing
    pubmedPreview?: PubmedPreview;
    showPubmedPreview: boolean;
    [ATTACHED_FILES_KEY]: UserCommentAttachedFile[];
    attachedFilesToRemove: number[];  // attachment IDs
    attachedFileSpecsToAdd: KeyedUserCommentAttachedFileSpec[];
    nextFileSpecId: number;
    projectIdLoaded: boolean;
    userCommentLoaded: boolean;
    submitting: boolean;
    completed: boolean;
    backendErrors: string[];
    pubmedIdSearchQuery: string;
};

type State = UserCommentFormState;

const initialState: State = {
    showPubmedPreview: false,
    attachedFiles: [],
    attachedFilesToRemove: [],
    attachedFileSpecsToAdd: [],
    nextFileSpecId: 0,
    projectIdLoaded: false,
    userCommentLoaded: false,
    submitting: false,
    completed: false,
    backendErrors: [],
    pubmedIdSearchQuery: ''
};

const getResponseToPostRequest = (userCommentGetResponse: UserCommentGetResponse): UserCommentPostRequest => ({
    genBankAccessions: userCommentGetResponse.genBankAccessions,
    categoryIds: [],
    content: userCommentGetResponse.content,
    digitalObjectIds: userCommentGetResponse.digitalObjectIds,
    externalDatabase: userCommentGetResponse.externalDatabase,
    headline: userCommentGetResponse.headline,
    organism: userCommentGetResponse.organism,
    previousCommentId: userCommentGetResponse.id,
    pubMedIds: userCommentGetResponse.pubMedRefs.map(({ id }) => id),
    relatedStableIds: userCommentGetResponse.relatedStableIds,
    target: userCommentGetResponse.target
});

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case allDataLoaded.type: {
            return { ...state, projectIdLoaded: true };
        }
        case fulfillUserComment.type: {
            return { 
                ...state,
                attachedFiles: action.payload.userComment.editMode 
                    ? action.payload.userComment.formValues.attachments.map(({ id, name, description }) => ({ id, name, description }))
                    : [], 
                userCommentPostRequest: action.payload.userComment.editMode
                    ? getResponseToPostRequest(action.payload.userComment.formValues)
                    : action.payload.userComment.formValues,
                userCommentLoaded: true
            };
        } case updateFormFields.type: {
            return { ...state, userCommentPostRequest: { ...state.userCommentPostRequest, ...action.payload.newFormFields } };
        } case requestPubmedPreview.type: {
            return { ...state, showPubmedPreview: true, pubmedPreview: undefined };
         } case fulfillPubmedPreview.type: {
            return { ...state, pubmedPreview: action.payload.pubmedPreview };
        } case closePubmedPreview.type: {
            return { ...state, showPubmedPreview: false, pubmedPreview: undefined };
        } case changePubmedIdSearchQuery.type: { 
            return { ...state, pubmedIdSearchQuery: action.payload.newQuery }
        } case removeAttachedFile.type: {
            return { 
                ...state, 
                attachedFilesToRemove: [...state.attachedFilesToRemove, action.payload.attachmentId],
                attachedFiles: state.attachedFiles.filter(attachedFile => attachedFile.id !== action.payload.attachmentId)
            };
        } case addFileToAttach.type: {
            return { 
                ...state, 
                nextFileSpecId: state.nextFileSpecId + 1,
                attachedFileSpecsToAdd: [
                    ...state.attachedFileSpecsToAdd, 
                    {
                        ...action.payload.fileSpecToAttach,
                        id: state.nextFileSpecId
                    }
                ] 
            };
        }
        case modifyFileToAttach.type: {
            return {
                ...state,
                attachedFileSpecsToAdd: [
                    ...state.attachedFileSpecsToAdd.slice(0, action.payload.index),
                    {
                        ...state.attachedFileSpecsToAdd[action.payload.index],
                        ...action.payload.newFileSpec
                    },
                    ...state.attachedFileSpecsToAdd.slice(action.payload.index + 1)
                ]
            }
        }
        case removeFileToAttach.type: {
            return { 
                ...state, 
                attachedFileSpecsToAdd: [
                    ...state.attachedFileSpecsToAdd.slice(0, action.payload.index),
                    ...state.attachedFileSpecsToAdd.slice(action.payload.index + 1),
                ]
            };
        }
        case requestSubmitComment.type: {
            return {
                ...state,
                submitting: true
            }
        }
        case fulfillSubmitComment.type: {
            return {
                ...state,
                submitting: false,
                completed: true
            }
        }
        default: {
            return state;
        }
    }
}

async function getFulfillUserComment([openAction]: [InferAction<typeof openUCF>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillUserComment>> {
    if (openAction.payload.isNew) return fulfillUserComment({ editMode: false, formValues: openAction.payload.initialValues });
    return fulfillUserComment({ editMode: true, formValues: await wdkService.getUserComment(openAction.payload.commentId) });
}

async function getFulfillPubmedPreview([requestAction]: [InferAction<typeof requestPubmedPreview>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPubmedPreview>> {
     return fulfillPubmedPreview( requestAction.payload.pubMedIds,  await wdkService.getPubmedPreview(requestAction.payload.pubMedIds));
}

function isPubmedPreviewCoherent([requestAction]: [InferAction<typeof requestPubmedPreview>], state: State ) {   
    return (
        state.userCommentPostRequest !== undefined &&
        state.userCommentPostRequest.pubMedIds !== undefined &&
        true // TODO: Figure out why this coherence condition is bonked
    );
}

async function getFulfillSubmitComment([requestAction]: [ InferAction<typeof requestSubmitComment>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSubmitComment>> {
    let response: StandardWdkPostResponse =  await wdkService.postUserComment(requestAction.payload.userCommentPostRequest);
    return fulfillSubmitComment(requestAction.payload.userCommentPostRequest, response.id);
}

function isFulfillSubmitCommentCoherent([requestAction]: [InferAction<typeof requestSubmitComment>], state: State ) {
    return (
        state.userCommentPostRequest === undefined ||
        state.userCommentPostRequest.previousCommentId === undefined ||
        state.userCommentPostRequest.previousCommentId === requestAction.payload.userCommentPostRequest.previousCommentId
    );
}

async function getRequestUpdateAttachedFiles([fulfillSubmitCommentAction]: [ InferAction<typeof fulfillSubmitComment>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestUpdateAttachedFiles>> {
    return requestUpdateAttachedFiles(fulfillSubmitCommentAction.payload.userCommentId, state$.value.userCommentForm.attachedFileSpecsToAdd, state$.value.userCommentForm.attachedFilesToRemove);
}

async function getFulfillUpdateAttachedFiles([fulfillSubmitCommentAction, requestUpdateAttachedFilesAction]: [ InferAction<typeof fulfillSubmitComment>, InferAction<typeof requestUpdateAttachedFiles>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillUpdateAttachedFiles>> {
    let commentId = requestUpdateAttachedFilesAction.payload.userCommentId;
    let fileIdsToRemove: number[] = requestUpdateAttachedFilesAction.payload.fileIdsToRemove;
    let filesToAttach: UserCommentAttachedFileSpec[] = requestUpdateAttachedFilesAction.payload.filesToAttach;

    await Promise.all(
        fileIdsToRemove.map(attachmentId => wdkService.deleteUserCommentAttachedFile(commentId, attachmentId))
    );

    await Promise.all(
        filesToAttach.map(attachment => wdkService.postUserCommentAttachedFile(commentId, attachment))
    );

    return fulfillUpdateAttachedFiles(requestUpdateAttachedFilesAction.payload.userCommentId, requestUpdateAttachedFilesAction.payload.filesToAttach, requestUpdateAttachedFilesAction.payload.fileIdsToRemove);
}

function isFulfillUpdateAttachedCoherent([fulfillSubmitCommentAction, requestUpdateAttachedFilesAction]: [ InferAction<typeof fulfillSubmitComment>, InferAction<typeof requestUpdateAttachedFiles>], state: State ) {
    return (
        fulfillSubmitCommentAction.payload.userCommentId == requestUpdateAttachedFilesAction.payload.userCommentId
    );
}

export const observe =
    takeEpicInWindow(
        openUCF,
        closeUserCommentForm,
        combineEpics(
            mrate([openUCF], getFulfillUserComment),
            mrate([requestPubmedPreview ], getFulfillPubmedPreview,
                { areActionsCoherent: isPubmedPreviewCoherent }),
            mrate([requestSubmitComment], getFulfillSubmitComment, 
                { areActionsCoherent: isFulfillSubmitCommentCoherent }),
            mrate([fulfillSubmitComment], getRequestUpdateAttachedFiles),
            mrate([fulfillSubmitComment, requestUpdateAttachedFiles], getFulfillUpdateAttachedFiles, 
                { areActionsCoherent: isFulfillUpdateAttachedCoherent }),  
            
        ),
    );

