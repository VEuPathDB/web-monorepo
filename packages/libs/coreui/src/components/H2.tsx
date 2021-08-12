import { DARK_GRAY } from '../constants/colors';
import { h2 } from '../styles/typography';
import { HeaderComponentProps } from './types';

export default function H2({
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  children,
}: HeaderComponentProps) {
  return (
    <h2 css={[h2, { color, textTransform, ...additionalStyles }]}>
      {children}
    </h2>
  );
}
