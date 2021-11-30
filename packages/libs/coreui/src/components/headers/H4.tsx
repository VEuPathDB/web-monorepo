import Header, { HeaderProps } from './Header';

export default function H4({
  text,
  color,
  underline = false,
  textTransform = 'none',
  additionalStyles = {},
  useTheme,
}: Omit<HeaderProps, 'size'>) {
  return (
    <Header
      size='h4'
      text={text}
      color={color}
      underline={underline}
      textTransform={textTransform}
      additionalStyles={additionalStyles}
      useTheme={useTheme}
    />
  );
}
