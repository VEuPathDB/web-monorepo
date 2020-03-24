import React, { ReactNode, FormEvent } from 'react';
import { useLocation } from 'react-router';
import { Link, Loading } from 'wdk-client/Components';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { ServiceConfig } from 'wdk-client/Service/ServiceBase';
import { FormRowProps } from 'wdk-client/Views/UserCommentForm/FormRow';
import { FormBody } from 'wdk-client/Views/UserCommentForm/FormBody';

import 'wdk-client/Views/UserCommentForm/UserCommentFormView.scss'
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

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
}) => {
  // TODO: Revert this when we're out of beta
  const { pathname, search } = useLocation();

  const projectId = useWdkService(
    async wdkService =>{
      const { projectId } = await wdkService.getConfig();

      return projectId;
    },
    []
  );

  return (
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
              {
                projectId == null
                  ? <Loading />
                  : <div className={headerClassName}>
                      <h1>
                        {title}
                      </h1>
                      <p style={{ fontSize: '1.3em' }}>
                        In this beta release, adding and editing comments is disabled.
                        {' '}
                        {
                          typeof title === 'string' && search.length > 0 && projectId !== 'VectorBase' &&
                          <>
                            If you wish to {title[0].toLowerCase()}{title.slice(1)}, please
                            {' '}
                            <a href={`https://${projectId.toLowerCase()}.org/${toMainWebAppUrl(projectId)}/app${pathname}${search}&useBetaSite=0`}>
                              visit the main site
                            </a>.
                          </>
                        }
                      </p>
                    </div>
              }
              <div className={bodyClassName}>
                {/* <form onSubmit={onSubmit}>
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
                </form> */}
              </div>
            </>
          )
      }
    </div>
  );
}

function toMainWebAppUrl(projectId: string) {
  if (
    projectId === 'AmoebaDB' ||
    projectId === 'PlasmoDB' ||
    projectId === 'ToxoDB'
  ) {
    return projectId.slice(0, -2).toLowerCase();
  } else if (
    projectId === 'MicrosporidiaDB' ||
    projectId === 'PiroplasmaDB'
  ) {
    return projectId.slice(0, projectId.indexOf('o') + 1).toLowerCase();
  } else {
    return projectId.toLowerCase();
  }
}
