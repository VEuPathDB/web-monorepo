import { wrappable } from "wdk-client/Utils/ComponentUtils";
import ErrorStatus from "wdk-client/Components/PageStatus/Error";
import React from "react";

interface Props {
  errors?: any[];
  showDetails: boolean
}

function UnhandledError(props: Props) {
  const { errors, showDetails } = props;

  if (errors == null || errors.length === 0) return null;

  return (
    <>
      <ErrorStatus/>
      {showDetails && errors.map(error => <ErrorDetail error={error}/>)}
    </>
  )
}

function ErrorDetail(props: { error: any }) {
  const { error } = props;
  const message: string = 'response' in error ? error.response
    : 'message' in error ? error.message
    : error.toString();
  return <p>{message}</p>;
}

export default wrappable(UnhandledError);