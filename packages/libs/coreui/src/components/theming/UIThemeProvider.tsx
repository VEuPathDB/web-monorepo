import { ReactNode } from 'react';
import { css, Global, ThemeProvider } from '@emotion/react';
import { useCoreUIFonts } from '../../hooks';

import { UITheme } from './types';

export type UIThemeProviderProps = {
  theme: UITheme;
  children: ReactNode;
};

export default function UIThemeProvider({
  theme,
  children,
}: UIThemeProviderProps) {
  useCoreUIFonts();
  // In addition to making the theme available via React Context,
  // we will also expose the theme as custom CSS properties.
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          :root {
            --coreui-color-primary: ${theme.palette.primary.hue[
              theme.palette.primary.level
            ]};
            --coreui-color-secondary: ${theme.palette.secondary.hue[
              theme.palette.secondary.level
            ]};
          }

          *:focus-visible {
            outline: 2px solid var(--coreui-color-primary);
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}
