import React, { ReactNode, useEffect, useRef } from 'react';
import { FormRowProps } from '../UserCommentForm/FormRow';
import { FormBody } from '../UserCommentForm/FormBody';

import './UserCommentShowView.scss';

export interface UserCommentShowViewProps {
  title: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  initialCommentId?: number;
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupHeaders: Record<string, ReactNode>;
  formGroupOrder: string[];
  formGroupClassName?: string;
  formGroupHeaderClassName?: string;
  formGroupBodyClassName?: string;
}

export const UserCommentShowView: React.SFC<UserCommentShowViewProps> = ({
  title,
  className,
  headerClassName,
  bodyClassName,
  initialCommentId,
  ...formBodyProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && initialCommentId) {
      const initialCommentIdSelector = `[id='${initialCommentId}']`;
      const commentToScrollTo = containerRef.current.querySelector(initialCommentIdSelector);

      if (commentToScrollTo) {
        commentToScrollTo.scrollIntoView();
      }
    }
  }, []);

  return (
    <div className={className} ref={containerRef}>
      <div className={headerClassName}>
        {title}
      </div>
      <div className={bodyClassName}>
        <FormBody {...formBodyProps} />
      </div>
    </div>
  );
};
