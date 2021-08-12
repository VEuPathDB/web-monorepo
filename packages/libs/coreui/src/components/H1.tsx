import { DARK_GRAY } from '../constants/colors';
import { h1 } from '../styles/typography';
import { HeaderComponentProps } from './types';

export default function H1({
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  children,
}: HeaderComponentProps) {
  return (
    <h1
      css={[
        h1,
        underline && { textDecoration: 'underline' },
        { color, textTransform, ...additionalStyles },
      ]}
    >
      {children}
    </h1>
  );
}
