import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { AiProvenanceBanner } from './AiProvenanceBanner';
import { CommentReferences } from './CommentReferences';

interface Props {
  comment: UserCommentGetResponse;
  userId: number;
  webAppUrl: string;
  onDelete: (commentId: number) => void;
}

const TEAL = '#117a8b';

export function UserCommentCard({
  comment,
  userId,
  webAppUrl,
  onDelete,
}: Props): JSX.Element {
  const isOwn = userId === comment.author.userId;
  const date = new Date(comment.commentDate).toLocaleDateString();

  return (
    <div
      id={`${comment.id}`}
      style={{
        border: `1px solid ${gray[400]}`,
        borderRadius: 7,
        padding: 16,
        marginBottom: 16,
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0 }}>{comment.headline}</h3>
            {comment.aiProvenance != null && (
              <span
                style={{
                  background: TEAL,
                  color: 'white',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                AI-assisted
              </span>
            )}
          </div>
          <div style={{ color: gray[600], fontSize: '13px', marginTop: '4px' }}>
            {comment.author.firstName} {comment.author.lastName}
            {comment.author.organization
              ? `, ${comment.author.organization}`
              : ''}{' '}
            · {date}
          </div>
        </div>
        {isOwn && (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Link
              to={`/user-comments/edit?commentId=${comment.id}`}
              target="_blank"
            >
              [edit]
            </Link>{' '}
            <Link
              to={`/user-comments/delete?commentId=${comment.id}`}
              onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                if (
                  confirm(
                    `Are you sure you wish to delete comment ${comment.id}?`
                  )
                ) {
                  onDelete(comment.id);
                }
              }}
            >
              [delete]
            </Link>
          </div>
        )}
      </div>

      {comment.aiProvenance != null && (
        <div style={{ marginTop: '12px' }}>
          <AiProvenanceBanner aiProvenance={comment.aiProvenance} />
        </div>
      )}

      <div
        style={{ whiteSpace: 'pre-wrap', maxWidth: '80ch', marginTop: '12px' }}
      >
        {comment.content}
      </div>

      <div style={{ marginTop: '12px' }}>
        <CommentReferences comment={comment} webAppUrl={webAppUrl} />
      </div>

      <div style={{ color: gray[500], fontSize: '12px', marginTop: '12px' }}>
        Comment #{comment.id}
        {comment.project.name
          ? ` · ${comment.project.name} ${comment.project.version}`
          : ''}
        {comment.organism ? ` · ${comment.organism}` : ''}
        {comment.additionalAuthors.length > 0
          ? ` · Other authors: ${comment.additionalAuthors.join(', ')}`
          : ''}
      </div>
    </div>
  );
}
