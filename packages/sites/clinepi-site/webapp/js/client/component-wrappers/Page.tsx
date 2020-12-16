import React from 'react';

import { Props } from 'wdk-client/Components/Layout/Page';

import { useAttemptActionClickHandler } from 'ebrc-client/hooks/dataRestriction';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();

    return <DefaultComponent {...props} />;
  };
}
