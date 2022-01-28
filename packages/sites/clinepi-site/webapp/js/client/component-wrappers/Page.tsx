import React from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import UIThemeProvider from '@veupathdb/core-components/dist/components/theming/UIThemeProvider';
import { colors } from '@veupathdb/core-components';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();

    return (
           <UIThemeProvider
              theme={{
                palette: {
                  primary: { hue: colors.mutedCyan, level: 600 },
                  secondary: { hue: colors.mutedRed, level: 500 },
                },
              }}
            >
              <DefaultComponent {...props} />
            </UIThemeProvider>
    );
  };
}
