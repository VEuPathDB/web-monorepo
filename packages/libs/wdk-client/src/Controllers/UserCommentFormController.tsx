import React, { FormEvent, ReactNode, Fragment } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

import { CheckboxList, RadioList, TextArea, TextBox, TextBoxMultivalued, Link } from 'wdk-client/Components';
import { UserCommentFormView, UserCommentFormViewProps } from 'wdk-client/Views/UserCommentForm/UserCommentFormView';
import { get } from 'lodash';
import { GlobalData } from 'wdk-client/StoreModules/GlobalData';
import { openUserCommentForm, requestSubmitComment, updateFormFields, requestPubmedPreview, closePubmedPreview } from 'wdk-client/Actions/UserCommentFormActions';
import { UserCommentPostRequest } from 'wdk-client/Utils/WdkUser';
import { createSelector } from 'reselect';
import { UserCommentFormState } from 'wdk-client/StoreModules/UserCommentFormStoreModule';
import { UserCommentFormActions } from 'wdk-client/Actions';

type StateProps = {
  submitting: boolean;
  title: ReactNode;
  buttonText: string;
  request: UserCommentPostRequest;
  formLoaded: boolean;
};

type DispatchProps = {
  updateFormField: (key: string) => (newValue: string | string[]) => void;
  openAddComment: (request: UserCommentPostRequest) => void;
  openEditComment: (commentId: number) => void;
  requestSubmitComment: (request: UserCommentPostRequest) => void;
};

type OwnProps = {

};

type MergedProps = UserCommentFormViewProps & {
  formLoaded: boolean;
  openAddComment: (request: UserCommentPostRequest) => void;
  openEditComment: (commentId: number) => void;
};

type Props = MergedProps;

const userCommentForm = ({ userCommentForm }: RootState) => userCommentForm;
const globalData = ({ globalData }: RootState) => globalData;

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
  (userCommentPostRequest: UserCommentPostRequest) => userCommentPostRequest.id || null
);

const submitting = createSelector<RootState, UserCommentFormState, boolean>(
  userCommentForm,
  ({ submitting }: UserCommentFormState) => submitting
);

const editing = createSelector<RootState, number | null, boolean>(
  commentId,
  (commentId: number | null) => commentId !== null
);

const projectId = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'siteConfig.projectId', '')
);

const title = createSelector<RootState, number | null, string, string, boolean, string, ReactNode>(
  commentId,
  targetType,
  targetId,
  editing,
  projectId,
  (commentId: number | null, targetType: string, targetId: string, editing: boolean, projectId: string) => {
    return (
      <Fragment>
        <h3>
          {
            editing
              ? `Edit comment ${commentId} ${targetId}`
              : `Add a comment to ${targetType} ${targetId}`
          }
        </h3>
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
              If this is a <b>new gene</b>, please also add a comment in the corresponding <a href="addComment.do?stableId=${commentForm.contig}&commentTargetId=genome&externaDbName=${commentForm.externalDbName}&externalDbVersion=${commentForm.externalDbVersion}&flag=0">Genome Sequence</a> 
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

const buttonText = createSelector<RootState, boolean, string>(
  editing,
  (editing: boolean) => editing
    ? 'Edit Comment'
    : 'Add Comment'
);

const mapStateToProps = (state: RootState) => ({
  submitting: submitting(state),
  title: title(state),
  buttonText: buttonText(state),
  request: userCommentPostRequest(state),
  formLoaded: formLoaded(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateFormField: (key: string) => (newValue: string | string[]) => dispatch(updateFormFields({
    [key]: newValue
  })),
  showPubmedPreview: (pubmedIds: string[]) => dispatch(
    requestPubmedPreview(
      pubmedIds.map(x => parseInt(x)).filter(x => x > 0)
    )
  ),
  hidePubmedPreview: () => dispatch(closePubmedPreview()),
  openAddComment: (request: UserCommentPostRequest) => dispatch(openUserCommentForm(request)),
  openEditComment: (commentId: number) => dispatch(openUserCommentForm(commentId)),
  requestSubmitComment: (request: UserCommentPostRequest) => dispatch(requestSubmitComment(request))
});

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps) => ({
  title: stateProps.title,
  buttonText: stateProps.buttonText,
  submitting: stateProps.submitting,
  className: "wdk-UserCommentsForm",
  formGroupDisplayNames: {
    part1: 'Part I: Comment',
    part2: 'Part II: Evidence for This Comment (Optional)',
    part3: 'Part III: Other Genes to which you want to apply this comment (Optional)'
  },
  formGroupFields: {
    part1: [
      {
        key: 'headline',
        label: 'Headline',
        field: (
          <TextBox
            onChange={dispatchProps.updateFormField('headline')}
            value={stateProps.request.headline}
          />
        )
      },
      {
        key: 'content',
        label: 'Content',
        field: (
          <TextArea
            onChange={dispatchProps.updateFormField('content')}
            value={stateProps.request.headline}
          />
        ),
      }
      // TODO: Figure out a more elegant way to enumerate these fields...
    ],
    part2: [],
    part3: []
  },
  formGroupOrder: [
    'part1',
    'part2',
    'part3'
  ],
  formLoaded: stateProps.formLoaded,
  openAddComment: dispatchProps.openAddComment,
  openEditComment: dispatchProps.openEditComment,
  onSubmit: (event: FormEvent) => {
    dispatchProps.requestSubmitComment(stateProps.request);
    event.preventDefault();
  }
});

class UserCommentShowController extends PageController<Props> {
  loadData() {
    this.props.openEditComment(100015410);
  }

  isRenderDataLoaded() {
    return this.props.formLoaded;
  }

  renderView() {
    const {
      formLoaded,
      openAddComment,
      openEditComment,
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
