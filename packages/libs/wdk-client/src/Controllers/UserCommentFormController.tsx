import React, { FormEvent, ReactNode, Fragment } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

import { CheckboxList, TextArea, TextBox, Link } from 'wdk-client/Components';
import { UserCommentFormView, UserCommentFormViewProps } from 'wdk-client/Views/UserCommentForm/UserCommentFormView';
import { get } from 'lodash';
import { GlobalData } from 'wdk-client/StoreModules/GlobalData';
import { openUserCommentForm, requestSubmitComment, updateFormFields, requestPubmedPreview, closePubmedPreview, addFileToAttach, removeFileToAttach, modifyFileToAttach, removeAttachedFile } from 'wdk-client/Actions/UserCommentFormActions';
import { UserCommentPostRequest, PubmedPreview, UserCommentQueryParams, UserCommentQueryStringParams, UserCommentAttachedFileSpec, UserCommentAttachedFile, KeyedUserCommentAttachedFileSpec } from 'wdk-client/Utils/WdkUser';
import { createSelector } from 'reselect';
import { UserCommentFormState } from 'wdk-client/StoreModules/UserCommentFormStoreModule';

import * as QueryString from 'querystring';
import { PubMedIdsField } from 'wdk-client/Views/UserCommentForm/PubmedIdField';
import { AttachmentsField } from 'wdk-client/Views/UserCommentForm/AttachmentsField';

type StateProps = {
  submitting: boolean;
  completed: boolean;
  title: ReactNode;
  buttonText: string;
  submission: UserCommentPostRequest;
  formLoaded: boolean;
  previewOpen: boolean;
  previewData?: PubmedPreview;
  attachedFiles: UserCommentAttachedFile[];
  attachedFileSpecsToAdd: KeyedUserCommentAttachedFileSpec[];
  permissionDenied: boolean;
  returnUrl: string;
  returnLinkText: string;
  queryParams: UserCommentQueryParams;
};

type DispatchProps = {
  updateFormField: (key: string) => (
    newValue: string | string[] | number[]
  ) => void;
  openAddComment: (request: UserCommentPostRequest) => void;
  openEditComment: (commentId: number) => void;
  removeAttachedFile: (attachmentId: number) => void;
  removeFileToAttach: (index: number) => void;
  modifyFileToAttach: (newFileSpec: Partial<UserCommentAttachedFileSpec>, index: number) => void;
  addFileToAttach: (newFileSpec: UserCommentAttachedFileSpec) => void;
  requestSubmitComment: (request: UserCommentPostRequest) => void;
  showPubmedPreview: (pubMedIds: string[]) => void;
  hidePubmedPreview: () => void;
};

// TODO: Move to routes.tsx once the new client plugin architecture has been merged
// into this branch
type OwnProps = {
  location: any
};

type MergedProps = UserCommentFormViewProps & {
  permissionDenied: boolean;
  formLoaded: boolean;
  openAddComment: (request: UserCommentPostRequest) => void;
  openEditComment: (commentId: number) => void;
  queryParams: UserCommentQueryParams;
};

type Props = MergedProps;

const userCommentForm = ({ userCommentForm }: RootState) => userCommentForm;
const globalData = ({ globalData }: RootState) => globalData;

const queryParams = (state: RootState, props: OwnProps) => parseQueryString(props.location.search.slice(1));

const userCommentPostRequest = createSelector<RootState, UserCommentFormState, UserCommentPostRequest>(
  userCommentForm,
  ({ userCommentPostRequest }: UserCommentFormState) => userCommentPostRequest || {},
)

const formLoaded = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ projectIdLoaded, userCommentLoaded }: UserCommentFormState) => (
    projectIdLoaded && userCommentLoaded
  )
);

const showPubmedPreview = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ showPubmedPreview }: UserCommentFormState) => showPubmedPreview
);

const pubmedPreview = createSelector<RootState, UserCommentFormState, PubmedPreview | undefined>(
  userCommentForm,
  ({ pubmedPreview }: UserCommentFormState) => pubmedPreview
);

const targetType = createSelector<RootState, UserCommentPostRequest, string>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) => get(userCommentPostRequest, 'target.type', '')
);

const targetId = createSelector<RootState, UserCommentPostRequest, string>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) => get(userCommentPostRequest, 'target.id', '')
);

const commentId = createSelector<RootState, UserCommentPostRequest, number | null>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) => userCommentPostRequest.previousCommentId || null
);

const submitting = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ submitting }: UserCommentFormState) => submitting
);

const completed = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ completed }: UserCommentFormState) => completed
);

const editing = createSelector<RootState, number | null, boolean>(
  commentId,
  (commentId: number | null) => commentId !== null
);

const projectId = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'siteConfig.projectId', '')
);

const isGuest = createSelector<RootState, GlobalData, boolean>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'user.isGuest', true)
);

const webAppUrl = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'siteConfig.webAppUrl', '')
);

const permissionDenied = createSelector<RootState, UserCommentFormState, boolean, boolean>(
  userCommentForm,
  isGuest,
  ({ projectIdLoaded }: UserCommentFormState, isGuest: boolean) => projectIdLoaded && isGuest
);

const title = createSelector(
  commentId,
  targetType,
  targetId,
  editing,
  projectId,
  queryParams,
  userCommentPostRequest,
  (
    commentId: number | null, 
    targetType: string, 
    targetId: string, 
    editing: boolean, 
    projectId: string, 
    { contig }: UserCommentQueryParams, 
    { 
      externalDatabase: { name, version } = { name: '', version: '' } 
    }: UserCommentPostRequest
  ) => {
    return (
      <Fragment>
        <h1>
          {
            editing
              ? `Edit comment ${commentId} ${targetId}`
              : `Add a comment to ${targetType} ${targetId}`
          }
        </h1>
        Please add only scientific comments to be displayed on the {targetType} page for {targetId}. 
        If you want to report a problem, use the <Link to={'/contact-us'} target="_blank">support page</Link>.

        <br />Your comments are appreciated.{' '}

        {
          projectId === 'TriTrypDB' && (
            'They will be forwarded to the Annotation Center for review and possibly included in future releases of the genome. '
          )
        }

        {
          projectId === 'CryptoDB' && (
            'They will be forwarded to the genome curators. '
          )
        }

        {
          targetType === 'gene' && (
            <Fragment>
              If this is a <b>new gene</b>, please also add a comment in the corresponding <a href={`/app/user-comments/add?stableId=${contig}&commentTargetId=genome&externaDbName=${name}&externalDbVersion=${version}`}>Genome Sequence</a> 
            </Fragment>
          )
        }

        {
          targetType === 'genome' && (
            'This form can be used for adding comments for a new gene. '
          )
        }
      </Fragment>
    )
  }
);

const returnUrl = createSelector<RootState, string, string, string, string, string>(
  targetType,
  targetId,
  projectId,
  webAppUrl,
  (targetType: string, targetId: string, projectId: string, webAppUrl: string) => {
    if (targetType === 'gene') {
      return `/app/record/gene/${targetId}`;
    }

    if (targetType === 'isolate') {
      return `${webAppUrl}/showRecord.do?name=IsolateRecordClasses.IsolateRecordClass&project_id=${projectId}&primary_key=${targetId}`;
    }

    return `${webAppUrl}/showRecord.do?name=SequenceRecordClasses.SequenceRecordClass&project_id=${projectId}&primary_key=${targetId}`;
  }
);

const returnLinkText = createSelector<RootState, string, string, string>(
  targetType,
  targetId,
  (targetType: string, targetId: string) => `Return to ${targetType} ${targetId} page`
);

const buttonText = createSelector<RootState, boolean, string>(
  editing,
  (editing: boolean) => editing
    ? 'Edit Comment'
    : 'Add Comment'
);

const attachedFiles = createSelector<RootState, UserCommentFormState, UserCommentAttachedFile[]>(
  userCommentForm,
  ({ attachedFiles }: UserCommentFormState) => attachedFiles || []
);

const attachedFileSpecsToAdd = createSelector<RootState, UserCommentFormState, KeyedUserCommentAttachedFileSpec[]>(
  userCommentForm,
  ({ attachedFileSpecsToAdd }: UserCommentFormState) => attachedFileSpecsToAdd
);

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  submitting: submitting(state),
  completed: completed(state),
  title: title(state, props),
  buttonText: buttonText(state),
  submission: userCommentPostRequest(state),
  formLoaded: formLoaded(state),
  previewOpen: showPubmedPreview(state),
  previewData: pubmedPreview(state),
  attachedFiles: attachedFiles(state),
  attachedFileSpecsToAdd: attachedFileSpecsToAdd(state),
  permissionDenied: permissionDenied(state),
  returnUrl: returnUrl(state),
  returnLinkText: returnLinkText(state),
  queryParams: queryParams(state, props)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateFormField: (key: string) => (
    newValue: string | string[] | number[]
  ) => dispatch(updateFormFields({
    [key]: newValue
  })),
  showPubmedPreview: (pubMedIds: string[]) => dispatch(
    requestPubmedPreview(
      pubMedIds.map(x => parseInt(x)).filter(x => x > 0)
    )
  ),
  hidePubmedPreview: () => dispatch(closePubmedPreview()),
  openAddComment: (request: UserCommentPostRequest) => dispatch(openUserCommentForm(request)),
  openEditComment: (commentId: number) => dispatch(openUserCommentForm(commentId)),
  requestSubmitComment: (request: UserCommentPostRequest) => dispatch(requestSubmitComment(request)),
  removeAttachedFile: (attachmentId: number) => dispatch(removeAttachedFile(attachmentId)),
  addFileToAttach: (newFileSpec: UserCommentAttachedFileSpec) => dispatch(addFileToAttach(newFileSpec)),
  removeFileToAttach: (index: number) => dispatch(removeFileToAttach(index)),
  modifyFileToAttach: (newFileSpec: Partial<UserCommentAttachedFileSpec>, index: number) => dispatch(modifyFileToAttach(newFileSpec, index))
});

const parseQueryString = (query: string): UserCommentQueryParams => {
  const { 
    commentId: stringCommentId,
    commentTargetId: targetType,
    stableId: targetId,
    externalDbName,
    externalDbVersion,
    ...stringParams
  }: UserCommentQueryStringParams = QueryString.parse(query);

  const commentId = parseInt(stringCommentId || '') || undefined;
  const target = targetId && targetType
    ? { id: targetId, type: targetType }
    : undefined;
  const externalDatabase = externalDbName && externalDbVersion
    ? { name: externalDbName, version: externalDbVersion }
    : undefined;

  return {
    commentId,
    target,
    externalDatabase,
    ...stringParams,
  };
};

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
  permissionDenied: stateProps.permissionDenied,
  returnUrl: stateProps.returnUrl,
  returnLinkText: stateProps.returnLinkText,
  title: stateProps.title,
  buttonText: stateProps.buttonText,
  submitting: stateProps.submitting,
  completed: stateProps.completed,
  className: "wdk-UserCommentsForm",
  formGroupHeaders: {
    part1: 'Part I: Comment',
    part2: 'Part II: Evidence for This Comment (Optional)',
    part3: 'Part III: Other Genes to which you want to apply this comment (Optional)'
  },
  formGroupFields: {
    part1: [
      {
        key: 'headline',
        label: <span>Headline<span style={{ color: 'red' }}>*</span></span>,
        field: (
          <TextBox
            required
            onChange={dispatchProps.updateFormField('headline')}
            value={stateProps.submission.headline || ''}
          />
        )
      },
      {
        key: 'categoryIds',
        label: 'Category (check all that apply)',
        field: (
          <CheckboxList
            onChange={(newStringValues: string[]) => {
              dispatchProps.updateFormField('categoryIds')(newStringValues.map(x => parseInt(x)))
            }}
            value={stateProps.submission.categoryIds || []}
            items={[
              {
                display: 'Phenotype',
                value: 0
              },
              {
                display: 'New Gene',
                value: 1
              },
              {
                display: 'New Feature',
                value: 2
              },
              {
                display: 'Centromere',
                value: 3
              },
              {
                display: 'Genomic Assembly',
                value: 4
              },
              {
                display: 'Sequence',
                value: 5
              }
            ]}
          />
        )
      },
      {
        key: 'content',
        label: <span>Comment<span style={{ color: 'red' }}>*</span></span>,
        field: (
          <TextArea
            required
            onChange={dispatchProps.updateFormField('content')}
            value={stateProps.submission.content || ''}
          />
        ),
      },
      {
        key: 'locations',
        label: 'Location',
        field: null
      }
    ],
    part2: [
      {
        key: 'attachments',
        label: 'Upload File:',
        field: (
          <AttachmentsField
            attachedFiles={stateProps.attachedFiles}
            fileSpecsToAttach={stateProps.attachedFileSpecsToAdd}
            removeFileSpec={dispatchProps.removeFileToAttach}
            addFileSpec={dispatchProps.addFileToAttach}
            modifyFileSpec={dispatchProps.modifyFileToAttach}
            removeAttachedFile={dispatchProps.removeAttachedFile}
          />
        )
      },
      {
        key: 'pubMedIds',
        label: 'PubMed ID(s)',
        field: (
          <PubMedIdsField
            idsFieldContents={(stateProps.submission.pubMedIds || []).join(',')}
            onIdsChange={(newValue: string) => dispatchProps.updateFormField('pubMedIds')(newValue.split(/\s*,\s*/g))}
            openPreview={() => dispatchProps.showPubmedPreview(stateProps.submission.pubMedIds || [])}
            onClosePreview={dispatchProps.hidePubmedPreview}
            previewOpen={stateProps.previewOpen}
            previewData={stateProps.previewData}
          />
        )
      },
      {
        key: 'digitalObjectIds',
        label: 'Digital Object Identifier (DOI) Name(s)',
        field: null
      },
      {
        key: 'genBankAccessions',
        label: 'Genbank Accession(s)',
        field: null
      }
    ],
    part3: [
      {
        key: 'relatedStableIds',
        label: get(stateProps, 'submission.target.type', '') === 'gene'
          ? 'Gene Identifiers'
          : get(stateProps, 'submission.target.type', '') === 'isolate'
          ? 'Isolate Identifiers'
          : `Gene Identifiers (please do not include ${get(stateProps, 'submission.target.id', '')})`,
        field: null
      }
    ]
  },
  formGroupOrder: [
    'part1',
    'part2',
    'part3'
  ],
  onSubmit: (event: FormEvent) => {
    event.preventDefault();
    dispatchProps.requestSubmitComment(stateProps.submission);
  },
  formLoaded: stateProps.formLoaded,
  openAddComment: dispatchProps.openAddComment,
  openEditComment: dispatchProps.openEditComment,
  queryParams: stateProps.queryParams
});

class UserCommentShowController extends PageController<Props> {
  loadData() {
    if (this.props.queryParams.commentId) {
      this.props.openEditComment(this.props.queryParams.commentId);
    } else {
      this.props.openAddComment(this.props.queryParams);
    }    
  }

  isRenderDataPermissionDenied() {
    return this.props.permissionDenied;
  }

  isRenderDataLoaded() {
    return this.props.formLoaded;
  }

  renderView() {
    const {
      formLoaded,
      openAddComment,
      openEditComment,
      queryParams,
      ...viewProps
    } = this.props;

    return (
      <UserCommentFormView {...viewProps} />
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, MergedProps, RootState>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(
  wrappable(UserCommentShowController)
);
