import React, { ReactNode } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { RootState, UserCommentGetResponse } from '../types/userCommentTypes';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { createSelector } from 'reselect';
import { UserCommentShowState } from '../storeModules/UserCommentShowStoreModule';
import { openUserCommentShow, requestDeleteUserComment } from '../actions/UserCommentShowActions';
import { UserCommentShowViewProps, UserCommentShowView } from '../components/userComments/UserCommentShow/UserCommentShowView';
import { GlobalData } from '@veupathdb/wdk-client/lib/StoreModules/GlobalData';
import { get, capitalize } from 'lodash';
import { PubmedIdEntry } from '../components/userComments/UserCommentForm/PubmedIdEntry';
import { UserCommentUploadedFiles } from '../components/userComments/UserCommentShow/UserCommentUploadedFiles';
import { Link } from '@veupathdb/wdk-client/lib/Components';

type StateProps = {
  userId: number;
  documentTitle: string;
  userComments: UserCommentGetResponse[];
  loading: boolean;
  title: ReactNode;
  webAppUrl: string;
};

type DispatchProps = {
  loadUserComments: (targetType: string, targetId: string) => void; 
  deleteUserComment: (commentId: number) => void;
};

type OwnProps = {
  targetType: string,
  targetId: string,
  initialCommentId?: number
};

type MergedProps = UserCommentShowViewProps & {
  documentTitle: string;
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
  return props.targetType;
};

const targetId = (state: RootState, props: OwnProps) => {
  return props.targetId;
};

const userId = createSelector<RootState, GlobalData, number>(
  globalData,
  (globalData: GlobalData) => get(globalData, 'user.id', 0)
);

const webAppUrl = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalData: GlobalData) => get(globalData, 'siteConfig.webAppUrl', '')
);

const documentTitle = createSelector(
  globalData,
  targetId,
  (globalDataState: GlobalData, targetId: string) => {
    const displayName = get(globalDataState, 'config.displayName', '');
    
    return displayName ? `${displayName}.org :: User Comments on ${targetId}` : displayName;
  }
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

const title = createSelector(
  userComments,
  targetType,
  targetId,
  returnUrl,
  (userComments, targetType, targetId, returnUrl) =>
    <>
      <h1>
        {capitalize(targetType)} comments on <Link to={returnUrl} target="_blank">{targetId}</Link>
      </h1>
      {
        (userComments.length === 0) && (
          <p>
            There's currently no comments for {targetId}.
          </p>
        )
      }
    </>
);

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  userId: userId(state),
  documentTitle: documentTitle(state, props),
  userComments: userComments(state),
  loading: loading(state),
  title: title(state, props),
  webAppUrl: webAppUrl(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserComments: (targetType: string, targetId: string) => dispatch(openUserCommentShow(targetType, targetId)),
  deleteUserComment: (commentId: number) => dispatch(requestDeleteUserComment(commentId))
});

const mergeProps = (
  { documentTitle, userId, userComments, loading, title, webAppUrl }: StateProps, 
  { loadUserComments, deleteUserComment }: DispatchProps,
  { targetId, targetType, initialCommentId }: OwnProps
) => {
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
          field: new Date(comment.commentDate).toISOString()
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
                      href={`http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=${accession}`}
                      target="_blank"
                    >
                      {accession}{' '}
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
                        <Link
                          key={stableId}
                          to={`/record/gene/${stableId}`}
                        >
                          {stableId}{' '}
                        </Link>
                      )
                      : comment.target.type === 'isolate'
                      ? (
                        <Link
                          key={stableId}
                          to={`/record/popsetSequence/${stableId}`}
                        >
                          {stableId}{' '}
                        </Link>
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
                    <div key={category}>
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
                    <a key={digitalObjectId} href={`http://dx.doi.org/${digitalObjectId}`} target="_blank">
                      {digitalObjectId}{' '}
                    </a>
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
            <UserCommentUploadedFiles 
              uploadedFiles={
                comment.attachments.map(
                  (attachmentMetadata) => ({
                    ...attachmentMetadata,
                    url: `${webAppUrl}/service/user-comments/${comment.id}/attachments/${attachmentMetadata.id}`
                  })
                )
              } 
            />
          )
        },
        {
          key: 'externalDb',
          label: 'External Database:',
          field: comment.externalDatabase ? `${comment.externalDatabase.name} ${comment.externalDatabase.version}` : ''
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
          <div>
            Headline:
          </div>
          <a id={`${comment.id}`}>{comment.headline}</a>
          <div className="wdk-UserComments-Show-EditControls">
            {
              userId === comment.author.userId && (
                <div>
                  <Link to={`/user-comments/edit?commentId=${comment.id}`} target="_blank">
                    [edit comment]
                  </Link>
                  {' '}
                  <Link to={`/user-comments/delete?commentId=${comment.id}`} onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                    event.preventDefault();
                    if (confirm(`Are you sure you wish to delete comment ${comment.id}?`)) {
                      deleteUserComment(comment.id);
                    }
                  }}>
                    [delete comment]
                  </Link>
                </div>
              )
            }
          </div>
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
    documentTitle,
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
    targetId,
    initialCommentId
  };
};

class UserCommentShowController extends PageController<Props> {
  loadData(prevProps?: Props) {
    if (
      prevProps == null ||
      this.props.targetType !== prevProps.targetType ||
      this.props.targetId !== prevProps.targetId
    ) {
      this.props.loadUserComments(
        this.props.targetType, 
        this.props.targetId
      );
    }
  }

  getTitle() {
    return this.props.documentTitle;
  }

  isRenderDataLoaded() {
    return !this.props.loading;
  }

  renderView() {
    const {
      documentTitle,
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
