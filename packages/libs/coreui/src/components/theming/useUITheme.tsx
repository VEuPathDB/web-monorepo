import { useTheme } from '@emotion/react';

import { UITheme } from './types';

export default function useUITheme(): UITheme | undefined {
  const theme = useTheme();
  return Object.keys(theme).length ? (theme as UITheme) : undefined;
}
