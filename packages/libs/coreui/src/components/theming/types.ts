import { CSSProperties } from 'react';
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
  typography?: {
    headers?: {
      fontFamily?: CSSProperties['fontFamily'];
      color?: CSSProperties['color'];
      h1: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
      h2: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
      h3: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
      h4: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
      h5: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
      h6: {
        fontSize: CSSProperties['fontSize'];
        fontWeight: CSSProperties['fontWeight'];
      };
    };
  };
};
