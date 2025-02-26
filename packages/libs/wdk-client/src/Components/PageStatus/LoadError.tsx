import * as React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

type Props = {
  children?: React.ReactNode;
};

export default wrappable(function LoadError(props: Props) {
  return (
    <div className="wdk-LoadError">
      <h1>Oops... something went wrong</h1>
      {props.children || (
        <p>
          An error has occured and this page cannot be loaded. Please try again
          later.
        </p>
      )}
    </div>
  );
});
