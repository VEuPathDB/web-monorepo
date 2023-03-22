import { css } from '@emotion/react';
import { useMemo } from 'react';
import { CSSProperties, ReactNode } from 'react';

// Definitions
import { gray } from '../../definitions/colors';
import { secondaryFont } from '../../styleDefinitions/typography';

// Hooks
import { useUITheme } from '../theming';

export type ParagraphStyleSpec = {
  margin?: CSSProperties['margin'];
  padding?: CSSProperties['padding'];
  color: CSSProperties['color'];
  fontFamily: CSSProperties['fontFamily'];
  fontSize: CSSProperties['fontSize'];
  fontWeight: CSSProperties['fontWeight'];
};

export type ParagraphProps = {
  children: ReactNode;
  textSize?: 'small' | 'medium' | 'large';
  /** Color of the text. Will default to gray[700] */
  color?: CSSProperties['color'];
  /**
   * Indicates whether or not theming properties should be used.
   * Defaults to `true`. */
  useTheme?: boolean;
  /**
   * Use to override various styling aspects of the component.
   * Will take precedence over conflicting prop and theme values. */
  styleOverrides?: Partial<ParagraphStyleSpec>;
};

/** A generic paragraph component with theming support. */
export default function Paragraph({
  children,
  color,
  textSize = 'medium',
  useTheme = true,
  styleOverrides = {},
}: ParagraphProps) {
  const theme = useUITheme();

  // Determine the CSS for the component
  const componentCSS = useMemo(() => {
    return css(
      {
        color: color ?? gray[700],
        fontFamily: secondaryFont,
        fontSize: textSize === 'large' ? 16 : textSize === 'medium' ? 13.5 : 12,
        fontWeight: 'initial',
      },
      useTheme && {
        color: theme?.typography?.paragraphs?.color,
        fontFamily: theme?.typography?.paragraphs?.fontFamily,
        fontSize: theme?.typography?.paragraphs?.variants[textSize].fontSize,
        fontWeight:
          theme?.typography?.paragraphs?.variants[textSize].fontWeight,
      },
      styleOverrides
    );
  }, [theme, useTheme, textSize, color]);

  return <p css={componentCSS}>{children}</p>;
}
