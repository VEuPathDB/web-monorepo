import { capitalize } from 'lodash';
import React, { ReactNode } from 'react';
import { wrappable, makeClassNameHelper } from '../../Utils/ComponentUtils';
import Modal from '../../Components/Overlays/Modal';
import Icon from '../../Components/Icon/Icon';
import { UnhandledError } from '../../Actions/UnhandledErrorActions';
import ErrorStatus from '../../Components/PageStatus/Error';
import { record, string, boolean, arrayOf, objectOf } from '../../Utils/Json';
import { Seq } from '../../Utils/IterableUtils';

import './UnhandledErrors.scss';

const cx = makeClassNameHelper('UnhandledErrors');

interface Props {
  errors?: UnhandledError[];
  showStackTraces: boolean;
  clearErrors: () => void;
}

function UnhandledErrors(props: Props) {
  const { clearErrors, errors, showStackTraces } = props;
  const errorsToDisplay = Seq.from(errors || [])
    // .orderBy(error => error.type)
    .groupBy((error) => error.message)
    .map(([message, errors]) => (
      <div key={message}>
        <h3>{message}</h3>
        <pre className={cx('--Message')}>
          {errors.map(({ id }) => (
            <li key={id}>{id}</li>
          ))}
        </pre>
      </div>
    ));

  return errors && errors.length > 0 ? (
    <Modal>
      <div className={cx()}>
        <button type="button" onClick={clearErrors}>
          <Icon type="close" />
        </button>
        <ErrorStatus
          message={
            !errorsToDisplay.isEmpty() && (
              <details className={cx('--Details')}>
                <summary>Error details</summary>
                {errorsToDisplay}
              </details>
            )
          }
        />
      </div>
    </Modal>
  ) : null;
}

function ErrorDetail(props: {
  error: unknown;
  id: string;
  showStackTraces: boolean;
  message: string;
  type: string;
}) {
  const { error, id, showStackTraces, message, type } = props;
  return (
    <div>
      <div>
        <code>
          {type.split('-').map(capitalize).join('-')} error ({id})
        </code>
      </div>
      {message && (
        <div className={cx('--Message')}>
          {formatInputErrorMessage(message)}
        </div>
      )}
      {showStackTraces && (
        <pre className={cx('--Stack')}>{getStackTrace(error)}</pre>
      )}
    </div>
  );
}

function getStackTrace(error: unknown): string {
  if (error == null) return 'Unknown';
  if (error instanceof Error && error.stack) return error.stack;
  return String(error);
}

const inputErrorDecoder = record({
  level: string,
  isValid: boolean,
  errors: record({
    general: arrayOf(string),
    byKey: objectOf(arrayOf(string)),
  }),
});

function formatInputErrorMessage(message: string): ReactNode {
  try {
    const result = inputErrorDecoder(JSON.parse(message));
    if (result.status === 'err') return message;
    const { value } = result;
    return (
      <ul>
        {value.errors.general.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
        {Object.entries(value.errors.byKey).map(([key, messages]) =>
          messages.map((message, index) => (
            <li key={`${key}_${index}`}>
              <strong>{key}:</strong> {message}
            </li>
          ))
        )}
      </ul>
    );
  } catch {
    return message;
  }
}

export default wrappable(UnhandledErrors);
