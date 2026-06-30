import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { AiProvenanceSection } from './AiProvenanceSection';
import { CommentReferences } from './CommentReferences';
import { parseAiCommentSections } from '../AiGenePublication/parseAiCommentSections';

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
  const sections = parseAiCommentSections(comment.content);

  return (
    <div
      id={`${comment.id}`}
      style={{
        border: `1px solid ${gray[400]}`,
        borderRadius: 7,
        padding: '10px 16px 14px',
        marginBottom: 12,
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
            <h3 style={{ margin: 0, paddingTop: 10 }}>{comment.headline}</h3>
            {comment.aiProvenance != null && (
              <span
                style={{
                  background: TEAL,
                  color: 'white',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                AI-assisted
              </span>
            )}
          </div>
          <div style={{ color: gray[600], fontSize: '14px', marginTop: '4px' }}>
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

      {sections ? (
        <details
          className="UserCommentCard-aiSummary"
          style={{ marginTop: '12px' }}
        >
          <summary>
            <div style={{ whiteSpace: 'pre-wrap' }}>{sections.summary}</div>
            <span className="UserCommentCard-aiSummary-toggle">
              <span className="more">Show more</span>
              <span className="less">Show less</span>
            </span>
          </summary>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>
            {sections.details}
          </div>
        </details>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '12px' }}>
          {comment.content}
        </div>
      )}

      <div style={{ marginTop: '12px' }}>
        {comment.aiProvenance != null && (
          <AiProvenanceSection aiProvenance={comment.aiProvenance} />
        )}
        <CommentReferences comment={comment} webAppUrl={webAppUrl} />
      </div>

      <div style={{ color: gray[500], fontSize: '13px', marginTop: '12px' }}>
        Comment #{comment.id}
        {comment.project.name && (
          <>
            {' '}
            · {comment.project.name} {comment.project.version}
          </>
        )}
        {comment.organism && (
          <>
            {' '}
            · <em>{comment.organism}</em>
          </>
        )}
        {comment.additionalAuthors.length > 0 && (
          <> · Other authors: {comment.additionalAuthors.join(', ')}</>
        )}
      </div>
    </div>
  );
}
