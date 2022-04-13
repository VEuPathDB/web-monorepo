import React, { ReactNode, FormEvent } from 'react';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { FormRowProps } from './FormRow';
import { FormBody } from './FormBody';

import './UserCommentFormView.scss'
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

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
  errorsClassName?: string;
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

const cx = makeClassNameHelper('wdk-UserComments-Form');

export const UserCommentFormView: React.SFC<UserCommentFormViewProps> = ({
  title,
  buttonText,
  submitting,
  className,
  headerClassName,
  bodyClassName,
  errorsClassName,
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
            <h1>Thank You For The Comment</h1>
            <Link to={returnUrl}>{returnLinkText}</Link>
          </>
        )
        : (
          <>
            {
              submitting &&
              <div className={cx('-LoadingOverlay')}>
                <Loading className={cx('-Loading')}>
                  Submitting Your Comment...
                </Loading>
              </div>
            }
            <div className={headerClassName}>
              {title}
            </div>
            <div className={bodyClassName}>
              <form onSubmit={onSubmit}>
                <FormBody {...formBodyProps} />  
                <div className={errorsClassName}>
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
                        An internal error occurred while trying to submit your comment. Please try to resubmit and <Link to="/contact-us" target="_blank">contact us</Link> if this problem persists.
                        
                        <pre>
                          {internalError}
                        </pre>
                      </div>
                    )
                  }
                </div>
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
