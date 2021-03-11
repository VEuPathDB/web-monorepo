import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

export const isMultiBlastQuestion: ClientPluginRegistryEntry<any>['test'] = ({
  question,
}) => question != null && question.urlSegment.endsWith('MultiBlast');
