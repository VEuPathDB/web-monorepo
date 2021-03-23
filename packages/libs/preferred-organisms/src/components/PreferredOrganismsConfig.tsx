import { useMemo, useState } from 'react';

import { CheckboxTree, Link } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { Node } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  countAvailableOrganisms,
  getNodeChildren,
  getNodeId,
  makeInitialPreviewExpansion,
  makePreviewTree,
  renderNode,
  searchPredicate,
} from '../utils/configTrees';

import './PreferredOrganismsConfig.scss';

const cx = makeClassNameHelper('PreferredOrganismsConfig');

interface Props {
  configSelection: string[];
  organismTree: Node<TreeBoxVocabNode>;
  projectId: string;
  setConfigSelection: (newPreferredOrganisms: string[]) => void;
}

export function PreferredOrganismsConfig({
  configSelection,
  organismTree,
  projectId,
  setConfigSelection,
}: Props) {
  const availableOrganismsCount = useMemo(
    () => countAvailableOrganisms(organismTree),
    [organismTree]
  );

  const initialPreviewExpansion = useMemo(
    () => makeInitialPreviewExpansion(organismTree),
    [organismTree]
  );

  const [configFilterTerm, setConfigFilterTerm] = useState('');
  const [configExpansion, setConfigExpansion] = useState<string[]>([]);

  const [previewExpansion, setPreviewExpansion] = useState(
    initialPreviewExpansion
  );

  const previewTree = useMemo(
    () => makePreviewTree(organismTree, configSelection),
    [organismTree, configSelection]
  );

  return (
    <div className={cx()}>
      <h1>Configure My Organisms</h1>
      <p className={cx('--Instructions')}>
        Set your <span className={cx('--InlineTitle')}>My Organisms</span> list
        in order to constrain the taxa you see on various pages in {projectId}.
      </p>
      <div className={cx('--Main')}>
        <div className={cx('--Selections')}>
          <h2>Choose taxa or organisms to keep</h2>
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
        </div>
        <div className={cx('--Preview')}>
          <h2>
            Preview of <span className={cx('--InlineTitle')}>My Organisms</span>{' '}
            (
            <span
              className={cx(
                '--SelectionCount',
                configSelection.length === 0 && 'empty'
              )}
            >
              {configSelection.length}
            </span>{' '}
            of {availableOrganismsCount})
          </h2>
          {configSelection.length === 0 ? (
            <div className={cx('--NoPreferencesSelected')}>
              Please select at least one organism
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
