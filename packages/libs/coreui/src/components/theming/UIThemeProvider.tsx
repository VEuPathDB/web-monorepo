import { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '@emotion/react';

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
