import { capitalize, groupBy } from 'lodash';
import React, { ReactElement } from "react";
import { wrappable, makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";
import Modal from "wdk-client/Components/Overlays/Modal";
import Icon from "wdk-client/Components/Icon/Icon";

import './UnhandledErrors.scss';
import { UnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';
import Link from 'wdk-client/Components/Link';

const cx = makeClassNameHelper('UnhandledErrors');

interface Props {
  errors?: UnhandledError[];
  showDetails: boolean;
  clearErrors: () => void;
  children: ReactElement;
}

function UnhandledError(props: Props) {
  const { children, clearErrors, errors, showDetails } = props;
  const groupedErrors = groupBy(errors, 'type');
  const errorTypes = [ 'input', 'runtime', 'server', 'client' ] as const;
  const contactUsMessage = errorTypes.map(errorType => {
    const typedErrors: UnhandledError[] | undefined = groupedErrors[errorType];
    if (typedErrors == null) return '';
    return '# ' + capitalize(errorType) +' errors: ' + typedErrors.map(te => te.id).join(', ');
  }).join('\n')

  const modal = errors && errors.length > 0 && (
    <Modal>
      <div className={cx()}>
        <button type="button" onClick={clearErrors}>
          <Icon type="close"/>
        </button>
        <h1>We're sorry, something when wrong.</h1>
        <div>
          Please try again later, and <Link to={`/contact-us?ctx=${encodeURIComponent(contactUsMessage)}`}>contact us</Link> if the problem persists.
        </div>
        <div className={cx('--Details')}>
          {errorTypes.map(type => {
            const typedErrors: UnhandledError[] | undefined = groupedErrors[type];
            return typedErrors && <>
              <h2>{capitalize(type)} errors</h2>
              {typedErrors.map(({ error, id, message }) =>
                <ErrorDetail key={id} id={id} error={error} showDetails={showDetails} message={message}/>)}
            </>;
          })}
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      {children}
      {modal}
    </>
  );
}

function ErrorDetail(props: { error: unknown, id: string, showDetails: boolean, message: string }) {
  const { error, id, showDetails, message } = props;
  return (
    <div>
      <code>{message} (log marker {id})</code>
      {showDetails && (
        <pre className={cx('--DetailItem')}>
          {getErrorMessage(error)}
        </pre>
      )}
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (error == null) return 'Unknown';
  if (error instanceof Error && error.stack) return error.stack;
  return String(error);
}

export default wrappable(UnhandledError);
