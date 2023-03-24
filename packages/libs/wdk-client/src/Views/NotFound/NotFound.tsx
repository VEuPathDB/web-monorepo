import * as React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

const NotFound: React.StatelessComponent = (props) => (
  <div className="wdk-NotFound">
    <h1>Page Not Found</h1>
    {props.children || <p>The page you requested does not exist.</p>}
  </div>
);

export default wrappable(NotFound);
