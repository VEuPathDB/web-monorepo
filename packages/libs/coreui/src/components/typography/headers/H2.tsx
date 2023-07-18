import { ForwardedRef, forwardRef } from 'react';
import { HeaderVariantProps } from '.';

import Header from './Header';

function H2(
  props: HeaderVariantProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return <Header ref={forwardedRef} {...props} size="h2" />;
}

export default forwardRef<HTMLHeadingElement, HeaderVariantProps>(H2);
