import { capitalize, groupBy } from 'lodash';
import React, { ReactElement } from "react";
import { wrappable, makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";
import Modal from "wdk-client/Components/Overlays/Modal";
import Icon from "wdk-client/Components/Icon/Icon";
import { UnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';
import ErrorStatus from 'wdk-client/Components/PageStatus/Error';

import './UnhandledErrors.scss';

const cx = makeClassNameHelper('UnhandledErrors');

interface Props {
  errors?: UnhandledError[];
  showStackTraces: boolean;
  clearErrors: () => void;
  children: ReactElement;
}

function UnhandledErrors(props: Props) {
  const { children, clearErrors, errors, showStackTraces } = props;
  const groupedErrors = groupBy(errors, 'type');
  const errorTypes = [ 'input', 'runtime', 'server', 'client' ] as const;
  const modal = errors && errors.length > 0 && (
    <Modal>
      <div className={cx()}>
        <button type="button" onClick={clearErrors}>
          <Icon type="close"/>
        </button>
        <ErrorStatus
          message={
            <div className={cx('--Details')}>
              {errorTypes.map(type => {
                const typedErrors: UnhandledError[] | undefined = groupedErrors[type];
                return typedErrors && <React.Fragment key={type}>
                  <h2>{capitalize(type)} errors</h2>
                  {typedErrors.map(({ error, id, message }) =>
                    <ErrorDetail key={id} id={id} error={error} showStackTraces={showStackTraces} message={message}/>)}
                </React.Fragment>;
              })}
            </div>
          }
        />
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

function ErrorDetail(props: { error: unknown, id: string, showStackTraces: boolean, message: string }) {
  const { error, id, showStackTraces, message } = props;
  return (
    <div>
      <code>{message} (log marker {id})</code>
      {showStackTraces && (
        <pre className={cx('--DetailItem')}>
          {getStackTrace(error)}
        </pre>
      )}
    </div>
  );
}

function getStackTrace(error: unknown): string {
  if (error == null) return 'Unknown';
  if (error instanceof Error && error.stack) return error.stack;
  return String(error);
}

export default wrappable(UnhandledErrors);
