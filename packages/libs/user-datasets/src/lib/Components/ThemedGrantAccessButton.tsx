import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { colors, MesaButton, Share, SingleSelect } from '@veupathdb/coreui';
import { PartialButtonStyleSpec } from '@veupathdb/coreui/lib/components/buttons';
import React, { useMemo } from 'react';
import { useButtonTheme } from '../Utils/theming';

interface Props {
  readonly disableCommunityReason?: string;
  readonly communityDatasetsEnabled: boolean;
  readonly buttonText: string;
  readonly onPress: (grantType: 'community' | 'individual') => void;
}

export function ThemedGrantAccessButton({
  buttonText,
  onPress,
  communityDatasetsEnabled,
  disableCommunityReason,
}: Props) {
  const buttonTheme = useButtonTheme();

  if (!communityDatasetsEnabled) {
    return (
      <MesaButton
        text={buttonText}
        textTransform="none"
        onPress={() => onPress('individual')}
        themeRole="primary"
        icon={Share}
        styleOverrides={buttonTheme}
      />
    );
  }

  return (
    <SingleSelect<'community' | 'individual' | undefined>
      styleOverrides={buttonTheme}
      items={[
        {
          display: disableCommunityReason
            ? <span title={disableCommunityReason}><Share fill="black" /> Public access</span>
            : <><Share fill="black" /> Public access</>,
          value: 'community',
          disabled: !!disableCommunityReason
        },
        {
          display: (
            <>
              <Share fill="black" /> Individual access
            </>
          ),
          value: 'individual',
        },
      ]}
      value={undefined}
      onSelect={(value): void => {
        if (value == null) return;
        onPress(value);
      }}
      buttonDisplayContent={`Manage access`}
    />
  );
}
