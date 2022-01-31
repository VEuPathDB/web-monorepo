import { ForwardedRef, forwardRef } from 'react';

import Header, { HeaderProps } from './Header';

function H2(
  {
    text,
    color,
    underline = false,
    textTransform = 'none',
    additionalStyles = {},
    useTheme = true,
  }: Omit<HeaderProps, 'size'>,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return (
    <Header
      ref={forwardedRef}
      size='h2'
      text={text}
      color={color}
      underline={underline}
      textTransform={textTransform}
      additionalStyles={additionalStyles}
      useTheme={useTheme}
    />
  );
}

export default forwardRef<HTMLHeadingElement, Omit<HeaderProps, 'size'>>(H2);
