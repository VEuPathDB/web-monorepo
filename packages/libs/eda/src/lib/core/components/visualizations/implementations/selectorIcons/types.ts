import { useMemo } from 'react';
import useUITheme from '@veupathdb/coreui/dist/components/theming/useUITheme';

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
    const primaryColor =
      themeColor?.hue[themeColor.level - 200] ?? defaultPrimaryColor;
    const secondaryColor =
      themeColor?.hue[themeColor.level] ?? defaultSecondaryColor;
    return {
      primaryColor,
      secondaryColor,
    };
  }, [themeColor]);
};
