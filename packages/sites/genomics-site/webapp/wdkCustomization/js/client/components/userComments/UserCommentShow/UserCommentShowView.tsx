import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { UserCommentCard } from './UserCommentCard';
import { CommentFilterChips, CommentFilter } from './CommentFilterChips';

import './UserCommentShowView.scss';

export interface UserCommentShowViewProps {
  title: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  initialCommentId?: number;
  userComments: UserCommentGetResponse[];
  userId: number;
  webAppUrl: string;
  deleteUserComment: (commentId: number) => void;
}

export const UserCommentShowView: React.FunctionComponent<
  UserCommentShowViewProps
> = ({
  title,
  className,
  headerClassName,
  bodyClassName,
  initialCommentId,
  userComments,
  userId,
  webAppUrl,
  deleteUserComment,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<CommentFilter>('all');

  useEffect(() => {
    if (containerRef.current && initialCommentId) {
      const el = containerRef.current.querySelector(
        `[id='${initialCommentId}']`
      );
      if (el) el.scrollIntoView();
    }
  }, []);

  const aiComments = userComments.filter((c) => c.aiProvenance != null);
  const userGenerated = userComments.filter((c) => c.aiProvenance == null);
  const counts = {
    all: userComments.length,
    user: userGenerated.length,
    ai: aiComments.length,
  };

  const visible =
    filter === 'ai'
      ? aiComments
      : filter === 'user'
      ? userGenerated
      : userComments;

  return (
    <div className={className} ref={containerRef}>
      <div className={headerClassName}>{title}</div>
      <div className={bodyClassName}>
        {userComments.length > 0 && (
          <CommentFilterChips
            counts={counts}
            active={filter}
            onChange={setFilter}
          />
        )}
        {visible.length === 0 ? (
          filter === 'ai' ? (
            <p>No AI-assisted comments for this gene yet.</p>
          ) : filter === 'user' ? (
            <p>No user-generated comments for this gene yet.</p>
          ) : null
        ) : (
          visible.map((comment) => (
            <UserCommentCard
              key={comment.id}
              comment={comment}
              userId={userId}
              webAppUrl={webAppUrl}
              onDelete={deleteUserComment}
            />
          ))
        )}
      </div>
    </div>
  );
};
