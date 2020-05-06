import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import UnhandledErrors from 'wdk-client/Views/UnhandledErrors/UnhandledErrors';

export default function UnhandledErrorsController() {
  const errors = useSelector<RootState, any[]>(state => state.unhandledErrors.errors);
  return (
    <UnhandledErrors errors={errors} showDetails/>
  );
}
