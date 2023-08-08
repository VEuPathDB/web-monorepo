import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import { Form as GroupsByPhyleticPatternForm } from '../questions/GroupsByPhyleticPattern/Form';

const BlastSummaryViewPlugin = React.lazy(
  () =>
    import(
      '@veupathdb/blast-summary-view/lib/Controllers/BlastSummaryViewController'
    )
);

const orthoPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'GroupsByPhyleticPattern',
    component: GroupsByPhyleticPatternForm,
  },
  {
    type: 'summaryView',
    name: 'blast-view',
    component: (props) => (
      <Suspense fallback={<Loading />}>
        <BlastSummaryViewPlugin {...props} />
      </Suspense>
    ),
  },
];

export default orthoPluginConfig;
