import React, { ReactNode, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import useSnackbar from '@veupathdb/coreui/dist/components/notifications/useSnackbar';

import { RootState } from '../Core/State/Types';
import {
  _dequeueSnackbar,
  _displaySnackbar,
} from '../Actions/NotificationActions';

interface ReduxNotificationHandlerProps {
  children: ReactNode;
}

export function ReduxNotificationHandler({
  children,
}: ReduxNotificationHandlerProps) {
  useHandleReduxNotifications();

  return <>{children}</>;
}

export function useHandleReduxNotifications() {
  const dispatch = useDispatch();

  const enqueuedSnackbars = useSelector(
    (state: RootState) => state.notification.enqueuedSnackbars
  );

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    enqueuedSnackbars.forEach((enqueuedSnackbar) => {
      if (enqueuedSnackbar.status === 'enqueued') {
        // Display snackbars that have been "enqueued"
        enqueueSnackbar(enqueuedSnackbar.message, {
          ...enqueuedSnackbar.options,
          onEnter(...args) {
            enqueuedSnackbar.options?.onEnter?.(...args);
            dispatch(_displaySnackbar(enqueuedSnackbar.options.key));
          },
          onExited(...args) {
            enqueuedSnackbar.options?.onExited?.(...args);
            dispatch(_dequeueSnackbar(enqueuedSnackbar.options.key));
          },
        });
      } else if (enqueuedSnackbar.status === 'dismissed') {
        // Close snackbars that have been marked as "dismissed"
        closeSnackbar(enqueuedSnackbar.options.key);
      }
    });
  }, [closeSnackbar, enqueueSnackbar, enqueuedSnackbars]);
}
