import { DARK_GRAY } from '../constants/colors';
import { h3 } from '../styles/typography';
import { HeaderComponentProps } from './types';

export default function H3({
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  children,
}: HeaderComponentProps) {
  return (
    <h3 css={[h3, { color, textTransform, ...additionalStyles }]}>
      {children}
    </h3>
  );
}
