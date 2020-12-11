import React from 'react';

import { Props } from 'wdk-client/Components/Layout/Page';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    return <DefaultComponent {...props} />;
  };
}
