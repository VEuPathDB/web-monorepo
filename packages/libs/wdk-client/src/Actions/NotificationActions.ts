import { OptionsObject, SnackbarMessage, SnackbarKey } from 'notistack';

import { v4 as uuid } from 'uuid';

import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';

/** Dispatch this action to programmatically enqueue a snackbar */
export const enqueueSnackbar = makeActionCreator(
  'notifications/enqueue-snackbar',
  (message: SnackbarMessage, options?: OptionsObject) => {
    return {
      message,
      options: {
        ...options,
        key: options?.key ?? uuid(),
      },
    };
  }
);

/** Used internally to indicate that an enqueued snackbar has been displayed */
export const _displaySnackbar = makeActionCreator(
  'notifications/display-snackbar',
  (key: SnackbarKey) => ({ key })
);

/** Use this action to programmatically close a snackbar */
export const closeSnackbar = makeActionCreator(
  'notifications/close-snackbar',
  (key?: SnackbarKey) => ({ key })
);

/** Used internally to remove closed snackbars from the queue */
export const _dequeueSnackbar = makeActionCreator(
  'notifications/dequeue-snackbar',
  (key: SnackbarKey) => ({ key })
);

export type Action =
  | InferAction<typeof enqueueSnackbar>
  | InferAction<typeof _displaySnackbar>
  | InferAction<typeof closeSnackbar>
  | InferAction<typeof _dequeueSnackbar>;
