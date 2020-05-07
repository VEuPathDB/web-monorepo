import React, { ReactChild } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import UnhandledErrors from 'wdk-client/Views/UnhandledErrors/UnhandledErrors';

interface Props {
  children?: ReactChild;
}
export default function UnhandledErrorsController(props: Props) {
  const errors = useSelector<RootState, any[]>(state => state.unhandledErrors.errors);
  return (
    <UnhandledErrors errors={errors} showDetails>
      {props.children}
    </UnhandledErrors>
  );
}
