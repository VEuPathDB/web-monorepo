import React, { ReactNode } from "react";
import { wrappable } from "wdk-client/Utils/ComponentUtils";
import ErrorStatus from "wdk-client/Components/PageStatus/Error";

import './UnhandledErrors.scss';

interface Props {
  errors?: any[];
  showDetails: boolean;
  children?: ReactNode;
}

function UnhandledError(props: Props) {
  const { children = null, errors, showDetails } = props;

  if (errors == null || errors.length === 0) return <>{children}</>;

  return (
    <div className="UnhandledErrors">
      <ErrorStatus/>
      {showDetails && errors.map(error => <ErrorDetail error={error}/>)}
    </div>
  )
}

function ErrorDetail(props: { error: any }) {
  const { error } = props;
  return <p>{String(error)}</p>;
}

export default wrappable(UnhandledError);
