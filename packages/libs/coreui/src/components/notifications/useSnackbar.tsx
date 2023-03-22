import { useMemo } from "react";

import { Grow } from "@material-ui/core";
import {
  OptionsObject,
  ProviderContext,
  SnackbarMessage,
  useSnackbar as useNotistackSnackbar,
} from "notistack";

import DismissButton from "./DismissButton";

/**
 * A wrapping of notistack's (https://www.iamhosseindhv.com/notistack)
 * useSnackbar hook which applies some sensible default (but overridable)
 * options.
 *
 * Must be invoked inside a component which has a notistack SnackbarProvider
 * as an ancestor.
 *
 * (Tip: use our "makeSnackbarProvider" utility to create a SnackbarProvider
 * which applies our standard styling.)
 */
export default function useSnackbar(): ProviderContext {
  const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar();

  return useMemo(
    () => ({
      enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject) {
        return enqueueSnackbar(message, {
          variant: "info",
          TransitionComponent: Grow as React.ComponentType,
          action:
            options?.persist === true
              ? function (key) {
                  return (
                    <DismissButton
                      onClick={() => {
                        closeSnackbar(key);
                      }}
                      buttonText="Close Notification"
                    />
                  );
                }
              : undefined,
          ...options,
        });
      },
      closeSnackbar,
    }),
    [enqueueSnackbar, closeSnackbar]
  );
}
