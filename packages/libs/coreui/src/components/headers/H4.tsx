import { ForwardedRef, forwardRef } from 'react';

import Header, { HeaderProps } from './Header';

function H4(
  {
    text,
    color,
    underline = false,
    textTransform = 'none',
    additionalStyles = {},
    useTheme,
  }: Omit<HeaderProps, 'size'>,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return (
    <Header
      ref={forwardedRef}
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

export default forwardRef<HTMLHeadingElement, Omit<HeaderProps, 'size'>>(H4);
