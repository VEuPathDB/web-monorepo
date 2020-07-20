import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';

import { Form as GroupsByPhyleticPatternForm } from '../questions/GroupsByPhyleticPattern/Form';

const orthoPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'GroupsByPhyleticPattern',
    component: GroupsByPhyleticPatternForm
  }
];

export default orthoPluginConfig;
