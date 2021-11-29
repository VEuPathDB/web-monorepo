import { ColorHue } from '../../definitions/colors';

type ColorDescriptor = {
  hue: ColorHue;
  level: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};

export type UITheme = {
  palette: {
    primary: ColorDescriptor;
    secondary: ColorDescriptor;
  };
};
