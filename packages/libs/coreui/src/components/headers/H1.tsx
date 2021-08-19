import { DARK_GRAY } from '../../constants/colors';
import Header, { HeaderProps } from '../Header';

export default function H1({
  text,
  color = DARK_GRAY,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
}: Omit<HeaderProps, 'size'>) {
  return (
    <Header
      size='h1'
      text={text}
      color={color}
      underline={underline}
      textTransform={textTransform}
      additionalStyles={additionalStyles}
    />
  );
}
