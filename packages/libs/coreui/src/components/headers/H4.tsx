import { DARK_GRAY } from '../../constants/colors';
import Header, { HeaderProps } from './Header';

export default function H4({
  text,
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
}: Omit<HeaderProps, 'size'>) {
  return (
    <Header
      size='h4'
      text={text}
      color={color}
      underline={underline}
      textTransform={textTransform}
      additionalStyles={additionalStyles}
    />
  );
}
