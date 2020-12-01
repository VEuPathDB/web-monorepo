import React from 'react';

import { Props } from 'ebrc-client/components/SiteSearch/SiteSearchInput';

import { WrappedComponentProps } from 'ortho-client/records/Types';

export function SiteSearchInput(DefaultComponent: React.ComponentType<Props>) {
  return function OrthoSiteSearchInput(props: WrappedComponentProps<Props>) {
    return <DefaultComponent {...props} />;
  }
}
