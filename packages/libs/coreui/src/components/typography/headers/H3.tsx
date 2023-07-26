import { ForwardedRef, forwardRef } from 'react';
import { HeaderVariantProps } from '.';

import Header from './Header';

function H3(
  props: HeaderVariantProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return <Header ref={forwardedRef} {...props} size="h3" />;
}

export default forwardRef<HTMLHeadingElement, HeaderVariantProps>(H3);
