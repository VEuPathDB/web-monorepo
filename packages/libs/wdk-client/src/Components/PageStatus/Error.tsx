import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

interface Props {
  children?: React.ReactChildren
}

function Error(props: Props) {
  return (
    <div className="wdk-Error">
      <h1>Oops...</h1>
      {props.children || (
        <p>
          Something went wrong. Please try again later.
        </p>
      )}
    </div>
  )
}

export default wrappable(Error);
