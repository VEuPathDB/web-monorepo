import { ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';
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
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
