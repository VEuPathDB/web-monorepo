import { ThemeOptions } from '@material-ui/core';

export const workspaceTheme: ThemeOptions = {
  typography: {
    fontSize: 13,
    fontFamily:
      'Roboto, "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
  },
  palette: {
    primary: {
      light: '#eef1f2',
      main: '#069',
      dark: '#084e71',
      contrastText: '#fff',
    },
  },
  props: {
    MuiButton: {
      color: 'default',
      disableRipple: true,
      variant: 'contained',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        lineHeight: 1.25,
      },
      contained: {
        textTransform: 'none',
      },
      containedSizeSmall: {
        padding: '4px 8px',
      },
    },
  },
};
