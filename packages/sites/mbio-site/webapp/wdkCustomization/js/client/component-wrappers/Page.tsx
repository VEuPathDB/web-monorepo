import React from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

// import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import { ReduxNotificationHandler } from '@veupathdb/wdk-client/lib/Components/Notifications';
import makeSnackbarProvider, { SnackbarStyleProps } from '@veupathdb/coreui/dist/components/notifications/SnackbarProvider';

import UIThemeProvider from '@veupathdb/coreui/dist/components/theming/UIThemeProvider';
import { colors } from '@veupathdb/coreui';
import { useCoreUIFonts } from '@veupathdb/coreui/dist/hooks';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function MicrobiomePage(props: Props) {
    // useAttemptActionClickHandler();
    useCoreUIFonts();
    
    const snackbarStyleProps = {};

    return (
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
    );
  };
}


function translateNotificationsOnTop() {
  return {
    transform: 'translateY(84px)'
  };
}

const MicrobiomeSnackbarProvider = makeSnackbarProvider(
  {
    containerRoot: {
      zIndex: 99
    },
    anchorOriginTopLeft: translateNotificationsOnTop,
    anchorOriginTopCenter: translateNotificationsOnTop,
    anchorOriginTopRight: translateNotificationsOnTop,
  },
  'VEuPathDBSnackbarProvider',
);
