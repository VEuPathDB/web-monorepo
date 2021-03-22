import { useMemo, useState } from 'react';

import { CheckboxTree } from '@veupathdb/wdk-client/lib/Components';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  getNodeChildren,
  getNodeId,
  makeInitialConfigSelection,
  makeInitialPreviewExpansion,
  makePreviewTree,
  renderNode,
  searchPredicate,
} from '../utils/configTrees';

interface Props {
  organismTree: Node<TreeBoxVocabNode>;
}

export function PreferredOrganismsConfig({ organismTree }: Props) {
  const initialConfigSelection = useMemo(
    () => makeInitialConfigSelection(organismTree),
    [organismTree]
  );

  const initialPreviewExpansion = useMemo(
    () => makeInitialPreviewExpansion(organismTree),
    [organismTree]
  );

  const [configFilterTerm, setConfigFilterTerm] = useState('');
  const [configExpansion, setConfigExpansion] = useState<string[]>([]);
  const [configSelection, setConfigSelection] = useState(
    initialConfigSelection
  );

  const [previewExpansion, setPreviewExpansion] = useState(
    initialPreviewExpansion
  );

  const previewTree = useMemo(
    () => makePreviewTree(organismTree, configSelection),
    [organismTree, configSelection]
  );

  return (
    <>
      <CheckboxTree<TreeBoxVocabNode>
        tree={organismTree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        isSearchable
        searchTerm={configFilterTerm}
        onSearchTermChange={setConfigFilterTerm}
        searchPredicate={searchPredicate}
        searchBoxHelp={makeSearchHelpText('the list below')}
        searchBoxPlaceholder="Type a taxonomic name"
        renderNode={renderNode}
        expandedList={configExpansion}
        onExpansionChange={setConfigExpansion}
        shouldExpandDescendantsWithOneChild
        isSelectable
        selectedList={configSelection}
        onSelectionChange={setConfigSelection}
        linksPosition={CheckboxTree.LinkPlacement.Both}
      />
      <CheckboxTree<TreeBoxVocabNode>
        tree={previewTree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        renderNode={renderNode}
        expandedList={previewExpansion}
        onExpansionChange={setPreviewExpansion}
        shouldExpandDescendantsWithOneChild
        linksPosition={CheckboxTree.LinkPlacement.None}
      />
    </>
  );
}
