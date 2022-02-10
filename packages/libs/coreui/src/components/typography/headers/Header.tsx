import { ForwardedRef, forwardRef, useMemo, ReactElement } from 'react';

import { gray } from '../../../definitions/colors';
import styles from '../../../styleDefinitions';
import useUITheme from '../../theming/useUITheme';

export type HeaderProps = {
  /** Underlying HTML element tag to use. */
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** The text of the header. This must either be a string or a <span> element. */
  text: string | ReactElement<HTMLSpanElement>;
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
function Header(
  {
    size,
    text,
    color,
    underline = false,
    textTransform = 'none',
    additionalStyles = {},
    useTheme = true,
  }: HeaderProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  const Header = size;

  /**
   * Unfortunately, Typescript doesn't currently give us the ability
   * to limit the type of element that can be passed into "text".
   *
   * But we want to limit it to <span> elements, so this will help us with that.
   */
  const headerContent = useMemo(() => {
    if (typeof text === 'string') {
      return text;
    } else if (text.hasOwnProperty('type')) {
      if (text.type === 'span') {
        return text;
      } else {
        console.error(
          'You may only pass a string or a <span> element to the `text` prop.'
        );
        return 'Invalid Prop Value';
      }
    }
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
      {headerContent}
    </Header>
  );
}

export default forwardRef<HTMLHeadingElement, HeaderProps>(Header);
