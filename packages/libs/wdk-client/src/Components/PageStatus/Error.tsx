import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

export interface Props {
  message?: React.ReactNode;
  children?: React.ReactNode;
}

export const ErrorStatus = wrappable(function ErrorStatus(props: Props) {
  return (
    <div className="wdk-Error">
      <h1>We're sorry, something went wrong.</h1>
      {props.children || (
        <p>
          Please try again later.
          <br />
          {props.message}
        </p>
      )}
    </div>
  )
});

export default ErrorStatus;
