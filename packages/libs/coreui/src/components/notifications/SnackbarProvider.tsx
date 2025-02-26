import { useMemo } from 'react';

import { makeStyles, styled } from '@material-ui/core';
import { CSSProperties, StyleRules } from '@material-ui/core/styles/withStyles';
import {
  CombinedClassKey,
  SnackbarProvider,
  SnackbarProviderProps,
  MaterialDesignContent,
} from 'notistack';

import {
  ColorHue,
  mutedBlue,
  success,
  error,
  warning,
} from '../../definitions/colors';
import { UITheme, useUITheme } from '../theming';

export type SnackbarStyleProps<T> = T & { theme?: UITheme };

export interface WrappedSnackbarProviderProps<StyleProps>
  extends SnackbarProviderProps {
  styleProps: Omit<SnackbarStyleProps<StyleProps>, 'theme'>;
}

/**
 * @param styles A JSS (https://cssinjs.org/?v=v10.9.1-alpha.2) styling
 * object
 * @param displayName The displayName for the returned component
 * @returns A wrapping of a notistack (https://www.iamhosseindhv.com/notistack)
 * SnackbarProvider to which our "defaultStyles" and the consumer's passed
 * "styles" have been applied.
 */
export default function makeSnackbarProvider<
  StyleProps extends { theme?: UITheme },
  ClassKey extends CombinedClassKey
>(styles?: StyleRules<ClassKey, StyleProps>, displayName = 'SnackbarProvider') {
  const useStyles = makeStyles({
    ...styles,
  } as StyleRules<ClassKey, StyleProps>);

  function WrappedSnackbarProvider({
    styleProps,
    ...snackbarProps
  }: WrappedSnackbarProviderProps<StyleProps>) {
    const theme = useUITheme();

    const fullStyleProps = useMemo(
      () =>
        ({
          ...styleProps,
          theme,
        } as StyleProps),
      [theme, styleProps]
    );

    const StyledSnackbarContent = styled(MaterialDesignContent)({
      '&.notistack-MuiContent-success': makeSnackbarVariantStyles(success),
      '&.notistack-MuiContent-error': makeSnackbarVariantStyles(error),
      '&.notistack-MuiContent-warning': makeSnackbarVariantStyles(warning),
      '&.notistack-MuiContent-info': makeSnackbarVariantStyles(
        theme?.palette.primary.hue ?? mutedBlue
      ),
    });

    const classes = useStyles(fullStyleProps);

    return (
      <SnackbarProvider
        classes={classes}
        Components={{
          success: StyledSnackbarContent,
          error: StyledSnackbarContent,
          warning: StyledSnackbarContent,
          info: StyledSnackbarContent,
        }}
        {...snackbarProps}
      >
        {snackbarProps.children}
      </SnackbarProvider>
    );
  }

  WrappedSnackbarProvider.displayName = displayName;

  return WrappedSnackbarProvider;
}

export function makeSnackbarVariantStyles(variantHue: ColorHue): CSSProperties {
  return {
    backgroundColor: variantHue[100],
    border: `1px solid ${variantHue[600]}`,
    color: variantHue[900],
    '& a': {
      color: 'inherit',
      textDecoration: 'underline',
      fontWeight: 'bold',
    },
    '& svg': {
      fill: `${variantHue[600]} !important`,
    },
  };
}
