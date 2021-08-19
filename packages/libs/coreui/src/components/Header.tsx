import { DARK_GRAY } from '../constants/colors';
import styles from '../styleDefinitions';

export type HeaderProps = {
  /** Underlying HTML element tag to use. */
  size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  text: string;
  /** Color of the header text. */
  color?: React.CSSProperties['color'];
  /** Whether or not to underline the text. */
  underline?: boolean;
  /** CSS text transformation to apply.  */
  textTransform?: React.CSSProperties['textTransform'];
  additionalStyles?: React.CSSProperties;
};

/**
 * Generic component which allows quick access to various HTML header
 * elements with consistent styling.
 */
export default function Header({
  size,
  text,
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
}: HeaderProps) {
  const Header = size;

  return (
    <Header
      css={[
        styles.typography[size],
        underline && { textDecoration: 'underline' },
        { color, textTransform, ...additionalStyles },
      ]}
    >
      {text}
    </Header>
  );
}
