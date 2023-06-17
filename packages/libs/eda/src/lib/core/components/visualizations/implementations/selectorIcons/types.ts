import { useMemo } from 'react';
import useUITheme from '@veupathdb/coreui/lib/components/theming/useUITheme';

export interface MonotoneSvgProps {
  primaryColor: string;
}

export interface DuotoneSvgProps extends MonotoneSvgProps {
  secondaryColor: string;
}

const defaultPrimaryColor = '#85B3C3';
const defaultSecondaryColor = '#508E9D';

export const useVizIconColors = () => {
  const themeColor = useUITheme()?.palette.primary;

  return useMemo(() => {
    const primaryLevel =
      themeColor &&
      (themeColor.level > 200
        ? themeColor.level - 200
        : themeColor.level + 100);

    const primaryColor =
      (primaryLevel && themeColor?.hue[primaryLevel]) || defaultPrimaryColor;
    const secondaryColor =
      themeColor?.hue[themeColor.level] ?? defaultSecondaryColor;

    return {
      primaryColor,
      secondaryColor,
    };
  }, [themeColor]);
};
