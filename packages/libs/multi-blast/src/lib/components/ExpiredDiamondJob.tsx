import * as React from 'react';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface Props {
  children?: React.ReactNode;
}

const ExpiredDiamondJob: React.FC = (props: Props) => (
  <div className="wdk-NotFound">
    <h1>Diamond Job - expired</h1>
    {props.children || (
      <p>Sorry, your job has expired and is not rerunnable.</p>
    )}
  </div>
);

export default wrappable(ExpiredDiamondJob);
