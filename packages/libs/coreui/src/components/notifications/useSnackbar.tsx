import { ReactNode, useMemo } from 'react';

import { Grow  } from '@material-ui/core';
import {
  OptionsObject,
  ProviderContext,
  useSnackbar as useNotistackSnackbar,
} from 'notistack';

import DismissButton from './DismissButton';

export default function useSnackbar(): ProviderContext {
  const {
    enqueueSnackbar,
    closeSnackbar,
  } = useNotistackSnackbar();

  return useMemo(() => ({
    enqueueSnackbar(message: ReactNode, options?: OptionsObject) {
      return enqueueSnackbar(
        message,
        {
          variant: 'info',
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'top',
          },
          TransitionComponent: Grow as React.ComponentType,
          action: options?.persist === true
            ? function (key) {
                return (
                  <DismissButton
                    onClick={() => {
                      closeSnackbar(key);
                    }}
                  />
                );
              }
            : undefined,
          ...options,
        }
      );
    },
    closeSnackbar
  }), [ enqueueSnackbar, closeSnackbar ]);
}
