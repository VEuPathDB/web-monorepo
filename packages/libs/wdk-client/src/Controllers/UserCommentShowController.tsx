import * as QueryString from 'querystring';

import React, { ReactNode } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { UserCommentGetResponse } from 'wdk-client/Utils/WdkUser';
import { createSelector } from 'reselect';
import { UserCommentShowState } from 'wdk-client/StoreModules/UserCommentShowStoreModule';
import { openUserCommentShow, requestDeleteUserComment } from 'wdk-client/Actions/UserCommentShowActions';
import { UserCommentShowViewProps, UserCommentShowView } from 'wdk-client/Views/UserCommentShow/UserCommentShowView';
import { GlobalData } from 'wdk-client/StoreModules/GlobalData';
import { get } from 'lodash';
import { PubmedIdEntry } from 'wdk-client/Views/UserCommentForm/PubmedIdEntry';
import { UserCommentUploadedFiles } from 'wdk-client/Views/UserCommentShow/UserCommentUploadedFiles';

type StateProps = {
  userId: number;
  webAppUrl: string;
  projectId: string;
  userComments: UserCommentGetResponse[];
  loading: boolean;
  title: ReactNode;
};

type DispatchProps = {
  loadUserComments: (targetType: string, targetId: string) => void; 
  deleteUserComment: (commentId: number) => void;
};

type OwnProps = {
  location: any
  // TODO: Inject these props in routes.tsx once the new client plugin architecture has been merged
  // into this branch
  // targetType: string,
  // targetId: string
};

type MergedProps = UserCommentShowViewProps & {
  loading: boolean;
  loadUserComments: (targetType: string, targetId: string) => void; 
  deleteUserComment: (commentId: number) => void;
  targetType: string;
  targetId: string;
};

type Props = MergedProps;

const globalData = ({ globalData }: RootState) => globalData;
const userCommentShow = ({ userCommentShow }: RootState) => userCommentShow;

const targetType = (state: RootState, props: OwnProps) => {
  const { commentTargetId } = QueryString.parse(props.location.search.slice(1));
  const targetType = typeof commentTargetId === 'string' ? commentTargetId : '';
  return targetType;
};

const targetId = (state: RootState, props: OwnProps) => {
  const { stableId } = QueryString.parse(props.location.search.slice(1));
  const targetType = typeof stableId === 'string' ? stableId : '';
  return targetType;
};

const userId = createSelector<RootState, GlobalData, number>(
  globalData,
  (globalData: GlobalData) => get(globalData, 'user.id', 0)
);

const projectId = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'siteConfig.projectId', '')
);

const webAppUrl = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalDataState: GlobalData) => get(globalDataState, 'siteConfig.webAppUrl', '')
);

const userComments = createSelector<RootState, UserCommentShowState, UserCommentGetResponse[]>(
  userCommentShow,
  ({ userComments }) => userComments
);

const loadingUser = createSelector<RootState, UserCommentShowState, boolean>(
  userCommentShow,
  ({ loadingUser }) => loadingUser
);

const loadingUserComments = createSelector<RootState, UserCommentShowState, boolean>(
  userCommentShow,
  ({ loadingUserComments }) => loadingUserComments
);

const loading = createSelector<RootState, boolean, boolean, boolean>(
  loadingUser,
  loadingUserComments,
  (loadingUser, loadingUserComments) => loadingUser || loadingUserComments
);

const returnUrl = createSelector(
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

const title = createSelector(
  userComments,
  targetType,
  targetId,
  returnUrl,
  (userComments, targetType, targetId, returnUrl) => {
    if (userComments.length === 0) {
      return (
        <p>
          There's currently no comment for <a href={returnUrl} target="_blank">{targetId}</a>.
        </p>
      );
    }

    return (
      <>
        <p className="user-comments-list-header">
          {targetType} comments on <a href={returnUrl} target="_blank">{targetId}</a>
        </p>
      </>
    )
  }
);

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  userId: userId(state),
  webAppUrl: webAppUrl(state),
  projectId: projectId(state),
  userComments: userComments(state),
  loading: loading(state),
  title: title(state, props)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserComments: (targetType: string, targetId: string) => dispatch(openUserCommentShow(targetType, targetId)),
  deleteUserComment: (commentId: number) => dispatch(requestDeleteUserComment(commentId))
});

const mergeProps = (
  { userId, webAppUrl, userComments, loading, title }: StateProps, 
  { loadUserComments, deleteUserComment }: DispatchProps,
  { location }: OwnProps
) => {
  const { stableId, commentTargetId } = QueryString.parse(location.search.slice(1));
  
  const targetId = typeof stableId === 'string' ? stableId : '';
  const targetType = typeof commentTargetId === 'string' ? commentTargetId : '';

  const formGroupFields = userComments.reduce(
    (memo, comment) => {
      const topFields = [
        {
          key: 'id',
          label: 'Comment Id:',
          field: comment.id
        },
        {
          key: 'target',
          label: 'Comment Target:',
          field: `${comment.target.type} ${comment.target.id}`
        },
        {
          key: 'author',
          label: 'Author:',
          field: `${comment.author.firstName} ${comment.author.lastName}, ${comment.author.organization}`
        }
      ];

      const additionalAuthorsField = comment.additionalAuthors.length === 0
        ? []
        : [
          {
            key: 'additionalAuthors',
            label: 'Other Author(s)',
            field: (
              <>
                {
                  comment.additionalAuthors.map(
                    author => <div key={author}>author</div>
                  )
                }
              </>
            )
          }
        ];

      const remainingFields = [
        {
          key: 'project',
          label: 'Project:',
          field: `${comment.project.name}, version ${comment.project.version}`
        },
        {
          key: 'organism',
          label: 'Organism:',
          field: comment.organism,
        },
        {
          key: 'date',
          label: 'Date:',
          field: new Date(comment.commentDate).toString()
        },
        {
          key: 'comment',
          label: 'Content:',
          field: comment.content
        },
        {
          key: 'genBankAccessions',
          label: 'GenBank Accessions:',
          field: (
            <>
              {
                comment.genBankAccessions.map(
                  accession => (
                    <a
                      key={accession} 
                      href={`http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=${accession}`}>
                    >
                      {accession}
                    </a>
                  )
                )
              }
            </>
          )
        },
        {
          key: 'relatedStableIds',
          label: 'Other Related Genes:',
          field: (
            <>
              {
                comment.relatedStableIds.map(
                  stableId => (
                    comment.target.type === 'gene'
                      ? (
                        <a 
                          key={stableId}
                          href={`${webAppUrl}/app/record/gene/${stableId}`}
                        >
                          {stableId}
                        </a>
                      )
                      : comment.target.type === 'isolate'
                      ? (
                        <a 
                          key={stableId}
                          href={`showRecord.do?name=IsolateRecordClasses.IsolateRecordClass&source_id=${stableId}`}
                        >
                          {stableId}
                        </a>
                      )
                      : null
                  )
                )
              }
            </>
          )
        },
        {
          key: 'categories',
          label: 'Category:',
          field: (
            <>
              {
                comment.categories.map(
                  (category, i) => (
                    <div key={category}>{category}
                      {i + 1}) {category}
                    </div>
                  )
                )
              }
            </>
          )
        },
        {
          key: 'location',
          label: 'Location:',
          field: (
            <>
              {
                comment.location && comment.location.ranges.length > 0
                  ? (
                    <>
                      {comment.location.coordinateType}:{' '}
                      {
                        comment.location.ranges.map(
                          ({ start, end }) => `${start}-${end}`
                        ).join(', ')
                      }
                      {comment.location.reverse && ` (reversed)`}
                    </>
                  )
                  : null
              }
            </>
          )
        },
        {
          key: 'digitalObjectIds',
          label: 'Digital Object Identifier(DOI) Name(s):',
          field: (
            <>
              {
                comment.digitalObjectIds.map(
                  digitalObjectId => (
                    <a key={digitalObjectId} href={`http://dx.doi.org/${digitalObjectId}`}>{digitalObjectId}</a>
                  )
                )
              }
            </>
          )
        },
        {
          key: 'pubMedRefs',
          label: 'PMID(s):',
          field: (
            <>
              {
                comment.pubMedRefs.map(
                  pubMedRef => (
                    <PubmedIdEntry key={pubMedRef.id} {...pubMedRef} />
                  )
                )
              }
            </>
          )
        },
        {
          key: 'attachments',
          label: 'Uploaded Files:',
          field: (
            <UserCommentUploadedFiles uploadedFiles={comment.attachments} />
          )
        },
        {
          key: 'externalDb',
          label: 'External Database:',
          field: `${comment.externalDatabase.name} ${comment.externalDatabase.version}`
        },
        {
          key: 'reviewStatus',
          label: 'Status:',
          field: comment.reviewStatus === 'accepted'
            ? (
              <>
                Status: <em>included in the Annotation Center's official annotation</em>
              </>
            )
            : null
        }
      ];

      return { 
        ...memo, 
        [comment.id]: [
          ...topFields,
          ...additionalAuthorsField,
          ...remainingFields
        ]
      };
    }, 
    {}
  );

  const formGroupHeaders = userComments.reduce(
    (memo, comment) => ({ 
      ...memo, 
      [comment.id]: (
        <>
          Headline:
          <a id={`${comment.id}`}>{comment.headline}</a>
          {
            userId === comment.author.userId && (
              <>
                <a href={`${webAppUrl}/app/user-comments/edit?commentId=${comment.id}`} target="_blank">[edit comment]</a>
                <a href={`${webAppUrl}/app/user-comments/delete?commentId=${comment.id}`} onClick={event => {
                  event.preventDefault();
                  deleteUserComment(comment.id);
                }}>[delete comment]</a>
              </>
            )
          }
        </>
      )
    }), 
    {}
  );

  const formGroupOrder = userComments.map(({ id }) => `${id}`);

  return {
    className: 'wdk-UserComments wdk-UserComments-Show',
    headerClassName: 'wdk-UserComments-Show-Header',
    bodyClassName: 'wdk-UserComments-Show-Body',
    title,
    formGroupFields,
    formGroupHeaders,
    formGroupOrder,
    formGroupClassName: 'wdk-UserComments-Show-Group',
    formGroupHeaderClassName: 'wdk-UserComments-Show-Group-Header',
    formGroupBodyClassName: 'wdk-UserComments-Show-Group-Body',   
    loading,
    loadUserComments,
    deleteUserComment,
    targetType,
    targetId
  };
};

class UserCommentShowController extends PageController<Props> {
  loadData() {
    this.props.loadUserComments(
      this.props.targetType, 
      this.props.targetId
    );
  }

  isRenderDataLoaded() {
    return !this.props.loading;
  }

  renderView() {
    const {
      loading,
      loadUserComments,
      deleteUserComment,
      targetType,
      targetId,
      ...viewProps
    } = this.props;

    return <UserCommentShowView {...viewProps} />;
  }
}

export default connect<StateProps, DispatchProps, OwnProps, MergedProps, RootState>(
  mapStateToProps, 
  mapDispatchToProps,
  mergeProps
)(
  wrappable(UserCommentShowController)
);
