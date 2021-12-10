import { ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';

import { UITheme } from './types';

export type UIThemeProviderProps = {
  theme: UITheme;
  children: ReactNode;
};

export default function UIThemeProvider({
  theme,
  children,
}: UIThemeProviderProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
