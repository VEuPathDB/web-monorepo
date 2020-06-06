import { capitalize, groupBy } from 'lodash';
import React, { ReactElement } from "react";
import { wrappable, makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";
import ErrorStatus from "wdk-client/Components/PageStatus/Error";
import Modal from "wdk-client/Components/Overlays/Modal";
import Icon from "wdk-client/Components/Icon/Icon";

import './UnhandledErrors.scss';
import { UnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';

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

  const modal = errors && errors.length > 0 && (
    <Modal>
      <div className={cx()}>
        <button type="button" onClick={clearErrors}>
          <Icon type="close"/>
        </button>
        <ErrorStatus/>
        <div className={cx('--Details')}>
          {errorTypes.map(type => {
            const typedErrors: UnhandledError[] | undefined = groupedErrors[type];
            return typedErrors && <>
              <h2>{capitalize(type)} errors</h2>
              {typedErrors.map(({ error, id }) => <ErrorDetail key={id} id={id} error={error} showDetails={showDetails}/>)}
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

function ErrorDetail(props: { error: unknown, id: string, showDetails: boolean }) {
  const { error, id, showDetails } = props;
  return (
    <div>
      <code>Id: {id}</code>
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
