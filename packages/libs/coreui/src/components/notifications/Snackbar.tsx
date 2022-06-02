import { ReactNode, useMemo } from 'react';

import { Grow, makeStyles } from '@material-ui/core';
import { Styles, StyleRules } from '@material-ui/core/styles/withStyles';
import {
  CombinedClassKey,
  OptionsObject,
  ProviderContext,
  SnackbarProvider,
  SnackbarProviderProps,
  useSnackbar as useNotistackSnackbar,
  VariantClassKey
} from 'notistack';

import {
  ColorHue,
  mutedBlue,
  mutedGreen,
  mutedRed,
  mutedYellow
} from '../../definitions/colors';

import { DismissButton } from './DismissButton';

const variantHueMap: Array<[VariantClassKey, ColorHue]> = [
  ['variantError', mutedRed],
  ['variantInfo', mutedBlue],
  ['variantSuccess', mutedGreen],
  ['variantWarning', mutedYellow],
];

export const defaultStyles = variantHueMap.reduce(
  (memo, [variantKey, variantHue]) => {
    memo[variantKey] = {
      backgroundColor: variantHue[100],
      border: `1px solid ${variantHue[600]}`,
      color: variantHue[900],
      '& a': {
        color: 'inherit',
        textDecoration: 'underline',
        fontWeight: 'bold',
      },
      '& svg': {
        fill: variantHue[600],
      }
    };

    return memo;
  },
  {} as StyleRules<VariantClassKey>
);

interface WrappedSnackbarProviderProps<StyleProps> extends SnackbarProviderProps {
  styleProps: StyleProps;
}

export function makeSnackbarProvider<
  Theme,
  StyleProps extends object,
  ClassKey extends CombinedClassKey = CombinedClassKey,
>(
  styles: Styles<Theme, StyleProps, ClassKey>,
  displayName: string = 'SnackbarProvider'
) {
  const useStyles = makeStyles({
    ...defaultStyles,
    ...styles
  } as Styles<Theme, StyleProps, ClassKey>);

  function WrappedSnackbarProvider({
    styleProps,
    ...snackbarProps
  }: WrappedSnackbarProviderProps<StyleProps>) {
    const classes = useStyles(styleProps);

    return (
      <SnackbarProvider classes={classes} {...snackbarProps}>
        {snackbarProps.children}
      </SnackbarProvider>
    );
  }

  WrappedSnackbarProvider.displayName = displayName;

  return WrappedSnackbarProvider;
}

export function useSnackbar(): ProviderContext {
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
