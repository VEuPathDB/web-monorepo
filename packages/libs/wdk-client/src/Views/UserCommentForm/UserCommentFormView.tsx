import React, { ReactNode, FormEvent } from 'react';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';
import { FormBody } from 'wdk-client/Views/UserCommentForm/FormBody';

export interface UserCommentFormViewProps {
  title: ReactNode;
  buttonText: string;
  submitting: boolean;
  completed: boolean;
  returnUrl: string;
  returnLinkText: string;
  className?: string;
  onSubmit: (event: FormEvent) => void;
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupDisplayNames: Record<string, string>;
  formGroupOrder: string[];
}

export const UserCommentFormView: React.SFC<UserCommentFormViewProps> = ({
  title,
  buttonText,
  submitting,
  className,
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
            {title}
            <form onSubmit={onSubmit}>
              <FormBody {...formBodyProps} />  
              <button type="submit" disabled={submitting}>
                {buttonText}
              </button>
            </form>
          </>
        )
    }
  </div>
);
