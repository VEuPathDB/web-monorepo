import { CSSProperties, WebViewHTMLAttributes } from 'react';
import colors, { ColorHue } from '../../definitions/colors';
import { SwissArmyButtonStyleSpec } from '../buttons/SwissArmyButton/stylePresets';

type ColorDescriptor = {
  hue: ColorHue;
  level: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};

export type UITheme = {
  palette: {
    primary: ColorDescriptor;
    secondary: ColorDescriptor;
  };
  buttons?: {
    primary: SwissArmyButtonStyleSpec;
    secondary: SwissArmyButtonStyleSpec;
    tertiary: SwissArmyButtonStyleSpec;
  };
};
