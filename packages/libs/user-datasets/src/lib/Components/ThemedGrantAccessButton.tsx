import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { colors, MesaButton, Share, SingleSelect } from '@veupathdb/coreui';
import { PartialButtonStyleSpec } from '@veupathdb/coreui/lib/components/buttons';
import { useMemo } from 'react';

export interface Props {
  enablePublicUserDatasets: boolean;
  buttonText: string;
  onPress: (grantType: 'community' | 'individual') => void;
}

export function ThemedGrantAccessButton({
  buttonText,
  onPress,
  enablePublicUserDatasets,
}: Props) {
  const theme = useUITheme();
  const bgHue = theme?.palette.primary.hue;
  const bgLevel = theme?.palette.primary.level;

  const styleOverrides = useMemo(
    (): PartialButtonStyleSpec =>
      bgHue && bgLevel
        ? {
            default: {
              color: bgHue[bgLevel],
              textColor: colors.white,
              border: {
                color: bgHue[bgLevel + 100],
                style: 'solid',
                width: 1,
              },
            },
            hover: {
              color: bgHue[bgLevel + 100],
              textColor: colors.white,
              border: {
                color: bgHue[bgLevel + 200],
                style: 'solid',
                width: 1,
              },
            },
            pressed: {
              color: bgHue[bgLevel + 100],
              textColor: colors.white,
              border: {
                color: bgHue[bgLevel + 200],
                style: 'solid',
                width: 1,
              },
            },
          }
        : {},
    [bgHue, bgLevel]
  );

  if (!enablePublicUserDatasets) {
    return (
      <MesaButton
        text={buttonText}
        textTransform="none"
        onPress={() => onPress('individual')}
        themeRole="primary"
        icon={Share}
        styleOverrides={styleOverrides}
      />
    );
  }

  return (
    <SingleSelect<'community' | 'individual' | undefined>
      styleOverrides={styleOverrides}
      items={[
        {
          display: (
            <>
              <Share fill="black" /> Community access
            </>
          ),
          value: 'community',
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
