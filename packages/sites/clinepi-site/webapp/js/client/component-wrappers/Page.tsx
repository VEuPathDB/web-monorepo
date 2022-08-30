import React from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import UIThemeProvider from '@veupathdb/coreui/dist/components/theming/UIThemeProvider';
import { colors } from '@veupathdb/coreui';
import { useCoreUIFonts } from '@veupathdb/coreui/dist/hooks';
import makeSnackbarProvider from '@veupathdb/coreui/dist/components/notifications/SnackbarProvider';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();
    useCoreUIFonts();

    return (
           <UIThemeProvider
              theme={{
                palette: {
                  primary: { hue: colors.mutedCyan, level: 600 },
                  secondary: { hue: colors.mutedRed, level: 500 },
                },
              }}
            >
              <ClinEpiSnackbarProvider styleProps={{}}>
                <DefaultComponent {...props} />
              </ClinEpiSnackbarProvider>
            </UIThemeProvider>
    );
  };
}

function translateNotificationsOnTop() {
  return {
    transform: 'translateY(158px)'
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
  'ClinEpiSnackbarProvider',
);
