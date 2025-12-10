/**
 * OrthoMCL Site Plugin Configuration
 *
 * This file provides OrthoMCL-specific plugin implementations that customize
 * the ortho site with features for ortholog group analysis and searching.
 *
 * This configuration is analogous to the genomics-site plugin configuration
 * but is simpler, with fewer site-specific customizations.
 *
 * For comprehensive documentation on the plugin system, see:
 * - Plugin System Architecture: @veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md
 * - EBRC Shared Plugins: @veupathdb/web-common/lib/EBRC_PLUGINS.md
 * - Example Site Configuration: genomics-site/webapp/wdkCustomization/js/client/PLUGIN_CONFIG.md
 *
 * Plugin Hierarchy:
 * 1. Site-specific plugins (highest precedence) - THIS FILE
 * 2. EBRC shared plugins (medium precedence) - @veupathdb/web-common/lib/pluginConfig
 * 3. WDK base plugins (lowest precedence) - @veupathdb/wdk-client/lib/Core/pluginConfig
 *
 * The plugins in this file provide:
 * - Phyletic pattern form: Custom form for searching groups by phyletic pattern
 * - BLAST support: BLAST view, controller, and form for sequence similarity searches
 */

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
