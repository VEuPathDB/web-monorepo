import { useEffect } from 'react';
import { ForwardedRef, forwardRef, useMemo, ReactNode } from 'react';

import { gray } from '../../../definitions/colors';
import styles from '../../../styleDefinitions';
import useUITheme from '../../theming/useUITheme';

interface HeaderCoreProps {
  /** Underlying HTML element tag to use. */
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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
}

export interface HeaderWithTextProps extends HeaderCoreProps {
  text: string;
  children?: never;
}
export interface HeaderWithChildrenProps extends HeaderCoreProps {
  text?: never;
  children: ReactNode;
}

/**
 * Generic component which allows quick access to various HTML header
 * elements with consistent styling.
 */
function Header(
  {
    size,
    text,
    children,
    color,
    underline = false,
    textTransform = 'none',
    additionalStyles = {},
    useTheme = true,
  }: HeaderWithChildrenProps | HeaderWithTextProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  const Header = size;

  useEffect(() => {
    text &&
      console.warn(
        'The `text` prop is deprecated. Please just pass header content as children.'
      );
  }, [text]);

  const theme = useUITheme();
  const themeStyles = useMemo(() => {
    let styles: { [key: string]: any } = {};

    if (!theme?.typography?.headers || !useTheme) return styles;
    styles = { ...theme.typography.headers.variants[size] };

    styles['color'] = theme.typography.headers.color;
    styles['fontFamily'] = theme.typography.headers.fontFamily;

    return styles;
  }, [useTheme, theme, size]);

  return (
    <Header
      ref={forwardedRef}
      css={[
        styles.typography[size],
        color === undefined ? { color: gray[700] } : { color },
        themeStyles,
        underline && { textDecoration: 'underline' },
        {
          textTransform,
          transition: 'color .5s',
        },
      ]}
      style={additionalStyles}
    >
      {text ? text : children}
    </Header>
  );
}

export default forwardRef<
  HTMLHeadingElement,
  HeaderWithChildrenProps | HeaderWithTextProps
>(Header);
