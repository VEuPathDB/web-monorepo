import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

export interface Props {
  message?: string;
  children?: React.ReactNode;
}

export const ErrorStatus = wrappable(function ErrorStatus(props: Props) {
  return (
    <div className="wdk-Error">
      <h1>Oops...</h1>
      {props.children || (
        <p>
          Something went wrong. Please try again later.
          <br />
          {props.message}
        </p>
      )}
    </div>
  )
});

export default ErrorStatus;
