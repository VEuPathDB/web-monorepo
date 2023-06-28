import React from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import {
  createTheme as createMUITheme,
  ThemeProvider as MUIThemeProvider,
} from '@material-ui/core';
import { workspaceThemeOptions as MUIThemeOptions } from '@veupathdb/eda/lib/workspaceTheme';
import UIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';
import { colors } from '@veupathdb/coreui';
import { useCoreUIFonts } from '@veupathdb/coreui/lib/hooks';
import makeSnackbarProvider from '@veupathdb/coreui/lib/components/notifications/SnackbarProvider';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();
    useCoreUIFonts();
    const MUITheme = createMUITheme(MUIThemeOptions);

    return (
      <MUIThemeProvider theme={MUITheme}>
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
      </MUIThemeProvider>
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
