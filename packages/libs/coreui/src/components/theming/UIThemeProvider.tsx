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
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          *:focus {
            outline: 2px solid
              ${theme.palette.primary.hue[theme.palette.primary.level]};
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}
