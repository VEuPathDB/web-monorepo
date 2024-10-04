import * as React from 'react';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Link } from 'react-router-dom';

interface Props {
  children?: React.ReactNode;
  workspaceShortName?: string;
}

const ExpiredDiamondJob: React.FC<Props> = (props) => (
  <div className="wdk-NotFound">
    <h1>{props.workspaceShortName ?? 'DIAMOND'} Job - expired</h1>
    {props.children || (
      <p>Sorry, your job has expired and is not rerunnable.</p>
    )}
    <Link className="BackToWorkspace" to="../new">
      &lt;&lt; Back to the {props.workspaceShortName ?? 'DIAMOND'} workspace
    </Link>
  </div>
);

export default wrappable(ExpiredDiamondJob);
