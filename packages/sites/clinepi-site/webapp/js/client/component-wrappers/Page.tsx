import React from 'react';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

export function Page(DefaultComponent: React.ComponentType<Props>) {
  return function ClinEpiPage(props: Props) {
    useAttemptActionClickHandler();

    return <DefaultComponent {...props} />;
  };
}
