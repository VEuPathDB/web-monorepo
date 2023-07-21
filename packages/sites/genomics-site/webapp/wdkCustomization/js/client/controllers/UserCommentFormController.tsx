import { isEqual } from 'lodash';
import React, { FormEvent, ReactNode } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  CheckboxList,
  TextArea,
  TextBox,
  Link,
  HelpIcon,
} from '@veupathdb/wdk-client/lib/Components';
import {
  UserCommentFormView,
  UserCommentFormViewProps,
} from '../components/userComments/UserCommentForm/UserCommentFormView';
import { get, omit } from 'lodash';
import { GlobalData } from '@veupathdb/wdk-client/lib/StoreModules/GlobalData';
import {
  openUserCommentForm,
  requestSubmitComment,
  updateFormFields,
  requestPubmedPreview,
  closePubmedPreview,
  addFileToAttach,
  removeFileToAttach,
  modifyFileToAttach,
  removeAttachedFile,
  updateRawFormFields,
  changePubmedIdSearchQuery,
  closeUserCommentForm,
} from '../actions/UserCommentFormActions';
import {
  RootState,
  UserCommentPostRequest,
  PubmedPreview,
  UserCommentAttachedFileSpec,
  UserCommentAttachedFile,
  KeyedUserCommentAttachedFileSpec,
  UserCommentRawFormFields,
  UserCommentLocation,
} from '../types/userCommentTypes';
import { createSelector } from 'reselect';
import {
  UserCommentFormState,
  CategoryChoice,
} from '../storeModules/UserCommentFormStoreModule';

import { PubMedIdsField } from '../components/userComments/UserCommentForm/PubmedIdField';
import { AttachmentsField } from '../components/userComments/UserCommentForm/AttachmentsField';
import { LocationField } from '../components/userComments/UserCommentForm/LocationField';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

type StateProps = {
  submitting: boolean;
  completed: boolean;
  documentTitle: string;
  title: ReactNode;
  buttonText: string;
  submission: UserCommentPostRequest;
  rawFields: UserCommentRawFormFields;
  formLoaded: boolean;
  pubmedIdSearchQuery: string;
  previewOpen: boolean;
  previewData?: PubmedPreview;
  attachedFiles: UserCommentAttachedFile[];
  attachedFileSpecsToAdd: KeyedUserCommentAttachedFileSpec[];
  permissionDenied: boolean;
  returnUrl: string;
  returnLinkText: string;
  queryParams: OwnProps;
  backendValidationErrors: string[];
  internalError: string;
  targetType: string;
  categoryChoices: CategoryChoice[];
};

type DispatchProps = {
  updateFormField: (
    key: string
  ) => (newValue: string | string[] | number[] | UserCommentLocation) => void;
  updateRawFormField: (key: string) => (newValue: string) => void;
  updatePubmedIdSearchQuery: (newBalue: string) => void;
  openAddComment: (
    request: UserCommentPostRequest,
    initialRawFields: Partial<UserCommentRawFormFields>
  ) => void;
  openEditComment: (commentId: number) => void;
  closeUserCommentForm: () => void;
  removeAttachedFile: (attachmentId: number) => void;
  removeFileToAttach: (index: number) => void;
  modifyFileToAttach: (
    newFileSpec: Partial<UserCommentAttachedFileSpec>,
    index: number
  ) => void;
  addFileToAttach: (newFileSpec: UserCommentAttachedFileSpec) => void;
  requestSubmitComment: (request: UserCommentPostRequest) => void;
  showPubmedPreview: (pubMedIds: string[]) => void;
  hidePubmedPreview: () => void;
  showLoginForm: (url?: string) => void;
};

export interface UserCommentQueryStringParams {
  commentId?: string;
  stableId?: string;
  commentTargetId?: string;
  externalDbName?: string;
  externalDbVersion?: string;
  organism?: string;
  locations?: string;
  contig?: string;
  strand?: string;
}

interface OwnProps {
  commentId?: number;
  target?: { id: string; type: string };
  externalDatabase?: { name: string; version: string };
  organism?: string;
  locations?: string;
  contig?: string;
  strand?: string;
}

type MergedProps = UserCommentFormViewProps & {
  documentTitle: string;
  permissionDenied: boolean;
  showLoginForm: (url: string) => void;
  formLoaded: boolean;
  openAddComment: (
    request: UserCommentPostRequest,
    initialRawFields: Partial<UserCommentRawFormFields>
  ) => void;
  openEditComment: (commentId: number) => void;
  closeUserCommentForm: () => void;
  queryParams: OwnProps;
};

type Props = MergedProps;

const userCommentForm = ({ userCommentForm }: RootState) => userCommentForm;
const globalData = ({ globalData }: RootState) => globalData;

const queryParams = (state: RootState, props: OwnProps) => props;

const userCommentPostRequest = createSelector<
  RootState,
  UserCommentFormState,
  UserCommentPostRequest
>(
  userCommentForm,
  ({ userCommentPostRequest }: UserCommentFormState) =>
    userCommentPostRequest || {}
);

const rawFields = createSelector<
  RootState,
  UserCommentFormState,
  UserCommentRawFormFields
>(
  userCommentForm,
  ({ userCommentRawFields }: UserCommentFormState) => userCommentRawFields
);

const formLoaded = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ projectIdLoaded, userCommentLoaded }: UserCommentFormState) =>
    projectIdLoaded && userCommentLoaded
);

const showPubmedPreview = createSelector<
  RootState,
  UserCommentFormState,
  boolean
>(
  userCommentForm,
  ({ showPubmedPreview }: UserCommentFormState) => showPubmedPreview
);

const pubmedPreview = createSelector<
  RootState,
  UserCommentFormState,
  PubmedPreview | undefined
>(userCommentForm, ({ pubmedPreview }: UserCommentFormState) => pubmedPreview);

const pubmedIdSearchQuery = createSelector<
  RootState,
  UserCommentFormState,
  string
>(
  userCommentForm,
  ({ pubmedIdSearchQuery }: UserCommentFormState) => pubmedIdSearchQuery
);

const targetType = createSelector<RootState, UserCommentPostRequest, string>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) =>
    get(userCommentPostRequest, 'target.type', '')
);

const targetId = createSelector<RootState, UserCommentPostRequest, string>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) =>
    get(userCommentPostRequest, 'target.id', '')
);

const commentId = createSelector<
  RootState,
  UserCommentPostRequest,
  number | null
>(
  userCommentPostRequest,
  (userCommentPostRequest: UserCommentPostRequest) =>
    userCommentPostRequest.previousCommentId || null
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
  (globalDataState: GlobalData) =>
    get(globalDataState, 'siteConfig.projectId', '')
);

const documentTitle = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => {
    const displayName = get(globalDataState, 'config.displayName', '');

    return displayName ? `${displayName}.org :: Add A Comment` : displayName;
  }
);

const isGuest = createSelector<RootState, GlobalData, boolean>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'user.isGuest', true)
);

const permissionDenied = createSelector<
  RootState,
  UserCommentFormState,
  boolean,
  boolean
>(
  userCommentForm,
  isGuest,
  ({ projectIdLoaded }: UserCommentFormState, isGuest: boolean) =>
    projectIdLoaded && isGuest
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
    { contig }: OwnProps,
    {
      externalDatabase: { name, version } = { name: '', version: '' },
    }: UserCommentPostRequest
  ) => {
    return (
      <>
        <h1>
          {editing
            ? `Edit comment ${commentId} for ${targetId}`
            : `Add a comment to ${targetType} ${targetId}`}
        </h1>
        Please add only scientific comments to be displayed on the {targetType}{' '}
        page for {targetId}. If you want to report a problem, use the{' '}
        <Link to={'/contact-us'} target="_blank">
          support page
        </Link>
        .
        <br />
        Your comments are appreciated.{' '}
        {projectId === 'TriTrypDB' &&
          'They will be forwarded to the Annotation Center for review and possibly included in future releases of the genome. '}
        {projectId === 'CryptoDB' &&
          'They will be forwarded to the genome curators. '}
        {targetType === 'gene' && (
          <>
            If this is a <b>new gene</b>, please also add a comment in the
            corresponding{' '}
            <Link
              to={`/user-comments/add?stableId=${contig}&commentTargetId=genome&externaDbName=${name}&externalDbVersion=${version}`}
            >
              Genome Sequence
            </Link>
          </>
        )}
        {targetType === 'genome' &&
          'This form can be used for adding comments for a new gene. '}
      </>
    );
  }
);

const returnUrl = createSelector<RootState, string, string, string>(
  targetType,
  targetId,
  (targetType: string, targetId: string) => {
    if (targetType === 'gene') {
      return `/record/gene/${targetId}`;
    } else if (targetType === 'isolate') {
      return `/record/popsetSequence/${targetId}`;
    } else {
      return `/record/genomic-sequence/${targetId}`;
    }
  }
);

const returnLinkText = createSelector<RootState, string, string, string>(
  targetType,
  targetId,
  (targetType: string, targetId: string) =>
    `Return to ${targetType} ${targetId} page`
);

const buttonText = createSelector<RootState, boolean, string>(
  editing,
  (editing: boolean) => (editing ? 'Edit Comment' : 'Add Comment')
);

const attachedFiles = createSelector<
  RootState,
  UserCommentFormState,
  UserCommentAttachedFile[]
>(
  userCommentForm,
  ({ attachedFiles }: UserCommentFormState) => attachedFiles || []
);

const attachedFileSpecsToAdd = createSelector<
  RootState,
  UserCommentFormState,
  KeyedUserCommentAttachedFileSpec[]
>(
  userCommentForm,
  ({ attachedFileSpecsToAdd }: UserCommentFormState) => attachedFileSpecsToAdd
);

const backendValidationErrors = createSelector<
  RootState,
  UserCommentFormState,
  string[]
>(
  userCommentForm,
  ({ backendValidationErrors }: UserCommentFormState) => backendValidationErrors
);

const internalError = createSelector<RootState, UserCommentFormState, string>(
  userCommentForm,
  ({ internalError }: UserCommentFormState) => internalError
);

const categoryChoices = createSelector<
  RootState,
  UserCommentFormState,
  CategoryChoice[]
>(
  userCommentForm,
  ({ categoryChoices }: UserCommentFormState) => categoryChoices
);

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  submitting: submitting(state),
  completed: completed(state),
  documentTitle: documentTitle(state),
  title: title(state, props),
  buttonText: buttonText(state),
  submission: userCommentPostRequest(state),
  rawFields: rawFields(state),
  formLoaded: formLoaded(state),
  pubmedIdSearchQuery: pubmedIdSearchQuery(state),
  previewOpen: showPubmedPreview(state),
  previewData: pubmedPreview(state),
  attachedFiles: attachedFiles(state),
  attachedFileSpecsToAdd: attachedFileSpecsToAdd(state),
  permissionDenied: permissionDenied(state),
  returnUrl: returnUrl(state),
  returnLinkText: returnLinkText(state),
  queryParams: queryParams(state, props),
  backendValidationErrors: backendValidationErrors(state),
  internalError: internalError(state),
  targetType: targetType(state),
  categoryChoices: categoryChoices(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateFormField:
    (key: string) =>
    (newValue: string | string[] | number[] | UserCommentLocation) =>
      dispatch(
        updateFormFields({
          [key]: newValue,
        })
      ),
  updateRawFormField: (key: string) => (newValue: string) =>
    dispatch(
      updateRawFormFields({
        [key]: newValue,
      })
    ),
  updatePubmedIdSearchQuery: (newValue: string) =>
    dispatch(changePubmedIdSearchQuery(newValue)),
  showPubmedPreview: (pubMedIds: string[]) =>
    dispatch(
      requestPubmedPreview(
        pubMedIds.map((x) => parseInt(x)).filter((x) => x > 0)
      )
    ),
  hidePubmedPreview: () => dispatch(closePubmedPreview()),
  openAddComment: (
    request: UserCommentPostRequest,
    initialRawFields: Partial<UserCommentRawFormFields>
  ) => dispatch(openUserCommentForm(request, initialRawFields)),
  openEditComment: (commentId: number) =>
    dispatch(openUserCommentForm(commentId, {})),
  closeUserCommentForm: () => dispatch(closeUserCommentForm()),
  requestSubmitComment: (request: UserCommentPostRequest) =>
    dispatch(requestSubmitComment(request)),
  removeAttachedFile: (attachmentId: number) =>
    dispatch(removeAttachedFile(attachmentId)),
  addFileToAttach: (newFileSpec: UserCommentAttachedFileSpec) =>
    dispatch(addFileToAttach(newFileSpec)),
  removeFileToAttach: (index: number) => dispatch(removeFileToAttach(index)),
  modifyFileToAttach: (
    newFileSpec: Partial<UserCommentAttachedFileSpec>,
    index: number
  ) => dispatch(modifyFileToAttach(newFileSpec, index)),
  showLoginForm: (url?: string) => dispatch(showLoginForm(url)),
});

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => {
  const part1UpperFields = [
    {
      key: 'headline',
      label: (
        <span>
          Headline<span style={{ color: 'red' }}>*</span>
        </span>
      ),
      field: (
        <TextBox
          required
          onChange={dispatchProps.updateFormField('headline')}
          value={stateProps.submission.headline || ''}
        />
      ),
    },
    {
      key: 'categoryIds',
      label: 'Category (check all that apply)',
      field: (
        <CheckboxList
          onChange={(newStringValues: string[]) => {
            dispatchProps.updateFormField('categoryIds')(
              newStringValues.map((x) => parseInt(x))
            );
          }}
          value={(stateProps.submission.categoryIds || []).map((x) => `${x}`)}
          items={stateProps.categoryChoices}
        />
      ),
    },
    {
      key: 'content',
      label: (
        <span>
          Comment<span style={{ color: 'red' }}>*</span>
        </span>
      ),
      field: (
        <TextArea
          required
          onChange={dispatchProps.updateFormField('content')}
          value={stateProps.submission.content || ''}
        />
      ),
    },
  ];

  const part1LowerFields =
    stateProps.targetType === 'isolate'
      ? []
      : [
          {
            key: 'locations',
            label: 'Location',
            field: (
              <LocationField
                coordinateTypeField={stateProps.rawFields.coordinateType}
                rangesField={stateProps.rawFields.ranges}
                onCoordinateTypeChange={(value: string) => {
                  dispatchProps.updateFormField('location')({
                    ...parseCoordinateType(value),
                    ranges: get(stateProps.submission, 'location.ranges', []),
                  });
                  dispatchProps.updateRawFormField('coordinateType')(value);
                }}
                onRangesChange={(value: string) => {
                  dispatchProps.updateFormField('location')({
                    ...parseCoordinateType(stateProps.rawFields.coordinateType),
                    ranges: parseRangesStr(value),
                  });
                  dispatchProps.updateRawFormField('ranges')(value);
                }}
              />
            ),
          },
        ];

  return {
    permissionDenied: stateProps.permissionDenied,
    returnUrl: stateProps.returnUrl,
    returnLinkText: stateProps.returnLinkText,
    documentTitle: stateProps.documentTitle,
    title: stateProps.title,
    buttonText: stateProps.buttonText,
    submitting: stateProps.submitting,
    completed: stateProps.completed,
    className: 'wdk-UserComments wdk-UserComments-Form',
    headerClassName: 'wdk-UserComments-Form-Header',
    bodyClassName: 'wdk-UserComments-Form-Body',
    errorsClassName: 'wdk-UserComments-Form-Errors',
    formGroupHeaders: {
      part1: 'Part I: Comment',
      part2: 'Part II: Evidence for This Comment (Optional)',
      part3:
        'Part III: Other Genes to which you want to apply this comment (Optional)',
    },
    formGroupFields: {
      part1: [...part1UpperFields, ...part1LowerFields],
      part2: [
        {
          key: 'attachments',
          label: 'Upload File',
          field: (
            <AttachmentsField
              attachedFiles={stateProps.attachedFiles}
              fileSpecsToAttach={stateProps.attachedFileSpecsToAdd}
              removeFileSpec={dispatchProps.removeFileToAttach}
              addFileSpec={dispatchProps.addFileToAttach}
              modifyFileSpec={dispatchProps.modifyFileToAttach}
              removeAttachedFile={dispatchProps.removeAttachedFile}
            />
          ),
        },
        {
          key: 'pubMedIds',
          label: 'PubMed ID(s)',
          field: (
            <PubMedIdsField
              idsField={stateProps.rawFields.pubMedIds}
              searchField={stateProps.pubmedIdSearchQuery}
              onIdsChange={(newValue: string) => {
                dispatchProps.updateRawFormField('pubMedIds')(newValue);
                dispatchProps.updateFormField('pubMedIds')(
                  newValue
                    .split(/\s*,\s*/g)
                    .map((x) => parseInt(x))
                    .filter((x) => x > 0)
                    .map((x) => `${x}`)
                );
              }}
              onSearchFieldChange={dispatchProps.updatePubmedIdSearchQuery}
              openPreview={() =>
                dispatchProps.showPubmedPreview(
                  stateProps.submission.pubMedIds || []
                )
              }
              onClosePreview={dispatchProps.hidePubmedPreview}
              previewOpen={stateProps.previewOpen}
              previewData={stateProps.previewData}
            />
          ),
        },
        {
          key: 'digitalObjectIds',
          label: 'Digital Object Identifier (DOI) Name(s)',
          field: (
            <>
              <TextBox
                onChange={(newValue: string) => {
                  dispatchProps.updateRawFormField('digitalObjectIds')(
                    newValue
                  );
                  dispatchProps.updateFormField('digitalObjectIds')(
                    newValue
                      .split(/\s*,\s*/g)
                      .map((x) => x.trim())
                      .filter((x) => x.length > 0)
                  );
                }}
                value={stateProps.rawFields.digitalObjectIds}
              />
              <HelpIcon>
                <ul>
                  <li>
                    Enter one or more DOIs, site URLs (at dx.doi.org), or DOI
                    URLs (with doi: prefix) in the box above, separated by ','
                  </li>
                  <li>
                    <a href="http://www.doi.org/index.html" target="_blank">
                      DOI homepage
                    </a>
                  </li>
                </ul>
              </HelpIcon>
            </>
          ),
        },
        {
          key: 'genBankAccessions',
          label: 'GenBank Accession(s)',
          field: (
            <>
              <TextBox
                onChange={(newValue: string) => {
                  dispatchProps.updateRawFormField('genBankAccessions')(
                    newValue
                  );
                  dispatchProps.updateFormField('genBankAccessions')(
                    newValue
                      .split(/\s*,\s*/g)
                      .map((x) => x.trim())
                      .filter((x) => x.length > 0)
                  );
                }}
                value={stateProps.rawFields.genBankAccessions}
              />
              <HelpIcon>
                <ul>
                  <li>
                    Enter one or more Acccession(s) in the box above separated
                    by ','
                  </li>
                </ul>
              </HelpIcon>
            </>
          ),
        },
      ],
      part3: [
        {
          key: 'relatedStableIds',
          label:
            get(stateProps, 'submission.target.type', '') === 'gene'
              ? 'Gene Identifiers'
              : get(stateProps, 'submission.target.type', '') === 'isolate'
              ? 'Isolate Identifiers'
              : `Gene Identifiers (please do not include ${get(
                  stateProps,
                  'submission.target.id',
                  ''
                )})`,
          field: (
            <TextArea
              onChange={(newValue: string) => {
                dispatchProps.updateRawFormField('relatedStableIds')(newValue);
                dispatchProps.updateFormField('relatedStableIds')(
                  newValue.split(/[,;\s]+/g).filter((x) => x.length > 0)
                );
              }}
              value={stateProps.rawFields.relatedStableIds}
            />
          ),
        },
      ],
    },
    formGroupOrder: ['part1', 'part2', 'part3'],
    formGroupClassName: 'wdk-UserComments-Form-Group',
    formGroupHeaderClassName: 'wdk-UserComments-Form-Group-Header',
    formGroupBodyClassName: 'wdk-UserComments-Form-Group-Body',
    onSubmit: (event: FormEvent) => {
      event.preventDefault();
      dispatchProps.requestSubmitComment(stateProps.submission);
    },
    formLoaded: stateProps.formLoaded,
    openAddComment: dispatchProps.openAddComment,
    openEditComment: dispatchProps.openEditComment,
    closeUserCommentForm: dispatchProps.closeUserCommentForm,
    queryParams: stateProps.queryParams,
    backendValidationErrors: stateProps.backendValidationErrors,
    internalError: stateProps.internalError,
    showLoginForm: dispatchProps.showLoginForm,
  };
};

class UserCommentFormController extends PageController<Props> {
  loadData(prevProps?: Props) {
    if (
      prevProps == null ||
      !isEqual(prevProps.queryParams, this.props.queryParams)
    ) {
      if (this.props.queryParams.commentId) {
        this.props.openEditComment(this.props.queryParams.commentId);
      } else {
        this.props.openAddComment(
          {
            ...omit(this.props.queryParams, [
              'locations',
              'contig',
              'strand',
              'commentId',
            ]),
            location: this.props.queryParams.locations
              ? {
                  coordinateType: 'genome',
                  ranges: parseRangesStr(this.props.queryParams.locations),
                  reverse: this.props.queryParams.strand === '-',
                }
              : undefined,
          },
          {
            coordinateType:
              this.props.queryParams.strand === '-' ? 'genomer' : 'genomef',
            ranges: this.props.queryParams.locations,
          }
        );
      }
    }
  }

  componentWillUnmount() {
    this.props.closeUserCommentForm();
  }

  getTitle() {
    return this.props.documentTitle;
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
      documentTitle,
      permissionDenied,
      showLoginForm,
      ...viewProps
    } = this.props;

    return permissionDenied ? (
      <>
        <h1>Login Required</h1>
        <p>
          Please{' '}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              showLoginForm(window.location.href);
            }}
          >
            login
          </a>{' '}
          to continue.
        </p>
      </>
    ) : (
      <UserCommentFormView {...viewProps} />
    );
  }
}

export default connect<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(UserCommentFormController));

const parseCoordinateType = (coordinateType: string) => ({
  coordinateType: 'genome',
  reverse: coordinateType.endsWith('r'),
});

const parseRangesStr = (rangesStr: string) =>
  (rangesStr.match(/\d+-\d+/g) || []).map((rangeStr) => {
    const [start, end] = rangeStr.split('-').map((x) => parseInt(x));
    return {
      start,
      end,
    };
  });
