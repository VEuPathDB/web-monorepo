import { ForwardedRef, forwardRef } from 'react';
import { HeaderVariantProps } from '.';

import Header from './Header';

function H5(
  props: HeaderVariantProps,
  forwardedRef: ForwardedRef<HTMLHeadingElement>
) {
  return <Header ref={forwardedRef} {...props} size='h5' />;
}

export default forwardRef<HTMLHeadingElement, HeaderVariantProps>(H5);
