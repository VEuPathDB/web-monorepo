import { CSSProperties } from 'react';
import { ColorHue } from '../../definitions/colors';

export type ColorDescriptor = {
  hue: ColorHue;
  level: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};

type TextDescriptor = {
  fontSize: CSSProperties['fontSize'];
  fontWeight: CSSProperties['fontWeight'];
};

export type ThemeRole = 'primary' | 'secondary';

export type UITheme = {
  palette: {
    primary: ColorDescriptor;
    secondary: ColorDescriptor;
  };
  typography?: {
    headers?: {
      fontFamily?: CSSProperties['fontFamily'];
      color?: CSSProperties['color'];
      variants: {
        h1: TextDescriptor;
        h2: TextDescriptor;
        h3: TextDescriptor;
        h4: TextDescriptor;
        h5: TextDescriptor;
        h6: TextDescriptor;
      };
    };
    paragraphs?: {
      color?: CSSProperties['color'];
      fontFamily?: CSSProperties['fontFamily'];
      variants: {
        small: TextDescriptor;
        medium: TextDescriptor;
        large: TextDescriptor;
      };
    };
  };
};
