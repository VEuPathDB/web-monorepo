import React, { ReactNode, FormEvent } from 'react';
import { Link } from 'wdk-client/Components';
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
  footerClassName?: string;
  onSubmit: (event: FormEvent) => void;
  formGroupFields: Record<string, (FormRowProps & { key: string })[]>;
  formGroupHeaders: Record<string, ReactNode>;
  formGroupOrder: string[];
  formGroupClassName?: string;
  formGroupHeaderClassName?: string;
  formGroupBodyClassName?: string;
  backendValidationErrors: string[];
  internalError: string;
}

export const UserCommentFormView: React.SFC<UserCommentFormViewProps> = ({
  title,
  buttonText,
  submitting,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  onSubmit,
  completed,
  returnUrl,
  returnLinkText,
  backendValidationErrors,
  internalError,
  ...formBodyProps
}) => (
  <div className={className}>
    {
      completed
        ? (
          <>
            Thank you for the comment.
            <br /><br />
            <Link to={returnUrl}>{returnLinkText}</Link>
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
            <div className={footerClassName}>
              {
                (backendValidationErrors.length > 0) && (
                  <div>
                    Please correct the following and resubmit your comment:
                    <ul>
                      {
                        backendValidationErrors.map(
                          error => <li key={error}>{error}</li>
                        )
                      }
                    </ul>
                  </div>
                )
              }
              {
                internalError && (
                  <div>
                    The following error occurred while trying to submit your comment. Please try to resubmit and <Link to="/contact-us" target="_blank">contact us</Link> if this problem persists.
                    
                    <pre>
                      {internalError}
                    </pre>
                  </div>
                )
              }
            </div>
          </>
        )
    }
  </div>
);
