import { ForwardedRef, forwardRef } from 'react';
import { HeaderVariantProps } from '.';

import Header from './Header';

function H4(
  props: HeaderVariantProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return <Header ref={forwardedRef} {...props} size="h4" />;
}

export default forwardRef<HTMLHeadingElement, HeaderVariantProps>(H4);
