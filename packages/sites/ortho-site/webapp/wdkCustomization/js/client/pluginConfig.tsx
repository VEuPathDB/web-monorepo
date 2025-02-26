import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import { Form as GroupsByPhyleticPatternForm } from '../questions/GroupsByPhyleticPattern/Form';

import { isMultiBlastQuestion } from '@veupathdb/multi-blast/lib/utils/pluginConfig';

const BlastForm = React.lazy(() => import('./plugins/BlastForm'));
const BlastQuestionController = React.lazy(
  () => import('./plugins/BlastQuestionController')
);
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
  {
    type: 'questionController',
    test: isMultiBlastQuestion,
    component: (props) => (
      <Suspense fallback={<Loading />}>
        <BlastQuestionController {...props} />
      </Suspense>
    ),
  },
  {
    type: 'questionForm',
    test: ({ question }) =>
      question != null && question.urlSegment.endsWith('MultiBlast'),
    component: (props) => (
      <Suspense fallback={<Loading />}>
        <BlastForm {...props} />
      </Suspense>
    ),
  },
];

export default orthoPluginConfig;
