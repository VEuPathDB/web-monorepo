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
    changePubmedIdSearchQuery,
    updateRawFormFields,
    reportBackendValidationErrors,
    reportInternalError
} from '../actions/UserCommentFormActions';
import {
    RootState,
    UserCommentPostRequest,
    UserCommentAttachedFileSpec,
    KeyedUserCommentAttachedFileSpec,
    UserCommentAttachedFile,
    PubmedPreview,
    UserCommentGetResponse,
    UserCommentRawFormFields
} from "../types/userCommentTypes";
import { InferAction } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { Action } from '../actions/userCommentActions';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { combineEpics, StateObservable } from 'redux-observable';
import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { allDataLoaded } from '@veupathdb/wdk-client/lib/Actions/StaticDataActions';
import { get } from 'lodash';
import { isGenomicsService } from '../wrapWdkService';

export const key = 'userCommentForm';

const openUCF = openUserCommentForm;
const ATTACHED_FILES_KEY = 'attachedFiles';
const USER_COMMENTS_ERR_MSG = 'Tried to use a UserComments method via a misconfigured GenomicsService';

export type UserCommentFormState = {
    userCommentPostRequest?: UserCommentPostRequest; // will include previous comment id if editing
    userCommentRawFields: UserCommentRawFormFields;
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
    backendValidationErrors: string[];
    internalError: string;
    pubmedIdSearchQuery: string;
    categoryChoices: CategoryChoice[];
};

export type CategoryChoice = {
    display: string;
    value: string;
};

type State = UserCommentFormState;

const initialRawFields = {
    coordinateType: 'genomef',
    ranges: '',
    pubMedIds: '',
    digitalObjectIds: '',
    genBankAccessions: '',
    relatedStableIds: ''
};

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
    backendValidationErrors: [],
    internalError: '',
    pubmedIdSearchQuery: '',
    categoryChoices: [],
    userCommentRawFields: initialRawFields
};

const getResponseToPostRequest = (userCommentGetResponse: UserCommentGetResponse, categoryChoices: CategoryChoice[]): UserCommentPostRequest => ({
    genBankAccessions: userCommentGetResponse.genBankAccessions,
    categoryIds: categoryChoices
        .filter(({ display }) => userCommentGetResponse.categories.includes(display))
        .map(({ value }) => parseInt(value)),
    content: userCommentGetResponse.content,
    digitalObjectIds: userCommentGetResponse.digitalObjectIds,
    externalDatabase: userCommentGetResponse.externalDatabase,
    headline: userCommentGetResponse.headline,
    location: userCommentGetResponse.location,
    organism: userCommentGetResponse.organism,
    previousCommentId: userCommentGetResponse.id,
    pubMedIds: userCommentGetResponse.pubMedRefs.map(({ id }) => id),
    relatedStableIds: userCommentGetResponse.relatedStableIds,
    target: userCommentGetResponse.target
});

const getResponseToRawFormFields = (userCommentGetResponse: UserCommentGetResponse): UserCommentRawFormFields => ({
    coordinateType: get(userCommentGetResponse, 'location.reverse', false)
        ? 'genomer'
        : 'genomef',
    ranges: get(userCommentGetResponse, 'location.ranges', [])
        .map(({ start, end }: { start: number, end: number }) => `${start}-${end}`)
        .join(', '),
    pubMedIds: userCommentGetResponse.pubMedRefs.map(({ id }) => id).join(', '),
    digitalObjectIds: userCommentGetResponse.digitalObjectIds.join(', '),
    genBankAccessions: userCommentGetResponse.genBankAccessions.join(', '),
    relatedStableIds: userCommentGetResponse.relatedStableIds.join(', ')
});

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case openUCF.type: {
            return {
                ...state,
                submitting: false,
                completed: false,
                backendValidationErrors: [],
                internalError: ''
            };
        }
        case allDataLoaded.type: {
            return { ...state, projectIdLoaded: true };
        }
        case fulfillUserComment.type: {
            return { 
                ...state,
                attachedFiles: action.payload.userComment.editMode 
                    // FIXME: Confirm that we don't need to make a shallow copy of each "attachment"
                    ? action.payload.userComment.formValues.attachments.map(attachment => ({ ...attachment }))
                    : [], 
                userCommentPostRequest: action.payload.userComment.editMode
                    ? getResponseToPostRequest(
                        action.payload.userComment.formValues,
                        action.payload.userComment.categoryIdOptions
                    )
                    : action.payload.userComment.formValues,
                userCommentRawFields: action.payload.userComment.editMode
                    ? getResponseToRawFormFields(action.payload.userComment.formValues)
                    : {
                        ...initialRawFields,
                        ...action.payload.userComment.initialRawFields
                    },
                categoryChoices: action.payload.userComment.categoryIdOptions,
                userCommentLoaded: true
            };
        } case updateFormFields.type: {
            return { ...state, userCommentPostRequest: { ...state.userCommentPostRequest, ...action.payload.newFormFields } };
        } case updateRawFormFields.type: {
            return { ...state, userCommentRawFields: { ...state.userCommentRawFields, ...action.payload.newRawFormFields } };
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
                completed: true,
                backendValidationErrors: [],
                internalError: ''
            };
        }
        case reportBackendValidationErrors.type: {
            return {
                ...state,
                submitting: false,
                completed: false,
                backendValidationErrors: action.payload.backendValidationErrors,
                internalError: ''
            };
        }
        case reportInternalError.type: {
            return {
                ...state,
                submitting: false,
                completed: false,
                backendValidationErrors: [],
                internalError: action.payload.internalError
            };
        }
        default: {
            return state;
        }
    }
}

async function getFulfillUserComment([openAction]: [InferAction<typeof openUCF>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillUserComment>> {
    if (!isGenomicsService(wdkService)) {
        throw new Error(USER_COMMENTS_ERR_MSG);
    }
    if (openAction.payload.isNew) {
        return fulfillUserComment({ 
            editMode: false, 
            formValues: openAction.payload.initialValues, 
            initialRawFields: openAction.payload.initialRawFields,
            categoryIdOptions: await wdkService.getUserCommentCategories(
                get(openAction.payload.initialValues, 'target.type', '')
            )
        });
    } else {
        const formValues = await wdkService.getUserComment(openAction.payload.commentId);
        const categoryIdOptions = await wdkService.getUserCommentCategories(formValues.target.type);

        return fulfillUserComment({ 
            editMode: true, 
            formValues,
            categoryIdOptions
        });
    }
}

async function getFulfillPubmedPreview([requestAction]: [InferAction<typeof requestPubmedPreview>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPubmedPreview>> {
    if (!isGenomicsService(wdkService)) {
        throw new Error(USER_COMMENTS_ERR_MSG);
    } 
    return fulfillPubmedPreview(requestAction.payload.pubMedIds, await wdkService.getPubmedPreview(requestAction.payload.pubMedIds));
}

async function getFulfillSubmitComment([requestAction]: [ InferAction<typeof requestSubmitComment>], state$: StateObservable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSubmitComment | typeof reportBackendValidationErrors | typeof reportInternalError>> {
    if (!isGenomicsService(wdkService)) {
        throw new Error(USER_COMMENTS_ERR_MSG);
    }
    const responseData = await wdkService.postUserComment(requestAction.payload.userCommentPostRequest);

    if (responseData.type === 'success') {
        return fulfillSubmitComment(requestAction.payload.userCommentPostRequest, responseData.id);    
    } else if (responseData.type === 'validation-error') {
        return reportBackendValidationErrors(responseData.errors);
    } else {
        return reportInternalError(responseData.error);
    }
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
    if (!isGenomicsService(wdkService)) {
        throw new Error(USER_COMMENTS_ERR_MSG);
    }
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
      {
        startActionCreator: openUCF,
        endActionCreator: closeUserCommentForm
      },
        combineEpics(
            mrate([openUCF], getFulfillUserComment),
            mrate([requestPubmedPreview ], getFulfillPubmedPreview),
            mrate([requestSubmitComment], getFulfillSubmitComment, 
                { areActionsCoherent: isFulfillSubmitCommentCoherent }),
            mrate([fulfillSubmitComment], getRequestUpdateAttachedFiles),
            mrate([fulfillSubmitComment, requestUpdateAttachedFiles], getFulfillUpdateAttachedFiles, 
                { areActionsCoherent: isFulfillUpdateAttachedCoherent }),  
            
        ),
    );

