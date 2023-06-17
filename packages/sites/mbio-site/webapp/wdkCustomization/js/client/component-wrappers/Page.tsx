import React from 'react';

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

import { colors } from '@veupathdb/coreui';
import { useCoreUIFonts } from '@veupathdb/coreui/lib/hooks';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function MicrobiomePage(props: Props) {
    // useAttemptActionClickHandler();
    useCoreUIFonts();

    const snackbarStyleProps = {};
    const MUITheme = createMUITheme(MUIThemeOptions);

    return (
      <MUIThemeProvider theme={MUITheme}>
        <UIThemeProvider
          theme={{
            palette: {
              primary: { hue: colors.mutedBlue, level: 500 },
              secondary: { hue: colors.mutedRed, level: 500 },
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
