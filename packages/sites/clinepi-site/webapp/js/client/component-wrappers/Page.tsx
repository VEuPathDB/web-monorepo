import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import {
  createTheme as createMUITheme,
  ThemeProvider as MUIThemeProvider,
} from '@material-ui/core';
import { workspaceThemeOptions as MUIThemeOptions } from '@veupathdb/eda/lib/workspaceTheme';
import UIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';
import colors, {
  error,
  success,
  warning,
} from '@veupathdb/coreui/lib/definitions/colors';
import { useCoreUIFonts } from '@veupathdb/coreui/lib/hooks';
import makeSnackbarProvider from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();
    useCoreUIFonts();
    const MUITheme = createMUITheme(MUIThemeOptions);

    return (
      <QueryClientProvider client={queryClient}>
        <MUIThemeProvider theme={MUITheme}>
          <UIThemeProvider
            theme={{
              palette: {
                primary: { hue: colors.mutedCyan, level: 600 },
                secondary: { hue: colors.mutedRed, level: 500 },
                error: { hue: error, level: 600 },
                warning: { hue: warning, level: 600 },
                info: { hue: colors.mutedCyan, level: 600 },
                success: { hue: success, level: 600 },
              },
            }}
          >
            <ClinEpiSnackbarProvider styleProps={{}}>
              <DefaultComponent {...props} />
            </ClinEpiSnackbarProvider>
          </UIThemeProvider>
        </MUIThemeProvider>
      </QueryClientProvider>
    );
  };
}

function translateNotificationsOnTop() {
  return {
    transform: 'translateY(158px)',
  };
}

const ClinEpiSnackbarProvider = makeSnackbarProvider(
  {
    containerRoot: {
      zIndex: 10001,
    },
    anchorOriginTopLeft: translateNotificationsOnTop,
    anchorOriginTopCenter: translateNotificationsOnTop,
    anchorOriginTopRight: translateNotificationsOnTop,
  },
  'ClinEpiSnackbarProvider'
);
