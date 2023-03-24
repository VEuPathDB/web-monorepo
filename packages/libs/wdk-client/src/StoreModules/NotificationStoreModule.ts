import { OptionsObject, SnackbarMessage, SnackbarKey } from 'notistack';

import {
  Action,
  closeSnackbar,
  _dequeueSnackbar,
  _displaySnackbar,
  enqueueSnackbar,
} from '../Actions/NotificationActions';

export const key = 'notification';

interface KeyedSnackbarOptions extends OptionsObject {
  key: SnackbarKey;
}

interface EnqueuedSnackbar {
  message: SnackbarMessage;
  options: KeyedSnackbarOptions;
  status: 'enqueued' | 'displayed' | 'dismissed';
}

export interface State {
  enqueuedSnackbars: EnqueuedSnackbar[];
}

const defaultState: State = {
  enqueuedSnackbars: [],
};

export function reduce(state = defaultState, action: Action): State {
  switch (action.type) {
    case enqueueSnackbar.type:
      return {
        ...state,
        enqueuedSnackbars: [
          ...state.enqueuedSnackbars,
          {
            ...action.payload,
            status: 'enqueued',
          },
        ],
      };

    case _displaySnackbar.type:
      return {
        ...state,
        enqueuedSnackbars: state.enqueuedSnackbars.map((enqueuedSnackbar) =>
          enqueuedSnackbar.status === 'enqueued' &&
          enqueuedSnackbar.options.key === action.payload.key
            ? {
                ...enqueuedSnackbar,
                status: 'displayed',
              }
            : enqueuedSnackbar
        ),
      };

    case closeSnackbar.type:
      return {
        ...state,
        enqueuedSnackbars: state.enqueuedSnackbars.map((enqueuedSnackbar) =>
          action.payload.key == null ||
          enqueuedSnackbar.options.key === action.payload.key
            ? {
                ...enqueuedSnackbar,
                status: 'dismissed',
              }
            : enqueuedSnackbar
        ),
      };

    case _dequeueSnackbar.type:
      return {
        ...state,
        enqueuedSnackbars: state.enqueuedSnackbars.filter(
          (enqueuedSnackbar) =>
            enqueuedSnackbar.options.key !== action.payload.key
        ),
      };

    default:
      return state;
  }
}
