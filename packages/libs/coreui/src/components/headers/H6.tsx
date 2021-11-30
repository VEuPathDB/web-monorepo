import Header, { HeaderProps } from './Header';

export default function H6({
  text,
  color,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  useTheme,
}: Omit<HeaderProps, 'size'>) {
  return (
    <Header
      size='h6'
      text={text}
      color={color}
      underline={underline}
      textTransform={textTransform}
      additionalStyles={additionalStyles}
      useTheme={useTheme}
    />
  );
}
