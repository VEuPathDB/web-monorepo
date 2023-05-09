import { ThemeOptions } from '@material-ui/core';

export const workspaceThemeOptions: ThemeOptions = {
  typography: {
    fontSize: 13,
    fontFamily:
      'Roboto, "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      light: '#eef1f2',
      main: '#069',
      dark: '#084e71',
      contrastText: '#fff',
    },
    secondary: {
      light: '#FB7087',
      main: '#DD314E',
      dark: '#A00D25',
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
        textTransform: 'none',
      },
      sizeSmall: {
        padding: '4px 8px',
      },
    },
    MuiPopover: {
      root: {
        border: '1px solid #ccc',
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: 12,
      },
    },
  },
};
