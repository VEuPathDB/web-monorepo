import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface Props {
  organismTree: Node<TreeBoxVocabNode>;
}

export function PreferredOrganismsConfig({ organismTree }: Props) {
  return <pre>{JSON.stringify(organismTree, null, 2)}</pre>;
}
