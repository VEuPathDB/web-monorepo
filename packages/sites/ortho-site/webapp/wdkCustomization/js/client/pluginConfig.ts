import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';
import { BlastSummaryViewPlugin } from 'wdk-client/Plugins';
import { Form as GroupsByPhyleticPatternForm } from '../questions/GroupsByPhyleticPattern/Form';

const orthoPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'GroupsByPhyleticPattern',
    component: GroupsByPhyleticPatternForm
  },
  {
    type: 'summaryView',
    name: 'blast-view',
    component: BlastSummaryViewPlugin
  }
];

export default orthoPluginConfig;
