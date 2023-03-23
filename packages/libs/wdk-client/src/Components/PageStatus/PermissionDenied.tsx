import * as React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

type Props = {
  children?: React.ReactChildren;
};

export default wrappable(function PermissionDenied(props: Props) {
  return (
    <div className="wdk-NotFound">
      <h1>Permission Denied</h1>
      {props.children || (
        <p>You do not have permission to view the page you requested.</p>
      )}
    </div>
  );
});
