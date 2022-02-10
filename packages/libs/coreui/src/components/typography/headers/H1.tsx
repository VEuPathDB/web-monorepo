import { ForwardedRef, forwardRef } from 'react';
import { HeaderVariantProps } from '.';

import Header from './Header';

function H1(
  props: HeaderVariantProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return <Header ref={forwardedRef} {...props} size='h1' />;
}

export default forwardRef<HTMLHeadingElement, HeaderVariantProps>(H1);
