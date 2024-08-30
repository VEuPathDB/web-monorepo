import { getSearchMenuCategoryTree } from '@veupathdb/web-common/lib/util/category';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';

export function searchTree(state: RootState) {
  const { ontology, recordClasses } = state.globalData;
  if (ontology == null || recordClasses == null) return undefined;
  const tree = getSearchMenuCategoryTree(ontology, recordClasses);
  return {
    ...tree,
    children: tree.children.map((node) =>
      node.properties.label?.[0] ===
      'TranscriptRecordClasses.TranscriptRecordClass'
        ? node
        : { ...node, children: getLeaves(node, (node) => node.children) }
    ),
  };
}
