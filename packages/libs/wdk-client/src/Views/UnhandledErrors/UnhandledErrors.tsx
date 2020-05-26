import React, { ReactElement } from "react";
import { wrappable, makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";
import ErrorStatus from "wdk-client/Components/PageStatus/Error";
import Modal from "wdk-client/Components/Overlays/Modal";
import Icon from "wdk-client/Components/Icon/Icon";

import './UnhandledErrors.scss';

const cx = makeClassNameHelper('UnhandledErrors');

interface Props {
  errors?: any[];
  showDetails: boolean;
  clearErrors: () => void;
  children: ReactElement;
}

function UnhandledError(props: Props) {
  const { children, clearErrors, errors, showDetails } = props;

  const modal = errors && errors.length > 0 && (
    <Modal>
      <div className={cx()}>
        <button type="button" onClick={clearErrors}>
          <Icon type="close"/>
        </button>
        <ErrorStatus/>
        {showDetails && (
          <div className={cx('--Details')}>
            {errors.map(error => <ErrorDetail error={error}/>)}
          </div>
        )}
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

function ErrorDetail(props: { error: any }) {
  const { error } = props;
  return (
    <pre className={cx('--DetailItem')}>
      {'stack' in error ? error.stack : String(error)}
    </pre>
  );
}

export default wrappable(UnhandledError);
