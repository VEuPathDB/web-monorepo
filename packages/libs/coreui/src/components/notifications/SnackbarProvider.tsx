import { makeStyles } from '@material-ui/core';
import { Styles, StyleRules } from '@material-ui/core/styles/withStyles';
import {
  CombinedClassKey,
  SnackbarProvider,
  SnackbarProviderProps,
  VariantClassKey
} from 'notistack';

import {
  ColorHue,
  mutedBlue,
  mutedGreen,
  mutedRed,
  mutedYellow
} from '../../definitions/colors';

interface WrappedSnackbarProviderProps<StyleProps> extends SnackbarProviderProps {
  styleProps: StyleProps;
}

export default function makeSnackbarProvider<
  Theme,
  StyleProps extends object,
  ClassKey extends CombinedClassKey = CombinedClassKey,
>(
  styles?: Styles<Theme, StyleProps, ClassKey>,
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
