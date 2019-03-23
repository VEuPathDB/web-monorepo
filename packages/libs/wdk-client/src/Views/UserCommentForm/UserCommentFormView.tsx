import React, { ReactNode, FormEvent } from 'react';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';
import { FormBody } from 'wdk-client/Views/UserCommentForm/FormBody';

import 'wdk-client/Views/UserCommentForm/UserCommentFormView.scss'

export interface UserCommentFormViewProps {
  title: ReactNode;
  buttonText: string;
  submitting: boolean;
  completed: boolean;
  returnUrl: string;
  returnLinkText: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onSubmit: (event: FormEvent) => void;
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupHeaders: Record<string, ReactNode>;
  formGroupOrder: string[];
  formGroupClassName?: string;
  formGroupHeaderClassName?: string;
  formGroupBodyClassName?: string;
}

export const UserCommentFormView: React.SFC<UserCommentFormViewProps> = ({
  title,
  buttonText,
  submitting,
  className,
  headerClassName,
  bodyClassName,
  onSubmit,
  completed,
  returnUrl,
  returnLinkText,
  ...formBodyProps
}) => (
  <div className={className}>
    {
      completed
        ? (
          <>
            Thank you for the comment.
            <br /><br />
            <a href={returnUrl}>{returnLinkText}</a>
          </>
        )
        : (
          <>
            <div className={headerClassName}>
              {title}
            </div>
            <div className={bodyClassName}>
              <form onSubmit={onSubmit}>
                <FormBody {...formBodyProps} />  
                <div>
                  <input type="submit" disabled={submitting} value={buttonText} />
                </div>
              </form>
            </div>
          </>
        )
    }
  </div>
);
