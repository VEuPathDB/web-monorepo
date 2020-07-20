import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';

import { GroupsByPhyleticPattern } from '../questions/GroupsByPhyleticPattern';

const orthoPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'questionForm',
    searchName: 'GroupsByPhyleticPattern',
    component: GroupsByPhyleticPattern
  }
];

export default orthoPluginConfig;
