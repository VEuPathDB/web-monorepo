import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

// import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import { ReduxNotificationHandler } from '@veupathdb/wdk-client/lib/Components/Notifications';
import makeSnackbarProvider, {
  SnackbarStyleProps,
} from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

import {
  createTheme as createMUITheme,
  ThemeProvider as MUIThemeProvider,
} from '@material-ui/core';
import { workspaceThemeOptions as MUIThemeOptions } from '@veupathdb/eda/lib/workspaceTheme';
import UIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';

import colors, {
  error,
  warning,
  success,
} from '@veupathdb/coreui/lib/definitions/colors';
import { useCoreUIFonts } from '@veupathdb/coreui/lib/hooks';

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
  return function MicrobiomePage(props: Props) {
    // useAttemptActionClickHandler();
    useCoreUIFonts();

    const snackbarStyleProps = {};
    const MUITheme = createMUITheme(MUIThemeOptions);

    return (
      <QueryClientProvider client={queryClient}>
        <MUIThemeProvider theme={MUITheme}>
          <UIThemeProvider
            theme={{
              palette: {
                primary: { hue: colors.mutedBlue, level: 500 },
                secondary: { hue: colors.mutedRed, level: 500 },
                error: { hue: error, level: 600 },
                warning: { hue: warning, level: 600 },
                info: { hue: colors.mutedCyan, level: 600 },
                success: { hue: success, level: 600 },
              },
            }}
          >
            <MicrobiomeSnackbarProvider styleProps={snackbarStyleProps}>
              <ReduxNotificationHandler>
                <DefaultComponent {...props} />
              </ReduxNotificationHandler>
            </MicrobiomeSnackbarProvider>
          </UIThemeProvider>
        </MUIThemeProvider>
      </QueryClientProvider>
    );
  };
}

function translateNotificationsOnTop() {
  return {
    transform: 'translateY(84px)',
  };
}

const MicrobiomeSnackbarProvider = makeSnackbarProvider(
  {
    containerRoot: {
      zIndex: 99,
    },
    anchorOriginTopLeft: translateNotificationsOnTop,
    anchorOriginTopCenter: translateNotificationsOnTop,
    anchorOriginTopRight: translateNotificationsOnTop,
  },
  'VEuPathDBSnackbarProvider'
);
