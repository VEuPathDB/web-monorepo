import React, { useCallback, ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import UnhandledErrors from 'wdk-client/Views/UnhandledErrors/UnhandledErrors';
import { clearUnhandledErrors } from 'wdk-client/Actions/UnhandledErrorActions';

interface Props {
  children: ReactElement;
}
export default function UnhandledErrorsController(props: Props) {
  const errors = useSelector<RootState, any[]>(state => state.unhandledErrors.errors);
  const dispatch = useDispatch();
  const clearErrors = useCallback(() => dispatch(clearUnhandledErrors()), [ dispatch ])
  return (
    <UnhandledErrors errors={errors} showDetails={process.env.NODE_ENV !== 'production'} clearErrors={clearErrors}>
      {props.children}
    </UnhandledErrors>
  );
}
