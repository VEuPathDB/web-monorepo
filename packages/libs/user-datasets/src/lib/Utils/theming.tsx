import { PartialButtonStyleSpec } from '@veupathdb/coreui/lib/components/buttons';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { useMemo } from 'react';
import { colors } from '@veupathdb/coreui';

export function useButtonTheme(): PartialButtonStyleSpec {
  const primaryTheme = useUITheme()?.palette?.primary;

  const bgHue = primaryTheme?.hue;
  const bgLevel = primaryTheme?.level;

  return useMemo(
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
              dropShadow: {
                color: bgHue[bgLevel + 100],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
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
              dropShadow: {
                color: bgHue[bgLevel + 200],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
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
              dropShadow: {
                color: bgHue[bgLevel + 200],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
              },
            },
          }
        : {},
    [bgHue, bgLevel]
  );
}