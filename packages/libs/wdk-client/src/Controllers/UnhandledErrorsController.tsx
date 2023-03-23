import React, { useCallback, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../Core/State/Types';
import UnhandledErrors from '../Views/UnhandledErrors/UnhandledErrors';
import { clearUnhandledErrors } from '../Actions/UnhandledErrorActions';

export default function UnhandledErrorsController() {
  const errors = useSelector<RootState, any[]>(
    (state) => state.unhandledErrors.errors
  );
  const dispatch = useDispatch();
  const clearErrors = useCallback(
    () => dispatch(clearUnhandledErrors()),
    [dispatch]
  );
  return (
    <UnhandledErrors
      errors={errors}
      showStackTraces={process.env.NODE_ENV !== 'production'}
      clearErrors={clearErrors}
    />
  );
}
