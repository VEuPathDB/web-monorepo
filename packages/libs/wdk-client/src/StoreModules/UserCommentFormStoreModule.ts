import {
    openUserCommentForm,
    fulfillUserComment,
    updateFormFields,
    requestPubmedPreview,
    fulfillPubmedPreview,
    closePubmedPreview,
    requestLocalFile,
    fulfillLocalFile,
    removeAttachedFile,
    addFileToAttach,
    removeFileToAttach,
    requestSubmitComment,
    fulfillSubmitComment,
    requestUpdateAttachedFiles,
    fulfillUpdateAttachedFiles,
    closeUserCommentForm
} from 'wdk-client/Actions/UserCommentFormActions';
import { UserCommentPostRequest, UserCommentAttachedFileSpec, KeyedUserCommentAttachedFileSpec, UserCommentAttachedFile, PubmedPreview } from "wdk-client/Utils/WdkUser";
import {StandardWdkPostResponse} from "wdk-client/Utils/WdkService";
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { combineEpics, StateObservable } from 'redux-observable';
import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { omit } from 'lodash';
import { allDataLoaded } from 'wdk-client/Actions/StaticDataActions';

export const key = 'userCommentForm';

const openUCF = openUserCommentForm;
const ATTACHED_FILES_KEY = 'attachedFiles';

export type UserCommentFormState = {
    userCommentPostRequest?: UserCommentPostRequest; // will include previous comment id if editing
    pubmedPreview?: PubmedPreview;
    showPubmedPreview: boolean;
    [ATTACHED_FILES_KEY]?: UserCommentAttachedFile[];
    attachedFilesToRemove: number[];  // attachment IDs
    attachedFileSpecsToAdd: KeyedUserCommentAttachedFileSpec[];
    nextFileSpecId: number;
    projectIdLoaded: boolean;
    userCommentLoaded: boolean;
    submitting: boolean;
};

type State = UserCommentFormState;

const initialState: State = {
    showPubmedPreview: false,
    attachedFilesToRemove: [],
    attachedFileSpecsToAdd: [],
    nextFileSpecId: 0,
    projectIdLoaded: false,
    userCommentLoaded: false,
    submitting: false
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case allDataLoaded.type: {
            return { ...state, projectIdLoaded: true };
        }
        case fulfillUserComment.type: {
            return { 
                ...state, 
                attachedFiles: action.payload.userComment.attachedFiles, 
                userCommentPostRequest: omit(action.payload.userComment, [ATTACHED_FILES_KEY]),
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
        } case removeAttachedFile.type: {
            return { ...state, attachedFilesToRemove: [...state.attachedFilesToRemove, action.payload.attachmentId] };
        } case addFileToAttach.type: {
            return { 
                ...state, 
                nextFileSpecId: state.nextFileSpecId + 1,
                attachedFileSpecsToAdd: [
                    ...state.attachedFileSpecsToAdd, 
                    {
                        ...action.payload.fileToAttach,
                        id: state.nextFileSpecId
                    }
                ] 
            };
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
                submitting: false
            }
        }
        default: {
            return state;
        }
    }
}

async function getFulfillUserComment([openAction]: [InferAction<typeof openUCF>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillUserComment>> {
    if (openAction.payload.isNew) return fulfillUserComment(openAction.payload.initialValues);
    return  fulfillUserComment(await wdkService.getUserComment(openAction.payload.commentId));
}

async function getFulfillPubmedPreview([requestAction]: [InferAction<typeof requestPubmedPreview>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPubmedPreview>> {
     return fulfillPubmedPreview( requestAction.payload.pubmedIds,  await wdkService.getPubmedPreview(requestAction.payload.pubmedIds));
}

function isPubmedPreviewCoherent([requestAction]: [InferAction<typeof requestPubmedPreview>], state: State ) {
    return (
        state.userCommentPostRequest !== undefined &&
        state.userCommentPostRequest.pubmedIds !== undefined &&
        state.userCommentPostRequest.pubmedIds.toString()  == requestAction.payload.pubmedIds.toString()
    );
}

async function getFulfillSubmitComment([requestAction]: [ InferAction<typeof requestSubmitComment>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSubmitComment>> {
    let response: StandardWdkPostResponse =  await wdkService.postUserComment(requestAction.payload.userCommentPostRequest);
    return fulfillSubmitComment(requestAction.payload.userCommentPostRequest, response.id);
}

function isFulfillSubmitCommentCoherent([requestAction]: [InferAction<typeof requestSubmitComment>], state: State ) {
    return (
        state.userCommentPostRequest === undefined ||
        state.userCommentPostRequest.id === undefined ||
        state.userCommentPostRequest.id === requestAction.payload.userCommentPostRequest.id
    );
}

async function getRequestUpdateAttachedFiles([fulfillSubmitCommentAction]: [ InferAction<typeof fulfillSubmitComment>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestUpdateAttachedFiles>> {
    return requestUpdateAttachedFiles(fulfillSubmitCommentAction.payload.userCommentId, state$.value.attachedFileSpecsToAdd, state$.value.attachedFilesToRemove);
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

