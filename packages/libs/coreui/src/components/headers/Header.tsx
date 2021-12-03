import { useMemo } from 'react';
import { gray } from '../../definitions/colors';
import styles from '../../styleDefinitions';
import useUITheme from '../theming/useUITheme';

export type HeaderProps = {
  /** Underlying HTML element tag to use. */
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** The text of the header. */
  text: string;
  /** Color of the header text. */
  color?: React.CSSProperties['color'];
  /** Whether or not to underline the text. */
  underline?: boolean;
  /** CSS text transformation to apply.  */
  textTransform?: React.CSSProperties['textTransform'];
  /** Indicates whether or not theming properties should be used. */
  useTheme?: boolean;
  /** Additional styles to apply to the header component. */
  additionalStyles?: React.CSSProperties;
};

/**
 * Generic component which allows quick access to various HTML header
 * elements with consistent styling.
 */
export default function Header({
  size,
  text,
  color,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  useTheme = true,
}: HeaderProps) {
  const Header = size;

  const theme = useUITheme();
  const themeStyles = useMemo(() => {
    let styles: { [key: string]: any } = {};

    if (!theme?.typography?.headers || !useTheme) return styles;
    styles = { ...theme.typography.headers[size] };

    styles['color'] = theme.typography.headers.color;
    styles['fontFamily'] = theme.typography.headers.fontFamily;

    return styles;
  }, [useTheme, theme, size]);

  return (
    <Header
      css={[
        styles.typography[size],
        color === undefined ? { color: gray[700] } : { color },
        themeStyles,
        underline && { textDecoration: 'underline' },
        { textTransform, ...additionalStyles },
      ]}
    >
      {text}
    </Header>
  );
}
